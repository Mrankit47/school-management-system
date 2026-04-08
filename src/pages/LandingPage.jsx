import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useSchoolStore from '../store/schoolStore';

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
    desc: 'Oversee the school — manage users, classes, fees, reports, and daily operations from a unified dashboard.',
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
    text: 'This school has completely transformed how our daughter approaches learning. The faculty is deeply invested in each child\'s progress.',
  },
  {
    name: 'Rahul Mehta',
    role: 'Student — Grade 11',
    text: 'The digital labs and career guidance here are outstanding. My robotics project won at the national level — the mentorship was amazing.',
  },
  {
    name: 'Ms. Anjali Verma',
    role: 'Teacher — Computer Science',
    text: 'The school management platform is a genuine time-saver. I can focus entirely on teaching knowing that attendance and results are handled efficiently.',
  },
];

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════ */
export default function LandingPage() {
  const { schoolId } = useParams();
  const navigate = useNavigate();
  const { school, loading, error, fetchSchoolInfo, clearSchool } = useSchoolStore();
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  useEffect(() => {
    if (schoolId) {
      fetchSchoolInfo(schoolId);
    }
    return () => clearSchool();
  }, [schoolId, fetchSchoolInfo, clearSchool]);

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

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500 font-inter">Loading Portal...</div>;
  if (error || !school) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-inter">
      <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl p-12 text-center animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Access Restricted</h2>
        <p className="text-slate-500 mb-10 leading-relaxed font-medium">
          {error || "We couldn't find the institution you're looking for. Please verify the School ID and try again."}
        </p>

        <div className="space-y-4">
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl transition-all active:scale-[0.98] text-sm"
          >
            Back to Global Portal
          </button>
          
          <div className="pt-4 border-t border-slate-50">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Institutional Identifier</p>
            <p className="text-sm font-mono text-blue-600 font-bold mt-1">ID: {schoolId || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );

  /* Hero image — high quality school campus from Unsplash */
  const heroImage = 'https://images.unsplash.com/photo-1562774053-701939374585?w=1600&q=80&auto=format&fit=crop';
  const aboutImage = 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80&auto=format&fit=crop';

  return (
    <div className="font-inter bg-white text-school-text min-h-screen overflow-x-hidden">

      {/* ════════════ NAVBAR ════════════ */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-sm border-b border-slate-100' : 'bg-white/90 backdrop-blur-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollTo('hero')}>
            {school.logo ? (
                <img src={school.logo} alt={school.name} className="w-9 h-9 rounded-lg" />
            ) : (
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-base font-bold"
                  style={{ background: '#1e3a8a' }}>{school.name[0]}</div>
            )}
            <div>
              <p className="text-sm font-bold text-school-text leading-none">{school.name}</p>
              <p className="text-xs text-school-body leading-none mt-0.5">#{school.school_id}</p>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {[['About', 'about'], ['Programmes', 'features'], ['Admissions', 'roles'], ['Contact', 'contact']].map(([label, id]) => (
              <button key={id} onClick={() => scrollTo(id)} className="nav-link font-semibold">{label}</button>
            ))}
          </nav>

          {/* Dropdown Login CTA */}
          <div className="hidden md:block relative">
            <button 
              onMouseEnter={() => setIsLoginOpen(true)}
              onClick={() => setIsLoginOpen(!isLoginOpen)}
              className="btn-primary px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-school-navy/20 flex items-center gap-2 group"
            >
              Login 
              <span className={`transition-transform duration-300 ${isLoginOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>
            
            {/* Dropdown Menu */}
            {isLoginOpen && (
              <div 
                onMouseLeave={() => setIsLoginOpen(false)}
                className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 animate-in fade-in zoom-in-95 duration-200"
              >
                {[
                  { label: 'As Admin', role: 'admin' },
                  { label: 'As Teacher', role: 'teacher' },
                  { label: 'As Student', role: 'student' },
                ].map((opt) => (
                  <button
                    key={opt.role}
                    onClick={() => navigate(`/school/${school.school_id}/login?role=${opt.role}`)}
                    className="w-full text-left px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-school-navy transition-colors flex items-center justify-between group"
                  >
                    {opt.label}
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </button>
                ))}
              </div>
            )}
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
            <div className="pt-2 border-t border-slate-50 flex flex-col gap-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Login Portals</p>
              <button onClick={() => navigate(`/school/${school.school_id}/login?role=admin`)} className="flex items-center justify-between px-4 py-2 bg-slate-50 rounded-xl text-sm font-bold text-school-navy">Admin Portal <span>→</span></button>
              <button onClick={() => navigate(`/school/${school.school_id}/login?role=teacher`)} className="flex items-center justify-between px-4 py-2 bg-slate-50 rounded-xl text-sm font-bold text-school-blue">Teacher Portal <span>→</span></button>
              <button onClick={() => navigate(`/school/${school.school_id}/login?role=student`)} className="flex items-center justify-between px-4 py-2 bg-slate-50 rounded-xl text-sm font-bold text-school-sky">Student Portal <span>→</span></button>
            </div>
          </div>
        )}
      </header>

      {/* ════════════ HERO ════════════ */}
      <section id="hero" className="relative min-h-screen flex items-center" style={{ paddingTop: '80px' }}>
        {/* Background image */}
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${school.logo || heroImage}')` }} />
        {/* Light overlay */}
        <div className="absolute inset-0" style={{ background: 'rgba(255,255,255,0.85)' }} />
        {/* Left accent bar */}
        <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ background: '#1e3a8a' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-24 grid lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div>
            <div className="inline-flex items-center gap-2 mb-5">
              <span className="w-8 h-px" style={{ background: '#1e3a8a' }} />
              <span className="section-label">Institutional Portal</span>
            </div>

            <h1 className="font-poppins text-5xl lg:text-6xl font-bold leading-tight mb-5" style={{ color: '#0f172a' }}>
              {school.name.split(' ').slice(0, 2).join(' ')}<br />
              <span style={{ color: '#1e3a8a' }}>{school.name.split(' ').slice(2).join(' ') || 'Portal'}</span>
            </h1>

            <p className="text-xl font-medium mb-3" style={{ color: '#2563eb' }}>
              Where Innovation Meets Education
            </p>

            <p className="text-base leading-relaxed mb-10 max-w-lg" style={{ color: '#475569' }}>
              {school.about || `${school.name} is a forward-thinking institution dedicated to holistic development, academic rigour, and technology-integrated learning.`}
            </p>

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
              <div className="w-[420px] h-[520px] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-slate-200 bg-white flex items-center justify-center p-4">
                <img src={school.logo || aboutImage} alt={school.name}
                  className="w-full h-full object-cover rounded-xl" />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-6 -left-8 bg-white rounded-xl shadow-lg px-5 py-4 border border-slate-100">
                <p className="text-2xl font-bold" style={{ color: '#1e3a8a' }}>Top Ranked</p>
                <p className="text-xs text-school-body">Recognised Excellence</p>
              </div>
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
                alt="Classroom"
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
              {school.name} is a premier institution committed to providing exceptional education through a blend of traditional values and modern pedagogy. Our campus is a vibrant learning community.
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
                  title: `Why Choose ${school.name}?`,
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

      {/* ════════════ STATS & FEATURES ════════════ */}
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

          <div className="flex flex-wrap justify-center gap-8">
            {roles.map((r, i) => (
              <div key={i}
                className={`w-full max-w-[320px] rounded-xl border border-slate-200 p-8 card-lift flex flex-col items-start
                  ${rolesInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} transition-all duration-500`}
                style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: '#eff6ff', color: '#1e3a8a' }}>
                  {r.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2" style={{ color: '#0f172a' }}>{r.role}</h3>
                <p className="text-sm text-school-body leading-relaxed mb-6 flex-1">{r.desc}</p>
                <button
                  onClick={() => navigate(`/school/${school.school_id}/login?role=${r.role.toLowerCase()}`)}
                  className="w-full btn-outline py-2.5 rounded-lg text-sm font-semibold text-center">
                  Login as {r.role}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ CONTACT ════════════ */}
      <section id="contact" ref={contRef} className="py-24 px-6 lg:px-8 bg-white" style={{ background: '#f8fafc' }}>
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-14 ${contInView ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}>
            <span className="section-label">Contact Us</span>
            <h2 className="font-poppins text-4xl font-bold mt-3 mb-4" style={{ color: '#0f172a' }}>
              Get in Touch
            </h2>
          </div>

          <div className="max-w-xl mx-auto text-center" style={{ color: '#0f172a' }}>
             <p className="text-lg font-bold mb-2">{school.name}</p>
             <p className="text-school-body mb-2">{school.contact_email || 'contact@school.edu'}</p>
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
                {school.logo ? (
                    <img src={school.logo} alt={school.name} className="w-9 h-9 rounded-lg" />
                ) : (
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                      style={{ background: '#1e3a8a' }}>{school.name[0]}</div>
                )}
                <p className="font-bold text-sm" style={{ color: '#0f172a' }}>{school.name}</p>
              </div>
              <p className="text-sm text-school-body leading-relaxed max-w-xs">
                A premier curriculum institution shaping future leaders through innovation, integrity, and excellence.
              </p>
            </div>
            {/* Quick links */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-school-body mb-4">Portals</p>
              <ul className="space-y-2">
                {['Admin', 'Teacher', 'Student'].map(r => (
                  <li key={r}>
                    <button onClick={() => navigate(`/school/${school.school_id}/login?role=${r.toLowerCase()}`)} className="text-sm text-school-body hover:text-school-navy transition-colors">
                      {r} Login
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {/* Bottom bar */}
          <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-school-body">© {new Date().getFullYear()} {school.name}. All rights reserved.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
