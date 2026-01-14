
import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import PredictionPage from './components/PredictionPage';
import { Page, Language } from './types';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [isScrolled, setIsScrolled] = useState(false);
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('luxe-lang') as Language || 'EN';
    }
    return 'EN';
  });
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('luxe-theme') as 'dark' | 'light' || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('luxe-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('luxe-lang', language);
  }, [language]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      
      const reveals = document.querySelectorAll('.reveal');
      reveals.forEach(reveal => {
        const windowHeight = window.innerHeight;
        const revealTop = reveal.getBoundingClientRect().top;
        const revealPoint = 150;
        if (revealTop < windowHeight - revealPoint) {
          reveal.classList.add('active');
        }
      });
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigateTo = (page: Page) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentPage(page);
  };

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  const toggleLanguage = () => setLanguage(prev => prev === 'EN' ? 'TR' : 'EN');

  const content = {
    EN: { intro: 'Intro', appraisal: 'Appraisal', analyze: 'ANALYZE' },
    TR: { intro: 'Giri\u015f', appraisal: 'Ekspertiz', analyze: 'ANAL\u0130Z' }
  }[language];

  // Absolute metallic styles for consistency across modes
  const absoluteMetallicBtnStyle: React.CSSProperties = {
    background: 'linear-gradient(90deg, #a3a3a3 0%, #e5e5e5 50%, #a3a3a3 100%)',
    border: '1px solid #737373',
    boxShadow: '0 8px 16px -3px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  };

  const absoluteShinyTextStyle: React.CSSProperties = {
    backgroundImage: 'linear-gradient(to right, #000000 0%, #404040 45%, #000000 50%, #404040 55%, #000000 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundSize: '200% auto'
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white selection:bg-black dark:selection:bg-white selection:text-white dark:selection:text-black transition-colors duration-500">
      <header className={`fixed top-3 md:top-6 left-0 w-full z-50 transition-all duration-700 px-3 sm:px-4 md:px-8`}>
        <div className={`max-w-[94%] sm:max-w-[90%] md:max-w-[72%] mx-auto h-14 md:h-16 rounded-full px-5 sm:px-6 md:px-10 flex items-center justify-between transition-all duration-700 backdrop-blur-3xl border border-neutral-400/30 dark:border-white/10 bg-white/15 dark:bg-white/5 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] ${isScrolled ? 'scale-[0.99] opacity-95 shadow-xl h-12 md:h-14' : 'scale-100'}`}>
          <div 
            className="text-xl md:text-2xl font-serif tracking-[0.12em] sm:tracking-[0.16em] md:tracking-[0.2em] cursor-pointer flex items-center gap-2 group"
            onClick={() => navigateTo('landing')}
          >
            <span className="font-bold group-hover:shiny-text transition-all duration-700 uppercase">VOZANT</span>
          </div>
          
          <nav className="flex gap-2 sm:gap-4 md:gap-8 items-center">
            <div className="flex items-center gap-2 sm:gap-4">
              <button 
                onClick={toggleLanguage} 
                className="h-7 sm:h-8 min-w-[2.75rem] sm:min-w-[3.5rem] px-2 sm:px-3 flex items-center justify-center rounded-full border border-black/20 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/10 transition-all group/lang"
              >
                <span className="text-[11px] font-black tracking-[0.2em] opacity-80 group-hover/lang:opacity-100 transition-opacity">
                  {language}
                </span>
              </button>
              
              <button 
                onClick={toggleTheme} 
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
              >
                {theme === 'dark' ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.243 16.243l.707.707M7.757 7.757l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                )}
              </button>
              
              <button 
                onClick={() => navigateTo('prediction')} 
                className="w-28 sm:w-32 md:w-40 py-2 sm:py-2.5 relative overflow-hidden transition-all hover:scale-[1.05] active:scale-95 group rounded-full"
                style={absoluteMetallicBtnStyle}
              >
                <span 
                  className="shiny-text relative z-10 block text-center text-[10px] sm:text-xs font-black tracking-[0.18em] sm:tracking-[0.2em] md:tracking-[0.25em] uppercase font-serif"
                  style={absoluteShinyTextStyle}
                >
                  {content.analyze}
                </span>
              </button>
            </div>
          </nav>
        </div>
      </header>

      <main className="pb-20">
        <div className={currentPage === 'landing' ? 'block' : 'hidden'}>
          <LandingPage onGetStarted={() => navigateTo('prediction')} language={language} />
        </div>
        <div className={currentPage === 'prediction' ? 'block' : 'hidden'}>
          <div className="pt-24 md:pt-32">
            <PredictionPage language={language} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
