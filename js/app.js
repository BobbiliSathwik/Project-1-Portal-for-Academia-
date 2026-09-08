		const data = {
			student: {
				name: 'Rahul Kumar',
				role: 'Student/Employee • 3rd Year',
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
			'skill-gaps': '⚠',
			learning: '▤',
			assessments: '✓',
			jobs: '▣',
			opportunities: '▣',
			applications: '▤',
			briefcase: '▤',
			internships: '◈',
			placements: '↗',
			interviews: '◷',
			offers: '◆',
			'csr-opportunities': '♡',
			'csr-applications': '♡',
			'csr-programs': '♡',
			'csr-create': '＋',
			'csr-participants': '♙',
			'csr-analytics': '▥',
			candidates: '♙',
			analytics: '▥',
			notifications: '◌',
			'skill-gaps': '⚠',
			students: '♙',
			faculty: '♙',
			partnerships: '◎',
			reports: '▥',
			messages: '□',
			programs: '◈',
			'career-path': '◎',
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
		const LEGACY_USER_KEYS = ['skillaura-current-user', 'skillaura_current_user'];
		function readStoredSession() {
			for (const key of LEGACY_USER_KEYS) {
				try {
					const value = localStorage.getItem(key);
					if (!value) continue;
					const parsed = JSON.parse(value);
					if (parsed && typeof parsed === 'object') return parsed;
				} catch (error) {}
			}
			return null;
		}
		function writeStoredSession(session) {
			for (const key of LEGACY_USER_KEYS) {
				try { localStorage.setItem(key, JSON.stringify(session)); } catch (error) {}
			}
		}
		const selectedTheme = 'dark';
		document.documentElement.dataset.theme = 'dark';
		let chatbotState = {
			lastOpportunity: null,
			pendingApplication: null,
			memory: {}
		};
		let globalSearchState = { query: '', results: [], activeIndex: -1, open: false };

		function brand() {
			return `<a class="brand" href="#/"><span class="brand-mark">↗</span>SkillAura</a>`;
		}

		function setMobileNavState(isOpen) {
			const nav = document.getElementById('navlinks');
			const button = document.querySelector('.mobile-menu');
			if (!nav || !button) return;
			nav.classList.toggle('open', isOpen);
			button.setAttribute('aria-expanded', String(isOpen));
			button.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
			button.textContent = isOpen ? '×' : '☰';
		}

		function currentAuthSession() {
			try {
				const session = readStoredSession();
				if (!session || typeof session !== 'object') return null;
				if (session.loggedIn === false && !session.role && !session.userId && !session.id) return null;
				const normalized = {
					loggedIn: true,
					role: normalizeRole(session.role || session.accountRole || 'student'),
					userId: session.userId || session.id || null,
					name: session.name || session.fullName || '',
					email: session.email || '',
					companyId: session.companyId || null,
					institutionId: session.institutionId || null
				};
				return { ...session, ...normalized, loggedIn: true };
			} catch (error) {
				return null;
			}
		}

		function persistAuthSession(session) {
			if (!session || !session.role) return;
			const payload = {
				...session,
				loggedIn: true,
				role: normalizeRole(session.role),
				userId: session.userId || session.id || null,
				name: session.name || session.fullName || '',
				email: session.email || '',
				companyId: session.companyId || null,
				institutionId: session.institutionId || null,
				loggedIn: true
			};
			writeStoredSession(payload);
		}

		function currentUserDashboardRoute() {
			const session = currentAuthSession();
			const role = normalizeRole(session?.role || session?.accountRole || 'student');
			if (role === 'company') return '/company/dashboard';
			if (role === 'institution') return '/institution/dashboard';
			return '/student/dashboard';
		}

		function landing() {
			const auth = currentAuthSession();
			const isLoggedIn = Boolean(auth?.loggedIn);
			const dashboardRoute = currentUserDashboardRoute();
			const authenticatedNav = isLoggedIn ? `<a href="#${dashboardRoute}">${roleLabel(normalizeRole(auth.role))} Dashboard</a><a href="#/${normalizeRole(auth.role)}/profile">Profile</a><button class="btn btn-light" type="button" data-action="logout">Logout</button>` : `<a class="btn btn-primary" href="#/role-selection">Get Started ↗</a>`;
			return `<div class="landing"><nav class="navbar container">${brand()}<div class="navlinks" id="navlinks"><a href="#/">Home</a><a href="#how">How It Works</a><a href="#roles">For Student/Employees</a><a href="#roles">For Industry</a><a href="#roles">For Institutions</a><a href="#about">About</a></div><div class="nav-actions">${authenticatedNav}<button class="mobile-menu" type="button" aria-expanded="false" aria-label="Open navigation menu">☰</button></div></nav>
			<section class="hero"><div class="hero-atmosphere" aria-hidden="true"><span class="hero-particle particle-one"></span><span class="hero-particle particle-two"></span><span class="hero-particle particle-three"></span><span class="hero-particle particle-four"></span><span class="hero-thread thread-one"></span><span class="hero-thread thread-two"></span></div><div class="container hero-copy"><div class="eyebrow">The collaboration layer for tomorrow's careers</div><div class="hero-wordmark" aria-label="SkillAura">Skill<span>Aura</span></div><h1>Connecting Skills, Academia <span>&amp; Industry</span></h1><p>Bridge the gap from learning to impact through verified skills, personalized career guidance, internships, jobs, and industry collaboration.</p><div class="hero-actions"><a class="btn btn-primary" href="#/role-selection">Get Started ↗</a><a class="btn btn-light" href="#how">Explore Platform ↓</a></div></div><div class="ecosystem"><div class="ecosystem-label"><span>SkillAura ecosystem</span><span>01 — 05</span></div><div class="flow"><div class="flow-item"><i>♙</i>Student/Employee</div><div class="flow-arrow">↓</div><div class="flow-item"><i>✦</i>Skills &amp; Verification</div><div class="flow-arrow">↓</div><div class="flow-item"><i>◈</i>Industry Opportunity</div><div class="flow-arrow">↓</div><div class="flow-item"><i>◎</i>Career Growth</div></div></div></section>
			<section class="section" id="about"><div class="container"><div class="section-heading"><div class="eyebrow">Why SkillAura</div><h2>The Skill Gap Problem</h2><p>Talent is everywhere. The right connections and signals are not.</p></div><div class="grid-3"><div class="card problem-card"><div class="icon-box">♙</div><h3>Student/Employees</h3><p>Clarity is hard to find when the path from learning to career is fragmented.</p><ul class="checklist"><li>Know which skills matter</li><li>Find relevant internships</li></ul></div><div class="card problem-card"><div class="icon-box">▤</div><h3>Industry</h3><p>Recruiters need better signals to find capable, motivated early talent.</p><ul class="checklist"><li>Reach suitable candidates</li><li>Identify genuine competencies</li></ul></div><div class="card problem-card"><div class="icon-box">⌂</div><h3>Institutions</h3><p>Colleges need a clear view of readiness, outcomes, and industry demand.</p><ul class="checklist"><li>Track skill development</li><li>Build industry partnerships</li></ul></div></div></div></section>
			<section class="section soft"><div class="container solution"><div><div class="eyebrow">A connected journey</div><h2>One Platform. Multiple Stakeholders.</h2><p class="solution-copy">From the first assessment to the first opportunity, SkillAura gives every stakeholder a shared view of progress and potential.</p><a class="btn btn-primary" href="#/role-selection" style="margin-top:25px">Choose your workspace ↗</a></div><div class="card stack"><div class="stack-row"><span class="step-num">01</span>Student/Employee profile</div><div class="stack-row"><span class="step-num">02</span>Skill assessment</div><div class="stack-row"><span class="step-num">03</span>Verified profile</div><div class="stack-row"><span class="step-num">04</span>Learning &amp; career guidance</div><div class="stack-row"><span class="step-num">05</span>Internship / job matching</div><div class="stack-row"><span class="step-num">06</span>Industry collaboration ↕</div></div></div></section>
			<section class="section" id="how"><div class="container"><div class="section-heading"><div class="eyebrow">Simple by design</div><h2>How It Works</h2></div><div class="steps">${[['01','Create Your Profile','Role-based profiles for every stakeholder.'],['02','Discover Opportunities','Explore skills, programs, and real opportunities.'],['03','Verify & Improve','Build confidence through assessments and learning.'],['04','Connect','Meet mentors, teams, institutions, and employers.'],['05','Track Progress','See development, applications, and outcomes.']].map(x=>`<div class="step"><strong>${x[0]}</strong><h3>${x[1]}</h3><p>${x[2]}</p></div>`).join('')}</div></div></section>
			<section class="section soft" id="roles"><div class="container"><div class="section-heading"><div class="eyebrow">One ecosystem</div><h2>Built for the Entire Academia–Industry Ecosystem</h2></div><div class="grid-3"><div class="card role-card student"><div class="icon-box">♙</div><h3>Student/Employee</h3><p>Find internships, jobs, learning programs, and career guidance.</p><a class="btn btn-light" href="#/role-selection">Explore as Student/Employee →</a></div><div class="card role-card industry"><div class="icon-box">▤</div><h3>Industry</h3><p>Find skilled candidates and collaborate with institutions.</p><a class="btn btn-light" href="#/role-selection">Explore as Industry →</a></div><div class="card role-card institution"><div class="icon-box">⌂</div><h3>Institution</h3><p>Monitor student readiness and build industry partnerships.</p><a class="btn btn-light" href="#/role-selection">Explore as Institution →</a></div></div></div></section>
			<section class="section"><div class="container"><div class="section-heading"><div class="eyebrow">Coming together</div><h2>Preview the Platform</h2></div><div class="feature-grid">${['Skill Assessment','Verified Skills','Career Guidance','Internship & Job Matching','Industry Learning Programs','Institution Analytics'].map((x,i)=>`<div class="feature"><div class="icon-box">${['✦','✓','◎','▣','◈','▥'][i]}</div><strong>${x}</strong></div>`).join('')}</div></div></section><section class="cta"><div class="container"><h2>Build a Stronger Bridge Between Education and Industry</h2><p>From learning new skills to finding the right opportunity, SkillAura brings the complete journey into one platform.</p><a class="btn btn-primary" href="#/role-selection">Get Started ↗</a></div></section><footer><div class="container"><div class="footer-grid"><div>${brand()}<p style="margin-top:14px">Connecting Skills, Academia &amp; Industry.</p></div><div><h4>Platform</h4><a href="#/role-selection">Students</a><a href="#/role-selection">Industry</a><a href="#/role-selection">Institutions</a><a href="#/role-selection">Opportunities</a></div><div><h4>Company</h4><a href="#about">About</a><a href="#">Contact</a><a href="#">Privacy</a><a href="#">Terms</a></div><div><h4>Social</h4><p>LinkedIn · X · Instagram</p></div></div><div class="copyright">© 2026 SkillAura. All rights reserved.</div></div></footer></div>`
		}

		function updateRoleFields(role) {
			const target = document.getElementById('role-fields');
			if (!target) return;

			const fields = role === 'Student/Employee' ?
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
			return `<div class="auth"><aside class="auth-aside">${brand()}<div><div class="eyebrow" style="color:var(--cyan)">Connecting Skills, Academia &amp; Industry</div><h1>${register ? 'Start building your bridge.' : 'Your next opportunity starts here.'}</h1><p>${register ? 'Create a role-based workspace designed for the journey from learning to impact.' : 'One clear view of your skills, opportunities, and the people helping you move forward.'}</p></div><div class="auth-note">Day 1 prototype · Demo access available</div></aside><main class="auth-main"><div class="form-wrap"><a class="btn-plain" href="#/">← Back to home</a><h2 style="margin-top:27px">${register ? 'Create your account' : 'Welcome back'}</h2><p>${register ? 'Set up your SkillAura workspace in a few seconds.' : 'Enter your details or jump straight into a demo workspace.'}</p><div class="form">${register ? `<label>Full Name</label><input placeholder="Your full name"><label>Email</label><input type="email" placeholder="you@example.com"><label>Password</label><input type="password" placeholder="••••••••"><label>Confirm Password</label><input type="password" placeholder="••••••••"><label>Institution / Organization</label><input placeholder="Your institution or organization"><label>Role</label><select onchange="updateRoleFields(this.value)"><option>Student</option><option>Industry</option><option>Institution</option></select><div id="role-fields"></div><button class="btn btn-primary" onclick="location.hash='#/role-selection'">Create Account</button>` : `<label>Email</label><input type="email" placeholder="you@example.com"><label>Password</label><input type="password" placeholder="••••••••"><div class="form-row"><label><input type="checkbox"> Remember me</label><a href="#" class="btn-plain">Forgot password?</a></div><button class="btn btn-primary" onclick="location.hash='#/role-selection'">Login</button><div class="divider">or continue as demo</div><div class="demo-grid"><button class="demo-btn" onclick="location.hash='#/student/dashboard'">Demo Student</button><button class="demo-btn" onclick="location.hash='#/industry/dashboard'">Demo Industry</button><button class="demo-btn" onclick="location.hash='#/institution/dashboard'">Demo Institution</button></div>`}</div><div class="switch">${register ? 'Already have an account?' : 'Don\'t have an account?'} <a href="#/${register ? 'login' : 'register'}">${register ? 'Login' : 'Create one'}</a></div></div></main></div>`
		}

		function portalLoginRoute(role) { const normalizedRole = normalizeRole(role); return normalizedRole === 'company' ? '/company/login' : normalizedRole === 'institution' ? '/institution/login' : '/login'; }
		function roleSelection() {
			return `<div class="role-page"><div class="container role-top"><a class="btn-plain" href="#/">← Home</a>${brand()}</div><div class="role-select"><div class="eyebrow">SkillAura portal entry</div><h1>How would you like to use SkillAura?</h1><p>Choose the workspace that matches your goals.</p><div class="role-options"><button class="role-option" type="button" data-action="choose-role" data-role="student"><div class="icon-box">♙</div><h2>Student/Employee</h2><p>Build skills, take assessments, discover opportunities and grow your career.</p><strong>Learn → Assess → Improve → Apply</strong><span class="btn btn-primary">Enter Student/Employee Portal →</span></button><button class="role-option" type="button" data-action="choose-role" data-role="institution"><div class="icon-box">⌂</div><h2>Institution</h2><p>Manage students, monitor skill development and connect with industry.</p><strong>Develop Students → Track Skills → Connect Industry</strong><span class="btn btn-primary">Enter Institution Portal →</span></button><button class="role-option" type="button" data-action="choose-role" data-role="company"><div class="icon-box">▤</div><h2>Company</h2><p>Find skilled candidates, post opportunities and recruit talent.</p><strong>Post Opportunities → Find Talent → Recruit</strong><span class="btn btn-primary">Enter Company Portal →</span></button></div></div></div>`;
		}
		const dashboardRoutes = {
			student: {
				dashboard: 'Dashboard',
				profile: 'My Profile',
				skills: 'My Skills',
				opportunities: 'Opportunities',
				applications: 'Applications',
				'csr-opportunities': 'CSR Opportunities',
				'csr-applications': 'My CSR Applications',
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
				'csr-programs': 'CSR Programs',
				'csr-create': 'Create CSR Program',
				'csr-applications': 'CSR Applications',
				'csr-participants': 'CSR Participants',
				'csr-analytics': 'CSR Impact',
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
			},
			tutor: {
				dashboard: 'Dashboard',
				courses: 'My Courses',
				profile: 'Tutor Profile',
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
			const navigation = role === 'student' ? studentSidebarNavigation(current) : items.map(([key,label]) => `<a class="side-item ${key===current?'active':''}" href="#/${role}/${key}" onclick="closeSidebar()" title="${label}" data-tooltip="${label}"><span class="side-icon" aria-hidden="true">${icons[key]||'◉'}</span><span class="side-label">${label}</span></a>`).join('');
			return `<aside class="sidebar" id="sidebar"><div class="side-brand">${brand()}</div><nav class="side-nav" aria-label="Workspace navigation">${navigation}</nav><div class="side-spacer"></div><a class="side-item ${current==='settings'?'active':''}" href="#/${role}/settings" onclick="closeSidebar()" title="Settings" data-tooltip="Settings"><span class="side-icon" aria-hidden="true">⚙</span><span class="side-label">Settings</span></a><button class="side-pin" data-action="sidebar-pin" type="button" aria-pressed="false" aria-label="Pin sidebar" title="Pin sidebar">⌖</button><button class="logout" onclick="location.hash='#/'" title="Logout" data-tooltip="Logout"><span class="side-icon" aria-hidden="true">↪</span><span class="side-label">Logout</span></button></aside>`
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
		function studentSidebarNavigation(current) {
			const profileItems = [['profile', 'Profile Overview', '◉'], ['skills', 'My Skills', '✦'], ['assessment', 'My Assessments', '✓'], ['interviews', 'Interviews', '◷']];
			const csrItems = [['csr-opportunities', 'CSR Opportunities', '♡'], ['csr-applications', 'My CSR Applications', '▤']];
			const profileOpen = profileItems.some(([key]) => key === current);
			const csrOpen = csrItems.some(([key]) => key === current);
			const childLinks = (items) => items.map(([key, label, icon]) => `<a class="side-subitem ${key === current ? 'active' : ''}" href="#/student/${key}" onclick="closeSidebar()" title="${label}" data-tooltip="${label}"><span class="side-icon" aria-hidden="true">${icon}</span><span class="side-label">${label}</span></a>`).join('');
			const parent = (key, label, icon, open, items) => `<div class="side-group ${open ? 'submenu-open' : ''}"><button class="side-parent" type="button" data-action="sidebar-submenu" data-submenu="${key}" aria-expanded="${open}" title="${label}" data-tooltip="${label}"><span class="side-icon" aria-hidden="true">${icon}</span><span class="side-label">${label}</span><span class="side-chevron" aria-hidden="true">⌄</span></button><div class="side-submenu">${childLinks(items)}</div></div>`;
			const link = (key, label, icon) => `<a class="side-item ${key === current ? 'active' : ''}" href="#/student/${key}" onclick="closeSidebar()" title="${label}" data-tooltip="${label}"><span class="side-icon" aria-hidden="true">${icon}</span><span class="side-label">${label}</span></a>`;
			return `${link('dashboard', 'Dashboard', '⌂')}${parent('profile', 'My Profile', '◉', profileOpen, profileItems)}${link('opportunities', 'Opportunities', '▣')}${link('applications', 'Applications', '▤')}${parent('csr', 'CSR', '♡', csrOpen, csrItems)}${link('internships', 'Internships', '◈')}${link('placements', 'Placements', '↗')}${link('career-path', 'Career Path', '◎')}`;
		}

		const SIDEBAR_PIN_KEY = 'skillaura-sidebar-pinned';
		function isSidebarPinned() {
			try { return localStorage.getItem(SIDEBAR_PIN_KEY) === 'true'; } catch (error) { return false; }
		}
		function setSidebarPinned(pinned) {
			try { localStorage.setItem(SIDEBAR_PIN_KEY, String(pinned)); } catch (error) { }
			const sidebarElement = document.getElementById('sidebar');
			if (!sidebarElement) return;
			sidebarElement.classList.toggle('pinned', pinned);
			sidebarElement.closest('.app')?.classList.toggle('sidebar-pinned', pinned);
			const button = sidebarElement.querySelector('[data-action="sidebar-pin"]');
			if (button) {
				button.setAttribute('aria-pressed', String(pinned));
				button.setAttribute('aria-label', pinned ? 'Unpin sidebar' : 'Pin sidebar');
				button.title = pinned ? 'Unpin sidebar' : 'Pin sidebar';
			}
		}
		function setupSidebarState() {
			const sidebarElement = document.getElementById('sidebar');
			if (sidebarElement) setSidebarPinned(isSidebarPinned());
		}

		function chatbotMarkup() {
			const role = currentRole();
			const prompts = {
				student: [
					'Analyze My Skills',
					'Find My Skill Gaps',
					'Recommend Internships',
					'Recommend Jobs',
					'Create My Career Roadmap',
					'Prepare Me for an Interview',
					'Improve My Resume',
					'Give Me Practice Questions',
					'What Should I Learn Next?',
					'Improve My Weak Skills'
				],
				company: [
					'Find Matching Candidates',
					'Create Job Description',
					'Create Internship',
					'Generate Interview Questions',
					'Generate Technical Assessment',
					'Analyze Candidate Pool',
					'Identify In-Demand Skills'
				],
				institution: [
					'Analyze Student Skills',
					'Find Common Skill Gaps',
					'Check Placement Readiness',
					'Recommend Training Programs',
					'Suggest Industry Collaborations',
					'Analyze Internship Participation',
					'Suggest Workshops',
					'Generate Placement Report'
				]
			};
			const icon = role === 'company' ? '▤' : role === 'institution' ? '⌂' : '♙';
			const labels = prompts[role] || prompts.student;
			return `<button class="ai-launcher" type="button" aria-label="Open SkillAura AI Assistant" aria-expanded="false">
				<span class="ai-launcher-icon" aria-hidden="true">✦</span>
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
			const studentId = currentStudentAccount()?.id || currentStudentSession()?.id || state.student?.id;
			const ecosystem = sharedEcosystem();
			const assessments = state.assessments || [];
			const applications = ecosystem.applications.filter((item) => item.studentId === studentId);
			const interviews = ecosystem.interviews.filter((item) => item.studentId === studentId);
			const offers = ecosystem.offers.filter((item) => item.studentId === studentId);
			const internships = ecosystem.internships.filter((item) => item.studentId === studentId);
			const placements = ecosystem.placements.filter((item) => item.studentId === studentId);
			const notifications = currentEcosystemNotifications();
			const skills = (state.skills || []).length ? state.skills : assessments.map((assessment) => ({ name: assessment.skill, score: assessment.score, status: assessment.rating }));
			const gapList = (state.gaps || []).length ? state.gaps : skills.map((skill) => ({ name: skill.name, score: skill.score, target: 80 }));
			const opportunities = ecosystem.opportunities.filter((opportunity) => opportunity.status !== 'Draft').map((opportunity) => ({ ...opportunity, match: calculateCandidateMatch(opportunity, { ...profile, skills }) }));
			return {
				role: 'student',
				profile,
				skills,
				gaps: gapList,
				applications,
				interviews,
				offers,
				internships,
				placements,
				notifications,
				assessments,
				careers: state.careers || [],
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

		async function askAI(message, context, history = [], signal) {
			if (!AI_API_ENDPOINT || window.location.protocol === 'file:') return null;
			try {
				const response = await fetch(AI_API_ENDPOINT, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						message,
						context,
						conversation: history.slice(-8),
						config: {
							model: AI_CONFIG.model,
							temperature: AI_CONFIG.temperature,
							maxOutput: AI_CONFIG.maxOutput,
							systemPrompt: AI_CONFIG.systemPrompts[context.role] || AI_CONFIG.systemPrompts.student
						}
					}),
					signal
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

		const CAREER_ROADMAPS = {
			frontend: { label: 'Frontend Developer', skills: ['HTML and CSS', 'JavaScript', 'DOM, events, and asynchronous APIs', 'React', 'Git and GitHub', 'Testing and accessibility'], projects: ['Responsive portfolio', 'API-powered dashboard', 'Accessible React application'] },
			backend: { label: 'Backend Developer', skills: ['Programming fundamentals', 'HTTP, REST, and APIs', 'Python or Node.js', 'SQL and data modeling', 'Authentication and security', 'Testing and deployment'], projects: ['REST API with authentication', 'Database-backed service', 'Deployed backend for a real client'] },
			data: { label: 'Data Analyst', skills: ['Excel or spreadsheets', 'SQL', 'Statistics', 'Python for data cleaning', 'Power BI or Tableau', 'Portfolio storytelling'], projects: ['SQL business analysis', 'Clean and visualize a public dataset', 'End-to-end KPI dashboard'] },
			ai: { label: 'AI / Machine Learning Engineer', skills: ['Python', 'Linear algebra and probability', 'Data preparation', 'Machine learning fundamentals', 'Model evaluation', 'Deployment and MLOps basics'], projects: ['Prediction model with evaluation', 'NLP or computer vision prototype', 'Deployed model API'] },
			fullstack: { label: 'Full Stack Developer', skills: ['HTML, CSS, and JavaScript', 'React', 'Node.js or Python', 'SQL', 'APIs and authentication', 'Git, testing, and deployment'], projects: ['Full-stack task manager', 'Role-based application', 'Deployed product with documentation'] },
			java: { label: 'Java Developer', skills: ['Java fundamentals', 'Object-oriented design', 'Collections and DSA', 'Spring and REST APIs', 'SQL', 'Testing and deployment'], projects: ['Spring CRUD API', 'Authentication service', 'Production-style backend'] }
		};

		const SKILL_ALIASES = {
			javascript: ['javascript', 'js', 'java script'], python: ['python', 'pyhton', 'py'], react: ['react', 'reactjs', 'react.js'], html: ['html', 'html/css', 'html5'], css: ['css', 'html/css'], sql: ['sql'], git: ['git', 'github'], node: ['node', 'node.js', 'nodejs'], java: ['java'], excel: ['excel', 'spreadsheets'], statistics: ['statistics', 'stats'], typescript: ['typescript', 'ts'], dsa: ['dsa', 'data structures', 'algorithms'], machineLearning: ['machine learning', 'ml', 'machne learning', 'ai'], frontend: ['frontend', 'front end', 'front-end'], backend: ['backend', 'back end', 'back-end'], data: ['data analyst', 'data analysis', 'data science']
		};

		function normalizedAssistantText(value) {
			return String(value || '').toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9/.+#\s-]/g, ' ').replace(/\s+/g, ' ').trim();
		}

		function assistantMentions(message, aliases = SKILL_ALIASES) {
			const query = normalizedAssistantText(message);
			return Object.entries(aliases).filter(([, terms]) => terms.some((term) => query.includes(normalizedAssistantText(term)))).map(([key]) => key);
		}

		function assistantCareerKey(message, memory = {}) {
			const query = normalizedAssistantText(message);
			if (/(front ?end|ui developer|web interface)/.test(query)) return 'frontend';
			if (/(back ?end|server side|api developer)/.test(query)) return 'backend';
			if (/(data analyst|data analysis)/.test(query)) return 'data';
			if (/(machine learning|\bai\b|artificial intelligence)/.test(query)) return 'ai';
			if (/(full ?stack)/.test(query)) return 'fullstack';
			if (/(java developer|spring boot)/.test(query)) return 'java';
			return memory.careerKey || null;
		}

		function assistantSkillLabel(key) {
			return { javascript: 'JavaScript', python: 'Python', react: 'React', html: 'HTML', css: 'CSS', sql: 'SQL', git: 'Git', node: 'Node.js', java: 'Java', excel: 'Excel', statistics: 'Statistics', typescript: 'TypeScript', dsa: 'Data Structures and Algorithms', machineLearning: 'Machine Learning' }[key] || key;
		}

		function assistantStudentSkill(context, key) {
			const labels = SKILL_ALIASES[key] || [key];
			return (context.skills || []).find((item) => labels.some((label) => normalizedAssistantText(item.name).includes(normalizedAssistantText(label)) || normalizedAssistantText(label).includes(normalizedAssistantText(item.name))));
		}

		function assistantOpportunityCards(opportunities) {
			return opportunities.slice(0, 5).map((item) => `<div class="ai-result-card"><div class="ai-result-top"><span class="tag success">${esc(item.match ?? calculateCandidateMatch(item))}% match</span><span>${esc(item.location || 'Location not listed')}</span></div><strong>${esc(item.title || 'Opportunity')}</strong><span class="ai-result-company">${esc(item.company || 'Company not listed')}</span><span class="ai-result-skills">Required skills: ${esc(item.skills || extractSkillList(item.requirements?.required).join(', ') || 'Not listed')}</span></div>`).join('');
		}

		function assistantWebsiteResponse(message, context) {
			const query = normalizedAssistantText(message);
			const pages = { dashboard: ['Dashboard', 'Open Dashboard for your readiness overview and current activity.', 'OPEN_DASHBOARD'], profile: ['Profile', 'Open Profile to update your name, email, college, and other workspace details.', 'OPEN_PROFILE'], skills: ['My Skills', 'Open My Skills to review assessment results and take another skill assessment.', 'OPEN_SKILLS'], opportunities: ['Opportunities', 'Open Opportunities to search roles, view details, check requirements, and apply.', 'OPEN_OPPORTUNITIES'], applications: ['Applications', 'Open Applications to track opportunities you have applied for and their current status.', 'OPEN_APPLICATIONS'], interviews: ['Interviews', 'Open Interviews to see interview schedules shared by companies.', 'OPEN_INTERVIEWS'], offers: ['Offers', 'Open Offers to review offers connected to your applications.', 'OPEN_OFFERS'], internships: ['Internships', 'Open Internships to track active and completed internships.', 'OPEN_INTERNSHIPS'], placements: ['Placements', 'Open Placements to track accepted job outcomes.', 'OPEN_PLACEMENTS'], notifications: ['Notifications', 'Open Notifications to review updates from companies and institutions.', 'OPEN_NOTIFICATIONS'], 'career-path': ['Career Path', 'Open Career Path to compare directions matched to your current skills.', 'OPEN_CAREER'], settings: ['Settings', 'Open Settings to manage workspace preferences and log out.', 'OPEN_SETTINGS'] };
			const currentSection = context.currentPage.split('/')[2];
			const requested = Object.keys(pages).find((page) => query.includes(page.replace('-', ' ')) || (page === 'skills' && /skill profile/.test(query)));
			const page = pages[requested || (/(this page|this section|what is this|where am i)/.test(query) ? currentSection : '')];
			if (!page) return null;
			return { text: `**${page[0]}**\n\n${page[1]}`, action: { type: page[2] } };
		}

		function enhancedStudentResponse(message, context) {
			const query = normalizedAssistantText(message);
			const memory = chatbotState.memory || {};
			const careerKey = assistantCareerKey(message, memory);
			const mentionedSkills = assistantMentions(message);
			const skills = context.skills || [];
			const gaps = [...(context.gaps || [])].sort((a, b) => Number(a.score || 0) - Number(b.score || 0));
			const websiteAnswer = assistantWebsiteResponse(message, context);
			if (websiteAnswer && !/(what should i learn|roadmap|plan|skill|career|internship|application)/.test(query)) return websiteAnswer;

			if (/^\s*(roadmap|career roadmap|make me a roadmap|give me a roadmap)\s*[?.!]*$/.test(query)) {
				return { text: 'I can build that. Which career are you targeting: Frontend Development, Backend Development, Data Analysis, AI/ML, Full Stack, Java, or another path?' };
			}

			if (/(roadmap|path to become|how do i become|become a|career path)/.test(query)) {
				if (!careerKey || !CAREER_ROADMAPS[careerKey]) return { text: 'Which career should I target for the roadmap? Tell me the role you want, your current skills, and how much time you can study each week.' };
				const roadmap = CAREER_ROADMAPS[careerKey];
				const known = [...new Set((memory.knownSkills || []).map(assistantSkillLabel).concat(mentionedSkills.map(assistantSkillLabel), skills.map((item) => item.name)))];
				const remaining = roadmap.skills.filter((item) => !known.some((skill) => normalizedAssistantText(item).includes(normalizedAssistantText(skill))));
				chatbotState.memory.careerKey = careerKey;
				return { text: `**${roadmap.label} roadmap**\n\n**Already in your context**\n${known.length ? known.map((item) => `- ${item}`).join('\n') : '- No current skills were identified yet.'}\n\n**Recommended order**\n${remaining.map((item, index) => `${index + 1}. **${item}** — build this before the next stage.`).join('\n')}\n\n**Projects**\n${roadmap.projects.map((item) => `- ${item}`).join('\n')}\n\nStart with **${remaining[0] || roadmap.skills[0]}**. Share your weekly study time and I can turn this into a 7-, 30-, 60-, or 90-day plan.`, action: { type: 'OPEN_CAREER' } };
			}

			if (/(7 day|30 day|60 day|90 day|learning plan|study plan)/.test(query)) {
				if (!careerKey) return { text: 'What skill or career should the plan target? For example, “a 30-day JavaScript plan” or “a 90-day backend plan.”' };
				const roadmap = CAREER_ROADMAPS[careerKey] || CAREER_ROADMAPS.frontend;
				const duration = query.match(/(7|30|60|90)\s*-?day/)?.[1] || '30';
				const weeks = Math.max(1, Math.ceil(Number(duration) / 7));
				return { text: `**${duration}-day ${roadmap.label} plan**\n\n${Array.from({ length: weeks }, (_, index) => `**Week ${index + 1}**\n- Study: ${roadmap.skills[index % roadmap.skills.length]}\n- Practice: complete one focused exercise and write down what you learned\n- Deliverable: add progress to a small project or portfolio note`).join('\n\n')}\n\nAt the end, review your weakest SkillAura area and build one project that demonstrates the target role.`, action: { type: 'OPEN_SKILLS' } };
			}

			if (/(find|show|search|available).*(internship|opportunit)|internship.*(available|python|javascript|react|sql|backend|frontend)/.test(query)) {
				const requested = mentionedSkills.filter((key) => !['frontend', 'backend', 'data', 'ai'].includes(key));
				const matches = (context.opportunities || []).filter((item) => !requested.length || requested.every((key) => normalizedAssistantText(`${item.title} ${item.skills} ${item.description}`).includes(normalizedAssistantText(assistantSkillLabel(key)))));
				if (!matches.length) return { text: 'I do not see a matching published opportunity in the current SkillAura data. Try another skill or open Opportunities to browse the available records.', action: { type: 'OPEN_OPPORTUNITIES' } };
				chatbotState.memory.lastOpportunityQuery = requested;
				return { text: `I found ${matches.length} published opportunity${matches.length === 1 ? '' : 'ies'} in SkillAura matching your request.`, cards: assistantOpportunityCards(matches), action: { type: 'OPEN_OPPORTUNITIES' } };
			}

			if (/(what should i learn next|learn next|next step|recommend.*skill|skill gap|weak|improve)/.test(query)) {
				const explicit = mentionedSkills.map((key) => assistantStudentSkill(context, key)).filter(Boolean);
				const next = explicit.find((item) => Number(item.score || 0) < 80) || gaps.find((item) => Number(item.score || 0) < 80) || skills.find((item) => Number(item.score || 0) < 80);
				if (!next) return { text: 'I do not have a measured skill gap below 80% in the current SkillAura record. Choose a target career and I can compare its requirements with your assessed skills.', action: { type: 'OPEN_SKILLS' } };
				const target = Number(next.target || 80);
				return { text: `**Next priority: ${next.name}**\n\nYour current SkillAura score is **${formatPercent(next.score)}**${target ? ` against a ${formatPercent(target)} target` : ''}.\n\n1. Review the fundamentals and complete 3 focused exercises.\n2. Build a small project that uses this skill.\n3. Reassess it in **My Skills** and then compare relevant opportunities.`, action: { type: 'OPEN_SKILLS' } };
			}

			if (/(what is|explain|difference between|why should i learn|do i need).*/.test(query) && mentionedSkills.length) {
				const skill = assistantSkillLabel(mentionedSkills[0]);
				const uses = { JavaScript: 'interactive web interfaces, servers, and APIs', Python: 'backend services, automation, data, and AI', React: 'component-based web interfaces', SQL: 'querying and organizing relational data', Git: 'tracking code changes and collaborating safely', 'Machine Learning': 'learning patterns from data to make predictions or classifications' }[skill] || 'real software projects in that area';
				return { text: `**${skill}** is a tool or skill used in ${uses}.\n\nIt matters because it helps you build evidence for the career path you choose. Learn its fundamentals, practice with a small project, and then compare the requirements in current SkillAura opportunities. A good next step is to tell me your target role so I can explain the relevant depth.` };
			}

			if (/(interview|mock interview|prepare me)/.test(query)) return { text: `**Interview preparation**\n\n- Review the technical topics required by your target role.\n- Prepare two project stories using the problem, your contribution, and the result.\n- Practice explaining one weak area honestly and describe how you are improving it.\n- Rehearse behavioral questions about teamwork, debugging, and learning.\n\nI can run a mock interview one question at a time if you tell me the target role.`, action: { type: 'OPEN_INTERVIEWS' } };
			if (/(resume|cv|portfolio|github|linkedin)/.test(query)) return { text: `**Resume and portfolio checklist**\n\n- Lead with the target role and the strongest verified skills you actually have.\n- Describe projects with the problem, technologies, your contribution, and measurable result.\n- Link only to work you can explain in an interview.\n- Keep claims specific; SkillAura can guide you, but it has not evaluated a resume unless you provide its contents.` };

			if (/(application|where.*appl|status|interview|offer|internship|placement)/.test(query)) {
				const counts = { applications: context.applications.length, interviews: context.interviews.length, offers: context.offers.length, internships: context.internships.length, placements: context.placements.length };
				return { text: `Your current SkillAura records contain **${counts.applications} application${counts.applications === 1 ? '' : 's'}**, **${counts.interviews} interview${counts.interviews === 1 ? '' : 's'}**, **${counts.offers} offer${counts.offers === 1 ? '' : 's'}**, **${counts.internships} internship${counts.internships === 1 ? '' : 's'}**, and **${counts.placements} placement${counts.placements === 1 ? '' : 's'}**. Open **Applications** for application statuses, **Interviews** for schedules, **Offers** for offers, **Internships** for active placements, and **Placements** for accepted outcomes.`, action: { type: 'OPEN_APPLICATIONS' } };
			}

			if (/(which career|best career|choose a career|dont know.*career|don't know.*career)/.test(query)) return { text: 'I can help narrow that down. What kind of work sounds most interesting, which skills do you already enjoy using, and do you prefer building products, analyzing data, working with people, or researching systems?' };
			return { text: `I can help with career paths, skill explanations, roadmaps, learning plans, interviews, resumes, and the real records in SkillAura. Tell me your target role or the decision you are trying to make, and I will use your current context rather than guessing.` };
		}

		function roleAwareFallbackResponse(message, context) {
			const role = context.role || currentRole();
			if (role === 'company') return roleAwareCompanyResponse(message, context);
			if (role === 'institution') return roleAwareInstitutionResponse(message, context);
			return enhancedStudentResponse(message, context);
		}

		function generateRoleAwareResponse(message) {
			const role = currentRole();
			const context = chatbotContext();
			const query = normalizedAssistantText(message);
			if (role === 'student') {
				const skills = context.skills || [];
				const gaps = [...(context.gaps || [])].sort((a, b) => Number(a.score || 0) - Number(b.score || 0));
				const opportunities = context.opportunities || [];
				const strongest = skills.slice().sort((a, b) => Number(b.score || 0) - Number(a.score || 0)).slice(0, 3).map((item) => `${item.name} (${formatPercent(item.score)})`).join(', ');
				const weakest = gaps.slice(0, 3).map((item) => `${item.name} (${formatPercent(item.score)})`).join(', ');
				if (/(analyze my skills|analyze my skill|my skill profile|current profile)/.test(query)) {
					return { text: `Your verified SkillAura profile shows strong areas in ${strongest || 'your current assessments'}. The biggest improvement areas are ${weakest || 'not yet flagged'}.`, action: { type: 'OPEN_SKILLS' } };
				}
				if (/(find my skill gaps|skill gaps|what am i missing|missing.*role)/.test(query)) {
					const nextGaps = gaps.slice(0, 3).map((item) => `${item.name}: ${formatPercent(item.score)} / ${formatPercent(item.target || 80)}`).join('; ');
					return { text: `Your current gap analysis shows: ${nextGaps || 'No major gaps are currently identified.'} Prioritize the weakest skill first and re-assess after targeted practice.`, action: { type: 'OPEN_SKILLS' } };
				}
				if (/(recommend internships|find internships|internships for me|internship recommendations)/.test(query)) {
					const matches = opportunities.slice().sort((a, b) => Number(b.match || 0) - Number(a.match || 0)).slice(0, 3);
					if (!matches.length) return { text: 'I do not see published internships in your current SkillAura data that are a strong match yet. Open Opportunities to review new roles as they appear.', action: { type: 'OPEN_OPPORTUNITIES' } };
					return { text: `The strongest internship matches for your profile are ${matches.map((item) => `${item.title} (${item.match || 0}%)`).join(', ')}. These are the best opportunities to target based on your current skills and the opportunity requirements.`, cards: assistantOpportunityCards(matches), action: { type: 'OPEN_OPPORTUNITIES' } };
				}
				if (/(recommend jobs|job recommendations|find jobs|jobs for me)/.test(query)) {
					const jobs = opportunities.slice().sort((a, b) => Number(b.match || 0) - Number(a.match || 0)).slice(0, 3);
					if (!jobs.length) return { text: 'I do not see a job opportunity match in your current SkillAura records. Try improving a weak skill and then revisit this recommendation.', action: { type: 'OPEN_OPPORTUNITIES' } };
					return { text: `Based on your current SkillAura data, the best-fit roles are ${jobs.map((item) => `${item.title} (${item.match || 0}%)`).join(', ')}. Focus on the skills those roles require and then reapply to the most relevant openings.`, cards: assistantOpportunityCards(jobs), action: { type: 'OPEN_OPPORTUNITIES' } };
				}
				if (/(create my career roadmap|career roadmap|roadmap)/.test(query)) {
					const mappedCareer = assistantCareerKey(message, chatbotState.memory) || 'frontend';
					const roadmap = CAREER_ROADMAPS[mappedCareer] || CAREER_ROADMAPS.frontend;
					return { text: `Your roadmap toward ${roadmap.label} starts with ${roadmap.skills.slice(0, 3).join(', ')}. Build one small project in each phase, then reassess your skill profile before moving to the next milestone.`, action: { type: 'OPEN_CAREER' } };
				}
				if (/(prepare me for an interview|interview prep|mock interview)/.test(query)) {
					const weak = gaps.slice(0, 2).map((item) => `${item.name} (${formatPercent(item.score)})`).join(', ') || 'your strongest gaps';
					return { text: `For interview prep, focus on ${weak}. Practice explaining your projects, your approach, and how you solved problems. Keep your answers structured around the problem, action, and result.`, action: { type: 'OPEN_INTERVIEWS' } };
				}
				if (/(improve my resume|resume improvement|resume)/.test(query)) {
					return { text: `Use the strongest verified skills in your profile—${strongest || 'your current data'}—and pair them with specific projects and measurable results. Keep the resume role-focused, trim generic statements, and show the problem, tools, and outcome for each project.`, action: { type: 'OPEN_PROFILE' } };
				}
				if (/(practice questions|give me practice questions|question.*practice)/.test(query)) {
					return { text: 'Practice questions to work on next:\n1. Write a function to reverse a string without using in-built methods.\n2. Explain the difference between var, let, and const in JavaScript.\n3. How would you optimize a slow SQL query?\n4. What is the difference between props and state in React?\n5. How would you explain a project you built and the impact it had?', action: { type: 'OPEN_SKILLS' } };
				}
				if (/(what should i learn next|improve my weak skills|weak skills)/.test(query)) {
					const nextSkill = gaps[0];
					return { text: `Your next learning priority is ${nextSkill ? nextSkill.name : 'your weakest tracked skill'}. Build a focused study block around the fundamentals, then test it with one small project before reassessing your SkillAura score.`, action: { type: 'OPEN_SKILLS' } };
				}
			}
			if (role === 'company') {
				const candidates = context.candidates || [];
				const apps = context.applications || [];
				const opportunities = context.opportunities || [];
				if (/(find matching candidates|matching candidates|top candidates)/.test(query)) {
					const ranked = candidates.slice().sort((a, b) => Number(b.skills?.length || 0) - Number(a.skills?.length || 0)).slice(0, 3);
					return { text: `The strongest current candidate matches in your workspace are ${ranked.map((item) => `${item.name || 'Candidate'} (${(item.skills || []).length} skills)`).join(', ')}. These profiles have the most verified skill coverage based on their current SkillAura records.`, action: { type: 'OPEN_CANDIDATES' } };
				}
				if (/(create job description|job description|create a job)/.test(query)) {
					return { text: 'Job description draft:\nRole: Frontend Developer\nSummary: Build responsive user interfaces and collaborate with product and engineering teams.\nCore requirements: JavaScript, React, Git, UI fundamentals, and communication.\nResponsibilities: Implement features, optimize UX, and support code review.\nGood for: students with strong frontend and product-focused work.', action: { type: 'OPEN_OPPORTUNITIES' } };
				}
				if (/(create internship|internship description|internship)/.test(query)) {
					return { text: 'Internship draft:\nTitle: Product Engineering Intern\nScope: Build, test, and improve one feature end-to-end with design and engineering mentorship.\nSkills: JavaScript, React, Git, problem solving, and teamwork.\nEligibility: Students in relevant STEM or design programs with strong project evidence.', action: { type: 'OPEN_OPPORTUNITIES' } };
				}
				if (/(generate interview questions|interview questions)/.test(query)) {
					return { text: 'Interview question set:\n1. Walk me through a project you built and the decisions you made.\n2. How do you debug a UI issue that only appears on mobile?\n3. Explain a time you worked through a conflict in a team project.\n4. What tradeoffs would you make between speed and maintainability?\n5. How do you validate whether a feature is actually solving the user problem?', action: { type: 'OPEN_INTERVIEWS' } };
				}
				if (/(generate technical assessment|technical assessment)/.test(query)) {
					return { text: 'Technical assessment ideas:\n- JS debugging task\n- React component challenge\n- SQL query problem\n- Git workflow scenario\n- Data structures and algorithm short test\nUse the results to compare problem-solving depth and communication quality.', action: { type: 'OPEN_ANALYTICS' } };
				}
				if (/(analyze candidate pool|candidate pool|pool analysis)/.test(query)) {
					return { text: `Your current candidate pool includes ${candidates.length} connected candidate profile${candidates.length === 1 ? '' : 's'} and ${apps.length} application${apps.length === 1 ? '' : 's'} in SkillAura. Use the strongest skill overlap and verified assessments to narrow the shortlist before interviews.`, action: { type: 'OPEN_CANDIDATES' } };
				}
				if (/(identify in-demand skills|in-demand skills|demand.*skills)/.test(query)) {
					const demand = {};
					opportunities.forEach((item) => { (item.skills || '').split(/[•,]/).map((skill) => skill.trim()).filter(Boolean).forEach((skill) => { demand[skill] = (demand[skill] || 0) + 1; }); });
					const topSkills = Object.entries(demand).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([name, count]) => `${name} (${count})`).join(', ') || 'No active opportunity skills available yet';
					return { text: `The current opportunity demand in your workspace is concentrated around ${topSkills}. Prioritize candidates with those skills and confirm if the requirement is truly necessary before screening.`, action: { type: 'OPEN_ANALYTICS' } };
				}
			}
			if (role === 'institution') {
				const students = context.students || [];
				const assessed = students.filter((student) => (student.workspace?.assessments || student.assessments || []).length > 0).length;
				const verified = students.filter((student) => (student.workspace?.skills || student.skills || []).length > 0).length;
				if (/(analyze student skills|student skills|skill analysis)/.test(query)) {
					return { text: `${assessed} of ${students.length} students have completed assessments and ${verified} have verified skill records. Review the weakest skills by cohort and use those insights to plan training or workshop interventions.`, action: { type: 'OPEN_SKILLS' } };
				}
				if (/(find common skill gaps|common skill gaps|skill gaps)/.test(query)) {
					return { text: 'The strongest recurring skill gaps in the current institution dataset are usually weak SQL, communication, and role-specific technical depth. Use these as the focus for training programs and skill-integration workshops.', action: { type: 'OPEN_SKILLS' } };
				}
				if (/(check placement readiness|placement read|readiness)/.test(query)) {
					return { text: `Based on the current institution records, ${verified} students have active verified skills, which is a good foundation for placement readiness. I would still validate weak areas such as role-specific technical depth and communication before high-volume placement drives.`, action: { type: 'OPEN_ANALYTICS' } };
				}
				if (/(recommend training programs|training programs|recommend.*program)/.test(query)) {
					return { text: 'Recommended training programs:\n- React & frontend fundamentals\n- SQL and data workflows\n- Communication and interview readiness\n- Career-specific hackathons and mock rounds\n- Domain-specific workshops aligned to active company demand', action: { type: 'OPEN_LEARNING' } };
				}
				if (/(suggest industry collaborations|industry collaborations|collaboration)/.test(query)) {
					return { text: 'Suggested collaborations:\n- Invite local product companies for mock interviews\n- Run a placement readiness workshop with hiring partners\n- Partner with engineering teams for guest lectures\n- Create an internship review feedback loop with active recruiters', action: { type: 'OPEN_INDUSTRY' } };
				}
				if (/(analyze internship participation|internship participation|internship)/.test(query)) {
					return { text: 'Internship participation should be reviewed by cohort, department, and application success. Track how many students are eligible, how many apply, and which roles are recurring to identify the next improvement loop.', action: { type: 'OPEN_INTERNSHIPS' } };
				}
				if (/(suggest workshops|workshops)/.test(query)) {
					return { text: 'Workshop recommendations:\n- Resume and profile review sessions\n- Mock interviews for target roles\n- Git and project collaboration labs\n- SQL and data handling clinics\n- Industry panel and employer Q&A sessions', action: { type: 'OPEN_ANALYTICS' } };
				}
				if (/(generate placement report|placement report)/.test(query)) {
					return { text: 'Placement report outline:\n- Students assessed\n- Verified skill coverage\n- Placement readiness by role\n- Internship participation\n- Weakest skills by cohort\n- Next training priorities', action: { type: 'OPEN_ANALYTICS' } };
				}
			}
			if (role === 'company' && !context.applications.length && !context.opportunities.length) {
				return { text: 'I do not have enough SkillAura data to answer that accurately yet. Add an opportunity or invite candidate activity before I can rank applicants or summarize hiring metrics.' };
			}
			if (role === 'institution' && !context.students.length) {
				return { text: 'I do not have enough SkillAura data to answer that accurately yet. Add student records or complete assessments before I can analyze institutional readiness.' };
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
				OPEN_PROFILE: `/${role}/profile`,
				OPEN_INTERVIEWS: `/${role}/interviews`,
				OPEN_OFFERS: `/${role}/offers`,
				OPEN_INTERNSHIPS: `/${role}/internships`,
				OPEN_PLACEMENTS: `/${role}/placements`,
				OPEN_NOTIFICATIONS: `/${role}/notifications`,
				OPEN_SETTINGS: `/${role}/settings`,
				OPEN_LEARNING: `/${role}/learning`,
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

			if (routes[type]) go(routes[type]);
		}

		function initChatbot() {
			document.querySelector('.ai-assistant')?.remove();
			return;

			const assistant = document.querySelector('.ai-assistant');
			const launcher = assistant.querySelector('.ai-launcher');
			const panel = assistant.querySelector('.ai-panel');
			const close = assistant.querySelector('.ai-close');
			const clearButton = assistant.querySelector('.ai-clear');
			const messages = assistant.querySelector('.ai-messages');
			const form = assistant.querySelector('.ai-form');
			const input = assistant.querySelector('.ai-input');
			const sendButton = assistant.querySelector('.ai-send');
			const stopButton = assistant.querySelector('.ai-stop');
			const launcherPositionKey = 'skillaura-ai-launcher-position';
			const dragThreshold = 5;
			let dragStart = null;
			let dragged = false;
			let suppressClick = false;
			let activeRequestController = null;
			chatbotState.memory = { history: [], ...(chatbotState.memory || {}) };

			const readLauncherPosition = () => {
				try {
					const saved = JSON.parse(localStorage.getItem(launcherPositionKey));
					return saved && Number.isFinite(saved.x) && Number.isFinite(saved.y) ? saved : null;
				} catch (error) { return null; }
			};
			const clampLauncherPosition = (x, y) => {
				const rect = launcher.getBoundingClientRect();
				const margin = 10;
				return {
					x: Math.max(margin, Math.min(x, window.innerWidth - rect.width - margin)),
					y: Math.max(margin, Math.min(y, window.innerHeight - rect.height - margin))
				};
			};
			const setLauncherPosition = (x, y, persist = false) => {
				const position = clampLauncherPosition(x, y);
				assistant.style.left = `${position.x}px`;
				assistant.style.top = `${position.y}px`;
				assistant.style.right = 'auto';
				assistant.style.bottom = 'auto';
				if (persist) {
					try { localStorage.setItem(launcherPositionKey, JSON.stringify(position)); } catch (error) { }
				}
				return position;
			};
			const positionChatPanel = () => {
				const launcherRect = launcher.getBoundingClientRect();
				const assistantRect = assistant.getBoundingClientRect();
				const panelHeight = panel.offsetHeight || Math.min(590, window.innerHeight - 110);
				const panelWidth = panel.offsetWidth || Math.min(390, window.innerWidth - 32);
				const margin = 10;
				const horizontal = Math.max(margin, Math.min(launcherRect.left + launcherRect.width - panelWidth, window.innerWidth - panelWidth - margin));
				panel.style.left = `${horizontal - assistantRect.left}px`;
				panel.style.right = 'auto';
				if (launcherRect.top < panelHeight + 24) {
					panel.style.top = 'calc(100% + 12px)';
					panel.style.bottom = 'auto';
				} else {
					panel.style.top = 'auto';
					panel.style.bottom = 'calc(100% + 12px)';
				}
			};
			const savedPosition = readLauncherPosition();
			const initialPosition = savedPosition || { x: window.innerWidth - launcher.offsetWidth - 14, y: window.innerHeight - launcher.offsetHeight - 14 };
			setLauncherPosition(initialPosition.x, initialPosition.y);

			launcher.addEventListener('pointerdown', (event) => {
				if (event.button !== undefined && event.button !== 0) return;
				dragStart = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, left: launcher.getBoundingClientRect().left, top: launcher.getBoundingClientRect().top };
				dragged = false;
				launcher.setPointerCapture?.(event.pointerId);
			});
			launcher.addEventListener('pointermove', (event) => {
				if (!dragStart || event.pointerId !== dragStart.pointerId) return;
				const deltaX = event.clientX - dragStart.x;
				const deltaY = event.clientY - dragStart.y;
				if (!dragged && Math.hypot(deltaX, deltaY) <= dragThreshold) return;
				dragged = true;
				setLauncherPosition(dragStart.left + deltaX, dragStart.top + deltaY);
				if (assistant.classList.contains('open')) positionChatPanel();
				event.preventDefault();
			});
			launcher.addEventListener('pointerup', (event) => {
				if (!dragStart || event.pointerId !== dragStart.pointerId) return;
				if (dragged) {
					const position = setLauncherPosition(launcher.getBoundingClientRect().left, launcher.getBoundingClientRect().top, true);
					suppressClick = true;
					launcher.setAttribute('data-position-x', String(position.x));
					event.preventDefault();
				}
				dragStart = null;
				dragged = false;
				launcher.releasePointerCapture?.(event.pointerId);
			});
			launcher.addEventListener('pointercancel', (event) => {
				if (dragStart?.pointerId === event.pointerId) {
					dragStart = null;
					dragged = false;
				}
			});

			const renderAssistantMarkdown = (content) => {
				let html = esc(content).replace(/^### (.+)$/gm, '<h4>$1</h4>').replace(/^## (.+)$/gm, '<h3>$1</h3>').replace(/^# (.+)$/gm, '<h3>$1</h3>');
				html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code>$1</code>');
				html = html.replace(/(?:^|\n)((?:- .+(?:\n|$))+)/g, (_, block) => `<ul>${block.trim().split('\n').map((line) => `<li>${line.replace(/^- /, '')}</li>`).join('')}</ul>`);
				html = html.replace(/(?:^|\n)((?:\d+\. .+(?:\n|$))+)/g, (_, block) => `<ol>${block.trim().split('\n').map((line) => `<li>${line.replace(/^\d+\. /, '')}</li>`).join('')}</ol>`);
				return html.replace(/\n{2,}/g, '<br><br>').replace(/\n/g, '<br>');
			};
			const addMessage = (content, sender = 'assistant', cards = '', remember = true) => {
				const message = document.createElement('div');
				message.className = `ai-message ${sender}`;
				const text = document.createElement('p');
				text.innerHTML = renderAssistantMarkdown(content);
				message.append(text);
				if (cards) message.insertAdjacentHTML('beforeend', cards);
				messages.append(message);
				messages.scrollTop = messages.scrollHeight;
				if (remember && (sender === 'user' || sender === 'assistant')) chatbotState.memory.history.push({ role: sender, content: String(content) });
				if (chatbotState.memory.history.length > 12) chatbotState.memory.history = chatbotState.memory.history.slice(-12);
			};

			const showWelcome = () => {
				if (!messages.children.length) {
					addMessage(getPersonalizedGreeting().replace(/\n/g, ' '));
				}
			};

			const handleMessage = async (message) => {
				const cleanMessage = message.trim();
				if (!cleanMessage) return;
				if (sendButton.disabled) return;
				sendButton.disabled = true;
				chatbotState.lastUserMessage = cleanMessage;
				const role = currentRole();
				const detectedCareer = assistantCareerKey(cleanMessage, chatbotState.memory);
				const detectedSkills = assistantMentions(cleanMessage).filter((key) => !['frontend', 'backend', 'data', 'ai'].includes(key));
				if (detectedCareer) chatbotState.memory.careerKey = detectedCareer;
				if (detectedSkills.length) chatbotState.memory.knownSkills = [...new Set([...(chatbotState.memory.knownSkills || []), ...detectedSkills])];
				addMessage(cleanMessage, 'user');
				input.value = '';
				const typing = document.createElement('div');
				typing.className = 'ai-typing';
				typing.textContent = 'SkillAura AI is thinking...';
				messages.append(typing);
				messages.scrollTop = messages.scrollHeight;

				let response = null;
				let requestTimeout = null;
				try {
					activeRequestController = new AbortController();
					requestTimeout = window.setTimeout(() => activeRequestController?.abort(), 26_000);
					const context = chatbotContext();
					context.conversation = chatbotState.memory.history.slice(-8);
					const externalResponse = await askAI(cleanMessage, context, chatbotState.memory.history, activeRequestController.signal);
					response = externalResponse || generateRoleAwareResponse(cleanMessage);
				} catch (error) {
					response = { text: 'Sorry, I could not process that right now. Please try again.' };
				} finally {
					window.clearTimeout(requestTimeout);
					activeRequestController = null;
				}

				typing.remove();
				if (!response || !response.text) {
					response = {
						text: 'SkillAura AI is temporarily unavailable. Please try again.',
						cards: '<div class="ai-result-actions"><button type="button" class="primary" data-chat-action="RETRY_LAST">Retry</button></div>'
					};
				} else if (/temporarily unavailable|try again|unable to connect/i.test(response.text)) {
					response.cards = response.cards || '<div class="ai-result-actions"><button type="button" class="primary" data-chat-action="RETRY_LAST">Retry</button></div>';
				}
				addMessage(response.text, 'assistant', response.cards || '');
				if (response.action) chatbotNavigate(response.action.type, response.action.opportunity);
				sendButton.disabled = false;
				input.focus();
			};

			launcher.addEventListener('click', (event) => {
				if (suppressClick) {
					suppressClick = false;
					event.preventDefault();
					return;
				}
				const isOpen = assistant.classList.toggle('open');
				launcher.setAttribute('aria-expanded', String(isOpen));
				panel.setAttribute('aria-hidden', String(!isOpen));
				panel.style.setProperty('visibility', isOpen ? 'visible' : 'hidden', 'important');
				panel.style.setProperty('opacity', isOpen ? '1' : '0', 'important');
				panel.style.transform = isOpen ? 'none' : '';
				if (isOpen) {
					positionChatPanel();
					showWelcome();
					input.focus();
				}
			});
			const handleViewportChange = () => {
				const rect = launcher.getBoundingClientRect();
				setLauncherPosition(rect.left, rect.top, true);
				if (assistant.classList.contains('open')) positionChatPanel();
				positionChatPanel();
			};
			window.addEventListener('resize', handleViewportChange, { passive: true });
			window.addEventListener('orientationchange', handleViewportChange, { passive: true });
			window.visualViewport?.addEventListener('resize', handleViewportChange, { passive: true });
			close.onclick = () => {
				assistant.classList.remove('open');
				launcher.setAttribute('aria-expanded', 'false');
				panel.setAttribute('aria-hidden', 'true');
				panel.style.setProperty('visibility', 'hidden', 'important');
				panel.style.setProperty('opacity', '0', 'important');
				panel.style.transform = '';
			};
			clearButton.onclick = () => {
				messages.innerHTML = '';
				chatbotState.memory = { history: [] };
				showWelcome();
			};
			stopButton.onclick = () => {
				activeRequestController?.abort();
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
				if (action === 'RETRY_LAST') {
					if (chatbotState.lastUserMessage) handleMessage(chatbotState.lastUserMessage);
					return;
				}
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
						go(`/${role}/${destination}`);
					};
				} else {
					button.onclick = () => showToast(`${label.replace(/[→＋♙▤◈]/g, '').trim()} is not available from this dashboard.`);
				}
			});

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
			else if (path === '/student/mock-interview') app.innerHTML = mockInterviewPage();
			else if (match) {
				const [, role, section] = match;
				app.innerHTML = section === 'dashboard' ? dash(role) : placeholder(role, section);
				if (section === 'dashboard') bindDashboardActions(role)
			} else app.innerHTML = notFound();
			document.querySelectorAll('a[href="#"]').forEach(link => link.href = '#/');
			if (path === '/register') updateRoleFields('Student/Employee');
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
			skills: [],
			gaps: [],
			careers: data.careers.map(([name, match, description, skills]) => ({ name, match, description, skills })),
			opportunities: [],
			applications: [],
			partnerships: [],
			notifications: [],
			settings: { emailUpdates: true, profileVisibility: true, compactView: false },
			assessments: [],
			selectedCareer: 'Frontend Developer',
			learningProgress: {},
			activeRole: null,
			assessment: null,
			mockInterviews: [],
			mockInterviewSession: null,
			csr: { programs: [], applications: [] },
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
		const TUTOR_ACCOUNTS_KEY = 'skillaura_tutors';
		const CURRENT_USER_KEY = 'skillaura_current_user';
		const RESET_CANDIDATE_KEY = 'skillaura_reset_candidate';
		const ECOSYSTEM_STATUSES = ['Applied', 'Under Review', 'Shortlisted', 'Assessment', 'Interview', 'Selected', 'Offer Sent', 'Accepted', 'Rejected', 'Withdrawn'];
		const MOCK_INTERVIEW_QUESTIONS = {
			'Frontend Developer': {
				Easy: [{ question: 'What is the difference between HTML and CSS?', concepts: ['html', 'structure', 'css', 'style', 'presentation'] }, { question: 'What is the DOM?', concepts: ['document', 'object', 'model', 'tree', 'javascript'] }],
				Medium: [{ question: 'How would you improve the performance of a slow web page?', concepts: ['measure', 'profile', 'image', 'lazy', 'cache', 'bundle', 'network'] }, { question: 'Explain how React components manage changing data.', concepts: ['state', 'props', 'render', 'component', 'hook'] }],
				Hard: [{ question: 'How would you design an accessible, scalable frontend application?', concepts: ['accessibility', 'semantic', 'component', 'testing', 'performance', 'architecture'] }, { question: 'How do you prevent unnecessary React renders?', concepts: ['memo', 'state', 'props', 'memoization', 'profile', 'context'] }]
			},
			'Backend Developer': {
				Easy: [{ question: 'What is an API?', concepts: ['interface', 'request', 'response', 'server', 'client'] }, { question: 'Why do applications use databases?', concepts: ['store', 'query', 'data', 'persist', 'database'] }],
				Medium: [{ question: 'How would you secure a login endpoint?', concepts: ['hash', 'password', 'session', 'token', 'validation', 'rate', 'https'] }, { question: 'What makes a REST endpoint reliable?', concepts: ['status', 'validation', 'error', 'idempotent', 'logging', 'test'] }],
				Hard: [{ question: 'How would you scale a service receiving heavy traffic?', concepts: ['cache', 'queue', 'database', 'load', 'horizontal', 'monitor', 'stateless'] }, { question: 'How would you design an idempotent payment request?', concepts: ['idempotency', 'key', 'transaction', 'retry', 'duplicate', 'consistent'] }]
			},
			'Full Stack Developer': {
				Easy: [{ question: 'What happens when a browser requests a web page?', concepts: ['dns', 'http', 'request', 'server', 'response', 'browser'] }, { question: 'Why is version control useful?', concepts: ['git', 'history', 'branch', 'collaborate', 'rollback'] }],
				Medium: [{ question: 'How would you connect a frontend form to a backend API?', concepts: ['form', 'request', 'api', 'validation', 'response', 'error'] }, { question: 'How do you model users and their orders?', concepts: ['user', 'order', 'relation', 'foreign', 'database', 'index'] }],
				Hard: [{ question: 'How would you deploy and monitor a full-stack application?', concepts: ['build', 'environment', 'deploy', 'monitor', 'logs', 'health', 'rollback'] }, { question: 'How would you protect data across a full-stack system?', concepts: ['auth', 'authorization', 'validation', 'encrypt', 'secret', 'https'] }]
			},
			'Python Developer': {
				Easy: [{ question: 'What is a Python list and when would you use it?', concepts: ['ordered', 'collection', 'mutable', 'items', 'sequence'] }, { question: 'What is the purpose of a function?', concepts: ['reuse', 'parameter', 'return', 'logic', 'call'] }],
				Medium: [{ question: 'How would you handle errors in a Python service?', concepts: ['exception', 'try', 'except', 'logging', 'validation', 'finally'] }, { question: 'When would you use a class in Python?', concepts: ['object', 'state', 'method', 'encapsulation', 'reuse'] }],
				Hard: [{ question: 'How would you improve a slow Python data pipeline?', concepts: ['profile', 'algorithm', 'batch', 'memory', 'parallel', 'database'] }, { question: 'How would you design a maintainable Python package?', concepts: ['module', 'test', 'dependency', 'interface', 'documentation', 'structure'] }]
			},
			'Java Developer': {
				Easy: [{ question: 'What are the main ideas of object-oriented programming?', concepts: ['class', 'object', 'inheritance', 'polymorphism', 'encapsulation'] }, { question: 'What is the purpose of an interface in Java?', concepts: ['contract', 'method', 'implement', 'abstraction'] }],
				Medium: [{ question: 'How does exception handling work in Java?', concepts: ['try', 'catch', 'finally', 'throw', 'exception'] }, { question: 'Why are collections useful in Java?', concepts: ['list', 'set', 'map', 'data', 'collection', 'generic'] }],
				Hard: [{ question: 'How would you design a thread-safe Java service?', concepts: ['thread', 'lock', 'synchronization', 'immutable', 'concurrency', 'test'] }, { question: 'How would you structure a Spring REST service?', concepts: ['controller', 'service', 'repository', 'api', 'validation', 'test'] }]
			},
			'Data Analyst': {
				Easy: [{ question: 'What is the difference between a row and a column?', concepts: ['row', 'record', 'column', 'field', 'table'] }, { question: 'Why do analysts clean data?', concepts: ['missing', 'duplicate', 'error', 'consistent', 'quality'] }],
				Medium: [{ question: 'How would you investigate a sudden drop in sales?', concepts: ['segment', 'compare', 'time', 'data', 'hypothesis', 'visualize'] }, { question: 'When would you use a JOIN in SQL?', concepts: ['table', 'relate', 'key', 'combine', 'rows'] }],
				Hard: [{ question: 'How would you design a trustworthy KPI dashboard?', concepts: ['metric', 'definition', 'source', 'validation', 'filter', 'stakeholder'] }, { question: 'How would you explain correlation versus causation?', concepts: ['relationship', 'cause', 'experiment', 'confound', 'evidence'] }]
			},
			'Software Engineer': {
				Easy: [{ question: 'What makes code maintainable?', concepts: ['readable', 'test', 'simple', 'name', 'document', 'modular'] }, { question: 'Why are tests valuable?', concepts: ['regression', 'confidence', 'behavior', 'bug', 'automation'] }],
				Medium: [{ question: 'How would you debug a failing production feature?', concepts: ['reproduce', 'logs', 'monitor', 'isolate', 'test', 'rollback'] }, { question: 'How do you choose a data structure?', concepts: ['operation', 'complexity', 'memory', 'requirement', 'tradeoff'] }],
				Hard: [{ question: 'How would you design a reliable notification system?', concepts: ['queue', 'retry', 'idempotent', 'delivery', 'failure', 'monitor'] }, { question: 'How do you make a technical tradeoff with incomplete information?', concepts: ['requirement', 'risk', 'measure', 'prototype', 'tradeoff', 'document'] }]
			}
		};
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
		function loadTutorAccounts() { try { const accounts = JSON.parse(localStorage.getItem(TUTOR_ACCOUNTS_KEY)); return Array.isArray(accounts) ? accounts : []; } catch (error) { return []; } }
		function saveTutorAccounts(accounts) { try { localStorage.setItem(TUTOR_ACCOUNTS_KEY, JSON.stringify(accounts)); } catch (error) { showToast('Tutor account changes could not be saved.'); } }
		function loadInstitutionWorkspaces() { try { const workspaces = JSON.parse(localStorage.getItem(INSTITUTION_WORKSPACES_KEY)); return workspaces && typeof workspaces === 'object' ? workspaces : {}; } catch (error) { return {}; } }
		function blankInstitutionWorkspace(account) { return { institutionId: account.id, students: [], programs: [], internships: [], collaborations: [], notifications: [], reports: [], admins: [{ name: account.profile.contactPerson, email: account.email, role: 'Owner', permissions: 'All', status: 'Active' }], settings: { academicYear: '', departments: '', courses: '' }, onboarding: { status: 'Pending', completed: false } }; }
		function getInstitutionWorkspace(institutionId) { const workspaces = loadInstitutionWorkspaces(); return workspaces[institutionId] || blankInstitutionWorkspace({ id: institutionId, email: '', profile: { contactPerson: 'Administrator' } }); }
		function saveInstitutionWorkspace(workspace) { const workspaces = loadInstitutionWorkspaces(); workspaces[workspace.institutionId] = workspace; try { localStorage.setItem(INSTITUTION_WORKSPACES_KEY, JSON.stringify(workspaces)); } catch (error) { showToast('Institution workspace changes could not be saved.'); } }
		function currentStudentSession() { return currentAuthSession(); }
		function currentStudentAccount() { const session = currentStudentSession(); return session ? loadStudentAccounts().find((account) => account.id === session.userId || account.id === session.id) : null; }
		function currentCompanyAccount() { const session = currentStudentSession(); return session && normalizeRole(session.role) === 'company' ? loadCompanyAccounts().find((account) => account.id === session.companyId || account.id === session.id) : null; }
		function currentCompanyWorkspace() { const account = currentCompanyAccount(); return account ? getCompanyWorkspace(account.id) : null; }
		function currentInstitutionAccount() { const session = currentStudentSession(); return session && session.role === 'institution' ? loadInstitutionAccounts().find((account) => account.id === session.institutionId || account.id === session.id) : null; }
		function currentTutorAccount() { const session = currentStudentSession(); return session && session.role === 'tutor' ? loadTutorAccounts().find((account) => account.id === session.id || account.id === session.userId) : null; }
		function currentInstitutionWorkspace() { const account = currentInstitutionAccount(); return account ? getInstitutionWorkspace(account.id) : null; }
		function normalizeRole(role) { return role === 'industry' ? 'company' : role === 'employee' ? 'student' : role; }
		function isLearnerRole(role) { return ['student', 'tutor'].includes(normalizeRole(role)); }
		function resolveAccountRole(account) { return normalizeRole((account && account.role) || (currentStudentSession() && currentStudentSession().role) || 'student'); }
		function dashboardRouteForRole(role) { const normalized = normalizeRole(role); return normalized === 'company' ? '/company/dashboard' : normalized === 'institution' ? '/institution/dashboard' : normalized === 'tutor' ? '/tutor/dashboard' : '/student/dashboard'; }
		function clearStudentSession() {
			for (const key of LEGACY_USER_KEYS) {
				try { localStorage.removeItem(key); } catch (error) {}
			}
			try { localStorage.removeItem(CURRENT_USER_KEY); } catch (error) {}
			if (state) state.activeRole = null;
		}
		function studentWorkspace() { return { skills: clone(state.skills), gaps: clone(state.gaps), applications: clone(state.applications), assessments: clone(state.assessments || []), mockInterviews: clone(state.mockInterviews || []), preferences: {} }; }
		function newStudentWorkspace() { return { skills: [], gaps: [], applications: [], assessments: [], mockInterviews: [], preferences: {} }; }
		function hydrateStudentAccount(account) {
			if (!account) return;
			const workspace = account.workspace || {};
			state.student = { ...state.student, ...account.profile };
			state.skills = clone(workspace.skills || state.skills);
			state.gaps = clone(workspace.gaps || state.gaps);
			state.applications = clone(workspace.applications || []);
			state.assessments = clone(workspace.assessments || []);
			state.mockInterviews = clone(workspace.mockInterviews || state.mockInterviews || []);
			state.student.preferences = workspace.preferences || {};
			state.activeRole = resolveAccountRole(account);
		}
		function persistCurrentStudentWorkspace() {
			const session = currentStudentSession();
			if (!session) return;
			const accounts = loadStudentAccounts();
			const index = accounts.findIndex((account) => account.id === (session.userId || session.id));
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
			persistAuthSession({
				...session,
				id: session.userId || session.id,
				userId: session.userId || session.id,
				role: normalizeRole(session.role || 'student'),
				name: state.student.name || session.name,
				email: state.student.email || session.email,
				companyId: session.companyId || null,
				institutionId: session.institutionId || accounts[index].institutionId || state.student.institutionId || null
			});
		}
		function startStudentSession(account, role = account?.role || 'student') {
			if (!account) return;
			const normalizedRole = normalizeRole(role);
			account.role = normalizedRole;
			persistAuthSession({ id: account.id, userId: account.id, email: account.email, role: normalizedRole, name: account.profile?.name || account.fullName || account.name || 'Student', demoAccount: Boolean(account.demoAccount || account.profile?.demoAccount) });
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
			persistAuthSession({ id: account.id, userId: account.id, companyId: account.id, email: account.email, role: 'company', name: account.profile?.name || account.name || 'Company', demoAccount: Boolean(account.demoAccount || account.profile?.demoAccount) });
			state.activeRole = 'company';
			state.company = { ...state.company, ...account.profile, email: account.email };
			saveCompanyAccounts(loadCompanyAccounts().map((item) => item.id === account.id ? account : item));
			saveState();
		}
		function startInstitutionSession(account) {
			if (!account) return;
			account.role = 'institution';
			persistAuthSession({ id: account.id, userId: account.id, institutionId: account.id, email: account.email, role: 'institution', name: account.profile?.name || account.name || 'Institution', demoAccount: Boolean(account.demoAccount || account.profile?.demoAccount) });
			state.activeRole = 'institution';
			state.institution = { ...state.institution, ...account.profile, email: account.email };
			saveInstitutionAccounts(loadInstitutionAccounts().map((item) => item.id === account.id ? account : item));
			saveState();
		}
		function startTutorSession(account) {
			if (!account) return;
			account.role = 'tutor';
			persistAuthSession({ id: account.id, userId: account.id, email: account.email, role: 'tutor', name: account.profile?.name || account.name || 'Tutor', demoAccount: Boolean(account.demoAccount || account.profile?.demoAccount) });
			state.activeRole = 'tutor';
			saveTutorAccounts(loadTutorAccounts().map((item) => item.id === account.id ? account : item));
			saveState();
		}
		function isValidEmail(email) { return /^\S+@\S+\.\S+$/.test(email || ''); }

		function clone(value) { return JSON.parse(JSON.stringify(value)); }
		function loadState() {
			try {
				const saved = JSON.parse(localStorage.getItem(STATE_KEY));
				if (!saved) return clone(defaultState);
				const loaded = { ...clone(defaultState), ...saved, student: { ...defaultState.student, ...saved.student }, company: { ...defaultState.company, ...saved.company }, institution: { ...defaultState.institution, ...saved.institution }, settings: { ...defaultState.settings, ...saved.settings }, csr: { ...defaultState.csr, ...saved.csr, programs: saved.csr?.programs || [], applications: saved.csr?.applications || [] }, ecosystem: { ...defaultState.ecosystem, ...saved.ecosystem, opportunities: saved.ecosystem?.opportunities || [], applications: saved.ecosystem?.applications || [], interviews: saved.ecosystem?.interviews || [], offers: saved.ecosystem?.offers || [], internships: saved.ecosystem?.internships || [], placements: saved.ecosystem?.placements || [], notifications: saved.ecosystem?.notifications || [] } };
				loaded.opportunities = (loaded.opportunities || []).filter((item) => !String(item.id || '').startsWith('seed-') && item.title !== 'Software Developer Intern' && item.title !== 'Frontend Developer Intern' && item.title !== 'Data Analyst Intern');
				loaded.applications = (loaded.applications || []).filter((item) => !String(item.id || '').startsWith('seed-'));
				loaded.partnerships = (loaded.partnerships || []).filter((item) => !String(item.id || '').startsWith('seed-'));
				loaded.notifications = (loaded.notifications || []).filter((item) => !String(item.id || '').startsWith('seed-'));
				loaded.ecosystem.opportunities = loaded.ecosystem.opportunities.filter((item) => !String(item.id || '').startsWith('seed-') && item.title !== 'Software Developer Intern' && item.title !== 'Frontend Developer Intern' && item.title !== 'Data Analyst Intern');
				loaded.ecosystem.applications = loaded.ecosystem.applications.filter((item) => !String(item.id || '').startsWith('seed-'));
				return loaded;
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
		function initializeDemoAccounts() {
			const demoStudentId = 'demo-student-skillaura';
			const demoCompanyId = 'demo-company-technova';
			const demoInstitutionId = 'demo-institution-skillaura';
			const studentSkills = [
				{ name: 'Python', score: 78, status: 'Verified' },
				{ name: 'JavaScript', score: 74, status: 'Verified' },
				{ name: 'HTML/CSS', score: 86, status: 'Verified' },
				{ name: 'SQL', score: 63, status: 'Intermediate' },
				{ name: 'Git', score: 71, status: 'Verified' }
			];
			const studentAssessments = studentSkills.map((skill) => ({ skill: skill.name, score: skill.score, correct: Math.round(skill.score / 5), total: 20, rating: assessmentRating(skill.score), topicBreakdown: [], completedAt: '2026-08-20T00:00:00.000Z', demoData: true }));
			let students = loadStudentAccounts();
			let demoStudent = students.find((account) => account.email === 'student@skillaura.demo');
			if (!demoStudent) {
				demoStudent = { id: demoStudentId, studentId: demoStudentId, fullName: 'Demo Student', email: 'student@skillaura.demo', passwordHash: prototypeHash('Student@123'), institutionId: demoInstitutionId, role: 'student', demoAccount: true, registeredAt: new Date().toISOString(), onboardingCompleted: true, onboarding: { careerInterest: 'Software Developer', desiredRole: 'Software Developer' }, profile: { name: 'Demo Student', email: 'student@skillaura.demo', college: 'SkillAura Demo University', course: 'Computer Science and Engineering', year: '3rd Year', phone: '', initials: 'DS', title: 'Welcome, Demo Student', subtitle: 'Explore the connected SkillAura demo journey.', demoAccount: true, careerInterest: 'Software Developer', institutionId: demoInstitutionId }, workspace: { skills: clone(studentSkills), gaps: [{ name: 'Data Structures', score: 48, target: 75 }, { name: 'System Design', score: 35, target: 65 }], applications: [], assessments: clone(studentAssessments), preferences: { careerInterest: 'Software Developer' }, portfolio: { projects: ['Skill tracking dashboard'], certifications: ['Python Foundations'], achievements: ['Completed demo onboarding'] } } };
				students.push(demoStudent);
				saveStudentAccounts(students);
			}

			let companies = loadCompanyAccounts();
			let demoCompany = companies.find((account) => account.email === 'company@skillaura.demo');
			if (!demoCompany) {
				demoCompany = { id: demoCompanyId, companyId: demoCompanyId, role: 'company', demoAccount: true, email: 'company@skillaura.demo', passwordHash: prototypeHash('Company@123'), profile: { name: 'TechNova Solutions', email: 'company@skillaura.demo', industryType: 'Software & Technology', location: 'Hyderabad, India', size: '51–200 employees', contactPerson: 'Demo Recruiter', designation: 'Talent Acquisition Manager', initials: 'TS', title: 'Welcome, TechNova Solutions', subtitle: 'Explore skill-based recruitment with demo data.', demoAccount: true }, createdAt: new Date().toISOString() };
				companies.push(demoCompany);
				saveCompanyAccounts(companies);
			}

			let institutions = loadInstitutionAccounts();
			let demoInstitution = institutions.find((account) => account.email === 'institution@skillaura.demo');
			if (!demoInstitution) {
				demoInstitution = { id: demoInstitutionId, institutionId: demoInstitutionId, role: 'institution', demoAccount: true, email: 'institution@skillaura.demo', passwordHash: prototypeHash('Institution@123'), profile: { name: 'SkillAura Demo Institute', email: 'institution@skillaura.demo', institutionType: 'Engineering College', affiliation: 'SkillAura Demo University', location: 'Hyderabad, India', contactPerson: 'Demo Administrator', designation: 'Placement Officer', initials: 'SD', title: 'Welcome, SkillAura Demo Institute', subtitle: 'Explore institution readiness and outcomes.', demoAccount: true }, createdAt: new Date().toISOString() };
				institutions.push(demoInstitution);
				saveInstitutionAccounts(institutions);
			}

			let companyWorkspace = getCompanyWorkspace(demoCompany.id);
			let institutionWorkspace = getInstitutionWorkspace(demoInstitution.id);
			if (!companyWorkspace.companyId) companyWorkspace = blankCompanyWorkspace(demoCompany);
			if (!institutionWorkspace.institutionId) institutionWorkspace = blankInstitutionWorkspace(demoInstitution);
			const frontendOpportunityId = 'demo-opportunity-frontend-intern';
			const demoOpportunities = [
				{ opportunityId: frontendOpportunityId, id: frontendOpportunityId, companyId: demoCompany.id, company: 'TechNova Solutions', title: 'Frontend Developer Intern', type: 'Internship', department: 'Engineering', location: 'Hyderabad, India', mode: 'Hybrid', description: 'Build accessible product interfaces with a supportive engineering team.', responsibilities: 'Implement UI components and collaborate with designers.', eligibility: 'Computer science students or equivalent', requirements: { required: ['HTML/CSS', 'JavaScript'], preferred: ['React', 'Git'], minimumLevel: 'Intermediate' }, skills: 'HTML/CSS, JavaScript, React, Git', experience: 'No prior experience required', compensation: '₹25,000 / month', stipend: '₹25,000 / month', duration: '3 months', deadline: '2026-12-31', openings: 2, status: 'Published', applicationCount: 1, match: '90%', demoData: true, createdAt: '2026-08-20T00:00:00.000Z' },
				{ opportunityId: 'demo-opportunity-python-intern', id: 'demo-opportunity-python-intern', companyId: demoCompany.id, company: 'TechNova Solutions', title: 'Python Developer Intern', type: 'Internship', department: 'Platform Engineering', location: 'Hyderabad, India', mode: 'Remote', description: 'Support Python services and automation workflows.', eligibility: 'Students with Python foundations', requirements: { required: ['Python'], preferred: ['SQL', 'Git'], minimumLevel: 'Intermediate' }, skills: 'Python, SQL, Git', experience: 'No prior experience required', compensation: '₹22,000 / month', stipend: '₹22,000 / month', duration: '3 months', deadline: '2026-12-31', openings: 2, status: 'Published', applicationCount: 0, match: '82%', demoData: true, createdAt: '2026-08-20T00:00:00.000Z' },
				{ opportunityId: 'demo-opportunity-software-intern', id: 'demo-opportunity-software-intern', companyId: demoCompany.id, company: 'TechNova Solutions', title: 'Software Engineering Intern', type: 'Internship', department: 'Product Engineering', location: 'Hyderabad, India', mode: 'Hybrid', description: 'Learn the full software delivery lifecycle on a product team.', eligibility: 'Computer science students', requirements: { required: ['Git', 'JavaScript'], preferred: ['Python', 'SQL'], minimumLevel: 'Beginner' }, skills: 'Git, JavaScript, Python, SQL', experience: 'No prior experience required', compensation: '₹24,000 / month', stipend: '₹24,000 / month', duration: '4 months', deadline: '2026-12-31', openings: 3, status: 'Published', applicationCount: 0, match: '78%', demoData: true, createdAt: '2026-08-20T00:00:00.000Z' }
			];
			const ecosystem = state.ecosystem || (state.ecosystem = clone(defaultState.ecosystem));
			demoOpportunities.forEach((opportunity) => {
				if (!ecosystem.opportunities.some((item) => item.opportunityId === opportunity.opportunityId)) ecosystem.opportunities.push(clone(opportunity));
				if (!companyWorkspace.opportunities.some((item) => item.opportunityId === opportunity.opportunityId)) companyWorkspace.opportunities.push(clone(opportunity));
			});
			const demoApplicationId = 'demo-application-frontend-intern';
			if (!ecosystem.applications.some((item) => item.applicationId === demoApplicationId)) ecosystem.applications.push({ applicationId: demoApplicationId, id: demoApplicationId, opportunityId: frontendOpportunityId, opportunity: 'Frontend Developer Intern', company: 'TechNova Solutions', companyId: demoCompany.id, institutionId: demoInstitution.id, studentId: demoStudent.id, studentName: 'Demo Student', status: 'Applied', stage: 'Applied', match: 90, applied: '2026-08-20', demoData: true });
			const demoApplication = ecosystem.applications.find((item) => item.applicationId === demoApplicationId);
			if (!companyWorkspace.applications.some((item) => item.applicationId === demoApplicationId)) companyWorkspace.applications.push(clone(demoApplication));
			const demoCsrProgramId = 'demo-csr-python-development';
			const csr = csrData();
			if (!csr.programs.some((program) => program.id === demoCsrProgramId)) csr.programs.push({ id: demoCsrProgramId, companyId: demoCompany.id, companyName: demoCompany.profile.name, title: 'Python Skill Development Program', description: 'A company-sponsored program helping students build practical Python, SQL, and data-analysis skills.', objectives: 'Build job-ready foundations through guided training and projects.', category: 'Skill Development', skills: 'Python, SQL, Data Analysis', targetStudents: 25, trainingHours: 40, duration: '8 weeks', startDate: '2026-10-01', endDate: '2026-11-26', mode: 'Online', location: 'Online', eligibility: 'Computer science students or equivalent', benefits: 'Free training, mentorship, certificate, and consideration for internship opportunities.', sponsoredCourse: 'Python Foundations', scholarshipAmount: 0, internshipOpportunity: true, jobOpportunity: false, certificateAvailable: true, deadline: '2026-09-30', status: 'Published', createdAt: '2026-08-20T00:00:00.000Z', updatedAt: '2026-08-20T00:00:00.000Z', demoData: true });
			if (!csr.applications.some((application) => application.id === 'demo-csr-application-python')) csr.applications.push({ id: 'demo-csr-application-python', programId: demoCsrProgramId, companyId: demoCompany.id, companyName: demoCompany.profile.name, institutionId: demoInstitution.id, studentId: demoStudent.id, studentName: demoStudent.profile.name, course: demoStudent.profile.course, skills: studentSkills.map((skill) => `${skill.name} ${skill.score}%`).join(' · '), assessmentCount: studentAssessments.length, status: 'Selected', appliedAt: '2026-08-20T00:00:00.000Z', demoData: true });
			if (!institutionWorkspace.students.some((student) => student.studentId === demoStudent.id)) institutionWorkspace.students.push({ studentId: demoStudent.id, name: 'Demo Student', email: 'student@skillaura.demo', college: 'SkillAura Demo University', course: 'Computer Science and Engineering', year: '3rd Year', workspace: clone(demoStudent.workspace), demoAccount: true });
			if (!institutionWorkspace.internships.some((item) => item.applicationId === demoApplicationId)) institutionWorkspace.internships.push({ id: 'demo-internship-frontend', applicationId: demoApplicationId, studentId: demoStudent.id, companyId: demoCompany.id, institutionId: demoInstitution.id, title: 'Frontend Developer Intern', company: 'TechNova Solutions', status: 'Application in progress', demoData: true });
			saveCompanyWorkspace(companyWorkspace);
			saveInstitutionWorkspace(institutionWorkspace);
			state.opportunities = ecosystem.opportunities;
			state.applications = ecosystem.applications;
			state.student = { ...state.student, ...demoStudent.profile };
			saveState();
		}
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
		function roleLabel(role) { return normalizeRole(role) === 'student' ? 'Student/Employee' : role[0].toUpperCase() + role.slice(1); }
		function personFor(role) { const normalized = normalizeRole(role); if (normalized === 'company') return state.company; if (normalized === 'institution') return state.institution; if (normalized === 'tutor') return currentTutorAccount()?.profile || { name: 'Tutor', initials: 'TU', role: 'tutor' }; return state.student; }
		function esc(value) { return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char])); }
		function go(route) { location.hash = route.startsWith('#') ? route : `#${route}`; }
		const EXAM_PORTAL_URL = '/Exam%20Potral/index.html';
		async function openExamPortal() {
			try {
				const response = await fetch(EXAM_PORTAL_URL, { cache: 'no-store' });
				if (!response.ok) throw new Error('Exam Portal is unavailable.');
				await response.text();
				window.location.assign(EXAM_PORTAL_URL);
			} catch (error) {
				showToast('Exam Portal is unavailable. Start the SkillBridge server and try again.');
			}
		}
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
		function institutionSidebarNavigation(current) {
			const childLinks = (items, prefix = 'institution') => items.map(([key, label, icon]) => `<a class="side-subitem ${key === current ? 'active' : ''}" href="#/${prefix}/${key}" onclick="closeSidebar()" title="${label}" data-tooltip="${label}"><span class="side-icon" aria-hidden="true">${icon}</span><span class="side-label">${label}</span></a>`).join('');
			const parent = (key, label, icon, open, items, nested = false) => `<div class="side-group ${open ? 'submenu-open' : ''}${nested ? ' side-nested-group' : ''}"><button class="side-parent" type="button" data-action="sidebar-submenu" data-submenu="${key}" aria-expanded="${open}" title="${label}" data-tooltip="${label}"><span class="side-icon" aria-hidden="true">${icon}</span><span class="side-label">${label}</span><span class="side-chevron" aria-hidden="true">⌄</span></button><div class="side-submenu">${items}</div></div>`;
			const link = (key, label, icon) => `<a class="side-item ${key === current ? 'active' : ''}" href="#/institution/${key}" onclick="closeSidebar()" title="${label}" data-tooltip="${label}"><span class="side-icon" aria-hidden="true">${icon}</span><span class="side-label">${label}</span></a>`;
			const developmentItems = childLinks([['skills', 'Student Skills', icons.skills], ['skill-gaps', 'Skill Gaps', icons['skill-gaps']], ['learning', 'Learning & Development', icons.learning]]);
			const developmentOpen = ['skills', 'skill-gaps', 'learning'].includes(current);
			const studentsOpen = developmentOpen || current === 'assessments';
			const students = parent('institution-students', 'Students', icons.students, studentsOpen, `${parent('student-development', 'Student Development', icons.learning, developmentOpen, developmentItems, true)}${childLinks([['assessments', 'Assessments', icons.assessments]])}`);
			const placementsOpen = ['internships', 'placements', 'partnerships'].includes(current);
			const opportunitiesOpen = ['industry', 'faculty'].includes(current);
			const analyticsOpen = ['analytics', 'reports'].includes(current);
			return `${link('dashboard', 'Dashboard', icons.dashboard)}${students}${parent('institution-placements', 'Internships & Placements', icons.internships, placementsOpen, childLinks([['internships', 'Internships', icons.internships], ['placements', 'Placements', icons.placements], ['partnerships', 'Partnerships', icons.partnerships]]))}${parent('institution-opportunities', 'Opportunities', icons.opportunities, opportunitiesOpen, childLinks([['industry', 'Industry Opportunities', icons.opportunities], ['faculty', 'Faculty Opportunities', icons.faculty]]))}${parent('institution-analytics', 'Analytics & Reports', icons.analytics, analyticsOpen, childLinks([['analytics', 'Analytics', icons.analytics], ['reports', 'Reports & Analytics', icons.reports]]))}${link('profile', 'Institution Profile', icons.profile)}${link('settings', 'Settings', icons.settings)}`;
		}

		function functionalSidebar(role) {
			const normalizedRole = normalizeRole(role);
			const routeRole = normalizedRole;
			const current = location.hash.slice(1).split('/')[2] || 'dashboard';
			const routes = dashboardRoutes[routeRole] || dashboardRoutes.company || {};
			const navigation = routeRole === 'student' ? studentSidebarNavigation(current) : routeRole === 'institution' ? institutionSidebarNavigation(current) : Object.entries(routes).map(([key, label]) => `<a class="side-item ${key === current ? 'active' : ''}" href="#/${routeRole}/${key}" onclick="closeSidebar()" title="${label}" data-tooltip="${label}"><span class="side-icon" aria-hidden="true">${icons[key] || '◉'}</span><span class="side-label">${label}</span></a>`).join('');
			return `<aside class="sidebar" id="sidebar" data-sidebar-role="${routeRole}"><div class="side-brand">${brand()}</div><nav class="side-nav" aria-label="Workspace navigation">${navigation}</nav><div class="side-spacer"></div>${routeRole === 'student' ? `<a class="side-item ${current === 'settings' ? 'active' : ''}" href="#/${routeRole}/settings" onclick="closeSidebar()" title="Settings" data-tooltip="Settings"><span class="side-icon" aria-hidden="true">⚙</span><span class="side-label">Settings</span></a>` : ''}<button class="side-pin" data-action="sidebar-pin" type="button" aria-pressed="false" aria-label="Pin sidebar" title="Pin sidebar">⌖</button><button class="logout" data-action="logout" title="Logout" data-tooltip="Logout"><span class="side-icon" aria-hidden="true">↪</span><span class="side-label">Logout</span></button></aside>`;
		}
		function globalSearchMarkup() { return `<div class="global-search" data-search-root><div class="global-search-input-wrap"><span class="global-search-icon" aria-hidden="true">🔍</span><input class="search" data-global-search-input type="search" placeholder="Search anything" aria-label="Search anything" aria-controls="global-search-results" autocomplete="off"><kbd>⌘ K</kbd><button class="global-search-clear" data-action="clear-global-search" type="button" aria-label="Clear search" hidden>×</button></div><div class="global-search-results" id="global-search-results" role="listbox" hidden></div></div>`; }
		function shell(role, title, content) {
			const normalizedRole = normalizeRole(role);
			const person = personFor(normalizedRole);
			const unread = state.notifications.filter((item) => !item.read).length + currentEcosystemNotifications().filter((item) => !item.read).length;
			const demoTag = person.demoAccount ? '<span class="tag blue">Demo Account</span>' : '';
			const profileRoute = `#/${normalizedRole}/profile`;
			return `<div class="app">${functionalSidebar(normalizedRole)}<main class="main"><header class="topbar"><div style="display:flex;align-items:center"><button class="mobile-dash-menu hidden" data-action="toggle-sidebar">☰</button><h2>${esc(title)}</h2></div><div class="topbar-right">${globalSearchMarkup()}${demoTag}<button class="notification-button${unread ? ' has-unread' : ''}" data-action="notifications" aria-label="Notifications${unread ? `, ${unread} unread` : ''}">🔔${unread ? `<sup>${unread}</sup>` : ''}</button><a class="profile-header" href="${profileRoute}" aria-label="Open ${esc(person.name)} profile"><div class="avatar">${esc(person.initials)}</div><div class="user-meta">${esc(person.name)}<span>${roleLabel(normalizedRole)}</span></div></a></div></header><div class="dash-content">${content}</div></main></div>`;
		}
		function pageIntro(title, text, action = '') { return `<div class="dash-intro"><div><h1>${esc(title)}</h1><p>${esc(text)}</p></div>${action}</div>`; }
		function searchBox(placeholder = 'Search this workspace') { return `<input class="page-search" data-action="filter" placeholder="⌕  ${placeholder}" aria-label="${placeholder}">`; }
		function searchText(value) { return String(value || '').toLowerCase(); }
		function searchWorkspaceRoute(section) {
			const role = normalizeRole(currentAuthSession()?.role || state.activeRole || 'student');
			if (section === 'applications') return role === 'company' ? '/company/applications' : role === 'institution' ? '/institution/placements' : '/student/applications';
			if (section === 'interviews') return role === 'company' ? '/company/interviews' : role === 'institution' ? '/institution/placements' : '/student/interviews';
			if (section === 'offers') return role === 'company' ? '/company/applications' : role === 'institution' ? '/institution/placements' : '/student/offers';
			if (section === 'internships') return role === 'institution' ? '/institution/internships' : role === 'company' ? '/company/applications' : '/student/internships';
			if (section === 'placements') return role === 'institution' ? '/institution/placements' : role === 'company' ? '/company/applications' : '/student/placements';
			return role === 'institution' ? '/institution/skills' : '/student/skills';
		}
		function globalSearchIndex() {
			const items = [];
			sharedEcosystem().opportunities.forEach((item) => items.push({ type: 'Opportunity', icon: '▣', title: item.title, description: `${item.company} · ${item.location || 'Flexible'} · ${item.skills || ''}`, search: [item.title, item.company, item.description, item.skills, item.type, item.location, item.department], action: 'opportunity', titleKey: item.title }));
			(state.skills || []).forEach((item) => items.push({ type: 'Skill', icon: '✦', title: item.name, description: `${item.score || 0}% · ${item.status || 'In progress'}`, search: [item.name, item.status, 'skill'], route: searchWorkspaceRoute('skills') }));
			(state.assessments || []).forEach((item) => items.push({ type: 'Verified skill', icon: '✓', title: item.skill, description: `${item.score}% · ${item.rating}`, search: [item.skill, item.rating, 'assessment', 'verified'], route: '/student/skill-profile' }));
			(state.careers || []).forEach((item) => items.push({ type: 'Career path', icon: '◎', title: item.name, description: item.description, search: [item.name, item.description, item.skills, 'career'], route: '/student/career-path' }));
			sharedEcosystem().applications.forEach((item) => items.push({ type: 'Application', icon: '▤', title: item.opportunity, description: `${item.company || 'Company'} · ${item.status || item.stage || 'Applied'}`, search: [item.opportunity, item.company, item.status, item.stage, item.studentName, 'application'], route: searchWorkspaceRoute('applications') }));
			sharedEcosystem().interviews.forEach((item) => items.push({ type: 'Interview', icon: '◷', title: item.opportunity, description: `${item.candidateName || 'Candidate'} · ${item.date || 'Date pending'}`, search: [item.opportunity, item.candidateName, item.date, 'interview'], route: searchWorkspaceRoute('interviews') }));
			sharedEcosystem().offers.forEach((item) => items.push({ type: 'Offer', icon: '◆', title: item.opportunity, description: `${item.candidateName || 'Candidate'} · ${item.status}`, search: [item.opportunity, item.candidateName, item.status, 'offer'], route: searchWorkspaceRoute('offers') }));
			sharedEcosystem().internships.forEach((item) => items.push({ type: 'Internship', icon: '▤', title: item.title || item.opportunity, description: `${item.company || 'Company'} · ${item.status}`, search: [item.title, item.opportunity, item.company, item.status, 'internship'], route: searchWorkspaceRoute('internships') }));
			sharedEcosystem().placements.forEach((item) => items.push({ type: 'Placement', icon: '↗', title: item.role || item.title || item.opportunity, description: `${item.company || 'Company'} · ${item.status}`, search: [item.role, item.title, item.opportunity, item.company, item.status, 'placement'], route: searchWorkspaceRoute('placements') }));
			currentEcosystemNotifications().forEach((item) => items.push({ type: 'Notification', icon: '◌', title: item.text, description: item.time || 'Recent update', search: [item.text, item.time, 'notification'], route: '/student/notifications' }));
			const person = personFor(normalizeRole(currentAuthSession()?.role || state.activeRole || 'student'));
			if (person?.name) items.push({ type: 'Profile', icon: '◉', title: person.name, description: `${person.role || roleLabel(state.activeRole || 'student')}`, search: [person.name, person.email, person.role, 'profile'], route: `/${normalizeRole(currentAuthSession()?.role || state.activeRole || 'student')}/profile` });
			(data.candidates || []).forEach((item) => items.push({ type: 'Candidate', icon: '♙', title: item[0], description: `${item[1]} · ${item[3]}`, search: item, route: '/company/candidates' }));
			return items;
		}
		function highlightSearch(value, query) { const text = esc(value); if (!query) return text; const escapedQuery = esc(query).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); return text.replace(new RegExp(`(${escapedQuery})`, 'ig'), '<mark>$1</mark>'); }
		function globalSearchResults(query) {
			const normalized = searchText(query).trim();
			if (!normalized) return [];
			return globalSearchIndex().map((item) => {
				const haystack = searchText(item.search.join(' '));
				const terms = normalized.split(/\s+/).filter(Boolean);
				const matches = terms.filter((term) => haystack.includes(term)).length;
				const exact = searchText(item.title).includes(normalized) ? 3 : 0;
				return { ...item, score: matches * 2 + exact };
			}).filter((item) => item.score > 0).sort((a, b) => b.score - a.score || a.title.localeCompare(b.title)).slice(0, 8);
		}
		function renderGlobalSearch() {
			const input = document.querySelector('[data-global-search-input]');
			const panel = document.getElementById('global-search-results');
			if (!input || !panel) return;
			const query = input.value.trim();
			globalSearchState.query = input.value;
			globalSearchState.results = globalSearchResults(input.value);
			globalSearchState.activeIndex = -1;
			globalSearchState.open = Boolean(query);
			input.closest('[data-search-root]')?.classList.toggle('is-focused', globalSearchState.open || document.activeElement === input);
			input.closest('[data-search-root]')?.querySelector('.global-search-clear')?.toggleAttribute('hidden', !input.value);
			if (!query) { panel.hidden = true; panel.innerHTML = ''; return; }
			panel.hidden = false;
			panel.innerHTML = globalSearchState.results.length ? globalSearchState.results.map((item, index) => `<button class="global-search-result ${index === globalSearchState.activeIndex ? 'active' : ''}" data-action="global-search-result" data-result-index="${index}" type="button" role="option"><span class="global-search-result-icon">${item.icon}</span><span><strong>${highlightSearch(item.title, query)}</strong><small><b>${esc(item.type)}</b> · ${highlightSearch(item.description, query)}</small></span><span class="global-search-arrow">↗</span></button>`).join('') + `<button class="global-search-all" data-action="global-search-all" type="button">View all results <span>↗</span></button>` : `<div class="global-search-empty"><strong>No results found</strong><span>Try a skill, company, opportunity, or career path.</span></div>`;
		}
		function closeGlobalSearch() { const input = document.querySelector('[data-global-search-input]'); const panel = document.getElementById('global-search-results'); if (panel) panel.hidden = true; input?.closest('[data-search-root]')?.classList.remove('is-focused'); globalSearchState.open = false; }
		function focusGlobalSearch() { const input = document.querySelector('[data-global-search-input]'); if (input) { input.focus(); renderGlobalSearch(); } }
		function emptyState(text) { return `<div class="empty-state">${esc(text)}</div>`; }
		function assessmentRating(score) { if (score >= 90) return 'Excellent'; if (score >= 80) return 'Advanced'; if (score >= 70) return 'Good'; if (score >= 60) return 'Intermediate'; if (score >= 40) return 'Beginner'; return 'Needs Improvement'; }
		function assessmentStats() { const assessments = state.assessments || []; const average = assessments.length ? Math.round((assessments.reduce((total, item) => total + item.score, 0) / assessments.length) * 10) / 10 : 0; return { assessments, average }; }
		function assessmentHistoryMarkup(limit) { const assessments = state.assessments || []; const items = limit ? assessments.slice(-limit).reverse() : assessments.slice().reverse(); return items.length ? `<div class="assessment-history">${items.map((item) => `<div class="assessment-history-row"><div><strong>${esc(item.skill)}</strong><small>${new Date(item.completedAt).toLocaleDateString()}</small></div><div><b>${item.score}%</b><span class="tag ${item.score >= 70 ? 'success' : 'warning'}">${esc(item.rating)}</span></div></div>`).join('')}</div>` : emptyState('No assessments yet. Choose a skill to begin.'); }
		function skillRecordDetails(skill) {
			const name = skill.skill || skill.name;
			const assessment = (state.assessments || []).find((item) => item.skill === name);
			const gap = (state.gaps || []).find((item) => item.name === name);
			return { name, score: Number(skill.score || assessment?.score || 0), status: skill.rating || skill.status || assessment?.rating || 'In progress', target: gap?.target, gap: gap ? Math.max(0, gap.target - Number(skill.score || assessment?.score || 0)) : null, assessment };
		}
		function skillCardMarkup(skill) {
			const details = skillRecordDetails(skill);
			return `<article class="skill-card" tabindex="0" role="button" data-action="view-skill" data-skill="${esc(details.name)}" aria-label="View details for ${esc(details.name)} skill"><div class="skill-card-top"><div><span class="skill-card-icon" aria-hidden="true">✦</span><h4>${esc(details.name)}</h4></div><span class="tag ${details.score >= 70 ? 'success' : 'warning'}">${esc(details.status)}</span></div><div class="skill-card-score"><div class="skill-ring" style="--skill-score:${details.score}" aria-label="${details.score}% score"><strong>${details.score}%</strong></div><div class="skill-card-summary"><span>Current score</span>${details.target !== undefined ? `<small>Target ${details.target}% · Gap ${details.gap}%</small>` : '<small>Assessment score</small>'}</div></div><div class="skill-card-footer"><span>${details.assessment ? `Assessed ${new Date(details.assessment.completedAt).toLocaleDateString()}` : 'Skill profile record'}</span><button class="btn-plain" type="button" data-action="view-skill" data-skill="${esc(details.name)}">View Details →</button></div></article>`;
		}
		function upgradeSkillCards() {
			const skills = (state.assessments || []).length ? state.assessments : state.skills || [];
			const panels = [...document.querySelectorAll('.dash-panel')].filter((panel) => ['Assessed Skills', 'Verified Skills'].includes(panel.querySelector('.panel-head h3')?.textContent.trim()));
			panels.forEach((panel) => {
				const head = panel.querySelector('.panel-head');
				if (!head || panel.dataset.skillCardsReady) return;
				panel.dataset.skillCardsReady = 'true';
				panel.innerHTML = `${head.outerHTML}${skills.length ? skills.map(skillCardMarkup).join('') : emptyState('No skills assessed yet.')}`;
			});
		}
		function studentDashboardPage() {
			const { assessments, average } = assessmentStats();
			return shell('student', 'Student Dashboard', `${pageIntro(state.student.title, 'Build your profile from real assessment results.', '<button class="btn btn-primary" data-action="route" data-route="/student/assessment">＋ Add Skill Assessment</button>')}<section class="dash-panel skill-profile-panel"><div class="panel-head"><div><h3>My Skill Profile</h3><p class="muted">Your scores begin at zero and grow with completed assessments.</p></div></div><div class="kpis assessment-kpis"><div class="kpi"><div class="kpi-top"><span>Skills Assessed</span><span class="kpi-icon">✦</span></div><div class="kpi-value">${assessments.length}</div></div><div class="kpi"><div class="kpi-top"><span>Assessments Completed</span><span class="kpi-icon">✓</span></div><div class="kpi-value">${assessments.length}</div></div><div class="kpi"><div class="kpi-top"><span>Average Score</span><span class="kpi-icon">▥</span></div><div class="kpi-value">${average}%</div></div><div class="kpi"><div class="kpi-top"><span>Skill Readiness</span><span class="kpi-icon">◉</span></div><div class="kpi-value">${average}%</div></div></div></section><div class="dash-grid"><section class="dash-panel"><div class="panel-head"><h3>Assessed Skills</h3><button class="btn-plain" data-action="route" data-route="/student/assessment">Take assessment →</button></div>${assessments.length ? assessments.map((item) => `<div class="skill"><div class="skill-line"><span><b>${esc(item.skill)}</b> <span class="tag ${item.score >= 70 ? 'success' : 'warning'}">${esc(item.rating)}</span></span><span><b>${item.score}%</b> <button class="btn-plain" data-action="retake-assessment" data-skill="${esc(item.skill)}">Retake</button></span></div><div class="bar"><span style="width:${item.score}%"></span></div></div>`).join('') : emptyState('No skills assessed yet.')}</section><section class="dash-panel"><div class="panel-head"><h3>Assessment History</h3><button class="btn-plain" data-action="route" data-route="/student/skills">View all →</button></div>${assessmentHistoryMarkup(4)}</section></div><section class="dash-panel"><div class="panel-head"><h3>Recommended Opportunities</h3><button class="btn-plain" data-action="route" data-route="/student/opportunities">View all opportunities →</button></div>${state.opportunities.slice(0, 3).map(opportunityRow).join('')}</section></div>`);
		}
		function tutorCourseForm(course = {}) {
			return `<form class="dash-panel editable-form" data-form="tutor-course"><div class="panel-head"><h3>${course.id ? 'Edit Course' : 'Create Course'}</h3></div><input type="hidden" name="courseId" value="${esc(course.id || '')}"><label>Course title</label><input name="title" value="${esc(course.title || '')}" placeholder="e.g. Modern JavaScript Foundations" required><label>Description</label><textarea name="description" rows="3" placeholder="What will learners achieve?" required>${esc(course.description || '')}</textarea><div class="form-row"><div><label>Category</label><input name="category" value="${esc(course.category || '')}" placeholder="Web development" required></div><div><label>Difficulty</label><select name="difficulty"><option ${course.difficulty === 'Beginner' ? 'selected' : ''}>Beginner</option><option ${course.difficulty === 'Intermediate' ? 'selected' : ''}>Intermediate</option><option ${course.difficulty === 'Advanced' ? 'selected' : ''}>Advanced</option></select></div></div><label>Skills / topics covered</label><input name="skills" value="${esc(course.skills || '')}" placeholder="JavaScript, DOM, accessibility" required><label>Course thumbnail URL <span>(optional)</span></label><input name="thumbnail" type="url" value="${esc(course.thumbnail || '')}" placeholder="https://example.com/course-image.jpg"><label>Modules / course content</label><textarea name="modules" rows="3" placeholder="Module 1: Foundations&#10;Module 2: Practice" required>${esc(course.modules || '')}</textarea><div class="form-row"><div><label>Duration</label><input name="duration" value="${esc(course.duration || '')}" placeholder="6 weeks" required></div><div><label>Price</label><input name="price" value="${esc(course.price || 'Free')}" placeholder="Free or 499" required></div></div><button class="btn btn-primary" type="submit">${course.id ? 'Save Course Changes' : 'Save Course as Draft'}</button></form>`;
		}
		function tutorExamQuestion(question = {}) {
			return `<div class="tutor-question"><div class="panel-head"><strong>Multiple-choice question</strong><button class="btn-plain" type="button" data-action="tutor-remove-question">Remove</button></div><label>Question</label><textarea name="questionText" rows="2" placeholder="Write the question" required>${esc(question.text || '')}</textarea><div class="form-row"><div><label>Option A</label><input name="questionOptionA" value="${esc(question.options?.A || '')}" required></div><div><label>Option B</label><input name="questionOptionB" value="${esc(question.options?.B || '')}" required></div></div><div class="form-row"><div><label>Option C</label><input name="questionOptionC" value="${esc(question.options?.C || '')}" required></div><div><label>Option D</label><input name="questionOptionD" value="${esc(question.options?.D || '')}" required></div></div><div class="form-row"><div><label>Correct answer</label><select name="questionAnswer"><option value="A" ${question.answer === 'A' ? 'selected' : ''}>Option A</option><option value="B" ${question.answer === 'B' ? 'selected' : ''}>Option B</option><option value="C" ${question.answer === 'C' ? 'selected' : ''}>Option C</option><option value="D" ${question.answer === 'D' ? 'selected' : ''}>Option D</option></select></div><div><label>Marks</label><input name="questionMarks" type="number" min="1" value="${esc(question.marks || 1)}" required></div></div></div>`;
		}
		function tutorExamForm(exam = {}, courses = []) {
			const questions = exam.questions?.length ? exam.questions : [{}];
			return `<form class="dash-panel editable-form" data-form="tutor-exam"><div class="panel-head"><h3>${exam.id ? 'Edit Exam' : 'Create Exam'}</h3></div><input type="hidden" name="examId" value="${esc(exam.id || '')}"><label>Exam title</label><input name="title" value="${esc(exam.title || '')}" placeholder="e.g. JavaScript Fundamentals Assessment" required><label>Description / instructions</label><textarea name="description" rows="3" placeholder="Explain the exam instructions and expectations." required>${esc(exam.description || '')}</textarea><div class="form-row"><div><label>Course</label><select name="courseId" required><option value="">Select a course</option>${courses.map((course) => `<option value="${esc(course.id)}" ${course.id === exam.courseId ? 'selected' : ''}>${esc(course.title)}</option>`).join('')}</select></div><div><label>Module / topic</label><input name="module" value="${esc(exam.module || '')}" placeholder="Module 1: Foundations"></div></div><div class="form-row"><div><label>Difficulty</label><select name="difficulty"><option ${exam.difficulty === 'Beginner' ? 'selected' : ''}>Beginner</option><option ${exam.difficulty === 'Intermediate' ? 'selected' : ''}>Intermediate</option><option ${exam.difficulty === 'Advanced' ? 'selected' : ''}>Advanced</option></select></div><div><label>Time limit (minutes)</label><input name="timeLimit" type="number" min="1" value="${esc(exam.timeLimit || 30)}" required></div></div><div class="form-row"><div><label>Passing score (%)</label><input name="passingScore" type="number" min="1" max="100" value="${esc(exam.passingScore || 60)}" required></div><div><label>Availability</label><select name="availability"><option ${exam.availability === 'Scheduled' ? 'selected' : ''}>Always available</option><option ${exam.availability === 'Scheduled' ? 'selected' : ''}>Scheduled</option></select></div></div><div class="panel-head"><h3>Questions</h3><button class="btn btn-light" type="button" data-action="tutor-add-question">＋ Add question</button></div><div data-tutor-questions>${questions.map((question) => tutorExamQuestion(question)).join('')}</div><button class="btn btn-primary" type="submit">${exam.id ? 'Save Exam Changes' : 'Save Exam as Draft'}</button></form>`;
		}
		function tutorExamManagementMarkup() {
			const account = currentTutorAccount() || { courses: [], exams: [] };
			const courses = account.courses || [];
			const exams = account.exams || [];
			const published = exams.filter((exam) => exam.status === 'Published').length;
			const draft = exams.length - published;
			const courseName = (courseId) => courses.find((course) => course.id === courseId)?.title || 'Course not selected';
			return `<section class="tutor-exam-section"><div class="dash-intro"><div><h1>Exam &amp; Assessment Management</h1><p>Create assessments that connect directly to your courses and modules.</p></div><span class="tag blue">${exams.length} exams</span></div><div class="kpis"><div class="kpi"><div class="kpi-top"><span>Total Exams</span><span class="kpi-icon">▣</span></div><div class="kpi-value">${exams.length}</div></div><div class="kpi"><div class="kpi-top"><span>Published Exams</span><span class="kpi-icon">✓</span></div><div class="kpi-value">${published}</div></div><div class="kpi"><div class="kpi-top"><span>Draft Exams</span><span class="kpi-icon">◷</span></div><div class="kpi-value">${draft}</div></div><div class="kpi"><div class="kpi-top"><span>Total Questions</span><span class="kpi-icon">?</span></div><div class="kpi-value">${exams.reduce((total, exam) => total + (exam.questions?.length || 0), 0)}</div></div></div><section class="dash-panel" id="tutor-exams"><div class="panel-head"><h3>My Exams</h3><button class="btn btn-primary" data-action="tutor-new-exam">＋ Create Exam</button></div>${exams.length ? `<div class="tutor-exam-list">${exams.map((exam) => `<article class="application-row"><div><b>${esc(exam.title)}</b><p>${esc(courseName(exam.courseId))} · ${esc(exam.module || 'General assessment')}</p><small>${exam.questions?.length || 0} questions · ${exam.totalMarks || 0} marks · ${exam.timeLimit || 0} minutes</small></div><div class="card-actions"><span class="tag ${exam.status === 'Published' ? 'success' : 'warning'}">${esc(exam.status || 'Draft')}</span><button class="btn-plain" data-action="tutor-view-exam" data-id="${esc(exam.id)}">View</button><button class="btn-plain" data-action="tutor-edit-exam" data-id="${esc(exam.id)}">Edit</button><button class="btn-plain" data-action="tutor-duplicate-exam" data-id="${esc(exam.id)}">Duplicate</button><button class="btn-plain" data-action="tutor-${exam.status === 'Published' ? 'unpublish' : 'publish'}-exam" data-id="${esc(exam.id)}">${exam.status === 'Published' ? 'Unpublish' : 'Publish'}</button><button class="btn-plain" data-action="tutor-delete-exam" data-id="${esc(exam.id)}">Delete</button></div></article>`).join('')}</div>` : emptyState('No exams yet. Create an assessment for one of your courses.')}</section><div id="tutor-exam-form">${tutorExamForm({}, courses)}</div></section>`;
		}
		function addTutorTakeExamButton() {
			const intro = document.querySelector('.dash-content > .dash-intro');
			const createCourse = intro?.querySelector('[data-action="tutor-focus-course"]');
			if (!createCourse || intro.querySelector('.tutor-dashboard-actions')) return;
			const actions = document.createElement('div');
			actions.className = 'tutor-dashboard-actions';
			createCourse.replaceWith(actions);
			actions.append(createCourse);
			actions.insertAdjacentHTML('beforeend', '<button class="btn btn-light" type="button" data-action="tutor-take-exam">Take Exam</button>');
		}
		function tutorTakeExamPanel() {
			const account = currentTutorAccount() || { exams: [], courses: [] };
			const exams = (account.exams || []).filter((exam) => exam.status === 'Published' && exam.questions?.length);
			const session = state.tutorExamSession;
			const exam = session ? exams.find((item) => item.id === session.examId) : null;
			if (session && !exam) { delete state.tutorExamSession; return tutorTakeExamPanel(); }
			if (!exam) return `<div class="modal-backdrop" onclick="if(event.target===this)this.remove()"><div class="modal-card tutor-take-exam-panel"><button class="modal-close" data-action="close-modal" aria-label="Close exams">×</button><h2>Take Exam</h2><p>Choose a published exam from your tutor workspace.</p>${exams.length ? exams.map((item) => `<div class="application-row"><div><b>${esc(item.title)}</b><p>${esc(item.description || 'Assessment')} · ${item.questions.length} questions · ${item.timeLimit || 0} minutes</p></div><button class="btn btn-primary" data-action="tutor-start-exam" data-id="${esc(item.id)}">Start</button></div>`).join('') : emptyState('No published exams are available yet.')}</div></div>`;
			const question = exam.questions[session.index];
			const selected = session.answers[session.index];
			return `<div class="modal-backdrop" onclick="if(event.target===this)this.remove()"><div class="modal-card tutor-take-exam-panel"><button class="modal-close" data-action="close-modal" aria-label="Close exam">×</button><span class="tag blue">Question ${session.index + 1} of ${exam.questions.length}</span><h2>${esc(exam.title)}</h2><p>${esc(question.text)}</p><div class="assessment-options">${Object.entries(question.options || {}).map(([key, value]) => `<label><input type="radio" name="tutor-exam-answer" value="${key}" ${selected === key ? 'checked' : ''}> ${key}. ${esc(value)}</label>`).join('')}</div><button class="btn btn-primary" data-action="${session.index === exam.questions.length - 1 ? 'tutor-submit-exam' : 'tutor-next-exam'}">${session.index === exam.questions.length - 1 ? 'Submit Exam' : 'Next Question'}</button></div></div>`;
		}
		function refreshTutorTakeExamPanel() {
			const panel = document.querySelector('.tutor-take-exam-panel');
			if (panel) { panel.closest('.modal-backdrop').outerHTML = tutorTakeExamPanel(); bindFunctionalEvents(); }
		}
		function tutorDashboardPage() {
			const account = currentTutorAccount() || { profile: { name: 'Tutor', email: '', expertise: '', bio: '' }, courses: [] };
			const courses = account.courses || [];
			const published = courses.filter((course) => course.status === 'Published').length;
			return shell('tutor', 'Tutor Dashboard', `${pageIntro(`Welcome, ${account.profile?.name || 'Tutor'}`, 'Create practical courses and help learners build their next skill.', '<button class="btn btn-primary" data-action="tutor-focus-course">＋ Create Course</button>')}<div class="kpis"><div class="kpi"><div class="kpi-top"><span>Total Courses</span><span class="kpi-icon">▣</span></div><div class="kpi-value">${courses.length}</div><div class="kpi-note">Your course library</div></div><div class="kpi"><div class="kpi-top"><span>Published Courses</span><span class="kpi-icon">✓</span></div><div class="kpi-value">${published}</div><div class="kpi-note">Visible to learners</div></div><div class="kpi"><div class="kpi-top"><span>Total Learners</span><span class="kpi-icon">♙</span></div><div class="kpi-value">${courses.reduce((total, course) => total + (course.learners || 0), 0)}</div><div class="kpi-note">Across your courses</div></div><div class="kpi"><div class="kpi-top"><span>Completion Rate</span><span class="kpi-icon">◎</span></div><div class="kpi-value">${published ? Math.round(courses.filter((course) => course.status === 'Published').reduce((total, course) => total + (course.completion || 0), 0) / published) : 0}%</div><div class="kpi-note">Published course average</div></div></div><div class="dash-grid"><section class="dash-panel" id="tutor-courses"><div class="panel-head"><h3>My Courses</h3><span class="tag blue">${published} published</span></div>${courses.length ? courses.map((course) => `<article class="application-row"><div><b>${esc(course.title)}</b><p>${esc(course.category)} · ${esc(course.difficulty)} · ${esc(course.duration || 'Duration not set')}</p><small>${esc(course.skills || '')}</small></div><div class="card-actions"><span class="tag ${course.status === 'Published' ? 'success' : 'warning'}">${esc(course.status)}</span><button class="btn-plain" data-action="tutor-edit-course" data-id="${esc(course.id)}">Edit</button>${course.status === 'Draft' ? `<button class="btn-plain" data-action="tutor-publish-course" data-id="${esc(course.id)}">Publish</button>` : ''}<button class="btn-plain" data-action="tutor-delete-course" data-id="${esc(course.id)}">Delete</button></div></article>`).join('') : emptyState('No courses yet. Create your first course to get started.')}</section>${tutorCourseForm()}</div><section class="dash-panel"><div class="panel-head"><h3>Tutor Profile</h3><span class="tag blue">Public profile</span></div><form class="editable-form" data-form="tutor-profile"><div class="form-row"><div><label>Tutor name</label><input name="name" value="${esc(account.profile?.name || '')}" required></div><div><label>Expertise / skills</label><input name="expertise" value="${esc(account.profile?.expertise || '')}" placeholder="JavaScript, UI design" required></div></div><label>Bio</label><textarea name="bio" rows="3" placeholder="Tell learners what you teach.">${esc(account.profile?.bio || '')}</textarea><button class="btn btn-light" type="submit">Save Tutor Profile</button></form></section>`);
		}
		function tutorCoursesPage() {
			const account = currentTutorAccount() || { courses: [] };
			const courses = account.courses || [];
			return shell('tutor', 'My Courses', `${pageIntro('My Courses', 'Create and manage the courses in your tutor workspace.', '<button class="btn btn-primary" data-action="tutor-focus-course">＋ Create Course</button>')}<section class="dash-panel" id="tutor-courses"><div class="panel-head"><h3>Course Library</h3><span class="tag blue">${courses.length} courses</span></div>${courses.length ? courses.map((course) => `<article class="application-row"><div><b>${esc(course.title)}</b><p>${esc(course.category)} · ${esc(course.difficulty)} · ${esc(course.duration || 'Duration not set')}</p><small>${esc(course.skills || '')}</small></div><div class="card-actions"><span class="tag ${course.status === 'Published' ? 'success' : 'warning'}">${esc(course.status)}</span><button class="btn-plain" data-action="tutor-edit-course" data-id="${esc(course.id)}">Edit</button>${course.status === 'Draft' ? `<button class="btn-plain" data-action="tutor-publish-course" data-id="${esc(course.id)}">Publish</button>` : ''}<button class="btn-plain" data-action="tutor-delete-course" data-id="${esc(course.id)}">Delete</button></div></article>`).join('') : emptyState('No courses yet. Create your first course below.')}</section><section id="tutor-course-form">${tutorCourseForm()}</section>`);
		}
		function tutorProfilePage() {
			const profile = currentTutorAccount()?.profile || { name: 'Tutor', expertise: '', bio: '' };
			return shell('tutor', 'Tutor Profile', `${pageIntro('Tutor Profile', 'Keep your tutor information current.') }<form class="dash-panel editable-form" data-form="tutor-profile"><label>Name</label><input name="name" value="${esc(profile.name || '')}" required><label>Expertise</label><input name="expertise" value="${esc(profile.expertise || '')}" placeholder="e.g. JavaScript and web development" required><label>Bio</label><textarea name="bio" rows="5" placeholder="Tell learners about your experience." required>${esc(profile.bio || '')}</textarea><button class="btn btn-primary" type="submit">Save Profile</button></form>`);
		}
		function tutorDashboardSummaryPage() {
			const account = currentTutorAccount() || { profile: { name: 'Tutor' }, courses: [] };
			const courses = account.courses || [];
			const published = courses.filter((course) => course.status === 'Published').length;
			const learners = courses.reduce((total, course) => total + (course.learners || 0), 0);
			const completion = published ? Math.round(courses.filter((course) => course.status === 'Published').reduce((total, course) => total + (course.completion || 0), 0) / published) : 0;
			return shell('tutor', 'Tutor Dashboard', `${pageIntro(`Welcome, ${account.profile?.name || 'Tutor'}`, 'Create practical courses and help learners build their next skill.', '<button class="btn btn-primary" data-action="tutor-focus-course">＋ Create Course</button>')}<div class="kpis"><div class="kpi"><div class="kpi-top"><span>Total Courses</span><span class="kpi-icon">▣</span></div><div class="kpi-value">${courses.length}</div><div class="kpi-note">Your course library</div></div><div class="kpi"><div class="kpi-top"><span>Published Courses</span><span class="kpi-icon">✓</span></div><div class="kpi-value">${published}</div><div class="kpi-note">Visible to learners</div></div><div class="kpi"><div class="kpi-top"><span>Total Learners</span><span class="kpi-icon">♙</span></div><div class="kpi-value">${learners}</div><div class="kpi-note">Across your courses</div></div><div class="kpi"><div class="kpi-top"><span>Completion Rate</span><span class="kpi-icon">◎</span></div><div class="kpi-value">${completion}%</div><div class="kpi-note">Published course average</div></div></div><section class="dash-panel"><div class="panel-head"><h3>Dashboard Actions</h3></div><p class="muted">Use My Courses to manage course content and Tutor Profile to update your information.</p><div class="card-actions"><button class="btn btn-light" data-action="route" data-route="/tutor/courses">Open My Courses</button><button class="btn btn-light" data-action="route" data-route="/tutor/profile">Open Tutor Profile</button></div></section>`);
		}
		function opportunityRow(opportunity) { return `<button class="opportunity opportunity-button" data-action="view-opportunity" data-title="${esc(opportunity.title)}"><span class="opportunity-icon">▣</span><span class="opportunity-info"><strong>${esc(opportunity.title)}</strong><small>${esc(opportunity.company)} · ${esc(opportunity.location)}<br>${esc(opportunity.skills)}</small></span><span class="match">${esc(opportunity.match)}<small style="display:block;color:var(--muted);font-weight:400">match</small></span></button>`; }
		function studentApplicationsPage() { const applications = sharedEcosystem().applications.filter((item) => item.studentId === studentIdForSession()); return shell('student', 'Applications', `${pageIntro('My Applications', 'Track the same application records companies and institutions see.')}${applications.length ? `<div class="dash-panel">${applications.map((item) => `<div class="application-row"><div><b>${esc(item.opportunity)}</b><p>${esc(item.company)} · ${esc(item.applied || '')} · ${item.match || 0}% Prototype Match Score</p></div><div>${companyStatusTag(item.status || item.stage)}${item.status === 'Offer Sent' ? `<button class="btn btn-primary" data-action="student-accept-offer" data-id="${item.applicationId || item.id}">Accept Offer</button>` : ''}</div></div>`).join('')}</div>` : emptyState('No applications yet. Explore opportunities to get started.')}`); }
		function studentInterviewsPage() { const interviews = sharedEcosystem().interviews.filter((item) => item.studentId === studentIdForSession()); const recent = (state.mockInterviews || []).slice(0, 3); return shell('student', 'Interviews', `${pageIntro('Interview Center', 'Practice with role-specific questions or review interviews scheduled by companies.', '<button class="btn btn-primary" data-action="route" data-route="/student/mock-interview">Start Mock Interview</button>')}${recent.length ? `<section class="dash-panel"><div class="panel-head"><h3>Recent Practice Results</h3></div>${recent.map((item) => `<div class="application-row"><div><b>${esc(item.role)}</b><p>${esc(item.difficulty)} · ${new Date(item.completedAt).toLocaleDateString()}</p></div><span class="tag ${item.score >= 65 ? 'success' : 'warning'}">${item.score}% · ${esc(item.level)}</span></div>`).join('')}</section>` : ''}<section class="dash-panel"><div class="panel-head"><h3>Scheduled Interviews</h3></div>${interviews.length ? interviews.map((item) => `<div class="application-row"><div><b>${esc(item.opportunity)}</b><p>${esc(item.candidateName)} · ${esc(item.date)} ${esc(item.time || '')}</p></div>${companyStatusTag(item.status)}</div>`).join('') : emptyState('No interviews scheduled.')}</section>`); }
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
		function panelNotifications() { return [...state.notifications.map((item) => ({ ...item, source: 'local' })), ...currentEcosystemNotifications().map((item) => ({ ...item, source: 'ecosystem' }))]; }
		function markNotification(id, button, source = 'local') {
			const notifications = source === 'ecosystem' ? sharedEcosystem().notifications : state.notifications;
			const notification = notifications.find((item) => item.id === id);
			if (notification) notification.read = true;
			if (source === 'ecosystem') saveEcosystem(); else saveState();
			button.closest('.notification-row')?.remove();
		}
		function clearAllNotifications() {
			state.notifications = [];
			const activeIds = new Set(currentEcosystemNotifications().map((item) => item.id));
			const ecosystem = sharedEcosystem();
			ecosystem.notifications = ecosystem.notifications.filter((item) => !activeIds.has(item.id));
			saveEcosystem();
		}
		function clearNotificationsFromPanel(button) {
			clearAllNotifications();
			button.closest('.modal-backdrop')?.remove();
			renderFunctional();
			document.body.insertAdjacentHTML('beforeend', notificationPanel());
		}
		function notificationPanel() {
			const notifications = panelNotifications();
			const rows = notifications.map((item) => `<div class="notification-row ${item.read ? '' : 'unread'}"><span>${esc(item.text)}<small>${esc(item.time || '')}</small></span>${item.read ? '' : `<button class="btn-plain" onclick="markNotification('${item.id}', this, '${item.source}')">Mark read</button>`}</div>`).join('');
			return `<div class="modal-backdrop" onclick="this.remove()"><div class="modal-card notification-panel" onclick="event.stopPropagation()"><button class="modal-close" onclick="this.closest('.modal-backdrop').remove()">×</button><div class="notification-panel-header"><h2>Notifications</h2><button class="btn-plain notification-clear" onclick="clearNotificationsFromPanel(this)" type="button" ${notifications.length ? '' : 'disabled'}>Clear all</button></div>${notifications.length ? rows : emptyState('You are all caught up.')}</div></div>`;
		}
		function industryDashboardPage() { return shell('company', 'Industry Dashboard', `${pageIntro(state.company.title, state.company.subtitle, '<span class="tag blue">Prototype workspace</span>')}<div class="kpis"><div class="kpi"><div class="kpi-top"><span>Active Opportunities</span></div><div class="kpi-value">${state.opportunities.length}</div><div class="kpi-note">${state.opportunities.length} published</div></div><div class="kpi"><div class="kpi-top"><span>Applications</span></div><div class="kpi-value">${state.applications.length}</div><div class="kpi-note">Live prototype data</div></div><div class="kpi"><div class="kpi-top"><span>Shortlisted</span></div><div class="kpi-value">${state.applications.filter((item) => item.status === 'Shortlisted').length}</div></div><div class="kpi"><div class="kpi-top"><span>Selected</span></div><div class="kpi-value">${state.applications.filter((item) => item.status === 'Selected').length}</div></div></div><div class="action-grid"><button class="action" data-action="route" data-route="/company/post-opportunity">＋ Post Opportunity</button><button class="action" data-action="route" data-route="/company/candidates">♙ View Candidates</button><button class="action" data-action="route" data-route="/company/applications">▤ Manage Applications</button><button class="action" data-action="route" data-route="/company/programs">◈ Industry Programs</button></div><section class="dash-panel"><div class="panel-head"><h3>Active Opportunities</h3><button class="btn-plain" data-action="route" data-route="/company/opportunities">Manage all →</button></div>${state.opportunities.slice(0, 3).map((item) => `<div class="application-row"><div><b>${esc(item.title)}</b><p>${esc(item.company)} · ${esc(item.location)}</p></div><button class="btn-plain" data-action="view-opportunity" data-title="${esc(item.title)}">View →</button></div>`).join('')}</section>`); }
		function companyWorkspaceOrEmpty() { const account = currentCompanyAccount(); const workspace = currentCompanyWorkspace() || { companyId: account?.id || '', opportunities: [], applications: [], shortlist: [], interviews: [], messages: [], notifications: [], offers: [], notes: {}, onboarding: { status: 'Pending', completed: false } }; const ecosystem = sharedEcosystem(); const ownOpportunities = ecosystem.opportunities.filter((item) => item.companyId === account?.id); const ownApplications = ecosystem.applications.filter((item) => item.companyId === account?.id); const ownInterviews = ecosystem.interviews.filter((item) => item.companyId === account?.id); const ownOffers = ecosystem.offers.filter((item) => item.companyId === account?.id); const ownNotifications = ecosystem.notifications.filter((item) => item.targetRole === 'company' && item.targetId === account?.id); return { ...workspace, opportunities: [...workspace.opportunities.filter((item) => !ownOpportunities.some((record) => record.opportunityId === item.opportunityId)), ...ownOpportunities], applications: ownApplications, interviews: ownInterviews, offers: ownOffers, notifications: [...workspace.notifications.filter((item) => !ownNotifications.some((record) => record.id === item.id)), ...ownNotifications] }; }
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
		function csrData() { if (!state.csr) state.csr = { programs: [], applications: [] }; return state.csr; }
		function csrPrograms() { return csrData().programs; }
		function csrApplications() { return csrData().applications; }
		function csrProgramById(id) { return csrPrograms().find((program) => program.id === id); }
		function csrApplicationsFor(programId) { return csrApplications().filter((application) => application.programId === programId); }
		function csrApplicationFor(programId, studentId = studentIdForSession()) { return csrApplications().find((application) => application.programId === programId && application.studentId === studentId); }
		function csrStatusTag(status) { return `<span class="tag ${['Published', 'Selected', 'In Progress', 'Completed'].includes(status) ? 'success' : ['Rejected', 'Closed'].includes(status) ? 'warning' : 'blue'}">${esc(status)}</span>`; }
		function csrDate(value) { return value ? new Date(`${value}T23:59:59`).toLocaleDateString() : 'Not set'; }
		function csrIsOpen(program) { return program.status === 'Published' && (!program.deadline || new Date(`${program.deadline}T23:59:59`).getTime() >= Date.now()); }
		function csrSelectedCount(programId) { return csrApplicationsFor(programId).filter((application) => ['Selected', 'In Progress', 'Completed'].includes(application.status)).length; }
		function csrCompanyPrograms() { const account = currentCompanyAccount(); return csrPrograms().filter((program) => program.companyId === account?.id); }
		function csrCompanyApplications() { const account = currentCompanyAccount(); return csrApplications().filter((application) => application.companyId === account?.id); }
		function csrImpactForCompany() {
			const programs = csrCompanyPrograms();
			const applications = csrCompanyApplications();
			const selected = applications.filter((application) => ['Selected', 'In Progress', 'Completed'].includes(application.status));
			const completed = applications.filter((application) => application.status === 'Completed');
			return {
				programs: programs.length,
				studentsSupported: new Set(selected.map((application) => application.studentId)).size,
				applications: applications.length,
				selected: selected.length,
				completed: completed.length,
				trainingHours: selected.reduce((total, application) => total + Number(csrProgramById(application.programId)?.trainingHours || 0), 0),
				certificates: completed.filter((application) => csrProgramById(application.programId)?.certificateAvailable).length,
				internships: selected.filter((application) => csrProgramById(application.programId)?.internshipOpportunity).length,
				jobs: selected.filter((application) => csrProgramById(application.programId)?.jobOpportunity).length
			};
		}
		function csrProgramForm(program = {}) {
			const categories = ['Skill Development', 'Education', 'Scholarship', 'Training', 'Workshop', 'Internship', 'Career Development', 'Digital Literacy', 'Employability', 'Community Development'];
			return `<form class="dash-panel editable-form" data-form="csr-program"><input type="hidden" name="programId" value="${esc(program.id || '')}"><label>Program Title *</label><input name="title" value="${esc(program.title || '')}" required><label>Program Description *</label><textarea name="description" rows="4" required>${esc(program.description || '')}</textarea><label>Objectives</label><textarea name="objectives" rows="3">${esc(program.objectives || '')}</textarea><div class="form-row"><div><label>CSR Category *</label><select name="category" required>${categories.map((category) => `<option ${program.category === category ? 'selected' : ''}>${category}</option>`).join('')}</select></div><div><label>Skills Covered *</label><input name="skills" value="${esc(program.skills || '')}" placeholder="Python, SQL, Data Analysis" required></div></div><div class="form-row"><div><label>Target Students *</label><input name="targetStudents" type="number" min="1" value="${esc(program.targetStudents || 1)}" required></div><div><label>Training Hours</label><input name="trainingHours" type="number" min="0" value="${esc(program.trainingHours || 0)}"></div></div><div class="form-row"><div><label>Program Duration</label><input name="duration" value="${esc(program.duration || '')}" placeholder="8 weeks"></div><div><label>Mode</label><select name="mode"><option ${program.mode === 'Online' ? 'selected' : ''}>Online</option><option ${program.mode === 'Offline' ? 'selected' : ''}>Offline</option><option ${program.mode === 'Hybrid' ? 'selected' : ''}>Hybrid</option></select></div></div><div class="form-row"><div><label>Start Date</label><input name="startDate" type="date" value="${esc(program.startDate || '')}"></div><div><label>End Date</label><input name="endDate" type="date" value="${esc(program.endDate || '')}"></div></div><label>Location</label><input name="location" value="${esc(program.location || '')}" placeholder="Online or city / campus"><label>Eligibility</label><input name="eligibility" value="${esc(program.eligibility || '')}" placeholder="Students with Python foundations"><label>Benefits</label><input name="benefits" value="${esc(program.benefits || '')}" placeholder="Free training, certificate, mentorship"><div class="form-row"><div><label>Sponsored Course</label><input name="sponsoredCourse" value="${esc(program.sponsoredCourse || '')}"></div><div><label>Scholarship Amount</label><input name="scholarshipAmount" type="number" min="0" value="${esc(program.scholarshipAmount || 0)}"></div></div><div class="form-row"><label><input name="internshipOpportunity" type="checkbox" ${program.internshipOpportunity ? 'checked' : ''}> Internship opportunity</label><label><input name="jobOpportunity" type="checkbox" ${program.jobOpportunity ? 'checked' : ''}> Employment opportunity</label><label><input name="certificateAvailable" type="checkbox" ${program.certificateAvailable !== false ? 'checked' : ''}> Certificate available</label></div><label>Application Deadline</label><input name="deadline" type="date" value="${esc(program.deadline || '')}"><label>Program Status</label><select name="status"><option ${program.status === 'Draft' ? 'selected' : ''}>Draft</option><option ${program.status === 'Published' ? 'selected' : ''}>Published</option></select><div class="card-actions"><button class="btn btn-primary" type="submit">${program.id ? 'Save CSR Program' : 'Create CSR Program'}</button><button class="btn btn-light" type="button" data-action="route" data-route="/company/csr-programs">Cancel</button></div></form>`;
		}
		function companyCsrProgramsPage() { const programs = csrCompanyPrograms(); return shell('company', 'CSR Programs', `${pageIntro('Corporate Social Responsibility', 'Create programs that turn company investment into measurable student outcomes.', '<button class="btn btn-primary" data-action="route" data-route="/company/csr-create">＋ Create CSR Program</button>')}${programs.length ? `<div class="dash-panel">${programs.map((program) => `<article class="opportunity-card"><div><span class="tag blue">${esc(program.category)}</span><h3>${esc(program.title)}</h3><p>${esc(program.targetStudents)} target students · ${esc(program.mode)} · Deadline ${esc(csrDate(program.deadline))}</p><small>${csrStatusTag(program.status)} · ${csrApplicationsFor(program.id).length} applications · ${csrSelectedCount(program.id)} selected</small></div><div class="card-actions"><button class="btn btn-light" data-action="view-csr-program" data-id="${esc(program.id)}">View details</button><button class="btn btn-light" data-action="edit-csr-program" data-id="${esc(program.id)}">Edit</button>${program.status === 'Draft' ? `<button class="btn btn-primary" data-action="publish-csr-program" data-id="${esc(program.id)}">Publish</button>` : ''}</div></article>`).join('')}</div>` : emptyState('No CSR programs yet. Create your first program to support students.')}`); }
		function companyCsrCreatePage() { return shell('company', 'Create CSR Program', `${pageIntro('Create CSR Program', 'Publish a transparent education, training, scholarship, or employability program.')}${csrProgramForm()}`); }
		function studentCsrOpportunitiesPage() { const programs = csrPrograms().filter((program) => program.status === 'Published'); return shell('student', 'CSR Opportunities', `${pageIntro('CSR Opportunities', 'Discover company-funded programs, scholarships, training, and career opportunities.')}${searchBox('Search program, company, category, or skill')}<div class="form-row" style="margin-top:18px"><select class="page-search" data-action="csr-filter" data-filter="category" aria-label="Filter by CSR category"><option value="">All categories</option>${[...new Set(programs.map((program) => program.category))].map((category) => `<option>${esc(category)}</option>`).join('')}</select><select class="page-search" data-action="csr-filter" data-filter="mode" aria-label="Filter by delivery mode"><option value="">All modes</option><option>Online</option><option>Offline</option><option>Hybrid</option></select></div><div class="dash-panel" style="margin-top:18px" id="csr-results">${programs.length ? programs.map((program) => csrStudentProgramCard(program)).join('') : emptyState('No CSR programs are published yet.')}</div>`); }
		function csrStudentProgramCard(program) { const application = csrApplicationFor(program.id); const available = Math.max(0, Number(program.targetStudents || 0) - csrSelectedCount(program.id)); const open = csrIsOpen(program) && available > 0; return `<article class="opportunity-card" data-searchable="${esc(`${program.title} ${program.companyName} ${program.category} ${program.skills} ${program.mode}`)}" data-csr-category="${esc(program.category)}" data-csr-mode="${esc(program.mode)}"><div><span class="tag blue">${esc(program.category)}</span><h3>${esc(program.title)}</h3><p>Sponsored by ${esc(program.companyName)} · ${esc(program.duration || 'Duration not set')} · ${esc(program.mode)}</p><small>${esc(program.skills)}<br>${available} seats · Deadline ${esc(csrDate(program.deadline))}<br>${esc(program.benefits || 'Program benefits provided by the company.')}</small></div><div class="card-actions"><button class="btn btn-light" data-action="view-csr-program" data-id="${esc(program.id)}">View Details</button><button class="btn btn-primary" data-action="apply-csr" data-id="${esc(program.id)}" ${application || !open ? 'disabled' : ''}>${application ? `Applied · ${esc(application.status)}` : open ? 'Apply Now' : 'Closed'}</button></div></article>`; }
		function studentCsrApplicationsPage() { const applications = csrApplications().filter((application) => application.studentId === studentIdForSession()); return shell('student', 'My CSR Applications', `${pageIntro('My CSR Applications', 'Track your applications, selections, participation, and completions.')}${applications.length ? `<div class="dash-panel">${applications.map((application) => { const program = csrProgramById(application.programId); return `<div class="application-row"><div><b>${esc(program?.title || 'CSR Program')}</b><p>${esc(program?.companyName || application.companyName)} · Applied ${esc(application.appliedAt.slice(0, 10))}</p></div>${csrStatusTag(application.status)}</div>`; }).join('')}</div>` : emptyState('No CSR applications yet. Explore CSR Opportunities to get started.')}`); }
		function companyCsrApplicationsPage() { const applications = csrCompanyApplications(); return shell('company', 'CSR Applications', `${pageIntro('CSR Applications', 'Review students who applied to your CSR programs.')}${applications.length ? `<div class="dash-panel">${applications.map((application) => { const program = csrProgramById(application.programId); return `<div class="application-row"><div><b>${esc(application.studentName)}</b><p>${esc(program?.title || 'CSR Program')} · ${esc(application.course || 'Course not provided')} · Applied ${esc(application.appliedAt.slice(0, 10))}</p><small>${esc(application.skills || 'No verified skills')} · ${application.assessmentCount || 0} assessments</small></div><div class="card-actions">${csrStatusTag(application.status)}<button class="btn btn-light" data-action="view-csr-student" data-id="${esc(application.id)}">View Student</button>${application.status === 'Applied' || application.status === 'Under Review' ? `<button class="btn btn-primary" data-action="select-csr-student" data-id="${esc(application.id)}">Select</button><button class="btn btn-light" data-action="reject-csr-student" data-id="${esc(application.id)}">Reject</button>` : ''}${application.status === 'In Progress' ? `<button class="btn btn-light" data-action="complete-csr-student" data-id="${esc(application.id)}">Mark Completed</button>` : ''}</div></div>`; }).join('')}</div>` : emptyState('No CSR applications received yet.')}`); }
		function companyCsrParticipantsPage() { const participants = csrCompanyApplications().filter((application) => ['Selected', 'In Progress', 'Completed'].includes(application.status)); return shell('company', 'CSR Participants', `${pageIntro('CSR Participants', 'Track selected students through participation and completion.')}${participants.length ? `<div class="dash-panel">${participants.map((application) => { const program = csrProgramById(application.programId); return `<div class="application-row"><div><b>${esc(application.studentName)}</b><p>${esc(program?.title || 'CSR Program')} · ${esc(application.course || 'Course not provided')}</p></div><div class="card-actions">${csrStatusTag(application.status)}${application.status === 'Selected' ? `<button class="btn btn-primary" data-action="start-csr-participation" data-id="${esc(application.id)}">Start Participation</button>` : ''}${application.status === 'In Progress' ? `<button class="btn btn-light" data-action="complete-csr-student" data-id="${esc(application.id)}">Mark Completed</button>` : ''}</div></div>`; }).join('')}</div>` : emptyState('No selected CSR participants yet.')}`); }
		function companyCsrAnalyticsPage() { const impact = csrImpactForCompany(); const programs = csrCompanyPrograms(); return shell('company', 'CSR Impact', `${pageIntro('CSR Impact Analytics', 'All metrics are calculated from your stored CSR programs and application outcomes.') }<div class="kpis">${[['Programs Conducted', impact.programs], ['Students Supported', impact.studentsSupported], ['Applications Received', impact.applications], ['Students Selected', impact.selected], ['Students Completed', impact.completed], ['Training Hours', impact.trainingHours], ['Certificates Issued', impact.certificates], ['Internships Provided', impact.internships], ['Jobs Created', impact.jobs]].map(([label, value]) => `<div class="kpi"><div class="kpi-top"><span>${label}</span><span class="kpi-icon">◉</span></div><div class="kpi-value">${value}</div></div>`).join('')}</div>${programs.length ? `<section class="dash-panel"><div class="panel-head"><h3>Program-level impact</h3></div>${programs.map((program) => { const apps = csrApplicationsFor(program.id); return `<div class="metric-row"><span>${esc(program.title)}<small>${esc(program.companyName)} · ${apps.length} applications</small></span><strong>${csrSelectedCount(program.id)} selected · ${apps.filter((item) => item.status === 'Completed').length} completed</strong></div>`; }).join('')}</section>` : emptyState('CSR impact will appear after you create a program.')}`); }
		function csrCompanyDashboardMarkup() { const impact = csrImpactForCompany(); return `<section class="dash-panel"><div class="panel-head"><div><h3>Corporate Social Responsibility</h3><p class="muted">Support students through skills, scholarships, training, and career access.</p></div><div class="card-actions"><button class="btn btn-primary" data-action="route" data-route="/company/csr-create">＋ Create CSR Program</button><button class="btn btn-light" data-action="route" data-route="/company/csr-analytics">View Impact</button></div></div><div class="metric-row"><span>Programs · Students supported · Applications</span><strong>${impact.programs} · ${impact.studentsSupported} · ${impact.applications}</strong></div></section>`; }
		function csrProgramDetails(program) { const application = csrApplicationFor(program.id); const available = Math.max(0, Number(program.targetStudents || 0) - csrSelectedCount(program.id)); const canApply = normalizeRole(currentAuthSession()?.role) === 'student' && csrIsOpen(program) && available > 0 && !application; return `<div class="modal-backdrop" data-action="close-modal"><div class="modal-card" role="dialog" aria-modal="true" onclick="event.stopPropagation()"><button class="modal-close" data-action="close-modal" aria-label="Close CSR program details">×</button><span class="tag blue">${esc(program.category)}</span><h2>${esc(program.title)}</h2><p><b>Company:</b> ${esc(program.companyName)}</p><p>${esc(program.description)}</p><p><b>Objectives:</b> ${esc(program.objectives || 'Not specified')}<br><b>Skills:</b> ${esc(program.skills)}<br><b>Eligibility:</b> ${esc(program.eligibility || 'Open to eligible students')}<br><b>Duration:</b> ${esc(program.duration || 'Not specified')}<br><b>Dates:</b> ${esc(csrDate(program.startDate))} to ${esc(csrDate(program.endDate))}<br><b>Mode:</b> ${esc(program.mode)} · ${esc(program.location || 'Flexible')}<br><b>Benefits:</b> ${esc(program.benefits || 'Not specified')}<br><b>Seats:</b> ${available} available of ${esc(program.targetStudents)}<br><b>Application deadline:</b> ${esc(csrDate(program.deadline))}<br><b>Certificate:</b> ${program.certificateAvailable ? 'Available' : 'Not offered'}${program.internshipOpportunity ? '<br><b>Internship:</b> Available for selected participants' : ''}${program.jobOpportunity ? '<br><b>Employment:</b> Opportunity available for selected participants' : ''}</p>${application ? `<p>${csrStatusTag(application.status)} You already applied to this program.</p>` : `<button class="btn btn-primary" data-action="apply-csr" data-id="${esc(program.id)}" ${canApply ? '' : 'disabled'}>${canApply ? 'Apply Now' : csrIsOpen(program) ? available ? 'Sign in as Student to Apply' : 'Seats Filled' : 'Applications Closed'}</button>`}</div></div>`; }
		function institutionWorkspaceOrEmpty() { return currentInstitutionWorkspace() || { institutionId: '', students: [], programs: [], internships: [], collaborations: [], notifications: [], reports: [], admins: [], settings: {}, onboarding: { status: 'Pending', completed: false } }; }
		function institutionStudents() { const workspace = institutionWorkspaceOrEmpty(); const account = currentInstitutionAccount(); const institutionName = account?.profile?.name || state.institution.name; const linked = loadStudentAccounts().filter((student) => student.profile?.college === institutionName); return [...workspace.students, ...linked.filter((student) => !workspace.students.some((item) => item.studentId === student.id)).map((student) => ({ studentId: student.id, ...student.profile, workspace: student.workspace || {} }))]; }
		function institutionStudentStats() { const students = institutionStudents(); const assessed = students.filter((student) => (student.workspace?.assessments || student.assessments || []).length); const verified = students.filter((student) => (student.workspace?.skills || student.skills || []).some((skill) => skill.status === 'Verified' || (skill.score || 0) >= WEAK_THRESHOLD)); return { students, assessed, verified }; }
		function institutionApplications() { const account = currentInstitutionAccount(); const students = institutionStudents(); const studentIds = new Set(students.map((student) => student.studentId || student.id)); return sharedEcosystem().applications.filter((item) => item.institutionId === account?.id || studentIds.has(item.studentId)); }
		function institutionDashboardPage() { const workspace = institutionWorkspaceOrEmpty(); const { students, assessed, verified } = institutionStudentStats(); const applications = institutionApplications(); const activeInternships = workspace.internships.filter((item) => item.status === 'Active').length; const placed = sharedEcosystem().placements.filter((item) => item.institutionId === workspace.institutionId).length; const collaborations = workspace.collaborations.filter((item) => item.status !== 'Closed').length; return shell('institution', 'Institution Dashboard', `${pageIntro(`Good morning, ${state.institution.name || 'Institution'}`, 'Turn student skills into measurable industry readiness.', '<button class="btn btn-primary" data-action="route" data-route="/institution/students">＋ Manage Students</button>')}<div class="kpis">${[['Total Students', students.length, '/institution/students'], ['Students Assessed', assessed.length, '/institution/assessments'], ['Verified Skills', verified.length, '/institution/skills'], ['Active Applications', applications.filter((item) => !['Rejected', 'Accepted'].includes(item.status)).length, '/institution/placements'], ['Students Shortlisted', applications.filter((item) => item.status === 'Shortlisted').length, '/institution/placements'], ['Active Internships', activeInternships, '/institution/internships'], ['Students Placed', placed, '/institution/placements'], ['Collaborations', collaborations, '/institution/partnerships']].map(([label, value, route]) => `<button class="kpi" data-action="route" data-route="${route}"><div class="kpi-top"><span>${label}</span><span class="kpi-icon">◉</span></div><div class="kpi-value">${value}</div><div class="kpi-note">Open section →</div></button>`).join('')}</div><div class="dash-grid"><section class="dash-panel"><div class="panel-head"><h3>Skill Demand Summary</h3><button class="btn-plain" data-action="route" data-route="/institution/skill-gaps">View gaps →</button></div>${workspace.opportunities?.length ? workspace.opportunities.map((item) => `<div class="metric-row"><span>${esc(item.skill)}</span><strong>${item.count}</strong></div>`).join('') : emptyState('Skill analytics will appear after students are added.')}</section><section class="dash-panel"><div class="panel-head"><h3>Pending Actions</h3><button class="btn-plain" data-action="route" data-route="/institution/notifications">View all →</button></div>${workspace.notifications.length ? workspace.notifications.slice(0, 5).map((item) => `<div class="metric-row"><span>${esc(item.text)}</span><small>${esc(item.time || '')}</small></div>`).join('') : emptyState('No pending actions.')}</section></div>`); }
		function institutionProfilePage() { const account = currentInstitutionAccount(); const profile = account?.profile || state.institution; const workspace = institutionWorkspaceOrEmpty(); return shell('institution', 'Institution Profile', `${pageIntro('Institution Profile', 'Manage the profile students and industry partners see.', '<button class="btn btn-light" data-action="institution-preview-profile">Preview Public Profile</button>')}<form class="dash-panel editable-form" data-form="institution-profile"><label>Institution Name</label><input name="name" value="${esc(profile.name)}" required><label>Official Email</label><input name="email" type="email" value="${esc(profile.email || account?.email)}" required><label>About Institution</label><textarea name="description" rows="4">${esc(profile.description || '')}</textarea><label>Institution Type</label><input name="institutionType" value="${esc(profile.institutionType || '')}" required><label>Affiliation / University</label><input name="affiliation" value="${esc(profile.affiliation || '')}"><label>Website</label><input name="website" type="url" value="${esc(profile.website || '')}"><label>Location</label><input name="location" value="${esc(profile.location || '')}"><label>Departments</label><input name="departments" value="${esc(profile.departments || '')}" placeholder="CSE, ECE, Management"><label>Courses / Programs</label><input name="courses" value="${esc(profile.courses || '')}"><div class="metric-row"><span>Verification status</span>${companyStatusTag(workspace.onboarding?.status || 'Pending')}</div><button class="btn btn-primary" type="submit">Save Changes</button></form>`); }
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
			return `<div class="auth"><aside class="auth-aside">${brand()}<div><div class="eyebrow" style="color:#5bd1d5">${register ? 'Create your SkillAura profile' : 'SkillAura Portal'}</div><h1>${register ? 'Start building your bridge.' : 'Your next opportunity starts here.'}</h1><p>${register ? 'Create your account and shape a profile that opens the right doors.' : 'Sign in to your SkillAura workspace.'}</p></div><div class="auth-note">Frontend prototype · account data stays in this browser</div></aside><main class="auth-main"><div class="form-wrap"><a class="btn-plain" href="#/role-selection">← Back to portal selection</a><h2 style="margin-top:27px">${register ? 'Create your account' : 'Sign in to SkillAura'}</h2><p>${register ? 'Create your learner account. Fields marked * are required.' : 'Choose your role, then sign in to your SkillAura workspace.'}</p><form class="form" data-form="${register ? 'register' : 'login'}" novalidate>${register ? registerFields : loginFields}${register ? '<button class="btn btn-primary" type="submit">Create Account</button>' : '<div class="form-row"><label><input type="checkbox" name="remember"> Remember me</label><button class="btn-plain" type="button" data-action="forgot" data-portal-role="student">Forgot password?</button></div><button class="btn btn-primary" type="submit">Login</button><div class="divider">or continue as demo</div><div class="demo-grid"><button class="demo-btn" type="button" data-demo="student">Demo Student/Employee</button><button class="demo-btn" type="button" data-demo="tutor">Demo Tutor</button></div>'}</form>${register ? '<div class="switch">Already have an account? <a href="#/login">Login</a></div>' : '<div class="switch">New to SkillAura? <a href="#/register">Create an account</a></div>'}</div></main></div>`;
		}
		function companyAuthPage(type) {
			const register = type === 'register';
			const fields = register ? `${authInput('Company Name', 'name', { placeholder: 'Your company name' })}${authInput('Official Email', 'email', { type: 'email', placeholder: 'talent@example.com' })}${authInput('Password', 'password', { type: 'password', autocomplete: 'new-password' })}${authInput('Confirm Password', 'confirmPassword', { type: 'password', autocomplete: 'new-password' })}${authInput('Industry / Company Type', 'industryType', { placeholder: 'Software & Technology' })}${authInput('Company Website', 'website', { type: 'url', placeholder: 'https://example.com', optional: true })}${authInput('Company Size', 'size', { placeholder: '11-50 employees' })}${authInput('Location', 'location', { placeholder: 'City, Country' })}${authInput('Contact Person', 'contactPerson', { placeholder: 'Full name' })}${authInput('Designation', 'designation', { placeholder: 'Recruiter / HR Lead' })}${authInput('Phone Number', 'phone', { type: 'tel', placeholder: '+91 98765 43210' })}` : `${authInput('Official Email', 'email', { type: 'email', placeholder: 'talent@example.com' })}${authInput('Password', 'password', { type: 'password', autocomplete: 'current-password' })}`;
			return `<div class="auth"><aside class="auth-aside">${brand()}<div><div class="eyebrow" style="color:#5bd1d5">Company Portal</div><h1>${register ? 'Build your hiring bridge.' : 'Welcome back, employer.'}</h1><p>${register ? 'Create a company workspace for skill-based recruitment.' : 'Sign in to manage opportunities, candidates, and hiring activity.'}</p></div><div class="auth-note">Frontend prototype · company data stays in this browser</div></aside><main class="auth-main"><div class="form-wrap"><a class="btn-plain" href="#/role-selection">← Back to portal selection</a><h2 style="margin-top:27px">Company Portal</h2><p>${register ? 'Create your company account. Fields marked * are required.' : 'Login to your company workspace.'}</p><form class="form" data-form="company-${register ? 'register' : 'login'}" novalidate>${fields}<button class="btn btn-primary" type="submit">${register ? 'Create Company Account' : 'Login'}</button>${register ? '' : '<div class="form-row"><button class="btn-plain" type="button" data-action="forgot" data-portal-role="company">Forgot Password?</button></div>'}</form><div class="switch">${register ? 'Already have an account?' : 'Need a company account?'} <a href="#/company/${register ? 'login' : 'register'}">${register ? 'Login' : 'Create Company Account'}</a></div></div></main></div>`;
		}
		function companyOnboardingPage() { const account = currentCompanyAccount(); const workspace = companyWorkspaceOrEmpty(); return `<div class="auth"><aside class="auth-aside">${brand()}<div><div class="eyebrow" style="color:#5bd1d5">Company onboarding</div><h1>Make your company credible.</h1><p>Add the details students need before they apply.</p></div><div class="auth-note">Verification is simulated in this prototype.</div></aside><main class="auth-main"><div class="form-wrap"><h2>Company Verification &amp; Onboarding</h2><p>Status: ${companyStatusTag(workspace.onboarding?.status || 'Pending')}</p><form class="form" data-form="company-onboarding">${authInput('Company Description', 'description', { placeholder: 'What does your company build?', optional: true })}${authInput('Logo URL', 'logo', { type: 'url', placeholder: 'https://example.com/logo.png', optional: true })}${authInput('Recruitment Preferences', 'preferences', { placeholder: 'Skills, roles, or campuses you recruit from', optional: true })}<button class="btn btn-primary" type="submit">Submit for Verification</button><button class="btn btn-light" type="button" data-action="skip-company-onboarding">Skip Optional Details</button><button class="btn-plain" type="button" data-action="route" data-route="/company/profile">Edit Company Profile</button></form></div></main></div>`; }
		function institutionAuthPage(type) { const register = type === 'register'; const fields = register ? `${authInput('Institution Name', 'name', { placeholder: 'Your college or university' })}${authInput('Official Institution Email', 'email', { type: 'email', placeholder: 'admin@example.edu' })}${authInput('Password', 'password', { type: 'password', autocomplete: 'new-password' })}${authInput('Confirm Password', 'confirmPassword', { type: 'password', autocomplete: 'new-password' })}${authInput('Institution Type', 'institutionType', { placeholder: 'Engineering College / University' })}${authInput('Affiliation / University', 'affiliation', { placeholder: 'Affiliated university' })}${authInput('Accreditation', 'accreditation', { placeholder: 'Optional accreditation information', optional: true })}${authInput('Website', 'website', { type: 'url', placeholder: 'https://example.edu', optional: true })}${authInput('Location', 'location', { placeholder: 'City, Country' })}${authInput('Contact Person', 'contactPerson', { placeholder: 'Administrator name' })}${authInput('Designation', 'designation', { placeholder: 'Placement Officer / Dean' })}${authInput('Phone Number', 'phone', { type: 'tel', placeholder: '+91 98765 43210' })}` : `${authInput('Official Institution Email', 'email', { type: 'email', placeholder: 'admin@example.edu' })}${authInput('Password', 'password', { type: 'password', autocomplete: 'current-password' })}`; return `<div class="auth"><aside class="auth-aside">${brand()}<div><div class="eyebrow" style="color:#5bd1d5">Institution Portal</div><h1>${register ? 'Turn student potential into outcomes.' : 'Welcome back, institution.'}</h1><p>${register ? 'Create a college workspace for skills, internships, and placement readiness.' : 'Sign in to monitor your institution ecosystem.'}</p></div><div class="auth-note">Frontend prototype · institution data stays in this browser</div></aside><main class="auth-main"><div class="form-wrap"><a class="btn-plain" href="#/role-selection">← Back to portal selection</a><h2 style="margin-top:27px">Institution Portal</h2><p>${register ? 'Create your institution account. Fields marked * are required.' : 'Login to your institution workspace.'}</p><form class="form" data-form="institution-${register ? 'register' : 'login'}" novalidate>${fields}<button class="btn btn-primary" type="submit">${register ? 'Create Institution Account' : 'Login'}</button>${register ? '' : '<div class="form-row"><button class="btn-plain" type="button" data-action="forgot" data-portal-role="institution">Forgot Password?</button></div>'}</form><div class="switch">${register ? 'Already have an account?' : 'Need an institution account?'} <a href="#/institution/${register ? 'login' : 'register'}">${register ? 'Login' : 'Create Institution Account'}</a></div></div></main></div>`; }
		function institutionOnboardingPage() { const workspace = institutionWorkspaceOrEmpty(); return `<div class="auth"><aside class="auth-aside">${brand()}<div><div class="eyebrow" style="color:#5bd1d5">Institution onboarding</div><h1>Make your institution visible.</h1><p>Add the academic context that helps SkillAura connect readiness to opportunity.</p></div><div class="auth-note">Verification is simulated in this prototype.</div></aside><main class="auth-main"><div class="form-wrap"><h2>Institution Verification &amp; Onboarding</h2><p>Status: ${companyStatusTag(workspace.onboarding?.status || 'Pending')}</p><form class="form" data-form="institution-onboarding">${authInput('Institution Description', 'description', { placeholder: 'Tell students and partners about your institution.', optional: true })}${authInput('Logo URL', 'logo', { type: 'url', placeholder: 'https://example.edu/logo.png', optional: true })}${authInput('Departments', 'departments', { placeholder: 'CSE, ECE, Management', optional: true })}${authInput('Courses / Programs', 'courses', { placeholder: 'B.Tech, MBA, BCA', optional: true })}${authInput('Academic Year', 'academicYear', { placeholder: '2026-27', optional: true })}<button class="btn btn-primary" type="submit">Submit for Verification</button><button class="btn btn-light" type="button" data-action="skip-institution-onboarding">Skip Optional Details</button><button class="btn-plain" type="button" data-action="route" data-route="/institution/profile">Edit Institution Profile</button></form></div></main></div>`; }
		function onboardingPage() { return `<div class="auth"><aside class="auth-aside">${brand()}<div><div class="eyebrow" style="color:#5bd1d5">Student onboarding</div><h1>Make your profile yours.</h1><p>These optional preferences help SkillAura present more relevant opportunities.</p></div><div class="auth-note">You can update these choices later from your profile.</div></aside><main class="auth-main"><div class="form-wrap"><h2>What are you working toward?</h2><p>Complete what is useful now, or skip straight to your dashboard.</p><form class="form" data-form="onboarding">${authInput('Career interests', 'interests', { placeholder: 'e.g. Product design, data, web development', optional: true })}${authInput('Desired job roles', 'roles', { placeholder: 'e.g. Frontend Developer', optional: true })}${authInput('Technical skills', 'technicalSkills', { placeholder: 'e.g. HTML, CSS, JavaScript', optional: true })}${authInput('Soft skills', 'softSkills', { placeholder: 'e.g. Communication, teamwork', optional: true })}${authInput('Preferred industries', 'industries', { placeholder: 'e.g. Technology, finance', optional: true })}<div class="auth-field"><label for="opportunityType">Preferred opportunity type <span>(optional)</span></label><select id="opportunityType" name="opportunityType"><option value="">No preference</option><option>Internship</option><option>Part-time</option><option>Full-time</option></select></div>${authInput('Location preference', 'location', { placeholder: 'e.g. Bengaluru or Remote', optional: true })}<button class="btn btn-primary" type="submit">Save and continue →</button><button class="btn btn-light" type="button" data-action="skip-onboarding">Skip for now</button></form></div></main></div>`; }
		function recoveryPage(reset = false) { return `<div class="auth"><aside class="auth-aside">${brand()}<div><div class="eyebrow" style="color:#5bd1d5">Password recovery</div><h1>${reset ? 'Choose a new password.' : 'Get back to your workspace.'}</h1><p>This is a frontend prototype; no email is sent from this page.</p></div><div class="auth-note">Prototype-only account recovery</div></aside><main class="auth-main"><div class="form-wrap"><a class="btn-plain" href="#/login">← Back to login</a><h2 style="margin-top:27px">${reset ? 'Reset your password' : 'Password recovery'}</h2><p>${reset ? 'Set a new password for the verified prototype account.' : 'Enter your registered email to begin a simulated reset.'}</p><form class="form" data-form="${reset ? 'reset-password' : 'recovery'}">${reset ? `${authInput('New Password', 'password', { type: 'password', autocomplete: 'new-password' })}${authInput('Confirm New Password', 'confirmPassword', { type: 'password', autocomplete: 'new-password' })}<button class="btn btn-primary" type="submit">Update Password</button>` : `${authInput('Email', 'email', { type: 'email', placeholder: 'you@example.com', autocomplete: 'email' })}<button class="btn btn-primary" type="submit">Send Reset Link</button>`}</form></div></main></div>`; }
		function portalRecoveryPage(role) { const normalizedRole = normalizeRole(role); const label = roleLabel(normalizedRole); return `<div class="auth"><aside class="auth-aside">${brand()}<div><div class="eyebrow" style="color:#5bd1d5">${label} Portal</div><h1>Get back to your workspace.</h1><p>Enter your registered email to begin a simulated password reset.</p></div><div class="auth-note">Frontend prototype · no email is sent</div></aside><main class="auth-main"><div class="form-wrap"><a class="btn-plain" href="#${portalLoginRoute(normalizedRole)}">← Back to ${label.toLowerCase()} login</a><h2 style="margin-top:27px">${label} Portal</h2><p>Password recovery</p><form class="form" data-form="portal-recovery" data-role="${normalizedRole}">${authInput('Email', 'email', { type: 'email', placeholder: normalizedRole === 'student' ? 'you@example.com' : 'admin@example.com', autocomplete: 'email' })}<button class="btn btn-primary" type="submit">Send Reset Link</button></form></div></main></div>`; }
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
		function mockInterviewQuestions(role, difficulty) {
			return MOCK_INTERVIEW_QUESTIONS[role]?.[difficulty] || MOCK_INTERVIEW_QUESTIONS['Software Engineer'][difficulty];
		}
		function evaluateMockAnswer(answer, question) {
			const normalized = normalizedAssistantText(answer);
			const matched = question.concepts.filter((concept) => normalized.includes(concept));
			const completeness = Math.min(1, normalized.split(' ').filter(Boolean).length / 28);
			const score = Math.min(100, Math.round((matched.length / question.concepts.length) * 75 + completeness * 25));
			const level = score >= 80 ? 'Strong' : score >= 60 ? 'Good' : score >= 40 ? 'Developing' : 'Needs Improvement';
			return {
				score,
				level,
				matched,
				feedback: matched.length ? `You covered ${matched.slice(0, 3).join(', ')}. Add a concrete example and explain the tradeoff or outcome.` : 'Your answer needs more role-specific concepts and a concrete example.',
				improvement: `Try to address: ${question.concepts.join(', ')}. Keep the answer structured with the approach, reasoning, and result.`
			};
		}
		function mockInterviewLevel(score) { return score >= 80 ? 'Excellent' : score >= 65 ? 'Good' : score >= 45 ? 'Developing' : 'Needs Improvement'; }
		function mockInterviewResultPage() {
			const result = state.mockInterviewSession?.result;
			if (!result) return mockInterviewPage();
			return shell('student', 'Mock Interview Result', `${pageIntro(`${esc(result.role)} Interview`, 'Prototype evaluation based on predefined concepts.')}<section class="dash-panel assessment-result"><span class="tag ${result.score >= 65 ? 'success' : 'warning'}">${esc(result.level)}</span><h2>Overall Score</h2><div class="assessment-score">${result.score}%</div><p><b>Questions answered:</b> ${result.answers.length}<br><b>Difficulty:</b> ${esc(result.difficulty)}<br><b>Evaluation:</b> Keyword and completeness rubric, not AI scoring.</p></section><section class="dash-panel"><div class="panel-head"><h3>Strong Areas</h3></div><p>${esc(result.strongAreas.length ? result.strongAreas.join(', ') : 'No strong areas identified yet.')}</p><div class="panel-head" style="margin-top:20px"><h3>Needs Improvement</h3></div><p>${esc(result.weakAreas.length ? result.weakAreas.join(', ') : 'No major weak areas identified.')}</p></section><section class="dash-panel"><div class="card-actions"><button class="btn btn-primary" data-action="route" data-route="/student/mock-interview">Try Again</button><button class="btn btn-light" data-action="route" data-route="/student/skills">Improve Weak Areas</button><button class="btn-plain" data-action="route" data-route="/student/dashboard">Back to Dashboard</button></div></section>`);
		}
		function mockInterviewPage() {
			const session = state.mockInterviewSession;
			if (!session) return shell('student', 'Mock Interview', `${pageIntro('Practice Interview', 'Answer role-specific questions and receive a transparent prototype evaluation.')}<section class="dash-panel editable-form"><label for="mock-interview-role">Target role</label><select id="mock-interview-role" data-mock-role>${Object.keys(MOCK_INTERVIEW_QUESTIONS).map((role) => `<option>${esc(role)}</option>`).join('')}</select><label for="mock-interview-difficulty">Difficulty</label><select id="mock-interview-difficulty" data-mock-difficulty><option>Easy</option><option>Medium</option><option>Hard</option></select><p class="muted">Evaluation uses predefined expected concepts and answer completeness. It is not an AI evaluation.</p><button class="btn btn-primary" data-action="start-mock-interview">Start Interview</button></section>`);
			if (session.result) return mockInterviewResultPage();
			const question = session.questions[session.index];
			const answer = session.answers[session.index]?.answer || '';
			const evaluation = session.answers[session.index]?.evaluation;
			return shell('student', 'Mock Interview', `${pageIntro(`${esc(session.role)} · ${esc(session.difficulty)}`, `Question ${session.index + 1} of ${session.questions.length}`)}<section class="dash-panel assessment-question"><div class="assessment-progress"><span style="width:${((session.index + 1) / session.questions.length) * 100}%"></span></div><h3>${esc(question.question)}</h3><textarea rows="7" data-mock-answer placeholder="Write your answer here...">${esc(answer)}</textarea><div class="card-actions"><button class="btn btn-light" data-action="cancel-mock-interview">Cancel</button>${evaluation ? `<button class="btn btn-primary" data-action="next-mock-question">${session.index === session.questions.length - 1 ? 'See Final Result' : 'Next Question →'}</button>` : `<button class="btn btn-primary" data-action="evaluate-mock-answer">Evaluate Answer</button>`}</div>${evaluation ? `<div class="assessment-result" style="margin-top:20px"><span class="tag ${evaluation.score >= 65 ? 'success' : 'warning'}">${evaluation.score}% · ${esc(evaluation.level)}</span><p><b>What went well:</b> ${esc(evaluation.feedback)}</p><p><b>Improve:</b> ${esc(evaluation.improvement)}</p><p><b>Suggested concepts:</b> ${esc(question.concepts.join(', '))}</p></div>` : ''}</section>`);
		}
		function saveMockInterviewResult(session) {
			const answers = session.answers;
			const score = Math.round(answers.reduce((total, item) => total + item.evaluation.score, 0) / Math.max(1, answers.length));
			const result = { role: session.role, difficulty: session.difficulty, score, level: mockInterviewLevel(score), answers, strongAreas: answers.filter((item) => item.evaluation.score >= 65).map((item) => item.question), weakAreas: answers.filter((item) => item.evaluation.score < 65).map((item) => item.question), completedAt: new Date().toISOString() };
			state.mockInterviews = [result, ...(state.mockInterviews || [])].slice(0, 10);
			session.result = result;
			saveState();
			persistCurrentStudentWorkspace();
			return result;
		}
		function mockInterviewDashboardMarkup() {
			const recent = (state.mockInterviews || [])[0];
			return `<section class="dash-panel mock-interview-dashboard"><div class="panel-head"><div><h3>Mock Interview Practice</h3><p class="muted">Build interview confidence with transparent role-based feedback.</p></div><button class="btn btn-light" data-action="route" data-route="/student/mock-interview">Practice now</button></div>${recent ? `<div class="application-row"><div><b>Latest: ${esc(recent.role)}</b><p>${esc(recent.difficulty)} · ${new Date(recent.completedAt).toLocaleDateString()}</p></div><span class="tag ${recent.score >= 65 ? 'success' : 'warning'}">${recent.score}% · ${esc(recent.level)}</span></div>` : '<p class="muted">No practice interview completed yet.</p>'}</section>`;
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
			if (action === 'sidebar-submenu') {
				const group = sourceEvent.currentTarget.closest('.side-group');
				const expanded = group.classList.toggle('submenu-open');
				sourceEvent.currentTarget.setAttribute('aria-expanded', String(expanded));
				return;
			}
			if (action === 'sidebar-pin') { setSidebarPinned(!isSidebarPinned()); return; }
			if (action === 'tutor-add-question') { document.querySelector('[data-tutor-questions]')?.insertAdjacentHTML('beforeend', tutorExamQuestion()); bindFunctionalEvents(); return; }
			if (action === 'tutor-remove-question') { const questions = document.querySelectorAll('[data-tutor-questions] .tutor-question'); if (questions.length > 1) sourceEvent.currentTarget.closest('.tutor-question')?.remove(); return; }
			if (action === 'tutor-new-exam') { document.querySelector('#tutor-exam-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); document.querySelector('[data-form="tutor-exam"] input[name="title"]')?.focus(); return; }
			if (action === 'tutor-view-exam') { const exam = currentTutorAccount()?.exams?.find((item) => item.id === sourceEvent.currentTarget.dataset.id); if (!exam) return; const course = currentTutorAccount()?.courses?.find((item) => item.id === exam.courseId); document.body.insertAdjacentHTML('beforeend', `<div class="modal-backdrop" data-action="close-modal"><div class="modal-card" role="dialog" aria-modal="true" onclick="event.stopPropagation()"><button class="modal-close" data-action="close-modal" aria-label="Close exam details">×</button><span class="tag ${exam.status === 'Published' ? 'success' : 'warning'}">${esc(exam.status || 'Draft')}</span><h2>${esc(exam.title)}</h2><p>${esc(course?.title || 'Course not selected')} · ${esc(exam.module || 'General assessment')}</p><p>${esc(exam.description)}</p><p><b>${exam.questions?.length || 0} questions</b> · <b>${exam.totalMarks || 0} marks</b> · <b>${exam.timeLimit || 0} minutes</b> · Passing score ${exam.passingScore || 0}%</p>${(exam.questions || []).map((question, index) => `<div class="metric-row"><span>${index + 1}. ${esc(question.text)}</span><strong>${question.marks} marks · Answer ${esc(question.answer)}</strong></div>`).join('')}</div></div>`); return; }
			if (action === 'tutor-edit-exam') { const account = currentTutorAccount(); const exam = account?.exams?.find((item) => item.id === sourceEvent.currentTarget.dataset.id); const form = document.querySelector('[data-form="tutor-exam"]'); if (!exam || !form) return; form.outerHTML = tutorExamForm(exam, account.courses || []); bindFunctionalEvents(); document.querySelector('[data-form="tutor-exam"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
			if (action === 'tutor-duplicate-exam') { const account = currentTutorAccount(); const exam = account?.exams?.find((item) => item.id === sourceEvent.currentTarget.dataset.id); if (!account || !exam) return; account.exams = [{ ...clone(exam), id: `exam-${Date.now()}`, title: `${exam.title} Copy`, status: 'Draft' }, ...(account.exams || [])]; saveTutorAccounts(loadTutorAccounts().map((item) => item.id === account.id ? account : item)); showToast('Exam duplicated as a draft.'); renderFunctional(); return; }
			if (action === 'tutor-publish-exam' || action === 'tutor-unpublish-exam') { const account = currentTutorAccount(); const exam = account?.exams?.find((item) => item.id === sourceEvent.currentTarget.dataset.id); if (!account || !exam) return; exam.status = action === 'tutor-publish-exam' ? 'Published' : 'Draft'; saveTutorAccounts(loadTutorAccounts().map((item) => item.id === account.id ? account : item)); showToast(action === 'tutor-publish-exam' ? 'Exam published.' : 'Exam unpublished.'); renderFunctional(); return; }
			if (action === 'tutor-delete-exam') { const account = currentTutorAccount(); if (!account || !confirm('Delete this exam?')) return; account.exams = (account.exams || []).filter((item) => item.id !== sourceEvent.currentTarget.dataset.id); saveTutorAccounts(loadTutorAccounts().map((item) => item.id === account.id ? account : item)); showToast('Exam deleted.'); renderFunctional(); return; }
			if (action === 'tutor-focus-course') { document.querySelector('[data-form="tutor-course"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); document.querySelector('[data-form="tutor-course"] input[name="title"]')?.focus(); return; }
			if (action === 'tutor-take-exam') { document.body.insertAdjacentHTML('beforeend', tutorTakeExamPanel()); return; }
			if (action === 'tutor-start-exam') { state.tutorExamSession = { examId: sourceEvent.currentTarget.dataset.id, index: 0, answers: [] }; refreshTutorTakeExamPanel(); return; }
			if (action === 'tutor-next-exam' || action === 'tutor-submit-exam') {
				const choice = document.querySelector('input[name="tutor-exam-answer"]:checked');
				if (!choice) { showToast('Select an answer before continuing.'); return; }
				const session = state.tutorExamSession;
				if (!session) return;
				session.answers[session.index] = choice.value;
				const exam = currentTutorAccount()?.exams?.find((item) => item.id === session.examId);
				if (!exam) { delete state.tutorExamSession; refreshTutorTakeExamPanel(); return; }
				if (action === 'tutor-next-exam') { session.index += 1; refreshTutorTakeExamPanel(); return; }
				const correct = exam.questions.reduce((total, question, index) => total + (session.answers[index] === question.answer ? 1 : 0), 0);
				const score = Math.round((correct / exam.questions.length) * 100);
				delete state.tutorExamSession;
				saveState();
				document.querySelector('.tutor-take-exam-panel')?.closest('.modal-backdrop')?.remove();
				showToast(`Exam submitted: ${score}% (${correct}/${exam.questions.length} correct).`);
				return;
			}
			if (action === 'tutor-edit-course') { const account = currentTutorAccount(); const course = account?.courses?.find((item) => item.id === sourceEvent.currentTarget.dataset.id); const form = document.querySelector('[data-form="tutor-course"]'); if (!course || !form) return; Object.entries(course).forEach(([key, value]) => { if (form.elements[key]) form.elements[key].value = value || ''; }); form.scrollIntoView({ behavior: 'smooth', block: 'center' }); form.elements.title?.focus(); return; }
			if (action === 'tutor-publish-course') { const account = currentTutorAccount(); const course = account?.courses?.find((item) => item.id === sourceEvent.currentTarget.dataset.id); if (course) { course.status = 'Published'; saveTutorAccounts(loadTutorAccounts().map((item) => item.id === account.id ? account : item)); showToast('Course published.'); renderFunctional(); } return; }
			if (action === 'tutor-delete-course') { const account = currentTutorAccount(); if (!account || !confirm('Delete this course?')) return; account.courses = (account.courses || []).filter((item) => item.id !== sourceEvent.currentTarget.dataset.id); saveTutorAccounts(loadTutorAccounts().map((item) => item.id === account.id ? account : item)); showToast('Course deleted.'); renderFunctional(); return; }
			if (action === 'logout') { clearStudentSession(); state.activeRole = null; saveState(); go('/login'); return; }
			if (action === 'start-assignment') { openExamPortal(); return; }
			if (action === 'view-skill') {
				const skillName = sourceEvent.currentTarget.dataset.skill;
				const details = skillRecordDetails((state.assessments || []).find((item) => item.skill === skillName) || (state.skills || []).find((item) => item.name === skillName) || { name: skillName });
				const assessmentText = details.assessment ? `<b>Assessment:</b> ${details.assessment.correct ?? '—'} / ${details.assessment.total ?? '—'} correct · ${new Date(details.assessment.completedAt).toLocaleDateString()}` : '<b>Assessment:</b> No completed assessment recorded.';
				document.body.insertAdjacentHTML('beforeend', `<div class="modal-backdrop" data-action="close-modal"><div class="modal-card skill-detail-modal" role="dialog" aria-modal="true" aria-labelledby="skill-detail-title" onclick="event.stopPropagation()"><button class="modal-close" data-action="close-modal" aria-label="Close skill details">×</button><span class="tag ${details.score >= 70 ? 'success' : 'warning'}">${esc(details.status)}</span><h2 id="skill-detail-title">${esc(details.name)}</h2><div class="skill-detail-score">${details.score}%</div><p><b>Current score:</b> ${details.score}%<br><b>Verification:</b> ${esc(details.status)}<br>${details.target !== undefined ? `<b>Target score:</b> ${details.target}%<br><b>Skill gap:</b> ${details.gap}%<br>` : ''}${assessmentText}</p><div class="card-actions"><button class="btn btn-primary" data-action="route" data-route="/student/assessment">View Details →</button></div></div></div>`);
				return;
			}
			if (action === 'view-csr-program') { const program = csrProgramById(sourceEvent.currentTarget.dataset.id); if (program) document.body.insertAdjacentHTML('beforeend', csrProgramDetails(program)); return; }
			if (action === 'edit-csr-program') { const program = csrProgramById(sourceEvent.currentTarget.dataset.id); if (!program || program.companyId !== currentCompanyAccount()?.id) return; app.innerHTML = shell('company', 'Edit CSR Program', `${pageIntro('Edit CSR Program', 'Update your company-owned CSR program.')}${csrProgramForm(program)}`); bindFunctionalEvents(); bindThemeToggle(); return; }
			if (action === 'publish-csr-program') { const program = csrProgramById(sourceEvent.currentTarget.dataset.id); if (!program || program.companyId !== currentCompanyAccount()?.id) return; program.status = 'Published'; saveState(); showToast('CSR program published.'); renderFunctional(); return; }
			if (action === 'apply-csr') {
				const program = csrProgramById(sourceEvent.currentTarget.dataset.id);
				const session = currentStudentSession();
				if (!session?.loggedIn || normalizeRole(session.role) !== 'student' || !currentStudentAccount()) return showToast('Sign in as a Student/Employee to apply.');
				if (!program || !csrIsOpen(program)) return showToast('Applications for this CSR program are closed.');
				if (csrApplicationFor(program.id)) return showToast('You have already applied to this CSR program.');
				if (csrSelectedCount(program.id) >= Number(program.targetStudents || 0)) return showToast('All seats for this CSR program are filled.');
				const account = currentStudentAccount();
				const application = { id: `csr-application-${Date.now()}`, programId: program.id, companyId: program.companyId, companyName: program.companyName, studentId: account.id, studentName: account.profile?.name || account.fullName || 'Student', course: account.profile?.course || account.course || '', skills: (account.workspace?.skills || []).map((skill) => `${skill.name} ${skill.score || 0}%`).join(' · '), assessmentCount: account.workspace?.assessments?.length || 0, status: 'Applied', appliedAt: new Date().toISOString() };
				csrApplications().unshift(application); saveState(); addEcosystemNotification('company', program.companyId, `${application.studentName} applied for ${program.title}.`, '/company/csr-applications'); showToast('CSR application submitted.'); renderFunctional(); return;
			}
			if (action === 'select-csr-student' || action === 'reject-csr-student' || action === 'complete-csr-student') {
				const application = csrApplications().find((item) => item.id === sourceEvent.currentTarget.dataset.id);
				if (!application || application.companyId !== currentCompanyAccount()?.id) return;
				const program = csrProgramById(application.programId);
				if (action === 'select-csr-student' && csrSelectedCount(application.programId) >= Number(program?.targetStudents || 0)) return showToast('The program has no remaining seats.');
				application.status = action === 'select-csr-student' ? 'Selected' : action === 'reject-csr-student' ? 'Rejected' : 'Completed';
				saveState(); addEcosystemNotification('student', application.studentId, `Your application for ${program?.title || 'the CSR program'} is ${application.status.toLowerCase()}.`, '/student/csr-applications'); showToast(`CSR application ${application.status.toLowerCase()}.`); renderFunctional(); return;
			}
			if (action === 'start-csr-participation') { const application = csrApplications().find((item) => item.id === sourceEvent.currentTarget.dataset.id); if (!application || application.companyId !== currentCompanyAccount()?.id || application.status !== 'Selected') return; application.status = 'In Progress'; saveState(); addEcosystemNotification('student', application.studentId, `You started participation in ${csrProgramById(application.programId)?.title || 'the CSR program'}.`, '/student/csr-applications'); showToast('CSR participation started.'); renderFunctional(); return; }
			if (action === 'view-csr-student') { const application = csrApplications().find((item) => item.id === sourceEvent.currentTarget.dataset.id); if (!application || application.companyId !== currentCompanyAccount()?.id) return; document.body.insertAdjacentHTML('beforeend', `<div class="modal-backdrop" data-action="close-modal"><div class="modal-card" role="dialog" aria-modal="true" onclick="event.stopPropagation()"><button class="modal-close" data-action="close-modal" aria-label="Close student profile">×</button><h2>${esc(application.studentName)}</h2><p>${esc(application.course || 'Course not provided')}</p><h3>Verified skills</h3><p>${esc(application.skills || 'No verified skills recorded.')}</p><p><b>Assessments:</b> ${application.assessmentCount || 0}<br><b>Applied:</b> ${esc(application.appliedAt.slice(0, 10))}<br><b>Status:</b> ${esc(application.status)}</p></div></div>`); return; }
			if (action === 'csr-filter') { const filters = [...document.querySelectorAll('[data-action="csr-filter"]')].reduce((result, input) => ({ ...result, [input.dataset.filter]: input.value.toLowerCase() }), {}); const query = document.querySelector('[data-action="filter"]')?.value.toLowerCase() || ''; document.querySelectorAll('#csr-results [data-searchable]').forEach((item) => { item.hidden = Boolean((query && !item.dataset.searchable.toLowerCase().includes(query)) || (filters.category && item.dataset.csrCategory.toLowerCase() !== filters.category) || (filters.mode && item.dataset.csrMode.toLowerCase() !== filters.mode)); }); return; }
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
				if (session?.loggedIn || account) {
					go(dashboardRouteForRole(session?.role || account?.role || 'student'));
					return;
				}
				go(portalLoginRoute(role));
				return;
			}
			if (action === 'forgot') { go(`${portalLoginRoute(sourceEvent.currentTarget.dataset.portalRole || 'student').replace('/login', '/forgot-password')}`); return; }
			if (action === 'skip-onboarding') { go('/student/dashboard'); return; }
			if (action === 'toggle-password') { const input = document.getElementById(sourceEvent.currentTarget.dataset.target); if (!input) return; const show = input.type === 'password'; input.type = show ? 'text' : 'password'; sourceEvent.currentTarget.textContent = show ? 'Hide' : 'Show'; sourceEvent.currentTarget.setAttribute('aria-pressed', String(show)); sourceEvent.currentTarget.setAttribute('aria-label', `${show ? 'Hide' : 'Show'} password`); return; }
			if (action === 'focus-search') { document.querySelector('.page-search')?.focus(); return; }
			if (action === 'notifications') { document.body.insertAdjacentHTML('beforeend', notificationPanel()); return; }
			if (action === 'close-modal') { sourceEvent.currentTarget.closest('.modal-backdrop')?.remove(); return; }
			if (action === 'global-search-result') {
				const result = globalSearchState.results[Number(sourceEvent.currentTarget.dataset.resultIndex)];
				if (!result) return;
				closeGlobalSearch();
				if (result.action === 'opportunity') {
					const opportunity = opportunityByTitle(result.titleKey);
					if (opportunity) document.body.insertAdjacentHTML('beforeend', detailModal(opportunity));
				} else if (result.route) go(result.route);
				return;
			}
			if (action === 'global-search-all') { closeGlobalSearch(); go(`/${normalizeRole(currentAuthSession()?.role || state.activeRole || 'student')}/opportunities`); return; }
			if (action === 'clear-global-search') { const input = document.querySelector('[data-global-search-input]'); if (input) { input.value = ''; input.focus(); renderGlobalSearch(); } return; }
		}
		function setupLoginRoleSelection() {
			const form = document.querySelector('form[data-form="login"]');
			if (!form || form.querySelector('[data-login-role-picker]')) return;
			const rolePicker = document.createElement('fieldset');
			rolePicker.className = 'auth-role-picker';
			rolePicker.dataset.loginRolePicker = 'true';
			rolePicker.innerHTML = '<legend>Sign in as</legend><div class="auth-role-options"><button type="button" class="auth-role-option is-selected" data-login-role="student" aria-pressed="true">Student/Employee</button><button type="button" class="auth-role-option" data-login-role="tutor" aria-pressed="false">Tutor</button></div><input type="hidden" name="loginRole" value="student">';
			form.prepend(rolePicker);
			rolePicker.querySelectorAll('[data-login-role]').forEach((button) => button.addEventListener('click', () => {
				const selectedRole = button.dataset.loginRole;
				rolePicker.querySelector('input[name="loginRole"]').value = selectedRole;
				rolePicker.querySelectorAll('[data-login-role]').forEach((option) => {
					const selected = option === button;
					option.classList.toggle('is-selected', selected);
					option.setAttribute('aria-pressed', String(selected));
				});
			}));
			const eyebrow = document.querySelector('.auth-aside .eyebrow');
			const heading = document.querySelector('.auth-main h2');
			const description = document.querySelector('.auth-main .form-wrap > p');
			const switchText = document.querySelector('.auth-main .switch');
			if (eyebrow) eyebrow.textContent = 'SkillAura Portal';
			if (heading) heading.textContent = 'Sign in to SkillAura';
			if (description) description.textContent = 'Choose your role, then sign in to your SkillAura workspace.';
			if (switchText) switchText.innerHTML = 'New to SkillAura? <a href="#/register">Create an account</a>';
		}
		function setupRoleDemoButtons() {
			const roleDemos = [
				['company', 'Demo Company'],
				['institution', 'Demo Institution']
			];
			roleDemos.forEach(([role, label]) => {
				const form = document.querySelector(`form[data-form="${role}-login"]`);
				if (!form || form.querySelector(`[data-demo="${role}"]`)) return;
				form.querySelector('button[type="submit"]')?.insertAdjacentHTML('afterend', `<div class="divider">or continue as demo</div><div class="demo-grid"><button class="demo-btn" type="button" data-demo="${role}">${label}</button></div>`);
			});
		}
		function bindFunctionalEvents() {
			setupSidebarState();
			setupLoginRoleSelection();
			setupRoleDemoButtons();
			if (!document.body.dataset.demoLoginBound) {
				document.body.addEventListener('click', (event) => {
					const button = event.target.closest('[data-demo]');
					if (!button || !['company', 'institution'].includes(button.dataset.demo)) return;
					const role = button.dataset.demo;
					const accounts = role === 'company' ? loadCompanyAccounts() : loadInstitutionAccounts();
					const account = accounts.find((item) => item.demoAccount);
					if (role === 'company') startCompanySession(account);
					else startInstitutionSession(account);
					go(role === 'company' ? '/company/dashboard' : '/institution/dashboard');
				}, true);
				document.body.dataset.demoLoginBound = 'true';
			}
			if (!document.body.dataset.actionDelegationBound) {
				document.body.addEventListener('click', (event) => {
					const element = event.target.closest('[data-action]');
					if (!element) return;
					const action = element.dataset.action;
					if (action === 'filter' || action === 'status') return;
					event.stopPropagation();

					if (action === 'view-opportunity') {
						const opportunity = opportunityByTitle(element.dataset.title);
						if (opportunity) {
							document.body.insertAdjacentHTML('beforeend', detailModal(opportunity));
							bindFunctionalEvents();
						}
						return;
					}
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
						if (session?.loggedIn || account) { go(dashboardRouteForRole(session?.role || account?.role || 'student')); return; }
						go(portalLoginRoute(role));
						return;
					}
					if (action === 'select-assessment' || action === 'retake-assessment') { state.assessmentResult = null; state.assessmentSession = { skill: element.dataset.skill, index: 0, answers: [] }; renderFunctional(); return; }
					if (action === 'start-mock-interview') { const role = document.querySelector('[data-mock-role]')?.value || 'Software Engineer'; const difficulty = document.querySelector('[data-mock-difficulty]')?.value || 'Easy'; state.mockInterviewSession = { role, difficulty, index: 0, questions: mockInterviewQuestions(role, difficulty), answers: [] }; saveState(); renderFunctional(); return; }
					if (action === 'evaluate-mock-answer') { const session = state.mockInterviewSession; const answer = document.querySelector('[data-mock-answer]')?.value.trim() || ''; if (!answer) { showToast('Write an answer before evaluating.'); return; } const question = session.questions[session.index]; session.answers[session.index] = { question: question.question, answer, evaluation: evaluateMockAnswer(answer, question) }; saveState(); renderFunctional(); return; }
					if (action === 'next-mock-question') { const session = state.mockInterviewSession; if (!session.answers[session.index]?.evaluation) return; if (session.index === session.questions.length - 1) { saveMockInterviewResult(session); renderFunctional(); return; } session.index += 1; saveState(); renderFunctional(); return; }
					if (action === 'cancel-mock-interview') { delete state.mockInterviewSession; saveState(); go('/student/interviews'); return; }
					if (action === 'cancel-assessment') { delete state.assessmentSession; go('/student/skills'); return; }
					if (action === 'next-assessment' || action === 'submit-assessment') { const choice = document.querySelector('input[name="assessment-answer"]:checked'); if (!choice) { showToast('Please select an answer.'); return; } const session = state.assessmentSession; session.answers[session.index] = Number(choice.value); const questions = ASSESSMENT_QUESTIONS[session.skill]; if (action === 'next-assessment') { session.index += 1; renderFunctional(); return; } const correct = session.answers.reduce((total, answer, index) => total + (answer === questions[index].a ? 1 : 0), 0); const score = Math.round((correct / questions.length) * 100); const topicBreakdown = calculateTopicBreakdown(session.skill, session.answers); const result = { skill: session.skill, score, correct, total: questions.length, rating: assessmentRating(score), topicBreakdown, completedAt: new Date().toISOString() }; state.assessments = (state.assessments || []).filter((item) => item.skill !== result.skill); state.assessments.push(result); state.skills = state.assessments.map((item) => ({ name: item.skill, score: item.score, status: item.rating })); state.assessmentResult = result; delete state.assessmentSession; saveState(); notify(`${result.skill} assessment completed with ${score}%.`); renderFunctional(); return; }
					if (action === 'close-assessment') { document.getElementById('assessment-area').innerHTML = ''; return; }
					if (action === 'start-learning') { state.learningProgress[element.dataset.skill] = 'In Progress'; saveState(); renderFunctional(); return; }
					if (action === 'candidate') { showToast(`${element.dataset.name}'s profile is ready for review.`); return; }
					if (action === 'join-program') { notify(`You joined the ${element.dataset.name} program.`); showToast('Program added to your workspace.'); return; }
					if (action === 'add-partnership') { const name = prompt('Partner organization'); if (name?.trim()) { state.partnerships.push({ id: `p-${Date.now()}`, name: name.trim(), type: 'New partnership', status: 'Pending' }); notify(`New partnership added with ${name.trim()}.`); saveState(); renderFunctional(); } return; }
					if (action === 'remove-partnership') { if (confirm('Remove this partnership?')) { state.partnerships = state.partnerships.filter((item) => item.id !== element.dataset.id); saveState(); renderFunctional(); } return; }
					if (action === 'read-notification') { const notification = state.notifications.find((item) => item.id === element.dataset.id); if (notification) notification.read = true; saveState(); element.closest('.notification-row')?.remove(); return; }
					navigateFromAction(action, { currentTarget: element });
				});
				document.body.dataset.actionDelegationBound = 'true';
			}

			document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
				if (backdrop.dataset.overlayBound) return;
				backdrop.addEventListener('click', (event) => {
					if (event.target === backdrop) {
						backdrop.remove();
					}
				});
				backdrop.dataset.overlayBound = 'true';
			});
			const globalInput = document.querySelector('[data-global-search-input]');
			if (globalInput && !globalInput.dataset.bound) {
				globalInput.dataset.bound = 'true';
				globalInput.addEventListener('input', renderGlobalSearch);
				globalInput.addEventListener('focus', () => { globalInput.closest('[data-search-root]')?.classList.add('is-focused'); renderGlobalSearch(); });
				globalInput.addEventListener('keydown', (event) => {
					if (event.key === 'Escape') { closeGlobalSearch(); return; }
					if (event.key === 'Enter') {
						event.preventDefault();
						const result = globalSearchState.results[globalSearchState.activeIndex >= 0 ? globalSearchState.activeIndex : 0];
						if (result) document.querySelector(`[data-action="global-search-result"][data-result-index="${globalSearchState.activeIndex >= 0 ? globalSearchState.activeIndex : 0}"]`)?.click();
						return;
					}
					if (!globalSearchState.results.length || !['ArrowDown', 'ArrowUp'].includes(event.key)) return;
					event.preventDefault();
					const direction = event.key === 'ArrowDown' ? 1 : -1;
					globalSearchState.activeIndex = (globalSearchState.activeIndex + direction + globalSearchState.results.length) % globalSearchState.results.length;
					document.querySelectorAll('.global-search-result').forEach((item, index) => item.classList.toggle('active', index === globalSearchState.activeIndex));
				});
			}
			if (!document.body.dataset.globalSearchOutsideBound) {
				document.addEventListener('click', (event) => { if (globalSearchState.open && !event.target.closest('[data-search-root]')) { closeGlobalSearch(); event.preventDefault(); event.stopPropagation(); } }, true);
				document.addEventListener('click', (event) => { const closeTarget = event.target.closest('[data-action="close-modal"]'); if (closeTarget) closeTarget.closest('.modal-backdrop')?.remove(); }, true);
				document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { document.querySelector('.modal-backdrop')?.remove(); closeSidebar(); return; } if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); focusGlobalSearch(); } });
				document.body.dataset.globalSearchOutsideBound = 'true';
			}
			document.querySelectorAll('input[name="assessment-answer"]').forEach((input) => input.addEventListener('change', () => {
				const session = state.assessmentSession;
				if (!session) return;
				session.answers[session.index] = Number(input.value);
				renderFunctional();
			}));
			document.querySelectorAll('[data-action="filter"]').forEach((input) => input.addEventListener('input', () => { const query = input.value.toLowerCase().trim(); const container = input.closest('.dash-content'); const results = [...container.querySelectorAll('[data-searchable]')]; results.forEach((item) => { item.hidden = query && !item.dataset.searchable.toLowerCase().includes(query); }); const visible = results.some((item) => !item.hidden); container.querySelector('.empty-state')?.remove(); if (!visible) container.insertAdjacentHTML('beforeend', emptyState('No results found.')); }));
			document.querySelectorAll('[data-action="status"]').forEach((select) => select.addEventListener('change', () => { const application = state.applications.find((item) => item.id === select.dataset.id); if (application) { application.status = select.value; notify(`Application status updated to ${select.value}.`); saveState(); showToast('Application status updated.'); } }));
			document.querySelectorAll('form[data-form]').forEach((form) => form.addEventListener('submit', (event) => { event.preventDefault(); handleForm(form, event); }));
			document.querySelectorAll('.skill-card[role="button"]').forEach((card) => {
				if (card.dataset.keyboardBound) return;
				card.dataset.keyboardBound = 'true';
				card.addEventListener('keydown', (event) => {
					if (event.target.closest('button')) return;
					if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); card.click(); }
				});
			});
			document.querySelectorAll('[data-demo]').forEach((button) => button.addEventListener('click', () => {
				const demoRole = button.dataset.demo;
					if (!['student', 'tutor'].includes(demoRole)) return;
				if (demoRole === 'tutor') {
					let account = loadTutorAccounts().find((item) => item.email === 'demo@tutor.skillaura');
					if (!account) {
						account = { id: 'tutor-demo', email: 'demo@tutor.skillaura', passwordHash: prototypeHash('demo-access'), role: 'tutor', demoAccount: true, profile: { name: 'Demo Tutor', email: 'demo@tutor.skillaura', initials: 'DT', expertise: 'JavaScript, Web Development', bio: 'I help learners build practical skills for modern digital careers.' }, courses: [{ id: 'course-demo-js', title: 'Modern JavaScript Foundations', description: 'Build a strong foundation in JavaScript and browser development.', category: 'Web Development', difficulty: 'Beginner', skills: 'JavaScript, DOM, Accessibility', modules: 'Module 1: Language foundations\nModule 2: Browser projects', duration: '6 weeks', price: 'Free', status: 'Published', learners: 24, completion: 68 }] };
						saveTutorAccounts([...(loadTutorAccounts()), account]);
					}
					startTutorSession(account); go('/tutor/dashboard'); return;
				}
				let account = loadStudentAccounts().find((item) => item.email === 'demo@student.skillaura');
				if (!account) { const profile = { ...clone(defaultState.student), name: 'Demo Student/Employee', email: 'demo@student.skillaura', initials: 'DS', title: 'Welcome, Demo', subtitle: 'Here is your career readiness overview.' }; account = { id: 'student-demo', email: profile.email, passwordHash: prototypeHash('demo-access'), profile, workspace: studentWorkspace(), createdAt: new Date().toISOString() }; saveStudentAccounts([...loadStudentAccounts(), account]); }
				startStudentSession(account, 'student'); go('/student/dashboard');
			}));
		}
		function handleForm(form, submitEvent) {
			const values = Object.fromEntries(new FormData(form).entries());
			if (submitEvent?.submitter?.name) values[submitEvent.submitter.name] = submitEvent.submitter.value;
			clearFormErrors(form);
			if (form.dataset.form === 'portal-recovery') {
				const role = normalizeRole(form.dataset.role || 'student');
				if (!isValidEmail(values.email)) return showFieldError(form, 'email', 'Enter a valid email address.');
				const accounts = role === 'company' ? loadCompanyAccounts() : role === 'institution' ? loadInstitutionAccounts() : loadStudentAccounts();
				if (!accounts.some((account) => account.email === values.email.trim().toLowerCase())) return showFieldError(form, 'email', `No ${roleLabel(role).toLowerCase()} account exists for this email.`);
				showToast('Reset link simulated. You can sign in with your updated prototype credentials.');
				go(portalLoginRoute(role));
				return;
			}
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
				const accounts = loadInstitutionAccounts(); accounts.push(account); saveInstitutionAccounts(accounts); saveInstitutionWorkspace(blankInstitutionWorkspace(account));
				const institutionName = profile.name.trim().toLowerCase();
				const students = loadStudentAccounts().map((student) => {
					const college = String(student.profile?.college || student.college || '').trim().toLowerCase();
					return college === institutionName ? { ...student, institutionId, profile: { ...student.profile, institutionId } } : student;
				});
				saveStudentAccounts(students);
				const linkedStudentIds = new Set(students.filter((student) => student.institutionId === institutionId).map((student) => student.id));
				(state.ecosystem?.applications || []).forEach((application) => { if (linkedStudentIds.has(application.studentId)) application.institutionId = institutionId; });
				(state.ecosystem?.interviews || []).forEach((interview) => { if (linkedStudentIds.has(interview.studentId)) interview.institutionId = institutionId; });
				(state.ecosystem?.offers || []).forEach((offer) => { if (linkedStudentIds.has(offer.studentId)) offer.institutionId = institutionId; });
				saveState(); startInstitutionSession(account); go('/institution/onboarding'); return;
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
			if (form.dataset.form === 'tutor-exam') {
				const account = currentTutorAccount(); if (!account) return go('/login');
				const formData = new FormData(form);
				const texts = formData.getAll('questionText').map((value) => String(value).trim());
				const optionsA = formData.getAll('questionOptionA').map((value) => String(value).trim());
				const optionsB = formData.getAll('questionOptionB').map((value) => String(value).trim());
				const optionsC = formData.getAll('questionOptionC').map((value) => String(value).trim());
				const optionsD = formData.getAll('questionOptionD').map((value) => String(value).trim());
				const answers = formData.getAll('questionAnswer').map((value) => String(value));
				const marks = formData.getAll('questionMarks').map((value) => Number(value) || 0);
				if (!values.title?.trim()) return showFieldError(form, 'title', 'Enter an exam title.');
				if (!values.courseId) return showFieldError(form, 'courseId', 'Select the course for this exam.');
				if (!texts.length || texts.some((text, index) => !text || !optionsA[index] || !optionsB[index] || !optionsC[index] || !optionsD[index] || marks[index] < 1)) return showFormError(form, 'Complete every multiple-choice question, option, and mark value.');
				const questions = texts.map((text, index) => ({ text, options: { A: optionsA[index], B: optionsB[index], C: optionsC[index], D: optionsD[index] }, answer: answers[index], marks: marks[index] }));
				const exams = account.exams || [];
				const existing = exams.find((exam) => exam.id === values.examId);
				const exam = { id: existing?.id || `exam-${Date.now()}`, title: values.title.trim(), description: values.description.trim(), courseId: values.courseId, module: values.module.trim(), difficulty: values.difficulty, questions, totalMarks: marks.reduce((total, mark) => total + mark, 0), timeLimit: Number(values.timeLimit) || 30, passingScore: Number(values.passingScore) || 60, availability: values.availability || 'Always available', status: existing?.status || 'Draft', updatedAt: new Date().toISOString() };
				if (existing) Object.assign(existing, exam); else exams.unshift(exam);
				account.exams = exams; saveTutorAccounts(loadTutorAccounts().map((item) => item.id === account.id ? account : item)); showToast(existing ? 'Exam changes saved.' : 'Exam saved as draft.'); renderFunctional(); return;
			}
			if (form.dataset.form === 'tutor-profile') {
				const account = currentTutorAccount(); if (!account) return go('/login');
				account.profile = { ...account.profile, name: values.name.trim(), expertise: values.expertise.trim(), bio: values.bio.trim(), initials: values.name.trim().split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase() };
				saveTutorAccounts(loadTutorAccounts().map((item) => item.id === account.id ? account : item)); showToast('Tutor profile saved.'); renderFunctional(); return;
			}
			if (form.dataset.form === 'tutor-course') {
				const account = currentTutorAccount(); if (!account) return go('/login');
				if (!values.title?.trim()) return showFieldError(form, 'title', 'Enter a course title.');
				const courses = account.courses || [];
				const existing = courses.find((course) => course.id === values.courseId);
				const course = { id: existing?.id || `course-${Date.now()}`, title: values.title.trim(), description: values.description.trim(), category: values.category.trim(), difficulty: values.difficulty, skills: values.skills.trim(), thumbnail: values.thumbnail.trim(), modules: values.modules.trim(), duration: values.duration.trim(), price: values.price.trim() || 'Free', status: existing?.status || 'Draft', learners: existing?.learners || 0, completion: existing?.completion || 0, updatedAt: new Date().toISOString() };
				if (existing) Object.assign(existing, course); else courses.unshift(course);
				account.courses = courses; saveTutorAccounts(loadTutorAccounts().map((item) => item.id === account.id ? account : item)); showToast(existing ? 'Course changes saved.' : 'Course saved as draft.'); renderFunctional(); return;
			}
			if (form.dataset.form === 'login') {
				let invalid = false;
				if (!isValidEmail(values.email)) { showFieldError(form, 'email', 'Enter a valid email address.'); invalid = true; }
				if (!values.password) { showFieldError(form, 'password', 'Enter your password.'); invalid = true; }
				if (invalid) return;
				const role = values.loginRole || 'student';
				if (!isLearnerRole(role)) return showFormError(form, 'Choose Student/Employee or Tutor.');
				const accounts = role === 'tutor' ? loadTutorAccounts() : loadStudentAccounts();
				const account = accounts.find((item) => item.email === values.email.trim().toLowerCase());
				if (!account || account.passwordHash !== prototypeHash(values.password)) return showFormError(form, 'That email or password is not correct.');
				if (role === 'tutor') { startTutorSession(account); go('/tutor/dashboard'); return; }
				startStudentSession(account, role);
				go('/student/dashboard'); return;
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
				go('/student/onboarding');
				return;
			}
			if (form.dataset.form === 'onboarding') { const account = currentStudentAccount(); if (!account) return go('/login'); const onboarding = { careerInterest: values.interests || '', desiredRole: values.roles || '', technicalSkills: values.technicalSkills || '', softSkills: values.softSkills || '', preferredIndustry: values.industries || '', opportunityType: values.opportunityType || '', location: values.location || '' }; state.student.preferences = onboarding; const accounts = loadStudentAccounts(); const index = accounts.findIndex((item) => item.id === account.id); if (index >= 0) { accounts[index].onboarding = onboarding; accounts[index].onboardingCompleted = true; saveStudentAccounts(accounts); } saveState(); notify('Your onboarding preferences were saved.'); go('/student/dashboard'); return; }
			if (form.dataset.form === 'recovery') { if (!isValidEmail(values.email)) return showFieldError(form, 'email', 'Enter a valid email address.'); const account = loadStudentAccounts().find((item) => item.email === values.email.trim().toLowerCase()); if (!account) return showFieldError(form, 'email', 'No student account exists for this email.'); try { localStorage.setItem(RESET_CANDIDATE_KEY, account.id); } catch (error) { } showToast('Reset link simulated. Choose a new password now.'); go('/reset-password'); return; }
			if (form.dataset.form === 'reset-password') { const accountId = localStorage.getItem(RESET_CANDIDATE_KEY); const accounts = loadStudentAccounts(); const index = accounts.findIndex((account) => account.id === accountId); if (index < 0) return go('/forgot-password'); if ((values.password || '').length < 8) return showFieldError(form, 'password', 'Use at least 8 characters.'); if (values.password !== values.confirmPassword) return showFieldError(form, 'confirmPassword', 'Passwords do not match.'); accounts[index].passwordHash = prototypeHash(values.password); saveStudentAccounts(accounts); localStorage.removeItem(RESET_CANDIDATE_KEY); showToast('Password updated. You can now log in.'); go('/login'); return; }
			if (form.dataset.form === 'profile') { const normalizedRole = normalizeRole(form.dataset.role); const person = personFor(normalizedRole); person.name = values.name; person.email = values.email; if (normalizedRole === 'student') { person.college = values.details; person.title = `Welcome, ${(values.name || '').trim().split(/\s+/)[0] || 'Student'}`; const account = currentStudentAccount(); if (account) { account.profile = { ...account.profile, name: person.name, email: person.email, college: person.college, title: person.title }; saveStudentAccounts(loadStudentAccounts().map((item) => item.id === account.id ? account : item)); } } else if (normalizedRole === 'company') person.industryType = values.details; else person.institutionType = values.details; const session = currentAuthSession(); if (session) persistAuthSession({ ...session, name: person.name, email: person.email }); saveState(); notify('Profile changes saved.'); showToast('Profile changes saved.'); return; }
			if (form.dataset.form === 'settings') { state.settings = { emailUpdates: form.elements.emailUpdates.checked, profileVisibility: form.elements.profileVisibility.checked, compactView: form.elements.compactView.checked }; saveState(); notify('Settings saved.'); showToast('Settings saved.'); return; }
			if (form.dataset.form === 'csr-program') {
				const account = currentCompanyAccount();
				if (!account || normalizeRole(currentAuthSession()?.role) !== 'company') return go('/company/login');
				if (!values.title?.trim()) return showFieldError(form, 'title', 'Enter a program title.');
				if (!values.description?.trim()) return showFieldError(form, 'description', 'Add a program description.');
				if (!values.skills?.trim()) return showFieldError(form, 'skills', 'Add at least one skill.');
				if (values.startDate && values.endDate && values.endDate < values.startDate) return showFormError(form, 'End date must be on or after the start date.');
				if (values.deadline && new Date(`${values.deadline}T23:59:59`).getTime() < Date.now() && values.status === 'Published') return showFormError(form, 'A published program must have an open application deadline.');
				const existing = values.programId ? csrProgramById(values.programId) : null;
				if (existing && existing.companyId !== account.id) return showFormError(form, 'You can only edit your own CSR programs.');
				const program = { id: existing?.id || `csr-program-${Date.now()}`, companyId: account.id, companyName: account.profile?.name || account.name || 'Company', title: values.title.trim(), description: values.description.trim(), objectives: values.objectives?.trim() || '', category: values.category, skills: normalizeSkillList(values.skills).join(', '), targetStudents: Math.max(1, Number(values.targetStudents) || 1), trainingHours: Math.max(0, Number(values.trainingHours) || 0), duration: values.duration?.trim() || '', startDate: values.startDate || '', endDate: values.endDate || '', mode: values.mode || 'Online', location: values.location?.trim() || '', eligibility: values.eligibility?.trim() || '', benefits: values.benefits?.trim() || '', sponsoredCourse: values.sponsoredCourse?.trim() || '', scholarshipAmount: Math.max(0, Number(values.scholarshipAmount) || 0), internshipOpportunity: Boolean(values.internshipOpportunity), jobOpportunity: Boolean(values.jobOpportunity), certificateAvailable: Boolean(values.certificateAvailable), deadline: values.deadline || '', status: values.status || 'Draft', createdAt: existing?.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() };
				if (existing) Object.assign(existing, program); else csrPrograms().unshift(program);
				saveState(); showToast(existing ? 'CSR program updated.' : 'CSR program saved.'); go('/company/csr-programs'); return;
			}
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
		function lightAuroraColor(progress) {
			const palette = ['#BFF7EF', '#D5F7FF', '#DCEBFF', '#E5E8FF', '#EEE4FF', '#F2E5FF', '#FFE4F1', '#FFE8D5', '#DDF7EA', '#D5F7FF'];
			const position = Math.min(1, Math.max(0, progress)) * (palette.length - 1);
			const index = Math.min(palette.length - 2, Math.floor(position));
			return mixColor(palette[index], palette[index + 1], position - index);
		}
		function lightAuroraRgba(progress, alpha) {
			const channels = lightAuroraColor(progress).match(/\d+/g).map(Number);
			return `rgba(${channels.join(', ')}, ${alpha})`;
		}
		function lightBackgroundColor(progress) {
			const palette = ['#E7F0EF', '#E5EEF1', '#E8E9F3', '#EEE8F1', '#F3E9E9', '#F4ECE2', '#E8F1EA', '#E4EEF0'];
			const position = Math.min(1, Math.max(0, progress)) * (palette.length - 1);
			const index = Math.min(palette.length - 2, Math.floor(position));
			return mixColor(palette[index], palette[index + 1], position - index);
		}
		function updateGlobalBackground() {
			const background = document.getElementById('global-background');
			const root = document.querySelector('.landing');
			if (!background) return;
			const isHomePage = document.body.classList.contains('home-page');
				const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
				const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
				const transitionLimit = .25;
				const phase = progress <= transitionLimit ? progress / transitionLimit : progress >= 1 - transitionLimit ? (1 - progress) / transitionLimit : 1;
				const normalized = Math.min(1, Math.max(0, phase));
				const darkness = normalized * normalized * (3 - 2 * normalized);
				const calculatedBackgroundColor = selectedTheme === 'dark'
					? mixColor('#101719', '#000000', darkness)
					: lightBackgroundColor(progress);
				const currentBackgroundColor = window.__skillAuraBackgroundOverride || calculatedBackgroundColor;
				background.style.setProperty('--bg-shift-x', `${(progress * 80 - 40).toFixed(2)}px`);
				background.style.setProperty('--bg-shift-y', `${(progress * -120).toFixed(2)}px`);
				background.style.setProperty('--bg-rotate', `${(progress * 120).toFixed(2)}deg`);
				background.style.setProperty('--bg-scale', `${(1.04 + progress * .12).toFixed(3)}`);
				background.style.setProperty('--bg-grid-y', `${(progress * 180).toFixed(2)}px`);
				background.style.setProperty('--bg-sheen', `${(progress * 100).toFixed(2)}%`);
				background.style.setProperty('--bg-depth', `${(progress * 18).toFixed(2)}px`);
				if (selectedTheme === 'dark') {
					background.style.setProperty('--bg-glow', '0.95');
					background.style.setProperty('--bg-aurora-a', 'rgba(79, 209, 197, 0.42)');
					background.style.setProperty('--bg-aurora-b', 'rgba(21, 154, 156, 0.32)');
					background.style.setProperty('--bg-aurora-c', 'rgba(117, 76, 255, 0.24)');
					background.style.setProperty('--ribbon-x', `${(progress * 150 - 55).toFixed(2)}px`);
					background.style.setProperty('--ribbon-y', `${(progress * -190 + 30).toFixed(2)}px`);
					background.style.setProperty('--ribbon-rotate', `${(progress * 34 - 22).toFixed(2)}deg`);
					background.style.setProperty('--ribbon-scale', `${(1.02 + progress * .1).toFixed(3)}`);
					background.style.setProperty('--ribbon-opacity', `${(.08 + Math.sin(progress * Math.PI) * .38).toFixed(3)}`);
				} else if (isHomePage) {
					background.style.setProperty('--bg-glow', '0.6');
					background.style.setProperty('--bg-aurora-a', lightAuroraRgba(progress, .34));
					background.style.setProperty('--bg-aurora-b', lightAuroraRgba(Math.min(1, progress + .2), .24));
					background.style.setProperty('--bg-aurora-c', lightAuroraRgba(Math.max(0, progress - .2), .2));
					background.style.setProperty('--bg-aurora-d', lightAuroraRgba(Math.min(1, progress + .35), .2));
					background.style.setProperty('--bg-aurora-e', lightAuroraRgba(Math.max(0, progress - .25), .16));
					background.style.setProperty('--light-ribbon-x', `${(progress * 170 - 70).toFixed(2)}px`);
					background.style.setProperty('--light-ribbon-y', `${(progress * -210 + 34).toFixed(2)}px`);
					background.style.setProperty('--light-ribbon-rotate', `${(progress * 38 - 24).toFixed(2)}deg`);
					background.style.setProperty('--light-ribbon-scale', `${(1.01 + progress * .11).toFixed(3)}`);
					background.style.setProperty('--light-ribbon-opacity', `${(.06 + Math.sin(progress * Math.PI) * .28).toFixed(3)}`);
					background.style.setProperty('--light-ribbon-gradient', `${(progress * 100).toFixed(2)}%`);
				}
				background.style.backgroundColor = currentBackgroundColor;
			const scrollColors = selectedTheme === 'dark'
				? { ink: mixColor('#f4f7f7', '#ffffff', darkness), muted: mixColor('#b7c4c5', '#91a5a7', darkness), line: mixColor('#35474b', '#243538', darkness), surface: mixColor('#101719', '#0b1113', darkness), soft: mixColor('#0b1113', '#070b0d', darkness), header: mixColor('#101719', '#000000', darkness) }
				: { ink: mixColor('#17333a', '#17333a', darkness), muted: mixColor('#668087', '#668087', darkness), line: mixColor('#d7e9e9', '#c4dddd', darkness), surface: mixColor('#ffffff', '#f4fafa', darkness), soft: mixColor('#f4fafa', '#e8f4f3', darkness), header: mixColor('#17333a', '#123039', darkness) };
			root?.style.setProperty('--scroll-ink', scrollColors.ink);
			root?.style.setProperty('--scroll-muted', scrollColors.muted);
			root?.style.setProperty('--scroll-line', scrollColors.line);
			root?.style.setProperty('--scroll-surface', scrollColors.surface);
			root?.style.setProperty('--scroll-soft', scrollColors.soft);
			document.body.style.setProperty('--scroll-ink', scrollColors.ink);
			document.body.style.setProperty('--scroll-muted', scrollColors.muted);
			document.body.style.setProperty('--scroll-line', scrollColors.line);
			document.body.style.setProperty('--scroll-surface', scrollColors.surface);
			document.body.style.setProperty('--scroll-soft', scrollColors.soft);
			document.body.style.setProperty('--scroll-header', scrollColors.header);
				const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
				const heroCopy = root?.querySelector('.hero > .container:first-child');
				const ecosystem = root?.querySelector('.ecosystem');
				if (isHomePage && !reducedMotion) {
					if (heroCopy) {
						const heroExit = Math.min(1, Math.max(0, -root.getBoundingClientRect().top / Math.max(root.offsetHeight * .55, 1)));
						heroCopy.style.transform = `translateY(${progress * -42}px)`;
						heroCopy.style.opacity = String(1 - heroExit * .7);
					}
					if (ecosystem) ecosystem.style.transform = `translateY(${progress * 28}px)`;
				}
				const center = window.scrollY + window.innerHeight * .42;
				let activeId = '';
				root?.querySelectorAll('section[id]').forEach((section) => {
					if (section.offsetTop <= center) activeId = section.id;
				});
				root?.querySelectorAll('.navlinks a').forEach((link) => {
					const href = link.getAttribute('href');
					const active = activeId ? href === `#${activeId}` : href === '#/';
					link.classList.toggle('active', active);
					if (active) link.setAttribute('aria-current', 'page');
					else link.removeAttribute('aria-current');
				});
		}
		function setupSparkCursor() {
			if (window.__skillAuraSparkCursor) return;
			const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches && navigator.maxTouchPoints === 0;
			if (!finePointer) return;
			const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			const canvas = document.createElement('canvas');
			canvas.className = 'spark-cursor-trail';
			canvas.setAttribute('aria-hidden', 'true');
			const dot = document.createElement('div');
			dot.className = 'spark-cursor-dot is-hidden';
			dot.setAttribute('aria-hidden', 'true');
			document.body.append(canvas, dot);
			document.body.classList.add('spark-cursor-enabled');
			const context = canvas.getContext('2d');
			const particles = [];
			const current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
			const target = { ...current };
			let devicePixelRatio = 1;
			let pointerActive = false;
			let animationFrame = null;
			let lastPointerX = target.x;
			let lastPointerY = target.y;
			let lastPointerTime = 0;
			let lastDirectionX = 0;
			let lastDirectionY = 0;
			let movementBudget = 0;
			const resize = () => {
				devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);
				canvas.width = Math.floor(window.innerWidth * devicePixelRatio);
				canvas.height = Math.floor(window.innerHeight * devicePixelRatio);
				canvas.style.width = `${window.innerWidth}px`;
				canvas.style.height = `${window.innerHeight}px`;
				context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
			};
			const isInteractive = (element) => element instanceof Element && Boolean(element.closest('a, button, input, select, textarea, summary, [role="button"], [data-action]'));
			const spawn = (x, y, intensity = .35, burst = false) => {
				if (reducedMotion || particles.length >= 64) return;
				const angle = Math.random() * Math.PI * 2;
				const distance = 3 + intensity * 5 + Math.random() * 6;
				particles.push({ x: x + Math.cos(angle) * Math.random() * 3, y: y + Math.sin(angle) * Math.random() * 3, vx: Math.cos(angle) * distance, vy: Math.sin(angle) * distance, size: .8 + intensity * 1.7 + Math.random() * 1.8 + (burst ? .7 : 0), life: 1, decay: .035 + Math.random() * .028, alpha: .35 + intensity * .45 + Math.random() * .2 });
			};
			const animate = () => {
				animationFrame = null;
				current.x += (target.x - current.x) * .24;
				current.y += (target.y - current.y) * .24;
				dot.style.left = `${current.x}px`;
				dot.style.top = `${current.y}px`;
				context.clearRect(0, 0, window.innerWidth, window.innerHeight);
				particles.forEach((particle) => {
					particle.x += particle.vx;
					particle.y += particle.vy;
					particle.vx *= .94;
					particle.vy *= .94;
					particle.life -= particle.decay;
					context.beginPath();
					context.fillStyle = `rgba(94, 234, 212, ${Math.max(0, particle.life * particle.alpha)})`;
					context.shadowBlur = 8;
					context.shadowColor = 'rgba(79, 209, 197, .55)';
					context.arc(particle.x, particle.y, Math.max(.1, particle.size * particle.life), 0, Math.PI * 2);
					context.fill();
				});
				context.shadowBlur = 0;
				for (let index = particles.length - 1; index >= 0; index -= 1) if (particles[index].life <= 0) particles.splice(index, 1);
				if (particles.length) animationFrame = requestAnimationFrame(animate);
			};
			const schedule = () => { if (!animationFrame) animationFrame = requestAnimationFrame(animate); };
			const pointerMove = (event) => {
				const now = performance.now();
				const deltaTime = Math.max(8, now - (lastPointerTime || now - 16.67));
				const deltaX = event.clientX - lastPointerX;
				const deltaY = event.clientY - lastPointerY;
				const distance = Math.hypot(deltaX, deltaY);
				const speed = Math.min(1, distance / deltaTime / 1.15);
				const directionX = distance ? deltaX / distance : 0;
				const directionY = distance ? deltaY / distance : 0;
				const reversal = lastDirectionX * directionX + lastDirectionY * directionY < -.45;
				lastPointerX = event.clientX;
				lastPointerY = event.clientY;
				lastPointerTime = now;
				if (distance) {
					lastDirectionX = directionX;
					lastDirectionY = directionY;
				}
				target.x = event.clientX;
				target.y = event.clientY;
				dot.classList.toggle('is-hovering', isInteractive(event.target));
				dot.classList.remove('is-hidden');
				if (reducedMotion) {
					current.x = target.x;
					current.y = target.y;
					dot.style.left = `${current.x}px`;
					dot.style.top = `${current.y}px`;
					return;
				}
				if (distance > 2) {
					const distanceFactor = Math.min(1, distance / 120);
					const speedFactor = Math.min(1, speed);
					const reversalBonus = reversal ? Math.min(2, distance / 45) : 0;
					movementBudget += distance / 12 * (.35 + speedFactor * .9) + reversalBonus;
					const particleCount = Math.min(12, Math.floor(movementBudget));
					movementBudget -= particleCount;
					for (let index = 0; index < particleCount && particles.length < 64; index += 1) {
						spawn(event.clientX, event.clientY, .25 + distanceFactor * .75, reversal && index === particleCount - 1);
					}
				}
				schedule();
			};
			const pointerEnter = () => { pointerActive = true; dot.classList.remove('is-hidden'); schedule(); };
			const pointerLeave = () => { pointerActive = false; dot.classList.add('is-hidden'); schedule(); };
			resize();
			window.addEventListener('resize', resize, { passive: true });
			document.addEventListener('pointermove', pointerMove, { passive: true });
			document.addEventListener('pointerenter', pointerEnter, { passive: true });
			document.addEventListener('pointerleave', pointerLeave, { passive: true });
			window.__skillAuraSparkCursor = { canvas, dot, resize };
		}
		function setupGlobalBackground() {
			if (!window.__skillAuraGlobalScrollHandler) {
				window.__skillAuraGlobalScrollHandler = () => {
					if (window.__skillAuraGlobalScrollFrame) return;
					window.__skillAuraGlobalScrollFrame = requestAnimationFrame(() => {
						window.__skillAuraGlobalScrollFrame = null;
						updateGlobalBackground();
					});
				};
				window.addEventListener('scroll', window.__skillAuraGlobalScrollHandler, { passive: true });
				window.addEventListener('resize', updateGlobalBackground, { passive: true });
			}
			updateGlobalBackground();
		}
		function teardownLandingExperience() {
			if (window.__skillAuraScrollFrame) cancelAnimationFrame(window.__skillAuraScrollFrame);
			window.__skillAuraScrollFrame = null;
			if (window.__skillAuraSkillRotationCleanup) window.__skillAuraSkillRotationCleanup();
			delete window.__skillAuraSkillRotationCleanup;
			if (window.__skillAuraStatsCleanup) window.__skillAuraStatsCleanup();
			delete window.__skillAuraStatsCleanup;
			if (window.__skillAuraScrollHandler) window.removeEventListener('scroll', window.__skillAuraScrollHandler);
			if (window.__skillAuraResizeHandler) window.removeEventListener('resize', window.__skillAuraResizeHandler);
			if (window.__skillAuraHeroPointerHandler) document.querySelector('.hero')?.removeEventListener('pointermove', window.__skillAuraHeroPointerHandler);
			delete window.__skillAuraHeroPointerHandler;
			if (window.__skillAuraEcosystemScrollHandler) window.removeEventListener('scroll', window.__skillAuraEcosystemScrollHandler);
			delete window.__skillAuraEcosystemScrollHandler;
			if (window.__skillAuraEcosystemCleanup) window.__skillAuraEcosystemCleanup();
			delete window.__skillAuraEcosystemCleanup;
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

		function homeEcosystemJourneyMarkup() {
			const session = currentAuthSession();
			const studentRoute = session?.loggedIn && normalizeRole(session.role) === 'student' ? '/student/dashboard' : '/role-selection';
			const skillsRoute = session?.loggedIn && normalizeRole(session.role) === 'student' ? '/student/skills' : '/login';
			const opportunityRoute = session?.loggedIn && normalizeRole(session.role) === 'student' ? '/student/opportunities' : '/role-selection';
			const careerRoute = session?.loggedIn && normalizeRole(session.role) === 'student' ? '/student/career-path' : '/login';
			const stages = [
				['01', 'Student/Employee', 'Build your profile and showcase your abilities.', '♙', studentRoute],
				['02', 'Skills & Verification', 'Assess your abilities and build a verified skill profile.', '✦', skillsRoute],
				['03', 'Industry Opportunity', 'Discover internships, jobs, and opportunities matched to your skills.', '◈', opportunityRoute],
				['04', 'Career Growth', 'Apply, interview, learn, and move toward your career goals.', '◎', careerRoute]
			];
			return `<section class="home-ecosystem section soft" id="home-ecosystem"><div class="container home-ecosystem-grid"><div class="home-ecosystem-sticky"><div class="home-ecosystem-visual" data-ecosystem-visual><span class="home-ecosystem-progress" aria-hidden="true"></span>${stages.map(([number, title, copy, icon, route], index) => `<a class="home-ecosystem-node${index === 0 ? ' active' : ''}" data-ecosystem-node="${index}" href="#${route}"><span class="home-ecosystem-node-icon">${icon}</span><span><small>${number}</small>${title}</span></a>${index < stages.length - 1 ? '<span class="home-ecosystem-line" data-ecosystem-line="' + index + '"></span>' : ''}`).join('')}</div></div><div class="home-ecosystem-steps"><div class="home-section-kicker">The SkillAura journey</div>${stages.map(([number, title, copy, icon, route], index) => `<a class="home-ecosystem-step${index === 0 ? ' active' : ''}" data-ecosystem-step="${number}" data-ecosystem-index="${index}" href="#${route}"><span>${number}</span><div><h3>${title}</h3><p>${copy}</p></div></a>`).join('')}</div></div></section>`;
		}

		function enhanceHomePage(landingRoot) {
			if (landingRoot.querySelector('.home-stats')) return;
			landingRoot.querySelector('.cta')?.insertAdjacentHTML('beforebegin', homeEnhancementsMarkup());
			const finalCtaButton = landingRoot.querySelector('.home-final-cta a[href="#/student/opportunities"]');
			if (finalCtaButton) {
				finalCtaButton.textContent = 'Go to Top ↑';
				finalCtaButton.removeAttribute('href');
				finalCtaButton.setAttribute('role', 'button');
				finalCtaButton.onclick = (event) => {
					event.preventDefault();
					window.scrollTo({ top: 0, behavior: 'smooth' });
				};
			}
			landingRoot.querySelector('#roles')?.remove();
			landingRoot.querySelector('#home-opportunities')?.remove();
			landingRoot.querySelectorAll('.navlinks a[href="#roles"]').forEach((link) => link.remove());
			const existingEcosystem = landingRoot.querySelector('#home-ecosystem');
			if (existingEcosystem) {
				const template = document.createElement('template');
				template.innerHTML = homeEcosystemJourneyMarkup();
				existingEcosystem.replaceWith(template.content.firstElementChild);
			}
			const skillDetails = {
				Python: 'Automation, data, and backend foundations used across SkillAura opportunities.',
				JavaScript: 'The language behind interactive products, dashboards, and modern web experiences.',
				React: 'A practical UI skill for building fast, composable product interfaces.',
				SQL: 'The data layer skill that helps teams turn product questions into decisions.',
				Git: 'A collaboration essential for shipping confidently with technical teams.',
				Communication: 'The multiplier that helps strong technical work create real-world impact.'
			};
			const skillOrder = ['Python', 'JavaScript', 'React', 'SQL', 'Git', 'Communication'];
			const skillSection = landingRoot.querySelector('#home-skills');
			const skillDetail = landingRoot.querySelector('.home-skill-detail');
			let activeSkillIndex = 0;
			let skillRotationTimer = null;
			let skillSectionVisible = false;
			const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			const clearSkillRotation = () => {
				if (skillRotationTimer) window.clearInterval(skillRotationTimer);
				skillRotationTimer = null;
			};
			const showSkill = (skillName, animate = true) => {
				const skill = data.skills.find((item) => item[0] === skillName);
				if (!skill || !skillDetail) return;
				activeSkillIndex = skillOrder.indexOf(skillName);
				landingRoot.querySelectorAll('[data-home-skill]').forEach((item) => item.classList.toggle('active', item.dataset.homeSkill === skillName));
				skillDetail.querySelector('h3').textContent = skill[0];
				skillDetail.querySelector('p').textContent = skillDetails[skill[0]];
				skillDetail.querySelector('strong').textContent = `${skill[1]}% readiness`;
				skillDetail.querySelector('.bar span').style.width = `${skill[1]}%`;
				if (animate && !reducedMotion) {
					skillDetail.classList.remove('skill-card-enter');
					void skillDetail.offsetWidth;
					skillDetail.classList.add('skill-card-enter');
				}
			};
			const startSkillRotation = () => {
				clearSkillRotation();
				if (!skillSectionVisible || !skillSection) return;
				skillRotationTimer = window.setInterval(() => {
					const sectionBounds = skillSection.getBoundingClientRect();
					const isOnScreen = sectionBounds.bottom > 0 && sectionBounds.top < window.innerHeight;
					if (!isOnScreen) {
						clearSkillRotation();
						return;
					}
					showSkill(skillOrder[(activeSkillIndex + 1) % skillOrder.length]);
				}, 2000);
			};
			const skillVisibilityObserver = skillSection ? new IntersectionObserver(([entry]) => {
				skillSectionVisible = entry.isIntersecting;
				if (skillSectionVisible) startSkillRotation();
				else clearSkillRotation();
			}, { threshold: .35 }) : null;
			if (skillVisibilityObserver) skillVisibilityObserver.observe(skillSection);
			window.__skillAuraSkillRotationCleanup = () => {
				clearSkillRotation();
				if (skillVisibilityObserver) skillVisibilityObserver.disconnect();
			};
			landingRoot.querySelectorAll('[data-home-skill]').forEach((button) => {
				button.addEventListener('click', () => {
					showSkill(button.dataset.homeSkill);
					startSkillRotation();
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
			const ecosystemSteps = [...landingRoot.querySelectorAll('.home-ecosystem-step')];
			const ecosystemVisual = landingRoot.querySelector('[data-ecosystem-visual]');
			const setEcosystemStage = (index) => {
				ecosystemSteps.forEach((step, stepIndex) => step.classList.toggle('active', stepIndex === index));
				landingRoot.querySelectorAll('.home-ecosystem-node').forEach((node, nodeIndex) => node.classList.toggle('active', nodeIndex === index));
				landingRoot.querySelectorAll('.home-ecosystem-line').forEach((line, lineIndex) => line.classList.toggle('active', lineIndex < index));
				if (ecosystemVisual) ecosystemVisual.style.setProperty('--ecosystem-progress', `${(index / Math.max(1, ecosystemSteps.length - 1)) * 100}%`);
			};
			const updateEcosystemStage = () => {
				const section = landingRoot.querySelector('#home-ecosystem');
				if (!section || !ecosystemSteps.length) return;
				const sectionBounds = section.getBoundingClientRect();
				if (sectionBounds.bottom < 0 || sectionBounds.top > window.innerHeight) return;
				const focusLine = window.innerHeight * .48;
				const index = ecosystemSteps.reduce((closest, step, stepIndex) => {
					const bounds = step.getBoundingClientRect();
					const distance = Math.abs((bounds.top + bounds.height / 2) - focusLine);
					return distance < closest.distance ? { index: stepIndex, distance } : closest;
				}, { index: 0, distance: Infinity }).index;
				setEcosystemStage(index);
			};
			window.__skillAuraEcosystemScrollHandler = updateEcosystemStage;
			window.addEventListener('scroll', window.__skillAuraEcosystemScrollHandler, { passive: true });
			const ecosystemObserver = new IntersectionObserver(updateEcosystemStage, { threshold: .1 });
			ecosystemSteps.forEach((step) => ecosystemObserver.observe(step));
			window.__skillAuraEcosystemCleanup = () => ecosystemObserver.disconnect();
			updateEcosystemStage();
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

		function setupHomeStats(landingRoot) {
			const stats = landingRoot.querySelector('.home-stats');
			if (!stats || stats.dataset.countBound) return;
			stats.dataset.countBound = 'true';
			const items = [...stats.querySelectorAll('[data-stat-value]')];
			const render = (progress) => items.forEach((item) => {
				const value = Number(item.dataset.statValue || 0);
				const suffix = item.dataset.statSuffix || '';
				const current = Math.round(value * progress);
				item.querySelector('strong').textContent = `${current.toLocaleString()}${suffix}`;
			});
			const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			if (reducedMotion) { render(1); return; }
			const observer = new IntersectionObserver(([entry], observerInstance) => {
				if (!entry.isIntersecting) return;
				observerInstance.disconnect();
				const start = performance.now();
				const tick = (now) => {
					const progress = Math.min(1, (now - start) / 650);
					const eased = 1 - Math.pow(1 - progress, 3);
					render(eased);
					if (progress < 1) requestAnimationFrame(tick);
				};
				requestAnimationFrame(tick);
			}, { threshold: .35 });
			observer.observe(stats);
			window.__skillAuraStatsCleanup = () => observer.disconnect();
		}

		function setupLandingExperience() {
			const landingRoot = document.querySelector('.landing');
			if (!landingRoot) {
				teardownLandingExperience();
				return;
			}
			document.body.classList.add('home-page');
			enhanceHomePage(landingRoot);
			setupHomeStats(landingRoot);
			const mobileMenu = landingRoot.querySelector('.mobile-menu');
			if (mobileMenu) {
				mobileMenu.onclick = () => setMobileNavState(mobileMenu.getAttribute('aria-expanded') !== 'true');
				landingRoot.querySelectorAll('.navlinks a').forEach((link) => {
					link.onclick = () => setMobileNavState(false);
				});
			}
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
			const hero = landingRoot.querySelector('.hero');
			if (hero && !reducedMotion && window.matchMedia('(pointer: fine)').matches) {
				window.__skillAuraHeroPointerHandler = (event) => {
					const bounds = hero.getBoundingClientRect();
					const x = ((event.clientX - bounds.left) / bounds.width - .5) * 2;
					const y = ((event.clientY - bounds.top) / bounds.height - .5) * 2;
					hero.style.setProperty('--hero-pointer-x', `${(x * 8).toFixed(2)}px`);
					hero.style.setProperty('--hero-pointer-y', `${(y * 8).toFixed(2)}px`);
				};
				hero.addEventListener('pointermove', window.__skillAuraHeroPointerHandler, { passive: true });
			}
			const revealTargets = landingRoot.querySelectorAll('.hero > *, .section-heading, .section > .container > .grid-3 > *, .solution > *, .steps > *, .feature-grid > *, .cta .container, footer .footer-grid, .home-stats, .home-stats-grid > *, .home-skill-layout, .home-opportunity-grid, .home-opportunity-grid > *, .home-ecosystem-grid, .home-ecosystem-step, .home-final-cta .container');
			revealTargets.forEach((element, index) => {
				element.classList.add('reveal');
				element.style.setProperty('--reveal-delay', `${Math.min((index % 5) * .06, .24)}s`);
			});
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
			document.documentElement.dataset.theme = 'dark';
		}
		function renderFunctional() {
			const path = location.hash.slice(1) || '/';
			ensureEcosystem();
			if (path && !path.startsWith('/')) {
				if (document.querySelector('.landing')) document.getElementById(path)?.scrollIntoView();
				return;
			}
			teardownLandingExperience();
			const match = path.match(/^\/(student|tutor|company|industry|institution)\/(dashboard|profile|skills|opportunities|applications|shortlist|interviews|offers|messages|notifications|settings|candidates|analytics|partnerships|career-path|post-opportunity|programs|onboarding|assessment|skill-profile|skill-gaps|learning-recommendations|students|assessments|learning|internships|placements|industry|faculty|reports|csr-opportunities|csr-applications|csr-programs|csr-create|csr-participants|csr-analytics)$/);
			const session = currentStudentSession();
			if (path.startsWith('/employee/')) { go(path.replace('/employee/', '/student/')); return; }
			if (path === '/role-selection' && session?.loggedIn) { go(dashboardRouteForRole(session.role)); return; }
			if (path.startsWith('/student/')) {
				if (!currentStudentAccount() || !session?.loggedIn) { go('/login'); return; }
				if (!isLearnerRole(session.role)) { go(dashboardRouteForRole(session.role)); return; }
				hydrateStudentAccount(currentStudentAccount());
			}
			if (path.startsWith('/tutor/')) { if (!currentTutorAccount() || !session?.loggedIn || session.role !== 'tutor') { go('/login'); return; } }
			if (path.startsWith('/industry/')) { go(path.replace('/industry/', '/company/')); return; }
			if (path.startsWith('/company/') && !['/company/login', '/company/register'].includes(path)) {
				if (!currentCompanyAccount() || !session?.loggedIn) { go('/company/login'); return; }
				if (normalizeRole(session.role) !== 'company') { go(dashboardRouteForRole(session.role)); return; }
			}
			if (path.startsWith('/institution/') && !['/institution/login', '/institution/register'].includes(path)) {
				if (!currentInstitutionAccount() || !session?.loggedIn) { go('/institution/login'); return; }
				if (normalizeRole(session.role) !== 'institution') { go(dashboardRouteForRole(session.role)); return; }
			}
			if (path.startsWith('/tutor/')) {
				const tutorPages = { dashboard: tutorDashboardSummaryPage, courses: tutorCoursesPage, profile: tutorProfilePage, settings: () => settingsPage('tutor') };
				const tutorSection = path.split('/')[2] || 'dashboard';
				app.innerHTML = (tutorPages[tutorSection] || tutorDashboardPage)();
			}
			else if (path === '/') app.innerHTML = landing();
			else if (path === '/login' || path === '/register') app.innerHTML = authPage(path.slice(1));
			else if (path === '/company/login' || path === '/company/register') app.innerHTML = companyAuthPage(path.split('/')[2]);
			else if (path === '/company/onboarding') app.innerHTML = companyOnboardingPage();
			else if (path === '/institution/login' || path === '/institution/register') app.innerHTML = institutionAuthPage(path.split('/')[2]);
			else if (path === '/institution/onboarding') app.innerHTML = institutionOnboardingPage();
			else if (path === '/company/forgot-password') app.innerHTML = portalRecoveryPage('company');
			else if (path === '/institution/forgot-password') app.innerHTML = portalRecoveryPage('institution');
			else if (path === '/student/forgot-password') app.innerHTML = portalRecoveryPage('student');
			else if (path === '/forgot-password') app.innerHTML = portalRecoveryPage('student');
			else if (path === '/reset-password') app.innerHTML = recoveryPage(true);
			else if (path === '/role-selection') app.innerHTML = roleSelection();
			else if (path === '/student/csr-opportunities') app.innerHTML = studentCsrOpportunitiesPage();
			else if (path === '/student/csr-applications') app.innerHTML = studentCsrApplicationsPage();
			else if (path === '/company/csr-programs') app.innerHTML = companyCsrProgramsPage();
			else if (path === '/company/csr-create') app.innerHTML = companyCsrCreatePage();
			else if (path === '/company/csr-applications') app.innerHTML = companyCsrApplicationsPage();
			else if (path === '/company/csr-participants') app.innerHTML = companyCsrParticipantsPage();
			else if (path === '/company/csr-analytics') app.innerHTML = companyCsrAnalyticsPage();
			else if (match) { const [, role, section] = match; const normalizedRole = normalizeRole(role); const pages = { dashboard: normalizedRole === 'student' ? studentDashboardPage : normalizedRole === 'company' ? companyDashboardPage : institutionDashboardPage, profile: normalizedRole === 'company' ? companyProfilePage : normalizedRole === 'institution' ? institutionProfilePage : () => profilePage(normalizedRole), skills: normalizedRole === 'student' ? skillsPage : normalizedRole === 'institution' ? institutionSkillsAnalyticsPage : institutionSkillsPage, opportunities: normalizedRole === 'company' ? companyOpportunitiesPage : () => opportunitiesPage(normalizedRole), applications: normalizedRole === 'student' ? studentApplicationsPage : normalizedRole === 'company' ? companyApplicationsPage : () => applicationsPage(normalizedRole), shortlist: companyShortlistPage, interviews: normalizedRole === 'student' ? studentInterviewsPage : companyInterviewsPage, offers: studentOffersPage, messages: companyMessagesPage, notifications: normalizedRole === 'student' ? studentNotificationsPage : normalizedRole === 'institution' ? institutionNotificationsPage : companyNotificationsPage, settings: normalizedRole === 'institution' ? institutionSettingsPage : () => settingsPage(normalizedRole), 'career-path': careerPage, candidates: companyCandidatesPage, analytics: normalizedRole === 'company' ? companyAnalyticsPage : normalizedRole === 'institution' ? institutionAnalyticsPage : () => analyticsPage(normalizedRole), partnerships: normalizedRole === 'institution' ? institutionPartnershipsPage : partnershipsPage, 'post-opportunity': normalizedRole === 'company' ? companyOpportunityFormPage : postOpportunityPage, programs: programsPage, onboarding: normalizedRole === 'company' ? companyOnboardingPage : normalizedRole === 'institution' ? institutionOnboardingPage : onboardingPage, assessment: normalizedRole === 'student' ? assessmentPage : institutionAssessmentsPage, 'skill-profile': skillProfilePage, 'skill-gaps': normalizedRole === 'institution' ? institutionSkillGapsPage : skillGapsPage, 'learning-recommendations': learningRecommendationsPage, students: institutionStudentsPage, assessments: institutionAssessmentsPage, learning: institutionLearningPage, internships: normalizedRole === 'student' ? studentInternshipsPage : institutionInternshipsPage, placements: normalizedRole === 'student' ? studentPlacementsPage : institutionPlacementsPage, industry: institutionIndustryPage, faculty: institutionFacultyPage, reports: institutionReportsPage }; app.innerHTML = pages[section] ? pages[section]() : notFound(); }
			else app.innerHTML = notFound();
			if (path === '/student/dashboard' || path === '/student/skill-profile') upgradeSkillCards();
			if (path === '/tutor/dashboard') {
				app.querySelector('.dash-content')?.insertAdjacentHTML('beforeend', tutorExamManagementMarkup());
				addTutorTakeExamButton();
			}
			if (path === '/login' || path === '/register') {
				const backLink = app.querySelector('.form-wrap > .btn-plain');
				if (backLink) { backLink.href = '#/'; backLink.textContent = '← Back to home'; }
				const submit = app.querySelector('form[data-form="register"] button[type="submit"]');
				if (submit) submit.textContent = 'Create Account';
			}
			if (path === '/student/dashboard') {
				document.querySelector('.dash-content')?.insertAdjacentHTML('beforeend', '<button class="btn btn-primary" data-action="start-assignment" style="margin:0 0 18px">Start Assignment</button>');
				document.querySelector('.dash-content')?.insertAdjacentHTML('beforeend', mockInterviewDashboardMarkup());
			}
			if (path === '/company/dashboard') document.querySelector('.dash-content')?.insertAdjacentHTML('beforeend', csrCompanyDashboardMarkup());
			bindFunctionalEvents();
			setupGlobalBackground();
			setupSparkCursor();
			setupLandingExperience();
			setupPageMotion();
			bindThemeToggle();
			initChatbot();
		}
		window.removeEventListener('hashchange', render);
		window.addEventListener('hashchange', renderFunctional);
		initializeDemoAccounts();
		renderFunctional();
