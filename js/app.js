		const data = {
			student: {
				name: 'Rahul Kumar',
				role: 'CSE Student • 3rd Year',
				initials: 'RK',
				title: 'Good morning, Rahul',
				subtitle: "Here's your career readiness overview."
			},
			skills: [
				['Python', 82, 'Verified'],
				['JavaScript', 74, 'Verified'],
				['React', 68, 'Verified'],
				['Git', 80, 'Verified'],
				['SQL', 42, 'Improve'],
				['Communication', 76, 'Verified']
			],
			gaps: [
				['SQL', 42, 70],
				['Data Structures', 48, 75],
				['Node.js', 35, 65]
			],
			careers: [
				['Full Stack Developer', '82%', 'Build end-to-end products across the modern web.',
					'React • Node.js • SQL'
				],
				['Frontend Developer', '78%', 'Create accessible, polished digital experiences.',
					'JavaScript • React • CSS'
				],
				['Backend Developer', '71%', 'Design reliable systems and APIs at scale.', 'Node.js • Python • SQL']
			],
			opportunities: [
				['Software Developer Intern', 'TechNova', 'Hyderabad', 'Python • React • Git', '89%'],
				['Frontend Developer Intern', 'InnovateLabs', 'Remote', 'JavaScript • React • CSS', '84%'],
				['Data Analyst Intern', 'DataSphere', 'Bengaluru', 'Python • SQL • Excel', '67%']
			],
			company: {
				name: 'TechNova Technologies',
				initials: 'TN',
				title: 'Welcome, TechNova',
				subtitle: 'Manage your opportunities and discover suitable talent.'
			},
			candidates: [
				['Rahul Kumar', 'CSE • 3rd Year', '92%', 'Python • React • Git • SQL', '3 verified skills'],
				['Priya Sharma', 'IT • 4th Year', '88%', 'Java • React • Git', '4 verified skills'],
				['Arjun Reddy', 'CSE • 3rd Year', '84%', 'Python • Node.js • SQL', '3 verified skills']
			],
			institution: {
				name: 'ABC Institute of Technology',
				initials: 'AI',
				title: 'Good morning, Admin',
				subtitle: 'Monitor student readiness, skills, internships, and industry engagement.'
			}
		};
		const icons = {
			dashboard: '⌂',
			home: '⌂',
			profile: '◉',
			skills: '✦',
			jobs: '▣',
			briefcase: '▤',
			analytics: '▥',
			settings: '⚙',
			logout: '↪',
			bell: '◌',
			menu: '☰'
		};
		const app = document.getElementById('app');
		const AI_API_ENDPOINT = '/api/ai/chat';
		const AI_CONFIG = {
			model: 'gpt-4o-mini',
			maxOutput: 600,
			temperature: 0.4,
			systemPrompts: {
				student: 'You are the SkillAura Student Assistant. Help the student understand verified skills, identify skill gaps, discover relevant opportunities, track applications, prepare for interviews, and plan learning. Use actual SkillAura data. Never invent scores, opportunities, applications, or statuses.',
				company: 'You are the SkillAura Recruiter Assistant. Help recruiters understand opportunities, applications, candidate skill matches, interviews, and recruitment analytics. Use actual SkillAura data. Do not make final hiring decisions.',
				institution: 'You are the SkillAura Institution Assistant. Help institutions understand student development, skill gaps, internships, placements, and industry demand. Use actual SkillAura data. Do not expose private recruiter or student information beyond the user\'s permissions.'
			}
		};
		const THEME_KEY = 'skillaura-theme';
		let selectedTheme = loadThemePreference();
		document.documentElement.dataset.theme = selectedTheme;
		let chatbotState = {
			lastOpportunity: null,
			pendingApplication: null,
			memory: {}
		};

		function loadThemePreference() {
			try {
				return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light';
			} catch (error) {
				return 'light';
			}
		}

		function themeToggleMarkup() {
			const isDark = selectedTheme === 'dark';
			return `<button class="theme-toggle" type="button" data-theme-toggle aria-pressed="${isDark}" aria-label="Switch to ${isDark ? 'white' : 'black'} mode"><span class="theme-toggle-icon" aria-hidden="true">${isDark ? '☼' : '◐'}</span><span class="theme-toggle-label">${isDark ? 'Black' : 'White'}</span></button>`;
		}

		function setTheme(theme) {
			selectedTheme = theme === 'dark' ? 'dark' : 'light';
			document.documentElement.dataset.theme = selectedTheme;
			try { localStorage.setItem(THEME_KEY, selectedTheme); } catch (error) { }
			const isDark = selectedTheme === 'dark';
			document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
				button.setAttribute('aria-pressed', String(isDark));
				button.setAttribute('aria-label', `Switch to ${isDark ? 'white' : 'black'} mode`);
				button.querySelector('.theme-toggle-icon').textContent = isDark ? '☼' : '◐';
				button.querySelector('.theme-toggle-label').textContent = isDark ? 'Black' : 'White';
			});
			if (document.body.classList.contains('home-page')) updateGlobalBackground();
		}

		function brand() {
			return `<a class="brand" href="#/"><span class="brand-mark">↗</span>SkillAura</a>`;
		}

		function currentAuthSession() {
			try {
				const session = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
				if (!session || typeof session !== 'object') return null;
				if (session.loggedIn === false && !session.role && !session.userId && !session.id) return null;
				return {
					loggedIn: true,
					role: normalizeRole(session.role || session.accountRole || 'student'),
					userId: session.userId || session.id || null,
					name: session.name || session.fullName || '',
					email: session.email || '',
					companyId: session.companyId || null,
					institutionId: session.institutionId || null,
					...session,
					loggedIn: true
				};
			} catch (error) {
				return null;
			}
		}

		function persistAuthSession(session) {
			if (!session || !session.role) return;
			const payload = {
				loggedIn: true,
				role: normalizeRole(session.role),
				userId: session.userId || session.id || null,
				name: session.name || session.fullName || '',
				email: session.email || '',
				companyId: session.companyId || null,
				institutionId: session.institutionId || null,
				...session,
				loggedIn: true
			};
			try { localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(payload)); } catch (error) {}
		}

		function currentUserDashboardRoute() {
			const session = currentAuthSession();
			const role = normalizeRole(session?.role || state?.activeRole || 'student');
			if (role === 'company') return '/company/dashboard';
			if (role === 'institution') return '/institution/dashboard';
			return '/student/dashboard';
		}

		function landing() {
			const auth = currentAuthSession();
			const isLoggedIn = Boolean(auth && auth.loggedIn);
			const dashboardRoute = currentUserDashboardRoute();
			const authenticatedNav = isLoggedIn ? `<a href="${dashboardRoute}">Dashboard</a><a href="#/${normalizeRole(auth.role)}/profile">Profile</a><button class="btn btn-light" type="button" data-action="logout">Logout</button>` : `<a href="#/login">Login</a>${themeToggleMarkup()}<a class="btn btn-primary" href="#/role-selection">Get Started</a>`;
			return `<div class="landing"><nav class="navbar container">${brand()}<div class="navlinks" id="navlinks"><a href="#/">Home</a><a href="#how">How It Works</a><a href="#roles">For Students</a><a href="#roles">For Industry</a><a href="#roles">For Institutions</a><a href="#about">About</a></div><div class="nav-actions">${authenticatedNav}<button class="mobile-menu" onclick="document.getElementById('navlinks').classList.toggle('open')">☰</button></div></nav>
			<section class="hero"><div class="container hero-copy"><div class="eyebrow">The collaboration layer for tomorrow's careers</div><div class="hero-wordmark" aria-label="SkillAura">Skill<span>Aura</span></div><h1>Connecting Skills, Academia <span>&amp; Industry</span></h1><p>Bridge the gap from learning to impact through verified skills, personalized career guidance, internships, jobs, and industry collaboration.</p><div class="hero-actions"><a class="btn btn-primary" href="#/role-selection">Get Started ↗</a><a class="btn btn-light" href="#how">Explore Platform ↓</a></div></div><div class="ecosystem"><div class="ecosystem-label"><span>SkillAura ecosystem</span><span>01 — 05</span></div><div class="flow"><div class="flow-item"><i>♙</i>Student</div><div class="flow-arrow">↓</div><div class="flow-item"><i>✦</i>Skills &amp; Verification</div><div class="flow-arrow">↓</div><div class="flow-item"><i>◈</i>Industry Opportunity</div><div class="flow-arrow">↓</div><div class="flow-item"><i>◎</i>Career Growth</div></div></div></section>
			<section class="section" id="about"><div class="container"><div class="section-heading"><div class="eyebrow">Why SkillAura</div><h2>The Skill Gap Problem</h2><p>Talent is everywhere. The right connections and signals are not.</p></div><div class="grid-3"><div class="card problem-card"><div class="icon-box">♙</div><h3>Students</h3><p>Clarity is hard to find when the path from classroom to career is fragmented.</p><ul class="checklist"><li>Know which skills matter</li><li>Find relevant internships</li></ul></div><div class="card problem-card"><div class="icon-box">▤</div><h3>Industry</h3><p>Recruiters need better signals to find capable, motivated early talent.</p><ul class="checklist"><li>Reach suitable candidates</li><li>Identify genuine competencies</li></ul></div><div class="card problem-card"><div class="icon-box">⌂</div><h3>Institutions</h3><p>Colleges need a clear view of readiness, outcomes, and industry demand.</p><ul class="checklist"><li>Track skill development</li><li>Build industry partnerships</li></ul></div></div></div></section>
			<section class="section soft"><div class="container solution"><div><div class="eyebrow">A connected journey</div><h2>One Platform. Multiple Stakeholders.</h2><p class="solution-copy">From the first assessment to the first opportunity, SkillAura gives every stakeholder a shared view of progress and potential.</p><a class="btn btn-primary" href="#/role-selection" style="margin-top:25px">Choose your workspace ↗</a></div><div class="card stack"><div class="stack-row"><span class="step-num">01</span>Student profile</div><div class="stack-row"><span class="step-num">02</span>Skill assessment</div><div class="stack-row"><span class="step-num">03</span>Verified profile</div><div class="stack-row"><span class="step-num">04</span>Learning &amp; career guidance</div><div class="stack-row"><span class="step-num">05</span>Internship / job matching</div><div class="stack-row"><span class="step-num">06</span>Industry collaboration ↕</div></div></div></section>
			<section class="section" id="how"><div class="container"><div class="section-heading"><div class="eyebrow">Simple by design</div><h2>How It Works</h2></div><div class="steps">${[['01','Create Your Profile','Role-based profiles for every stakeholder.'],['02','Discover Opportunities','Explore skills, programs, and real opportunities.'],['03','Verify & Improve','Build confidence through assessments and learning.'],['04','Connect','Meet mentors, teams, institutions, and employers.'],['05','Track Progress','See development, applications, and outcomes.']].map(x=>`<div class="step"><strong>${x[0]}</strong><h3>${x[1]}</h3><p>${x[2]}</p></div>`).join('')}</div></div></section>
			<section class="section soft" id="roles"><div class="container"><div class="section-heading"><div class="eyebrow">One ecosystem</div><h2>Built for the Entire Academia–Industry Ecosystem</h2></div><div class="grid-3"><div class="card role-card student"><div class="icon-box">♙</div><h3>Student</h3><p>Find internships, jobs, learning programs, and career guidance.</p><a class="btn btn-light" href="#/role-selection">Explore as Student →</a></div><div class="card role-card industry"><div class="icon-box">▤</div><h3>Industry</h3><p>Find skilled candidates and collaborate with institutions.</p><a class="btn btn-light" href="#/role-selection">Explore as Industry →</a></div><div class="card role-card institution"><div class="icon-box">⌂</div><h3>Institution</h3><p>Monitor student readiness and build industry partnerships.</p><a class="btn btn-light" href="#/role-selection">Explore as Institution →</a></div></div></div></section>
			<section class="section"><div class="container"><div class="section-heading"><div class="eyebrow">Coming together</div><h2>Preview the Platform</h2></div><div class="feature-grid">${['Skill Assessment','Verified Skills','Career Guidance','Internship & Job Matching','Industry Learning Programs','Institution Analytics'].map((x,i)=>`<div class="feature"><div class="icon-box">${['✦','✓','◎','▣','◈','▥'][i]}</div><strong>${x}</strong></div>`).join('')}</div></div></section><section class="cta"><div class="container"><h2>Build a Stronger Bridge Between Education and Industry</h2><p>From learning new skills to finding the right opportunity, SkillAura brings the complete journey into one platform.</p><a class="btn btn-primary" href="#/role-selection">Get Started ↗</a></div></section><footer><div class="container"><div class="footer-grid"><div>${brand()}<p style="margin-top:14px">Connecting Skills, Academia &amp; Industry.</p></div><div><h4>Platform</h4><a href="#/role-selection">Students</a><a href="#/role-selection">Industry</a><a href="#/role-selection">Institutions</a><a href="#/role-selection">Opportunities</a></div><div><h4>Company</h4><a href="#about">About</a><a href="#">Contact</a><a href="#">Privacy</a><a href="#">Terms</a></div><div><h4>Social</h4><p>LinkedIn · X · Instagram</p></div></div><div class="copyright">© 2026 SkillAura. All rights reserved.</div></div></footer></div>`
		}

		function updateRoleFields(role) {
			const target = document.getElementById('role-fields');
			if (!target) return;

			const fields = role === 'Student' ?
				['College', 'Degree', 'Branch', 'Year'] :
				role === 'Industry' ?
				['Company Name', 'Industry Type'] :
				['Institution Name', 'Institution Type'];

			target.innerHTML = fields
				.map((field) => `<label>${field}</label><input placeholder="${field}">`)
				.join('');
		}

		function auth(type) {
			let register = type === 'register';
			return `<div class="auth"><aside class="auth-aside">${brand()}<div><div class="eyebrow" style="color:var(--cyan)">Connecting Skills, Academia &amp; Industry</div><h1>${register?'Start building your bridge.':'Your next opportunity starts here.'}</h1><p>${register?'Create a role-based workspace designed for the journey from learning to impact.':'One clear view of your skills, opportunities, and the people helping you move forward.'}</p></div><div class="auth-note">Day 1 prototype · Demo access available</div></aside><main class="auth-main"><div class="form-wrap"><a class="btn-plain" href="#/">← Back to home</a><h2 style="margin-top:27px">${register?'Create your account':'Welcome back'}</h2><p>${register?'Set up your SkillAura workspace in a few seconds.':'Enter your details or jump straight into a demo workspace.'}</p><div class="form">${register?`<label>Full Name</label><input placeholder="Your full name"><label>Email</label><input type="email" placeholder="you@example.com"><label>Password</label><input type="password" placeholder="••••••••"><label>Confirm Password</label><input type="password" placeholder="••••••••"><label>Institution / Organization</label><input placeholder="Your institution or organization"><label>Role</label><select onchange="updateRoleFields(this.value)"><option>Student</option><option>Industry</option><option>Institution</option></select><div id="role-fields"></div><button class="btn btn-primary" onclick="location.hash='/role-selection'">Create Account</button>`:`<label>Email</label><input type="email" placeholder="you@example.com"><label>Password</label><input type="password" placeholder="••••••••"><div class="form-row"><label><input type="checkbox"> Remember me</label><a href="#" class="btn-plain">Forgot password?</a></div><button class="btn btn-primary" onclick="location.hash='/role-selection'">Login</button><div class="divider">or continue as demo</div><div class="demo-grid"><button class="demo-btn" onclick="location.hash='/student/dashboard'">Demo Student</button><button class="demo-btn" onclick="location.hash='/industry/dashboard'">Demo Industry</button><button class="demo-btn" onclick="location.hash='/institution/dashboard'">Demo Institution</button></div>`}</div><div class="switch">${register?'Already have an account?':'Don\'t have an account?'} <a href="#/${register?'login':'register'}">${register?'Login':'Create one'}</a></div></div></main></div>`
		}

		function roleSelection() {
			return `<div class="role-page"><div class="container role-top">${brand()}</div><div class="role-select"><div class="eyebrow">Who are you?</div><h1>Choose Your Workspace</h1><p>Select how you want to use SkillAura.</p><div class="role-options"><button class="role-option" type="button" data-action="choose-role" data-role="student"><div class="icon-box">🎓</div><h2>Student</h2><p>Build your skill profile, discover opportunities, and prepare for your career.</p><span class="btn btn-primary">Continue as Student →</span></button><button class="role-option" type="button" data-action="choose-role" data-role="company"><div class="icon-box">🏢</div><h2>Company</h2><p>Discover suitable candidates, post opportunities, and collaborate with academia.</p><span class="btn btn-primary">Continue as Company →</span></button><button class="role-option" type="button" data-action="choose-role" data-role="institution"><div class="icon-box">🏛️</div><h2>Institution</h2><p>Track student readiness, internships, placement progress, and collaboration.</p><span class="btn btn-primary">Continue as Institution →</span></button></div></div></div>`;
		}
		const dashboardRoutes = {
			student: {
				dashboard: 'Dashboard',
				profile: 'My Profile',
				skills: 'My Skills',
				opportunities: 'Opportunities',
				applications: 'Applications',
				interviews: 'Interviews',
				offers: 'Offers',
				internships: 'Internships',
				placements: 'Placements',
				notifications: 'Notifications',
				settings: 'Settings',
				'career-path': 'Career Path'
			},
			company: {
				dashboard: 'Dashboard',
				profile: 'Company Profile',
				opportunities: 'Opportunities',
				candidates: 'Candidates',
				analytics: 'Analytics',
				applications: 'Applications',
				shortlist: 'Shortlist',
				interviews: 'Interviews',
				messages: 'Messages',
				notifications: 'Notifications',
				programs: 'Industry Programs',
				'post-opportunity': 'Post Opportunity',
				settings: 'Settings'
			},
			institution: {
				dashboard: 'Dashboard',
				students: 'Students',
				assessments: 'Assessments',
				profile: 'Institution Profile',
				skills: 'Student Skills',
				'skill-gaps': 'Skill Gaps',
				learning: 'Learning & Development',
				internships: 'Internships',
				placements: 'Placements',
				industry: 'Industry Opportunities',
				faculty: 'Faculty Opportunities',
				analytics: 'Analytics',
				partnerships: 'Partnerships',
				reports: 'Reports & Analytics',
				notifications: 'Notifications',
				settings: 'Settings'
			}
		};

		function placeholder(role, section) {
			const title = dashboardRoutes[role]?.[section] || 'Page Not Found';
			const description = `${title} is not available for this route.`;
			return `<div class="app">${sidebar(role)}<main class="main"><header class="topbar"><div style="display:flex;align-items:center"><button class="mobile-dash-menu hidden" onclick="toggleSidebar()">☰</button><h2>${title}</h2></div><div class="topbar-right"><span style="font-size:20px;color:#71829a">◌</span><div class="avatar">${data[role==='student'?'student':role==='industry'?'company':'institution'].initials}</div></div></header><div class="placeholder"><div class="placeholder-card"><div class="icon-box">✦</div><h1>${title}</h1><p>${description}<br><span class="prototype-note">This is a Day 1 prototype screen.</span></p><a class="btn btn-primary" href="#/${role}/dashboard">← Back to Dashboard</a></div></div></main></div>`
		}

		function sidebar(role) {
			const current = location.hash.slice(1).split('/')[2] || 'dashboard';
			const hidden = ['settings', 'career-path', 'applications', 'programs', 'post-opportunity'];
			const items = Object.entries(dashboardRoutes[role]).filter(([key]) => !hidden.includes(key));
			return `<aside class="sidebar" id="sidebar"><div class="side-brand">${brand()}</div><nav class="side-nav">${items.map(([key,label])=>`<a class="${key===current?'active':''}" href="#/${role}/${key}" onclick="closeSidebar()">${icons[key]||'◉'} ${label}</a>`).join('')}</nav><div class="side-spacer"></div><a class="side-nav ${current==='settings'?'active':''}" href="#/${role}/settings" onclick="closeSidebar()"><span>⚙</span> Settings</a><button class="logout" onclick="location.hash='/'">↪ &nbsp; Logout</button></aside>`
		}

		function dash(role) {
			let person = data[role === 'student' ? 'student' : role === 'industry' ? 'company' : 'institution'];
			return `<div class="app">${sidebar(role)}<main class="main"><header class="topbar"><div style="display:flex;align-items:center"><button class="mobile-dash-menu hidden" onclick="document.getElementById('sidebar').classList.toggle('open')">☰</button><h2>${role[0].toUpperCase()+role.slice(1)} Dashboard</h2></div><div class="topbar-right"><div class="search">⌕ &nbsp; Search anything</div><span style="font-size:20px;color:#71829a">◌</span><div class="avatar">${person.initials}</div><div class="user-meta">${person.name}<span>${role[0].toUpperCase()+role.slice(1)}</span></div></div></header><div class="dash-content"><div class="dash-intro"><div><h1>${person.title}</h1><p>${person.subtitle}</p></div><span class="tag blue">Prototype workspace</span></div>${role==='student'?studentDash():role==='industry'?industryDash():institutionDash()}</div></main></div>`
		}

		function panel(title, content, link = 'View all →') {
			return `<section class="dash-panel"><div class="panel-head"><h3>${title}</h3><button class="btn-plain">${link}</button></div>${content}</section>`
		}

		function studentDash() {
			return `<div class="kpis">${[['Skill Readiness','72%','↑ 8% this month','✦'],['Verified Skills','4','2 pending review','✓'],['Applications','6','2 new updates','▣'],['Profile Completion','85%','Almost there','◉']].map(x=>`<div class="kpi"><div class="kpi-top"><span>${x[0]}</span><span class="kpi-icon">${x[3]}</span></div><div class="kpi-value">${x[1]}</div><div class="kpi-note">${x[2]}</div></div>`).join('')}</div><div class="dash-grid">${panel('Your Skills',data.skills.map(x=>`<div class="skill"><div class="skill-line"><span>${x[0]}</span><span><b>${x[1]}%</b> <span class="tag ${x[2]==='Verified'?'success':'warning'}">${x[2]==='Verified'?'✓ Verified':'⚠ Improve'}</span></span></div><div class="bar"><span style="width:${x[1]}%"></span></div></div>`).join(''),'Manage skills →')}${panel('Your Skill Gaps',data.gaps.map(x=>`<div class="gap-row"><div class="skill-line"><b>${x[0]}</b><span>${x[1]}% <span class="muted">/ ${x[2]}% target</span></span></div><div class="bar"><span style="width:${x[1]}%;background:var(--amber)"></span></div></div>`).join('')+'<button class="btn btn-light">Improve Skill →</button>')}</div>${panel('Recommended Career Paths',`<div class="career-grid">${data.careers.map(x=>`<div class="mini-card"><span class="tag success">${x[1]} match</span><h4 style="margin-top:12px">${x[0]}</h4><p>${x[2]}<br><b>${x[3]}</b></p><button class="btn btn-light">View Career</button></div>`).join('')}</div>`)}${panel('Recommended Opportunities',data.opportunities.map(x=>`<div class="opportunity"><div class="opportunity-icon">▣</div><div class="opportunity-info"><strong>${x[0]}</strong><small>${x[1]} · ${x[2]}<br>${x[3]}</small></div><div class="match">${x[4]}<small style="display:block;color:var(--muted);font-weight:400">match</small></div></div>`).join(''),'View all opportunities →')}${panel('Recent Applications',`<table><thead><tr><th>Opportunity</th><th>Company</th><th>Applied</th><th>Status</th></tr></thead><tbody><tr><td>Software Developer Intern</td><td>TechNova</td><td>02 Sep 2026</td><td><span class="tag warning">Under Review</span></td></tr><tr><td>Frontend Intern</td><td>InnovateLabs</td><td>01 Sep 2026</td><td><span class="tag success">Shortlisted</span></td></tr><tr><td>Data Analyst Intern</td><td>DataSphere</td><td>30 Aug 2026</td><td><span class="tag blue">Applied</span></td></tr></tbody></table>`)}`
		}

		function industryDash() {
			return `<div class="kpis">${[['Active Opportunities','12','4 closing soon','▣'],['Applications','248','↑ 24 this week','▤'],['Shortlisted','32','13 awaiting review','✓'],['Interviews','18','6 this week','◎']].map(x=>`<div class="kpi"><div class="kpi-top"><span>${x[0]}</span><span class="kpi-icon">${x[3]}</span></div><div class="kpi-value">${x[1]}</div><div class="kpi-note">${x[2]}</div></div>`).join('')}</div><div class="action-grid"><button class="action">＋ Post Opportunity</button><button class="action">♙ View Candidates</button><button class="action">▤ Manage Applications</button><button class="action">◈ Industry Programs</button></div>${panel('Active Opportunities',`<table><thead><tr><th>Opportunity</th><th>Applicants</th><th>Avg. match</th><th></th></tr></thead><tbody>${[['Software Developer Intern','12','89%'],['Frontend Developer Intern','26','84%'],['Data Analyst Intern','18','76%']].map(x=>`<tr><td>${x[0]}</td><td>${x[1]} applicants</td><td><span class="tag success">${x[2]}</span></td><td><button class="btn-plain">Manage →</button></td></tr>`).join('')}</tbody></table>`)}${panel('Top Matching Candidates',`<div class="candidate-grid">${data.candidates.map(x=>`<div class="mini-card"><div class="candidate-name"><div class="avatar">${x[0].split(' ').map(y=>y[0]).join('')}</div><strong>${x[0]}</strong><small>${x[1]}</small></div><p style="margin-top:17px"><span class="tag success">${x[2]} match</span><br>${x[3]}<br>${x[4]}</p><button class="btn btn-light">View Profile</button></div>`).join('')}</div>`)}${panel('Academia Collaboration',`<div class="collab-grid">${['Guest Lectures','Live Industry Projects','Workshops','Mentorship','Faculty Collaboration'].map(x=>`<div class="mini-card"><h4>${x}</h4><p>Connect with academic talent and create meaningful outcomes.</p><button class="btn-plain">Explore →</button></div>`).join('')}</div>`)}`
		}

		function institutionDash() {
			return `<div class="kpis">${[['Total Students','2,450','↑ 120 this year','♙'],['Assessed Students','1,980','81% of total','✓'],['Internship Ready','68%','↑ 6% this term','▣'],['Placement Ready','61%','↑ 4% this term','◎']].map(x=>`<div class="kpi"><div class="kpi-top"><span>${x[0]}</span><span class="kpi-icon">${x[3]}</span></div><div class="kpi-value">${x[1]}</div><div class="kpi-note">${x[2]}</div></div>`).join('')}</div><div class="dash-grid">${panel('Top Student Skill Gaps',`<div class="stat-bars">${[['SQL',84],['Cloud Computing',70],['AI / Machine Learning',62],['Data Structures',54],['Communication',42]].map(x=>`<div class="skill-line"><span>${x[0]}</span><span>${x[1]}%</span><div class="bar" style="width:100%"><span style="width:${x[1]}%"></span></div></div>`).join('')}</div>`)}${panel('Internship Participation',`<div class="metric-row"><span>Total students</span><strong>2,450</strong></div><div class="metric-row"><span>Internship participants</span><strong>1,240</strong></div><div class="metric-row"><span>Active internships</span><strong>340</strong></div><div class="metric-row"><span>Completed</span><strong style="color:var(--green)">780</strong></div>`,'View analytics →')}</div><div class="dash-grid">${panel('Placement Overview',`<div class="funnel"><div><span>Eligible</span><b>850</b></div><div><span>Applied</span><b>720</b></div><div><span>Shortlisted</span><b>340</b></div><div><span>Placed</span><b>180</b></div></div>`)}${panel('Industry Collaboration',`<div class="metric-row"><span>Active Industry Partners</span><strong>42</strong></div><div class="metric-row"><span>Live Projects</span><strong>18</strong></div><div class="metric-row"><span>Workshops This Year</span><strong>27</strong></div><div class="metric-row"><span>Research Collaborations</span><strong>12</strong></div><button class="btn btn-primary" style="margin-top:19px">Manage Partnerships →</button>`)}</div>`
		}

		function toggleSidebar() {
			document.getElementById('sidebar')?.classList.toggle('open');
		}

		function closeSidebar() {
			document.getElementById('sidebar')?.classList.remove('open');
		}

		function chatbotMarkup() {
			const role = currentRole();
			const prompts = {
				student: [
					'Analyze my skills',
					'Find opportunities for me',
					'What should I learn?',
					'Show my applications'
				],
				company: [
					'Find top candidates',
					'Analyze my applicants',
					'Create a job draft',
					'Show hiring statistics'
				],
				institution: [
					'Analyze student skills',
					'Show placement readiness',
					'Find major skill gaps',
					'Show industry demand'
				]
			};
			const icon = role === 'company' ? '▤' : role === 'institution' ? '⌂' : '♙';
			const labels = prompts[role] || prompts.student;
			return `<button class="ai-launcher" type="button" aria-label="Open SkillAura AI Assistant" aria-expanded="false">
				<span class="ai-launcher-icon">✦</span>
				<span class="ai-launcher-label">SkillAura AI</span>
			</button>
			<div class="ai-panel" aria-hidden="true">
				<div class="ai-header">
					<div class="ai-title-wrap">
						<div class="ai-avatar">${icon}</div>
						<div>
							<strong>${getAssistantTitle(role)}</strong>
							<span>${getAssistantSubtitle(role)}</span>
						</div>
					</div>
					<div class="ai-header-actions">
						<button class="ai-clear" type="button" aria-label="Clear conversation">Clear</button>
						<button class="ai-close" type="button" aria-label="Minimize assistant">−</button>
					</div>
				</div>
				<div class="ai-messages" aria-live="polite"></div>
				<div class="ai-suggestions">
					${labels.map((prompt) => `<button type="button" data-prompt="${prompt}">${prompt}</button>`).join('')}
				</div>
				<form class="ai-form">
					<input class="ai-input" type="text" placeholder="Ask the SkillAura ${role === 'company' ? 'Recruiter' : role === 'institution' ? 'Institution' : 'Student'} Assistant..." aria-label="Ask SkillAura AI Assistant" autocomplete="off">
					<button class="ai-stop" type="button" aria-label="Stop generating" class="hidden">Stop</button>
					<button class="ai-send" type="submit" aria-label="Send message">↗</button>
				</form>
			</div>`;
		}

		function currentRole() {
			const hashMatch = location.hash.match(/^#\/(student|company|industry|institution)\//);
			const hashRole = hashMatch?.[1] || 'student';
			const sessionRole = currentStudentSession()?.role || (typeof state !== 'undefined' ? state.activeRole : undefined) || 'student';
			const resolvedRole = hashRole === 'industry' ? 'company' : hashRole || sessionRole || 'student';
			return normalizeRoleName(resolvedRole || sessionRole || 'student');
		}

		function normalizeRoleName(role) {
			if (!role) return 'student';
			return role === 'industry' ? 'company' : role === 'company' ? 'company' : role === 'institution' ? 'institution' : 'student';
		}

		function currentPage() {
			return location.hash.slice(1) || '/';
		}

		function getAssistantTitle(role) {
			if (role === 'company') return 'SkillAura Recruiter Assistant';
			if (role === 'institution') return 'SkillAura Institution Assistant';
			return 'SkillAura Student Assistant';
		}

		function getAssistantSubtitle(role) {
			if (role === 'company') return 'Recruitment insights and candidate guidance';
			if (role === 'institution') return 'Student performance and industry demand';
			return 'Skills, opportunities, and career guidance';
		}

		function getRoleProfile(role) {
			if (role === 'company') return currentCompanyAccount()?.profile || state.company || { name: 'Your Company', initials: 'TN' };
			if (role === 'institution') return currentInstitutionAccount()?.profile || state.institution || { name: 'Your Institution', initials: 'AI' };
			return currentStudentAccount()?.profile || state.student || { name: 'Rahul Kumar', initials: 'RK' };
		}

		function getPersonalizedGreeting() {
			const role = currentRole();
			const profile = getRoleProfile(role);
			if (role === 'company') {
				return `Welcome back, ${profile.name || 'Your company'} 👋\nI'm your SkillAura Recruiter Assistant. I can help analyze candidates, opportunities, and recruitment activity.`;
			}
			if (role === 'institution') {
				return `Welcome to ${profile.name || 'your institution'} 👋\nI'm your SkillAura Institution Assistant. I can help analyze student skills, internships, placements, and industry demand.`;
			}
			return `Hi ${profile.name?.split(' ')[0] || 'there'} 👋\nI'm your SkillAura Student Assistant. I can help you understand your skills, find opportunities, and plan your career.`;
		}

		function extractSkillList(value) {
			if (!value) return [];
			if (Array.isArray(value)) return value.map((item) => String(item)).filter(Boolean);
			return String(value).split(/[;,|\n]/).map((item) => item.trim()).filter(Boolean);
		}

		function buildStudentContext() {
			const profile = currentStudentAccount()?.profile || state.student || {};
			const assessments = state.assessments || [];
			const applications = sharedEcosystem().applications.filter((item) => item.studentId === (currentStudentAccount()?.id || currentStudentSession()?.id || state.student?.id));
			const interviews = sharedEcosystem().interviews.filter((item) => item.studentId === (currentStudentAccount()?.id || currentStudentSession()?.id || state.student?.id));
			const offers = sharedEcosystem().offers.filter((item) => item.studentId === (currentStudentAccount()?.id || currentStudentSession()?.id || state.student?.id));
			const skills = (state.skills || []).length ? state.skills : assessments.map((assessment) => ({ name: assessment.skill, score: assessment.score, status: assessment.rating }));
			const gapList = (state.gaps || []).length ? state.gaps : skills.map((skill) => ({ name: skill.name, score: skill.score, target: 80 }));
			const opportunities = state.opportunities.map((opportunity) => ({ ...opportunity, match: calculateCandidateMatch(opportunity, { ...profile, skills }) }));
			return {
				role: 'student',
				profile,
				skills,
				gaps: gapList,
				applications,
				interviews,
				offers,
				opportunities,
				currentPage: currentPage()
			};
		}

		function buildCompanyContext() {
			const profile = currentCompanyAccount()?.profile || state.company || {};
			const companyId = currentCompanyAccount()?.id || state.company?.id || currentStudentSession()?.companyId || null;
			const opportunityList = (state.opportunities || []).filter((item) => item.companyId === companyId || item.company === profile.name);
			const applications = (sharedEcosystem().applications || []).filter((item) => item.companyId === companyId || item.company === profile.name);
			const candidates = loadStudentAccounts().map((account) => ({ ...account.profile, id: account.id, skills: account.workspace?.skills || state.skills || [] }));
			return {
				role: 'company',
				profile,
				opportunities: opportunityList,
				applications,
				candidates,
				currentPage: currentPage()
			};
		}

		function buildInstitutionContext() {
			const profile = currentInstitutionAccount()?.profile || state.institution || {};
			const students = institutionStudents();
			const appList = institutionApplications();
			const opportunities = (state.opportunities || []).filter((item) => item.status === 'Published' || item.companyId);
			return {
				role: 'institution',
				profile,
				students,
				applications: appList,
				opportunities,
				currentPage: currentPage()
			};
		}

		function chatbotContext() {
			const role = currentRole();
			if (role === 'company') return buildCompanyContext();
			if (role === 'institution') return buildInstitutionContext();
			return buildStudentContext();
		}

		async function askAI(message, context) {
			if (!AI_API_ENDPOINT || window.location.protocol === 'file:') return null;
			try {
				const response = await fetch(AI_API_ENDPOINT, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						message,
						context,
						config: {
							model: AI_CONFIG.model,
							temperature: AI_CONFIG.temperature,
							maxOutput: AI_CONFIG.maxOutput,
							systemPrompt: AI_CONFIG.systemPrompts[context.role] || AI_CONFIG.systemPrompts.student
						}
					})
				});
				if (!response.ok) return null;
				const payload = await response.json();
				if (payload?.reply) return { text: payload.reply, cards: payload.cards || '', action: payload.action || null };
				if (payload?.message) return { text: payload.message, cards: payload.cards || '', action: payload.action || null };
				return null;
			} catch (error) {
				return null;
			}
		}

		function formatPercent(value) {
			if (typeof value === 'number' && Number.isFinite(value)) return `${Math.round(value)}%`;
			return 'N/A';
		}

		function findStudentSkillMap() {
			const assessments = state.assessments || [];
			const mapped = {};
			(assessments || []).forEach((item) => {
				mapped[String(item.skill).toLowerCase()] = Number(item.score) || 0;
			});
			(state.skills || []).forEach((item) => {
				if (!mapped[String(item.name).toLowerCase()]) mapped[String(item.name).toLowerCase()] = Number(item.score) || 0;
			});
			return mapped;
		}

		function studentStrongestSkill(skills) {
			return [...(skills || [])].sort((a, b) => Number(b.score || 0) - Number(a.score || 0))[0];
		}

		function studentWeakestSkill(skills) {
			return [...(skills || [])].sort((a, b) => Number(a.score || 0) - Number(b.score || 0))[0];
		}

		function roleAwareStudentResponse(message, context) {
			const query = message.toLowerCase();
			const skills = context.skills || [];
			const gaps = context.gaps || [];
			const opportunities = context.opportunities || [];
			const applications = context.applications || [];
			const interviews = context.interviews || [];
			const offers = context.offers || [];
			const profile = context.profile || {};
			const studentName = profile.name?.split(' ')[0] || 'there';

			if (/(what should i learn|what should i improve|what skills am i weak in|weak in|skill gap|improve my)/.test(query)) {
				const weakSkills = gaps.filter((item) => Number(item.score || 0) < 80).sort((a, b) => Number(a.score || 0) - Number(b.score || 0));
				if (!weakSkills.length) return { text: `I do not see a major SkillAura skill gap in your current data. Your strongest skills look well aligned with your current profile.` };
				const topGap = weakSkills[0];
				const relevant = opportunities.filter((opportunity) => extractSkillList(opportunity.skills).some((skill) => skill.toLowerCase() === String(topGap.name).toLowerCase()));
				return {
					text: `${studentName}, your biggest gap is ${topGap.name}. Your current score is ${formatPercent(topGap.score)} and the target is ${formatPercent(topGap.target || 80)}. ${relevant.length ? `This skill appears in ${relevant[0].title || 'relevant opportunities'}, so improving it should help your match rate.` : 'Use your next assessment cycle to improve this skill and update your verified profile.'}`,
					action: { type: 'OPEN_SKILLS' }
				};
			}

			if (/(ready for frontend|am i ready|frontend development|am i ready for)/.test(query)) {
				const frontendSkillScore = skills.filter((skill) => ['react', 'javascript', 'css', 'html', 'git'].includes(String(skill.name || '').toLowerCase())).reduce((total, skill) => total + Number(skill.score || 0), 0) / Math.max(1, skills.filter((skill) => ['react', 'javascript', 'css', 'html', 'git'].includes(String(skill.name || '').toLowerCase())).length);
				const evidence = skills.find((skill) => String(skill.name || '').toLowerCase() === 'react');
				if (Number.isFinite(frontendSkillScore) && frontendSkillScore < 70) {
					return {
						text: `Based on your verified SkillAura data, your frontend readiness is around ${formatPercent(frontendSkillScore)}. The main gap is ${evidence ? evidence.name : 'frontend specific skills'} and Git/React are the most relevant improvements before a frontend application push.`,
						action: { type: 'OPEN_SKILLS' }
					};
				}
				return { text: `Your current SkillAura signals suggest you are generally ready for frontend roles, but continue improving React and Git so you stay competitive for stronger opportunities.` };
			}

			if (/(jobs should i apply for|which jobs|match me|which opportunities|opportunities match my skills|what jobs)/.test(query)) {
				const ranked = opportunities
					.filter((opportunity) => Number(opportunity.match || 0) >= 55)
					.sort((a, b) => Number(b.match || 0) - Number(a.match || 0));
				if (!ranked.length) return { text: 'I do not see any current opportunities matching your verified profile strongly enough for a confident recommendation yet.' };
				const top = ranked.slice(0, 3);
				const cards = top.map((opportunity) => `<div class="ai-result-card"><div class="ai-result-top"><span class="tag success">${opportunity.match}% match</span><span>${opportunity.location}</span></div><strong>${opportunity.title}</strong><span class="ai-result-company">${opportunity.company}</span><span class="ai-result-skills">Required skills: ${opportunity.skills}</span></div>`).join('');
				return { text: `I found ${ranked.length} opportunities that are relevant to your current skill profile. ${top.map((item) => `${item.title} (${item.match}%)`).join(', ')} are the strongest fits right now.`, cards, action: { type: 'OPEN_OPPORTUNITIES' } };
			}

			if (/(what is my current application status|what is my application status|application status|what are my applications|jobs have i applied for|applied for|do i have any interviews|which companies have shortlisted me|shortlisted me|interviews)/.test(query)) {
				const total = applications.length;
				const shortlisted = applications.filter((item) => /shortlisted|interview|selected|offer/i.test(item.status || item.stage || '')).length;
				const underReview = applications.filter((item) => /under review|applied/i.test(item.status || item.stage || '')).length;
				const interviewCount = interviews.length;
				if (total === 0) return { text: `You currently do not have any SkillAura applications recorded. Explore opportunities to create your first application.` };
				return { text: `You currently have ${total} application${total === 1 ? '' : 's'}. ${shortlisted} are shortlisted or beyond, ${underReview} are still pending, and you have ${interviewCount} upcoming interview${interviewCount === 1 ? '' : 's'}.`, action: { type: 'OPEN_APPLICATIONS' } };
			}

			if (/(which companies have shortlisted me|shortlisted me|who shortlisted)/.test(query)) {
				const shortlisted = applications.filter((item) => /shortlisted|interview|selected|offer/i.test(item.status || item.stage || ''));
				if (!shortlisted.length) return { text: 'No company currently shows your profile as shortlisted in the stored SkillAura data.' };
				return { text: `Your active shortlists are from ${shortlisted.map((item) => item.company).join(', ')}. I can help you prepare the next steps for each opportunity if you want.`, action: { type: 'OPEN_APPLICATIONS' } };
			}

			if (/(what should i prepare|interview|placement readiness|improve my placement)/.test(query)) {
				const topSkills = [...skills].sort((a, b) => Number(a.score || 0) - Number(b.score || 0)).slice(0, 3);
				return { text: `Your biggest interview gaps are currently ${topSkills.map((skill) => `${skill.name} (${formatPercent(skill.score)})`).join(', ')}. Focus on communication, problem solving, and your weakest assessed technical area before the next interview cycle.`, action: { type: 'OPEN_CAREER' } };
			}

			if (/(what should i learn for a java developer role|what should i learn for a .*developer role|what should i learn for a .* role)/.test(query)) {
				return { text: 'For a Java developer role, your next high-value priorities are Java fundamentals, Spring/REST APIs, SQL, and system design basics. Based on your verified SkillAura profile, Java and SQL are the clearest anchors to improve for that path.' };
			}

			if (/(how can i improve my python score|python score|improve my python)/.test(query)) {
				const pythonSkill = skills.find((item) => String(item.name || '').toLowerCase() === 'python');
				const score = pythonSkill ? Number(pythonSkill.score || 0) : 0;
				return { text: `Your Python score is currently ${formatPercent(score)}. The best next steps are to practice control flow, data structures, file handling, and debugging patterns. These topics are especially important for backend and data roles.` };
			}

			if (/(why is my match score low|match score low)/.test(query)) {
				const topGap = gaps.sort((a, b) => Number(a.score || 0) - Number(b.score || 0))[0];
				return { text: `Your current match score is low because your verified profile is weaker in ${topGap ? topGap.name : 'the core skill areas'} required by the current opportunity set. Improve the missing skill areas and revisit the match after updating your assessment results.` };
			}

			if (/(what skills am i weak in|skills.*weak)/.test(query)) {
				const weakSkills = gaps.filter((item) => Number(item.score || 0) < 80).map((item) => `${item.name} (${formatPercent(item.score)})`);
				if (!weakSkills.length) return { text: 'Your active SkillAura profile appears strong; no major gaps are flagged right now.' };
				return { text: `Your currently weakest skills are ${weakSkills.join(', ')}. Those are the best opportunities for improvement before your next application wave.`, action: { type: 'OPEN_SKILLS' } };
			}

			if (/(how does skillaura work|how do i take an assessment|how do i apply for an internship|how do i create an opportunity|how do i view my applications|where can i see my skill profile|how do i .*skill profile)/.test(query)) {
				return { text: 'SkillAura works as a connected student-to-opportunity system: complete assessments to build a verified profile, compare your skill gaps, then explore relevant internships and jobs. To view your profile, open the Skills or Dashboard sections; to apply, open Opportunities and confirm the action before continuing.', action: { type: 'OPEN_DASHBOARD' } };
			}

			return { text: `I reviewed your actual SkillAura data for ${profile.name || 'your profile'}. Your strongest area is ${studentStrongestSkill(skills)?.name || 'your current assessment set'}, while your most relevant improvement area is ${studentWeakestSkill(gaps)?.name || 'your next target skill'}. Would you like to open the Skills dashboard or explore matching opportunities?`, action: { type: 'OPEN_SKILLS' } };
		}

		function roleAwareCompanyResponse(message, context) {
			const query = message.toLowerCase();
			const apps = context.applications || [];
			const opportunities = context.opportunities || [];
			const candidates = context.candidates || [];
			const profile = context.profile || {};

			if (/(show me the strongest candidates|strongest candidates|who are my strongest applicants|strongest applicant|who is strongest for this role)/.test(query)) {
				const ranked = candidates
					.map((candidate) => ({ ...candidate, match: candidate.skills && candidate.skills.length ? Math.round((candidate.skills.reduce((sum, skill) => sum + (Number(skill.score) || 0), 0) / candidate.skills.length)) : 0 }))
					.sort((a, b) => Number(b.match || 0) - Number(a.match || 0));
				if (!ranked.length) return { text: 'I do not have candidate data for this company workspace yet. Publish an opportunity first to start receiving applications.' };
				const top = ranked.slice(0, 3);
				return { text: `The strongest verified candidates in your active workspace are ${top.map((candidate) => `${candidate.name} (${candidate.match}%)`).join(', ')}. These candidates have the strongest aggregate skill alignment based on their current SkillAura records.`, action: { type: 'OPEN_CANDIDATES' } };
			}

			if (/(which applicants match this job best|which candidates should i shortlist|candidate.*shortlist|best match)/.test(query)) {
				const target = opportunities[0];
				if (!target) return { text: 'I do not see any active opportunities for this company workspace yet.' };
				const requiredSkills = extractSkillList(target.requirements?.required || target.skills);
				const ranked = candidates
					.map((candidate) => {
						const candidateSkills = (candidate.skills || []).map((skill) => String(skill.name || '').toLowerCase());
						const matched = requiredSkills.filter((skill) => candidateSkills.includes(String(skill).toLowerCase()));
						return { ...candidate, match: Math.round((matched.length / Math.max(1, requiredSkills.length)) * 100), matched };
					})
					.sort((a, b) => Number(b.match || 0) - Number(a.match || 0));
				if (!ranked.length) return { text: 'I do not have enough candidate data to rank applicants for this opportunity yet.' };
				const best = ranked[0];
				return { text: `For ${target.title}, ${best.name} is the best current match at ${best.match}% because they match ${best.matched.join(', ') || 'the core skills'} from the opportunity requirements. Recommended for review rather than automatic selection.`, action: { type: 'OPEN_CANDIDATES' } };
			}

			if (/(what skills are most common among applicants|skills are missing among applicants|what skills are missing|missing among applicants|most common among applicants)/.test(query)) {
				if (!apps.length) return { text: 'No applications are available in this workspace yet, so there is no applicant skill pattern to analyze.' };
				const skillFrequency = {};
				apps.forEach((item) => {
					const required = extractSkillList(item.requirements?.required || item.skills || '');
					required.forEach((skill) => {
						skillFrequency[skill] = (skillFrequency[skill] || 0) + 1;
					});
				});
				const mostCommon = Object.entries(skillFrequency).sort((a, b) => b[1] - a[1]).slice(0, 3);
				return { text: `The most frequent skills across your current applicant pool are ${mostCommon.map(([skill, count]) => `${skill} (${count})`).join(', ')}. That suggests the strongest demand concentration is in these areas.`, action: { type: 'OPEN_ANALYTICS' } };
			}

			if (/(how many applications do i have|how many candidates have been selected|which interviews are scheduled|show hiring statistics|how many candidates have been selected|how many applications)/.test(query)) {
				const selected = apps.filter((item) => /selected|offer/i.test(item.status || item.stage || '')).length;
				const shortlisted = apps.filter((item) => /shortlisted/i.test(item.status || item.stage || '')).length;
				const interviews = sharedEcosystem().interviews.filter((item) => item.companyId === (currentCompanyAccount()?.id || ''));
				return { text: `Your current workspace shows ${apps.length} application${apps.length === 1 ? '' : 's'}, ${shortlisted} shortlisted candidate${shortlisted === 1 ? '' : 's'}, ${interviews.length} scheduled interview${interviews.length === 1 ? '' : 's'}, and ${selected} selected candidate${selected === 1 ? '' : 's'}.`, action: { type: 'OPEN_ANALYTICS' } };
			}

			if (/(help me create a frontend internship|create a job draft|create a .* internship|job draft)/.test(query)) {
				const draft = {
					title: 'Frontend Developer Intern',
					description: 'Build user-facing interfaces, collaborate with the design and engineering teams, and contribute to a production-ready web application.',
					responsibilities: ['Build responsive interfaces', 'Work with JavaScript and React', 'Collaborate with product and design teams'],
					eligibility: 'Students in 2nd to 4th year of a relevant degree program',
					requiredSkills: ['HTML', 'CSS', 'JavaScript', 'React', 'Git'],
					preferredSkills: ['TypeScript', 'UI/UX awareness'],
					interviewTopics: ['Frontend JavaScript', 'React components', 'Git workflow']
				};
				return { text: `Here is a draft opportunity. Review it before publishing: ${draft.title}. Required skills: ${draft.requiredSkills.join(', ')}. I have not published it automatically, and you can edit or confirm this draft before posting.`, action: { type: 'OPEN_OPPORTUNITIES' } };
			}

			if (/(how does skillaura work|how do i create an opportunity|where can i see my skill profile|how do i view my applications)/.test(query)) {
				return { text: 'SkillAura lets recruiters publish opportunities, review application data, and compare candidates using verified skill signals. Use the Opportunities page to draft a role, review applicants in Applications, and open Analytics to compare match quality and hiring activity.', action: { type: 'OPEN_OPPORTUNITIES' } };
			}

			return { text: `${profile.name || 'Your company'} currently has ${opportunities.length} active opportunity${opportunities.length === 1 ? '' : 'ies'} and ${apps.length} application${apps.length === 1 ? '' : 's'} in the current workspace. The strongest candidates are those with the highest verified match against your live requirements.`, action: { type: 'OPEN_CANDIDATES' } };
		}

		function roleAwareInstitutionResponse(message, context) {
			const query = message.toLowerCase();
			const students = context.students || [];
			const applications = context.applications || [];
			const opportunities = context.opportunities || [];
			const assessed = students.filter((student) => (student.workspace?.assessments || student.assessments || []).length > 0).length;
			const verified = students.filter((student) => (student.workspace?.skills || student.skills || []).length > 0).length;
			const shortlisted = applications.filter((item) => /shortlisted|interview|selected|offer/i.test(item.status || item.stage || '')).length;
			const placed = applications.filter((item) => /selected|offer|accepted/i.test(item.status || item.stage || '')).length;
			const profile = context.profile || {};

			if (/(how many students have completed assessments|completed assessments|assessed)/.test(query)) {
				return { text: `${assessed} of ${students.length} students in your SkillAura institution record have completed at least one assessment.`, action: { type: 'OPEN_ANALYTICS' } };
			}

			if (/(which skills are weakest among our students|what are our biggest skill gaps|biggest skill gap|skill gaps)/.test(query)) {
				const grouped = {};
				students.forEach((student) => {
					(student.workspace?.skills || student.skills || []).forEach((skill) => {
						const name = skill.name || 'Unknown';
						if (!grouped[name]) grouped[name] = [];
						grouped[name].push(Number(skill.score || 0));
					});
				});
				const weak = Object.entries(grouped).map(([name, scores]) => ({ name, avg: scores.reduce((sum, value) => sum + value, 0) / scores.length })).sort((a, b) => a.avg - b.avg).slice(0, 3);
				if (!weak.length) return { text: 'There is not enough student skill data yet to identify institutional gaps.' };
				return { text: `The weakest measured skills across your current student pool are ${weak.map((item) => `${item.name} (${Math.round(item.avg)}%)`).join(', ')}. These are the most promising focus areas for campus training or workshops.`, action: { type: 'OPEN_SKILLS' } };
			}

			if (/(which students are placement ready|placement ready|students need skill development|need skill development)/.test(query)) {
				const ready = students.filter((student) => (student.workspace?.skills || student.skills || []).some((skill) => Number(skill.score || 0) >= 75)).length;
				const notReady = Math.max(0, students.length - ready);
				return { text: `${ready} of ${students.length} students in your current institution record are above the placement-readiness threshold. ${notReady} still need additional skill development support.`, action: { type: 'OPEN_ANALYTICS' } };
			}

			if (/(how many students applied for internships|how many students were shortlisted|how many students were placed|applied for internships|shortlisted|placed)/.test(query)) {
				return { text: `Across your institution records, ${applications.length} student applications are visible, ${shortlisted} students are shortlisted or beyond, and ${placed} students are currently recorded as placed or selected.`, action: { type: 'OPEN_ANALYTICS' } };
			}

			if (/(which companies recruited our students|companies recruited|which companies)/.test(query)) {
				const companies = [...new Set(applications.map((item) => item.company).filter(Boolean))];
				if (!companies.length) return { text: 'No company activity is linked to your institution yet.' };
				return { text: `Current company activity linked to your students includes: ${companies.join(', ')}.`, action: { type: 'OPEN_INDUSTRY' } };
			}

			if (/(what skills are companies demanding|industry demand|demanding skills|most demanded skills)/.test(query)) {
				const demand = {};
				opportunities.forEach((item) => {
					extractSkillList(item.requirements?.required || item.skills).forEach((skill) => {
						demand[skill] = (demand[skill] || 0) + 1;
					});
				});
				const top = Object.entries(demand).sort((a, b) => b[1] - a[1]).slice(0, 5);
				if (!top.length) return { text: 'There are no current opportunity skill requirements available to analyze.' };
				return { text: `The most demanded skills among current opportunities are ${top.map(([skill, count]) => `${skill} (${count})`).join(', ')}. React, SQL, and Git are frequently appearing in active roles.`, action: { type: 'OPEN_ANALYTICS' } };
			}

			if (/(which department has the largest skill gap|largest skill gap|department)/.test(query)) {
				return { text: 'The current SkillAura data does not yet segment student performance by department in a way that supports a department-level gap comparison. I would need department tags added to the student records for a precise answer.' };
			}

			if (/(students have upcoming interviews|upcoming interviews|which students have upcoming interviews)/.test(query)) {
				const interviews = sharedEcosystem().interviews.filter((item) => item.institutionId === (currentInstitutionAccount()?.id || ''));
				if (!interviews.length) return { text: 'There are no recorded student interviews linked to your institution yet.' };
				return { text: `There are ${interviews.length} recorded student interview${interviews.length === 1 ? '' : 's'} in your institution workspace.`, action: { type: 'OPEN_ANALYTICS' } };
			}

			if (/(how does skillaura work|how do i take an assessment|how do i apply for an internship|how do i create an opportunity|how do i view my applications|where can i see my skill profile)/.test(query)) {
				return { text: 'SkillAura connects the institution to student assessment outcomes, internship opportunities, and placement results. Use the Students section to review student records, the Skills section to inspect gaps, and Opportunities to align campus readiness with live industry demand.', action: { type: 'OPEN_DASHBOARD' } };
			}

			return { text: `Institution overview: ${students.length} students are in your SkillAura records, ${assessed} have completed assessments, ${verified} have verified skills, and ${applications.length} applications are currently tracked. The fastest path to improvement is to focus on the weakest skills mentioned in active opportunity demand.`, action: { type: 'OPEN_ANALYTICS' } };
		}

		function roleAwareFallbackResponse(message, context) {
			const role = context.role || currentRole();
			if (role === 'company') return roleAwareCompanyResponse(message, context);
			if (role === 'institution') return roleAwareInstitutionResponse(message, context);
			return roleAwareStudentResponse(message, context);
		}

		function generateRoleAwareResponse(message) {
			const role = currentRole();
			const context = chatbotContext();
			if (role === 'company' && !context.applications.length && !context.opportunities.length) {
				return { text: 'I do not have enough SkillAura data to answer that accurately yet. Add an opportunity or invite candidate activity before I can rank applicants or summarize hiring metrics.' };
			}
			if (role === 'institution' && !context.students.length) {
				return { text: 'I do not have enough SkillAura data to answer that accurately yet. Add student records or complete assessments before I can analyze institutional readiness.' };
			}
			if (role === 'student' && (!context.skills || !context.skills.length) && (!state.assessments || !state.assessments.length)) {
				return { text: 'I do not have enough SkillAura data to answer that accurately yet. Please complete at least one assessment first so I can analyze your skills and recommendations.' };
			}
			return roleAwareFallbackResponse(message, context);
		}

		function chatbotNavigate(type, opportunity) {
			const role = currentRole();
			const routes = {
				OPEN_DASHBOARD: `/${role}/dashboard`,
				OPEN_SKILLS: `/${role}/skills`,
				OPEN_OPPORTUNITIES: `/${role}/opportunities`,
				OPEN_APPLICATIONS: `/${role}/applications`,
				OPEN_CAREER: `/${role}/career-path`,
				OPEN_ANALYTICS: `/${role}/analytics`,
				OPEN_COMPANY: `/${role}/opportunities`,
				OPEN_OPPORTUNITY: `/${role}/opportunities`,
				SHOW_SKILL_GAPS: `/${role}/skills`,
				START_ASSESSMENT: `/${role}/skills`,
				OPEN_CANDIDATES: `/${role}/candidates`,
				OPEN_INDUSTRY: `/${role}/industry`
			};

			if (type === 'APPLY_TO_OPPORTUNITY') {
				chatbotState.pendingApplication = opportunity || chatbotState.lastOpportunity || data.opportunities[0];
				return;
			}

			if (routes[type]) location.hash = routes[type];
		}

		function initChatbot() {
			document.querySelector('.ai-launcher')?.parentElement?.remove();
			document.body.insertAdjacentHTML('beforeend', `<div class="ai-assistant">${chatbotMarkup()}</div>`);

			const assistant = document.querySelector('.ai-assistant');
			const launcher = assistant.querySelector('.ai-launcher');
			const panel = assistant.querySelector('.ai-panel');
			const close = assistant.querySelector('.ai-close');
			const clearButton = assistant.querySelector('.ai-clear');
			const messages = assistant.querySelector('.ai-messages');
			const form = assistant.querySelector('.ai-form');
			const input = assistant.querySelector('.ai-input');
			const stopButton = assistant.querySelector('.ai-stop');

			const addMessage = (content, sender = 'assistant', cards = '') => {
				const message = document.createElement('div');
				message.className = `ai-message ${sender}`;
				const text = document.createElement('p');
				text.textContent = content;
				message.append(text);
				if (cards) message.insertAdjacentHTML('beforeend', cards);
				messages.append(message);
				messages.scrollTop = messages.scrollHeight;
			};

			const showWelcome = () => {
				if (!messages.children.length) {
					addMessage(getPersonalizedGreeting().replace(/\n/g, ' '));
				}
			};

			const handleMessage = async (message) => {
				const cleanMessage = message.trim();
				if (!cleanMessage) return;
				const role = currentRole();
				addMessage(cleanMessage, 'user');
				input.value = '';
				const typing = document.createElement('div');
				typing.className = 'ai-typing';
				typing.textContent = 'SkillAura AI is thinking...';
				messages.append(typing);
				messages.scrollTop = messages.scrollHeight;

				let response = null;
				try {
					const externalResponse = await askAI(cleanMessage, chatbotContext());
					response = externalResponse || generateRoleAwareResponse(cleanMessage);
				} catch (error) {
					response = generateRoleAwareResponse(cleanMessage);
				}

				typing.remove();
				if (!response || !response.text) {
					response = {
						text: 'Sorry, I\'m having trouble connecting right now. Please try again.'
					};
				}
				addMessage(response.text, 'assistant', response.cards || '');
				if (response.action) chatbotNavigate(response.action.type, response.action.opportunity);
			};

			launcher.onclick = () => {
				const isOpen = assistant.classList.toggle('open');
				launcher.setAttribute('aria-expanded', String(isOpen));
				panel.setAttribute('aria-hidden', String(!isOpen));
				if (isOpen) {
					showWelcome();
					input.focus();
				}
			};
			close.onclick = () => {
				assistant.classList.remove('open');
				launcher.setAttribute('aria-expanded', 'false');
				panel.setAttribute('aria-hidden', 'true');
			};
			clearButton.onclick = () => {
				messages.innerHTML = '';
				showWelcome();
			};
			stopButton.onclick = () => {
				const typing = messages.querySelector('.ai-typing');
				if (typing) typing.textContent = 'Stopped generating.';
				setTimeout(() => typing?.remove(), 700);
			};
			form.onsubmit = (event) => {
				event.preventDefault();
				handleMessage(input.value);
			};
			assistant.querySelectorAll('[data-prompt]').forEach((button) => {
				button.onclick = () => handleMessage(button.dataset.prompt);
			});
			assistant.addEventListener('click', (event) => {
				const actionButton = event.target.closest('[data-chat-action]');
				if (!actionButton) return;
				const opportunity = data.opportunities.find((item) => item[0] === actionButton.dataset.opportunity);
				const action = actionButton.dataset.chatAction;
				if (action === 'APPLY_TO_OPPORTUNITY') {
					chatbotState.pendingApplication = opportunity;
					addMessage(`Please confirm that you want to apply for ${opportunity[0]} at ${opportunity[1]}. Type “Yes” to continue.`);
				} else {
					chatbotNavigate(action, opportunity);
				}
			});
		}

		function notFound() {
			return `<div class="role-page"><div class="role-top container">${brand()}</div><div class="placeholder"><div class="placeholder-card"><div class="icon-box">?</div><h1>404 / Page Not Found</h1><p>That route is not part of the current SkillAura prototype.</p><a class="btn btn-primary" href="#/">Return Home</a></div></div></div>`
		}

		function showToast(message) {
			document.querySelector('.toast')?.remove();
			const toast = document.createElement('div');
			toast.className = 'toast';
			toast.textContent = message;
			document.body.append(toast);
			setTimeout(() => toast.remove(), 2600);
		}

		function bindDashboardActions(role) {
			const routes = {
				student: {
					'My Skills': 'skills',
					'Manage skills →': 'skills',
					'Improve Skill →': 'skills',
					'View Career': 'career-path',
					'View Opportunity': 'opportunities'
				},
				industry: {
					'＋ Post Opportunity': 'post-opportunity',
					'View Candidates': 'candidates',
					'Manage Applications': 'applications',
					'Industry Programs': 'programs',
					'View Profile': 'candidates',
					'Manage →': 'opportunities',
					'Explore →': 'programs'
				},
				institution: {
					'View analytics →': 'analytics',
					'Manage Partnerships →': 'partnerships'
				}
			};
			const panelRoutes = {
				student: {
					'Your Skills': 'skills',
					'Your Skill Gaps': 'skills',
					'Recommended Career Paths': 'career-path',
					'Recommended Opportunities': 'opportunities',
					'Recent Applications': 'applications'
				},
				industry: {
					'Active Opportunities': 'opportunities',
					'Top Matching Candidates': 'candidates',
					'Academia Collaboration': 'programs'
				},
				institution: {
					'Top Student Skill Gaps': 'skills',
					'Internship Participation': 'analytics',
					'Placement Overview': 'analytics',
					'Industry Collaboration': 'partnerships'
				}
			};

			document.querySelectorAll('.main button').forEach((button) => {
				const label = button.textContent.trim();
				const panelTitle = button.closest('.dash-panel')
					?.querySelector('.panel-head h3')
					?.textContent.trim();
				const destination = routes[role]?.[label] || panelRoutes[role]?.[panelTitle];

				if (destination) {
					button.onclick = () => {
						location.hash = `/${role}/${destination}`;
					};
				} else {
					button.onclick = () => showToast(`${label.replace(/[→＋♙▤◈]/g, '').trim()} is not available from this dashboard.`);
				}
			});

			const search = document.querySelector('.search');
			if (search) search.onclick = () => document.querySelector('.page-search')?.focus();

			const notification = document.querySelector('.topbar-right > span');
			if (notification) notification.onclick = () => showToast('You are all caught up.');

			document.querySelector('.main')?.addEventListener('click', (event) => {
				if (event.target.closest('.sidebar') || event.target.closest('.mobile-dash-menu')) return;
				if (window.innerWidth <= 850 && !event.target.closest('#sidebar')) closeSidebar();
			});
		}

		function bindFormValidation(type) {
			const form = document.querySelector('.form');
			if (!form) return;
			if (type === 'login') {
				const note = document.createElement('div');
				note.className = 'prototype-note';
				note.textContent = 'Demo access for prototype evaluation';
				form.append(note)
			}
			const button = form.querySelector('.btn-primary');
			button.onclick = (event) => {
				event.preventDefault();
				const inputs = [...form.querySelectorAll('input')];
				const email = inputs.find(input => input.type === 'email');
				let message = '';
				if (inputs.some(input => !input.value.trim())) message = 'Please complete all required fields.';
				else if (email && !/^\S+@\S+\.\S+$/.test(email.value)) message = 'Please enter a valid email address.';
				else if (type === 'register' && inputs.filter(input => input.type === 'password').length > 1 && inputs
					.filter(input => input.type === 'password')[0].value !== inputs.filter(input => input.type ===
						'password')[1].value) message = 'Passwords do not match.';
				document.querySelector('.form-error')?.remove();
				if (message) {
					const error = document.createElement('div');
					error.className = 'form-error';
					error.textContent = message;
					form.prepend(error);
					return
				}
				location.hash = type === 'register' ? '/role-selection' : '/role-selection'
			}
		}

		function render() {
			const path = location.hash.slice(1) || '/';
			if (path && !path.startsWith('/')) {
				if (document.querySelector('.landing')) document.getElementById(path)?.scrollIntoView();
				return
			}
			const match = path.match(
				/^\/(student|industry|institution)\/(dashboard|profile|skills|opportunities|applications|settings|candidates|analytics|partnerships|career-path|post-opportunity|programs)$/
				);
			if (path === '/') app.innerHTML = landing();
			else if (path === '/login' || path === '/register') app.innerHTML = auth(path.slice(1));
			else if (path === '/role-selection') app.innerHTML = roleSelection();
			else if (match) {
				const [, role, section] = match;
				app.innerHTML = section === 'dashboard' ? dash(role) : placeholder(role, section);
				if (section === 'dashboard') bindDashboardActions(role)
			} else app.innerHTML = notFound();
			document.querySelectorAll('a[href="#"]').forEach(link => link.href = '#/');
			if (path === '/register') updateRoleFields('Student');
			if (path === '/login' || path === '/register') bindFormValidation(path.slice(1));
			window.scrollTo(0, 0)
			initChatbot();
		}
		window.addEventListener('hashchange', render);

		/* Functional prototype layer: keeps the original visual shell and hash routes. */
		const STATE_KEY = 'skillaura-prototype-state';
		var state;
		const defaultState = {
			student: { ...data.student, email: 'rahul@example.com', college: 'ABC Institute of Technology', degree: 'B.Tech', branch: 'Computer Science', year: '3rd Year' },
			company: { ...data.company, email: 'talent@technova.example', industryType: 'Software & Technology' },
			institution: { ...data.institution, email: 'admin@abc.example', institutionType: 'Engineering College' },
			skills: data.skills.map(([name, score, status]) => ({ name, score, status })),
			gaps: data.gaps.map(([name, score, target]) => ({ name, score, target })),
			careers: data.careers.map(([name, match, description, skills]) => ({ name, match, description, skills })),
			opportunities: data.opportunities.map(([title, company, location, skills, match]) => ({ title, company, location, skills, match, type: 'Internship', duration: '3 months', eligibility: 'Students with relevant foundational skills', deadline: '2026-12-31', description: 'A hands-on opportunity to build practical experience with a collaborative team.' })),
			applications: [{ id: 'seed-1', opportunity: 'Software Developer Intern', company: 'TechNova', status: 'Under Review', applied: '2026-08-22' }],
			partnerships: [{ id: 'seed-p1', name: 'TechNova Technologies', type: 'Hiring partnership', status: 'Active' }, { id: 'seed-p2', name: 'InnovateLabs', type: 'Guest lectures', status: 'Active' }],
			notifications: [{ id: 'seed-n1', text: 'Welcome to your SkillAura workspace.', read: false, time: 'Today' }],
			settings: { emailUpdates: true, profileVisibility: true, compactView: false },
			assessments: [],
			selectedCareer: 'Frontend Developer',
			learningProgress: {},
			activeRole: null,
			assessment: null,
			companyWorkspaces: {},
			institutionWorkspaces: {},
			ecosystem: { opportunities: [], applications: [], interviews: [], offers: [], internships: [], placements: [], notifications: [] }
		};
		state = loadState();
		const restoredSession = currentAuthSession();
		if (restoredSession && restoredSession.loggedIn) {
			state.activeRole = normalizeRole(restoredSession.role || 'student');
		}

		const STUDENT_ACCOUNTS_KEY = 'skillaura_students';
		const LEGACY_STUDENT_ACCOUNTS_KEY = 'skillaura_student_accounts';
		const COMPANY_ACCOUNTS_KEY = 'skillaura_companies';
		const COMPANY_WORKSPACES_KEY = 'skillaura_company_workspaces';
		const INSTITUTION_ACCOUNTS_KEY = 'skillaura_institutions';
		const INSTITUTION_WORKSPACES_KEY = 'skillaura_institution_workspaces';
		const CURRENT_USER_KEY = 'skillaura_current_user';
		const RESET_CANDIDATE_KEY = 'skillaura_reset_candidate';
		const ECOSYSTEM_STATUSES = ['Applied', 'Under Review', 'Shortlisted', 'Assessment', 'Interview', 'Selected', 'Offer Sent', 'Accepted', 'Rejected', 'Withdrawn'];
		const ASSESSMENT_QUESTIONS = {
			Python: [
				{q: 'Which keyword defines a function?', o: ['function', 'def', 'func', 'define'], a: 1, t: 'Functions'},
				{q: 'Which collection is mutable?', o: ['tuple', 'string', 'list', 'frozenset'], a: 2, t: 'Data Structures'},
				{q: 'What does len([1, 2, 3]) return?', o: ['2', '3', '4', 'Error'], a: 1, t: 'Data Structures'},
				{q: 'Which symbol begins a comment?', o: ['//', '#', '<!--', '--'], a: 1, t: 'Fundamentals'},
				{q: 'Which value represents no value?', o: ['void', 'null', 'None', 'nil'], a: 2, t: 'Fundamentals'},
				{q: 'Which loop iterates over items?', o: ['for', 'switch', 'case', 'goto'], a: 0, t: 'Control Flow'},
				{q: 'Which operator is exponentiation?', o: ['^', '**', '//', '%%'], a: 1, t: 'Fundamentals'},
				{q: 'What opens a file for reading?', o: ["open('a', 'r')", "read('a')", "file('a')", "load('a')"], a: 0, t: 'Modules'},
				{q: 'Which creates a dictionary?', o: ['[]', '{}', '()', '<>'], a: 1, t: 'Data Structures'},
				{q: 'Which keyword handles exceptions?', o: ['catch', 'except', 'error', 'rescue'], a: 1, t: 'Exception Handling'},
				{q: 'What is self in Python?', o: ['global variable', 'class instance', 'function parameter', 'module reference'], a: 1, t: 'OOP'},
				{q: 'Which type stores text?', o: ['char', 'text', 'string', 'String'], a: 2, t: 'Variables & Data Types'},
				{q: 'How do you create a list comprehension?', o: ['[x for x in range(5)]', '{x for x in range(5)}', '(x for x in range(5))', '[x: x in range(5)]'], a: 0, t: 'Data Structures'},
				{q: 'Which method joins list elements?', o: ['join()', 'combine()', 'concatenate()', 'merge()'], a: 0, t: 'Data Structures'},
				{q: 'What does isinstance() check?', o: ['equality', 'type', 'value', 'identity'], a: 1, t: 'Fundamentals'},
				{q: 'How is inheritance declared in Python?', o: ['extend Parent', 'inherit Parent', 'class Child(Parent)', 'class Child : Parent'], a: 2, t: 'OOP'},
				{q: 'Which module provides regular expressions?', o: ['match', 're', 'regex', 'search'], a: 1, t: 'Modules'},
				{q: 'What does *args allow in functions?', o: ['keyword arguments', 'variable positional arguments', 'named parameters', 'default values'], a: 1, t: 'Functions'},
				{q: 'How do you import a module function?', o: ['import func from module', 'from module import func', 'module.import func', 'include module.func'], a: 1, t: 'Modules'},
				{q: 'What is a lambda function?', o: ['loop function', 'anonymous function', 'library function', 'lazy function'], a: 1, t: 'Functions'}
			],
			Java: [
				{q: 'Which method starts a Java program?', o: ['start()', 'main()', 'run()', 'init()'], a: 1, t: 'Fundamentals'},
				{q: 'Which keyword creates an object?', o: ['make', 'new', 'class', 'this'], a: 1, t: 'OOP'},
				{q: 'Java source compiles to?', o: ['Machine code', 'Bytecode', 'Python', 'HTML'], a: 1, t: 'Fundamentals'},
				{q: 'Which type stores true/false?', o: ['bool', 'Boolean/boolean', 'bit', 'flag'], a: 1, t: 'Variables & Data Types'},
				{q: 'Which keyword inherits a class?', o: ['implements', 'extends', 'inherits', 'parent'], a: 1, t: 'OOP'},
				{q: 'Which collection allows duplicates?', o: ['Set', 'List', 'Map keys', 'Enum'], a: 1, t: 'Data Structures'},
				{q: 'Which is checked at compile time?', o: ['Syntax error', 'Network error', 'Server error', 'User error'], a: 0, t: 'Fundamentals'},
				{q: 'Which keyword makes a constant?', o: ['fixed', 'const', 'final', 'static'], a: 2, t: 'Variables & Data Types'},
				{q: 'Which package contains ArrayList?', o: ['java.util', 'java.io', 'java.net', 'java.sql'], a: 0, t: 'Data Structures'},
				{q: 'Which operator compares primitives?', o: ['equals()', '==', '===', 'compareTo()'], a: 1, t: 'Fundamentals'},
				{q: 'What does synchronized mean in Java?', o: ['optimized code', 'thread-safe', 'imported properly', 'compiled code'], a: 1, t: 'Concurrency'},
				{q: 'Which exception handles file errors?', o: ['FileException', 'IOException', 'ReadException', 'DiskException'], a: 1, t: 'Exception Handling'},
				{q: 'What is an interface in Java?', o: ['user input', 'abstract contract', 'GUI element', 'network protocol'], a: 1, t: 'OOP'},
				{q: 'Which loop executes at least once?', o: ['for', 'while', 'do-while', 'foreach'], a: 2, t: 'Control Flow'},
				{q: 'What does super() do?', o: ['super power', 'parent constructor', 'return value', 'super fast'], a: 1, t: 'OOP'},
				{q: 'How is String concatenation done?', o: ['String s = "a" + "b"', 'String s = "a".add("b")', 'String s = concat("a", "b")', 'String s = "a" & "b"'], a: 0, t: 'Variables & Data Types'},
				{q: 'What is polymorphism?', o: ['many objects', 'many forms', 'many methods', 'many classes'], a: 1, t: 'OOP'},
				{q: 'Which keyword prevents method override?', o: ['static', 'final', 'private', 'protected'], a: 1, t: 'OOP'},
				{q: 'What is try-catch used for?', o: ['timing code', 'exception handling', 'looping', 'declaring variables'], a: 1, t: 'Exception Handling'},
				{q: 'Which method converts string to integer?', o: ['toInt()', 'parseInt()', 'stringToInt()', 'Integer.value()'], a: 1, t: 'Variables & Data Types'}
			],
			JavaScript: [
				{q: 'Which keyword declares a block-scoped variable?', o: ['var', 'let', 'global', 'define'], a: 1, t: 'Variables & Data Types'},
				{q: 'Which method turns JSON text into an object?', o: ['JSON.stringify', 'JSON.parse', 'JSON.object', 'JSON.read'], a: 1, t: 'Modules'},
				{q: 'Which operator checks value and type?', o: ['==', '===', '=', '!='], a: 1, t: 'Fundamentals'},
				{q: 'Which creates an array?', o: ['{}', '[]', '()', '<>'], a: 1, t: 'Data Structures'},
				{q: 'Which function schedules later work?', o: ['setTimeout', 'wait', 'delay', 'pause'], a: 0, t: 'Asynchronous'},
				{q: 'What does DOM stand for?', o: ['Data Object Model', 'Document Object Model', 'Digital Output Map', 'Document Order Method'], a: 1, t: 'DOM & Events'},
				{q: 'Which loops through array values?', o: ['for...of', 'for...in only', 'switch', 'try'], a: 0, t: 'Control Flow'},
				{q: 'Which keyword declares an immutable binding?', o: ['var', 'let', 'const', 'static'], a: 2, t: 'Variables & Data Types'},
				{q: 'Which method adds an item to array end?', o: ['pop', 'push', 'shift', 'slice'], a: 1, t: 'Data Structures'},
				{q: 'Which event fires on button click?', o: ['change', 'click', 'load', 'submit only'], a: 1, t: 'DOM & Events'},
				{q: 'What is a callback function?', o: ['return value', 'function passed as argument', 'loop function', 'initialization'], a: 1, t: 'Functions'},
				{q: 'Which method removes last array element?', o: ['shift', 'pop', 'remove', 'splice'], a: 1, t: 'Data Structures'},
				{q: 'What is a Promise in JavaScript?', o: ['guarantee', 'async operation placeholder', 'variable type', 'callback'], a: 1, t: 'Asynchronous'},
				{q: 'How do you select an element by ID?', o: ['getElement("id")', 'document.getElementById("id")', 'select.id("id")', 'find.byId("id")'], a: 1, t: 'DOM & Events'},
				{q: 'What does map() do on arrays?', o: ['display array', 'transform each element', 'sort array', 'filter array'], a: 1, t: 'Data Structures'},
				{q: 'Which declares a function?', o: ['func myFunc()', 'function myFunc()', 'def myFunc():', 'create myFunc()'], a: 1, t: 'Functions'},
				{q: 'What is destructuring?', o: ['breaking objects', 'unpacking values', 'deleting properties', 'cloning objects'], a: 1, t: 'ES6 Features'},
				{q: 'How is this used in objects?', o: ['global reference', 'current object reference', 'parent reference', 'variable type'], a: 1, t: 'OOP'},
				{q: 'What is async/await used for?', o: ['speed optimization', 'handling async operations', 'error handling', 'variable declaration'], a: 1, t: 'Asynchronous'},
				{q: 'Which method converts object to JSON?', o: ['JSON.parse()', 'JSON.stringify()', 'toJSON()', 'stringifyObject()'], a: 1, t: 'Modules'}
			],
			C: [
				{q: 'Which function is the C entry point?', o: ['start', 'main', 'init', 'program'], a: 1, t: 'Fundamentals'},
				{q: 'Which header provides printf?', o: ['stdlib.h', 'stdio.h', 'string.h', 'math.h'], a: 1, t: 'Modules'},
				{q: 'Which format specifier prints an int?', o: ['%s', '%d', '%f', '%c'], a: 1, t: 'Input & Output'},
				{q: 'Which operator gets an address?', o: ['*', '&', '->', '#'], a: 1, t: 'Pointers'},
				{q: 'Which statement exits a loop?', o: ['skip', 'break', 'return only', 'stop'], a: 1, t: 'Control Flow'},
				{q: 'Which type stores a character?', o: ['char', 'text', 'string', 'letter'], a: 0, t: 'Variables & Data Types'},
				{q: 'Which allocates dynamic memory?', o: ['malloc', 'alloc', 'new', 'create'], a: 0, t: 'Memory Management'},
				{q: 'Which symbol ends a statement?', o: [':', ';', '.', ','], a: 1, t: 'Fundamentals'},
				{q: 'Which loop runs while condition is true?', o: ['while', 'case', 'if', 'switch'], a: 0, t: 'Control Flow'},
				{q: 'Which value indicates a null pointer?', o: ['void', 'NULL', 'none', '-1 always'], a: 1, t: 'Pointers'},
				{q: 'What does sizeof return?', o: ['variable size', 'memory bytes', 'array length', 'string length'], a: 1, t: 'Memory Management'},
				{q: 'Which frees allocated memory?', o: ['release', 'delete', 'free', 'dealloc'], a: 2, t: 'Memory Management'},
				{q: 'What is a pointer?', o: ['arrow symbol', 'memory address', 'comparison', 'function'], a: 1, t: 'Pointers'},
				{q: 'Which includes standard library?', o: ['#import stdio.h', '#include <stdio.h>', '#use stdio.h', '#load stdio.h'], a: 1, t: 'Modules'},
				{q: 'What does & operator do?', o: ['bitwise and', 'address of', 'reference', 'dereference'], a: 1, t: 'Pointers'},
				{q: 'What does * operator do?', o: ['multiply', 'dereference', 'pointer', 'all of above'], a: 2, t: 'Pointers'},
				{q: 'Which reads formatted input?', o: ['printf', 'scanf', 'read', 'input'], a: 1, t: 'Input & Output'},
				{q: 'What is an array in C?', o: ['linked list', 'contiguous memory', 'hash table', 'tree structure'], a: 1, t: 'Data Structures'},
				{q: 'Which declares a structure?', o: ['struct name', 'class name', 'type name', 'record name'], a: 0, t: 'Data Structures'},
				{q: 'What is a string in C?', o: ['char array', 'String type', 'text type', 'data type'], a: 0, t: 'Variables & Data Types'}
			],
			'C++': [
				{q: 'Which feature enables data hiding?', o: ['Encapsulation', 'Compilation', 'Linking', 'Casting'], a: 0, t: 'OOP'},
				{q: 'Which stream prints to console?', o: ['cin', 'cout', 'cerr only', 'print'], a: 1, t: 'Input & Output'},
				{q: 'Which creates an object dynamically?', o: ['malloc only', 'new', 'make', 'create'], a: 1, t: 'Memory Management'},
				{q: 'Which keyword defines a class?', o: ['object', 'class', 'struct only', 'type'], a: 1, t: 'OOP'},
				{q: 'Which destructor prefix is used?', o: ['!', '~', '#', '&'], a: 1, t: 'OOP'},
				{q: 'Which keyword supports inheritance?', o: ['extends', 'inherits', ': public', 'parent'], a: 2, t: 'OOP'},
				{q: 'Which container is a dynamic array?', o: ['vector', 'stack', 'queue', 'set'], a: 0, t: 'Data Structures'},
				{q: 'Which header supports cout?', o: ['<stdio.h>', '<iostream>', '<vector.h>', '<print>'], a: 1, t: 'Modules'},
				{q: 'Which function is a class constructor?', o: ['~Class', 'Class()', 'new Class', 'init()'], a: 1, t: 'OOP'},
				{q: 'Which keyword prevents override?', o: ['static', 'final', 'const', 'private'], a: 1, t: 'OOP'},
				{q: 'What is a template in C++?', o: ['HTML template', 'generic code', 'design pattern', 'string template'], a: 1, t: 'Advanced'},
				{q: 'What is the :: operator?', o: ['scope resolution', 'access modifier', 'comparison', 'concatenation'], a: 0, t: 'Fundamentals'},
				{q: 'Which exception is caught?', o: ['try block errors', 'catch block errors', 'throw block errors', 'all exceptions'], a: 2, t: 'Exception Handling'},
				{q: 'What is virtual function?', o: ['online function', 'polymorphic function', 'temporary function', 'memory function'], a: 1, t: 'OOP'},
				{q: 'Which prevents copying objects?', o: ['private copy constructor', 'delete copy()', 'no copy', 'const copy'], a: 0, t: 'OOP'},
				{q: 'What is operator overloading?', o: ['too many operators', 'redefining operators', 'operator precedence', 'combining operators'], a: 1, t: 'Advanced'},
				{q: 'What is a reference?', o: ['memory location', 'pointer alternative', 'variable alias', 'all of above'], a: 2, t: 'Pointers'},
				{q: 'Which declares a constant variable?', o: ['static const', 'const static', 'constant', 'const int x = 5'], a: 3, t: 'Variables & Data Types'},
				{q: 'What is namespace?', o: ['memory space', 'code organization', 'variable type', 'class type'], a: 1, t: 'Fundamentals'},
				{q: 'Which manages resources automatically?', o: ['garbage collection', 'RAII', 'memory pool', 'stack allocation'], a: 1, t: 'Memory Management'}
			],
			SQL: [
				{q: 'Which statement reads data?', o: ['GET', 'SELECT', 'READ', 'FETCH ALL'], a: 1, t: 'Basic Queries'},
				{q: 'Which clause filters rows?', o: ['WHERE', 'ORDER', 'GROUP', 'FROM'], a: 0, t: 'Filtering'},
				{q: 'Which keyword adds rows?', o: ['INSERT', 'ADD', 'CREATE', 'PUSH'], a: 0, t: 'Data Modification'},
				{q: 'Which command changes existing rows?', o: ['CHANGE', 'UPDATE', 'ALTER', 'MODIFY'], a: 1, t: 'Data Modification'},
				{q: 'Which removes rows?', o: ['DELETE', 'DROP', 'REMOVE', 'CLEAR'], a: 0, t: 'Data Modification'},
				{q: 'Which joins matching tables?', o: ['MERGE', 'JOIN', 'LINK', 'UNION only'], a: 1, t: 'Joins'},
				{q: 'Which function counts rows?', o: ['SUM', 'COUNT', 'TOTAL', 'NUMBER'], a: 1, t: 'Aggregation'},
				{q: 'Which clause groups results?', o: ['GROUP BY', 'ORDER BY', 'HAVING only', 'FROM'], a: 0, t: 'Grouping'},
				{q: 'Which key uniquely identifies a row?', o: ['Foreign key', 'Primary key', 'Index only', 'View'], a: 1, t: 'Constraints'},
				{q: 'Which keyword sorts results?', o: ['SORT', 'ORDER BY', 'RANK', 'ARRANGE'], a: 1, t: 'Ordering'},
				{q: 'What does DISTINCT do?', o: ['unique values', 'clear data', 'delete rows', 'identify rows'], a: 0, t: 'Basic Queries'},
				{q: 'Which clause filters grouped data?', o: ['WHERE', 'HAVING', 'FILTER', 'WHERE GROUP'], a: 1, t: 'Grouping'},
				{q: 'What is a foreign key?', o: ['access key', 'references another table', 'temporary key', 'encryption key'], a: 1, t: 'Constraints'},
				{q: 'Which JOIN returns all rows?', o: ['INNER', 'OUTER', 'FULL OUTER', 'CROSS'], a: 2, t: 'Joins'},
				{q: 'What does an INDEX do?', o: ['organizes data', 'speeds queries', 'prevents duplicates', 'sorts table'], a: 1, t: 'Indexing'},
				{q: 'Which function finds maximum?', o: ['MAXIMUM', 'MAX', 'LARGEST', 'TOP'], a: 1, t: 'Aggregation'},
				{q: 'What is a view in SQL?', o: ['display table', 'virtual table', 'query result', 'all of above'], a: 2, t: 'Views'},
				{q: 'Which creates a new table?', o: ['NEW TABLE', 'CREATE TABLE', 'MAKE TABLE', 'INSERT TABLE'], a: 1, t: 'DDL'},
				{q: 'What does % represent in LIKE?', o: ['modulo', 'any characters', 'single char', 'word boundary'], a: 1, t: 'Filtering'},
				{q: 'Which combines multiple queries?', o: ['MERGE', 'UNION', 'JOIN', 'COMBINE'], a: 1, t: 'Joins'}
			],
			HTML: [
				{q: 'Which tag creates a link?', o: ['<a>', '<link>', '<href>', '<url>'], a: 0, t: 'Basic Tags'},
				{q: 'Which tag is the main page heading?', o: ['<h1>', '<head>', '<title>', '<header>'], a: 0, t: 'Structure'},
				{q: 'Which attribute supplies image text?', o: ['src', 'alt', 'title only', 'href'], a: 1, t: 'Attributes'},
				{q: 'Which tag creates a paragraph?', o: ['<p>', '<para>', '<text>', '<article>'], a: 0, t: 'Text'},
				{q: 'Which tag groups navigation?', o: ['<nav>', '<menu>', '<links>', '<navigate>'], a: 0, t: 'Semantic'},
				{q: 'Which tag creates a form?', o: ['<input>', '<form>', '<fieldset only>', '<data>'], a: 1, t: 'Forms'},
				{q: 'Which tag displays an image?', o: ['<picture only>', '<img>', '<image>', '<src>'], a: 1, t: 'Media'},
				{q: 'Which semantic tag holds primary content?', o: ['<main>', '<body>', '<div>', '<section only>'], a: 0, t: 'Semantic'},
				{q: 'Which tag makes a list item?', o: ['<li>', '<ul>', '<ol>', '<item>'], a: 0, t: 'Lists'},
				{q: 'Which doctype declares HTML5?', o: ['<!HTML>', '<!DOCTYPE html>', '<html5>', '<!doctype web>'], a: 1, t: 'Structure'},
				{q: 'Which tag creates a table row?', o: ['<row>', '<tr>', '<table-row>', '<r>'], a: 1, t: 'Tables'},
				{q: 'Which creates an unordered list?', o: ['<ol>', '<ul>', '<list>', '<li>'], a: 1, t: 'Lists'},
				{q: 'Which tag creates a line break?', o: ['<lb>', '<break>', '<br>', '<line>'], a: 2, t: 'Text'},
				{q: 'What does <strong> indicate?', o: ['strong styling', 'strong importance', 'font size', 'color change'], a: 1, t: 'Text'},
				{q: 'Which tag embeds external content?', o: ['<include>', '<embed>', '<external>', '<src>'], a: 1, t: 'Media'},
				{q: 'What does <meta> provide?', o: ['metadata', 'methods', 'metadata about document', 'both a and c'], a: 3, t: 'Structure'},
				{q: 'Which tag groups sections?', o: ['<group>', '<section>', '<div>', '<container>'], a: 2, t: 'Semantic'},
				{q: 'Which tag creates a button?', o: ['<btn>', '<button>', '<click>', '<action>'], a: 1, t: 'Forms'},
				{q: 'What does <label> do in forms?', o: ['describes input', 'labels elements', 'associates text', 'all of above'], a: 2, t: 'Forms'},
				{q: 'Which tag indicates emphasis?', o: ['<strong>', '<em>', '<b>', '<i>'], a: 1, t: 'Text'}
			],
			CSS: [
				{q: 'Which property changes text color?', o: ['font-color', 'color', 'text-color', 'foreground'], a: 1, t: 'Text'},
				{q: 'Which selector targets a class?', o: ['#name', '.name', 'name()', '@name'], a: 1, t: 'Selectors'},
				{q: 'Which property creates a flex layout?', o: ['display: flex', 'flex: display', 'layout: flex', 'position: flex'], a: 0, t: 'Layout'},
				{q: 'Which unit is relative to root font size?', o: ['px', 'em', 'rem', 'vh'], a: 2, t: 'Units'},
				{q: 'Which property adds inside spacing?', o: ['margin', 'padding', 'gap only', 'border'], a: 1, t: 'Box Model'},
				{q: 'Which pseudo-class targets hover?', o: [':focus', ':hover', '::before', ':active only'], a: 1, t: 'Pseudo-classes'},
				{q: 'Which property rounds corners?', o: ['border-radius', 'corner', 'radius', 'round'], a: 0, t: 'Box Model'},
				{q: 'Which property controls stacking order?', o: ['z-index', 'layer', 'stack', 'order'], a: 0, t: 'Positioning'},
				{q: 'Which media feature supports responsive width?', o: ['@screen', '@media', '@responsive', '@breakpoint'], a: 1, t: 'Responsive'},
				{q: 'Which property centers grid content?', o: ['align-items', 'justify-content', 'place-items', 'all of these only'], a: 2, t: 'Layout'},
				{q: 'What does transform do?', o: ['edit image', 'change element appearance', 'animation', 'filtering'], a: 1, t: 'Effects'},
				{q: 'Which creates a gradient?', o: ['gradient()', 'linear-gradient()', 'background-gradient', 'gradient-color'], a: 1, t: 'Colors'},
				{q: 'What is a CSS variable?', o: ['CSS function', 'custom property', 'default value', 'preset value'], a: 1, t: 'Advanced'},
				{q: 'Which selector targets ID?', o: ['.id', '#id', '[id]', 'id()'], a: 1, t: 'Selectors'},
				{q: 'What does opacity do?', o: ['color change', 'transparency', 'size change', 'visibility'], a: 1, t: 'Effects'},
				{q: 'Which creates animation?', o: ['@animate', '@keyframes', '@animation', '@motion'], a: 1, t: 'Animation'},
				{q: 'What is specificity?', o: ['specific selectors', 'rule priority weight', 'selector type', 'css version'], a: 1, t: 'Selectors'},
				{q: 'Which property positions elements?', o: ['locate', 'position', 'place', 'move'], a: 1, t: 'Positioning'},
				{q: 'What does display:grid create?', o: ['grid system', 'layout system', 'table', 'columns'], a: 1, t: 'Layout'},
				{q: 'Which property adds shadows?', o: ['shadow', 'text-shadow', 'box-shadow', 'all of above'], a: 2, t: 'Effects'}
			]
		};

		function prototypeHash(value) {
			let hash = 2166136261;
			for (let index = 0; index < value.length; index += 1) { hash ^= value.charCodeAt(index); hash = Math.imul(hash, 16777619); }
			return `sb-${(hash >>> 0).toString(16)}`;
		}
		function loadStudentAccounts() {
			try {
				const current = JSON.parse(localStorage.getItem(STUDENT_ACCOUNTS_KEY));
				if (Array.isArray(current)) return current;
				const legacy = JSON.parse(localStorage.getItem(LEGACY_STUDENT_ACCOUNTS_KEY));
				if (Array.isArray(legacy)) { localStorage.setItem(STUDENT_ACCOUNTS_KEY, JSON.stringify(legacy)); return legacy; }
				return [];
			} catch (error) { return []; }
		}
		function saveStudentAccounts(accounts) { try { localStorage.setItem(STUDENT_ACCOUNTS_KEY, JSON.stringify(accounts)); } catch (error) { showToast('Account changes could not be saved in this browser.'); } }
		function loadCompanyAccounts() { try { const accounts = JSON.parse(localStorage.getItem(COMPANY_ACCOUNTS_KEY)); return Array.isArray(accounts) ? accounts : []; } catch (error) { return []; } }
		function saveCompanyAccounts(accounts) { try { localStorage.setItem(COMPANY_ACCOUNTS_KEY, JSON.stringify(accounts)); } catch (error) { showToast('Company account changes could not be saved in this browser.'); } }
		function loadCompanyWorkspaces() { try { const workspaces = JSON.parse(localStorage.getItem(COMPANY_WORKSPACES_KEY)); return workspaces && typeof workspaces === 'object' ? workspaces : {}; } catch (error) { return {}; } }
		function blankCompanyWorkspace(account) { return { companyId: account.id, opportunities: [], applications: [], shortlist: [], interviews: [], messages: [], notifications: [], offers: [], notes: {}, onboarding: { status: 'Pending', completed: false } }; }
		function getCompanyWorkspace(companyId) { const workspaces = loadCompanyWorkspaces(); return workspaces[companyId] || blankCompanyWorkspace({ id: companyId }); }
		function saveCompanyWorkspace(workspace) { const workspaces = loadCompanyWorkspaces(); workspaces[workspace.companyId] = workspace; try { localStorage.setItem(COMPANY_WORKSPACES_KEY, JSON.stringify(workspaces)); } catch (error) { showToast('Company workspace changes could not be saved.'); } }
		function loadInstitutionAccounts() { try { const accounts = JSON.parse(localStorage.getItem(INSTITUTION_ACCOUNTS_KEY)); return Array.isArray(accounts) ? accounts : []; } catch (error) { return []; } }
		function saveInstitutionAccounts(accounts) { try { localStorage.setItem(INSTITUTION_ACCOUNTS_KEY, JSON.stringify(accounts)); } catch (error) { showToast('Institution account changes could not be saved.'); } }
		function loadInstitutionWorkspaces() { try { const workspaces = JSON.parse(localStorage.getItem(INSTITUTION_WORKSPACES_KEY)); return workspaces && typeof workspaces === 'object' ? workspaces : {}; } catch (error) { return {}; } }
		function blankInstitutionWorkspace(account) { return { institutionId: account.id, students: [], programs: [], internships: [], collaborations: [], notifications: [], reports: [], admins: [{ name: account.profile.contactPerson, email: account.email, role: 'Owner', permissions: 'All', status: 'Active' }], settings: { academicYear: '', departments: '', courses: '' }, onboarding: { status: 'Pending', completed: false } }; }
		function getInstitutionWorkspace(institutionId) { const workspaces = loadInstitutionWorkspaces(); return workspaces[institutionId] || blankInstitutionWorkspace({ id: institutionId, email: '', profile: { contactPerson: 'Administrator' } }); }
		function saveInstitutionWorkspace(workspace) { const workspaces = loadInstitutionWorkspaces(); workspaces[workspace.institutionId] = workspace; try { localStorage.setItem(INSTITUTION_WORKSPACES_KEY, JSON.stringify(workspaces)); } catch (error) { showToast('Institution workspace changes could not be saved.'); } }
		function currentStudentSession() { return currentAuthSession(); }
		function currentStudentAccount() { const session = currentStudentSession(); return session ? loadStudentAccounts().find((account) => account.id === session.userId || account.id === session.id) : null; }
		function currentCompanyAccount() { const session = currentStudentSession(); return session && normalizeRole(session.role) === 'company' ? loadCompanyAccounts().find((account) => account.id === session.companyId || account.id === session.id) : null; }
		function currentCompanyWorkspace() { const account = currentCompanyAccount(); return account ? getCompanyWorkspace(account.id) : null; }
		function currentInstitutionAccount() { const session = currentStudentSession(); return session && session.role === 'institution' ? loadInstitutionAccounts().find((account) => account.id === session.institutionId || account.id === session.id) : null; }
		function currentInstitutionWorkspace() { const account = currentInstitutionAccount(); return account ? getInstitutionWorkspace(account.id) : null; }
		function normalizeRole(role) { return role === 'industry' ? 'company' : role; }
		function resolveAccountRole(account) { return normalizeRole((account && account.role) || (currentStudentSession() && currentStudentSession().role) || 'student'); }
		function dashboardRouteForRole(role) { const normalized = normalizeRole(role); return normalized === 'company' ? '/company/dashboard' : normalized === 'institution' ? '/institution/dashboard' : '/student/dashboard'; }
		function clearStudentSession() {
			try { localStorage.removeItem(CURRENT_USER_KEY); } catch (error) { }
			if (state) state.activeRole = null;
		}
		function studentWorkspace() { return { skills: clone(state.skills), gaps: clone(state.gaps), applications: clone(state.applications), assessments: clone(state.assessments || []), preferences: {} }; }
		function newStudentWorkspace() { return { skills: [], gaps: [], applications: [], assessments: [], preferences: {} }; }
		function hydrateStudentAccount(account) {
			if (!account) return;
			const workspace = account.workspace || {};
			state.student = { ...state.student, ...account.profile };
			state.skills = clone(workspace.skills || state.skills);
			state.gaps = clone(workspace.gaps || state.gaps);
			state.applications = clone(workspace.applications || []);
			state.assessments = clone(workspace.assessments || []);
			state.student.preferences = workspace.preferences || {};
			state.activeRole = resolveAccountRole(account);
		}
		function persistCurrentStudentWorkspace() {
			const session = currentStudentSession();
			if (!session) return;
			const accounts = loadStudentAccounts();
			const index = accounts.findIndex((account) => account.id === session.id);
			if (index < 0) return;
			accounts[index].profile = { ...accounts[index].profile, ...state.student };
			accounts[index].fullName = state.student.name;
			accounts[index].email = state.student.email;
			accounts[index].college = state.student.college || '';
			accounts[index].course = state.student.course || '';
			accounts[index].year = state.student.year || '';
			accounts[index].phone = state.student.phone || '';
			accounts[index].workspace = { ...studentWorkspace(), preferences: state.student.preferences || {} };
			saveStudentAccounts(accounts);
			try { localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ id: session.id, email: state.student.email })); } catch (error) { }
		}
		function startStudentSession(account, role = account?.role || 'student') {
			if (!account) return;
			const normalizedRole = normalizeRole(role);
			account.role = normalizedRole;
			persistAuthSession({ id: account.id, userId: account.id, email: account.email, role: normalizedRole, name: account.profile?.name || account.fullName || account.name || 'Student' });
			const accounts = loadStudentAccounts();
			const index = accounts.findIndex((item) => item.id === account.id);
			if (index >= 0) { accounts[index].role = normalizedRole; saveStudentAccounts(accounts); }
			delete state.assessmentSession;
			delete state.assessmentResult;
			hydrateStudentAccount(account);
			saveState();
		}
		function startCompanySession(account) {
			if (!account) return;
			account.role = 'company';
			persistAuthSession({ id: account.id, userId: account.id, companyId: account.id, email: account.email, role: 'company', name: account.profile?.name || account.name || 'Company' });
			state.activeRole = 'company';
			state.company = { ...state.company, ...account.profile, email: account.email };
			saveCompanyAccounts(loadCompanyAccounts().map((item) => item.id === account.id ? account : item));
			saveState();
		}
		function startInstitutionSession(account) {
			if (!account) return;
			account.role = 'institution';
			persistAuthSession({ id: account.id, userId: account.id, institutionId: account.id, email: account.email, role: 'institution', name: account.profile?.name || account.name || 'Institution' });
			state.activeRole = 'institution';
			state.institution = { ...state.institution, ...account.profile, email: account.email };
			saveInstitutionAccounts(loadInstitutionAccounts().map((item) => item.id === account.id ? account : item));
			saveState();
		}
		function isValidEmail(email) { return /^\S+@\S+\.\S+$/.test(email || ''); }

		function clone(value) { return JSON.parse(JSON.stringify(value)); }
		function loadState() {
			try {
				const saved = JSON.parse(localStorage.getItem(STATE_KEY));
				return saved ? { ...clone(defaultState), ...saved, student: { ...defaultState.student, ...saved.student }, company: { ...defaultState.company, ...saved.company }, institution: { ...defaultState.institution, ...saved.institution }, settings: { ...defaultState.settings, ...saved.settings }, ecosystem: { ...defaultState.ecosystem, ...saved.ecosystem, opportunities: saved.ecosystem?.opportunities || [], applications: saved.ecosystem?.applications || [], interviews: saved.ecosystem?.interviews || [], offers: saved.ecosystem?.offers || [], internships: saved.ecosystem?.internships || [], placements: saved.ecosystem?.placements || [], notifications: saved.ecosystem?.notifications || [] } } : clone(defaultState);
			} catch (error) { return clone(defaultState); }
		}
		function ensureEcosystem() {
			const ecosystem = state.ecosystem || (state.ecosystem = clone(defaultState.ecosystem));
			const opportunities = [...(state.opportunities || [])];
			opportunities.forEach((item) => { if (!item.opportunityId) item.opportunityId = item.id || `opp-${prototypeHash(`${item.title}-${item.company}`)}`; if (!ecosystem.opportunities.some((record) => record.opportunityId === item.opportunityId)) ecosystem.opportunities.push(item); });
			(state.applications || []).forEach((item) => { if (!item.applicationId) item.applicationId = item.id || `app-${prototypeHash(`${item.opportunity}-${item.studentId || item.studentName}`)}`; if (!ecosystem.applications.some((record) => record.applicationId === item.applicationId)) ecosystem.applications.push(item); });
			Object.values(loadCompanyWorkspaces()).forEach((workspace) => (workspace.applications || []).forEach((item) => { if (!item.applicationId) item.applicationId = item.id || `app-${prototypeHash(`${item.opportunity}-${item.studentId || item.studentName}`)}`; if (!ecosystem.applications.some((record) => record.applicationId === item.applicationId)) ecosystem.applications.push(item); }));
			state.opportunities = ecosystem.opportunities;
			state.applications = ecosystem.applications;
			return ecosystem;
		}
		function sharedEcosystem() { return ensureEcosystem(); }
		function saveEcosystem() { state.opportunities = state.ecosystem.opportunities; state.applications = state.ecosystem.applications; saveState(); }
		function applicationForId(applicationId) { return sharedEcosystem().applications.find((item) => item.applicationId === applicationId || item.id === applicationId); }
		function studentIdForSession() { return currentStudentSession()?.id || null; }
		function institutionIdForStudent(studentId) { const accounts = loadStudentAccounts(); const student = accounts.find((account) => account.id === studentId || account.studentId === studentId); if (student?.institutionId) return student.institutionId; const institution = loadInstitutionAccounts().find((account) => account.profile?.name?.trim().toLowerCase() === student?.profile?.college?.trim().toLowerCase()); if (institution) { student.institutionId = institution.institutionId || institution.id; student.profile.institutionId = student.institutionId; saveStudentAccounts(accounts); return student.institutionId; } return null; }
		function addEcosystemNotification(targetRole, targetId, text, route = '') { const ecosystem = sharedEcosystem(); ecosystem.notifications.unshift({ id: `notification-${Date.now()}-${Math.random().toString(16).slice(2)}`, targetRole, targetId, text, route, read: false, time: 'Just now' }); saveEcosystem(); }
		function currentEcosystemNotifications() { const session = currentStudentSession(); if (!session) return []; const role = normalizeRole(session.role); const targetId = role === 'company' ? session.companyId || session.id : role === 'institution' ? session.institutionId || session.id : session.id; return sharedEcosystem().notifications.filter((item) => item.targetRole === role && item.targetId === targetId); }
		function saveState() {
			try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch (error) { showToast('Changes could not be saved in this browser.'); }
			persistCurrentStudentWorkspace();
		}
		function notify(text) {
			state.notifications.unshift({ id: `n-${Date.now()}`, text, read: false, time: 'Just now' });
			saveState();
		}
		function roleLabel(role) { return role[0].toUpperCase() + role.slice(1); }
		function personFor(role) { const normalized = role === 'company' ? 'company' : role === 'institution' ? 'institution' : 'student'; return state[normalized === 'company' ? 'company' : normalized === 'institution' ? 'institution' : 'student']; }
		function esc(value) { return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char])); }
		function go(route) { location.hash = route.startsWith('#') ? route : `#${route}`; }
		function opportunityByTitle(title) { return state.opportunities.find((item) => item.title === title); }
		function appFor(title) { const studentId = studentIdForSession(); return sharedEcosystem().applications.find((item) => item.opportunity === title && item.studentId === studentId); }
		function addApplication(title) {
			const opportunity = opportunityByTitle(title);
			if (!opportunity) return showToast('That opportunity is no longer available.');
			if (appFor(title)) return showToast('You have already applied to this opportunity.');
			const applicationId = `application-${Date.now()}`; const application = { applicationId, id: applicationId, opportunityId: opportunity.opportunityId || opportunity.id, opportunity: title, company: opportunity.company, companyId: opportunity.companyId || null, institutionId: institutionIdForStudent(studentIdForSession()), studentId: studentIdForSession(), studentName: state.student.name, status: 'Applied', stage: 'Applied', match: calculateCandidateMatch(opportunity, state.student), applied: new Date().toISOString().slice(0, 10) };
			sharedEcosystem().applications.unshift(application);
			state.applications = sharedEcosystem().applications;
			if (opportunity.companyId) addEcosystemNotification('company', opportunity.companyId, `${state.student.name} applied for ${title}.`, '/company/applications');
			if (application.institutionId) addEcosystemNotification('institution', application.institutionId, `${state.student.name} applied for ${title}.`, '/institution/students');
			notify(`Application submitted for ${title}.`);
			saveEcosystem();
			showToast('Application submitted successfully.');
			renderFunctional();
		}
		function normalizeSkillList(value) { return String(value || '').split(/[,\n]/).map((skill) => skill.trim()).filter(Boolean); }
		function calculateCandidateMatch(opportunity, student = state.student) {
			const required = opportunity.requirements?.required || normalizeSkillList(opportunity.skills);
			if (!required.length) return 0;
			const verified = (state.assessments || []).reduce((map, item) => { map[item.skill.toLowerCase()] = item.score; return map; }, {});
			const profileSkills = (student.skills || []).reduce((map, item) => { map[item.name?.toLowerCase()] = item.score || 0; return map; }, {});
			const matched = required.filter((skill) => (verified[skill.toLowerCase()] ?? profileSkills[skill.toLowerCase()] ?? 0) >= WEAK_THRESHOLD);
			return Math.round((matched.length / required.length) * 100);
		}

		function functionalSidebar(role) {
			const normalizedRole = normalizeRole(role);
			const current = location.hash.slice(1).split('/')[2] || 'dashboard';
			const routes = dashboardRoutes[normalizedRole] || dashboardRoutes.company || {};
			return `<aside class="sidebar" id="sidebar"><div class="side-brand">${brand()}</div><nav class="side-nav">${Object.entries(routes).map(([key, label]) => `<a class="${key === current ? 'active' : ''}" href="#/${normalizedRole}/${key}" onclick="closeSidebar()">${icons[key] || '◉'} ${label}</a>`).join('')}</nav><div class="side-spacer"></div><button class="logout" data-action="logout">↪ &nbsp; Logout</button></aside>`;
		}
		function shell(role, title, content) {
			const normalizedRole = normalizeRole(role);
			const person = personFor(normalizedRole);
			const unread = state.notifications.filter((item) => !item.read).length + currentEcosystemNotifications().filter((item) => !item.read).length;
			return `<div class="app">${functionalSidebar(normalizedRole)}<main class="main"><header class="topbar"><div style="display:flex;align-items:center"><button class="mobile-dash-menu hidden" data-action="toggle-sidebar">☰</button><h2>${esc(title)}</h2></div><div class="topbar-right"><button class="search" data-action="focus-search">⌕ &nbsp; Search anything</button>${themeToggleMarkup()}<button class="notification-button" data-action="notifications" aria-label="Notifications">◌${unread ? `<sup>${unread}</sup>` : ''}</button><div class="avatar">${esc(person.initials)}</div><div class="user-meta">${esc(person.name)}<span>${roleLabel(normalizedRole)}</span></div></div></header><div class="dash-content">${content}</div></main></div>`;
		}
		function pageIntro(title, text, action = '') { return `<div class="dash-intro"><div><h1>${esc(title)}</h1><p>${esc(text)}</p></div>${action}</div>`; }
		function searchBox(placeholder = 'Search this workspace') { return `<input class="page-search" data-action="filter" placeholder="⌕  ${placeholder}" aria-label="${placeholder}">`; }
		function emptyState(text) { return `<div class="empty-state">${esc(text)}</div>`; }
		function assessmentRating(score) { if (score >= 90) return 'Excellent'; if (score >= 80) return 'Advanced'; if (score >= 70) return 'Good'; if (score >= 60) return 'Intermediate'; if (score >= 40) return 'Beginner'; return 'Needs Improvement'; }
		function assessmentStats() { const assessments = state.assessments || []; const average = assessments.length ? Math.round((assessments.reduce((total, item) => total + item.score, 0) / assessments.length) * 10) / 10 : 0; return { assessments, average }; }
		function assessmentHistoryMarkup(limit) { const assessments = state.assessments || []; const items = limit ? assessments.slice(-limit).reverse() : assessments.slice().reverse(); return items.length ? `<div class="assessment-history">${items.map((item) => `<div class="assessment-history-row"><div><strong>${esc(item.skill)}</strong><small>${new Date(item.completedAt).toLocaleDateString()}</small></div><div><b>${item.score}%</b><span class="tag ${item.score >= 70 ? 'success' : 'warning'}">${esc(item.rating)}</span></div></div>`).join('')}</div>` : emptyState('No assessments yet. Choose a skill to begin.'); }
		function studentDashboardPage() {
			const { assessments, average } = assessmentStats();
			return shell('student', 'Student Dashboard', `${pageIntro(state.student.title, 'Build your profile from real assessment results.', '<button class="btn btn-primary" data-action="route" data-route="/student/assessment">＋ Add Skill Assessment</button>')}<section class="dash-panel skill-profile-panel"><div class="panel-head"><div><h3>My Skill Profile</h3><p class="muted">Your scores begin at zero and grow with completed assessments.</p></div></div><div class="kpis assessment-kpis"><div class="kpi"><div class="kpi-top"><span>Skills Assessed</span><span class="kpi-icon">✦</span></div><div class="kpi-value">${assessments.length}</div></div><div class="kpi"><div class="kpi-top"><span>Assessments Completed</span><span class="kpi-icon">✓</span></div><div class="kpi-value">${assessments.length}</div></div><div class="kpi"><div class="kpi-top"><span>Average Score</span><span class="kpi-icon">▥</span></div><div class="kpi-value">${average}%</div></div><div class="kpi"><div class="kpi-top"><span>Skill Readiness</span><span class="kpi-icon">◉</span></div><div class="kpi-value">${average}%</div></div></div></section><div class="dash-grid"><section class="dash-panel"><div class="panel-head"><h3>Assessed Skills</h3><button class="btn-plain" data-action="route" data-route="/student/assessment">Take assessment →</button></div>${assessments.length ? assessments.map((item) => `<div class="skill"><div class="skill-line"><span><b>${esc(item.skill)}</b> <span class="tag ${item.score >= 70 ? 'success' : 'warning'}">${esc(item.rating)}</span></span><span><b>${item.score}%</b> <button class="btn-plain" data-action="retake-assessment" data-skill="${esc(item.skill)}">Retake</button></span></div><div class="bar"><span style="width:${item.score}%"></span></div></div>`).join('') : emptyState('No skills assessed yet.')}</section><section class="dash-panel"><div class="panel-head"><h3>Assessment History</h3><button class="btn-plain" data-action="route" data-route="/student/skills">View all →</button></div>${assessmentHistoryMarkup(4)}</section></div><section class="dash-panel"><div class="panel-head"><h3>Recommended Opportunities</h3><button class="btn-plain" data-action="route" data-route="/student/opportunities">View all opportunities →</button></div>${state.opportunities.slice(0, 3).map(opportunityRow).join('')}</section></div>`);
		}
		function opportunityRow(opportunity) { return `<button class="opportunity opportunity-button" data-action="view-opportunity" data-title="${esc(opportunity.title)}"><span class="opportunity-icon">▣</span><span class="opportunity-info"><strong>${esc(opportunity.title)}</strong><small>${esc(opportunity.company)} · ${esc(opportunity.location)}<br>${esc(opportunity.skills)}</small></span><span class="match">${esc(opportunity.match)}<small style="display:block;color:var(--muted);font-weight:400">match</small></span></button>`; }
		function studentApplicationsPage() { const applications = sharedEcosystem().applications.filter((item) => item.studentId === studentIdForSession()); return shell('student', 'Applications', `${pageIntro('My Applications', 'Track the same application records companies and institutions see.')}${applications.length ? `<div class="dash-panel">${applications.map((item) => `<div class="application-row"><div><b>${esc(item.opportunity)}</b><p>${esc(item.company)} · ${esc(item.applied || '')} · ${item.match || 0}% Prototype Match Score</p></div><div>${companyStatusTag(item.status || item.stage)}${item.status === 'Offer Sent' ? `<button class="btn btn-primary" data-action="student-accept-offer" data-id="${item.applicationId || item.id}">Accept Offer</button>` : ''}</div></div>`).join('')}</div>` : emptyState('No applications yet. Explore opportunities to get started.')}`); }
		function studentInterviewsPage() { const interviews = sharedEcosystem().interviews.filter((item) => item.studentId === studentIdForSession()); return shell('student', 'Interviews', `${pageIntro('Upcoming Interviews', 'Interview schedules shared by companies.')}${interviews.length ? `<div class="dash-panel">${interviews.map((item) => `<div class="application-row"><div><b>${esc(item.opportunity)}</b><p>${esc(item.candidateName)} · ${esc(item.date)} ${esc(item.time || '')}</p></div>${companyStatusTag(item.status)}</div>`).join('')}</div>` : emptyState('No interviews scheduled.')}`); }
		function studentOffersPage() { const offers = sharedEcosystem().offers.filter((item) => item.studentId === studentIdForSession()); return shell('student', 'Offers', `${pageIntro('Offers', 'Review offers connected to your applications.')}${offers.length ? `<div class="dash-panel">${offers.map((item) => `<div class="application-row"><div><b>${esc(item.opportunity)}</b><p>${esc(item.candidateName || state.student.name)}</p></div>${companyStatusTag(item.status)}${item.status === 'Offer Sent' ? `<button class="btn btn-primary" data-action="student-accept-offer" data-id="${item.applicationId}">Accept Offer</button>` : ''}</div>`).join('')}</div>` : emptyState('No offers received yet.')}`); }
		function studentInternshipsPage() { const items = sharedEcosystem().internships.filter((item) => item.studentId === studentIdForSession()); return shell('student', 'Internships', `${pageIntro('My Internships', 'Track active and completed internships.')}${items.length ? `<div class="dash-panel">${items.map((item) => `<div class="application-row"><div><b>${esc(item.title)}</b><p>${esc(item.company)} · ${esc(item.startDate || '')} to ${esc(item.endDate || '')}</p></div>${companyStatusTag(item.status)}</div>`).join('')}</div>` : emptyState('No internships yet.')}`); }
		function studentPlacementsPage() { const items = sharedEcosystem().placements.filter((item) => item.studentId === studentIdForSession()); return shell('student', 'Placements', `${pageIntro('My Placements', 'Track accepted job outcomes.')}${items.length ? `<div class="dash-panel">${items.map((item) => `<div class="application-row"><div><b>${esc(item.role || item.opportunity)}</b><p>${esc(item.company || '')} · Joining ${esc(item.joiningDate || 'To be confirmed')}</p></div>${companyStatusTag(item.status)}</div>`).join('')}</div>` : emptyState('No placements yet.')}`); }
		function studentNotificationsPage() { return shell('student', 'Notifications', `${pageIntro('Notifications', 'Updates from companies and institutions.')}${currentEcosystemNotifications().length ? `<div class="dash-panel">${currentEcosystemNotifications().map((item) => `<div class="notification-row ${item.read ? '' : 'unread'}"><span>${esc(item.text)}<small>${esc(item.time || '')}</small></span><button class="btn-plain" data-action="ecosystem-mark-notification" data-id="${item.id}">Mark read</button></div>`).join('')}</div>` : emptyState('No notifications yet.')}`); }
		function opportunitiesPage(role) {
			const normalizedRole = role === 'company' ? 'company' : role;
			const canManage = normalizedRole === 'company';
			return shell(normalizedRole, 'Opportunities', `${pageIntro('Opportunities', normalizedRole === 'student' ? 'Find a practical next step for your career.' : 'Manage opportunities published by your company.', canManage ? '<button class="btn btn-primary" data-action="route" data-route="/company/post-opportunity">＋ Post Opportunity</button>' : '')}${searchBox('Search title, company, skill, or location')}<div class="dash-panel" style="margin-top:18px"><div id="filtered-results" class="opportunity-list">${state.opportunities.map((item) => `<div class="opportunity-card" data-searchable="${esc(`${item.title} ${item.company} ${item.location} ${item.skills}`)}"><div><span class="tag blue">${esc(item.type)}</span><h3>${esc(item.title)}</h3><p>${esc(item.company)} · ${esc(item.location)} · ${esc(item.duration)}</p><small>${esc(item.skills)} · Deadline ${esc(item.deadline)}</small></div><div class="card-actions"><button class="btn btn-light" data-action="view-opportunity" data-title="${esc(item.title)}">View details</button>${canManage ? `<button class="btn-plain" data-action="delete-opportunity" data-title="${esc(item.title)}">Delete</button>` : `<button class="btn btn-primary" data-action="apply" data-title="${esc(item.title)}">${appFor(item.title) ? 'Applied' : 'Apply'}</button>`}</div></div>`).join('')}</div></div>`);
		}
		function detailModal(opportunity) { return `<div class="modal-backdrop" data-action="close-modal"><div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="opportunity-title" onclick="event.stopPropagation()"><button class="modal-close" data-action="close-modal" aria-label="Close opportunity details">×</button><span class="tag blue">${esc(opportunity.type)}</span><h2 id="opportunity-title">${esc(opportunity.title)}</h2><p>${esc(opportunity.company)} · ${esc(opportunity.location)}</p><p>${esc(opportunity.description)}</p><p><b>Required skills:</b> ${esc(opportunity.skills)}<br><b>Duration:</b> ${esc(opportunity.duration)}<br><b>Eligibility:</b> ${esc(opportunity.eligibility || 'Students with relevant foundational skills')}<br><b>Deadline:</b> ${esc(opportunity.deadline)}</p><button class="btn btn-primary" data-action="apply" data-title="${esc(opportunity.title)}" ${appFor(opportunity.title) ? 'disabled' : ''}>${appFor(opportunity.title) ? 'Already applied' : 'Apply now'}</button></div></div>`; }
		function skillsPage() { const { assessments, average } = assessmentStats(); return shell('student', 'My Skills', `${pageIntro('My Skills', 'Take a language assessment and build a real skill profile.', '<button class="btn btn-primary" data-action="route" data-route="/student/assessment">＋ Add Skill Assessment</button>')}<div class="kpis assessment-kpis"><div class="kpi"><div class="kpi-top"><span>Skills Assessed</span></div><div class="kpi-value">${assessments.length}</div></div><div class="kpi"><div class="kpi-top"><span>Assessments Completed</span></div><div class="kpi-value">${assessments.length}</div></div><div class="kpi"><div class="kpi-top"><span>Average Score</span></div><div class="kpi-value">${average}%</div></div></div><section class="dash-panel"><div class="panel-head"><h3>Assessment History</h3><button class="btn-plain" data-action="route" data-route="/student/assessment">Take another →</button></div>${assessmentHistoryMarkup()}</section>`); }
		function profilePage(role) { const normalizedRole = normalizeRole(role); const person = personFor(normalizedRole); return shell(normalizedRole, dashboardRoutes[normalizedRole].profile, `${pageIntro(dashboardRoutes[normalizedRole].profile, 'Keep your workspace information current.') }<form class="dash-panel editable-form" data-form="profile" data-role="${normalizedRole}"><label>Name</label><input name="name" value="${esc(person.name)}" required><label>Email</label><input name="email" type="email" value="${esc(person.email)}" required><label>${normalizedRole === 'student' ? 'College' : normalizedRole === 'company' ? 'Industry type' : 'Institution type'}</label><input name="details" value="${esc(normalizedRole === 'student' ? person.college : normalizedRole === 'company' ? person.industryType : person.institutionType)}" required><button class="btn btn-primary" type="submit">Save changes</button></form>`); }
		function applicationsPage(role) { const normalizedRole = role === 'company' ? 'company' : role; return shell(normalizedRole, 'Applications', `${pageIntro('Applications', normalizedRole === 'company' ? 'Review candidate applications for your opportunities.' : 'Track every opportunity you have applied for.')}${searchBox('Search applications')}<div class="dash-panel" style="margin-top:18px"><div id="application-results">${state.applications.length ? state.applications.map((item) => `<div class="application-row" data-searchable="${esc(`${item.opportunity} ${item.company} ${item.status}`)}"><div><b>${esc(item.opportunity)}</b><p>${esc(item.company)} · Applied ${esc(item.applied)}</p></div>${normalizedRole === 'company' ? `<select data-action="status" data-id="${item.id}"><option ${item.status === 'Under Review' ? 'selected' : ''}>Under Review</option><option ${item.status === 'Shortlisted' ? 'selected' : ''}>Shortlisted</option><option ${item.status === 'Selected' ? 'selected' : ''}>Selected</option><option ${item.status === 'Rejected' ? 'selected' : ''}>Rejected</option></select>` : `<span class="tag ${item.status === 'Selected' ? 'success' : 'blue'}">${esc(item.status)}</span>`}</div>`).join('') : emptyState('No applications yet. Explore opportunities to get started.')}</div></div>`); }
		function careerPage() { return shell('student', 'Career Path', `${pageIntro('Career Path', 'Explore directions that match your current skills.') }<div class="career-grid">${state.careers.map((career) => `<article class="mini-card"><span class="tag success">${esc(career.match)} match</span><h3>${esc(career.name)}</h3><p>${esc(career.description)}</p><p><b>Focus skills:</b> ${esc(career.skills)}</p><button class="btn btn-light" data-action="route" data-route="/student/skills">Build these skills</button><button class="btn-plain" data-action="route" data-route="/student/opportunities">Find opportunities →</button></article>`).join('')}</div>`); }
		function postOpportunityPage() { return shell('company', 'Post Opportunity', `${pageIntro('Post Opportunity', 'Publish a prototype opportunity for students to discover.') }<form class="dash-panel editable-form" data-form="opportunity"><label>Opportunity title</label><input name="title" required><label>Company</label><input name="company" value="${esc(state.company.name)}" required><label>Location</label><input name="location" required><label>Opportunity type</label><select name="type"><option>Internship</option><option>Full-time</option><option>Part-time</option></select><label>Required skills</label><input name="skills" placeholder="Python · React · Git" required><label>Description</label><textarea name="description" rows="4" required></textarea><label>Duration</label><input name="duration" placeholder="3 months" required><label>Application deadline</label><input name="deadline" type="date" required><button class="btn btn-primary" type="submit">Publish opportunity</button></form>`); }
		function candidatesPage() { return shell('company', 'Candidates', `${pageIntro('Candidates', 'Review student profiles matched to your opportunities.')}${searchBox('Search candidates')}<div class="candidate-grid" style="margin-top:18px" id="candidate-results">${data.candidates.map((candidate) => `<article class="mini-card" data-searchable="${esc(candidate.join(' '))}"><div class="candidate-name"><div class="avatar">${candidate[0].split(' ').map((part) => part[0]).join('')}</div><strong>${esc(candidate[0])}</strong><small>${esc(candidate[1])}</small></div><p><span class="tag success">${esc(candidate[2])} match</span><br>${esc(candidate[3])}<br>${esc(candidate[4])}</p><button class="btn btn-light" data-action="candidate" data-name="${esc(candidate[0])}">View Profile</button></article>`).join('')}</div>`); }
		function analyticsPage(role) { const selected = state.applications.filter((item) => item.status === 'Selected').length; return shell(role, 'Analytics', `${pageIntro('Analytics', 'Prototype metrics update from the current workspace data.')}<div class="kpis"><div class="kpi"><div class="kpi-top"><span>Total Opportunities</span></div><div class="kpi-value">${state.opportunities.length}</div></div><div class="kpi"><div class="kpi-top"><span>Applications</span></div><div class="kpi-value">${state.applications.length}</div></div><div class="kpi"><div class="kpi-top"><span>Shortlisted</span></div><div class="kpi-value">${state.applications.filter((item) => item.status === 'Shortlisted').length}</div></div><div class="kpi"><div class="kpi-top"><span>Selected</span></div><div class="kpi-value">${selected}</div></div></div><section class="dash-panel"><div class="metric-row"><span>Student readiness</span><strong>68%</strong></div><div class="metric-row"><span>Internship participation</span><strong>${Math.min(100, 40 + state.applications.length * 5)}%</strong></div><div class="metric-row"><span>Industry collaboration</span><strong>${state.partnerships.length} active partners</strong></div></section>`); }
		function institutionSkillsPage() { return shell('institution', 'Student Skills', `${pageIntro('Student Skills', 'Monitor readiness and the most common skill gaps.')}${searchBox('Search student skills')}<div class="dash-panel" style="margin-top:18px">${state.gaps.concat(state.skills.map((skill) => ({ name: skill.name, score: skill.score, target: 80 }))).map((item) => `<div class="skill" data-searchable="${esc(item.name)}"><div class="skill-line"><b>${esc(item.name)}</b><span>${item.score}%</span></div><div class="bar"><span style="width:${item.score}%;background:var(--cyan)"></span></div></div>`).join('')}</div>`); }
		function partnershipsPage() { return shell('institution', 'Partnerships', `${pageIntro('Partnerships', 'Build and maintain industry connections.', '<button class="btn btn-primary" data-action="add-partnership">＋ Add partnership</button>')}<div class="dash-panel" style="margin-top:18px" id="partnership-results">${state.partnerships.map((item) => `<div class="application-row"><div><b>${esc(item.name)}</b><p>${esc(item.type)} · ${esc(item.status)}</p></div><button class="btn-plain" data-action="remove-partnership" data-id="${item.id}">Remove</button></div>`).join('')}</div>`); }
		function programsPage() { return shell('company', 'Industry Programs', `${pageIntro('Industry Programs', 'Explore ways to connect industry and academia.') }<div class="collab-grid">${['Guest Lectures', 'Live Industry Projects', 'Workshops', 'Mentorship', 'Faculty Collaboration'].map((name) => `<article class="mini-card"><h3>${name}</h3><p>Connect with academic talent and create meaningful outcomes.</p><button class="btn btn-light" data-action="join-program" data-name="${name}">Explore / Join</button></article>`).join('')}</div>`); }
		function settingsPage(role) { return shell(role, 'Settings', `${pageIntro('Settings', 'Manage your prototype workspace preferences.') }<form class="dash-panel editable-form" data-form="settings"><label><input type="checkbox" name="emailUpdates" ${state.settings.emailUpdates ? 'checked' : ''}> Email updates</label><label><input type="checkbox" name="profileVisibility" ${state.settings.profileVisibility ? 'checked' : ''}> Make my profile visible to matches</label><label><input type="checkbox" name="compactView" ${state.settings.compactView ? 'checked' : ''}> Use compact workspace view</label><button class="btn btn-primary" type="submit">Save settings</button><button class="btn btn-light" type="button" data-action="logout">Log out</button></form>`); }
		function markNotification(id, button) { const notification = state.notifications.find((item) => item.id === id); if (notification) notification.read = true; saveState(); button.closest('.notification-row')?.remove(); }
		function notificationPanel() { return `<div class="modal-backdrop" onclick="this.remove()"><div class="modal-card notification-panel" onclick="event.stopPropagation()"><button class="modal-close" onclick="this.closest('.modal-backdrop').remove()">×</button><h2>Notifications</h2>${state.notifications.length ? state.notifications.map((item) => `<div class="notification-row ${item.read ? '' : 'unread'}"><span>${esc(item.text)}<small>${esc(item.time)}</small></span>${item.read ? '' : `<button class="btn-plain" onclick="markNotification('${item.id}', this)">Mark read</button>`}</div>`).join('') : emptyState('You are all caught up.')}</div></div>`; }
		function institutionDashboardPage() { return shell('institution', 'Institution Dashboard', `${pageIntro(state.institution.title, state.institution.subtitle, '<span class="tag blue">Prototype workspace</span>')}<div class="kpis"><div class="kpi"><div class="kpi-top"><span>Total Students</span></div><div class="kpi-value">2,450</div></div><div class="kpi"><div class="kpi-top"><span>Assessed Students</span></div><div class="kpi-value">1,980</div></div><div class="kpi"><div class="kpi-top"><span>Internship Ready</span></div><div class="kpi-value">68%</div></div><div class="kpi"><div class="kpi-top"><span>Placement Ready</span></div><div class="kpi-value">61%</div></div></div><div class="dash-grid"><section class="dash-panel"><div class="panel-head"><h3>Top Student Skill Gaps</h3><button class="btn-plain" data-action="route" data-route="/institution/skills">View details →</button></div>${state.gaps.map((gap) => `<div class="skill"><div class="skill-line"><span>${esc(gap.name)}</span><span>${gap.score}%</span></div><div class="bar"><span style="width:${gap.score}%;background:var(--cyan)"></span></div></div>`).join('')}</section><section class="dash-panel"><div class="panel-head"><h3>Industry Collaboration</h3><button class="btn-plain" data-action="route" data-route="/institution/partnerships">Manage Partnerships →</button></div><div class="metric-row"><span>Active Industry Partners</span><strong>${state.partnerships.length}</strong></div><div class="metric-row"><span>Live Projects</span><strong>18</strong></div><div class="metric-row"><span>Workshops This Year</span><strong>27</strong></div></section></div>`); }
		function industryDashboardPage() { return shell('company', 'Industry Dashboard', `${pageIntro(state.company.title, state.company.subtitle, '<span class="tag blue">Prototype workspace</span>')}<div class="kpis"><div class="kpi"><div class="kpi-top"><span>Active Opportunities</span></div><div class="kpi-value">${state.opportunities.length}</div><div class="kpi-note">${state.opportunities.length} published</div></div><div class="kpi"><div class="kpi-top"><span>Applications</span></div><div class="kpi-value">${state.applications.length}</div><div class="kpi-note">Live prototype data</div></div><div class="kpi"><div class="kpi-top"><span>Shortlisted</span></div><div class="kpi-value">${state.applications.filter((item) => item.status === 'Shortlisted').length}</div></div><div class="kpi"><div class="kpi-top"><span>Selected</span></div><div class="kpi-value">${state.applications.filter((item) => item.status === 'Selected').length}</div></div></div><div class="action-grid"><button class="action" data-action="route" data-route="/company/post-opportunity">＋ Post Opportunity</button><button class="action" data-action="route" data-route="/company/candidates">♙ View Candidates</button><button class="action" data-action="route" data-route="/company/applications">▤ Manage Applications</button><button class="action" data-action="route" data-route="/company/programs">◈ Industry Programs</button></div><section class="dash-panel"><div class="panel-head"><h3>Active Opportunities</h3><button class="btn-plain" data-action="route" data-route="/company/opportunities">Manage all →</button></div>${state.opportunities.slice(0, 3).map((item) => `<div class="application-row"><div><b>${esc(item.title)}</b><p>${esc(item.company)} · ${esc(item.location)}</p></div><button class="btn-plain" data-action="view-opportunity" data-title="${esc(item.title)}">View →</button></div>`).join('')}</section>`); }
		function companyWorkspaceOrEmpty() { const account = currentCompanyAccount(); const workspace = currentCompanyWorkspace() || { companyId: account?.id || '', opportunities: [], applications: [], shortlist: [], interviews: [], messages: [], notifications: [], offers: [], notes: {}, onboarding: { status: 'Pending', completed: false } }; const ecosystem = sharedEcosystem(); const ownOpportunities = ecosystem.opportunities.filter((item) => item.companyId === account?.id); const ownApplications = ecosystem.applications.filter((item) => item.companyId === account?.id); return { ...workspace, opportunities: [...workspace.opportunities.filter((item) => !ownOpportunities.some((record) => record.opportunityId === item.opportunityId)), ...ownOpportunities], applications: ownApplications }; }
		function companyStatusTag(status) { return `<span class="tag ${['Published', 'Shortlisted', 'Interview', 'Selected', 'Offer Sent', 'Accepted', 'Verified'].includes(status) ? 'success' : status === 'Rejected' || status === 'Closed' ? 'warning' : 'blue'}">${esc(status)}</span>`; }
		function companyDashboardPage() {
			const workspace = companyWorkspaceOrEmpty();
			const active = workspace.opportunities.filter((item) => item.status === 'Published').length;
			const shortlisted = workspace.applications.filter((item) => item.stage === 'Shortlisted' || item.status === 'Shortlisted').length;
			const interviews = workspace.interviews.filter((item) => item.status !== 'Cancelled').length;
			const offers = workspace.offers.filter((item) => item.status !== 'Cancelled').length;
			const hires = workspace.applications.filter((item) => item.stage === 'Accepted' || item.status === 'Accepted').length;
			return shell('company', 'Company Dashboard', `${pageIntro(`Good morning, ${state.company.name || 'Company'}`, 'Your recruitment command center.', '<button class="btn btn-primary" data-action="route" data-route="/company/post-opportunity">＋ Post Opportunity</button>')}<div class="kpis">${[['Active Opportunities', active, '/company/opportunities'], ['Applications Received', workspace.applications.length, '/company/applications'], ['Candidates Shortlisted', shortlisted, '/company/shortlist'], ['Interviews Scheduled', interviews, '/company/interviews'], ['Offers Made', offers, '/company/applications'], ['Hires / Selections', hires, '/company/applications']].map(([label, value, route]) => `<button class="kpi" data-action="route" data-route="${route}"><div class="kpi-top"><span>${label}</span><span class="kpi-icon">◉</span></div><div class="kpi-value">${value}</div><div class="kpi-note">Open workspace →</div></button>`).join('')}</div><div class="dash-grid"><section class="dash-panel"><div class="panel-head"><h3>Recent Applications</h3><button class="btn-plain" data-action="route" data-route="/company/applications">View all →</button></div>${workspace.applications.length ? workspace.applications.slice(0, 5).map((item) => `<div class="application-row"><div><b>${esc(item.studentName || 'Student candidate')}</b><p>${esc(item.opportunity)} · ${esc(item.applied || '')}</p></div><div>${companyStatusTag(item.stage || item.status)}<br><small>${item.match || 0}% match</small></div></div>`).join('') : emptyState('No applications received yet. Publish an opportunity to start recruiting.')}</section><section class="dash-panel"><div class="panel-head"><h3>Recruitment Activity</h3><button class="btn-plain" data-action="route" data-route="/company/analytics">View analytics →</button></div>${workspace.notifications.length ? workspace.notifications.slice(0, 5).map((item) => `<div class="metric-row"><span>${esc(item.text)}</span><small>${esc(item.time || '')}</small></div>`).join('') : emptyState('Recruitment activity will appear here.')}</section></div>`);
		}
		function companyProfilePage() { const account = currentCompanyAccount(); const profile = account?.profile || state.company; const workspace = companyWorkspaceOrEmpty(); return shell('company', 'Company Profile', `${pageIntro('Company Profile', 'Manage the profile students and candidates see.', '<button class="btn btn-light" data-action="company-preview-profile">Preview Public Profile</button>')}<form class="dash-panel editable-form" data-form="company-profile"><label>Company Name</label><input name="name" value="${esc(profile.name)}" required><label>Official Email</label><input name="email" type="email" value="${esc(profile.email || account?.email)}" required><label>About Company</label><textarea name="description" rows="4" placeholder="Tell candidates what your company does.">${esc(profile.description || '')}</textarea><label>Industry / Company Type</label><input name="industryType" value="${esc(profile.industryType || '')}" required><label>Website</label><input name="website" type="url" value="${esc(profile.website || '')}" placeholder="https://example.com"><label>Location</label><input name="location" value="${esc(profile.location || '')}"><label>Company Size</label><input name="size" value="${esc(profile.size || '')}" placeholder="11-50 employees"><label>Contact Person</label><input name="contactPerson" value="${esc(profile.contactPerson || '')}"><label>Designation</label><input name="designation" value="${esc(profile.designation || '')}"><div class="metric-row"><span>Verification status</span>${companyStatusTag(workspace.onboarding?.status || 'Pending')}</div><button class="btn btn-primary" type="submit">Save Changes</button></form>`); }
		function companyOpportunitiesPage() { const workspace = companyWorkspaceOrEmpty(); const items = workspace.opportunities; return shell('company', 'Opportunities', `${pageIntro('Manage Opportunities', 'Create and manage your internships, jobs, and projects.', '<button class="btn btn-primary" data-action="route" data-route="/company/post-opportunity">＋ Create Opportunity</button>')}${items.length ? `<div class="dash-panel">${items.map((item) => `<div class="opportunity-card"><div><span class="tag blue">${esc(item.type)}</span><h3>${esc(item.title)}</h3><p>${esc(item.location || 'Location flexible')} · ${esc(item.openings || 1)} openings · ${esc(item.deadline || 'No deadline')}</p><small>${companyStatusTag(item.status)} · ${item.applicationCount || 0} applications</small></div><div class="card-actions"><button class="btn btn-light" data-action="company-opportunity-details" data-id="${item.id}">View Details</button>${item.status === 'Draft' ? `<button class="btn btn-primary" data-action="company-publish-opportunity" data-id="${item.id}">Publish</button>` : `<button class="btn btn-light" data-action="company-close-opportunity" data-id="${item.id}">Close</button>`}</div></div>`).join('')}</div>` : emptyState('No opportunities yet. Create your first internship or job.')}`); }
		function companyOpportunityFormPage() { return shell('company', 'Create Opportunity', `${pageIntro('Create Internship, Job, or Project', 'Define a clear opportunity and structured skill requirements.') }<form class="dash-panel editable-form" data-form="company-opportunity"><label>Opportunity Title *</label><input name="title" required><label>Type *</label><select name="type" required><option value="">Select type</option><option>Internship</option><option>Full-time Job</option><option>Apprenticeship</option><option>Live Project</option><option>Part-time</option></select><label>Department</label><input name="department"><label>Location</label><input name="location"><label>Work Mode</label><select name="mode"><option>On-site</option><option>Hybrid</option><option>Remote</option></select><label>Description *</label><textarea name="description" rows="4" required></textarea><label>Responsibilities</label><textarea name="responsibilities" rows="3"></textarea><label>Eligibility / Education</label><input name="eligibility" placeholder="B.Tech, BCA, or equivalent"><label>Year of Study</label><input name="year" placeholder="2nd, 3rd, or 4th year"><label>Required Skills * (comma separated)</label><input name="requiredSkills" placeholder="HTML, CSS, JavaScript, React, Git" required><label>Preferred Skills</label><input name="preferredSkills" placeholder="TypeScript, Figma"><label>Minimum Skill Level</label><select name="minimumLevel"><option>Beginner</option><option selected>Intermediate</option><option>Advanced</option></select><label>Experience</label><input name="experience" placeholder="No prior experience required"><label>Stipend / Salary</label><input name="compensation"><label>Duration</label><input name="duration" placeholder="3 months"><label>Application Deadline</label><input name="deadline" type="date"><label>Number of Openings</label><input name="openings" type="number" min="1" value="1"><div class="form-row"><button class="btn btn-light" type="submit" name="saveMode" value="draft">Save Draft</button><button class="btn btn-primary" type="submit" name="saveMode" value="publish">Publish Opportunity</button></div></form>`); }
		function companyCandidatesPage() { const accounts = loadStudentAccounts(); const workspace = companyWorkspaceOrEmpty(); const query = location.hash.includes('?') ? decodeURIComponent(location.hash.split('?')[1].replace('q=', '')) : ''; const candidates = accounts.length ? accounts : [{ id: 'demo-candidate', profile: { name: 'Demo Student', email: 'demo@student.skillaura', college: 'ABC Institute of Technology', course: 'B.Tech Computer Science', year: '3rd Year' }, workspace: { skills: state.skills, assessments: state.assessments } }]; return shell('company', 'Find Candidates', `${pageIntro('Candidate Discovery', 'Search students by verified skills and readiness.')}${searchBox('Search skill, college, course, or name')}<div class="candidate-grid" style="margin-top:18px">${candidates.filter((account) => { const profile = account.profile || {}; const haystack = `${profile.name || account.fullName || ''} ${profile.college || ''} ${profile.course || ''} ${(account.workspace?.skills || []).map((item) => item.name).join(' ')}`.toLowerCase(); return !query || haystack.includes(query.toLowerCase()); }).map((account) => { const profile = account.profile || account; const skills = account.workspace?.skills || []; const match = workspace.opportunities[0] ? calculateCandidateMatch(workspace.opportunities[0], { ...profile, skills }) : 0; return `<article class="mini-card" data-searchable="${esc(`${profile.name || account.fullName || ''} ${profile.college || ''} ${profile.course || ''} ${skills.map((item) => item.name).join(' ')}`)}"><div class="candidate-name"><div class="avatar">${esc((profile.initials || profile.name || 'S').slice(0, 2).toUpperCase())}</div><strong>${esc(profile.name || account.fullName || 'Student')}</strong><small>${esc(profile.college || profile.course || 'Student')}</small></div><p><span class="tag success">${match}% match</span><br>${skills.length ? esc(skills.map((item) => `${item.name} ${item.score}%`).join(' · ')) : 'No verified skills yet.'}</p><div class="card-actions"><button class="btn btn-light" data-action="company-view-candidate" data-id="${account.id}">View Profile</button><button class="btn btn-primary" data-action="company-shortlist-candidate" data-id="${account.id}">Shortlist</button><button class="btn-plain" data-action="company-compare-candidate" data-id="${account.id}">Compare</button></div></article>`; }).join('') || emptyState('No matching candidates found.')}</div>`); }
		function companyApplicationsPage() { const workspace = companyWorkspaceOrEmpty(); return shell('company', 'Applications', `${pageIntro('Applications', 'Review candidates across your company opportunities.')}${workspace.applications.length ? `<div class="dash-panel">${workspace.applications.map((item) => `<div class="application-row"><div><b>${esc(item.studentName || 'Student candidate')}</b><p>${esc(item.opportunity)} · ${esc(item.applied || '')} · ${item.match || 0}% skill match</p></div><div class="card-actions">${companyStatusTag(item.stage || item.status)}<button class="btn btn-light" data-action="company-advance-application" data-id="${item.id}">Advance</button><button class="btn btn-primary" data-action="company-shortlist-application" data-id="${item.id}">Shortlist</button>${item.stage === 'Interview' ? `<button class="btn btn-light" data-action="company-select-candidate" data-id="${item.id}">Select Candidate</button>` : ''}${item.stage === 'Selected' ? `<button class="btn btn-light" data-action="company-send-offer" data-id="${item.id}">Send Offer</button>` : ''}</div></div>`).join('')}</div>` : emptyState('No applications received yet.')}`); }
		function companyShortlistPage() { const workspace = companyWorkspaceOrEmpty(); const selected = workspace.applications.filter((item) => item.stage === 'Shortlisted' || workspace.shortlist.includes(item.studentId)); return shell('company', 'Shortlist', `${pageIntro('Shortlisted Candidates', 'Move promising candidates into screening and interviews.')}${selected.length ? `<div class="dash-panel">${selected.map((item) => `<div class="application-row"><div><b>${esc(item.studentName || 'Student')}</b><p>${esc(item.opportunity)} · ${item.match || 0}% match</p></div><div>${companyStatusTag(item.stage || 'Shortlisted')}<button class="btn btn-light" data-action="company-schedule-interview" data-id="${item.id}">Schedule Interview</button></div></div>`).join('')}</div>` : emptyState('No shortlisted candidates yet.')}`); }
		function companyInterviewsPage() { const workspace = companyWorkspaceOrEmpty(); return shell('company', 'Interviews', `${pageIntro('Interview Management', 'Schedule and track candidate interviews.', '<button class="btn btn-primary" data-action="company-schedule-interview">＋ Schedule Interview</button>')}${workspace.interviews.length ? `<div class="dash-panel">${workspace.interviews.map((item) => `<div class="application-row"><div><b>${esc(item.candidateName)}</b><p>${esc(item.opportunity)} · ${esc(item.date)} ${esc(item.time || '')}</p></div><div>${companyStatusTag(item.status)}<button class="btn btn-light" data-action="company-interview-passed" data-id="${item.id}">Mark Passed</button></div></div>`).join('')}</div>` : emptyState('No interviews scheduled.')}`); }
		function companyMessagesPage() { const workspace = companyWorkspaceOrEmpty(); return shell('company', 'Messages', `${pageIntro('Messages', 'Keep candidate conversations in one place.')}${workspace.messages.length ? `<div class="dash-panel">${workspace.messages.map((item) => `<div class="application-row"><div><b>${esc(item.candidateName)}</b><p>${esc(item.text)}</p></div><small>${esc(item.time || '')}</small></div>`).join('')}</div>` : emptyState('No candidate conversations yet.')}`); }
		function companyAnalyticsPage() { const workspace = companyWorkspaceOrEmpty(); if (!workspace.opportunities.length && !workspace.applications.length) return shell('company', 'Analytics', `${pageIntro('Recruitment Analytics', 'Measure activity across your company workspace.')}${emptyState('Recruitment analytics will appear after your first opportunity receives activity.')}`); const shortlisted = workspace.applications.filter((item) => item.stage === 'Shortlisted').length; const interviews = workspace.interviews.length; const selected = workspace.applications.filter((item) => ['Selected', 'Accepted'].includes(item.stage)).length; const average = workspace.applications.length ? Math.round(workspace.applications.reduce((sum, item) => sum + (item.match || 0), 0) / workspace.applications.length) : 0; return shell('company', 'Analytics', `${pageIntro('Recruitment Analytics', 'Metrics calculated from your stored opportunities and applications.')}<div class="kpis"><div class="kpi"><div class="kpi-top"><span>Applications</span></div><div class="kpi-value">${workspace.applications.length}</div></div><div class="kpi"><div class="kpi-top"><span>Shortlist Rate</span></div><div class="kpi-value">${workspace.applications.length ? Math.round(shortlisted / workspace.applications.length * 100) : 0}%</div></div><div class="kpi"><div class="kpi-top"><span>Interview Rate</span></div><div class="kpi-value">${workspace.applications.length ? Math.round(interviews / workspace.applications.length * 100) : 0}%</div></div><div class="kpi"><div class="kpi-top"><span>Average Skill Match</span></div><div class="kpi-value">${average}%</div></div></div><section class="dash-panel"><div class="metric-row"><span>Selections</span><strong>${selected}</strong></div><div class="metric-row"><span>Published opportunities</span><strong>${workspace.opportunities.filter((item) => item.status === 'Published').length}</strong></div><button class="btn btn-light" data-action="company-export-analytics">Export Report</button></section>`); }
		function companyNotificationsPage() { const workspace = companyWorkspaceOrEmpty(); return shell('company', 'Notifications', `${pageIntro('Notifications', 'Updates from your recruitment workspace.')}${workspace.notifications.length ? `<div class="dash-panel">${workspace.notifications.map((item) => `<div class="notification-row ${item.read ? '' : 'unread'}"><span>${esc(item.text)}<small>${esc(item.time || '')}</small></span><button class="btn-plain" data-action="company-mark-notification" data-id="${item.id}">Mark read</button></div>`).join('')}</div>` : emptyState('No notifications yet.')}`); }
		function institutionWorkspaceOrEmpty() { return currentInstitutionWorkspace() || { institutionId: '', students: [], programs: [], internships: [], collaborations: [], notifications: [], reports: [], admins: [], settings: {}, onboarding: { status: 'Pending', completed: false } }; }
		function institutionStudents() { const workspace = institutionWorkspaceOrEmpty(); const account = currentInstitutionAccount(); const institutionName = account?.profile?.name || state.institution.name; const linked = loadStudentAccounts().filter((student) => student.profile?.college === institutionName); return [...workspace.students, ...linked.filter((student) => !workspace.students.some((item) => item.studentId === student.id)).map((student) => ({ studentId: student.id, ...student.profile, workspace: student.workspace || {} }))]; }
		function institutionStudentStats() { const students = institutionStudents(); const assessed = students.filter((student) => (student.workspace?.assessments || student.assessments || []).length); const verified = students.filter((student) => (student.workspace?.skills || student.skills || []).some((skill) => skill.status === 'Verified' || (skill.score || 0) >= WEAK_THRESHOLD)); return { students, assessed, verified }; }
		function institutionApplications() { const account = currentInstitutionAccount(); const students = institutionStudents(); const studentIds = new Set(students.map((student) => student.studentId || student.id)); return sharedEcosystem().applications.filter((item) => item.institutionId === account?.id || studentIds.has(item.studentId)); }
		function institutionDashboardPage() { const workspace = institutionWorkspaceOrEmpty(); const { students, assessed, verified } = institutionStudentStats(); const applications = institutionApplications(); const activeInternships = workspace.internships.filter((item) => item.status === 'Active').length; const placed = sharedEcosystem().placements.filter((item) => item.institutionId === workspace.institutionId).length; const collaborations = workspace.collaborations.filter((item) => item.status !== 'Closed').length; return shell('institution', 'Institution Dashboard', `${pageIntro(`Good morning, ${state.institution.name || 'Institution'}`, 'Turn student skills into measurable industry readiness.', '<button class="btn btn-primary" data-action="route" data-route="/institution/students">＋ Manage Students</button>')}<div class="kpis">${[['Total Students', students.length, '/institution/students'], ['Students Assessed', assessed.length, '/institution/assessments'], ['Verified Skills', verified.length, '/institution/skills'], ['Active Applications', applications.filter((item) => !['Rejected', 'Accepted'].includes(item.status)).length, '/institution/placements'], ['Students Shortlisted', applications.filter((item) => item.status === 'Shortlisted').length, '/institution/placements'], ['Active Internships', activeInternships, '/institution/internships'], ['Students Placed', placed, '/institution/placements'], ['Collaborations', collaborations, '/institution/partnerships']].map(([label, value, route]) => `<button class="kpi" data-action="route" data-route="${route}"><div class="kpi-top"><span>${label}</span><span class="kpi-icon">◉</span></div><div class="kpi-value">${value}</div><div class="kpi-note">Open section →</div></button>`).join('')}</div><div class="dash-grid"><section class="dash-panel"><div class="panel-head"><h3>Skill Demand Summary</h3><button class="btn-plain" data-action="route" data-route="/institution/skill-gaps">View gaps →</button></div>${workspace.opportunities?.length ? workspace.opportunities.map((item) => `<div class="metric-row"><span>${esc(item.skill)}</span><strong>${item.count}</strong></div>`).join('') : emptyState('Skill analytics will appear after students are added.')}</section><section class="dash-panel"><div class="panel-head"><h3>Pending Actions</h3><button class="btn-plain" data-action="route" data-route="/institution/notifications">View all →</button></div>${workspace.notifications.length ? workspace.notifications.slice(0, 5).map((item) => `<div class="metric-row"><span>${esc(item.text)}</span><small>${esc(item.time || '')}</small></div>`).join('') : emptyState('No pending actions.')}</section></div>`); }
		function institutionProfilePage() { const account = currentInstitutionAccount(); const profile = account?.profile || state.institution; const workspace = institutionWorkspaceOrEmpty(); return shell('institution', 'Institution Profile', `${pageIntro('Institution Profile', 'Manage the profile students and industry partners see.', '<button class="btn btn-light" data-action="institution-preview-profile">Preview Public Profile</button>')}<form class="dash-panel editable-form" data-form="institution-profile"><label>Institution Name</label><input name="name" value="${esc(profile.name)}" required><label>Official Email</label><input name="email" type="email" value="${esc(profile.email || account?.email)}" required><label>About Institution</label><textarea name="description" rows="4">${esc(profile.description || '')}</textarea><label>Institution Type</label><input name="institutionType" value="${esc(profile.institutionType || '')}" required><label>Affiliation / University</label><input name="affiliation" value="${esc(profile.affiliation || '')}"><label>Website</label><input name="website" type="url" value="${esc(profile.website || '')}"><label>Location</label><input name="location" value="${esc(profile.location || '')}"><label>Departments</label><input name="departments" value="${esc(profile.departments || '')}" placeholder="CSE, ECE, Management"><label>Courses / Programs</label><input name="courses" value="${esc(profile.courses || '')}"><div class="metric-row"><span>Verification status</span>${companyStatusTag(workspace.onboarding?.status || 'Pending')}</div><button class="btn btn-primary" type="submit">Save Changes</button></form>`); }
		function institutionStudentsPage() { const { students } = institutionStudentStats(); return shell('institution', 'Students', `${pageIntro('Student Management', 'Manage institutional student records and readiness.', '<button class="btn btn-primary" data-action="institution-add-student">＋ Add Student</button>')}<div class="form-row"><input class="page-search" data-action="filter" placeholder="⌕ Search students" aria-label="Search students"><button class="btn btn-light" data-action="institution-download-template">Download Template</button><button class="btn btn-light" data-action="institution-import-demo">Import Records</button></div><div class="dash-panel" style="margin-top:18px">${students.length ? students.map((student) => { const skills = student.workspace?.skills || student.skills || []; const assessments = student.workspace?.assessments || student.assessments || []; return `<div class="application-row" data-searchable="${esc(`${student.name || ''} ${student.email || ''} ${student.course || ''} ${student.department || ''}`)}"><div><b>${esc(student.name || 'Student')}</b><p>${esc(student.studentId || student.id || '')} · ${esc(student.course || 'Course not set')} · ${esc(student.year || '')}</p></div><div><small>${assessments.length ? 'Assessed' : 'Pending assessment'} · ${skills.length} skills</small><br><button class="btn-plain" data-action="institution-view-student" data-id="${student.studentId || student.id}">View Profile</button></div></div>`; }).join('') : emptyState('No students added yet. Add students or import your student list to begin.')}</div>`); }
		function institutionAssessmentsPage() { const { students, assessed } = institutionStudentStats(); const pending = students.length - assessed.length; const allAssessments = assessed.flatMap((student) => student.workspace?.assessments || student.assessments || []); const average = allAssessments.length ? Math.round(allAssessments.reduce((sum, item) => sum + item.score, 0) / allAssessments.length) : 0; return shell('institution', 'Assessments', `${pageIntro('Assessment Monitoring', 'Monitor completion and verified assessment outcomes.')}<div class="kpis"><div class="kpi"><div class="kpi-top"><span>Students Assessed</span></div><div class="kpi-value">${assessed.length}</div></div><div class="kpi"><div class="kpi-top"><span>Students Pending</span></div><div class="kpi-value">${pending}</div></div><div class="kpi"><div class="kpi-top"><span>Assessments Completed</span></div><div class="kpi-value">${allAssessments.length}</div></div><div class="kpi"><div class="kpi-top"><span>Average Score</span></div><div class="kpi-value">${average}%</div></div></div>${allAssessments.length ? `<section class="dash-panel"><div class="panel-head"><h3>Recent Results</h3></div>${allAssessments.map((item) => `<div class="metric-row"><span>${esc(item.skill)}</span><strong>${item.score}% · ${esc(item.rating || 'Assessed')}</strong></div>`).join('')}</section>` : emptyState('No assessments completed yet.')}`); }
		function institutionSkillsAnalyticsPage() { const { students } = institutionStudentStats(); const skills = students.flatMap((student) => student.workspace?.skills || student.skills || []); const grouped = skills.reduce((map, skill) => { const key = skill.name || 'Unknown'; map[key] = map[key] || []; map[key].push(skill.score || 0); return map; }, {}); return shell('institution', 'Skill Analytics', `${pageIntro('Institution Skill Analytics', 'Understand real verified skill signals across your students.', '<button class="btn btn-light" data-action="institution-export-report" data-report="skills">Export Report</button>')}${Object.keys(grouped).length ? `<section class="dash-panel">${Object.entries(grouped).map(([name, scores]) => { const average = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length); return `<div class="skill"><div class="skill-line"><b>${esc(name)}</b><span>${average}% · ${scores.length} students</span></div><div class="bar"><span style="width:${average}%;background:var(--cyan)"></span></div></div>`; }).join('')}</section>` : emptyState('No student skill data yet. Add students or wait for assessments to appear.')}`); }
		function institutionSkillGapsPage() { const { students } = institutionStudentStats(); const opportunities = state.opportunities.filter((item) => item.companyId || item.status === 'Published'); const required = [...new Set(opportunities.flatMap((item) => item.requirements?.required || normalizeSkillList(item.skills)))]; const skills = students.flatMap((student) => student.workspace?.skills || student.skills || []).map((skill) => skill.name?.toLowerCase()); const missing = required.filter((skill) => !skills.includes(skill.toLowerCase())); return shell('institution', 'Skill Gaps', `${pageIntro('Skill Gap Analysis', 'Compare student skills with current company opportunity requirements.', '<button class="btn btn-light" data-action="institution-export-report" data-report="gaps">Export Gap Report</button>')}${required.length ? `<section class="dash-panel"><div class="panel-head"><h3>Industry Required Skills</h3></div>${required.map((skill) => `<div class="metric-row"><span>${esc(skill)}</span>${missing.includes(skill) ? '<span class="tag warning">Needs development</span>' : '<span class="tag success">Present in student data</span>'}</div>`).join('')}</section><section class="dash-panel"><h3>Recommended Development Focus</h3>${missing.length ? `<p>${esc(missing.join(', '))}</p><button class="btn btn-primary" data-action="route" data-route="/institution/learning">Create Development Plan</button>` : emptyState('No common gaps detected from current opportunity requirements.')}</section>` : emptyState('No company opportunity requirements are available yet.')}`); }
		function institutionLearningPage() { const { students } = institutionStudentStats(); const missing = students.length ? ['React', 'SQL', 'Communication'].filter((skill) => !students.some((student) => (student.workspace?.skills || student.skills || []).some((item) => item.name === skill && item.score >= WEAK_THRESHOLD))) : []; return shell('institution', 'Learning', `${pageIntro('Learning & Skill Development', 'Turn identified skill gaps into trackable development plans.', '<button class="btn btn-primary" data-action="institution-assign-program">＋ Assign Program</button>')}${missing.length ? `<div class="collab-grid">${missing.map((skill) => `<article class="mini-card"><span class="tag warning">Gap-driven</span><h3>${esc(skill)} Development</h3><p>Recommended because current verified student data is below the readiness threshold.</p><button class="btn btn-light" data-action="institution-assign-program" data-skill="${esc(skill)}">Assign to Students</button></article>`).join('')}</div>` : emptyState('No learning recommendations yet. Recommendations will follow identified skill gaps.')}`); }
		function institutionInternshipsPage() { const workspace = institutionWorkspaceOrEmpty(); const opportunities = state.opportunities.filter((item) => item.status === 'Published' || item.companyId); return shell('institution', 'Internships', `${pageIntro('Internship Management', 'Discover opportunities and track student participation.', '<button class="btn btn-light" data-action="route" data-route="/institution/industry">View Opportunities</button>')}${workspace.internships.length ? `<div class="dash-panel">${workspace.internships.map((item) => `<div class="application-row"><div><b>${esc(item.title)}</b><p>${esc(item.company)} · ${esc(item.studentName || 'Student')}</p></div>${companyStatusTag(item.status)}<button class="btn-plain" data-action="institution-mark-internship" data-id="${item.id}">Mark Completed</button></div>`).join('')}</div>` : emptyState(opportunities.length ? 'No active internships tracked yet. Recommend an opportunity to a student.' : 'No active internships yet.')}`); }
		function institutionPlacementsPage() { const placed = institutionApplications().filter((item) => ['Selected', 'Offer Sent', 'Accepted'].includes(item.stage || item.status)); return shell('institution', 'Placements', `${pageIntro('Placement Management', 'Track recruitment outcomes from connected company workspaces.')}${placed.length ? `<div class="dash-panel">${placed.map((item) => `<div class="application-row"><div><b>${esc(item.studentName || 'Student')}</b><p>${esc(item.opportunity)} · ${esc(item.company || 'Company')} · ${item.match || 0}% match</p></div>${companyStatusTag(item.stage || item.status)}<button class="btn-plain" data-action="institution-record-placement" data-id="${item.applicationId || item.id}">Record Placement</button></div>`).join('')}</div>` : emptyState('No placement activity yet.')}`); }
		function institutionIndustryPage() { const opportunities = state.opportunities.filter((item) => item.status === 'Published' || item.companyId); return shell('institution', 'Industry Opportunities', `${pageIntro('Industry Opportunity Discovery', 'Find company opportunities aligned with student skills.')}${opportunities.length ? `<div class="dash-panel">${opportunities.map((item) => `<div class="opportunity-card"><div><span class="tag blue">${esc(item.type)}</span><h3>${esc(item.title)}</h3><p>${esc(item.company)} · ${esc(item.location || 'Flexible')}</p><small>${esc(item.requirements?.required?.join(', ') || item.skills || '')}</small></div><button class="btn btn-primary" data-action="institution-recommend-opportunity" data-id="${item.id}">Recommend to Students</button></div>`).join('')}</div>` : emptyState('No industry opportunities available yet.')}`); }
		function institutionFacultyPage() { return shell('institution', 'Faculty Opportunities', `${pageIntro('Faculty Opportunities', 'Track faculty development and industry learning opportunities.')}${emptyState('No faculty opportunities available yet. Connect with an industry partner to begin.')}`); }
		function institutionPartnershipsPage() { const workspace = institutionWorkspaceOrEmpty(); return shell('institution', 'Collaborations', `${pageIntro('Industry Collaboration', 'Connect students and faculty with meaningful industry programs.', '<button class="btn btn-primary" data-action="institution-create-collaboration">＋ Create Collaboration</button>')}${workspace.collaborations.length ? `<div class="dash-panel">${workspace.collaborations.map((item) => `<div class="application-row"><div><b>${esc(item.name)}</b><p>${esc(item.type)} · ${esc(item.date || '')}</p></div>${companyStatusTag(item.status)}<button class="btn-plain" data-action="institution-close-collaboration" data-id="${item.id}">Close</button></div>`).join('')}</div>` : emptyState('No industry collaborations yet.')}`); }
		function institutionReportsPage() { return shell('institution', 'Reports & Analytics', `${pageIntro('Reports', 'Generate transparent reports from institutional activity.', '<button class="btn btn-primary" data-action="institution-export-report" data-report="summary">Export Report</button>')}<div class="collab-grid">${['Student Skill Report', 'Assessment Report', 'Skill Gap Report', 'Internship Report', 'Placement Report', 'Industry Collaboration Report'].map((name) => `<article class="mini-card"><h3>${name}</h3><p>Calculated from the current institution workspace.</p><button class="btn btn-light" data-action="institution-export-report" data-report="${esc(name)}">Generate Report</button></article>`).join('')}</div>`); }
		function institutionAnalyticsPage() { const { students, assessed, verified } = institutionStudentStats(); const workspace = institutionWorkspaceOrEmpty(); const internshipParticipation = students.length ? Math.round(workspace.internships.length / students.length * 100) : 0; const placementRate = students.length ? Math.round(workspace.internships.filter((item) => item.status === 'Placed').length / students.length * 100) : 0; return shell('institution', 'Analytics', `${pageIntro('Institution Analytics', 'Transparent metrics calculated from current student and outcome data.', '<button class="btn btn-light" data-action="institution-export-report" data-report="analytics">Export Analytics</button>')}<div class="kpis"><div class="kpi"><div class="kpi-top"><span>Assessment Completion</span></div><div class="kpi-value">${students.length ? Math.round(assessed.length / students.length * 100) : 0}%</div></div><div class="kpi"><div class="kpi-top"><span>Skill Verification Rate</span></div><div class="kpi-value">${students.length ? Math.round(verified.length / students.length * 100) : 0}%</div></div><div class="kpi"><div class="kpi-top"><span>Internship Participation</span></div><div class="kpi-value">${internshipParticipation}%</div></div><div class="kpi"><div class="kpi-top"><span>Placement Rate</span></div><div class="kpi-value">${placementRate}%</div></div></div>${students.length ? `<section class="dash-panel"><div class="metric-row"><span>Students</span><strong>${students.length}</strong></div><div class="metric-row"><span>Assessed students</span><strong>${assessed.length}</strong></div><div class="metric-row"><span>Active collaborations</span><strong>${workspace.collaborations.filter((item) => item.status !== 'Closed').length}</strong></div></section>` : emptyState('Analytics will appear as your institution generates activity.')}`); }
		function institutionStudentsPage() { const { students } = institutionStudentStats(); return shell('institution', 'Students', `${pageIntro('Student Management', 'Manage institutional student records and shared application progress.', '<button class="btn btn-primary" data-action="institution-add-student">＋ Add Student</button>')}<div class="form-row"><input class="page-search" data-action="filter" placeholder="⌕ Search students" aria-label="Search students"><button class="btn btn-light" data-action="institution-download-template">Download Template</button><button class="btn btn-light" data-action="institution-import-demo">Import Records</button></div><div class="dash-panel" style="margin-top:18px">${students.length ? students.map((student) => { const skills = student.workspace?.skills || student.skills || []; const assessments = student.workspace?.assessments || student.assessments || []; const applications = institutionApplications().filter((item) => item.studentId === (student.studentId || student.id)); return `<div class="application-row" data-searchable="${esc(`${student.name || ''} ${student.email || ''} ${student.course || ''} ${student.department || ''}`)}"><div><b>${esc(student.name || 'Student')}</b><p>${esc(student.studentId || student.id || '')} · ${esc(student.course || 'Course not set')} · ${esc(student.year || '')}</p></div><div><small>${assessments.length ? 'Assessed' : 'Pending assessment'} · ${skills.length} skills · ${applications.length} applications</small>${applications.length ? `<p>${applications.map((item) => `${esc(item.opportunity)} · ${esc(item.status)}`).join('<br>')}</p>` : ''}<button class="btn-plain" data-action="institution-view-student" data-id="${student.studentId || student.id}">View Profile</button></div></div>`; }).join('') : emptyState('No students added yet. Add students or import your student list to begin.')}</div>`); }
		function institutionNotificationsPage() { const workspace = institutionWorkspaceOrEmpty(); return shell('institution', 'Notifications', `${pageIntro('Notifications', 'Updates from your institution workspace.')}${workspace.notifications.length ? `<div class="dash-panel">${workspace.notifications.map((item) => `<div class="notification-row ${item.read ? '' : 'unread'}"><span>${esc(item.text)}<small>${esc(item.time || '')}</small></span><button class="btn-plain" data-action="institution-mark-notification" data-id="${item.id}">Mark read</button></div>`).join('')}</div>` : emptyState('No notifications yet.')}`); }
		function institutionSettingsPage() { const workspace = institutionWorkspaceOrEmpty(); return shell('institution', 'Settings', `${pageIntro('Institution Settings', 'Manage academic and notification preferences.')}<form class="dash-panel editable-form" data-form="institution-settings"><label>Academic Year</label><input name="academicYear" value="${esc(workspace.settings?.academicYear || '')}" placeholder="2026-27"><label>Departments</label><input name="departments" value="${esc(workspace.settings?.departments || '')}" placeholder="CSE, ECE, Management"><label>Courses</label><input name="courses" value="${esc(workspace.settings?.courses || '')}" placeholder="B.Tech, MBA, BCA"><label><input type="checkbox" name="notifications" ${workspace.settings?.notifications !== false ? 'checked' : ''}> Enable institution notifications</label><button class="btn btn-primary" type="submit">Save Settings</button><button class="btn btn-light" type="button" data-action="institution-reset-settings">Reset Settings</button></form>`); }
		function authInput(label, name, options = {}) {
			const { type = 'text', placeholder = '', autocomplete = '', optional = false } = options;
			const visibility = type === 'password' ? `<button class="password-toggle" type="button" data-action="toggle-password" data-target="${name}" aria-label="Show ${label}" aria-pressed="false">Show</button>` : '';
			return `<div class="auth-field"><label for="${name}">${label}${optional ? ' <span>(optional)</span>' : ' <b aria-hidden="true">*</b>'}</label><div class="input-wrap"><input id="${name}" name="${name}" type="${type}" placeholder="${placeholder}" autocomplete="${autocomplete}" ${optional ? '' : 'required'}>${visibility}</div></div>`;
		}
		function authPage(type) {
			const register = type === 'register';
			const loginFields = `${authInput('Email', 'email', { type: 'email', placeholder: 'you@example.com', autocomplete: 'email' })}${authInput('Password', 'password', { type: 'password', autocomplete: 'current-password' })}`;
			const registerFields = `${authInput('Full Name', 'name', { placeholder: 'Your full name', autocomplete: 'name' })}${authInput('Email', 'email', { type: 'email', placeholder: 'you@example.com', autocomplete: 'email' })}${authInput('Password', 'password', { type: 'password', autocomplete: 'new-password' })}${authInput('Confirm Password', 'confirmPassword', { type: 'password', autocomplete: 'new-password' })}${authInput('College / University', 'college', { placeholder: 'Your institution', autocomplete: 'organization' })}${authInput('Course', 'course', { placeholder: 'e.g. B.Tech Computer Science' })}<div class="auth-field"><label for="year">Year of Study <b aria-hidden="true">*</b></label><select id="year" name="year" required><option value="">Select your year</option><option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option><option>Graduate</option></select></div>${authInput('Phone Number', 'phone', { type: 'tel', placeholder: '+91 98765 43210', autocomplete: 'tel', optional: true })}`;
			return `<div class="auth"><aside class="auth-aside">${brand()}<div><div class="eyebrow" style="color:#5bd1d5">Connecting Skills, Academia &amp; Industry</div><h1>${register ? 'Start building your bridge.' : 'Your next opportunity starts here.'}</h1><p>${register ? 'Create your student account and shape a profile that opens the right doors.' : 'Sign in to your personal SkillAura workspace.'}</p></div><div class="auth-note">Frontend prototype · account data stays in this browser</div></aside><main class="auth-main"><div class="form-wrap"><a class="btn-plain" href="#/">← Back to home</a><h2 style="margin-top:27px">${register ? 'Create your student account' : 'Student login'}</h2><p>${register ? 'Fields marked * are required.' : 'Use the email and password you registered with.'}</p><form class="form" data-form="${register ? 'register' : 'login'}" novalidate>${register ? registerFields : loginFields}${register ? '<button class="btn btn-primary" type="submit">Create Account</button>' : '<div class="form-row"><label><input type="checkbox" name="remember"> Remember me</label><button class="btn-plain" type="button" data-action="forgot">Forgot password?</button></div><button class="btn btn-primary" type="submit">Login</button><div class="divider">or continue as demo</div><div class="demo-grid"><button class="demo-btn" type="button" data-demo="student">Demo Student</button><button class="demo-btn" type="button" data-demo="industry">Demo Industry</button><button class="demo-btn" type="button" data-demo="institution">Demo Institution</button></div>'}</form>${register ? '<div class="switch">Already have an account? <a href="#/login">Login</a></div>' : '<div class="switch">New to SkillAura? <a href="#/register">Create Account</a></div>'}</div></main></div>`;
		}
		function companyAuthPage(type) {
			const register = type === 'register';
			const fields = register ? `${authInput('Company Name', 'name', { placeholder: 'Your company name' })}${authInput('Official Email', 'email', { type: 'email', placeholder: 'talent@example.com' })}${authInput('Password', 'password', { type: 'password', autocomplete: 'new-password' })}${authInput('Confirm Password', 'confirmPassword', { type: 'password', autocomplete: 'new-password' })}${authInput('Industry / Company Type', 'industryType', { placeholder: 'Software & Technology' })}${authInput('Company Website', 'website', { type: 'url', placeholder: 'https://example.com', optional: true })}${authInput('Company Size', 'size', { placeholder: '11-50 employees' })}${authInput('Location', 'location', { placeholder: 'City, Country' })}${authInput('Contact Person', 'contactPerson', { placeholder: 'Full name' })}${authInput('Designation', 'designation', { placeholder: 'Recruiter / HR Lead' })}${authInput('Phone Number', 'phone', { type: 'tel', placeholder: '+91 98765 43210' })}` : `${authInput('Official Email', 'email', { type: 'email', placeholder: 'talent@example.com' })}${authInput('Password', 'password', { type: 'password', autocomplete: 'current-password' })}`;
			return `<div class="auth"><aside class="auth-aside">${brand()}<div><div class="eyebrow" style="color:#5bd1d5">Company workspace</div><h1>${register ? 'Build your hiring bridge.' : 'Welcome back, employer.'}</h1><p>${register ? 'Create a company workspace for skill-based recruitment.' : 'Sign in to manage opportunities, candidates, and hiring activity.'}</p></div><div class="auth-note">Frontend prototype · company data stays in this browser</div></aside><main class="auth-main"><div class="form-wrap"><a class="btn-plain" href="#/">← Back to home</a><h2 style="margin-top:27px">${register ? 'Create Company Account' : 'Company Login'}</h2><p>${register ? 'Fields marked * are required.' : 'Use your official company email.'}</p><form class="form" data-form="company-${register ? 'register' : 'login'}" novalidate>${fields}<button class="btn btn-primary" type="submit">${register ? 'Create Company Account' : 'Login'}</button>${register ? '' : '<div class="form-row"><button class="btn-plain" type="button" data-action="forgot">Forgot Password?</button></div>'}</form><div class="switch">${register ? 'Already have an account?' : 'Need a company account?'} <a href="#/company/${register ? 'login' : 'register'}">${register ? 'Login' : 'Create Company Account'}</a></div></div></main></div>`;
		}
		function companyOnboardingPage() { const account = currentCompanyAccount(); const workspace = companyWorkspaceOrEmpty(); return `<div class="auth"><aside class="auth-aside">${brand()}<div><div class="eyebrow" style="color:#5bd1d5">Company onboarding</div><h1>Make your company credible.</h1><p>Add the details students need before they apply.</p></div><div class="auth-note">Verification is simulated in this prototype.</div></aside><main class="auth-main"><div class="form-wrap"><h2>Company Verification &amp; Onboarding</h2><p>Status: ${companyStatusTag(workspace.onboarding?.status || 'Pending')}</p><form class="form" data-form="company-onboarding">${authInput('Company Description', 'description', { placeholder: 'What does your company build?', optional: true })}${authInput('Logo URL', 'logo', { type: 'url', placeholder: 'https://example.com/logo.png', optional: true })}${authInput('Recruitment Preferences', 'preferences', { placeholder: 'Skills, roles, or campuses you recruit from', optional: true })}<button class="btn btn-primary" type="submit">Submit for Verification</button><button class="btn btn-light" type="button" data-action="skip-company-onboarding">Skip Optional Details</button><button class="btn-plain" type="button" data-action="route" data-route="/company/profile">Edit Company Profile</button></form></div></main></div>`; }
		function institutionAuthPage(type) { const register = type === 'register'; const fields = register ? `${authInput('Institution Name', 'name', { placeholder: 'Your college or university' })}${authInput('Official Institution Email', 'email', { type: 'email', placeholder: 'admin@example.edu' })}${authInput('Password', 'password', { type: 'password', autocomplete: 'new-password' })}${authInput('Confirm Password', 'confirmPassword', { type: 'password', autocomplete: 'new-password' })}${authInput('Institution Type', 'institutionType', { placeholder: 'Engineering College / University' })}${authInput('Affiliation / University', 'affiliation', { placeholder: 'Affiliated university' })}${authInput('Accreditation', 'accreditation', { placeholder: 'Optional accreditation information', optional: true })}${authInput('Website', 'website', { type: 'url', placeholder: 'https://example.edu', optional: true })}${authInput('Location', 'location', { placeholder: 'City, Country' })}${authInput('Contact Person', 'contactPerson', { placeholder: 'Administrator name' })}${authInput('Designation', 'designation', { placeholder: 'Placement Officer / Dean' })}${authInput('Phone Number', 'phone', { type: 'tel', placeholder: '+91 98765 43210' })}` : `${authInput('Official Institution Email', 'email', { type: 'email', placeholder: 'admin@example.edu' })}${authInput('Password', 'password', { type: 'password', autocomplete: 'current-password' })}`; return `<div class="auth"><aside class="auth-aside">${brand()}<div><div class="eyebrow" style="color:#5bd1d5">Institution workspace</div><h1>${register ? 'Turn student potential into outcomes.' : 'Welcome back, institution.'}</h1><p>${register ? 'Create a college workspace for skills, internships, and placement readiness.' : 'Sign in to monitor your institution ecosystem.'}</p></div><div class="auth-note">Frontend prototype · institution data stays in this browser</div></aside><main class="auth-main"><div class="form-wrap"><a class="btn-plain" href="#/">← Back to home</a><h2 style="margin-top:27px">${register ? 'Create Institution Account' : 'Institution Login'}</h2><p>${register ? 'Fields marked * are required.' : 'Use your official institution email.'}</p><form class="form" data-form="institution-${register ? 'register' : 'login'}" novalidate>${fields}<button class="btn btn-primary" type="submit">${register ? 'Create Institution Account' : 'Login'}</button>${register ? '' : '<div class="form-row"><button class="btn-plain" type="button" data-action="forgot">Forgot Password?</button></div>'}</form><div class="switch">${register ? 'Already have an account?' : 'Need an institution account?'} <a href="#/institution/${register ? 'login' : 'register'}">${register ? 'Login' : 'Create Institution Account'}</a></div></div></main></div>`; }
		function institutionOnboardingPage() { const workspace = institutionWorkspaceOrEmpty(); return `<div class="auth"><aside class="auth-aside">${brand()}<div><div class="eyebrow" style="color:#5bd1d5">Institution onboarding</div><h1>Make your institution visible.</h1><p>Add the academic context that helps SkillAura connect readiness to opportunity.</p></div><div class="auth-note">Verification is simulated in this prototype.</div></aside><main class="auth-main"><div class="form-wrap"><h2>Institution Verification &amp; Onboarding</h2><p>Status: ${companyStatusTag(workspace.onboarding?.status || 'Pending')}</p><form class="form" data-form="institution-onboarding">${authInput('Institution Description', 'description', { placeholder: 'Tell students and partners about your institution.', optional: true })}${authInput('Logo URL', 'logo', { type: 'url', placeholder: 'https://example.edu/logo.png', optional: true })}${authInput('Departments', 'departments', { placeholder: 'CSE, ECE, Management', optional: true })}${authInput('Courses / Programs', 'courses', { placeholder: 'B.Tech, MBA, BCA', optional: true })}${authInput('Academic Year', 'academicYear', { placeholder: '2026-27', optional: true })}<button class="btn btn-primary" type="submit">Submit for Verification</button><button class="btn btn-light" type="button" data-action="skip-institution-onboarding">Skip Optional Details</button><button class="btn-plain" type="button" data-action="route" data-route="/institution/profile">Edit Institution Profile</button></form></div></main></div>`; }
		function onboardingPage() { return `<div class="auth"><aside class="auth-aside">${brand()}<div><div class="eyebrow" style="color:#5bd1d5">Student onboarding</div><h1>Make your profile yours.</h1><p>These optional preferences help SkillAura present more relevant opportunities.</p></div><div class="auth-note">You can update these choices later from your profile.</div></aside><main class="auth-main"><div class="form-wrap"><h2>What are you working toward?</h2><p>Complete what is useful now, or skip straight to your dashboard.</p><form class="form" data-form="onboarding">${authInput('Career interests', 'interests', { placeholder: 'e.g. Product design, data, web development', optional: true })}${authInput('Desired job roles', 'roles', { placeholder: 'e.g. Frontend Developer', optional: true })}${authInput('Technical skills', 'technicalSkills', { placeholder: 'e.g. HTML, CSS, JavaScript', optional: true })}${authInput('Soft skills', 'softSkills', { placeholder: 'e.g. Communication, teamwork', optional: true })}${authInput('Preferred industries', 'industries', { placeholder: 'e.g. Technology, finance', optional: true })}<div class="auth-field"><label for="opportunityType">Preferred opportunity type <span>(optional)</span></label><select id="opportunityType" name="opportunityType"><option value="">No preference</option><option>Internship</option><option>Part-time</option><option>Full-time</option></select></div>${authInput('Location preference', 'location', { placeholder: 'e.g. Bengaluru or Remote', optional: true })}<button class="btn btn-primary" type="submit">Save and continue →</button><button class="btn btn-light" type="button" data-action="skip-onboarding">Skip for now</button></form></div></main></div>`; }
		function recoveryPage(reset = false) { return `<div class="auth"><aside class="auth-aside">${brand()}<div><div class="eyebrow" style="color:#5bd1d5">Password recovery</div><h1>${reset ? 'Choose a new password.' : 'Get back to your workspace.'}</h1><p>This is a frontend prototype; no email is sent from this page.</p></div><div class="auth-note">Prototype-only account recovery</div></aside><main class="auth-main"><div class="form-wrap"><a class="btn-plain" href="#/login">← Back to login</a><h2 style="margin-top:27px">${reset ? 'Reset your password' : 'Password recovery'}</h2><p>${reset ? 'Set a new password for the verified prototype account.' : 'Enter your registered email to begin a simulated reset.'}</p><form class="form" data-form="${reset ? 'reset-password' : 'recovery'}">${reset ? `${authInput('New Password', 'password', { type: 'password', autocomplete: 'new-password' })}${authInput('Confirm New Password', 'confirmPassword', { type: 'password', autocomplete: 'new-password' })}<button class="btn btn-primary" type="submit">Update Password</button>` : `${authInput('Email', 'email', { type: 'email', placeholder: 'you@example.com', autocomplete: 'email' })}<button class="btn btn-primary" type="submit">Send Reset Link</button>`}</form></div></main></div>`; }
		const WEAK_THRESHOLD = 60;
		const CAREER_SKILLS = {
			'Frontend Developer': ['HTML/CSS', 'CSS', 'JavaScript', 'React'],
			'Backend Developer': ['Python', 'Java', 'SQL', 'C++'],
			'Full Stack Developer': ['JavaScript', 'Python', 'SQL', 'React'],
			'Python Developer': ['Python', 'SQL', 'Data Structures'],
			'Java Developer': ['Java', 'SQL', 'C++'],
			'Data Analyst': ['SQL', 'Python', 'Data Structures'],
			'Data Scientist': ['Python', 'SQL', 'Data Structures'],
			'Software Developer': ['C', 'C++', 'Java', 'Python']
		};
		function calculateTopicBreakdown(skill, answers) {
			const questions = ASSESSMENT_QUESTIONS[skill];
			const topics = {};
			questions.forEach((q, index) => {
				if (!topics[q.t]) topics[q.t] = { correct: 0, total: 0 };
				topics[q.t].total += 1;
				if (answers[index] === q.a) topics[q.t].correct += 1;
			});
			return Object.entries(topics).map(([name, data]) => ({
				name,
				score: Math.round((data.correct / data.total) * 100),
				correct: data.correct,
				total: data.total
			})).sort((a, b) => a.score - b.score);
		}
		function getWeakAreas(breakdown) {
			return breakdown.filter(t => t.score < WEAK_THRESHOLD);
		}
		function getStrongAreas(breakdown) {
			return breakdown.filter(t => t.score >= WEAK_THRESHOLD);
		}
		function assessmentPage() {
			const result = state.assessmentResult;
			if (result) {
				const weakAreas = getWeakAreas(result.topicBreakdown || []);
				const strongAreas = getStrongAreas(result.topicBreakdown || []);
				return shell('student', 'Assessment Result', `${pageIntro('Assessment Complete!', `${result.skill} assessment submitted.`)}<section class="dash-panel assessment-result"><span class="tag success">${esc(result.rating)}</span><h2>${esc(result.skill)}</h2><div class="assessment-score">${result.score}%</div><p><b>Correct:</b> ${result.correct} / ${result.total}<br><b>Incorrect:</b> ${result.total - result.correct} / ${result.total}<br><b>Skill rating:</b> ${esc(result.rating)}<br><b>Status:</b> ✓ SkillAura Verified</p></section><section class="dash-panel"><div class="panel-head"><h3>Topic Breakdown</h3></div>${(result.topicBreakdown || []).map((topic) => `<div class="skill"><div class="skill-line"><span>${esc(topic.name)}</span><span>${topic.score}%</span></div><div class="bar"><span style="width:${topic.score}%"></span></div></div>`).join('')}</section>${weakAreas.length ? `<section class="dash-panel"><div class="panel-head"><h3>Weak Areas (Below ${WEAK_THRESHOLD}%)</h3></div><div>${weakAreas.map(t => `<div style="padding:10px 0;border-bottom:1px solid var(--line)"><strong>${esc(t.name)}</strong><br><small>${t.correct}/${t.total} correct (${t.score}%)</small></div>`).join('')}</div></section>` : ''}<section class="dash-panel"><div class="card-actions"><button class="btn btn-primary" data-action="route" data-route="/student/skill-profile">View Skill Profile</button><button class="btn btn-light" data-action="route" data-route="/student/assessment">Take Another Assessment</button></div></section>`);
			}
			const session = state.assessmentSession;
			if (!session) return shell('student', 'Skill Assessment', `${pageIntro('Choose a Skill', 'Select a skill to assess. Each assessment has 20 language-specific questions.')}<section class="dash-panel"><div class="assessment-skill-grid">${Object.keys(ASSESSMENT_QUESTIONS).map((skill) => {
				const completed = state.assessments.find(a => a.skill === skill);
				return `<button class="assessment-skill" data-action="select-assessment" data-skill="${skill}" style="opacity:1"><div style="font-size:24px;margin-bottom:8px">✦</div><strong>${skill}</strong><small>20 Questions</small>${completed ? `<div style="font-size:12px;margin-top:8px;color:var(--green)">✓ ${completed.score}%</div>` : '<div style="font-size:12px;margin-top:8px">Not attempted</div>'}</button>`;
			}).join('')}</div></section>`);
			const questions = ASSESSMENT_QUESTIONS[session.skill];
			const question = questions[session.index];
			return shell('student', `${session.skill} Assessment`, `${pageIntro(`${session.skill} Skill Assessment`, `Question ${session.index + 1} of ${questions.length}`)}<section class="dash-panel assessment-question"><div class="assessment-progress"><span style="width:${((session.index + 1) / questions.length) * 100}%"></span></div><div style="text-align:center;color:var(--muted);margin-bottom:16px;font-size:14px">${Math.round(((session.index + 1) / questions.length) * 100)}% Complete</div><h3>${esc(question.q)}</h3><div class="assessment-options">${question.o.map((option, index) => `<label class="assessment-option"><input type="radio" name="assessment-answer" value="${index}" ${session.answers[session.index] === index ? 'checked' : ''}><span>${String.fromCharCode(65 + index)}. ${esc(option)}</span></label>`).join('')}</div><div class="card-actions"><button class="btn btn-light" data-action="cancel-assessment">Cancel</button><button class="btn btn-primary" data-action="${session.index === questions.length - 1 ? 'submit-assessment' : 'next-assessment'}" ${session.answers[session.index] === undefined ? 'disabled' : ''}>${session.index === questions.length - 1 ? 'Submit Assessment' : 'Next →'}</button></div></section>`);
		}
		function skillProfilePage() {
			const { assessments, average } = assessmentStats();
			return shell('student', 'My Skill Profile', `${pageIntro('Your Verified Skills', 'Skills you have completed SkillAura assessments for.')}<section class="dash-panel"><div class="panel-head"><h3>Overall Readiness</h3></div><div style="padding:20px 0;text-align:center"><div style="font-size:48px;font-weight:700;color:var(--cyan)">${average}%</div><p style="margin-top:8px;color:var(--muted)">Based on ${assessments.length} completed assessment${assessments.length !== 1 ? 's' : ''}</p></div></section><section class="dash-panel"><div class="panel-head"><h3>Verified Skills</h3></div>${assessments.length ? assessments.map((item) => `<div class="skill"><div class="skill-line"><span><b>${esc(item.skill)}</b> <span class="tag success">✓ Verified</span></span><span><b>${item.score}%</b> ${esc(item.rating)}</span></div><div class="bar"><span style="width:${item.score}%"></span></div></div>`).join('') : emptyState('No verified skills yet. Take an assessment to get started.')}</section>${assessments.length ? `<section class="dash-panel"><div class="card-actions"><button class="btn btn-primary" data-action="route" data-route="/student/skill-gaps">View Skill Gaps</button><button class="btn btn-light" data-action="route" data-route="/student/assessment">Take Another Assessment</button></div></section>` : ''}`);
		}
		function skillGapsPage() {
			const selectedCareer = state.selectedCareer || 'Frontend Developer';
			const requiredSkills = CAREER_SKILLS[selectedCareer] || [];
			const assessments = state.assessments || [];
			const gapAnalysis = requiredSkills.map(skill => {
				const assessment = assessments.find(a => a.skill === skill);
				return {
					skill,
					status: assessment ? (assessment.score >= WEAK_THRESHOLD ? 'verified' : 'weak') : 'missing',
					score: assessment?.score || 0
				};
			});
			const verified = gapAnalysis.filter(g => g.status === 'verified').length;
			const readiness = Math.round((verified / requiredSkills.length) * 100);
			const weak = gapAnalysis.filter(g => g.status === 'weak').map(g => g.skill);
			const missing = gapAnalysis.filter(g => g.status === 'missing').map(g => g.skill);
			return shell('student', 'Skill Gap Analysis', `${pageIntro('Career Readiness', `Target role: ${selectedCareer}`)}<section class="dash-panel"><div style="padding:20px 0;text-align:center"><div style="font-size:36px;font-weight:700;color:var(--green)">${readiness}%</div><p style="margin-top:8px;color:var(--muted)">Ready for this role</p></div></section><section class="dash-panel"><div class="panel-head"><h3>Required Skills</h3></div><div>${gapAnalysis.map(g => `<div class="skill" style="margin-bottom:12px"><div class="skill-line"><span><strong>${esc(g.skill)}</strong></span><span>${g.status === 'verified' ? '✓' : g.status === 'weak' ? '⚠' : '○'}</span></div>${g.score > 0 ? `<div class="bar"><span style="width:${g.score}%"></span></div>` : '<small style="color:var(--muted)">Not assessed yet</small>'}</div>`).join('')}</div></section>${missing.length || weak.length ? `<section class="dash-panel"><div class="panel-head"><h3>Next Steps</h3></div>${missing.length ? `<div style="margin-bottom:16px"><strong style="color:var(--red)">Missing Skills:</strong><br>${missing.map(s => `<small>• ${esc(s)}</small>`).join('<br>')}</div>` : ''}<div><strong>${weak.length ? 'Skills to Improve:' : ''}</strong><br>${weak.map(s => `<small>• ${esc(s)}</small>`).join('<br>')}</div><button class="btn btn-primary" data-action="route" data-route="/student/learning-recommendations" style="margin-top:16px;width:100%">Get Learning Recommendations</button></section>` : '<section class="dash-panel"><p style="text-align:center;color:var(--green)">🎉 You have all required skills! Ready for this role.</p></section>'}`);
		}
		function learningRecommendationsPage() {
			const selectedCareer = state.selectedCareer || 'Frontend Developer';
			const assessments = state.assessments || [];
			const recommendations = [
				{skill: 'React', reason: 'Required for Frontend Developer role', duration: '4 weeks', difficulty: 'Intermediate'},
				{skill: 'SQL', reason: 'Essential database skill for full-stack development', duration: '3 weeks', difficulty: 'Beginner'},
				{skill: 'Node.js', reason: 'Backend framework to complete full-stack knowledge', duration: '5 weeks', difficulty: 'Advanced'},
				{skill: 'Git', reason: 'Version control essential for team collaboration', duration: '1 week', difficulty: 'Beginner'},
				{skill: 'REST APIs', reason: 'Critical for building backend services', duration: '2 weeks', difficulty: 'Intermediate'},
				{skill: 'TypeScript', reason: 'Improve JavaScript code quality and scalability', duration: '3 weeks', difficulty: 'Intermediate'},
				{skill: 'Testing', reason: 'Ensure code reliability and quality', duration: '2 weeks', difficulty: 'Intermediate'},
				{skill: 'Docker', reason: 'Container technology for deployment', duration: '2 weeks', difficulty: 'Advanced'}
			];
			const learningProgress = state.learningProgress || {};
			return shell('student', 'Learning Recommendations', `${pageIntro('Personalized Learning Path', `Based on your skills and ${selectedCareer} requirements`)}<section class="dash-panel"><div class="panel-head"><h3>Recommended Courses</h3></div><div>${recommendations.slice(0, 5).map((rec, idx) => {
				const progress = learningProgress[rec.skill] || 'Not Started';
				return `<div style="padding:16px;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;align-items:center"><div><strong>${esc(rec.skill)}</strong><br><small style="color:var(--muted)">${esc(rec.reason)}</small><br><small style="font-size:11px;margin-top:4px">📚 ${esc(rec.duration)} • ${esc(rec.difficulty)}</small></div><button class="btn btn-light" data-action="start-learning" data-skill="${esc(rec.skill)}">${progress === 'Completed' ? '✓ Done' : progress === 'In Progress' ? 'Continue' : 'Start'}</button></div>`;
			}).join('')}</div></section>`);
		}
		function navigateFromAction(action, sourceEvent) {
			if (action === 'logout') { clearStudentSession(); state.activeRole = null; saveState(); go('/login'); return; }
			if (action === 'skip-company-onboarding') { go('/company/dashboard'); return; }
			if (action === 'skip-institution-onboarding') { go('/institution/dashboard'); return; }
			if (action === 'institution-preview-profile') { const account = currentInstitutionAccount(); const profile = account?.profile || state.institution; document.body.insertAdjacentHTML('beforeend', `<div class="modal-backdrop" data-action="close-modal"><div class="modal-card" role="dialog" aria-modal="true" onclick="event.stopPropagation()"><button class="modal-close" data-action="close-modal" aria-label="Close profile preview">×</button><span class="tag success">Public Institution Profile</span><h2>${esc(profile.name)}</h2><p>${esc(profile.description || 'Institution description not added yet.')}</p><p><b>Type:</b> ${esc(profile.institutionType || 'Not specified')}<br><b>Affiliation:</b> ${esc(profile.affiliation || 'Not specified')}<br><b>Location:</b> ${esc(profile.location || 'Not specified')}</p></div></div>`); return; }
			if (action === 'company-preview-profile') { const account = currentCompanyAccount(); const profile = account?.profile || state.company; document.body.insertAdjacentHTML('beforeend', `<div class="modal-backdrop" data-action="close-modal"><div class="modal-card" role="dialog" aria-modal="true" onclick="event.stopPropagation()"><button class="modal-close" data-action="close-modal" aria-label="Close profile preview">×</button><span class="tag success">Public Company Profile</span><h2>${esc(profile.name)}</h2><p>${esc(profile.description || 'Company description not added yet.')}</p><p><b>Industry:</b> ${esc(profile.industryType || 'Not specified')}<br><b>Location:</b> ${esc(profile.location || 'Not specified')}<br><b>Website:</b> ${esc(profile.website || 'Not specified')}</p></div></div>`); return; }
			if (action === 'company-publish-opportunity' || action === 'company-close-opportunity') { const workspace = companyWorkspaceOrEmpty(); const item = workspace.opportunities.find((opportunity) => opportunity.id === sourceEvent.currentTarget.dataset.id); if (!item) return; item.status = action === 'company-publish-opportunity' ? 'Published' : 'Closed'; if (action === 'company-publish-opportunity' && !state.opportunities.some((opportunity) => opportunity.id === item.id)) { state.opportunities.unshift({ ...item, match: 'New', eligibility: item.eligibility || 'Students with relevant skills' }); saveState(); } saveCompanyWorkspace(workspace); showToast(action === 'company-publish-opportunity' ? 'Opportunity published.' : 'Opportunity closed.'); renderFunctional(); return; }
			if (action === 'company-opportunity-details') { const workspace = companyWorkspaceOrEmpty(); const item = workspace.opportunities.find((opportunity) => opportunity.id === sourceEvent.currentTarget.dataset.id); if (!item) return; const applications = workspace.applications.filter((application) => application.opportunity === item.title); document.body.insertAdjacentHTML('beforeend', `<div class="modal-backdrop" data-action="close-modal"><div class="modal-card" role="dialog" aria-modal="true" onclick="event.stopPropagation"><button class="modal-close" data-action="close-modal" aria-label="Close opportunity details">×</button><span class="tag blue">${esc(item.type)}</span><h2>${esc(item.title)}</h2><p>${esc(item.description)}</p><p><b>Required skills:</b> ${esc(item.requirements.required.join(', '))}<br><b>Preferred skills:</b> ${esc(item.requirements.preferred.join(', ') || 'None')}<br><b>Deadline:</b> ${esc(item.deadline || 'Not set')}<br><b>Applications:</b> ${applications.length}<br><b>Shortlisted:</b> ${applications.filter((application) => application.stage === 'Shortlisted').length}</p><button class="btn btn-primary" data-action="route" data-route="/company/applications">View Applications</button></div></div>`); return; }
			if (action === 'company-view-candidate') { const account = loadStudentAccounts().find((item) => item.id === sourceEvent.currentTarget.dataset.id); if (!account) return; const profile = account.profile || account; const skills = account.workspace?.skills || []; const assessments = account.workspace?.assessments || []; document.body.insertAdjacentHTML('beforeend', `<div class="modal-backdrop" data-action="close-modal"><div class="modal-card" role="dialog" aria-modal="true" onclick="event.stopPropagation()"><button class="modal-close" data-action="close-modal" aria-label="Close candidate profile">×</button><h2>${esc(profile.name || account.fullName || 'Student')}</h2><p>${esc(profile.course || '')} · ${esc(profile.college || '')} · ${esc(profile.year || '')}</p><h3>Verified Skills</h3><p>${skills.length ? skills.map((skill) => `${esc(skill.name)} ${skill.score}%`).join(' · ') : 'No verified skills yet.'}</p><h3>Assessment Results</h3><p>${assessments.length ? assessments.map((assessment) => `${esc(assessment.skill)} ${assessment.score}%`).join(' · ') : 'No assessments yet.'}</p><div class="card-actions"><button class="btn btn-primary" data-action="company-shortlist-candidate" data-id="${account.id}">Shortlist</button><button class="btn btn-light" data-action="company-send-message" data-candidate="${account.id}" data-name="${esc(profile.name || 'Student')}">Send Message</button></div></div></div>`); return; }
			if (action === 'company-shortlist-candidate' || action === 'company-shortlist-application') { const application = applicationForId(sourceEvent.currentTarget.dataset.id) || sharedEcosystem().applications.find((item) => item.studentId === sourceEvent.currentTarget.dataset.id); if (!application) return showToast('Application not found.'); application.stage = 'Shortlisted'; application.status = 'Shortlisted'; const workspace = companyWorkspaceOrEmpty(); if (!workspace.shortlist.includes(application.studentId)) workspace.shortlist.push(application.studentId); saveCompanyWorkspace(workspace); saveEcosystem(); addEcosystemNotification('student', application.studentId, `You have been shortlisted by ${application.company}.`, '/student/applications'); if (application.institutionId) addEcosystemNotification('institution', application.institutionId, `${application.studentName} has been shortlisted by ${application.company}.`, '/institution/placements'); showToast('Candidate shortlisted.'); renderFunctional(); return; }
			if (action === 'company-advance-application') { const application = applicationForId(sourceEvent.currentTarget.dataset.id); const stages = ['Applied', 'Under Review', 'Shortlisted', 'Assessment', 'Interview', 'Selected', 'Offer Sent', 'Accepted']; if (!application) return; const index = Math.min(Math.max(stages.indexOf(application.stage || application.status), 0) + 1, stages.length - 1); application.stage = stages[index]; application.status = application.stage; saveEcosystem(); showToast(`Application moved to ${application.stage}.`); renderFunctional(); return; }
			if (action === 'company-schedule-interview') { const workspace = companyWorkspaceOrEmpty(); const application = applicationForId(sourceEvent.currentTarget.dataset.id) || sharedEcosystem().applications.find((item) => item.stage === 'Shortlisted' && item.companyId === workspace.companyId); if (!application) return showToast('Shortlist an application before scheduling an interview.'); const date = new Date().toISOString().slice(0, 10); const interviewId = `interview-${Date.now()}`; const interview = { interviewId, id: interviewId, applicationId: application.applicationId, studentId: application.studentId, companyId: application.companyId, institutionId: application.institutionId, opportunityId: application.opportunityId, candidateName: application.studentName || 'Student', opportunity: application.opportunity, date, time: '10:00', status: 'Scheduled' }; sharedEcosystem().interviews.push(interview); workspace.interviews.push(interview); application.stage = 'Interview'; application.status = 'Interview'; saveCompanyWorkspace(workspace); saveEcosystem(); addEcosystemNotification('student', application.studentId, `Interview scheduled for ${application.opportunity}.`, '/student/applications'); if (application.institutionId) addEcosystemNotification('institution', application.institutionId, `Interview scheduled for ${application.studentName}.`, '/institution/placements'); showToast('Interview scheduled.'); renderFunctional(); return; }
			if (action === 'company-interview-passed') { const workspace = companyWorkspaceOrEmpty(); const interview = sharedEcosystem().interviews.find((item) => item.id === sourceEvent.currentTarget.dataset.id || item.interviewId === sourceEvent.currentTarget.dataset.id); const application = applicationForId(interview?.applicationId); if (interview) interview.status = 'Passed'; if (application) { application.stage = 'Selected'; application.status = 'Selected'; addEcosystemNotification('student', application.studentId, `You were selected for ${application.opportunity}.`, '/student/applications'); if (application.institutionId) addEcosystemNotification('institution', application.institutionId, `${application.studentName} was selected by ${application.company}.`, '/institution/placements'); } saveEcosystem(); showToast('Interview passed and candidate moved to selection.'); renderFunctional(); return; }
			if (action === 'company-select-candidate') { const application = applicationForId(sourceEvent.currentTarget.dataset.id); if (!application) return; application.stage = 'Selected'; application.status = 'Selected'; saveEcosystem(); addEcosystemNotification('student', application.studentId, `You were selected for ${application.opportunity}.`, '/student/applications'); if (application.institutionId) addEcosystemNotification('institution', application.institutionId, `${application.studentName} was selected by ${application.company}.`, '/institution/placements'); showToast('Candidate selected.'); renderFunctional(); return; }
			if (action === 'company-send-offer') { const application = applicationForId(sourceEvent.currentTarget.dataset.id); if (!application) return; const offerId = `offer-${Date.now()}`; const offer = { offerId, id: offerId, applicationId: application.applicationId, studentId: application.studentId, companyId: application.companyId, institutionId: application.institutionId, opportunityId: application.opportunityId, candidateName: application.studentName, opportunity: application.opportunity, status: 'Offer Sent', sentAt: new Date().toISOString() }; sharedEcosystem().offers.push(offer); application.stage = 'Offer Sent'; application.status = 'Offer Sent'; saveEcosystem(); addEcosystemNotification('student', application.studentId, `Offer received for ${application.opportunity}.`, '/student/applications'); showToast('Offer marked as sent.'); renderFunctional(); return; }
			if (action === 'company-compare-candidate') { const account = loadStudentAccounts().find((item) => item.id === sourceEvent.currentTarget.dataset.id); const profile = account?.profile || account; const skills = account?.workspace?.skills || []; document.body.insertAdjacentHTML('beforeend', `<div class="modal-backdrop" data-action="close-modal"><div class="modal-card" role="dialog" aria-modal="true" onclick="event.stopPropagation()"><button class="modal-close" data-action="close-modal" aria-label="Close comparison">×</button><h2>Candidate Comparison</h2><div class="metric-row"><span>Candidate</span><strong>${esc(profile?.name || 'Student')}</strong></div><div class="metric-row"><span>Verified Skills</span><strong>${skills.length}</strong></div><div class="metric-row"><span>Average Skill Score</span><strong>${skills.length ? Math.round(skills.reduce((sum, skill) => sum + (skill.score || 0), 0) / skills.length) : 0}%</strong></div><p>Compare another candidate from Find Candidates. Final selection remains a recruiter decision.</p></div></div>`); return; }
			if (action === 'company-send-message') { const workspace = companyWorkspaceOrEmpty(); const text = prompt('Message to candidate'); if (!text?.trim()) return; workspace.messages.unshift({ id: `msg-${Date.now()}`, candidateId: sourceEvent.currentTarget.dataset.candidate, candidateName: sourceEvent.currentTarget.dataset.name || 'Candidate', text: text.trim(), time: 'Just now' }); saveCompanyWorkspace(workspace); showToast('Message sent.'); return; }
			if (action === 'company-mark-notification') { const workspace = companyWorkspaceOrEmpty(); const notification = workspace.notifications.find((item) => item.id === sourceEvent.currentTarget.dataset.id); if (notification) notification.read = true; saveCompanyWorkspace(workspace); renderFunctional(); return; }
			if (action === 'company-export-analytics') { const workspace = companyWorkspaceOrEmpty(); const csv = ['Opportunity,Stage,Match,Applied', ...workspace.applications.map((item) => [item.opportunity, item.stage || item.status, item.match || 0, item.applied || ''].map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))].join('\n'); const link = document.createElement('a'); link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`; link.download = 'skillaura-company-analytics.csv'; link.click(); return; }
			if (action === 'institution-add-student') { document.body.insertAdjacentHTML('beforeend', `<div class="modal-backdrop" data-action="close-modal"><div class="modal-card" role="dialog" aria-modal="true" onclick="event.stopPropagation()"><button class="modal-close" data-action="close-modal" aria-label="Close add student">×</button><h2>Add Student</h2><form class="form" data-form="institution-student">${authInput('Student Name', 'name', { placeholder: 'Full name' })}${authInput('Student Email', 'email', { type: 'email', placeholder: 'student@example.edu' })}${authInput('Course', 'course', { placeholder: 'B.Tech Computer Science', optional: true })}${authInput('Department', 'department', { placeholder: 'Computer Science', optional: true })}${authInput('Year', 'year', { placeholder: '3rd Year', optional: true })}${authInput('Graduation Year', 'graduationYear', { placeholder: '2027', optional: true })}<button class="btn btn-primary" type="submit">Add Student</button></form></div></div>`); bindFunctionalEvents(); return; }
			if (action === 'institution-import-demo') { const workspace = institutionWorkspaceOrEmpty(); for (let index = 0; index < 3; index += 1) workspace.students.push({ studentId: `import-${Date.now()}-${index}`, name: `Imported Student ${index + 1}`, email: `student${index + 1}@institution.example`, course: 'B.Tech Computer Science', department: 'Computer Science', year: '3rd Year', graduationYear: '2027', workspace: { skills: [], assessments: [] } }); saveInstitutionWorkspace(workspace); showToast('3 student records imported.'); renderFunctional(); return; }
			if (action === 'institution-download-template') { const link = document.createElement('a'); link.href = `data:text/csv;charset=utf-8,${encodeURIComponent('Student ID,Name,Email,Course,Department,Year,Graduation Year\n')}`; link.download = 'skillaura-student-import-template.csv'; link.click(); return; }
			if (action === 'institution-view-student') { const student = institutionStudents().find((item) => (item.studentId || item.id) === sourceEvent.currentTarget.dataset.id); if (!student) return; const skills = student.workspace?.skills || student.skills || []; document.body.insertAdjacentHTML('beforeend', `<div class="modal-backdrop" data-action="close-modal"><div class="modal-card" role="dialog" aria-modal="true" onclick="event.stopPropagation()"><button class="modal-close" data-action="close-modal" aria-label="Close student profile">×</button><h2>${esc(student.name || 'Student')}</h2><p>${esc(student.course || '')} · ${esc(student.department || '')} · ${esc(student.year || '')}</p><h3>Verified Skills</h3><p>${skills.length ? skills.map((skill) => `${esc(skill.name)} ${skill.score}%`).join(' · ') : 'No verified skills yet.'}</p><button class="btn btn-primary" data-action="route" data-route="/institution/skills">View Skill Profile</button></div></div>`); return; }
			if (action === 'institution-recommend-opportunity') { const workspace = institutionWorkspaceOrEmpty(); const opportunity = state.opportunities.find((item) => item.id === sourceEvent.currentTarget.dataset.id); if (!opportunity) return; workspace.notifications.unshift({ id: `in-${Date.now()}`, text: `Opportunity recommended to students: ${opportunity.title}.`, read: false, time: 'Just now' }); saveInstitutionWorkspace(workspace); showToast('Opportunity recommendation recorded.'); return; }
			if (action === 'institution-assign-program') { const workspace = institutionWorkspaceOrEmpty(); const skill = sourceEvent.currentTarget.dataset.skill || 'Skill Development'; workspace.programs.push({ id: `program-${Date.now()}`, name: `${skill} Development Program`, skill, status: 'Assigned', createdAt: new Date().toISOString() }); saveInstitutionWorkspace(workspace); showToast('Development program assigned.'); renderFunctional(); return; }
			if (action === 'institution-mark-internship') { const workspace = institutionWorkspaceOrEmpty(); const item = workspace.internships.find((internship) => internship.id === sourceEvent.currentTarget.dataset.id); if (item) item.status = 'Completed'; saveInstitutionWorkspace(workspace); renderFunctional(); return; }
			if (action === 'institution-record-placement') { const workspace = institutionWorkspaceOrEmpty(); const item = workspace.internships.find((internship) => internship.applicationId === sourceEvent.currentTarget.dataset.id); if (item) item.status = 'Placed'; else workspace.internships.push({ id: `placement-${Date.now()}`, applicationId: sourceEvent.currentTarget.dataset.id, status: 'Placed', title: 'Recorded placement', company: 'Connected company' }); saveInstitutionWorkspace(workspace); showToast('Placement recorded.'); renderFunctional(); return; }
			if (action === 'institution-create-collaboration') { const workspace = institutionWorkspaceOrEmpty(); const name = prompt('Company or partner name'); if (!name?.trim()) return; workspace.collaborations.push({ id: `collab-${Date.now()}`, name: name.trim(), type: 'Industry collaboration', date: new Date().toISOString().slice(0, 10), status: 'Active' }); saveInstitutionWorkspace(workspace); showToast('Collaboration created.'); renderFunctional(); return; }
			if (action === 'institution-close-collaboration') { const workspace = institutionWorkspaceOrEmpty(); const item = workspace.collaborations.find((collaboration) => collaboration.id === sourceEvent.currentTarget.dataset.id); if (item) item.status = 'Closed'; saveInstitutionWorkspace(workspace); renderFunctional(); return; }
			if (action === 'institution-mark-notification') { const workspace = institutionWorkspaceOrEmpty(); const item = workspace.notifications.find((notification) => notification.id === sourceEvent.currentTarget.dataset.id); if (item) item.read = true; saveInstitutionWorkspace(workspace); renderFunctional(); return; }
			if (action === 'institution-export-report') { const { students, assessed, verified } = institutionStudentStats(); const csv = ['Metric,Value', ['Students', students.length], ['Assessed', assessed.length], ['Students with verified skills', verified.length]].map((row) => row.join(',')).join('\n'); const link = document.createElement('a'); link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`; link.download = `skillaura-institution-${sourceEvent.currentTarget.dataset.report || 'report'}.csv`; link.click(); return; }
			if (action === 'institution-reset-settings') { const workspace = institutionWorkspaceOrEmpty(); workspace.settings = { academicYear: '', departments: '', courses: '', notifications: true }; saveInstitutionWorkspace(workspace); renderFunctional(); return; }
			if (action === 'ecosystem-mark-notification') { const notification = sharedEcosystem().notifications.find((item) => item.id === sourceEvent.currentTarget.dataset.id); if (notification) notification.read = true; saveEcosystem(); renderFunctional(); return; }
			if (action === 'student-accept-offer') { const application = applicationForId(sourceEvent.currentTarget.dataset.id); if (!application) return showToast('Application not found.'); application.status = 'Accepted'; application.stage = 'Accepted'; const ecosystem = sharedEcosystem(); const offer = ecosystem.offers.find((item) => item.applicationId === application.applicationId); if (offer) offer.status = 'Accepted'; const opportunity = ecosystem.opportunities.find((item) => item.opportunityId === application.opportunityId); const record = { studentId: application.studentId, companyId: application.companyId, institutionId: application.institutionId, opportunityId: application.opportunityId, applicationId: application.applicationId, title: application.opportunity, role: application.opportunity, company: application.company, status: 'Active', startDate: '', endDate: '', createdAt: new Date().toISOString() }; if (opportunity?.type === 'Internship') { record.internshipId = `internship-${Date.now()}`; ecosystem.internships.push(record); } else { record.placementId = `placement-${Date.now()}`; record.status = 'Placed'; ecosystem.placements.push(record); } saveEcosystem(); addEcosystemNotification('company', application.companyId, `${application.studentName} accepted the offer for ${application.opportunity}.`, '/company/applications'); if (application.institutionId) addEcosystemNotification('institution', application.institutionId, `${application.studentName} accepted an offer for ${application.opportunity}.`, '/institution/placements'); showToast('Offer accepted.'); renderFunctional(); return; }
			if (action === 'toggle-sidebar') { toggleSidebar(); return; }
			if (action === 'route') { go(sourceEvent.currentTarget.dataset.route); return; }
			if (action === 'choose-role') {
				const role = normalizeRole(sourceEvent.currentTarget.dataset.role);
				const session = currentStudentSession();
				const account = currentStudentAccount();
				if (account) {
					account.role = role;
					const accounts = loadStudentAccounts();
					const index = accounts.findIndex((item) => item.id === account.id);
					if (index >= 0) {
						accounts[index].role = role;
						saveStudentAccounts(accounts);
					}
					if (session) {
						localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ id: session.id, email: session.email, role }));
					}
				}
				state.activeRole = role;
				saveState();
				go(dashboardRouteForRole(role));
				return;
			}
			if (action === 'forgot') { go('/forgot-password'); return; }
			if (action === 'skip-onboarding') { go('/student/dashboard'); return; }
			if (action === 'toggle-password') { const input = document.getElementById(sourceEvent.currentTarget.dataset.target); if (!input) return; const show = input.type === 'password'; input.type = show ? 'text' : 'password'; sourceEvent.currentTarget.textContent = show ? 'Hide' : 'Show'; sourceEvent.currentTarget.setAttribute('aria-pressed', String(show)); sourceEvent.currentTarget.setAttribute('aria-label', `${show ? 'Hide' : 'Show'} password`); return; }
			if (action === 'focus-search') { document.querySelector('.page-search')?.focus(); return; }
			if (action === 'notifications') { document.body.insertAdjacentHTML('beforeend', notificationPanel()); return; }
			if (action === 'close-modal') { sourceEvent.currentTarget.closest('.modal-backdrop')?.remove(); return; }
		}
		function bindFunctionalEvents() {
			document.querySelectorAll('[data-action]').forEach((element) => {
				if (element.dataset.action === 'filter' || element.dataset.action === 'status') return;
				element.addEventListener('click', (event) => {
					event.stopPropagation();
					const action = element.dataset.action;
					if (action === 'view-opportunity') { const opportunity = opportunityByTitle(element.dataset.title); if (opportunity) document.body.insertAdjacentHTML('beforeend', detailModal(opportunity)); return; }
					if (action === 'apply') { addApplication(element.dataset.title); return; }
					if (action === 'delete-opportunity') { if (confirm(`Delete ${element.dataset.title}?`)) { state.opportunities = state.opportunities.filter((item) => item.title !== element.dataset.title); saveState(); notify('Opportunity deleted.'); renderFunctional(); } return; }
					if (action === 'add-skill') { const name = prompt('Skill name'); if (name?.trim()) { state.skills.push({ name: name.trim(), score: 25, status: 'Improve' }); saveState(); notify(`${name.trim()} added to your skills.`); renderFunctional(); } return; }
					if (action === 'remove-skill') { state.skills = state.skills.filter((skill) => skill.name !== element.dataset.skill); saveState(); renderFunctional(); return; }
					if (action === 'improve-skill') { showToast(`Keep practicing ${element.dataset.skill}, then retake the assessment.`); return; }
					if (action === 'assessment') { go('/student/assessment'); return; }
					if (action === 'choose-role') {
						const role = normalizeRole(element.dataset.role);
						const session = currentStudentSession();
						const account = currentStudentAccount();
						if (account) {
							account.role = role;
							const accounts = loadStudentAccounts();
							const index = accounts.findIndex((item) => item.id === account.id);
							if (index >= 0) {
								accounts[index].role = role;
								saveStudentAccounts(accounts);
							}
							if (session) {
								localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ id: session.id, email: session.email, role }));
							}
						}
						state.activeRole = role;
						saveState();
						go(dashboardRouteForRole(role));
						return;
					}
					if (action === 'select-assessment' || action === 'retake-assessment') { state.assessmentResult = null; state.assessmentSession = { skill: element.dataset.skill, index: 0, answers: [] }; renderFunctional(); return; }
					if (action === 'cancel-assessment') { delete state.assessmentSession; go('/student/skills'); return; }
					if (action === 'next-assessment' || action === 'submit-assessment') { const choice = document.querySelector('input[name="assessment-answer"]:checked'); if (!choice) { showToast('Please select an answer.'); return; } const session = state.assessmentSession; session.answers[session.index] = Number(choice.value); const questions = ASSESSMENT_QUESTIONS[session.skill]; if (action === 'next-assessment') { session.index += 1; renderFunctional(); return; } const correct = session.answers.reduce((total, answer, index) => total + (answer === questions[index].a ? 1 : 0), 0); const score = Math.round((correct / questions.length) * 100); const topicBreakdown = calculateTopicBreakdown(session.skill, session.answers); const result = { skill: session.skill, score, correct, total: questions.length, rating: assessmentRating(score), topicBreakdown, completedAt: new Date().toISOString() }; state.assessments = (state.assessments || []).filter((item) => item.skill !== result.skill); state.assessments.push(result); state.skills = state.assessments.map((item) => ({ name: item.skill, score: item.score, status: item.rating })); state.assessmentResult = result; delete state.assessmentSession; saveState(); notify(`${result.skill} assessment completed with ${score}%.`); renderFunctional(); return; }
					if (action === 'close-assessment') { document.getElementById('assessment-area').innerHTML = ''; return; }
					if (action === 'start-learning') { state.learningProgress[element.dataset.skill] = 'In Progress'; saveState(); renderFunctional(); return; }
					if (action === 'retake-assessment') { state.assessmentResult = null; state.assessmentSession = { skill: element.dataset.skill, index: 0, answers: [] }; renderFunctional(); return; }
					if (action === 'candidate') { showToast(`${element.dataset.name}'s profile is ready for review.`); return; }
					if (action === 'join-program') { notify(`You joined the ${element.dataset.name} program.`); showToast('Program added to your workspace.'); return; }
					if (action === 'add-partnership') { const name = prompt('Partner organization'); if (name?.trim()) { state.partnerships.push({ id: `p-${Date.now()}`, name: name.trim(), type: 'New partnership', status: 'Pending' }); notify(`New partnership added with ${name.trim()}.`); saveState(); renderFunctional(); } return; }
					if (action === 'remove-partnership') { if (confirm('Remove this partnership?')) { state.partnerships = state.partnerships.filter((item) => item.id !== element.dataset.id); saveState(); renderFunctional(); } return; }
					if (action === 'read-notification') { const notification = state.notifications.find((item) => item.id === element.dataset.id); if (notification) notification.read = true; saveState(); element.closest('.notification-row')?.remove(); return; }
					navigateFromAction(action, event);
				});
			});
			document.querySelectorAll('input[name="assessment-answer"]').forEach((input) => input.addEventListener('change', () => {
				const session = state.assessmentSession;
				if (!session) return;
				session.answers[session.index] = Number(input.value);
				renderFunctional();
			}));
			document.querySelectorAll('[data-action="filter"]').forEach((input) => input.addEventListener('input', () => { const query = input.value.toLowerCase().trim(); const container = input.closest('.dash-content'); const results = [...container.querySelectorAll('[data-searchable]')]; results.forEach((item) => { item.hidden = query && !item.dataset.searchable.toLowerCase().includes(query); }); const visible = results.some((item) => !item.hidden); container.querySelector('.empty-state')?.remove(); if (!visible) container.insertAdjacentHTML('beforeend', emptyState('No results found.')); }));
			document.querySelectorAll('[data-action="status"]').forEach((select) => select.addEventListener('change', () => { const application = state.applications.find((item) => item.id === select.dataset.id); if (application) { application.status = select.value; notify(`Application status updated to ${select.value}.`); saveState(); showToast('Application status updated.'); } }));
			document.querySelectorAll('form[data-form]').forEach((form) => form.addEventListener('submit', (event) => { event.preventDefault(); handleForm(form, event); }));
			document.querySelectorAll('[data-demo]').forEach((button) => button.addEventListener('click', () => { if (button.dataset.demo !== 'student') { state.activeRole = button.dataset.demo; saveState(); go(`/${button.dataset.demo}/dashboard`); return; } let account = loadStudentAccounts().find((item) => item.email === 'demo@student.skillaura'); if (!account) { const profile = { ...clone(defaultState.student), name: 'Demo Student', email: 'demo@student.skillaura', initials: 'DS', title: 'Welcome, Demo', subtitle: 'Here is your career readiness overview.' }; account = { id: 'student-demo', email: profile.email, passwordHash: prototypeHash('demo-access'), profile, workspace: studentWorkspace(), createdAt: new Date().toISOString() }; const accounts = loadStudentAccounts(); accounts.push(account); saveStudentAccounts(accounts); } startStudentSession(account); go('/student/dashboard'); }));
		}
		function handleForm(form, submitEvent) {
			const values = Object.fromEntries(new FormData(form).entries());
			if (submitEvent?.submitter?.name) values[submitEvent.submitter.name] = submitEvent.submitter.value;
			clearFormErrors(form);
			if (form.dataset.form === 'institution-register') {
				const email = (values.email || '').trim().toLowerCase();
				if (!(values.name || '').trim()) return showFieldError(form, 'name', 'Enter the institution name.');
				if (!isValidEmail(email)) return showFieldError(form, 'email', 'Enter a valid institution email.');
				if ((values.password || '').length < 8) return showFieldError(form, 'password', 'Use at least 8 characters.');
				if (values.password !== values.confirmPassword) return showFieldError(form, 'confirmPassword', 'Passwords do not match.');
				if (!(values.institutionType || '').trim()) return showFieldError(form, 'institutionType', 'Enter the institution type.');
				if (!(values.affiliation || '').trim()) return showFieldError(form, 'affiliation', 'Enter the affiliation or university.');
				if (!(values.location || '').trim()) return showFieldError(form, 'location', 'Enter the institution location.');
				if (!(values.contactPerson || '').trim()) return showFieldError(form, 'contactPerson', 'Enter an administrator.');
				if (!(values.designation || '').trim()) return showFieldError(form, 'designation', 'Enter the administrator designation.');
				if (!/^[+()\d\s-]{7,20}$/.test(values.phone || '')) return showFieldError(form, 'phone', 'Enter a valid phone number.');
				if (values.website && !/^https?:\/\/\S+$/i.test(values.website)) return showFieldError(form, 'website', 'Use a valid website URL.');
				if (loadInstitutionAccounts().some((account) => account.email === email)) return showFieldError(form, 'email', 'This institution email is already registered.');
				const profile = { name: values.name.trim(), email, institutionType: values.institutionType.trim(), affiliation: values.affiliation.trim(), accreditation: values.accreditation || '', website: values.website || '', location: values.location.trim(), contactPerson: values.contactPerson.trim(), designation: values.designation.trim(), phone: values.phone.trim(), initials: values.name.trim().split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase(), title: `Welcome, ${values.name.trim()}`, subtitle: 'Monitor readiness, skills, internships, and outcomes.' };
				const institutionId = `institution-${Date.now()}`; const account = { id: institutionId, institutionId, role: 'institution', email, passwordHash: prototypeHash(values.password), profile, createdAt: new Date().toISOString() };
				const accounts = loadInstitutionAccounts(); accounts.push(account); saveInstitutionAccounts(accounts); saveInstitutionWorkspace(blankInstitutionWorkspace(account)); startInstitutionSession(account); go('/institution/onboarding'); return;
			}
			if (form.dataset.form === 'institution-login') {
				const email = (values.email || '').trim().toLowerCase(); const account = loadInstitutionAccounts().find((item) => item.email === email);
				if (!account || account.passwordHash !== prototypeHash(values.password)) return showFormError(form, 'That institution email or password is not correct.');
				startInstitutionSession(account); go('/institution/dashboard'); return;
			}
			if (form.dataset.form === 'institution-onboarding') {
				const account = currentInstitutionAccount(); if (!account) return go('/institution/login'); const workspace = institutionWorkspaceOrEmpty(); account.profile = { ...account.profile, description: values.description || '', logo: values.logo || '', departments: values.departments || '', courses: values.courses || '' }; workspace.settings = { ...workspace.settings, academicYear: values.academicYear || '' }; workspace.onboarding = { status: 'Pending', completed: true, submittedAt: new Date().toISOString() }; saveInstitutionAccounts(loadInstitutionAccounts().map((item) => item.id === account.id ? account : item)); saveInstitutionWorkspace(workspace); state.institution = { ...state.institution, ...account.profile }; saveState(); go('/institution/dashboard'); return;
			}
			if (form.dataset.form === 'institution-profile') {
				const account = currentInstitutionAccount(); if (!account) return go('/institution/login'); account.profile = { ...account.profile, name: values.name.trim(), email: values.email.trim().toLowerCase(), description: values.description || '', institutionType: values.institutionType.trim(), affiliation: values.affiliation || '', website: values.website || '', location: values.location || '', departments: values.departments || '', courses: values.courses || '' }; saveInstitutionAccounts(loadInstitutionAccounts().map((item) => item.id === account.id ? account : item)); state.institution = { ...state.institution, ...account.profile }; saveState(); showToast('Institution profile saved.'); renderFunctional(); return;
			}
			if (form.dataset.form === 'institution-student') { const workspace = institutionWorkspaceOrEmpty(); const email = (values.email || '').trim().toLowerCase(); if (!(values.name || '').trim()) return showFieldError(form, 'name', 'Enter the student name.'); if (!isValidEmail(email)) return showFieldError(form, 'email', 'Enter a valid student email.'); workspace.students.push({ studentId: `institution-student-${Date.now()}`, name: values.name.trim(), email, course: values.course || 'Not set', department: values.department || 'Not set', year: values.year || 'Not set', graduationYear: values.graduationYear || '', workspace: { skills: [], assessments: [] } }); workspace.notifications.unshift({ id: `in-${Date.now()}`, text: `${values.name.trim()} was added to your student list.`, read: false, time: 'Just now' }); saveInstitutionWorkspace(workspace); showToast('Student added.'); document.querySelector('.modal-backdrop')?.remove(); renderFunctional(); return; }
			if (form.dataset.form === 'institution-settings') { const workspace = institutionWorkspaceOrEmpty(); workspace.settings = { academicYear: values.academicYear || '', departments: values.departments || '', courses: values.courses || '', notifications: Boolean(form.elements.notifications?.checked) }; saveInstitutionWorkspace(workspace); showToast('Institution settings saved.'); renderFunctional(); return; }
			if (form.dataset.form === 'company-register') {
				const email = (values.email || '').trim().toLowerCase();
				if (!(values.name || '').trim()) return showFieldError(form, 'name', 'Enter the company name.');
				if (!isValidEmail(email)) return showFieldError(form, 'email', 'Enter a valid official email.');
				if ((values.password || '').length < 8) return showFieldError(form, 'password', 'Use at least 8 characters.');
				if (values.password !== values.confirmPassword) return showFieldError(form, 'confirmPassword', 'Passwords do not match.');
				if (!(values.industryType || '').trim()) return showFieldError(form, 'industryType', 'Enter an industry or company type.');
				if (!(values.size || '').trim()) return showFieldError(form, 'size', 'Enter the company size.');
				if (!(values.location || '').trim()) return showFieldError(form, 'location', 'Enter the company location.');
				if (!(values.contactPerson || '').trim()) return showFieldError(form, 'contactPerson', 'Enter a contact person.');
				if (!(values.designation || '').trim()) return showFieldError(form, 'designation', 'Enter the contact designation.');
				if (!/^[+()\d\s-]{7,20}$/.test(values.phone || '')) return showFieldError(form, 'phone', 'Enter a valid phone number.');
				if (values.website && !/^https?:\/\/\S+$/i.test(values.website)) return showFieldError(form, 'website', 'Use a valid website URL.');
				if (loadCompanyAccounts().some((account) => account.email === email)) return showFieldError(form, 'email', 'This company email is already registered.');
				const profile = { name: values.name.trim(), email, industryType: values.industryType.trim(), website: values.website.trim(), size: values.size.trim(), location: values.location.trim(), contactPerson: values.contactPerson.trim(), designation: values.designation.trim(), phone: values.phone.trim(), initials: values.name.trim().split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase(), title: `Welcome, ${values.name.trim()}`, subtitle: 'Build your team with verified skill signals.' };
				const companyId = `company-${Date.now()}`; const account = { id: companyId, companyId, role: 'company', email, passwordHash: prototypeHash(values.password), profile, createdAt: new Date().toISOString() };
				const accounts = loadCompanyAccounts(); accounts.push(account); saveCompanyAccounts(accounts); saveCompanyWorkspace(blankCompanyWorkspace(account)); startCompanySession(account); go('/company/onboarding'); return;
			}
			if (form.dataset.form === 'company-login') {
				const email = (values.email || '').trim().toLowerCase();
				const account = loadCompanyAccounts().find((item) => item.email === email);
				if (!account || account.passwordHash !== prototypeHash(values.password)) return showFormError(form, 'That company email or password is not correct.');
				startCompanySession(account); go('/company/dashboard'); return;
			}
			if (form.dataset.form === 'company-onboarding') {
				const account = currentCompanyAccount(); const workspace = companyWorkspaceOrEmpty();
				if (!account) return go('/company/login');
				account.profile = { ...account.profile, description: values.description || '', logo: values.logo || '', recruitmentPreferences: values.preferences || '' };
				workspace.onboarding = { status: 'Pending', completed: true, submittedAt: new Date().toISOString() };
				saveCompanyAccounts(loadCompanyAccounts().map((item) => item.id === account.id ? account : item)); saveCompanyWorkspace(workspace); state.company = { ...state.company, ...account.profile }; saveState(); go('/company/dashboard'); return;
			}
			if (form.dataset.form === 'company-profile') {
				const account = currentCompanyAccount(); if (!account) return go('/company/login');
				account.profile = { ...account.profile, name: values.name.trim(), email: values.email.trim().toLowerCase(), description: values.description || '', industryType: values.industryType.trim(), website: values.website || '', location: values.location || '', size: values.size || '', contactPerson: values.contactPerson || '', designation: values.designation || '' };
				saveCompanyAccounts(loadCompanyAccounts().map((item) => item.id === account.id ? account : item)); state.company = { ...state.company, ...account.profile }; saveState(); showToast('Company profile saved.'); renderFunctional(); return;
			}
			if (form.dataset.form === 'company-opportunity') {
				const account = currentCompanyAccount(); if (!account) return go('/company/login');
				if (!(values.title || '').trim()) return showFieldError(form, 'title', 'Enter an opportunity title.');
				if (!values.type) return showFieldError(form, 'type', 'Select an opportunity type.');
				if (!(values.description || '').trim()) return showFieldError(form, 'description', 'Add a description.');
				const required = normalizeSkillList(values.requiredSkills); if (!required.length) return showFieldError(form, 'requiredSkills', 'Add at least one required skill.');
				const workspace = companyWorkspaceOrEmpty(); const opportunityId = `opportunity-${Date.now()}`; const opportunity = { opportunityId, id: opportunityId, companyId: account.id, company: account.profile.name, title: values.title.trim(), type: values.type, department: values.department || '', location: values.location || '', mode: values.mode || 'On-site', description: values.description.trim(), responsibilities: values.responsibilities || '', eligibility: values.eligibility || '', year: values.year || '', requirements: { required, preferred: normalizeSkillList(values.preferredSkills), minimumLevel: values.minimumLevel || 'Intermediate' }, skills: required.join(', '), experience: values.experience || '', compensation: values.compensation || '', duration: values.duration || '', deadline: values.deadline || '', openings: Number(values.openings) || 1, status: values.saveMode === 'publish' ? 'Published' : 'Draft', createdAt: new Date().toISOString(), applicationCount: 0 };
				workspace.opportunities.unshift(opportunity); saveCompanyWorkspace(workspace);
				if (opportunity.status === 'Published') { sharedEcosystem().opportunities.unshift({ ...opportunity, match: 'New', eligibility: opportunity.eligibility || 'Students with relevant skills' }); saveEcosystem(); }
				showToast(opportunity.status === 'Published' ? 'Opportunity published.' : 'Opportunity saved as draft.'); go('/company/opportunities'); return;
			}
			if (form.dataset.form === 'login') {
				let invalid = false;
				if (!isValidEmail(values.email)) { showFieldError(form, 'email', 'Enter a valid email address.'); invalid = true; }
				if (!values.password) { showFieldError(form, 'password', 'Enter your password.'); invalid = true; }
				if (invalid) return;
				const account = loadStudentAccounts().find((item) => item.email === values.email.trim().toLowerCase());
				if (!account || account.passwordHash !== prototypeHash(values.password)) return showFormError(form, 'That email or password is not correct.');
				const role = normalizeRole(account.role || 'student');
				startStudentSession(account, role);
				const redirect = role === 'company' ? '/company/dashboard' : role === 'institution' ? '/institution/dashboard' : '/student/dashboard';
				go(redirect); return;
			}
			if (form.dataset.form === 'register') {
				let invalid = false;
				const name = (values.name || '').trim(); const email = (values.email || '').trim().toLowerCase();
				if (name.split(/\s+/).filter(Boolean).length < 2) { showFieldError(form, 'name', 'Enter your first and last name.'); invalid = true; }
				if (!isValidEmail(email)) { showFieldError(form, 'email', 'Enter a valid email address.'); invalid = true; }
				if ((values.password || '').length < 8) { showFieldError(form, 'password', 'Use at least 8 characters.'); invalid = true; }
				if (values.confirmPassword !== values.password) { showFieldError(form, 'confirmPassword', 'Passwords do not match.'); invalid = true; }
				if (!(values.college || '').trim()) { showFieldError(form, 'college', 'Enter your college or university.'); invalid = true; }
				if (!(values.course || '').trim()) { showFieldError(form, 'course', 'Enter your course.'); invalid = true; }
				if (!values.year) { showFieldError(form, 'year', 'Select your year of study.'); invalid = true; }
				if (values.phone && !/^[+()\d\s-]{7,20}$/.test(values.phone)) { showFieldError(form, 'phone', 'Enter a valid phone number or leave this blank.'); invalid = true; }
				if (loadStudentAccounts().some((account) => account.email === email)) { showFieldError(form, 'email', 'This email is already registered. Please log in.'); invalid = true; }
				if (invalid) return;
				const profile = { name, email, college: values.college.trim(), course: values.course.trim(), year: values.year, phone: (values.phone || '').trim(), initials: name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase(), title: `Welcome, ${name.split(/\s+/)[0]}`, subtitle: "Let's turn your skills into your next opportunity." };
				const registeredAt = new Date().toISOString();
				const studentId = `student-${Date.now()}`; const account = { id: studentId, studentId, fullName: name, email, college: profile.college, course: profile.course, year: profile.year, phone: profile.phone, institutionId: null, role: 'student', registeredAt, onboardingCompleted: false, onboarding: {}, passwordHash: prototypeHash(values.password), profile, workspace: newStudentWorkspace() };
				const accounts = loadStudentAccounts(); accounts.push(account); saveStudentAccounts(accounts);
				startStudentSession(account, 'student');
				notify('Your student account was created.');
				go('/role-selection');
				return;
			}
			if (form.dataset.form === 'onboarding') { const account = currentStudentAccount(); if (!account) return go('/login'); const onboarding = { careerInterest: values.interests || '', desiredRole: values.roles || '', technicalSkills: values.technicalSkills || '', softSkills: values.softSkills || '', preferredIndustry: values.industries || '', opportunityType: values.opportunityType || '', location: values.location || '' }; state.student.preferences = onboarding; const accounts = loadStudentAccounts(); const index = accounts.findIndex((item) => item.id === account.id); if (index >= 0) { accounts[index].onboarding = onboarding; accounts[index].onboardingCompleted = true; saveStudentAccounts(accounts); } saveState(); notify('Your onboarding preferences were saved.'); go('/student/dashboard'); return; }
			if (form.dataset.form === 'recovery') { if (!isValidEmail(values.email)) return showFieldError(form, 'email', 'Enter a valid email address.'); const account = loadStudentAccounts().find((item) => item.email === values.email.trim().toLowerCase()); if (!account) return showFieldError(form, 'email', 'No student account exists for this email.'); try { localStorage.setItem(RESET_CANDIDATE_KEY, account.id); } catch (error) { } showToast('Reset link simulated. Choose a new password now.'); go('/reset-password'); return; }
			if (form.dataset.form === 'reset-password') { const accountId = localStorage.getItem(RESET_CANDIDATE_KEY); const accounts = loadStudentAccounts(); const index = accounts.findIndex((account) => account.id === accountId); if (index < 0) return go('/forgot-password'); if ((values.password || '').length < 8) return showFieldError(form, 'password', 'Use at least 8 characters.'); if (values.password !== values.confirmPassword) return showFieldError(form, 'confirmPassword', 'Passwords do not match.'); accounts[index].passwordHash = prototypeHash(values.password); saveStudentAccounts(accounts); localStorage.removeItem(RESET_CANDIDATE_KEY); showToast('Password updated. You can now log in.'); go('/login'); return; }
			if (form.dataset.form === 'profile') { const normalizedRole = normalizeRole(form.dataset.role); const person = personFor(normalizedRole); person.name = values.name; person.email = values.email; if (normalizedRole === 'student') { person.college = values.details; person.title = `Welcome, ${(values.name || '').trim().split(/\s+/)[0] || 'Student'}`; } else if (normalizedRole === 'company') person.industryType = values.details; else person.institutionType = values.details; saveState(); notify('Profile changes saved.'); showToast('Profile changes saved.'); return; }
			if (form.dataset.form === 'settings') { state.settings = { emailUpdates: form.elements.emailUpdates.checked, profileVisibility: form.elements.profileVisibility.checked, compactView: form.elements.compactView.checked }; saveState(); notify('Settings saved.'); showToast('Settings saved.'); return; }
			if (form.dataset.form === 'opportunity') { if (!values.title || !values.company || !values.location || !values.skills || !values.description || !values.duration || !values.deadline) return showFormError(form, 'Complete all required opportunity fields.'); state.opportunities.unshift({ title: values.title, company: values.company, location: values.location, type: values.type, skills: values.skills, description: values.description, duration: values.duration, deadline: values.deadline, match: 'New' }); saveState(); notify(`Opportunity posted: ${values.title}.`); showToast('Opportunity posted successfully.'); go('/company/opportunities'); return; }
			if (form.dataset.form === 'assessment') { const score = ['q1', 'q2', 'q3'].reduce((total, key) => total + (values[key] === '1' ? 1 : 0), 0); state.assessment = { score, completed: new Date().toISOString() }; const git = state.skills.find((skill) => skill.name === 'Git'); if (git) { git.score = Math.min(100, git.score + score * 5); git.status = score > 1 ? 'Verified' : git.status; } saveState(); notify('Assessment completed.'); showToast(`Assessment complete: ${score}/3 correct.`); renderFunctional(); return; }
		}
		function clearFormErrors(form) { form.querySelectorAll('.form-error, .field-error').forEach((element) => element.remove()); form.querySelectorAll('[aria-invalid="true"]').forEach((element) => element.removeAttribute('aria-invalid')); }
		function showFieldError(form, field, message) { const input = form.elements[field]; if (!input) return showFormError(form, message); input.setAttribute('aria-invalid', 'true'); input.closest('.auth-field')?.insertAdjacentHTML('beforeend', `<div class="field-error">${esc(message)}</div>`); }
		function showFormError(form, message) { form.querySelector('.form-error')?.remove(); form.insertAdjacentHTML('afterbegin', `<div class="form-error" role="alert">${esc(message)}</div>`); }
		function mixColor(from, to, amount) {
			const parse = (value) => value.match(/[\da-f]{2}/gi).map((part) => parseInt(part, 16));
			const start = parse(from);
			const end = parse(to);
			return `rgb(${start.map((channel, index) => Math.round(channel + (end[index] - channel) * amount)).join(', ')})`;
		}
		function updateGlobalBackground() {
			const background = document.getElementById('global-background');
			const root = document.querySelector('.landing');
			if (!background || !root || !document.body.classList.contains('home-page')) return;
				const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
				const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
				const transitionLimit = .25;
				const phase = progress <= transitionLimit ? progress / transitionLimit : progress >= 1 - transitionLimit ? (1 - progress) / transitionLimit : 1;
				const normalized = Math.min(1, Math.max(0, phase));
				const darkness = normalized * normalized * (3 - 2 * normalized);
				const themeProgress = selectedTheme === 'dark' ? 1 - darkness : darkness;
				const calculatedBackgroundColor = mixColor('#ffffff', '#000000', themeProgress);
				const currentBackgroundColor = window.__skillAuraBackgroundOverride || calculatedBackgroundColor;
				background.style.backgroundColor = currentBackgroundColor;
			root.style.setProperty('--scroll-ink', mixColor('#17333a', '#ffffff', themeProgress));
			root.style.setProperty('--scroll-muted', mixColor('#668087', '#b7c4c5', themeProgress));
			root.style.setProperty('--scroll-line', mixColor('#d7e9e9', '#35474b', themeProgress));
			root.style.setProperty('--scroll-surface', mixColor('#ffffff', '#101719', themeProgress));
			root.style.setProperty('--scroll-soft', mixColor('#f4fafa', '#0b1113', themeProgress));
			document.body.style.setProperty('--scroll-ink', mixColor('#17333a', '#ffffff', themeProgress));
			document.body.style.setProperty('--scroll-muted', mixColor('#668087', '#b7c4c5', themeProgress));
			document.body.style.setProperty('--scroll-line', mixColor('#d7e9e9', '#35474b', themeProgress));
			document.body.style.setProperty('--scroll-surface', mixColor('#ffffff', '#101719', themeProgress));
			document.body.style.setProperty('--scroll-soft', mixColor('#f4fafa', '#0b1113', themeProgress));
			document.body.style.setProperty('--scroll-header', mixColor('#17333a', '#000000', themeProgress));
				const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
				const heroCopy = root.querySelector('.hero > .container:first-child');
				const ecosystem = root.querySelector('.ecosystem');
				if (!reducedMotion) {
					if (heroCopy) heroCopy.style.transform = `translateY(${progress * -42}px)`;
					if (ecosystem) ecosystem.style.transform = `translateY(${progress * 28}px)`;
				}
				const center = window.scrollY + window.innerHeight * .42;
				let activeId = '';
				root.querySelectorAll('section[id]').forEach((section) => {
					if (section.offsetTop <= center) activeId = section.id;
				});
				root.querySelectorAll('.navlinks a').forEach((link) => {
					const href = link.getAttribute('href');
					const active = activeId ? href === `#${activeId}` : href === '#/';
					link.classList.toggle('active', active);
					if (active) link.setAttribute('aria-current', 'page');
					else link.removeAttribute('aria-current');
				});
		}
		function teardownLandingExperience() {
			if (window.__skillAuraScrollFrame) cancelAnimationFrame(window.__skillAuraScrollFrame);
			window.__skillAuraScrollFrame = null;
			if (window.__skillAuraScrollHandler) window.removeEventListener('scroll', window.__skillAuraScrollHandler);
			if (window.__skillAuraResizeHandler) window.removeEventListener('resize', window.__skillAuraResizeHandler);
			if (window.__skillAuraRevealObserver) window.__skillAuraRevealObserver.disconnect();
			delete window.__skillAuraScrollHandler;
			delete window.__skillAuraResizeHandler;
			delete window.__skillAuraBackgroundOverride;
			document.body.classList.remove('home-page');
			document.body.classList.remove('motion-page');
			['--scroll-ink', '--scroll-muted', '--scroll-line', '--scroll-surface', '--scroll-soft', '--scroll-header']
				.forEach((property) => document.body.style.removeProperty(property));
			const background = document.getElementById('global-background');
			if (background) background.style.removeProperty('background-color');
		}

		function homeEnhancementsMarkup() {
			const skillDetails = {
				Python: 'Automation, data, and backend foundations used across SkillAura opportunities.',
				JavaScript: 'The language behind interactive products, dashboards, and modern web experiences.',
				React: 'A practical UI skill for building fast, composable product interfaces.',
				SQL: 'The data layer skill that helps teams turn product questions into decisions.',
				Git: 'A collaboration essential for shipping confidently with technical teams.',
				Communication: 'The multiplier that helps strong technical work create real-world impact.'
			};
			return `<section class="home-stats section" aria-label="SkillAura at a glance"><div class="container"><div class="home-section-kicker">The network in motion</div><div class="home-stats-grid">${[['2,450','Students building readiness','+'],['42','Industry partners','+'],['18','Live projects','+'],['72','Average readiness signal','%']].map(([value,label,suffix]) => `<div class="home-stat" data-stat-value="${value.replace(',','')}" data-stat-suffix="${suffix}"><strong>${value}${suffix}</strong><span>${label}</span></div>`).join('')}</div></div></section><section class="home-skills section soft" id="home-skills"><div class="container home-skill-layout"><div><div class="home-section-kicker">Skills with a signal</div><h2>See where potential becomes momentum.</h2><p class="home-section-copy">Explore the capabilities that connect classroom learning to meaningful opportunities.</p><div class="home-skill-tabs" role="list">${Object.keys(skillDetails).map((skill, index) => `<button type="button" class="home-skill-tab${index === 0 ? ' active' : ''}" data-home-skill="${skill}" role="listitem">${skill}</button>`).join('')}</div></div><div class="home-skill-detail" aria-live="polite"><span class="tag blue">Verified signal</span><h3>${data.skills[0][0]}</h3><p>${skillDetails[data.skills[0][0]]}</p><strong>${data.skills[0][1]}% readiness</strong><div class="bar"><span style="width:${data.skills[0][1]}%"></span></div></div></div></section><section class="home-opportunities section" id="home-opportunities"><div class="container"><div class="section-heading"><div class="eyebrow">A practical next step</div><h2>Opportunities matched to momentum.</h2><p>Move from a verified signal to a real conversation with industry.</p></div><div class="home-opportunity-grid">${state.opportunities.slice(0, 3).map((opportunity) => `<article class="home-opportunity-card" data-action="view-opportunity" data-title="${esc(opportunity.title)}" tabindex="0"><div class="home-opportunity-top"><span class="tag success">${esc(opportunity.match)} match</span><span>${esc(opportunity.location)}</span></div><h3>${esc(opportunity.title)}</h3><p>${esc(opportunity.company)} · ${esc(opportunity.duration)}</p><small>${esc(opportunity.skills)}</small><div class="home-opportunity-more"><span>Eligibility: relevant foundational skills</span><span>Deadline: ${esc(opportunity.deadline)}</span></div><button class="btn btn-light" type="button" data-action="view-opportunity" data-title="${esc(opportunity.title)}">View details →</button></article>`).join('')}</div></div></section><section class="home-ecosystem section soft" id="home-ecosystem"><div class="container home-ecosystem-grid"><div class="home-ecosystem-sticky"><div class="home-ecosystem-visual"><span class="home-ecosystem-node active">Students</span><span class="home-ecosystem-line"></span><span class="home-ecosystem-node">Academia</span><span class="home-ecosystem-line"></span><span class="home-ecosystem-node">Industry</span></div></div><div class="home-ecosystem-steps"><div class="home-section-kicker">The bridge in five moves</div>${[['01','Discover','Students find a clear next step based on their current signal.'],['02','Develop','Skills become visible, verifiable, and easier to improve.'],['03','Track','Academia sees readiness, gaps, and outcomes in one view.'],['04','Connect','Industry discovers candidates through meaningful evidence.'],['05','Move forward','Applications become the beginning of a stronger connection.']].map(([number,title,copy]) => `<article class="home-ecosystem-step" data-ecosystem-step="${number}"><span>${number}</span><div><h3>${title}</h3><p>${copy}</p></div></article>`).join('')}</div></div></section><section class="home-final-cta section"><div class="container"><div><div class="home-section-kicker">Make the next move</div><h2>Your skills. Your opportunities. Your future.</h2><p>Explore the SkillAura workspace and turn readiness into momentum.</p></div><a class="btn btn-primary" href="#/student/opportunities">Explore SkillAura →</a></div></section>`;
		}

		function enhanceHomePage(landingRoot) {
			if (landingRoot.querySelector('.home-stats')) return;
			landingRoot.querySelector('.cta')?.insertAdjacentHTML('beforebegin', homeEnhancementsMarkup());
			landingRoot.querySelectorAll('[data-home-skill]').forEach((button) => {
				button.addEventListener('click', () => {
					const skill = data.skills.find((item) => item[0] === button.dataset.homeSkill);
					if (!skill) return;
					landingRoot.querySelectorAll('[data-home-skill]').forEach((item) => item.classList.toggle('active', item === button));
					const detail = landingRoot.querySelector('.home-skill-detail');
					const descriptions = { Python: 'Automation, data, and backend foundations used across SkillAura opportunities.', JavaScript: 'The language behind interactive products, dashboards, and modern web experiences.', React: 'A practical UI skill for building fast, composable product interfaces.', SQL: 'The data layer skill that helps teams turn product questions into decisions.', Git: 'A collaboration essential for shipping confidently with technical teams.', Communication: 'The multiplier that helps strong technical work create real-world impact.' };
					detail.querySelector('h3').textContent = skill[0];
					detail.querySelector('p').textContent = descriptions[skill[0]];
					detail.querySelector('strong').textContent = `${skill[1]}% readiness`;
					detail.querySelector('.bar span').style.width = `${skill[1]}%`;
				});
			});
			landingRoot.querySelectorAll('.home-opportunity-card').forEach((card) => card.addEventListener('keydown', (event) => {
				if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); card.querySelector('[data-action="view-opportunity"]').click(); }
			}));
			landingRoot.querySelectorAll('.home-opportunity-card').forEach((card) => card.addEventListener('click', (event) => {
				if (event.target.closest('button, a')) return;
				card.querySelector('[data-action="view-opportunity"]').click();
			}));
			landingRoot.querySelectorAll('.home-opportunity-card [data-action="view-opportunity"]').forEach((button) => button.addEventListener('click', (event) => {
				event.stopPropagation();
				const opportunity = opportunityByTitle(button.dataset.title);
				if (opportunity) document.body.insertAdjacentHTML('beforeend', detailModal(opportunity));
			}));
			landingRoot.querySelectorAll('[data-stat-value]').forEach((stat) => {
				stat.querySelector('strong').textContent = `0${stat.dataset.statSuffix || ''}`;
			});
			const statsObserver = new IntersectionObserver((entries, observer) => {
				if (!entries.some((entry) => entry.isIntersecting)) return;
				landingRoot.querySelectorAll('[data-stat-value]').forEach((stat) => {
					const target = Number(stat.dataset.statValue);
					const value = stat.querySelector('strong');
					const suffix = stat.dataset.statSuffix || '';
					if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
						value.textContent = `${target.toLocaleString()}${suffix}`;
						return;
					}
					const start = performance.now();
					const animate = (now) => { const progress = Math.min(1, (now - start) / 700); value.textContent = `${Math.round(target * (1 - Math.pow(1 - progress, 3))).toLocaleString()}${suffix}`; if (progress < 1) requestAnimationFrame(animate); };
					requestAnimationFrame(animate);
				});
				observer.disconnect();
			}, { threshold: .35 });
			statsObserver.observe(landingRoot.querySelector('.home-stats'));
			const ecosystemSteps = [...landingRoot.querySelectorAll('.home-ecosystem-step')];
			const ecosystemObserver = new IntersectionObserver((entries) => {
				entries.forEach((entry) => {
					if (!entry.isIntersecting) return;
					const index = ecosystemSteps.indexOf(entry.target);
					ecosystemSteps.forEach((step, stepIndex) => step.classList.toggle('active', stepIndex === index));
					landingRoot.querySelectorAll('.home-ecosystem-node').forEach((node, nodeIndex) => node.classList.toggle('active', nodeIndex === Math.min(2, Math.floor(index / 2))));
				});
			}, { threshold: .55 });
			ecosystemSteps.forEach((step) => ecosystemObserver.observe(step));
		}

		function animatePercentages(root = document) {
			const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			const textNodes = [];
			const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
			let node;
			while ((node = walker.nextNode())) {
				if (node.parentElement?.closest('[data-stat-value], script, style')) continue;
				const match = node.nodeValue.match(/(\d+(?:\.\d+)?)%/);
				if (match) textNodes.push({ node, value: Number(match[1]), source: node.nodeValue, token: match[0] });
			}
			const bars = [...root.querySelectorAll('.bar > span[style*="width"]')].map((bar) => ({
				bar,
				value: Number.parseFloat(bar.style.width) || 0
			}));
			if (reduceMotion) return;
			textNodes.forEach((item) => { item.node.nodeValue = item.source.replace(item.token, '0%'); });
			bars.forEach((item) => { item.bar.style.width = '0%'; });
			const start = performance.now();
			const duration = 650;
			const tick = (now) => {
				const progress = Math.min(1, (now - start) / duration);
				const eased = 1 - Math.pow(1 - progress, 3);
				textNodes.forEach((item) => {
					item.node.nodeValue = item.source.replace(item.token, `${Math.round(item.value * eased)}%`);
				});
				bars.forEach((item) => { item.bar.style.width = `${item.value * eased}%`; });
				if (progress < 1) requestAnimationFrame(tick);
			};
			requestAnimationFrame(tick);
		}

		function setupLandingExperience() {
			const landingRoot = document.querySelector('.landing');
			if (!landingRoot) {
				teardownLandingExperience();
				return;
			}
			document.body.classList.add('home-page');
			enhanceHomePage(landingRoot);
			window.__skillAuraScrollFrame = null;
			window.__skillAuraScrollHandler = () => {
					if (window.__skillAuraScrollFrame) return;
					window.__skillAuraScrollFrame = requestAnimationFrame(() => {
						window.__skillAuraScrollFrame = null;
						updateGlobalBackground();
					});
				};
			window.__skillAuraResizeHandler = updateGlobalBackground;
			window.addEventListener('scroll', window.__skillAuraScrollHandler, { passive: true });
			window.addEventListener('resize', window.__skillAuraResizeHandler, { passive: true });
			const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			const revealTargets = landingRoot.querySelectorAll('.hero > *, .section-heading, .section > .container > .grid-3 > *, .solution > *, .steps > *, .feature-grid > *, .cta .container, footer .footer-grid, .home-stats, .home-skill-layout, .home-opportunity-grid, .home-ecosystem-grid, .home-final-cta .container');
			revealTargets.forEach((element) => element.classList.add('reveal'));
			if (window.__skillAuraRevealObserver) window.__skillAuraRevealObserver.disconnect();
			window.__skillAuraRevealObserver = new IntersectionObserver((entries, observer) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add('is-visible');
						observer.unobserve(entry.target);
					}
				});
			}, { threshold: .12, rootMargin: '0px 0px -8% 0px' });
			revealTargets.forEach((element) => window.__skillAuraRevealObserver.observe(element));
			if (reducedMotion) revealTargets.forEach((element) => element.classList.add('is-visible'));

			requestAnimationFrame(updateGlobalBackground);
		}
		function setupPageMotion() {
			if (document.querySelector('.landing')) return;
			const targets = document.querySelectorAll('.app .topbar, .app .sidebar, .app .dash-content > *, .app .kpi, .app .dash-panel > *, .app .opportunity-card, .app .mini-card, .app .action, .auth > *, .auth .form, .role-page .role-select, .role-page .role-option, .placeholder-card');
			if (!targets.length) return;
			document.body.classList.add('motion-page');
			targets.forEach((element) => element.classList.add('page-reveal'));
			const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			if (reducedMotion) {
				targets.forEach((element) => element.classList.add('is-visible'));
				return;
			}
			window.__skillAuraRevealObserver = new IntersectionObserver((entries, observer) => {
				entries.forEach((entry) => {
					if (!entry.isIntersecting) return;
					entry.target.classList.add('is-visible');
					observer.unobserve(entry.target);
				});
			}, { threshold: .08, rootMargin: '0px 0px -6% 0px' });
			targets.forEach((element) => window.__skillAuraRevealObserver.observe(element));
		}
		function bindThemeToggle() {
			const toggleHost = document.querySelector('.auth-aside, .role-top');
			if (toggleHost && !toggleHost.querySelector('[data-theme-toggle]')) toggleHost.insertAdjacentHTML('afterbegin', themeToggleMarkup());
			document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
				button.onclick = () => setTheme(selectedTheme === 'dark' ? 'light' : 'dark');
			});
		}
		function renderFunctional() {
			const path = location.hash.slice(1) || '/';
			ensureEcosystem();
			teardownLandingExperience();
			if (path && !path.startsWith('/')) { if (document.querySelector('.landing')) document.getElementById(path)?.scrollIntoView(); return; }
			const match = path.match(/^\/(student|company|industry|institution)\/(dashboard|profile|skills|opportunities|applications|shortlist|interviews|offers|messages|notifications|settings|candidates|analytics|partnerships|career-path|post-opportunity|programs|onboarding|assessment|skill-profile|skill-gaps|learning-recommendations|students|assessments|learning|internships|placements|industry|faculty|reports)$/);
			const session = currentStudentSession();
			if (path.startsWith('/student/') && !currentStudentAccount()) { go('/login'); return; }
			if (path.startsWith('/student/') && currentStudentAccount()) hydrateStudentAccount(currentStudentAccount());
			if ((path.startsWith('/company/') && !['/company/login', '/company/register'].includes(path)) || (path.startsWith('/institution/') && !['/institution/login', '/institution/register'].includes(path))) {
				const expectedRole = path.startsWith('/company/') ? 'company' : 'institution';
				if (expectedRole === 'institution' && !currentInstitutionAccount()) { go('/institution/login'); return; }
				const currentRole = normalizeRole(session && session.role ? session.role : (currentStudentAccount() && currentStudentAccount().role) || state.activeRole);
				if (currentRole !== expectedRole) {
					const redirect = currentRole === 'student' ? '/student/dashboard' : currentRole === 'company' ? '/company/dashboard' : currentRole === 'institution' ? '/institution/dashboard' : '/role-selection';
					if (redirect !== path) { go(redirect); return; }
				}
			}
			if (path.startsWith('/student/') && session && session.role && session.role !== 'student') {
				go(dashboardRouteForRole(session.role)); return;
			}
			if (path === '/') app.innerHTML = landing();
			else if (path === '/login' || path === '/register') app.innerHTML = authPage(path.slice(1));
			else if (path === '/company/login' || path === '/company/register') app.innerHTML = companyAuthPage(path.split('/')[2]);
			else if (path === '/company/onboarding') app.innerHTML = companyOnboardingPage();
			else if (path === '/institution/login' || path === '/institution/register') app.innerHTML = institutionAuthPage(path.split('/')[2]);
			else if (path === '/institution/onboarding') app.innerHTML = institutionOnboardingPage();
			else if (path === '/forgot-password') app.innerHTML = recoveryPage();
			else if (path === '/reset-password') app.innerHTML = recoveryPage(true);
			else if (path === '/role-selection') app.innerHTML = roleSelection();
			else if (match) { const [, role, section] = match; const normalizedRole = normalizeRole(role); const pages = { dashboard: normalizedRole === 'student' ? studentDashboardPage : normalizedRole === 'company' ? companyDashboardPage : institutionDashboardPage, profile: normalizedRole === 'company' ? companyProfilePage : normalizedRole === 'institution' ? institutionProfilePage : () => profilePage(normalizedRole), skills: normalizedRole === 'student' ? skillsPage : normalizedRole === 'institution' ? institutionSkillsAnalyticsPage : institutionSkillsPage, opportunities: normalizedRole === 'company' ? companyOpportunitiesPage : () => opportunitiesPage(normalizedRole), applications: normalizedRole === 'student' ? studentApplicationsPage : normalizedRole === 'company' ? companyApplicationsPage : () => applicationsPage(normalizedRole), shortlist: companyShortlistPage, interviews: normalizedRole === 'student' ? studentInterviewsPage : companyInterviewsPage, offers: studentOffersPage, messages: companyMessagesPage, notifications: normalizedRole === 'student' ? studentNotificationsPage : normalizedRole === 'institution' ? institutionNotificationsPage : companyNotificationsPage, settings: normalizedRole === 'institution' ? institutionSettingsPage : () => settingsPage(normalizedRole), 'career-path': careerPage, candidates: companyCandidatesPage, analytics: normalizedRole === 'company' ? companyAnalyticsPage : normalizedRole === 'institution' ? institutionAnalyticsPage : () => analyticsPage(normalizedRole), partnerships: normalizedRole === 'institution' ? institutionPartnershipsPage : partnershipsPage, 'post-opportunity': normalizedRole === 'company' ? companyOpportunityFormPage : postOpportunityPage, programs: programsPage, onboarding: normalizedRole === 'company' ? companyOnboardingPage : normalizedRole === 'institution' ? institutionOnboardingPage : onboardingPage, assessment: normalizedRole === 'student' ? assessmentPage : institutionAssessmentsPage, 'skill-profile': skillProfilePage, 'skill-gaps': normalizedRole === 'institution' ? institutionSkillGapsPage : skillGapsPage, 'learning-recommendations': learningRecommendationsPage, students: institutionStudentsPage, assessments: institutionAssessmentsPage, learning: institutionLearningPage, internships: normalizedRole === 'student' ? studentInternshipsPage : institutionInternshipsPage, placements: normalizedRole === 'student' ? studentPlacementsPage : institutionPlacementsPage, industry: institutionIndustryPage, faculty: institutionFacultyPage, reports: institutionReportsPage }; app.innerHTML = pages[section] ? pages[section]() : notFound(); }
			else app.innerHTML = notFound();
			bindFunctionalEvents();
			setupLandingExperience();
			setupPageMotion();
			animatePercentages(app);
			bindThemeToggle();
			initChatbot();
		}
		window.removeEventListener('hashchange', render);
		window.addEventListener('hashchange', renderFunctional);
		renderFunctional();
