
import React from 'react';
import { Language } from '../types';
import carImage from '../main_page/image-3.png';
import carImage1 from '../main_page/image-11.png';
import carImage2 from '../main_page/image-22.png';
import carImage3 from '../main_page/image-1.png';

interface LandingPageProps {
  onGetStarted: () => void;
  language: Language;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, language }) => {
  const isTR = language === 'TR';

    const t = {
    heritage: "",
    title: isTR ? "Değerleme Sanatı." : "The Art of Valuation.",
    discover: isTR ? "DEĞERİ KEŞFEDİN" : "Discover Value",
    pillarsTitle: isTR ? "Vozant’ın Zekâ Katmanları" : "Vozant’s Intelligence Layers",
    pillarsCat: "",
    pillarsDesc: "",
    feature1: {
      title: isTR ? "Gelişmiş Fiyat Algoritması" : "Advanced Pricing Algorithm",
      cat: "",
      desc: isTR ? "Model yılı, kilometre ve teknik özelliklerden fiyatı tahmin eder." : "Predicts price from model year, mileage, and technical specs.",
      img: carImage1
    },
    feature2: {
      title: isTR ? "Araç Bilgi Özeti" : "Vehicle Brief",
      cat: "",
      desc: isTR ? "Seçilen model için dönemsel bağlam ve kısa özet üretir." : "Creates a concise model brief with era context.",
      img: carImage2
    },
    feature3: {
      title: isTR ? "Stüdyo Görselleştirme" : "Studio Visuals",
      cat: "",
      desc: isTR ? "Seçilen araç için çok açılı stüdyo görselleri üretir." : "Generates multi-angle studio imagery for the selected car.",
      img: carImage3
    },
    ctaButton: isTR ? "Değerlemeyi Başlat" : "START VALUATION",
    carouselText: isTR ? "Hassasiyet Zeka Deneyim Veri Analizi " : "Precision Intelligence Experience Data Analysis "
  };

const features = [t.feature1, t.feature2, t.feature3];

  // Absolute styles that bypass theme logic completely for fixed silver appearance
  const absoluteMetallicBtnStyle: React.CSSProperties = {
    background: 'linear-gradient(90deg, #a3a3a3 0%, #e5e5e5 50%, #a3a3a3 100%)',
    border: '1px solid #737373',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    color: '#000000'
  };

  const absoluteShinyTextStyle: React.CSSProperties = {
    backgroundImage: 'linear-gradient(to right, #000000 0%, #525252 45%, #000000 50%, #525252 55%, #000000 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundSize: '200% auto'
  };

  return (
    <div className="flex flex-col font-serif">
      <section className="hero-section relative h-screen min-h-[100svh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1549235081-3d600624654c?auto=format&fit=crop&q=90&w=2000"
            className="w-full h-full object-cover grayscale opacity-40 dark:opacity-60 scale-110 brightness-[1.0] dark:brightness-[1.0] dark:contrast-[1.1]"
            alt="Luxury"
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white dark:from-black via-transparent to-white dark:to-black"></div>
        </div>
        <div className="hero-content relative z-10 text-center px-6 -translate-y-16 sm:-translate-y-12 md:-translate-y-8">
          {t.heritage && (
            <span className="text-[10px] tracking-[0.8em] uppercase opacity-60 dark:opacity-50 mb-6 block animate-pulse font-bold font-serif">{t.heritage}</span>
          )}
          <h1 className="text-4xl sm:text-5xl md:text-[8vw] font-editorial font-medium uppercase leading-[0.9] tracking-[0.18em] sm:tracking-[0.2em] md:tracking-[0.25em] mb-8 sm:mb-10 md:mb-12">
            {isTR ? <>{"DE\u011eERLEME"} <br /> {"SANATI"}</> : <>THE ART OF <br /> VALUATION</>}
          </h1>
          <button 
            onClick={onGetStarted} 
            className="group/hero relative inline-flex items-center justify-center translate-y-2 sm:translate-y-3 md:translate-y-0 px-10 py-4 sm:px-12 sm:py-5 md:px-14 md:py-5 overflow-hidden rounded-full transition-all duration-500 hover:scale-[1.02] hover:-translate-y-0.5 active:scale-95 shadow-xl"
            style={absoluteMetallicBtnStyle}
          >
            <span 
              className="shiny-text relative z-10 block text-center text-[10px] sm:text-xs md:text-sm font-black tracking-[0.18em] sm:tracking-[0.2em] md:tracking-[0.25em] uppercase font-serif transition-all duration-700"
              style={absoluteShinyTextStyle}
            >
              {t.discover}
            </span>
          </button>
        </div>
        <div className="vozant-backdrop absolute bottom-32 sm:bottom-10 md:bottom-0 left-0 w-full overflow-hidden whitespace-nowrap select-none pointer-events-none translate-y-0">
            <h2 className="w-full text-center md:text-left text-[20vw] sm:text-[21vw] md:text-[21vw] font-editorial font-semibold uppercase tracking-[0.03em] italic text-black/10 dark:text-white/20 -translate-x-[3vw] md:-translate-x-[2vw]">VOZANT</h2>
        </div>
      </section>

      {/* Pillars Section */}
      <section className="py-20 md:py-40 mt-10 md:mt-20 px-4 md:px-12 max-w-[1440px] mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 reveal">
          <div className="max-w-xl">
            {t.pillarsCat && (
              <span className="text-[10px] tracking-[0.5em] uppercase opacity-70 dark:opacity-40 font-bold mb-4 block font-serif">{t.pillarsCat}</span>
            )}
            <h2 className="text-4xl md:text-6xl font-serif leading-tight">{t.pillarsTitle}</h2>
          </div>
          {t.pillarsDesc && (
            <p className="text-black/80 dark:text-white/40 text-sm max-w-xs mt-6 md:mt-0 font-serif font-light leading-relaxed italic">{t.pillarsDesc}</p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((card, i) => (
            <div
              key={i}
              className="group relative glass rounded-3xl overflow-hidden h-[460px] sm:h-[500px] lg:h-[540px] transition-all duration-700 hover:-translate-y-4 reveal"
              style={{
                transitionDelay: `${i * 120}ms`,
                clipPath: 'inset(0 0 5% 0 round 1.5rem)'
              }}
            >
              <div className="absolute inset-0">
                <img 
                  src={card.img} 
                  className={`w-full h-full object-cover grayscale brightness-[0.85] contrast-[1.1] dark:brightness-[1.08] dark:contrast-[1.05] group-hover:scale-110 group-hover:grayscale-0 group-hover:brightness-100 group-hover:contrast-100 transition-all duration-700 ease-out ${i === 1 || i === 2 ? '-translate-y-5 md:-translate-y-6' : ''}`}
                  style={{ objectPosition: i === 1 || i === 2 ? 'center 46%' : 'center 60%' }}
                  alt={card.title} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-white/20 to-transparent dark:from-black/100 dark:via-black/40 dark:to-transparent opacity-95 group-hover:opacity-30 transition-all duration-700"></div>
              </div>
              <div className="relative h-full p-8 flex flex-col justify-end">
                {card.cat && (
                  <span className="text-[10px] tracking-[0.4em] uppercase font-black opacity-80 dark:opacity-70 mb-2 font-serif group-hover:opacity-100 transition-opacity">{card.cat}</span>
                )}
                <h3 className={`text-3xl font-serif font-bold mb-4 leading-tight group-hover:shiny-text transition-all duration-500 ${!isTR && (i === 0 || i === 1 || i === 2) ? 'text-[1.65rem] md:text-[1.75rem] whitespace-nowrap tracking-tight' : ''} ${i === 1 ? (isTR ? 'transform translate-y-4 md:translate-y-6' : 'transform -translate-y-1 md:translate-y-0') : i < 3 ? 'transform translate-y-4 md:translate-y-6' : ''}`}>
                  {card.title}
                </h3>
                <p className={`text-lg font-medium opacity-85 dark:opacity-90 leading-relaxed transition-all duration-500 font-serif italic group-hover:opacity-100 ${i === 1 ? (isTR ? 'transform translate-y-4 md:translate-y-6' : 'transform -translate-y-1 md:translate-y-0') : i < 3 ? 'transform translate-y-4 md:translate-y-6' : ''}`}>
                  {card.desc}
                </p>
                <div className="mt-8 w-16 h-[3px] bg-black dark:bg-white transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-14 sm:py-20 px-4 md:px-12">
        <div className="max-w-[1440px] mx-auto reveal">
          <div className="relative rounded-[3rem] bg-[#f9f9fb] dark:bg-[#0c0c0c] p-8 sm:p-10 md:p-16 pt-5 sm:pt-6 md:pt-8 overflow-hidden group transition-all duration-1000 shadow-2xl border border-black/5 dark:border-white/5 min-h-[360px] sm:min-h-[400px] md:min-h-[440px] flex flex-col justify-start max-w-[1240px] mx-auto">
            
            <div className="absolute inset-0 z-0 overflow-hidden">
                <img 
                  src={carImage} 
                  className="w-full h-full object-cover grayscale brightness-[0.85] contrast-[1.1] dark:brightness-[1.08] dark:contrast-[1.05] group-hover:scale-110 group-hover:grayscale-0 group-hover:brightness-100 group-hover:contrast-100 transition-all duration-700 ease-out" 
                  style={{ objectPosition: 'center 55%' }}
                  alt="Bentley Batur Luxury" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white/35 via-white/8 to-transparent dark:from-[#0c0c0c]/90 dark:via-[#0c0c0c]/25 dark:to-transparent opacity-78 group-hover:opacity-30 transition-all duration-700"></div>
            </div>

            <div className="absolute inset-0 opacity-[0.08] dark:opacity-[0.03] pointer-events-none mix-blend-soft-light" style={{backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")'}}></div>
            <div className="absolute -top-32 -right-32 w-128 h-128 glass rounded-full opacity-10 group-hover:opacity-20 group-hover:scale-125 transition-all duration-1000 rotate-12 blur-3xl border border-black/10 dark:border-white/5"></div>
            
            <div className="relative z-10 text-black dark:text-white flex flex-col h-full flex-1">
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-serif leading-[1.1] mb-8 sm:mb-10 md:mb-12 tracking-tighter">
                {isTR ? 
                  <><span className="block font-medium">{"G\u00f6r\u00fcnenin \u00f6tesinde"}</span> <span className="italic shiny-text">{"tahmin."}</span></> : 
                  <><span className="block font-medium">Predicting beyond</span> <span className="italic shiny-text">the visible.</span></>
                }
              </h2>
              
              <div className="flex flex-col md:flex-row md:items-center gap-8 sm:gap-12 md:gap-16 mt-auto">
                <button 
                  onClick={onGetStarted} 
                  className="peer group/btn relative inline-flex items-center justify-center py-4 px-10 overflow-hidden rounded-full transition-all duration-500 hover:scale-[1.02] hover:-translate-y-0.5 active:scale-95 shadow-xl"
                  style={absoluteMetallicBtnStyle}
                >
                    <span 
                      className="shiny-text text-[11px] md:text-xs tracking-[0.28em] uppercase font-bold relative z-10 pointer-events-none font-serif transition-all duration-500"
                      style={absoluteShinyTextStyle}
                    >
                      {t.ctaButton}
                    </span>
                </button>
                
                
                {/* Descriptive Text - Animates with button hover */}
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @media (max-height: 700px) {
          .hero-content {
            transform: translateY(0) !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
