/* SkillBridge AI Video Proctor + Eye Reading Calibration
 * - MediaPipe Face Landmarker runs locally in the browser.
 * - Pre-exam: visual reading calibration (no voice calibration).
 * - During exam: face, multiple-face, gaze/head and optional body checks.
 * - The parent page owns the 3-warning policy and 5-second cooldown.
 */
(() => {
  'use strict';

  const VERSION = '1.0.1';
  const CONFIG = {
    wasmPath: `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VERSION}/wasm`,
    bundlePath: `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VERSION}/vision_bundle.mjs`,
    faceModelPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
    poseModelPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
    detectionIntervalMs: 90,
    noFaceGraceMs: 2400,
    multipleFaceGraceMs: 650,
    headAwayGraceMs: 1900,
    gazeOutsideGraceMs: 1200,
    bodyMoveGraceMs: 2800,
    maxFaces: 4,
    minFaceDetectionConfidence: 0.45,
    minFacePresenceConfidence: 0.45,
    minTrackingConfidence: 0.45,
    defaultEnvelope: { minX: 0.14, maxX: 0.86, minY: 0.14, maxY: 0.86 },
    calibrationSampleMs: 70,
    calibrationMinSamples: 24,
    calibrationPadX: 0.12,
    calibrationPadY: 0.12,
    bodyCenterDelta: 0.26,
    bodyScaleDelta: 0.32,
    bodyOptional: true,
    eventCooldownMs: 1400
  };

  let FaceLandmarker = null;
  let PoseLandmarker = null;
  let FilesetResolver = null;
  let faceLandmarker = null;
  let poseLandmarker = null;
  let videoElement = null;
  let running = false;
  let timer = null;
  let pausedUntil = 0;
  let onViolation = null;
  let onStatus = null;
  let gazeEnvelope = null;
  let gazeCalibrationSamples = [];
  let eventLog = [];
  let bodyReference = null;
  const startedAt = { noFace: null, multipleFace: null, headAway: null, gazeOutside: null, bodyMove: null };
  const lastEventByType = {};

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const now = () => Date.now();
  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  function status(type, detail = '') { try { onStatus?.(type, detail); } catch (_) {} }
  function clearConditions() { Object.keys(startedAt).forEach(k => { startedAt[k] = null; }); }
  function sustained(key, active, graceMs) {
    if (!active) { startedAt[key] = null; return false; }
    if (startedAt[key] == null) startedAt[key] = now();
    return now() - startedAt[key] >= graceMs;
  }

  function emitViolation(type, extra = {}) {
    const t = now();
    if (t < pausedUntil) return;
    if (t - (lastEventByType[type] || 0) < CONFIG.eventCooldownMs) return;
    const lastAny = eventLog.length ? new Date(eventLog[eventLog.length - 1].timestamp).getTime() : 0;
    if (t - lastAny < 850) return;
    lastEventByType[type] = t;
    const event = {
      type,
      timestamp: new Date(t).toISOString(),
      detector: 'mediapipe-video-proctor',
      source: 'camera_video',
      ...extra
    };
    eventLog.push(event);
    if (eventLog.length > 100) eventLog.shift();
    console.warn('[AI VIDEO PROCTOR] confirmed:', event);
    try { onViolation?.(event); } catch (e) { console.error(e); }
  }

  function point(i, lm) { return lm?.[i] || null; }
  function avgPoint(indices, lm) {
    const points = indices.map(i => point(i, lm)).filter(Boolean);
    if (!points.length) return null;
    return {
      x: points.reduce((s, p) => s + p.x, 0) / points.length,
      y: points.reduce((s, p) => s + p.y, 0) / points.length,
      z: points.reduce((s, p) => s + (p.z || 0), 0) / points.length
    };
  }
  function ratioX(p, a, b) {
    if (!p || !a || !b) return null;
    const span = Math.abs(b.x - a.x);
    return span > 1e-5 ? clamp((p.x - Math.min(a.x, b.x)) / span, 0, 1) : null;
  }
  function ratioY(p, a, b) {
    if (!p || !a || !b) return null;
    const span = Math.abs(b.y - a.y);
    return span > 1e-5 ? clamp((p.y - Math.min(a.y, b.y)) / span, 0, 1) : null;
  }
  function gazeFromLandmarks(lm, blend) {
    if (!lm) return null;

    // Primary: MediaPipe eye-look blendshapes. These encode relative eye
    // direction and are much less sensitive to head position than raw pixel
    // coordinates.
    const cat = Object.fromEntries((blend || []).map(c => [c.categoryName, Number(c.score) || 0]));
    const outL = cat.eyeLookOutLeft || 0;
    const inL = cat.eyeLookInLeft || 0;
    const outR = cat.eyeLookOutRight || 0;
    const inR = cat.eyeLookInRight || 0;
    const downL = cat.eyeLookDownLeft || 0;
    const downR = cat.eyeLookDownRight || 0;
    const upL = cat.eyeLookUpLeft || 0;
    const upR = cat.eyeLookUpRight || 0;

    const horizSignal = (outL - inL + inR - outR) / 2;
    const vertSignal = (downL + downR - upL - upR) / 2;
    const blendStrength = Math.max(outL, inL, outR, inR, downL, downR, upL, upR);

    if (blendStrength >= 0.025) {
      return {
        x: clamp(0.5 + horizSignal * 2.2, 0, 1),
        y: clamp(0.5 + vertSignal * 2.2, 0, 1),
        method: 'blendshapes',
        strength: blendStrength
      };
    }

    // Fallback: iris center inside each eye aperture.
    const li = avgPoint([468,469,470,471,472], lm);
    const ri = avgPoint([473,474,475,476,477], lm);
    const leftX = ratioX(li, point(33,lm), point(133,lm));
    const rightX = ratioX(ri, point(362,lm), point(263,lm));
    const leftY = ratioY(li, point(159,lm), point(145,lm));
    const rightY = ratioY(ri, point(386,lm), point(374,lm));

    if ([leftX,rightX,leftY,rightY].every(Number.isFinite)) {
      return {
        x: clamp((leftX + rightX) / 2, 0, 1),
        y: clamp((leftY + rightY) / 2, 0, 1),
        method: 'iris',
        strength: 0
      };
    }
    return null;
  }

  function headOrientation(lm) {
    const nose = point(1,lm), forehead = point(10,lm), chin = point(152,lm), left = point(234,lm), right = point(454,lm);
    if (!nose || !forehead || !chin || !left || !right) return { away: false };
    const x = clamp((nose.x-left.x)/Math.max(right.x-left.x, 1e-5), 0, 1);
    const y = clamp((nose.y-forehead.y)/Math.max(chin.y-forehead.y, 1e-5), 0, 1);
    return { x, y, away: Math.abs(x - 0.5) > 0.25 || Math.abs(y - 0.5) > 0.24 };
  }
  function insideEnvelope(g) {
    const e = gazeEnvelope || CONFIG.defaultEnvelope;
    return g.x >= e.minX && g.x <= e.maxX && g.y >= e.minY && g.y <= e.maxY;
  }

  function processFace(result) {
    if (!running || now() < pausedUntil) return;
    const faces = Array.isArray(result?.faceLandmarks) ? result.faceLandmarks : [];
    if (faces.length === 0) {
      status('no-face', 'Face not detected');
      const start = startedAt.noFace;
      if (sustained('noFace', true, CONFIG.noFaceGraceMs)) {
        emitViolation('no_face', { durationMs: now() - (start || now()), confidence: 0.90 });
        startedAt.noFace = null;
      }
      startedAt.multipleFace = null;
      startedAt.gazeOutside = null;
      startedAt.headAway = null;
      return;
    }
    startedAt.noFace = null;

    if (faces.length >= 2) {
      status('multiple-face', `${faces.length} faces detected`);
      const start = startedAt.multipleFace;
      if (sustained('multipleFace', true, CONFIG.multipleFaceGraceMs)) {
        emitViolation('multiple_faces', { faceCount: faces.length, durationMs: now() - (start || now()), confidence: 0.96 });
        startedAt.multipleFace = null;
      }
      return;
    }
    startedAt.multipleFace = null;

    const lm = faces[0];
    const blend = result?.faceBlendshapes?.[0]?.categories || [];
    const gaze = gazeFromLandmarks(lm, blend);
    const head = headOrientation(lm);

    if (gaze) {
      const outside = !insideEnvelope(gaze);
      if (outside) {
        status('gaze-away', 'Eyes outside calibrated reading area');
        const start = startedAt.gazeOutside;
        if (sustained('gazeOutside', true, CONFIG.gazeOutsideGraceMs)) {
          emitViolation('gaze_away', { gazeX: Number(gaze.x.toFixed(3)), gazeY: Number(gaze.y.toFixed(3)), durationMs: now()-(start||now()), confidence: 0.84 });
          startedAt.gazeOutside = null;
        }
      } else {
        startedAt.gazeOutside = null;
      }
    }

    if (head.away) {
      status('looking-away', 'Head orientation outside focus range');
      const start = startedAt.headAway;
      if (sustained('headAway', true, CONFIG.headAwayGraceMs)) {
        emitViolation('looking_away', { durationMs: now()-(start||now()), confidence: 0.82 });
        startedAt.headAway = null;
      }
    } else {
      startedAt.headAway = null;
      if (gaze && insideEnvelope(gaze)) status('face-ok', 'Face and eyes inside calibrated reading area');
    }
  }

  function bodyDistance(a, b) { return Math.hypot(a.x-b.x, a.y-b.y); }
  function processPose(result) {
    if (!CONFIG.bodyOptional || !running || now() < pausedUntil) return;
    const pose = result?.landmarks?.[0];
    if (!pose || pose.length < 25) { status('body-check', 'Body AI unavailable'); return; }
    const ls=pose[11], rs=pose[12], lh=pose[23], rh=pose[24];
    if (!ls || !rs || !lh || !rh) return;
    const shoulders={x:(ls.x+rs.x)/2,y:(ls.y+rs.y)/2};
    const hips={x:(lh.x+rh.x)/2,y:(lh.y+rh.y)/2};
    const torso={x:(shoulders.x+hips.x)/2,y:(shoulders.y+hips.y)/2};
    const shoulderWidth=bodyDistance(ls,rs);
    if (!bodyReference) { bodyReference={...torso,shoulderWidth}; status('body-ok','Body AI active'); return; }
    const moved = bodyDistance(torso,bodyReference) > CONFIG.bodyCenterDelta ||
      Math.abs(shoulderWidth-bodyReference.shoulderWidth)/Math.max(0.05,bodyReference.shoulderWidth) > CONFIG.bodyScaleDelta;
    if (moved) {
      status('body-move','Significant body movement detected');
      const start=startedAt.bodyMove;
      if (sustained('bodyMove',true,CONFIG.bodyMoveGraceMs)) {
        emitViolation('body_movement',{durationMs:now()-(start||now()),confidence:0.78});
        startedAt.bodyMove=null;
        bodyReference={...torso,shoulderWidth};
      }
    } else {
      startedAt.bodyMove=null;
      status('body-ok','Body position stable');
    }
  }

  async function getVision() {
    const vision = await import(CONFIG.bundlePath);
    FaceLandmarker = vision.FaceLandmarker;
    PoseLandmarker = vision.PoseLandmarker;
    FilesetResolver = vision.FilesetResolver;
    if (!FaceLandmarker || !FilesetResolver) throw new Error('MediaPipe Face Landmarker exports unavailable.');
    return vision;
  }
  async function createLandmarkers() {
    const vision = await getVision();
    const resolver = await FilesetResolver.forVisionTasks(CONFIG.wasmPath);
    const faceCommon = {
      baseOptions: { modelAssetPath: CONFIG.faceModelPath },
      runningMode: 'VIDEO', numFaces: CONFIG.maxFaces,
      minFaceDetectionConfidence: CONFIG.minFaceDetectionConfidence,
      minFacePresenceConfidence: CONFIG.minFacePresenceConfidence,
      minTrackingConfidence: CONFIG.minTrackingConfidence,
      outputFaceBlendshapes: true,
      outputFacialTransformationMatrixes: false
    };
    try { faceLandmarker = await FaceLandmarker.createFromOptions(resolver,{...faceCommon,baseOptions:{...faceCommon.baseOptions,delegate:'GPU'}}); }
    catch (_) { faceLandmarker = await FaceLandmarker.createFromOptions(resolver,{...faceCommon,baseOptions:{...faceCommon.baseOptions,delegate:'CPU'}}); }

    if (PoseLandmarker) {
      const poseCommon = {
        baseOptions:{modelAssetPath:CONFIG.poseModelPath}, runningMode:'VIDEO', numPoses:1,
        minPoseDetectionConfidence:0.45, minPosePresenceConfidence:0.45, minTrackingConfidence:0.45
      };
      try { poseLandmarker=await PoseLandmarker.createFromOptions(resolver,{...poseCommon,baseOptions:{...poseCommon.baseOptions,delegate:'GPU'}}); }
      catch (_) { try { poseLandmarker=await PoseLandmarker.createFromOptions(resolver,{...poseCommon,baseOptions:{...poseCommon.baseOptions,delegate:'CPU'}}); } catch (e) { poseLandmarker=null; console.warn('[AI PROCTOR] Body model unavailable; continuing with face/eye AI.'); } }
    }
  }
  async function ensureLandmarkers() { if (!faceLandmarker) await createLandmarkers(); }
  function detect() {
    if (!faceLandmarker || !videoElement || videoElement.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || !videoElement.videoWidth) return { face:null, pose:null };
    const ts = Math.round(performance.now());
    let face=null, pose=null;
    try { face=faceLandmarker.detectForVideo(videoElement,ts); } catch (e) { console.warn('[AI PROCTOR] face detect',e); }
    if (poseLandmarker) { try { pose=poseLandmarker.detectForVideo(videoElement,ts); } catch (e) { console.warn('[AI PROCTOR] pose detect',e); } }
    return {face,pose};
  }
  function monitorLoop() {
    if (!running) return;
    const ready=videoElement?.readyState>=HTMLMediaElement.HAVE_CURRENT_DATA && videoElement?.videoWidth>0;
    if (ready && now() >= pausedUntil) {
      const r=detect();
      if (r.face) processFace(r.face);
      if (r.pose) processPose(r.pose);
    }
    timer=setTimeout(monitorLoop,CONFIG.detectionIntervalMs);
  }

  // ---------------------------
  // Visual eye-reading calibration
  // ---------------------------
  function percentile(values, p) {
    if (!values.length) return 0.5;
    const a=[...values].sort((x,y)=>x-y); const idx=(a.length-1)*p; const lo=Math.floor(idx),hi=Math.ceil(idx);
    return lo===hi?a[lo]:a[lo]+(a[hi]-a[lo])*(idx-lo);
  }
  function calibrationOverlay() {
    const root=document.createElement('div');
    root.className='sb-eye-calibration-overlay';
    root.innerHTML=`<style>
      .sb-eye-calibration-overlay{position:fixed;inset:0;z-index:2147483000;background:#070a14;color:#f4f5ff;font-family:Inter,system-ui,-apple-system,sans-serif;overflow:hidden}
      .sb-cal-wrap{width:100vw;height:100vh;box-sizing:border-box;padding:28px 38px 24px;display:flex;flex-direction:column;gap:16px}
      .sb-cal-head{display:flex;justify-content:space-between;gap:24px;align-items:flex-start}.sb-cal-kicker{font-size:12px;letter-spacing:.1em;font-weight:850;color:#b7a5ff}.sb-cal-head h2{margin:7px 0 6px;font-size:32px;letter-spacing:-.03em}.sb-cal-head p{margin:0;color:#9ca6bd;max-width:930px;line-height:1.55;font-size:13px}.sb-cal-phase{padding:10px 14px;border-radius:999px;border:1px solid rgba(167,139,250,.25);background:rgba(124,92,255,.10);font-size:14px;font-weight:850;white-space:nowrap}
      .sb-cal-stage{position:relative;flex:1;min-height:0;border:1px solid rgba(255,255,255,.08);border-radius:24px;overflow:hidden;background:radial-gradient(circle at 50% 45%,rgba(99,102,241,.12),transparent 52%),#0b0f1a;padding:48px;display:flex}.sb-cal-stage.h{align-items:center}.sb-cal-stage.v{justify-content:center}.sb-cal-text{position:relative;z-index:2;font-weight:760;line-height:1.55;letter-spacing:-.02em}.sb-cal-text.h{width:100%;font-size:clamp(24px,3.2vw,48px)}.sb-cal-text.v{width:min(900px,80vw);font-size:clamp(22px,2.6vw,38px);display:flex;flex-direction:column;gap:16px;text-align:center}.sb-cal-text span{display:block}.sb-cal-sweep{position:absolute;z-index:1;pointer-events:none;opacity:.35}.sb-cal-sweep.h{top:0;bottom:0;width:16%;left:-20%;background:linear-gradient(90deg,transparent,#8b5cf6,transparent);animation:sbSweepH 5s linear infinite}.sb-cal-sweep.v{left:0;right:0;height:16%;top:-20%;background:linear-gradient(180deg,transparent,#38bdf8,transparent);animation:sbSweepV 5s linear infinite}
      .sb-cal-bottom{display:grid;grid-template-columns:1fr auto;gap:16px;align-items:end}.sb-cal-status{border:1px solid rgba(255,255,255,.07);border-radius:14px;background:rgba(255,255,255,.025);padding:13px 15px}.sb-cal-status small{display:block;text-transform:uppercase;letter-spacing:.1em;color:#707a95;font-size:10px}.sb-cal-status strong{display:block;margin-top:5px;font-size:14px}.sb-cal-btn{border:0;border-radius:13px;padding:14px 20px;background:linear-gradient(135deg,#8063ff,#4f46e5);color:white;font-weight:850;cursor:pointer}.sb-cal-btn.secondary{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.10)}.sb-cal-btn:disabled{opacity:.45;cursor:not-allowed}@keyframes sbSweepH{0%{left:-20%}100%{left:105%}}@keyframes sbSweepV{0%{top:-20%}100%{top:105%}}@media(max-width:800px){.sb-cal-wrap{padding:18px}.sb-cal-head{flex-direction:column}.sb-cal-head h2{font-size:24px}.sb-cal-stage{padding:24px}.sb-cal-bottom{grid-template-columns:1fr}}
    </style>
    <div class='sb-cal-wrap'>
      <div class='sb-cal-head'><div><div class='sb-cal-kicker'>👁️ EYE-MOVEMENT CALIBRATION</div><h2>Read naturally while we learn your eye range</h2><p>No voice calibration is required. Read the displayed text normally and follow it with your eyes. First read LEFT → RIGHT, then TOP → BOTTOM. Click the button only after you have completed the current passage.</p></div><div id='sbCalPhase' class='sb-cal-phase'>1 / 2 · LEFT → RIGHT</div></div>
      <div id='sbCalStage' class='sb-cal-stage h'><div id='sbCalText' class='sb-cal-text h'></div><div id='sbCalSweep' class='sb-cal-sweep h'></div></div>
      <div class='sb-cal-bottom'><div class='sb-cal-status'><small>Eye trace</small><strong id='sbCalStatus'>Waiting to start. Keep your face visible while reading.</strong></div><div><button id='sbCalButton' class='sb-cal-btn'>Start Eye Calibration</button></div></div>
    </div>`;
    document.body.appendChild(root);
    return root;
  }

  async function calibrateGaze(options={}) {
    videoElement=options.video || videoElement || document.getElementById('camera');
    if (!videoElement) throw new Error('Eye calibration requires the camera video element.');
    await ensureLandmarkers();

    gazeCalibrationSamples=[];
    const overlay=calibrationOverlay();
    const stage=overlay.querySelector('#sbCalStage');
    const text=overlay.querySelector('#sbCalText');
    const sweep=overlay.querySelector('#sbCalSweep');
    const phaseLabel=overlay.querySelector('#sbCalPhase');
    const statusEl=overlay.querySelector('#sbCalStatus');
    const btn=overlay.querySelector('#sbCalButton');

    const horizontal=`SkillBridge connects students, institutions and industry through verified skills. Read naturally across the screen from left to right while speaking clearly. Follow the words with your eyes at your normal reading pace.`;
    const vertical=`Now continue reading naturally while following the text from the top of the screen toward the bottom. Keep your face visible and let your eyes move normally with the reading flow.`;

    let phase='horizontal';
    let sampleTimer=null;
    let phaseSamples=0;
    let destroyed=false;

    const stopSampling=()=>{
      if(sampleTimer){ clearInterval(sampleTimer); sampleTimer=null; }
    };

    const render=()=>{
      if(phase==='horizontal'){
        stage.className='sb-cal-stage h';
        text.className='sb-cal-text h';
        text.innerHTML=horizontal.split(/(?<=[.!?])\s+/).map(s=>`<span>${s}</span>`).join('');
        sweep.className='sb-cal-sweep h';
        phaseLabel.textContent='1 / 2 · LEFT → RIGHT';
      }else{
        stage.className='sb-cal-stage v';
        text.className='sb-cal-text v';
        const words=vertical.split(/\s+/);
        const lines=[];
        for(let i=0;i<words.length;i+=7) lines.push(words.slice(i,i+7).join(' '));
        text.innerHTML=lines.map(s=>`<span>${s}</span>`).join('');
        sweep.className='sb-cal-sweep v';
        phaseLabel.textContent='2 / 2 · TOP → BOTTOM';
      }
    };

    const startSampling=()=>{
      stopSampling();
      sampleTimer=setInterval(()=>{
        if(destroyed) return;
        const r=detect();
        const f=r.face;
        const count=f?.faceLandmarks?.length||0;
        if(count===1){
          const lm=f.faceLandmarks[0];
          const g=gazeFromLandmarks(lm,f.faceBlendshapes?.[0]?.categories||[]);
          if(g){
            gazeCalibrationSamples.push({...g,phase});
            phaseSamples++;
          }
        }
        statusEl.textContent=`Eye trace captured: ${phaseSamples} samples. AI eye tracking is live.`;
      },CONFIG.calibrationSampleMs);
    };

    const waitForManualAdvance=(buttonLabel, phaseName)=>new Promise(resolve=>{
      let finished=false;
      const poll=setInterval(()=>{
        if(destroyed || finished){ clearInterval(poll); return; }
        const enough=phaseSamples>=CONFIG.calibrationMinSamples;
        btn.textContent=enough?buttonLabel:'Keep reading… capturing your eye movement';
        btn.disabled=!enough;
      },180);

      btn.onclick=()=>{
        if(finished || phase!==phaseName || phaseSamples<CONFIG.calibrationMinSamples) return;
        finished=true;
        clearInterval(poll);
        btn.onclick=null;
        resolve();
      };
    });

    render();
    btn.textContent='Start Eye Calibration';
    btn.disabled=false;
    await new Promise(resolve=>{
      btn.onclick=()=>{
        btn.onclick=null;
        resolve();
      };
    });

    btn.disabled=true;
    btn.textContent='Reading LEFT → RIGHT…';
    status('active','Eye calibration started');
    phaseSamples=0;
    startSampling();

    await waitForManualAdvance('I finished LEFT → RIGHT → Continue','horizontal');

    phase='vertical';
    phaseSamples=0;
    render();
    statusEl.textContent='Now read the complete passage from TOP to BOTTOM.';
    btn.disabled=true;
    startSampling();

    await waitForManualAdvance('I finished TOP → BOTTOM → Finish Calibration','vertical');

    stopSampling();

    if(gazeCalibrationSamples.length < CONFIG.calibrationMinSamples){
      overlay.remove();
      throw new Error('Not enough eye samples were captured. Please keep your face visible and try calibration again.');
    }

    const xs=gazeCalibrationSamples.map(s=>s.x);
    const ys=gazeCalibrationSamples.map(s=>s.y);
    const minX=clamp(percentile(xs,0.05)-CONFIG.calibrationPadX,0.08,0.42);
    const maxX=clamp(percentile(xs,0.95)+CONFIG.calibrationPadX,0.58,0.92);
    const minY=clamp(percentile(ys,0.05)-CONFIG.calibrationPadY,0.08,0.42);
    const maxY=clamp(percentile(ys,0.95)+CONFIG.calibrationPadY,0.58,0.92);
    gazeEnvelope={minX,maxX,minY,maxY,centerX:(minX+maxX)/2,centerY:(minY+maxY)/2,samples:gazeCalibrationSamples.length};
    console.info('[AI PROCTOR] eye calibration complete',gazeEnvelope);

    phaseLabel.textContent='CALIBRATION COMPLETE';
    stage.className='sb-cal-stage v';
    text.className='sb-cal-text v';
    text.innerHTML='<div style="font-size:56px">✓</div><div>Eye calibration complete</div><span style="font-size:16px;font-weight:500;color:#a9b2c6">Your natural reading movement has been learned. Click Start Exam when you are ready.</span>';
    sweep.className='sb-cal-sweep';
    statusEl.textContent='Reading area captured successfully.';
    btn.textContent='Start Exam';
    btn.disabled=false;

    await new Promise(resolve=>{
      btn.onclick=()=>{
        btn.onclick=null;
        resolve();
      };
    });

    destroyed=true;
    stopSampling();
    overlay.remove();
    status('active','Eye calibration complete');
    return {success:true,envelope:{...gazeEnvelope},samples:gazeCalibrationSamples.length};
  }

  async function prepareCalibration(options={}) {
    videoElement=options.video||videoElement||document.getElementById('camera');
    if (!videoElement) throw new Error('Camera video element is required.');
    await ensureLandmarkers();
    return true;
  }
  function beginGazeCalibration(){ gazeCalibrationSamples=[]; return true; }
  function sampleGaze(){
    const r=detect(), lm=r.face?.faceLandmarks?.[0];
    if(!lm) return null; const g=gazeFromLandmarks(lm,r.face?.faceBlendshapes?.[0]?.categories||[]);
    if(g){ gazeCalibrationSamples.push(g); return g; } return null;
  }
  function finishGazeCalibration(){
    if(gazeCalibrationSamples.length<CONFIG.calibrationMinSamples) return {success:false,samples:gazeCalibrationSamples.length};
    const xs=gazeCalibrationSamples.map(s=>s.x),ys=gazeCalibrationSamples.map(s=>s.y);
    gazeEnvelope={minX:clamp(percentile(xs,.05)-CONFIG.calibrationPadX,.08,.42),maxX:clamp(percentile(xs,.95)+CONFIG.calibrationPadX,.58,.92),minY:clamp(percentile(ys,.05)-CONFIG.calibrationPadY,.08,.42),maxY:clamp(percentile(ys,.95)+CONFIG.calibrationPadY,.58,.92)};
    gazeEnvelope.centerX=(gazeEnvelope.minX+gazeEnvelope.maxX)/2; gazeEnvelope.centerY=(gazeEnvelope.minY+gazeEnvelope.maxY)/2; gazeEnvelope.samples=gazeCalibrationSamples.length;
    return {success:true,envelope:{...gazeEnvelope},samples:gazeCalibrationSamples.length};
  }

  async function start(options={}) {
    videoElement=options.video||null; onViolation=options.onViolation||null; onStatus=options.onStatus||null;
    if(!videoElement) throw new Error('Face proctor requires a camera video element.');
    await ensureLandmarkers();
    clearConditions(); Object.keys(lastEventByType).forEach(k=>delete lastEventByType[k]); eventLog=[]; bodyReference=null; pausedUntil=0; running=true;
    status('active','AI video recognition active');
    clearTimeout(timer); timer=null; monitorLoop();
    return true;
  }
  function pauseFor(ms=5000){ pausedUntil=now()+Math.max(0,Number(ms)||0); clearConditions(); status('active',`AI Proctor paused for ${Math.ceil(ms/1000)}s after warning`); setTimeout(()=>{if(running)status('active','AI video recognition active');},Math.max(0,Number(ms)||0)); }
  function stop(){ running=false; clearTimeout(timer); timer=null; clearConditions(); bodyReference=null; try{faceLandmarker?.close?.();}catch(_){} try{poseLandmarker?.close?.();}catch(_){} faceLandmarker=null;poseLandmarker=null;videoElement=null;onViolation=null;onStatus=null;pausedUntil=0; }

  window.FaceProctor={start,stop,pauseFor,prepareCalibration,beginGazeCalibration,sampleGaze,finishGazeCalibration,calibrateGaze,getCalibration:()=>gazeEnvelope?{...gazeEnvelope}:null,getEvents:()=>[...eventLog],config:{...CONFIG}};
})();
