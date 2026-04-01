import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SaaSLanding() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [schoolId, setSchoolId] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (schoolId.trim()) {
      navigate(`/school/${schoolId.trim()}`);
    }
  };

  return (
    <div className="bg-slate-50 text-slate-900 font-inter min-h-screen">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-20 items-center">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>
                    </div>
                    <span className="text-xl font-extrabold tracking-tight text-slate-800">School Conduct</span>
                </div>
                <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
                    <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
                    <a href="#about" className="hover:text-blue-600 transition-colors">About</a>
                    <a href="#contact" className="hover:text-blue-600 transition-colors">Contact</a>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/superadmin/login')} className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">Superadmin</button>
                    <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all">School Login</button>
                </div>
            </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="py-24 bg-gradient-to-b from-white to-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8 pb-10">
              <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 leading-tight">
                  Empower Your School with <br/><span className="text-blue-600">Smart Discipline Tracking</span>
              </h1>
              <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
                  The all-in-one SaaS platform for schools to manage attendance, student conduct, fees, and communication effortlessly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10">Get Started Now</button>
                  <a href="#features" className="w-full sm:w-auto bg-white text-slate-600 border border-slate-200 px-8 py-4 rounded-2xl font-bold text-lg hover:border-blue-600 hover:text-blue-600 transition-all">Learn More</a>
              </div>
          </div>
      </header>

      {/* Features */}
      <section id="features" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything you need to run your school</h2>
                  <p className="text-slate-500">Powerful features tailored for modern educational institutions.</p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                  <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-all">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-3">Conduct Tracking</h3>
                      <p className="text-slate-500 text-sm leading-relaxed">Detailed reports on student and teacher conduct, identifying patterns and improving environment.</p>
                  </div>
                  <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-all">
                      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-6">
                          <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-3">Time Management</h3>
                      <p className="text-slate-500 text-sm leading-relaxed">Dynamic timetables and automated attendance tracking for students and staff.</p>
                  </div>
                  <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-all">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-3">Role Management</h3>
                      <p className="text-slate-500 text-sm leading-relaxed">Granular access control for Admins, Teachers, Students, and Staff members.</p>
                  </div>
              </div>
          </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-slate-900 text-slate-400 py-16 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid md:grid-cols-4 gap-12">
                  <div className="col-span-2">
                      <div className="flex items-center gap-2 text-white mb-6">
                          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"/></svg>
                          </div>
                          <span className="text-lg font-bold">School Conduct</span>
                      </div>
                      <p className="max-w-sm mb-6">The modern standard for digital school management. Built for schools that value efficiency and transparency.</p>
                  </div>
                  <div>
                      <h4 className="text-white font-bold mb-6">Quick Links</h4>
                      <ul className="space-y-4 text-sm">
                          <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                          <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
                          <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
                      </ul>
                  </div>
                  <div>
                      <h4 className="text-white font-bold mb-6">Support</h4>
                      <ul className="space-y-4 text-sm font-medium">
                          <li className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                              hello@schoolconduct.com
                          </li>
                      </ul>
                  </div>
              </div>
              <div className="mt-16 pt-8 border-t border-slate-800 text-sm flex justify-between items-center">
                  <p>&copy; {new Date().getFullYear()} School Conduct SaaS. All rights reserved.</p>
                  <div className="flex gap-6">
                      <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                      <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                  </div>
              </div>
          </div>
      </footer>

      {/* Find School Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-slate-900">Find Your School</h3>
                      <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                      </button>
                  </div>
                  <form onSubmit={handleSearch} className="space-y-4">
                      <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">School ID</label>
                          <input 
                              type="text" 
                              placeholder="e.g. DEFAULT" 
                              value={schoolId}
                              onChange={(e) => setSchoolId(e.target.value)}
                              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                              required
                          />
                      </div>
                      <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20">
                          Go to Portal
                      </button>
                      <p className="text-xs text-slate-500 text-center mt-4">Ask your administrator for your school ID.</p>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}
