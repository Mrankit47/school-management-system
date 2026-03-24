import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/* ─── Global base styles ─── */
const globalStyles = `
  html { scroll-behavior: smooth; }
  body { background: #ffffff; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #f1f5f9; }
  ::-webkit-scrollbar-thumb { background: #2563eb; border-radius: 3px; }

  .card-lift {
    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }
  .card-lift:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 32px rgba(30,58,138,0.12);
  }

  .btn-primary {
    background: #1e3a8a;
    color: #ffffff;
    transition: background 0.2s ease, transform 0.15s ease;
  }
  .btn-primary:hover {
    background: #2563eb;
    transform: translateY(-1px);
  }

  .btn-outline {
    border: 2px solid #1e3a8a;
    color: #1e3a8a;
    background: transparent;
    transition: all 0.2s ease;
  }
  .btn-outline:hover {
    background: #1e3a8a;
    color: #ffffff;
  }

  .section-label {
    color: #2563eb;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .nav-link {
    color: #475569;
    font-size: 0.875rem;
    font-weight: 500;
    transition: color 0.15s ease;
  }
  .nav-link:hover { color: #1e3a8a; }
`;

/* ─── Intersection Observer hook ─── */
function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

/* ─── Feature cards ─── */
const features = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Smart Classrooms',
    desc: 'State-of-the-art interactive boards, digital resources, and collaborative learning tools in every classroom.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: 'AI-Powered Learning',
    desc: 'Adaptive learning pathways that respond to each student\'s pace and style, driven by intelligent assessment tools.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
      </svg>
    ),
    title: 'Sports & Activities',
    desc: 'Comprehensive sports facilities and extracurricular programmes that nurture well-rounded development.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    title: 'Research & Digital Labs',
    desc: 'Fully equipped science, robotics, and coding laboratories enabling hands-on exploration and innovation.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
      </svg>
    ),
    title: 'Expert Faculty',
    desc: 'Highly qualified educators with academic excellence and real-world experience, committed to every student\'s growth.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Career Guidance',
    desc: 'Dedicated counselling, placement support, and industry tie-ups that prepare students for the path ahead.',
  },
];

/* ─── Role cards ─── */
const roles = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    role: 'Admin',
    desc: 'Oversee the entire school — manage users, classes, fees, reports, and daily operations from a unified dashboard.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    role: 'Teacher',
    desc: 'Manage attendance, record results, assign tasks, and communicate seamlessly with students and parents.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    role: 'Student',
    desc: 'Access your results, timetable, assignments, attendance records, and notifications in one secure place.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    role: 'Parent',
    desc: 'Stay informed about your child\'s attendance, academic performance, fee payments, and school announcements.',
  },
];

/* ─── Stats ─── */
const stats = [
  { value: '1,200+', label: 'Students Enrolled' },
  { value: '85+',    label: 'Expert Faculty' },
  { value: '98%',    label: 'Success Rate' },
  { value: '40+',    label: 'Courses Offered' },
];

