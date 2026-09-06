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
		const AI_API_ENDPOINT = '';
		const THEME_KEY = 'skillbridge-theme';
		let selectedTheme = loadThemePreference();
		document.documentElement.dataset.theme = selectedTheme;
		let chatbotState = {
			lastOpportunity: null,
			pendingApplication: null
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
			return `<a class="brand" href="#/"><span class="brand-mark">↗</span>SkillBridge</a>`;
		}

		function landing() {
			return `<div class="landing"><nav class="navbar container">${brand()}<div class="navlinks" id="navlinks"><a href="#/">Home</a><a href="#how">How It Works</a><a href="#roles">For Students</a><a href="#roles">For Industry</a><a href="#roles">For Institutions</a><a href="#about">About</a></div><div class="nav-actions"><a href="#/login">Login</a>${themeToggleMarkup()}<a class="btn btn-primary" href="#/role-selection">Get Started</a><button class="mobile-menu" onclick="document.getElementById('navlinks').classList.toggle('open')">☰</button></div></nav>
			<section class="hero"><div class="container hero-copy"><div class="eyebrow">The collaboration layer for tomorrow's careers</div><div class="hero-wordmark" aria-label="SkillBridge">Skill<span>Bridge</span></div><h1>Connecting Skills, Academia <span>&amp; Industry</span></h1><p>Bridge the gap from learning to impact through verified skills, personalized career guidance, internships, jobs, and industry collaboration.</p><div class="hero-actions"><a class="btn btn-primary" href="#/role-selection">Get Started ↗</a><a class="btn btn-light" href="#how">Explore Platform ↓</a></div></div><div class="ecosystem"><div class="ecosystem-label"><span>SkillBridge ecosystem</span><span>01 — 05</span></div><div class="flow"><div class="flow-item"><i>♙</i>Student</div><div class="flow-arrow">↓</div><div class="flow-item"><i>✦</i>Skills &amp; Verification</div><div class="flow-arrow">↓</div><div class="flow-item"><i>◈</i>Industry Opportunity</div><div class="flow-arrow">↓</div><div class="flow-item"><i>◎</i>Career Growth</div></div></div></section>
			<section class="section" id="about"><div class="container"><div class="section-heading"><div class="eyebrow">Why SkillBridge</div><h2>The Skill Gap Problem</h2><p>Talent is everywhere. The right connections and signals are not.</p></div><div class="grid-3"><div class="card problem-card"><div class="icon-box">♙</div><h3>Students</h3><p>Clarity is hard to find when the path from classroom to career is fragmented.</p><ul class="checklist"><li>Know which skills matter</li><li>Find relevant internships</li></ul></div><div class="card problem-card"><div class="icon-box">▤</div><h3>Industry</h3><p>Recruiters need better signals to find capable, motivated early talent.</p><ul class="checklist"><li>Reach suitable candidates</li><li>Identify genuine competencies</li></ul></div><div class="card problem-card"><div class="icon-box">⌂</div><h3>Institutions</h3><p>Colleges need a clear view of readiness, outcomes, and industry demand.</p><ul class="checklist"><li>Track skill development</li><li>Build industry partnerships</li></ul></div></div></div></section>
			<section class="section soft"><div class="container solution"><div><div class="eyebrow">A connected journey</div><h2>One Platform. Multiple Stakeholders.</h2><p class="solution-copy">From the first assessment to the first opportunity, SkillBridge gives every stakeholder a shared view of progress and potential.</p><a class="btn btn-primary" href="#/role-selection" style="margin-top:25px">Choose your workspace ↗</a></div><div class="card stack"><div class="stack-row"><span class="step-num">01</span>Student profile</div><div class="stack-row"><span class="step-num">02</span>Skill assessment</div><div class="stack-row"><span class="step-num">03</span>Verified profile</div><div class="stack-row"><span class="step-num">04</span>Learning &amp; career guidance</div><div class="stack-row"><span class="step-num">05</span>Internship / job matching</div><div class="stack-row"><span class="step-num">06</span>Industry collaboration ↕</div></div></div></section>
			<section class="section" id="how"><div class="container"><div class="section-heading"><div class="eyebrow">Simple by design</div><h2>How It Works</h2></div><div class="steps">${[['01','Create Your Profile','Role-based profiles for every stakeholder.'],['02','Discover Opportunities','Explore skills, programs, and real opportunities.'],['03','Verify & Improve','Build confidence through assessments and learning.'],['04','Connect','Meet mentors, teams, institutions, and employers.'],['05','Track Progress','See development, applications, and outcomes.']].map(x=>`<div class="step"><strong>${x[0]}</strong><h3>${x[1]}</h3><p>${x[2]}</p></div>`).join('')}</div></div></section>
			<section class="section soft" id="roles"><div class="container"><div class="section-heading"><div class="eyebrow">One ecosystem</div><h2>Built for the Entire Academia–Industry Ecosystem</h2></div><div class="grid-3"><div class="card role-card student"><div class="icon-box">♙</div><h3>Student</h3><p>Find internships, jobs, learning programs, and career guidance.</p><a class="btn btn-light" href="#/role-selection">Explore as Student →</a></div><div class="card role-card industry"><div class="icon-box">▤</div><h3>Industry</h3><p>Find skilled candidates and collaborate with institutions.</p><a class="btn btn-light" href="#/role-selection">Explore as Industry →</a></div><div class="card role-card institution"><div class="icon-box">⌂</div><h3>Institution</h3><p>Monitor student readiness and build industry partnerships.</p><a class="btn btn-light" href="#/role-selection">Explore as Institution →</a></div></div></div></section>
			<section class="section"><div class="container"><div class="section-heading"><div class="eyebrow">Coming together</div><h2>Preview the Platform</h2></div><div class="feature-grid">${['Skill Assessment','Verified Skills','Career Guidance','Internship & Job Matching','Industry Learning Programs','Institution Analytics'].map((x,i)=>`<div class="feature"><div class="icon-box">${['✦','✓','◎','▣','◈','▥'][i]}</div><strong>${x}</strong></div>`).join('')}</div></div></section><section class="cta"><div class="container"><h2>Build a Stronger Bridge Between Education and Industry</h2><p>From learning new skills to finding the right opportunity, SkillBridge brings the complete journey into one platform.</p><a class="btn btn-primary" href="#/role-selection">Get Started ↗</a></div></section><footer><div class="container"><div class="footer-grid"><div>${brand()}<p style="margin-top:14px">Connecting Skills, Academia &amp; Industry.</p></div><div><h4>Platform</h4><a href="#/role-selection">Students</a><a href="#/role-selection">Industry</a><a href="#/role-selection">Institutions</a><a href="#/role-selection">Opportunities</a></div><div><h4>Company</h4><a href="#about">About</a><a href="#">Contact</a><a href="#">Privacy</a><a href="#">Terms</a></div><div><h4>Social</h4><p>LinkedIn · X · Instagram</p></div></div><div class="copyright">© 2026 SkillBridge. All rights reserved.</div></div></footer></div>`
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
			return `<div class="auth"><aside class="auth-aside">${brand()}<div><div class="eyebrow" style="color:var(--cyan)">Connecting Skills, Academia &amp; Industry</div><h1>${register?'Start building your bridge.':'Your next opportunity starts here.'}</h1><p>${register?'Create a role-based workspace designed for the journey from learning to impact.':'One clear view of your skills, opportunities, and the people helping you move forward.'}</p></div><div class="auth-note">Day 1 prototype · Demo access available</div></aside><main class="auth-main"><div class="form-wrap"><a class="btn-plain" href="#/">← Back to home</a><h2 style="margin-top:27px">${register?'Create your account':'Welcome back'}</h2><p>${register?'Set up your SkillBridge workspace in a few seconds.':'Enter your details or jump straight into a demo workspace.'}</p><div class="form">${register?`<label>Full Name</label><input placeholder="Your full name"><label>Email</label><input type="email" placeholder="you@example.com"><label>Password</label><input type="password" placeholder="••••••••"><label>Confirm Password</label><input type="password" placeholder="••••••••"><label>Institution / Organization</label><input placeholder="Your institution or organization"><label>Role</label><select onchange="updateRoleFields(this.value)"><option>Student</option><option>Industry</option><option>Institution</option></select><div id="role-fields"></div><button class="btn btn-primary" onclick="location.hash='/role-selection'">Create Account</button>`:`<label>Email</label><input type="email" placeholder="you@example.com"><label>Password</label><input type="password" placeholder="••••••••"><div class="form-row"><label><input type="checkbox"> Remember me</label><a href="#" class="btn-plain">Forgot password?</a></div><button class="btn btn-primary" onclick="location.hash='/role-selection'">Login</button><div class="divider">or continue as demo</div><div class="demo-grid"><button class="demo-btn" onclick="location.hash='/student/dashboard'">Demo Student</button><button class="demo-btn" onclick="location.hash='/industry/dashboard'">Demo Industry</button><button class="demo-btn" onclick="location.hash='/institution/dashboard'">Demo Institution</button></div>`}</div><div class="switch">${register?'Already have an account?':'Don\'t have an account?'} <a href="#/${register?'login':'register'}">${register?'Login':'Create one'}</a></div></div></main></div>`
		}

		function roleSelection() {
			return `<div class="role-page"><div class="container role-top">${brand()}</div><div class="role-select"><div class="eyebrow">Choose your perspective</div><h1>Choose Your Workspace</h1><p>Select how you want to use SkillBridge.</p><div class="role-options"><div class="role-option"><div class="icon-box">♙</div><h2>Student</h2><p>Build your skill profile, discover opportunities, and prepare for your career.</p><a class="btn btn-primary" href="#/student/dashboard">Continue as Student →</a></div><div class="role-option"><div class="icon-box">▤</div><h2>Industry</h2><p>Discover suitable candidates, post opportunities, and collaborate with academia.</p><a class="btn btn-primary" href="#/industry/dashboard">Continue as Industry →</a></div><div class="role-option"><div class="icon-box">⌂</div><h2>Institution</h2><p>Track student readiness, internships, placement progress, and collaboration.</p><a class="btn btn-primary" href="#/institution/dashboard">Continue as Institution →</a></div></div></div></div>`
		}
		const dashboardRoutes = {
			student: {
				dashboard: 'Dashboard',
				profile: 'My Profile',
				skills: 'My Skills',
				opportunities: 'Opportunities',
				applications: 'Applications',
				settings: 'Settings',
				'career-path': 'Career Path'
			},
			industry: {
				dashboard: 'Dashboard',
				profile: 'Company Profile',
				opportunities: 'Opportunities',
				candidates: 'Candidates',
				analytics: 'Analytics',
				applications: 'Applications',
				programs: 'Industry Programs',
				'post-opportunity': 'Post Opportunity',
				settings: 'Settings'
			},
			institution: {
				dashboard: 'Dashboard',
				profile: 'Institution Profile',
				skills: 'Student Skills',
				analytics: 'Analytics',
				partnerships: 'Partnerships',
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
			return `<button class="ai-launcher" type="button" aria-label="Open SkillBridge AI Assistant" aria-expanded="false">
				<span class="ai-launcher-icon">✦</span>
				<span class="ai-launcher-label">SkillBridge AI</span>
			</button>
			<div class="ai-panel" aria-hidden="true">
				<div class="ai-header">
					<div class="ai-title-wrap">
						<div class="ai-avatar">✦</div>
						<div>
							<strong>SkillBridge AI Assistant</strong>
							<span>Ready to help with your career journey</span>
						</div>
					</div>
					<button class="ai-close" type="button" aria-label="Minimize assistant">−</button>
				</div>
				<div class="ai-messages" aria-live="polite"></div>
				<div class="ai-suggestions">
					<button type="button" data-prompt="Find me a software developer internship">Software internships</button>
					<button type="button" data-prompt="Show my skill gaps">My skill gaps</button>
					<button type="button" data-prompt="Open my career path">Career path</button>
				</div>
				<form class="ai-form">
					<input class="ai-input" type="text" placeholder="Ask about skills, jobs, or careers..." aria-label="Ask SkillBridge AI Assistant" autocomplete="off">
					<button class="ai-send" type="submit" aria-label="Send message">↗</button>
				</form>
			</div>`;
		}

		function currentRole() {
			const match = location.hash.match(/^#\/(student|industry|institution)\//);
			return match?.[1] || 'student';
		}

		function currentPage() {
			return location.hash.slice(1) || '/';
		}

		function chatbotContext() {
			return {
				role: currentRole(),
				currentPage: currentPage(),
				student: data.student,
				skills: data.skills,
				skillGaps: data.gaps,
				careers: data.careers,
				opportunities: data.opportunities,
				company: data.company,
				candidates: data.candidates,
				actions: [
					'OPEN_DASHBOARD', 'OPEN_SKILLS', 'OPEN_OPPORTUNITIES', 'OPEN_APPLICATIONS',
					'OPEN_CAREER', 'OPEN_COMPANY', 'OPEN_OPPORTUNITY', 'SHOW_SKILL_GAPS',
					'START_ASSESSMENT', 'APPLY_TO_OPPORTUNITY'
				]
			};
		}

		async function askAI(message, context) {
			if (!AI_API_ENDPOINT) return null;

			const response = await fetch(AI_API_ENDPOINT, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ message, context })
			});

			if (!response.ok) throw new Error('AI service unavailable');
			return response.json();
		}

		function findOpportunities(message) {
			const query = message.toLowerCase();
			const terms = ['python', 'javascript', 'react', 'git', 'sql', 'frontend', 'backend', 'software developer', 'data analyst'];
			const matches = data.opportunities.filter((opportunity) => {
				const searchable = opportunity.join(' ').toLowerCase();
				return terms.some((term) => query.includes(term) && searchable.includes(term));
			});
			return matches.length ? matches : data.opportunities;
		}

		function findOpportunity(message) {
			const query = message.toLowerCase();
			return data.opportunities.find((opportunity) => {
				const searchable = opportunity.join(' ').toLowerCase();
				return searchable.includes('technova') && query.includes('technova') ||
					searchable.includes('software developer') && query.includes('software developer') ||
					searchable.includes('frontend') && query.includes('frontend');
			}) || chatbotState.lastOpportunity || data.opportunities[0];
		}

		function chatbotResultCard(opportunity) {
			const [name, company, location, skills, match] = opportunity;
			return `<div class="ai-result-card">
				<div class="ai-result-top"><span class="tag success">${match} match</span><span>${location}</span></div>
				<strong>${name}</strong>
				<span class="ai-result-company">${company}</span>
				<span class="ai-result-skills">Required skills: ${skills}</span>
				<div class="ai-result-actions">
					<button type="button" data-chat-action="OPEN_OPPORTUNITY" data-opportunity="${name}">View Opportunity</button>
					<button type="button" class="primary" data-chat-action="APPLY_TO_OPPORTUNITY" data-opportunity="${name}">Apply</button>
				</div>
			</div>`;
		}

		function chatbotSkillCards() {
			return `<div class="ai-skill-list">${data.skills.map(([name, score, status]) =>
				`<div class="ai-skill-row"><span>${name}</span><span><b>${score}%</b> <em class="${status === 'Verified' ? 'verified' : 'improve'}">${status}</em></span></div>`
			).join('')}</div>`;
		}

		function chatbotResponse(message) {
			const query = message.toLowerCase().trim();
			const wantsApply = /\bapply|application\b/.test(query);
			const wantsCompany = /company|technova|industry/.test(query);
			const wantsSkills = /skills|skill gap|ready for/.test(query);
			const wantsCareer = /career path|career guidance|career/.test(query);
			const wantsApplications = /my applications|show applications|applications/.test(query);
			const wantsAssessment = /assessment|assess my skills|take.*assessment/.test(query);
			const wantsOpportunity = /internship|opportunit|job|developer|frontend|backend|python|sql|react/.test(query);

			if (/^(yes|yeah|confirm|go ahead|apply now)$/.test(query) && chatbotState.pendingApplication) {
				const opportunity = chatbotState.pendingApplication;
				chatbotState.pendingApplication = null;
				addApplication(opportunity[0]);
				return {
					text: `Your application request for ${opportunity[0]} at ${opportunity[1]} is ready. I'll open your Applications workspace now.`,
					action: { type: 'OPEN_APPLICATIONS' }
				};
			}

			if (wantsApply) {
				const opportunity = findOpportunity(message);
				chatbotState.lastOpportunity = opportunity;
				chatbotState.pendingApplication = opportunity;
				return {
					text: `I found ${opportunity[0]} at ${opportunity[1]}. Would you like to continue to the application workspace?`,
					cards: chatbotResultCard(opportunity),
					confirm: true
				};
			}

			if (wantsCompany) {
				const opportunity = findOpportunity(message);
				chatbotState.lastOpportunity = opportunity;
				return {
					text: `${opportunity[1]} is connected to ${opportunity[0]}. I'll open the relevant industry opportunity page.`,
					cards: chatbotResultCard(opportunity),
					action: { type: 'OPEN_COMPANY', opportunity }
				};
			}

			if (wantsApplications) {
				return { text: 'Here is your Applications workspace.', action: { type: 'OPEN_APPLICATIONS' } };
			}

			if (wantsAssessment) {
				return { text: 'I will open the skills workspace so you can begin your assessment.', action: { type: 'START_ASSESSMENT' } };
			}

			if (wantsCareer) {
				return { text: 'Here is your personalized Career Path.', action: { type: 'OPEN_CAREER' } };
			}

			if (wantsSkills) {
				if (chatbotState.lastOpportunity) {
					const [name, company, location, skills, match] = chatbotState.lastOpportunity;
					return {
						text: `${name} at ${company} requires ${skills}. Your current match is ${match}.`,
						cards: chatbotResultCard(chatbotState.lastOpportunity)
					};
				}
				return {
					text: 'Your current skill profile shows the verified skills below. SQL is your clearest improvement area, along with the gaps shown on your skills page.',
					cards: chatbotSkillCards(),
					action: { type: 'SHOW_SKILL_GAPS' }
				};
			}

			if (wantsOpportunity) {
				const opportunities = findOpportunities(message);
				chatbotState.lastOpportunity = opportunities[0];
				const opportunityLabel = opportunities.length === 1 ? 'opportunity' : 'opportunities';
				return {
					text: `I found ${opportunities.length} matching ${opportunityLabel} for you.`,
					cards: opportunities.map(chatbotResultCard).join('')
				};
			}

			if (/dashboard|home|workspace/.test(query)) {
				return { text: 'Opening your dashboard.', action: { type: 'OPEN_DASHBOARD' } };
			}

			return {
				text: 'I can help you find opportunities, review your skills and gaps, open your career path, view applications, or start an assessment. Try “Find Python internships”.'
			};
		}

		function chatbotNavigate(type, opportunity) {
			const role = currentRole();
			const routes = {
				OPEN_DASHBOARD: `/${role}/dashboard`,
				OPEN_SKILLS: `/${role}/skills`,
				OPEN_OPPORTUNITIES: `/${role}/opportunities`,
				OPEN_APPLICATIONS: `/${role}/applications`,
				OPEN_CAREER: `/${role}/career-path`,
				OPEN_COMPANY: `/${role}/opportunities`,
				OPEN_OPPORTUNITY: `/${role}/opportunities`,
				SHOW_SKILL_GAPS: `/${role}/skills`,
				START_ASSESSMENT: `/${role}/skills`
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
			const messages = assistant.querySelector('.ai-messages');
			const form = assistant.querySelector('.ai-form');
			const input = assistant.querySelector('.ai-input');

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
					addMessage('Hi! I am your SkillBridge AI Assistant. I can help you explore opportunities, understand your skills, and navigate your workspace.');
				}
			};

			const handleMessage = async (message) => {
				const cleanMessage = message.trim();
				if (!cleanMessage) return;

				addMessage(cleanMessage, 'user');
				input.value = '';
				const typing = document.createElement('div');
				typing.className = 'ai-typing';
				typing.textContent = 'SkillBridge AI is thinking...';
				messages.append(typing);
				messages.scrollTop = messages.scrollHeight;

				let response;
				try {
					response = await askAI(cleanMessage, chatbotContext()) || chatbotResponse(cleanMessage);
				} catch (error) {
					response = chatbotResponse(cleanMessage);
				}
				typing.remove();
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
			return `<div class="role-page"><div class="role-top container">${brand()}</div><div class="placeholder"><div class="placeholder-card"><div class="icon-box">?</div><h1>404 / Page Not Found</h1><p>That route is not part of the current SkillBridge prototype.</p><a class="btn btn-primary" href="#/">Return Home</a></div></div></div>`
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
		render();

		/* Functional prototype layer: keeps the original visual shell and hash routes. */
		const STATE_KEY = 'skillbridge-prototype-state';
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
			notifications: [{ id: 'seed-n1', text: 'Welcome to your SkillBridge workspace.', read: false, time: 'Today' }],
			settings: { emailUpdates: true, profileVisibility: true, compactView: false },
			assessments: [],
			activeRole: null,
			assessment: null
		};
		let state = loadState();
		const STUDENT_ACCOUNTS_KEY = 'skillbridge_students';
		const LEGACY_STUDENT_ACCOUNTS_KEY = 'skillbridge_student_accounts';
		const CURRENT_USER_KEY = 'skillbridge_current_user';
		const RESET_CANDIDATE_KEY = 'skillbridge_reset_candidate';
		const ASSESSMENT_QUESTIONS = {
			Python: [
				['Which keyword defines a function?', ['function', 'def', 'func', 'define'], 1], ['Which collection is mutable?', ['tuple', 'string', 'list', 'frozenset'], 2], ['What does len([1, 2, 3]) return?', ['2', '3', '4', 'Error'], 1], ['Which symbol begins a comment?', ['//', '#', '<!--', '--'], 1], ['Which value represents no value?', ['void', 'null', 'None', 'nil'], 2], ['Which loop iterates over items?', ['for', 'switch', 'case', 'goto'], 0], ['Which operator is exponentiation?', ['^', '**', '//', '%%'], 1], ['What opens a file for reading?', ["open('a', 'r')", "read('a')", "file('a')", "load('a')"], 0], ['Which creates a dictionary?', ['[]', '{}', '()', '<>'], 1], ['Which keyword handles exceptions?', ['catch', 'except', 'error', 'rescue'], 1]
			],
			Java: [
				['Which method starts a Java program?', ['start()', 'main()', 'run()', 'init()'], 1], ['Which keyword creates an object?', ['make', 'new', 'class', 'this'], 1], ['Java source compiles to?', ['Machine code', 'Bytecode', 'Python', 'HTML'], 1], ['Which type stores true/false?', ['bool', 'Boolean/boolean', 'bit', 'flag'], 1], ['Which keyword inherits a class?', ['implements', 'extends', 'inherits', 'parent'], 1], ['Which collection allows duplicates?', ['Set', 'List', 'Map keys', 'Enum'], 1], ['Which is checked at compile time?', ['Syntax error', 'Network error', 'Server error', 'User error'], 0], ['Which keyword makes a constant?', ['fixed', 'const', 'final', 'static'], 2], ['Which package contains ArrayList?', ['java.util', 'java.io', 'java.net', 'java.sql'], 0], ['Which operator compares primitives?', ['equals()', '==', '===', 'compareTo()'], 1]
			],
			JavaScript: [
				['Which keyword declares a block-scoped variable?', ['var', 'let', 'global', 'define'], 1], ['Which method turns JSON text into an object?', ['JSON.stringify', 'JSON.parse', 'JSON.object', 'JSON.read'], 1], ['Which operator checks value and type?', ['==', '===', '=', '!='], 1], ['Which creates an array?', ['{}', '[]', '()', '<>'], 1], ['Which function schedules later work?', ['setTimeout', 'wait', 'delay', 'pause'], 0], ['What does DOM stand for?', ['Data Object Model', 'Document Object Model', 'Digital Output Map', 'Document Order Method'], 1], ['Which loops through array values?', ['for...of', 'for...in only', 'switch', 'try'], 0], ['Which keyword declares an immutable binding?', ['var', 'let', 'const', 'static'], 2], ['Which method adds an item to an array end?', ['pop', 'push', 'shift', 'slice'], 1], ['Which event fires on a button click?', ['change', 'click', 'load', 'submit only'], 1]
			],
			C: [
				['Which function is the C entry point?', ['start', 'main', 'init', 'program'], 1], ['Which header provides printf?', ['stdlib.h', 'stdio.h', 'string.h', 'math.h'], 1], ['Which format specifier prints an int?', ['%s', '%d', '%f', '%c'], 1], ['Which operator gets an address?', ['*', '&', '->', '#'], 1], ['Which statement exits a loop?', ['skip', 'break', 'return only', 'stop'], 1], ['Which type stores a character?', ['char', 'text', 'string', 'letter'], 0], ['Which allocates dynamic memory?', ['malloc', 'alloc', 'new', 'create'], 0], ['Which symbol ends a statement?', [':', ';', '.', ','], 1], ['Which loop runs while a condition is true?', ['while', 'case', 'if', 'switch'], 0], ['Which value indicates a null pointer?', ['void', 'NULL', 'none', '-1 always'], 1]
			],
			'C++': [
				['Which feature enables data hiding?', ['Encapsulation', 'Compilation', 'Linking', 'Casting'], 0], ['Which stream prints to console?', ['cin', 'cout', 'cerr only', 'print'], 1], ['Which creates an object dynamically?', ['malloc only', 'new', 'make', 'create'], 1], ['Which keyword defines a class?', ['object', 'class', 'struct only', 'type'], 1], ['Which destructor prefix is used?', ['!', '~', '#', '&'], 1], ['Which keyword supports inheritance?', ['extends', 'inherits', ': public', 'parent'], 2], ['Which container is a dynamic array?', ['vector', 'stack', 'queue', 'set'], 0], ['Which header supports cout?', ['<stdio.h>', '<iostream>', '<vector.h>', '<print>'], 1], ['Which function is a class constructor?', ['~Class', 'Class()', 'new Class', 'init()'], 1], ['Which keyword prevents override?', ['static', 'final', 'const', 'private'], 1]
			],
			SQL: [
				['Which statement reads data?', ['GET', 'SELECT', 'READ', 'FETCH ALL'], 1], ['Which clause filters rows?', ['WHERE', 'ORDER', 'GROUP', 'FROM'], 0], ['Which keyword adds rows?', ['INSERT', 'ADD', 'CREATE', 'PUSH'], 0], ['Which command changes existing rows?', ['CHANGE', 'UPDATE', 'ALTER', 'MODIFY'], 1], ['Which removes rows?', ['DELETE', 'DROP', 'REMOVE', 'CLEAR'], 0], ['Which joins matching tables?', ['MERGE', 'JOIN', 'LINK', 'UNION only'], 1], ['Which function counts rows?', ['SUM', 'COUNT', 'TOTAL', 'NUMBER'], 1], ['Which clause groups results?', ['GROUP BY', 'ORDER BY', 'HAVING only', 'FROM'], 0], ['Which key uniquely identifies a row?', ['Foreign key', 'Primary key', 'Index only', 'View'], 1], ['Which keyword sorts results?', ['SORT', 'ORDER BY', 'RANK', 'ARRANGE'], 1]
			],
			HTML: [
				['Which tag creates a link?', ['<a>', '<link>', '<href>', '<url>'], 0], ['Which tag is the main page heading?', ['<h1>', '<head>', '<title>', '<header>'], 0], ['Which attribute supplies image text?', ['src', 'alt', 'title only', 'href'], 1], ['Which tag creates a paragraph?', ['<p>', '<para>', '<text>', '<article>'], 0], ['Which tag groups navigation?', ['<nav>', '<menu>', '<links>', '<navigate>'], 0], ['Which tag creates a form?', ['<input>', '<form>', '<fieldset only>', '<data>'], 1], ['Which tag displays an image?', ['<picture only>', '<img>', '<image>', '<src>'], 1], ['Which semantic tag holds primary content?', ['<main>', '<body>', '<div>', '<section only>'], 0], ['Which tag makes a list item?', ['<li>', '<ul>', '<ol>', '<item>'], 0], ['Which doctype declares HTML5?', ['<!HTML>', '<!DOCTYPE html>', '<html5>', '<!doctype web>'], 1]
			],
			CSS: [
				['Which property changes text color?', ['font-color', 'color', 'text-color', 'foreground'], 1], ['Which selector targets a class?', ['#name', '.name', 'name()', '@name'], 1], ['Which property creates a flex layout?', ['display: flex', 'flex: display', 'layout: flex', 'position: flex'], 0], ['Which unit is relative to root font size?', ['px', 'em', 'rem', 'vh'], 2], ['Which property adds inside spacing?', ['margin', 'padding', 'gap only', 'border'], 1], ['Which pseudo-class targets hover?', [':focus', ':hover', '::before', ':active only'], 1], ['Which property rounds corners?', ['border-radius', 'corner', 'radius', 'round'], 0], ['Which property controls stacking order?', ['z-index', 'layer', 'stack', 'order'], 0], ['Which media feature supports responsive width?', ['@screen', '@media', '@responsive', '@breakpoint'], 1], ['Which property centers grid content?', ['align-items', 'justify-content', 'place-items', 'all of these only'], 2]
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
		function currentStudentSession() { try { return JSON.parse(localStorage.getItem(CURRENT_USER_KEY)); } catch (error) { return null; } }
		function currentStudentAccount() { const session = currentStudentSession(); return session ? loadStudentAccounts().find((account) => account.id === session.id) : null; }
		function clearStudentSession() { try { localStorage.removeItem(CURRENT_USER_KEY); } catch (error) { } }
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
			state.activeRole = 'student';
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
		function startStudentSession(account) {
			try { localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ id: account.id, email: account.email })); } catch (error) { }
			delete state.assessmentSession;
			delete state.assessmentResult;
			hydrateStudentAccount(account);
			saveState();
		}
		function isValidEmail(email) { return /^\S+@\S+\.\S+$/.test(email || ''); }

		function clone(value) { return JSON.parse(JSON.stringify(value)); }
		function loadState() {
			try {
				const saved = JSON.parse(localStorage.getItem(STATE_KEY));
				return saved ? { ...clone(defaultState), ...saved, student: { ...defaultState.student, ...saved.student }, company: { ...defaultState.company, ...saved.company }, institution: { ...defaultState.institution, ...saved.institution }, settings: { ...defaultState.settings, ...saved.settings } } : clone(defaultState);
			} catch (error) { return clone(defaultState); }
		}
		function saveState() {
			try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch (error) { showToast('Changes could not be saved in this browser.'); }
			persistCurrentStudentWorkspace();
		}
		function notify(text) {
			state.notifications.unshift({ id: `n-${Date.now()}`, text, read: false, time: 'Just now' });
			saveState();
		}
		function roleLabel(role) { return role[0].toUpperCase() + role.slice(1); }
		function personFor(role) { return state[role === 'student' ? 'student' : role === 'industry' ? 'company' : 'institution']; }
		function esc(value) { return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char])); }
		function go(route) { location.hash = route.startsWith('#') ? route : `#${route}`; }
		function opportunityByTitle(title) { return state.opportunities.find((item) => item.title === title); }
		function appFor(title) { return state.applications.find((item) => item.opportunity === title); }
		function addApplication(title) {
			const opportunity = opportunityByTitle(title);
			if (!opportunity) return showToast('That opportunity is no longer available.');
			if (appFor(title)) return showToast('You have already applied to this opportunity.');
			state.applications.unshift({ id: `a-${Date.now()}`, opportunity: title, company: opportunity.company, status: 'Applied', applied: new Date().toISOString().slice(0, 10) });
			notify(`Application submitted for ${title}.`);
			saveState();
			showToast('Application submitted successfully.');
			renderFunctional();
		}

		function functionalSidebar(role) {
			const current = location.hash.slice(1).split('/')[2] || 'dashboard';
			return `<aside class="sidebar" id="sidebar"><div class="side-brand">${brand()}</div><nav class="side-nav">${Object.entries(dashboardRoutes[role]).map(([key, label]) => `<a class="${key === current ? 'active' : ''}" href="#/${role}/${key}" onclick="closeSidebar()">${icons[key] || '◉'} ${label}</a>`).join('')}</nav><div class="side-spacer"></div><button class="logout" data-action="logout">↪ &nbsp; Logout</button></aside>`;
		}
		function shell(role, title, content) {
			const person = personFor(role);
			const unread = state.notifications.filter((item) => !item.read).length;
			return `<div class="app">${functionalSidebar(role)}<main class="main"><header class="topbar"><div style="display:flex;align-items:center"><button class="mobile-dash-menu hidden" data-action="toggle-sidebar">☰</button><h2>${esc(title)}</h2></div><div class="topbar-right"><button class="search" data-action="focus-search">⌕ &nbsp; Search anything</button>${themeToggleMarkup()}<button class="notification-button" data-action="notifications" aria-label="Notifications">◌${unread ? `<sup>${unread}</sup>` : ''}</button><div class="avatar">${esc(person.initials)}</div><div class="user-meta">${esc(person.name)}<span>${roleLabel(role)}</span></div></div></header><div class="dash-content">${content}</div></main></div>`;
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
		function opportunitiesPage(role) {
			const canManage = role === 'industry';
			return shell(role, 'Opportunities', `${pageIntro('Opportunities', role === 'student' ? 'Find a practical next step for your career.' : 'Manage opportunities published by your company.', canManage ? '<button class="btn btn-primary" data-action="route" data-route="/industry/post-opportunity">＋ Post Opportunity</button>' : '')}${searchBox('Search title, company, skill, or location')}<div class="dash-panel" style="margin-top:18px"><div id="filtered-results" class="opportunity-list">${state.opportunities.map((item) => `<div class="opportunity-card" data-searchable="${esc(`${item.title} ${item.company} ${item.location} ${item.skills}`)}"><div><span class="tag blue">${esc(item.type)}</span><h3>${esc(item.title)}</h3><p>${esc(item.company)} · ${esc(item.location)} · ${esc(item.duration)}</p><small>${esc(item.skills)} · Deadline ${esc(item.deadline)}</small></div><div class="card-actions"><button class="btn btn-light" data-action="view-opportunity" data-title="${esc(item.title)}">View details</button>${canManage ? `<button class="btn-plain" data-action="delete-opportunity" data-title="${esc(item.title)}">Delete</button>` : `<button class="btn btn-primary" data-action="apply" data-title="${esc(item.title)}">${appFor(item.title) ? 'Applied' : 'Apply'}</button>`}</div></div>`).join('')}</div></div>`);
		}
		function detailModal(opportunity) { return `<div class="modal-backdrop" data-action="close-modal"><div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="opportunity-title" onclick="event.stopPropagation()"><button class="modal-close" data-action="close-modal" aria-label="Close opportunity details">×</button><span class="tag blue">${esc(opportunity.type)}</span><h2 id="opportunity-title">${esc(opportunity.title)}</h2><p>${esc(opportunity.company)} · ${esc(opportunity.location)}</p><p>${esc(opportunity.description)}</p><p><b>Required skills:</b> ${esc(opportunity.skills)}<br><b>Duration:</b> ${esc(opportunity.duration)}<br><b>Eligibility:</b> ${esc(opportunity.eligibility || 'Students with relevant foundational skills')}<br><b>Deadline:</b> ${esc(opportunity.deadline)}</p><button class="btn btn-primary" data-action="apply" data-title="${esc(opportunity.title)}" ${appFor(opportunity.title) ? 'disabled' : ''}>${appFor(opportunity.title) ? 'Already applied' : 'Apply now'}</button></div></div>`; }
		function skillsPage() { const { assessments, average } = assessmentStats(); return shell('student', 'My Skills', `${pageIntro('My Skills', 'Take a language assessment and build a real skill profile.', '<button class="btn btn-primary" data-action="route" data-route="/student/assessment">＋ Add Skill Assessment</button>')}<div class="kpis assessment-kpis"><div class="kpi"><div class="kpi-top"><span>Skills Assessed</span></div><div class="kpi-value">${assessments.length}</div></div><div class="kpi"><div class="kpi-top"><span>Assessments Completed</span></div><div class="kpi-value">${assessments.length}</div></div><div class="kpi"><div class="kpi-top"><span>Average Score</span></div><div class="kpi-value">${average}%</div></div></div><section class="dash-panel"><div class="panel-head"><h3>Assessment History</h3><button class="btn-plain" data-action="route" data-route="/student/assessment">Take another →</button></div>${assessmentHistoryMarkup()}</section>`); }
		function profilePage(role) { const person = personFor(role); return shell(role, dashboardRoutes[role].profile, `${pageIntro(dashboardRoutes[role].profile, 'Keep your workspace information current.') }<form class="dash-panel editable-form" data-form="profile" data-role="${role}"><label>Name</label><input name="name" value="${esc(person.name)}" required><label>Email</label><input name="email" type="email" value="${esc(person.email)}" required><label>${role === 'student' ? 'College' : role === 'industry' ? 'Industry type' : 'Institution type'}</label><input name="details" value="${esc(role === 'student' ? person.college : role === 'industry' ? person.industryType : person.institutionType)}" required><button class="btn btn-primary" type="submit">Save changes</button></form>`); }
		function applicationsPage(role) { return shell(role, 'Applications', `${pageIntro('Applications', role === 'industry' ? 'Review candidate applications for your opportunities.' : 'Track every opportunity you have applied for.')}${searchBox('Search applications')}<div class="dash-panel" style="margin-top:18px"><div id="application-results">${state.applications.length ? state.applications.map((item) => `<div class="application-row" data-searchable="${esc(`${item.opportunity} ${item.company} ${item.status}`)}"><div><b>${esc(item.opportunity)}</b><p>${esc(item.company)} · Applied ${esc(item.applied)}</p></div>${role === 'industry' ? `<select data-action="status" data-id="${item.id}"><option ${item.status === 'Under Review' ? 'selected' : ''}>Under Review</option><option ${item.status === 'Shortlisted' ? 'selected' : ''}>Shortlisted</option><option ${item.status === 'Selected' ? 'selected' : ''}>Selected</option><option ${item.status === 'Rejected' ? 'selected' : ''}>Rejected</option></select>` : `<span class="tag ${item.status === 'Selected' ? 'success' : 'blue'}">${esc(item.status)}</span>`}</div>`).join('') : emptyState('No applications yet. Explore opportunities to get started.')}</div></div>`); }
		function careerPage() { return shell('student', 'Career Path', `${pageIntro('Career Path', 'Explore directions that match your current skills.') }<div class="career-grid">${state.careers.map((career) => `<article class="mini-card"><span class="tag success">${esc(career.match)} match</span><h3>${esc(career.name)}</h3><p>${esc(career.description)}</p><p><b>Focus skills:</b> ${esc(career.skills)}</p><button class="btn btn-light" data-action="route" data-route="/student/skills">Build these skills</button><button class="btn-plain" data-action="route" data-route="/student/opportunities">Find opportunities →</button></article>`).join('')}</div>`); }
		function postOpportunityPage() { return shell('industry', 'Post Opportunity', `${pageIntro('Post Opportunity', 'Publish a prototype opportunity for students to discover.') }<form class="dash-panel editable-form" data-form="opportunity"><label>Opportunity title</label><input name="title" required><label>Company</label><input name="company" value="${esc(state.company.name)}" required><label>Location</label><input name="location" required><label>Opportunity type</label><select name="type"><option>Internship</option><option>Full-time</option><option>Part-time</option></select><label>Required skills</label><input name="skills" placeholder="Python · React · Git" required><label>Description</label><textarea name="description" rows="4" required></textarea><label>Duration</label><input name="duration" placeholder="3 months" required><label>Application deadline</label><input name="deadline" type="date" required><button class="btn btn-primary" type="submit">Publish opportunity</button></form>`); }
		function candidatesPage() { return shell('industry', 'Candidates', `${pageIntro('Candidates', 'Review student profiles matched to your opportunities.')}${searchBox('Search candidates')}<div class="candidate-grid" style="margin-top:18px" id="candidate-results">${data.candidates.map((candidate) => `<article class="mini-card" data-searchable="${esc(candidate.join(' '))}"><div class="candidate-name"><div class="avatar">${candidate[0].split(' ').map((part) => part[0]).join('')}</div><strong>${esc(candidate[0])}</strong><small>${esc(candidate[1])}</small></div><p><span class="tag success">${esc(candidate[2])} match</span><br>${esc(candidate[3])}<br>${esc(candidate[4])}</p><button class="btn btn-light" data-action="candidate" data-name="${esc(candidate[0])}">View Profile</button></article>`).join('')}</div>`); }
		function analyticsPage(role) { const selected = state.applications.filter((item) => item.status === 'Selected').length; return shell(role, 'Analytics', `${pageIntro('Analytics', 'Prototype metrics update from the current workspace data.')}<div class="kpis"><div class="kpi"><div class="kpi-top"><span>Total Opportunities</span></div><div class="kpi-value">${state.opportunities.length}</div></div><div class="kpi"><div class="kpi-top"><span>Applications</span></div><div class="kpi-value">${state.applications.length}</div></div><div class="kpi"><div class="kpi-top"><span>Shortlisted</span></div><div class="kpi-value">${state.applications.filter((item) => item.status === 'Shortlisted').length}</div></div><div class="kpi"><div class="kpi-top"><span>Selected</span></div><div class="kpi-value">${selected}</div></div></div><section class="dash-panel"><div class="metric-row"><span>Student readiness</span><strong>68%</strong></div><div class="metric-row"><span>Internship participation</span><strong>${Math.min(100, 40 + state.applications.length * 5)}%</strong></div><div class="metric-row"><span>Industry collaboration</span><strong>${state.partnerships.length} active partners</strong></div></section>`); }
		function institutionSkillsPage() { return shell('institution', 'Student Skills', `${pageIntro('Student Skills', 'Monitor readiness and the most common skill gaps.')}${searchBox('Search student skills')}<div class="dash-panel" style="margin-top:18px">${state.gaps.concat(state.skills.map((skill) => ({ name: skill.name, score: skill.score, target: 80 }))).map((item) => `<div class="skill" data-searchable="${esc(item.name)}"><div class="skill-line"><b>${esc(item.name)}</b><span>${item.score}%</span></div><div class="bar"><span style="width:${item.score}%;background:var(--cyan)"></span></div></div>`).join('')}</div>`); }
		function partnershipsPage() { return shell('institution', 'Partnerships', `${pageIntro('Partnerships', 'Build and maintain industry connections.', '<button class="btn btn-primary" data-action="add-partnership">＋ Add partnership</button>')}<div class="dash-panel" style="margin-top:18px" id="partnership-results">${state.partnerships.map((item) => `<div class="application-row"><div><b>${esc(item.name)}</b><p>${esc(item.type)} · ${esc(item.status)}</p></div><button class="btn-plain" data-action="remove-partnership" data-id="${item.id}">Remove</button></div>`).join('')}</div>`); }
		function programsPage() { return shell('industry', 'Industry Programs', `${pageIntro('Industry Programs', 'Explore ways to connect industry and academia.') }<div class="collab-grid">${['Guest Lectures', 'Live Industry Projects', 'Workshops', 'Mentorship', 'Faculty Collaboration'].map((name) => `<article class="mini-card"><h3>${name}</h3><p>Connect with academic talent and create meaningful outcomes.</p><button class="btn btn-light" data-action="join-program" data-name="${name}">Explore / Join</button></article>`).join('')}</div>`); }
		function settingsPage(role) { return shell(role, 'Settings', `${pageIntro('Settings', 'Manage your prototype workspace preferences.') }<form class="dash-panel editable-form" data-form="settings"><label><input type="checkbox" name="emailUpdates" ${state.settings.emailUpdates ? 'checked' : ''}> Email updates</label><label><input type="checkbox" name="profileVisibility" ${state.settings.profileVisibility ? 'checked' : ''}> Make my profile visible to matches</label><label><input type="checkbox" name="compactView" ${state.settings.compactView ? 'checked' : ''}> Use compact workspace view</label><button class="btn btn-primary" type="submit">Save settings</button><button class="btn btn-light" type="button" data-action="logout">Log out</button></form>`); }
		function markNotification(id, button) { const notification = state.notifications.find((item) => item.id === id); if (notification) notification.read = true; saveState(); button.closest('.notification-row')?.remove(); }
		function notificationPanel() { return `<div class="modal-backdrop" onclick="this.remove()"><div class="modal-card notification-panel" onclick="event.stopPropagation()"><button class="modal-close" onclick="this.closest('.modal-backdrop').remove()">×</button><h2>Notifications</h2>${state.notifications.length ? state.notifications.map((item) => `<div class="notification-row ${item.read ? '' : 'unread'}"><span>${esc(item.text)}<small>${esc(item.time)}</small></span>${item.read ? '' : `<button class="btn-plain" onclick="markNotification('${item.id}', this)">Mark read</button>`}</div>`).join('') : emptyState('You are all caught up.')}</div></div>`; }
		function institutionDashboardPage() { return shell('institution', 'Institution Dashboard', `${pageIntro(state.institution.title, state.institution.subtitle, '<span class="tag blue">Prototype workspace</span>')}<div class="kpis"><div class="kpi"><div class="kpi-top"><span>Total Students</span></div><div class="kpi-value">2,450</div></div><div class="kpi"><div class="kpi-top"><span>Assessed Students</span></div><div class="kpi-value">1,980</div></div><div class="kpi"><div class="kpi-top"><span>Internship Ready</span></div><div class="kpi-value">68%</div></div><div class="kpi"><div class="kpi-top"><span>Placement Ready</span></div><div class="kpi-value">61%</div></div></div><div class="dash-grid"><section class="dash-panel"><div class="panel-head"><h3>Top Student Skill Gaps</h3><button class="btn-plain" data-action="route" data-route="/institution/skills">View details →</button></div>${state.gaps.map((gap) => `<div class="skill"><div class="skill-line"><span>${esc(gap.name)}</span><span>${gap.score}%</span></div><div class="bar"><span style="width:${gap.score}%;background:var(--cyan)"></span></div></div>`).join('')}</section><section class="dash-panel"><div class="panel-head"><h3>Industry Collaboration</h3><button class="btn-plain" data-action="route" data-route="/institution/partnerships">Manage Partnerships →</button></div><div class="metric-row"><span>Active Industry Partners</span><strong>${state.partnerships.length}</strong></div><div class="metric-row"><span>Live Projects</span><strong>18</strong></div><div class="metric-row"><span>Workshops This Year</span><strong>27</strong></div></section></div>`); }
		function industryDashboardPage() { return shell('industry', 'Industry Dashboard', `${pageIntro(state.company.title, state.company.subtitle, '<span class="tag blue">Prototype workspace</span>')}<div class="kpis"><div class="kpi"><div class="kpi-top"><span>Active Opportunities</span></div><div class="kpi-value">${state.opportunities.length}</div><div class="kpi-note">${state.opportunities.length} published</div></div><div class="kpi"><div class="kpi-top"><span>Applications</span></div><div class="kpi-value">${state.applications.length}</div><div class="kpi-note">Live prototype data</div></div><div class="kpi"><div class="kpi-top"><span>Shortlisted</span></div><div class="kpi-value">${state.applications.filter((item) => item.status === 'Shortlisted').length}</div></div><div class="kpi"><div class="kpi-top"><span>Selected</span></div><div class="kpi-value">${state.applications.filter((item) => item.status === 'Selected').length}</div></div></div><div class="action-grid"><button class="action" data-action="route" data-route="/industry/post-opportunity">＋ Post Opportunity</button><button class="action" data-action="route" data-route="/industry/candidates">♙ View Candidates</button><button class="action" data-action="route" data-route="/industry/applications">▤ Manage Applications</button><button class="action" data-action="route" data-route="/industry/programs">◈ Industry Programs</button></div><section class="dash-panel"><div class="panel-head"><h3>Active Opportunities</h3><button class="btn-plain" data-action="route" data-route="/industry/opportunities">Manage all →</button></div>${state.opportunities.slice(0, 3).map((item) => `<div class="application-row"><div><b>${esc(item.title)}</b><p>${esc(item.company)} · ${esc(item.location)}</p></div><button class="btn-plain" data-action="view-opportunity" data-title="${esc(item.title)}">View →</button></div>`).join('')}</section>`); }
		function authInput(label, name, options = {}) {
			const { type = 'text', placeholder = '', autocomplete = '', optional = false } = options;
			const visibility = type === 'password' ? `<button class="password-toggle" type="button" data-action="toggle-password" data-target="${name}" aria-label="Show ${label}" aria-pressed="false">Show</button>` : '';
			return `<div class="auth-field"><label for="${name}">${label}${optional ? ' <span>(optional)</span>' : ' <b aria-hidden="true">*</b>'}</label><div class="input-wrap"><input id="${name}" name="${name}" type="${type}" placeholder="${placeholder}" autocomplete="${autocomplete}" ${optional ? '' : 'required'}>${visibility}</div></div>`;
		}
		function authPage(type) {
			const register = type === 'register';
			const loginFields = `${authInput('Email', 'email', { type: 'email', placeholder: 'you@example.com', autocomplete: 'email' })}${authInput('Password', 'password', { type: 'password', autocomplete: 'current-password' })}`;
			const registerFields = `${authInput('Full Name', 'name', { placeholder: 'Your full name', autocomplete: 'name' })}${authInput('Email', 'email', { type: 'email', placeholder: 'you@example.com', autocomplete: 'email' })}${authInput('Password', 'password', { type: 'password', autocomplete: 'new-password' })}${authInput('Confirm Password', 'confirmPassword', { type: 'password', autocomplete: 'new-password' })}${authInput('College / University', 'college', { placeholder: 'Your institution', autocomplete: 'organization' })}${authInput('Course', 'course', { placeholder: 'e.g. B.Tech Computer Science' })}<div class="auth-field"><label for="year">Year of Study <b aria-hidden="true">*</b></label><select id="year" name="year" required><option value="">Select your year</option><option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option><option>Graduate</option></select></div>${authInput('Phone Number', 'phone', { type: 'tel', placeholder: '+91 98765 43210', autocomplete: 'tel', optional: true })}`;
			return `<div class="auth"><aside class="auth-aside">${brand()}<div><div class="eyebrow" style="color:#5bd1d5">Connecting Skills, Academia &amp; Industry</div><h1>${register ? 'Start building your bridge.' : 'Your next opportunity starts here.'}</h1><p>${register ? 'Create your student account and shape a profile that opens the right doors.' : 'Sign in to your personal SkillBridge workspace.'}</p></div><div class="auth-note">Frontend prototype · account data stays in this browser</div></aside><main class="auth-main"><div class="form-wrap"><a class="btn-plain" href="#/">← Back to home</a><h2 style="margin-top:27px">${register ? 'Create your student account' : 'Student login'}</h2><p>${register ? 'Fields marked * are required.' : 'Use the email and password you registered with.'}</p><form class="form" data-form="${register ? 'register' : 'login'}" novalidate>${register ? registerFields : loginFields}${register ? '<button class="btn btn-primary" type="submit">Create Account</button>' : '<div class="form-row"><label><input type="checkbox" name="remember"> Remember me</label><button class="btn-plain" type="button" data-action="forgot">Forgot password?</button></div><button class="btn btn-primary" type="submit">Login</button><div class="divider">or continue as demo</div><div class="demo-grid"><button class="demo-btn" type="button" data-demo="student">Demo Student</button><button class="demo-btn" type="button" data-demo="industry">Demo Industry</button><button class="demo-btn" type="button" data-demo="institution">Demo Institution</button></div>'}</form>${register ? '<div class="switch">Already have an account? <a href="#/login">Login</a></div>' : '<div class="switch">New to SkillBridge? <a href="#/register">Create Account</a></div>'}</div></main></div>`;
		}
		function onboardingPage() { return `<div class="auth"><aside class="auth-aside">${brand()}<div><div class="eyebrow" style="color:#5bd1d5">Student onboarding</div><h1>Make your profile yours.</h1><p>These optional preferences help SkillBridge present more relevant opportunities.</p></div><div class="auth-note">You can update these choices later from your profile.</div></aside><main class="auth-main"><div class="form-wrap"><h2>What are you working toward?</h2><p>Complete what is useful now, or skip straight to your dashboard.</p><form class="form" data-form="onboarding">${authInput('Career interests', 'interests', { placeholder: 'e.g. Product design, data, web development', optional: true })}${authInput('Desired job roles', 'roles', { placeholder: 'e.g. Frontend Developer', optional: true })}${authInput('Technical skills', 'technicalSkills', { placeholder: 'e.g. HTML, CSS, JavaScript', optional: true })}${authInput('Soft skills', 'softSkills', { placeholder: 'e.g. Communication, teamwork', optional: true })}${authInput('Preferred industries', 'industries', { placeholder: 'e.g. Technology, finance', optional: true })}<div class="auth-field"><label for="opportunityType">Preferred opportunity type <span>(optional)</span></label><select id="opportunityType" name="opportunityType"><option value="">No preference</option><option>Internship</option><option>Part-time</option><option>Full-time</option></select></div>${authInput('Location preference', 'location', { placeholder: 'e.g. Bengaluru or Remote', optional: true })}<button class="btn btn-primary" type="submit">Save and continue →</button><button class="btn btn-light" type="button" data-action="skip-onboarding">Skip for now</button></form></div></main></div>`; }
		function recoveryPage(reset = false) { return `<div class="auth"><aside class="auth-aside">${brand()}<div><div class="eyebrow" style="color:#5bd1d5">Password recovery</div><h1>${reset ? 'Choose a new password.' : 'Get back to your workspace.'}</h1><p>This is a frontend prototype; no email is sent from this page.</p></div><div class="auth-note">Prototype-only account recovery</div></aside><main class="auth-main"><div class="form-wrap"><a class="btn-plain" href="#/login">← Back to login</a><h2 style="margin-top:27px">${reset ? 'Reset your password' : 'Password recovery'}</h2><p>${reset ? 'Set a new password for the verified prototype account.' : 'Enter your registered email to begin a simulated reset.'}</p><form class="form" data-form="${reset ? 'reset-password' : 'recovery'}">${reset ? `${authInput('New Password', 'password', { type: 'password', autocomplete: 'new-password' })}${authInput('Confirm New Password', 'confirmPassword', { type: 'password', autocomplete: 'new-password' })}<button class="btn btn-primary" type="submit">Update Password</button>` : `${authInput('Email', 'email', { type: 'email', placeholder: 'you@example.com', autocomplete: 'email' })}<button class="btn btn-primary" type="submit">Send Reset Link</button>`}</form></div></main></div>`; }
		function assessmentPage() {
			const result = state.assessmentResult;
			if (result) return shell('student', 'Assessment Result', `${pageIntro('Assessment Complete!', `${result.skill} assessment submitted.`)}<section class="dash-panel assessment-result"><span class="tag success">${esc(result.rating)}</span><h2>${esc(result.skill)}</h2><div class="assessment-score">${result.score}%</div><p><b>Correct:</b> ${result.correct} / ${result.total}<br><b>Incorrect:</b> ${result.total - result.correct} / ${result.total}<br><b>Skill rating:</b> ${esc(result.rating)}</p><div class="card-actions"><button class="btn btn-primary" data-action="route" data-route="/student/dashboard">Back to Dashboard</button><button class="btn btn-light" data-action="retake-assessment" data-skill="${esc(result.skill)}">Retake Assessment</button></div></section>`);
			const session = state.assessmentSession;
			if (!session) return shell('student', 'Skill Assessment', `${pageIntro('Choose a Skill', 'What skill would you like to assess? Each assessment has 10 language-specific questions.')}<section class="dash-panel"><div class="assessment-skill-grid">${Object.keys(ASSESSMENT_QUESTIONS).map((skill) => `<button class="assessment-skill" data-action="select-assessment" data-skill="${skill}"><span>✦</span>${skill}${(state.assessments || []).some((item) => item.skill === skill) ? '<small>Retake available</small>' : ''}</button>`).join('')}</div></section>`);
			const questions = ASSESSMENT_QUESTIONS[session.skill];
			const question = questions[session.index];
			return shell('student', `${session.skill} Assessment`, `${pageIntro(`${session.skill} Skill Assessment`, `Question ${session.index + 1} of ${questions.length}`)}<section class="dash-panel assessment-question"><div class="assessment-progress"><span style="width:${((session.index + 1) / questions.length) * 100}%"></span></div><h3>${esc(question[0])}</h3><div class="assessment-options">${question[1].map((option, index) => `<label class="assessment-option"><input type="radio" name="assessment-answer" value="${index}" ${session.answers[session.index] === index ? 'checked' : ''}><span>${String.fromCharCode(65 + index)}. ${esc(option)}</span></label>`).join('')}</div><div class="card-actions"><button class="btn btn-light" data-action="cancel-assessment">Cancel</button><button class="btn btn-primary" data-action="${session.index === questions.length - 1 ? 'submit-assessment' : 'next-assessment'}">${session.index === questions.length - 1 ? 'Submit Assessment' : 'Next →'}</button></div></section>`);
		}
		function navigateFromAction(action, sourceEvent) {
			if (action === 'logout') { clearStudentSession(); state.activeRole = null; saveState(); go('/login'); return; }
			if (action === 'toggle-sidebar') { toggleSidebar(); return; }
			if (action === 'route') { go(sourceEvent.currentTarget.dataset.route); return; }
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
					if (action === 'select-assessment' || action === 'retake-assessment') { state.assessmentResult = null; state.assessmentSession = { skill: element.dataset.skill, index: 0, answers: [] }; renderFunctional(); return; }
					if (action === 'cancel-assessment') { delete state.assessmentSession; go('/student/skills'); return; }
					if (action === 'next-assessment' || action === 'submit-assessment') { const choice = document.querySelector('input[name="assessment-answer"]:checked'); if (!choice) { showToast('Please select an answer.'); return; } const session = state.assessmentSession; session.answers[session.index] = Number(choice.value); const questions = ASSESSMENT_QUESTIONS[session.skill]; if (action === 'next-assessment') { session.index += 1; renderFunctional(); return; } const correct = session.answers.reduce((total, answer, index) => total + (answer === questions[index][2] ? 1 : 0), 0); const score = Math.round((correct / questions.length) * 100); const result = { skill: session.skill, score, correct, total: questions.length, rating: assessmentRating(score), completedAt: new Date().toISOString() }; state.assessments = (state.assessments || []).filter((item) => item.skill !== result.skill); state.assessments.push(result); state.skills = state.assessments.map((item) => ({ name: item.skill, score: item.score, status: item.rating })); state.assessmentResult = result; delete state.assessmentSession; saveState(); notify(`${result.skill} assessment completed with ${score}%.`); renderFunctional(); return; }
					if (action === 'close-assessment') { document.getElementById('assessment-area').innerHTML = ''; return; }
					if (action === 'candidate') { showToast(`${element.dataset.name}'s profile is ready for review.`); return; }
					if (action === 'join-program') { notify(`You joined the ${element.dataset.name} program.`); showToast('Program added to your workspace.'); return; }
					if (action === 'add-partnership') { const name = prompt('Partner organization'); if (name?.trim()) { state.partnerships.push({ id: `p-${Date.now()}`, name: name.trim(), type: 'New partnership', status: 'Pending' }); notify(`New partnership added with ${name.trim()}.`); saveState(); renderFunctional(); } return; }
					if (action === 'remove-partnership') { if (confirm('Remove this partnership?')) { state.partnerships = state.partnerships.filter((item) => item.id !== element.dataset.id); saveState(); renderFunctional(); } return; }
					if (action === 'read-notification') { const notification = state.notifications.find((item) => item.id === element.dataset.id); if (notification) notification.read = true; saveState(); element.closest('.notification-row')?.remove(); return; }
					navigateFromAction(action, event);
				});
			});
			document.querySelectorAll('[data-action="filter"]').forEach((input) => input.addEventListener('input', () => { const query = input.value.toLowerCase().trim(); const container = input.closest('.dash-content'); const results = [...container.querySelectorAll('[data-searchable]')]; results.forEach((item) => { item.hidden = query && !item.dataset.searchable.toLowerCase().includes(query); }); const visible = results.some((item) => !item.hidden); container.querySelector('.empty-state')?.remove(); if (!visible) container.insertAdjacentHTML('beforeend', emptyState('No results found.')); }));
			document.querySelectorAll('[data-action="status"]').forEach((select) => select.addEventListener('change', () => { const application = state.applications.find((item) => item.id === select.dataset.id); if (application) { application.status = select.value; notify(`Application status updated to ${select.value}.`); saveState(); showToast('Application status updated.'); } }));
			document.querySelectorAll('form[data-form]').forEach((form) => form.addEventListener('submit', (event) => { event.preventDefault(); handleForm(form); }));
			document.querySelectorAll('[data-demo]').forEach((button) => button.addEventListener('click', () => { if (button.dataset.demo !== 'student') { state.activeRole = button.dataset.demo; saveState(); go(`/${button.dataset.demo}/dashboard`); return; } let account = loadStudentAccounts().find((item) => item.email === 'demo@student.skillbridge'); if (!account) { const profile = { ...clone(defaultState.student), name: 'Demo Student', email: 'demo@student.skillbridge', initials: 'DS', title: 'Welcome, Demo', subtitle: 'Here is your career readiness overview.' }; account = { id: 'student-demo', email: profile.email, passwordHash: prototypeHash('demo-access'), profile, workspace: studentWorkspace(), createdAt: new Date().toISOString() }; const accounts = loadStudentAccounts(); accounts.push(account); saveStudentAccounts(accounts); } startStudentSession(account); go('/student/dashboard'); }));
		}
		function handleForm(form) {
			const values = Object.fromEntries(new FormData(form).entries());
			clearFormErrors(form);
			if (form.dataset.form === 'login') {
				let invalid = false;
				if (!isValidEmail(values.email)) { showFieldError(form, 'email', 'Enter a valid email address.'); invalid = true; }
				if (!values.password) { showFieldError(form, 'password', 'Enter your password.'); invalid = true; }
				if (invalid) return;
				const account = loadStudentAccounts().find((item) => item.email === values.email.trim().toLowerCase());
				if (!account || account.passwordHash !== prototypeHash(values.password)) return showFormError(form, 'That email or password is not correct.');
				startStudentSession(account); go('/student/dashboard'); return;
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
				const account = { id: `student-${Date.now()}`, fullName: name, email, college: profile.college, course: profile.course, year: profile.year, phone: profile.phone, role: 'student', registeredAt, onboardingCompleted: false, onboarding: {}, passwordHash: prototypeHash(values.password), profile, workspace: newStudentWorkspace() };
				const accounts = loadStudentAccounts(); accounts.push(account); saveStudentAccounts(accounts); startStudentSession(account); notify('Your student account was created.'); go('/student/onboarding'); return;
			}
			if (form.dataset.form === 'onboarding') { const account = currentStudentAccount(); if (!account) return go('/login'); const onboarding = { careerInterest: values.interests || '', desiredRole: values.roles || '', technicalSkills: values.technicalSkills || '', softSkills: values.softSkills || '', preferredIndustry: values.industries || '', opportunityType: values.opportunityType || '', location: values.location || '' }; state.student.preferences = onboarding; const accounts = loadStudentAccounts(); const index = accounts.findIndex((item) => item.id === account.id); if (index >= 0) { accounts[index].onboarding = onboarding; accounts[index].onboardingCompleted = true; saveStudentAccounts(accounts); } saveState(); notify('Your onboarding preferences were saved.'); go('/student/dashboard'); return; }
			if (form.dataset.form === 'recovery') { if (!isValidEmail(values.email)) return showFieldError(form, 'email', 'Enter a valid email address.'); const account = loadStudentAccounts().find((item) => item.email === values.email.trim().toLowerCase()); if (!account) return showFieldError(form, 'email', 'No student account exists for this email.'); try { localStorage.setItem(RESET_CANDIDATE_KEY, account.id); } catch (error) { } showToast('Reset link simulated. Choose a new password now.'); go('/reset-password'); return; }
			if (form.dataset.form === 'reset-password') { const accountId = localStorage.getItem(RESET_CANDIDATE_KEY); const accounts = loadStudentAccounts(); const index = accounts.findIndex((account) => account.id === accountId); if (index < 0) return go('/forgot-password'); if ((values.password || '').length < 8) return showFieldError(form, 'password', 'Use at least 8 characters.'); if (values.password !== values.confirmPassword) return showFieldError(form, 'confirmPassword', 'Passwords do not match.'); accounts[index].passwordHash = prototypeHash(values.password); saveStudentAccounts(accounts); localStorage.removeItem(RESET_CANDIDATE_KEY); showToast('Password updated. You can now log in.'); go('/login'); return; }
			if (form.dataset.form === 'profile') { const person = personFor(form.dataset.role); person.name = values.name; person.email = values.email; if (form.dataset.role === 'student') { person.college = values.details; person.title = `Welcome, ${(values.name || '').trim().split(/\s+/)[0] || 'Student'}`; } else if (form.dataset.role === 'industry') person.industryType = values.details; else person.institutionType = values.details; saveState(); notify('Profile changes saved.'); showToast('Profile changes saved.'); return; }
			if (form.dataset.form === 'settings') { state.settings = { emailUpdates: form.elements.emailUpdates.checked, profileVisibility: form.elements.profileVisibility.checked, compactView: form.elements.compactView.checked }; saveState(); notify('Settings saved.'); showToast('Settings saved.'); return; }
			if (form.dataset.form === 'opportunity') { if (!values.title || !values.company || !values.location || !values.skills || !values.description || !values.duration || !values.deadline) return showFormError(form, 'Complete all required opportunity fields.'); state.opportunities.unshift({ title: values.title, company: values.company, location: values.location, type: values.type, skills: values.skills, description: values.description, duration: values.duration, deadline: values.deadline, match: 'New' }); saveState(); notify(`Opportunity posted: ${values.title}.`); showToast('Opportunity posted successfully.'); go('/industry/opportunities'); return; }
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
				const currentBackgroundColor = window.__skillBridgeBackgroundOverride || calculatedBackgroundColor;
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
			if (window.__skillBridgeScrollFrame) cancelAnimationFrame(window.__skillBridgeScrollFrame);
			window.__skillBridgeScrollFrame = null;
			if (window.__skillBridgeScrollHandler) window.removeEventListener('scroll', window.__skillBridgeScrollHandler);
			if (window.__skillBridgeResizeHandler) window.removeEventListener('resize', window.__skillBridgeResizeHandler);
			if (window.__skillBridgeRevealObserver) window.__skillBridgeRevealObserver.disconnect();
			delete window.__skillBridgeScrollHandler;
			delete window.__skillBridgeResizeHandler;
			delete window.__skillBridgeBackgroundOverride;
			document.body.classList.remove('home-page');
			document.body.classList.remove('motion-page');
			['--scroll-ink', '--scroll-muted', '--scroll-line', '--scroll-surface', '--scroll-soft', '--scroll-header']
				.forEach((property) => document.body.style.removeProperty(property));
			const background = document.getElementById('global-background');
			if (background) background.style.removeProperty('background-color');
		}

		function homeEnhancementsMarkup() {
			const skillDetails = {
				Python: 'Automation, data, and backend foundations used across SkillBridge opportunities.',
				JavaScript: 'The language behind interactive products, dashboards, and modern web experiences.',
				React: 'A practical UI skill for building fast, composable product interfaces.',
				SQL: 'The data layer skill that helps teams turn product questions into decisions.',
				Git: 'A collaboration essential for shipping confidently with technical teams.',
				Communication: 'The multiplier that helps strong technical work create real-world impact.'
			};
			return `<section class="home-stats section" aria-label="SkillBridge at a glance"><div class="container"><div class="home-section-kicker">The network in motion</div><div class="home-stats-grid">${[['2,450','Students building readiness','+'],['42','Industry partners','+'],['18','Live projects','+'],['72','Average readiness signal','%']].map(([value,label,suffix]) => `<div class="home-stat" data-stat-value="${value.replace(',','')}" data-stat-suffix="${suffix}"><strong>${value}${suffix}</strong><span>${label}</span></div>`).join('')}</div></div></section><section class="home-skills section soft" id="home-skills"><div class="container home-skill-layout"><div><div class="home-section-kicker">Skills with a signal</div><h2>See where potential becomes momentum.</h2><p class="home-section-copy">Explore the capabilities that connect classroom learning to meaningful opportunities.</p><div class="home-skill-tabs" role="list">${Object.keys(skillDetails).map((skill, index) => `<button type="button" class="home-skill-tab${index === 0 ? ' active' : ''}" data-home-skill="${skill}" role="listitem">${skill}</button>`).join('')}</div></div><div class="home-skill-detail" aria-live="polite"><span class="tag blue">Verified signal</span><h3>${data.skills[0][0]}</h3><p>${skillDetails[data.skills[0][0]]}</p><strong>${data.skills[0][1]}% readiness</strong><div class="bar"><span style="width:${data.skills[0][1]}%"></span></div></div></div></section><section class="home-opportunities section" id="home-opportunities"><div class="container"><div class="section-heading"><div class="eyebrow">A practical next step</div><h2>Opportunities matched to momentum.</h2><p>Move from a verified signal to a real conversation with industry.</p></div><div class="home-opportunity-grid">${state.opportunities.slice(0, 3).map((opportunity) => `<article class="home-opportunity-card" data-action="view-opportunity" data-title="${esc(opportunity.title)}" tabindex="0"><div class="home-opportunity-top"><span class="tag success">${esc(opportunity.match)} match</span><span>${esc(opportunity.location)}</span></div><h3>${esc(opportunity.title)}</h3><p>${esc(opportunity.company)} · ${esc(opportunity.duration)}</p><small>${esc(opportunity.skills)}</small><div class="home-opportunity-more"><span>Eligibility: relevant foundational skills</span><span>Deadline: ${esc(opportunity.deadline)}</span></div><button class="btn btn-light" type="button" data-action="view-opportunity" data-title="${esc(opportunity.title)}">View details →</button></article>`).join('')}</div></div></section><section class="home-ecosystem section soft" id="home-ecosystem"><div class="container home-ecosystem-grid"><div class="home-ecosystem-sticky"><div class="home-ecosystem-visual"><span class="home-ecosystem-node active">Students</span><span class="home-ecosystem-line"></span><span class="home-ecosystem-node">Academia</span><span class="home-ecosystem-line"></span><span class="home-ecosystem-node">Industry</span></div></div><div class="home-ecosystem-steps"><div class="home-section-kicker">The bridge in five moves</div>${[['01','Discover','Students find a clear next step based on their current signal.'],['02','Develop','Skills become visible, verifiable, and easier to improve.'],['03','Track','Academia sees readiness, gaps, and outcomes in one view.'],['04','Connect','Industry discovers candidates through meaningful evidence.'],['05','Move forward','Applications become the beginning of a stronger connection.']].map(([number,title,copy]) => `<article class="home-ecosystem-step" data-ecosystem-step="${number}"><span>${number}</span><div><h3>${title}</h3><p>${copy}</p></div></article>`).join('')}</div></div></section><section class="home-final-cta section"><div class="container"><div><div class="home-section-kicker">Make the next move</div><h2>Your skills. Your opportunities. Your future.</h2><p>Explore the SkillBridge workspace and turn readiness into momentum.</p></div><a class="btn btn-primary" href="#/student/opportunities">Explore SkillBridge →</a></div></section>`;
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
					const descriptions = { Python: 'Automation, data, and backend foundations used across SkillBridge opportunities.', JavaScript: 'The language behind interactive products, dashboards, and modern web experiences.', React: 'A practical UI skill for building fast, composable product interfaces.', SQL: 'The data layer skill that helps teams turn product questions into decisions.', Git: 'A collaboration essential for shipping confidently with technical teams.', Communication: 'The multiplier that helps strong technical work create real-world impact.' };
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
			window.__skillBridgeScrollFrame = null;
			window.__skillBridgeScrollHandler = () => {
					if (window.__skillBridgeScrollFrame) return;
					window.__skillBridgeScrollFrame = requestAnimationFrame(() => {
						window.__skillBridgeScrollFrame = null;
						updateGlobalBackground();
					});
				};
			window.__skillBridgeResizeHandler = updateGlobalBackground;
			window.addEventListener('scroll', window.__skillBridgeScrollHandler, { passive: true });
			window.addEventListener('resize', window.__skillBridgeResizeHandler, { passive: true });
			const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			const revealTargets = landingRoot.querySelectorAll('.hero > *, .section-heading, .section > .container > .grid-3 > *, .solution > *, .steps > *, .feature-grid > *, .cta .container, footer .footer-grid, .home-stats, .home-skill-layout, .home-opportunity-grid, .home-ecosystem-grid, .home-final-cta .container');
			revealTargets.forEach((element) => element.classList.add('reveal'));
			if (window.__skillBridgeRevealObserver) window.__skillBridgeRevealObserver.disconnect();
			window.__skillBridgeRevealObserver = new IntersectionObserver((entries, observer) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add('is-visible');
						observer.unobserve(entry.target);
					}
				});
			}, { threshold: .12, rootMargin: '0px 0px -8% 0px' });
			revealTargets.forEach((element) => window.__skillBridgeRevealObserver.observe(element));
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
			window.__skillBridgeRevealObserver = new IntersectionObserver((entries, observer) => {
				entries.forEach((entry) => {
					if (!entry.isIntersecting) return;
					entry.target.classList.add('is-visible');
					observer.unobserve(entry.target);
				});
			}, { threshold: .08, rootMargin: '0px 0px -6% 0px' });
			targets.forEach((element) => window.__skillBridgeRevealObserver.observe(element));
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
			teardownLandingExperience();
			if (path && !path.startsWith('/')) { if (document.querySelector('.landing')) document.getElementById(path)?.scrollIntoView(); return; }
			const match = path.match(/^\/(student|industry|institution)\/(dashboard|profile|skills|opportunities|applications|settings|candidates|analytics|partnerships|career-path|post-opportunity|programs|onboarding|assessment)$/);
			if (path.startsWith('/student/') && !currentStudentAccount()) { go('/login'); return; }
			if (path.startsWith('/student/')) hydrateStudentAccount(currentStudentAccount());
			if (path === '/') app.innerHTML = landing();
			else if (path === '/login' || path === '/register') app.innerHTML = authPage(path.slice(1));
			else if (path === '/forgot-password') app.innerHTML = recoveryPage();
			else if (path === '/reset-password') app.innerHTML = recoveryPage(true);
			else if (path === '/role-selection') app.innerHTML = roleSelection();
			else if (match) { const [, role, section] = match; const pages = { dashboard: role === 'student' ? studentDashboardPage : role === 'industry' ? industryDashboardPage : institutionDashboardPage, profile: () => profilePage(role), skills: role === 'student' ? skillsPage : institutionSkillsPage, opportunities: () => opportunitiesPage(role), applications: () => applicationsPage(role), settings: () => settingsPage(role), 'career-path': careerPage, candidates: candidatesPage, analytics: () => analyticsPage(role), partnerships: partnershipsPage, 'post-opportunity': postOpportunityPage, programs: programsPage, onboarding: onboardingPage, assessment: assessmentPage }; app.innerHTML = pages[section] ? pages[section]() : notFound(); }
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
