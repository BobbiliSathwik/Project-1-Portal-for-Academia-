/*
 * SkillBridge microphone activity monitor.
 *
 * This is intentionally NOT speaker recognition and NOT voice calibration.
 * It simply listens to the microphone's live audio level in the browser and
 * reports a short, sustained audio/voice activity event. The HUD changes to
 * "voice detected" while sound is present and returns to "silent" after the
 * sound stops.
 */
(() => {
  const CFG = {
    sampleEveryMs: 80,
    warmupMs: 900,
    minimumRms: 0.012,
    thresholdDbAboveNoise: 8,
    startHoldMs: 350,
    silenceHoldMs: 500,
    eventCooldownMs: 5000,
    fftSize: 1024
  };

  let audioContext = null;
  let analyser = null;
  let source = null;
  let timer = null;
  let running = false;
  let pausedUntil = 0;
  let noiseDb = -55;
  let audioStartedAt = null;
  let silenceStartedAt = null;
  let lastEventAt = 0;
  let eventArmed = true;
  let onViolation = null;
  let onStatus = null;
  let startedAt = 0;
  let lastActive = false;

  function dbFromRms(rms) {
    return 20 * Math.log10(Math.max(rms, 0.00001));
  }

  function setHud(text, active = false) {
    const el = document.getElementById("proctorVoiceStatus");
    if (el) {
      el.textContent = active ? `Mic: 🎙️ ${text}` : `Mic: ${text}`;
      el.classList.toggle("mic-active", active);
      el.setAttribute("aria-label", `Microphone ${text}`);
    }

    // Keep compatibility with callers that want status text, but do not
    // spam the main proctor HUD every audio sample.
    onStatus?.(text);
  }

  function sample() {
    if (!running || !analyser) return;

    const now = Date.now();
    const values = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(values);

    let sum = 0;
    for (let i = 0; i < values.length; i += 1) {
      sum += values[i] * values[i];
    }

    const rms = Math.sqrt(sum / values.length);
    const db = dbFromRms(rms);

    // Learn ambient room noise during the first short interval.
    if (now - startedAt < CFG.warmupMs) {
      noiseDb = noiseDb * 0.82 + db * 0.18;
      setHud("learning room sound", false);
      return;
    }

    const threshold = Math.max(
      CFG.minimumRms,
      Math.pow(10, (noiseDb + CFG.thresholdDbAboveNoise) / 20)
    );

    const active = rms >= threshold;

    // Slowly follow the room's background noise only while the mic is quiet.
    if (!active) {
      noiseDb = noiseDb * 0.985 + db * 0.015;
    }

    if (active) {
      silenceStartedAt = null;
      if (audioStartedAt == null) audioStartedAt = now;

      if (!lastActive) {
        setHud("voice/noise detected", true);
        lastActive = true;
      }

      // Once the user has been silent after an earlier event, the detector
      // becomes armed again for the next distinct audio episode.
      if (
        eventArmed &&
        now - audioStartedAt >= CFG.startHoldMs &&
        now - lastEventAt >= CFG.eventCooldownMs
      ) {
        lastEventAt = now;
        eventArmed = false;
        onViolation?.({
          type: "audio_activity",
          timestamp: new Date().toISOString(),
          detector: "microphone_activity",
          source: "microphone",
          confidence: 0.86,
          durationMs: now - audioStartedAt,
          note: "Sustained microphone voice/noise activity was detected."
        });
      }
      return;
    }

    audioStartedAt = null;

    if (silenceStartedAt == null) {
      silenceStartedAt = now;
    }

    if (
      lastActive &&
      now - silenceStartedAt >= CFG.silenceHoldMs
    ) {
      setHud("silent", false);
      lastActive = false;

      // Re-arm only after the previous audio episode has ended. This means a
      // single continuous voice/noise episode cannot create multiple warnings.
      eventArmed = true;
    }
  }

  async function startMonitoring(options = {}) {
    const stream = options.stream;
    onViolation = options.onViolation || null;
    onStatus = options.onStatus || null;

    const tracks = stream?.getAudioTracks?.() || [];
    if (!tracks.length || tracks.every(track => track.readyState !== "live")) {
      throw new Error("A live microphone audio track is required.");
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      throw new Error("Web Audio API is not supported by this browser.");
    }

    audioContext = new AudioContextClass();
    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    const micStream = new MediaStream(tracks);
    source = audioContext.createMediaStreamSource(micStream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = CFG.fftSize;
    analyser.smoothingTimeConstant = 0.55;
    source.connect(analyser);

    clearInterval(timer);
    running = true;
    pausedUntil = 0;
    noiseDb = -55;
    audioStartedAt = null;
    silenceStartedAt = null;
    lastEventAt = 0;
    eventArmed = true;
    lastActive = false;
    startedAt = Date.now();

    setHud("monitoring", false);
    timer = setInterval(() => {
      // Keep the visual microphone indicator alive even during the 5-sec
      // proctor cooldown; violations themselves are simply suppressed there.
      const wasPaused = Date.now() < pausedUntil;
      if (wasPaused) {
        if (lastActive) {
          setHud("paused", false);
          lastActive = false;
        }
        return;
      }
      sample();
    }, CFG.sampleEveryMs);

    return true;
  }

  function pauseFor(ms = 5000) {
    pausedUntil = Date.now() + Math.max(0, Number(ms) || 0);
    audioStartedAt = null;
    silenceStartedAt = null;
    setHud(`paused for ${Math.ceil(ms / 1000)}s`, false);
  }

  function stop() {
    running = false;
    clearInterval(timer);
    timer = null;
    audioStartedAt = null;
    silenceStartedAt = null;
    try { source?.disconnect(); } catch (_) {}
    try { analyser?.disconnect(); } catch (_) {}
    try { audioContext?.close(); } catch (_) {}
    source = null;
    analyser = null;
    audioContext = null;
    setHud("off", false);
    onViolation = null;
    onStatus = null;
  }

  window.VoiceProctor = {
    startMonitoring,
    pauseFor,
    stop
  };
})();