/* ─── Testimonials ─── */
const testimonials = [
  {
    name: 'Dr. Priya Sharma',
    role: 'Parent — Grade 9',
    text: 'Atheris Lab School has completely transformed how our daughter approaches learning. The faculty is deeply invested in each child\'s progress, and the communication between school and parents is exceptional.',
  },
  {
    name: 'Rahul Mehta',
    role: 'Student — Grade 11',
    text: 'The digital labs and career guidance here are outstanding. My robotics project won at the national level — the mentorship and facilities made all the difference.',
  },
  {
    name: 'Ms. Anjali Verma',
    role: 'Teacher — Computer Science',
    text: 'The school management platform is a genuine time-saver. I can focus entirely on teaching knowing that attendance, results, and communication are handled efficiently.',
  },
];

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════ */
export default function LandingPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 64);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = globalStyles;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const [aboutRef,  aboutInView]  = useInView();
  const [featRef,   featInView]   = useInView();
  const [rolesRef,  rolesInView]  = useInView();
  const [statsRef,  statsInView]  = useInView(0.3);
  const [testiRef,  testiInView]  = useInView();
  const [contRef,   contInView]   = useInView();

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  /* Hero image — high quality school campus from Unsplash */
  const heroImage = 'https://images.unsplash.com/photo-1562774053-701939374585?w=1600&q=80&auto=format&fit=crop';
  const aboutImage = 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80&auto=format&fit=crop';

  return (
    <div className="font-inter bg-white text-school-text min-h-screen">

      {/* ════════════ NAVBAR ════════════ */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-sm border-b border-slate-100' : 'bg-white/90 backdrop-blur-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollTo('hero')}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-base font-bold"
              style={{ background: '#1e3a8a' }}>A</div>
            <div>
              <p className="text-sm font-bold text-school-text leading-none">Atheris Lab School</p>
              <p className="text-xs text-school-body leading-none mt-0.5">Est. 2012</p>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {[['About', 'about'], ['Programmes', 'features'], ['Admissions', 'roles'], ['Contact', 'contact']].map(([label, id]) => (
              <button key={id} onClick={() => scrollTo(id)} className="nav-link">{label}</button>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => navigate('/login')}
              className="btn-primary px-5 py-2.5 rounded-lg text-sm font-semibold">
              Student Portal
            </button>
          </div>

          {/* Hamburger */}
          <button className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen
              ? <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              : <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 px-6 py-4 flex flex-col gap-3">
            {[['About', 'about'], ['Programmes', 'features'], ['Admissions', 'roles'], ['Contact', 'contact']].map(([label, id]) => (
              <button key={id} onClick={() => scrollTo(id)} className="nav-link text-left py-1">{label}</button>
            ))}
            <button onClick={() => navigate('/login')}
              className="btn-primary mt-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-center">
              Student Portal
            </button>
          </div>
        )}
      </header>

      {/* ════════════ HERO ════════════ */}
      <section id="hero" className="relative min-h-screen flex items-center" style={{ paddingTop: '80px' }}>
        {/* Background image */}
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${heroImage}')` }} />
        {/* Light overlay */}
        <div className="absolute inset-0" style={{ background: 'rgba(255,255,255,0.82)' }} />
        {/* Left accent bar */}
        <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ background: '#1e3a8a' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-24 grid lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div>
            <div className="inline-flex items-center gap-2 mb-5">
              <span className="w-8 h-px" style={{ background: '#1e3a8a' }} />
              <span className="section-label">CBSE Affiliated · Est. 2012</span>
            </div>

            <h1 className="font-poppins text-5xl lg:text-6xl font-bold leading-tight mb-5" style={{ color: '#0f172a' }}>
              Atheris Lab<br />
              <span style={{ color: '#1e3a8a' }}>School</span>
            </h1>

            <p className="text-xl font-medium mb-3" style={{ color: '#2563eb' }}>
              Where Innovation Meets Education
            </p>

            <p className="text-base leading-relaxed mb-10 max-w-lg" style={{ color: '#475569' }}>
              Atheris Lab School is a forward-thinking institution dedicated to holistic development,
              academic rigour, and technology-integrated learning. We prepare students to lead with
              confidence, creativity, and character in a rapidly changing world.
            </p>

            <div className="flex flex-wrap gap-4">
              <button onClick={() => scrollTo('features')}
                className="btn-primary px-7 py-3.5 rounded-lg text-sm font-semibold">
                Explore School
              </button>
              <button onClick={() => navigate('/login')}
                className="btn-outline px-7 py-3.5 rounded-lg text-sm font-semibold">
                Login Portal
              </button>
            </div>

            {/* Quick stats strip */}
            <div className="mt-12 flex flex-wrap gap-8 pt-8 border-t border-slate-200">
              {[['1,200+', 'Students'], ['85+', 'Faculty'], ['98%', 'Pass Rate']].map(([val, lbl]) => (
                <div key={lbl}>
                  <p className="text-2xl font-bold" style={{ color: '#1e3a8a' }}>{val}</p>
                  <p className="text-xs text-school-body mt-0.5">{lbl}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: visual block */}
          <div className="hidden lg:flex justify-end">
            <div className="relative">
              <div className="w-[420px] h-[520px] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-slate-200">
                <img src={aboutImage} alt="Students at Atheris Lab School"
                  className="w-full h-full object-cover" />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-6 -left-8 bg-white rounded-xl shadow-lg px-5 py-4 border border-slate-100">
                <p className="text-2xl font-bold" style={{ color: '#1e3a8a' }}>Top Ranked</p>
                <p className="text-xs text-school-body">Karnataka, 2024</p>
              </div>
              <div className="absolute -top-4 -right-6 w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg"
                style={{ background: '#1e3a8a' }}>#1</div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════ ABOUT ════════════ */}
      <section id="about" ref={aboutRef} className="py-24 px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          {/* Left image */}
          <div className={`relative ${aboutInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6'} transition-all duration-700`}>
            <div className="rounded-2xl overflow-hidden shadow-lg ring-1 ring-slate-100">
              <img
                src="https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&q=80&auto=format&fit=crop"
                alt="Classroom at Atheris Lab School"
                className="w-full h-[460px] object-cover"
              />
            </div>
            {/* Decorative square */}
            <div className="absolute -bottom-4 -right-4 w-32 h-32 rounded-xl -z-10" style={{ background: '#eff6ff' }} />
          </div>

          {/* Right text */}
          <div className={`${aboutInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-6'} transition-all duration-700 delay-150`}>
            <span className="section-label">About Us</span>
            <h2 className="font-poppins text-4xl font-bold mt-3 mb-6 leading-tight" style={{ color: '#0f172a' }}>
              Shaping Tomorrow's<br />Leaders Today
            </h2>

            <p className="text-school-body leading-relaxed mb-8">
              Founded in 2012, Atheris Lab School is a CBSE-affiliated institution committed to providing
              exceptional education through a blend of traditional values and modern pedagogy. Our campus
              is a vibrant learning community where curiosity is encouraged and excellence is celebrated.
            </p>

            <div className="space-y-5">
              {[
                {
                  icon: '🔭',
                  title: 'Our Vision',
                  text: 'To be India\'s most innovative school, producing globally-minded graduates who lead with integrity and solve problems with creativity.',
                },
                {
                  icon: '🎯',
                  title: 'Our Mission',
                  text: 'To deliver a holistic, technology-augmented curriculum that nurtures academic excellence, emotional intelligence, and entrepreneurial thinking.',
                },
                {
                  icon: '✦',
                  title: 'Why Choose Atheris?',
                  text: 'Small class sizes, AI-integrated learning tools, dedicated counselling, and a proven track record of 98% board success.',
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-lg"
                    style={{ background: '#eff6ff' }}>
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-sm mb-1" style={{ color: '#0f172a' }}>{item.title}</p>
                    <p className="text-sm text-school-body leading-relaxed">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════ STATS STRIP ════════════ */}
      <section ref={statsRef} className="py-14 px-6" style={{ background: '#1e3a8a' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s, i) => (
            <div key={i} className={`${statsInView ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
              style={{ transitionDelay: `${i * 100}ms` }}>
              <p className="text-4xl font-bold text-white font-poppins">{s.value}</p>
              <p className="text-sm mt-1" style={{ color: '#93c5fd' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════ FEATURES ════════════ */}
      <section id="features" ref={featRef} className="py-24 px-6 lg:px-8" style={{ background: '#f8fafc' }}>
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-14 ${featInView ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}>
            <span className="section-label">Programmes & Facilities</span>
            <h2 className="font-poppins text-4xl font-bold mt-3 mb-4" style={{ color: '#0f172a' }}>
              Everything a Student Needs
            </h2>
            <p className="text-school-body max-w-xl mx-auto text-sm leading-relaxed">
              From cutting-edge labs to dedicated faculty, we provide every resource for academic and personal excellence.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i}
                className={`bg-white rounded-xl p-7 shadow-sm border border-slate-100 card-lift
                  ${featInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} transition-all duration-500`}
                style={{ transitionDelay: `${(i % 3) * 80}ms` }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: '#eff6ff', color: '#1e3a8a' }}>
                  {f.icon}
                </div>
                <h3 className="font-semibold text-base mb-2" style={{ color: '#0f172a' }}>{f.title}</h3>
                <p className="text-sm text-school-body leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ ROLES ════════════ */}
      <section id="roles" ref={rolesRef} className="py-24 px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-14 ${rolesInView ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}>
            <span className="section-label">Portal Access</span>
            <h2 className="font-poppins text-4xl font-bold mt-3 mb-4" style={{ color: '#0f172a' }}>
              Sign In to Your Dashboard
            </h2>
            <p className="text-school-body max-w-xl mx-auto text-sm leading-relaxed">
              Our integrated school management system gives every stakeholder a personalised view.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {roles.map((r, i) => (
              <div key={i}
                className={`rounded-xl border border-slate-200 p-7 card-lift flex flex-col items-start
                  ${rolesInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} transition-all duration-500`}
                style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: '#eff6ff', color: '#1e3a8a' }}>
                  {r.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2" style={{ color: '#0f172a' }}>{r.role}</h3>
                <p className="text-sm text-school-body leading-relaxed mb-6 flex-1">{r.desc}</p>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full btn-outline py-2.5 rounded-lg text-sm font-semibold text-center">
                  Login as {r.role}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ TESTIMONIALS ════════════ */}
      <section ref={testiRef} className="py-24 px-6 lg:px-8" style={{ background: '#f8fafc' }}>
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-14 ${testiInView ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}>
            <span className="section-label">Testimonials</span>
            <h2 className="font-poppins text-4xl font-bold mt-3" style={{ color: '#0f172a' }}>
              What Our Community Says
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i}
                className={`bg-white rounded-xl p-7 shadow-sm border border-slate-100 card-lift
                  ${testiInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} transition-all duration-500`}
                style={{ transitionDelay: `${i * 100}ms` }}>
                {/* Quote mark */}
                <svg className="w-8 h-8 mb-4" style={{ color: '#dbeafe' }} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="text-sm text-school-body leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-5 border-t border-slate-100">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: '#1e3a8a' }}>
                    {t.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#0f172a' }}>{t.name}</p>
                    <p className="text-xs text-school-body">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ CONTACT ════════════ */}
      <section id="contact" ref={contRef} className="py-24 px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-14 ${contInView ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}>
            <span className="section-label">Contact Us</span>
            <h2 className="font-poppins text-4xl font-bold mt-3 mb-4" style={{ color: '#0f172a' }}>
              Get in Touch
            </h2>
            <p className="text-school-body max-w-xl mx-auto text-sm">
              We welcome enquiries from prospective students, parents, and partners.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Info */}
            <div className={`${contInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6'} transition-all duration-700`}>
              <div className="space-y-6">
                {[
                  {
                    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
                    label: 'Address',
                    value: '42, Technopark Avenue, Sector 18, Innovation City — 560 001, Karnataka',
                  },
                  {
                    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
                    label: 'Phone',
                    value: '+91 98765 43210',
                  },
                  {
                    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
                    label: 'Email',
                    value: 'info@atherislab.school',
                  },
                  {
                    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
                    label: 'Office Hours',
                    value: 'Monday – Saturday, 8:00 AM to 5:00 PM',
                  },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#eff6ff', color: '#1e3a8a' }}>
                      {icon}
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-school-body mb-0.5">{label}</p>
                      <p className="text-sm" style={{ color: '#0f172a' }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Accreditation badges */}
              <div className="mt-10 pt-8 border-t border-slate-100">
                <p className="text-xs text-school-body mb-4 font-semibold uppercase tracking-wider">Recognised By</p>
                <div className="flex flex-wrap gap-3">
                  {['CBSE Affiliated', 'ISO 9001:2015', 'NAAC Certified', 'Govt. Recognised'].map(badge => (
                    <span key={badge} className="px-3 py-1.5 rounded-full text-xs font-medium border border-slate-200"
                      style={{ color: '#1e3a8a', background: '#eff6ff' }}>{badge}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Form */}
            <form
              className={`rounded-2xl border border-slate-200 p-8 shadow-sm bg-white
                ${contInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-6'} transition-all duration-700 delay-150`}
              onSubmit={e => { e.preventDefault(); alert("Thank you for your message. We'll respond within 1–2 business days."); e.target.reset(); }}>

              <h3 className="font-poppins font-semibold text-lg mb-6" style={{ color: '#0f172a' }}>Send a Message</h3>

              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-school-body mb-1.5">Full Name</label>
                    <input required placeholder="Jane Smith"
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                      style={{'--tw-ring-color': '#2563eb'}}
                      onFocus={e => e.target.style.boxShadow='0 0 0 3px rgb(37 99 235 / 0.15)'}
                      onBlur={e => e.target.style.boxShadow='none'}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-school-body mb-1.5">Email Address</label>
                    <input required type="email" placeholder="jane@example.com"
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none"
                      onFocus={e => e.target.style.boxShadow='0 0 0 3px rgb(37 99 235 / 0.15)'}
                      onBlur={e => e.target.style.boxShadow='none'}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-school-body mb-1.5">Subject</label>
                  <input placeholder="Admission enquiry"
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none"
                    onFocus={e => e.target.style.boxShadow='0 0 0 3px rgb(37 99 235 / 0.15)'}
                    onBlur={e => e.target.style.boxShadow='none'}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-school-body mb-1.5">Message</label>
                  <textarea rows={4} placeholder="Please write your message here..."
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none resize-none"
                    onFocus={e => e.target.style.boxShadow='0 0 0 3px rgb(37 99 235 / 0.15)'}
                    onBlur={e => e.target.style.boxShadow='none'}
                  />
                </div>
                <button type="submit"
                  className="btn-primary w-full py-3 rounded-lg text-sm font-semibold mt-2">
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ════════════ FOOTER ════════════ */}
      <footer style={{ background: '#f1f5f9', borderTop: '1px solid #e2e8f0' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                  style={{ background: '#1e3a8a' }}>A</div>
                <p className="font-bold text-sm" style={{ color: '#0f172a' }}>Atheris Lab School</p>
              </div>
              <p className="text-sm text-school-body leading-relaxed max-w-xs">
                A premier CBSE-affiliated institution shaping future leaders through innovation, integrity, and excellence.
              </p>
            </div>

            {/* Quick links */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-school-body mb-4">Quick Links</p>
              <ul className="space-y-2">
                {[['About', 'about'], ['Programmes', 'features'], ['Admissions', 'roles'], ['Contact', 'contact']].map(([label, id]) => (
                  <li key={id}>
                    <button onClick={() => scrollTo(id)} className="text-sm text-school-body hover:text-school-navy transition-colors">{label}</button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Portal */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-school-body mb-4">Portals</p>
              <ul className="space-y-2">
                {['Admin', 'Teacher', 'Student', 'Parent'].map(r => (
                  <li key={r}>
                    <button onClick={() => navigate('/login')} className="text-sm text-school-body hover:text-school-navy transition-colors">
                      {r} Login
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-school-body">© {new Date().getFullYear()} Atheris Lab School. All rights reserved.</p>
            <p className="text-xs text-school-body">42, Technopark Avenue, Innovation City, Karnataka</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
