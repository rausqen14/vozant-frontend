
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { CarFeatures, PredictionResult, Language } from '../types';
import { getMarketAnalysis, getCarInfoCard } from '../services/geminiService';
import { getOptions, predictPrice, generateCarImages } from '../services/api';
import fallbackImage1 from '../basic/image-1.png';
import fallbackImage2 from '../basic/2.png';
import fallbackImage3 from '../basic/image-3.png';
import fallbackImage4 from '../basic/4.png';
import fallbackImage5 from '../basic/image-5.png';

interface PredictionPageProps {
  language: Language;
}

interface CustomSelectProps {
  label: string;
  name: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (name: string, value: string) => void;
  labelClasses: string;
  inputClasses: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ label, name, value, options, onChange, labelClasses, inputClasses }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="group space-y-0 relative" ref={containerRef} style={{ position: 'relative' }}>
      <label className={labelClasses}>{label}</label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`${inputClasses} cursor-pointer flex justify-between items-center group/select select-none border-b border-black/20 dark:border-white/20`}
      >
        <span className={`${!value ? 'opacity-30' : ''} tabular-nums lining-nums`}>{selectedOption?.label || value}</span>
        <svg 
          className={`w-4 h-4 transition-transform duration-500 opacity-40 group-hover/select:opacity-100 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div
          className="absolute z-[60] left-0 right-0 mt-2 glass rounded-3xl overflow-hidden border border-black/10 dark:border-white/10 shadow-2xl animate-in fade-in zoom-in-95 duration-300 origin-top"
          style={{ position: 'absolute' }}
        >
          <div className="py-2 px-2 max-h-60 overflow-y-auto">
            {options.map((option) => (
              <div
                key={option.value}
                onClick={() => {
                  onChange(name, option.value);
                  setIsOpen(false);
                }}
                className={`px-6 py-3 mb-1 text-lg font-serif tabular-nums lining-nums transition-all duration-300 cursor-pointer rounded-2xl flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/10 group/item ${value === option.value ? 'bg-black/[0.03] dark:bg-white/[0.08] font-bold' : ''}`}
              >
                <span className="group-hover/item:translate-x-1 transition-transform duration-300">{option.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const INITIAL_FEATURES: CarFeatures = {
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  mileage: 0,
  fuelType: 'Gasoline',
  transmission: 'A',
  engineType: 'I4',
  engineDisplacement: 2000,
  horsepower: 200,
  torque: 300,
  isNew: true,
};

const FALLBACK_IMAGES = [
  fallbackImage1,
  fallbackImage2,
  fallbackImage3,
  fallbackImage4,
  fallbackImage5
];

const parseCarInfoText = (text: string) => {
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  if (!lines.length) {
    return null;
  }
  const title = lines[0] || '';
  const summary = lines[1] || '';
  const bodyLines = lines.slice(2);
  const bullets = bodyLines
    .filter(line => line.startsWith('-'))
    .map(line => line.replace(/^-+\s*/, '').trim())
    .filter(Boolean);
  const extra = bodyLines
    .filter(line => !line.startsWith('-'))
    .join(' ')
    .trim();
  return { title, summary, bullets, extra };
};

const RANGE_MARGIN = 0.05;

const getPriceRange = (price: number) => {
  const safePrice = Math.max(0, price);
  const lower = Math.round(safePrice * (1 - RANGE_MARGIN));
  const upper = Math.round(safePrice * (1 + RANGE_MARGIN));
  return { lower, upper };
};

const renderCarInfoTitle = (title: string, shineOffset: number) => {
  const shineStyle: React.CSSProperties = { animationDelay: `${shineOffset}s` };
  const colonIndex = title.indexOf(':');
  if (colonIndex === -1) {
    return (
      <span className="shiny-text lining-nums tabular-nums" style={shineStyle}>
        {title}
      </span>
    );
  }
  const before = title.slice(0, colonIndex).trim();
  if (!before) {
    return <span>{title}</span>;
  }
  const after = title.slice(colonIndex);
  return (
    <>
    <span className="shiny-text lining-nums tabular-nums" style={shineStyle}>{before}</span>
      <span>{after}</span>
    </>
  );
};

const PredictionPage: React.FC<PredictionPageProps> = ({ language }) => {
  const [features, setFeatures] = useState<CarFeatures>(INITIAL_FEATURES);
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [carInfo, setCarInfo] = useState('');
  const [isCarInfoLoading, setIsCarInfoLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [brandOptions, setBrandOptions] = useState<{ value: string; label: string }[]>([]);
  const [modelOptions, setModelOptions] = useState<{ value: string; label: string }[]>([]);
  const [yearOptions, setYearOptions] = useState<{ value: string; label: string }[]>([]);
  const [fuelOptions, setFuelOptions] = useState<{ value: string; label: string }[]>([]);
  const [transmissionOptions, setTransmissionOptions] = useState<{ value: string; label: string }[]>([]);
  const [engineTypeOptions, setEngineTypeOptions] = useState<{ value: string; label: string }[]>([]);
  const [displacementOptions, setDisplacementOptions] = useState<{ value: string; label: string }[]>([]);
  const [horsepowerOptions, setHorsepowerOptions] = useState<{ value: string; label: string }[]>([]);
  const [torqueOptions, setTorqueOptions] = useState<{ value: string; label: string }[]>([]);
  const [generatedImages, setGeneratedImages] = useState<string[]>(FALLBACK_IMAGES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const zoomContainerRef = useRef<HTMLDivElement>(null);
  const carInfoRequestRef = useRef(0);
  const modelMapRef = useRef<Record<string, string[]>>({});
  const yearMapRef = useRef<Record<string, Record<string, number[]>>>({});
  const attrMapRef = useRef<
    Record<
      string,
      Record<
        string,
        {
          fuel_type: string[];
          transmission: string[];
          engine_type: string[];
          engine_displacement: number[];
          horsepower: number[];
          torque: number[];
        }
      >
    >
  >({});
  const engineDisplacementMapRef = useRef<Record<string, Record<string, Record<string, number[]>>>>({});
  const isTR = language === 'TR';

  useEffect(() => {
    const images = generatedImages.length ? generatedImages : FALLBACK_IMAGES;
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [generatedImages]);

  useEffect(() => {
    if (isModalOpen) {
      setZoomLevel(1);
    }
  }, [isModalOpen, modalIndex]);

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }
    const images = generatedImages.length ? generatedImages : FALLBACK_IMAGES;
    if (modalIndex >= images.length) {
      setModalIndex(0);
    }
  }, [generatedImages, isModalOpen, modalIndex]);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const opts = await getOptions();
        modelMapRef.current = opts.models || {};
        yearMapRef.current = opts.years || {};
        attrMapRef.current = opts.attrs || {};
        engineDisplacementMapRef.current = opts.engine_displacement_map || {};
        setBrandOptions((opts.brands || []).map(b => ({ value: b, label: b })));
      } catch (err) {
        console.error("Failed to load options", err);
      }
    };
    loadOptions();
  }, []);

  useEffect(() => {
    if (!features.brand) {
      setModelOptions([]);
      setYearOptions([]);
      setFuelOptions([]);
      setTransmissionOptions([]);
      setEngineTypeOptions([]);
      setDisplacementOptions([]);
      setHorsepowerOptions([]);
      setTorqueOptions([]);
      return;
    }
    const models = modelMapRef.current[features.brand] || [];
    setModelOptions(models.map(m => ({ value: m, label: m })));
  }, [features.brand]);

  useEffect(() => {
    if (!features.brand || !features.model) {
      setYearOptions([]);
      setFuelOptions([]);
      setTransmissionOptions([]);
      setEngineTypeOptions([]);
      setDisplacementOptions([]);
      setHorsepowerOptions([]);
      setTorqueOptions([]);
      return;
    }
    const years = yearMapRef.current[features.brand]?.[features.model] || [];
    setYearOptions(years.map(y => ({ value: String(y), label: String(y) })));
    if (years.length && !years.includes(features.year)) {
      setFeatures(prev => ({ ...prev, year: years[0] }));
    }

    const attrs = attrMapRef.current[features.brand]?.[features.model];
    if (attrs) {
      setFuelOptions((attrs.fuel_type || []).map(v => ({ value: v, label: v })));
      setTransmissionOptions((attrs.transmission || []).map(v => ({ value: v, label: v })));
      setEngineTypeOptions((attrs.engine_type || []).map(v => ({ value: v, label: v })));
      const engineMap = engineDisplacementMapRef.current[features.brand]?.[features.model] || {};
      const engineTypes = attrs.engine_type || [];
      const engineTypeForOptions = engineTypes.includes(features.engineType) ? features.engineType : engineTypes[0];
      const engineDisplacements = (engineTypeForOptions && engineMap[engineTypeForOptions]?.length)
        ? engineMap[engineTypeForOptions]
        : (attrs.engine_displacement || []);
      setDisplacementOptions(engineDisplacements.map(v => ({ value: String(v), label: String(v) })));
      setHorsepowerOptions((attrs.horsepower || []).map(v => ({ value: String(v), label: String(v) })));
      setTorqueOptions((attrs.torque || []).map(v => ({ value: String(v), label: String(v) })));

      // Auto-select defaults if current selection not in allowed list
      setFeatures(prev => {
        const next = { ...prev };
        if (attrs.fuel_type?.length && !attrs.fuel_type.includes(prev.fuelType)) {
          next.fuelType = attrs.fuel_type[0];
        }
        if (attrs.transmission?.length && !attrs.transmission.includes(prev.transmission)) {
          next.transmission = attrs.transmission[0];
        }
        if (attrs.engine_type?.length && !attrs.engine_type.includes(prev.engineType)) {
          next.engineType = attrs.engine_type[0];
        }
        const nextEngineType = next.engineType;
        const nextEngineDisplacements = (nextEngineType && engineMap[nextEngineType]?.length)
          ? engineMap[nextEngineType]
          : (attrs.engine_displacement || []);
        if (nextEngineDisplacements.length && !nextEngineDisplacements.includes(next.engineDisplacement)) {
          next.engineDisplacement = nextEngineDisplacements[0];
        }
        if (attrs.horsepower?.length && !attrs.horsepower.includes(prev.horsepower)) {
          next.horsepower = attrs.horsepower[0];
        }
        if (attrs.torque?.length && !attrs.torque.includes(prev.torque)) {
          next.torque = attrs.torque[0];
        }
        return next;
      });
    }
  }, [features.brand, features.model]);

  useEffect(() => {
    if (!features.brand || !features.model) {
      return;
    }
    const attrs = attrMapRef.current[features.brand]?.[features.model];
    const engineMap = engineDisplacementMapRef.current[features.brand]?.[features.model] || {};
    if (!attrs) {
      return;
    }
    const engineDisplacements = (features.engineType && engineMap[features.engineType]?.length)
      ? engineMap[features.engineType]
      : (attrs.engine_displacement || []);
    setDisplacementOptions(engineDisplacements.map(v => ({ value: String(v), label: String(v) })));
    if (engineDisplacements.length && !engineDisplacements.includes(features.engineDisplacement)) {
      setFeatures(prev => ({ ...prev, engineDisplacement: engineDisplacements[0] }));
    }
  }, [features.brand, features.model, features.engineType]);

  const t = {
    formTitle: "",
    formCat: "",
    brand: isTR ? "ÜRETİCİ" : "Manufacturer",
    model: isTR ? "MODEL" : "Designation",
    year: isTR ? "MODEL YİLI" : "Vintage",
    mileage: isTR ? "KİLOMETRE (KM)" : "Odometer (KM)",
    fuel: isTR ? "YAKIT TİPİ" : "Fuel System",
    transmission: isTR ? "ŞANZIMAN" : "Transmission",
    engineType: isTR ? "MOTOR TİPİ" : "Engine Architecture",
    displacement: isTR ? "MOTOR HACMİ (CC)" : "Displacement (cc)",
    horsepower: isTR ? "BEYGİR" : "Horsepower",
    torque: isTR ? "TORK" : "Torque",
    isNew: isTR ? "ARAÇ DURUMU" : "Vehicle Condition",
    newLabel: isTR ? "Sıfır" : "New",
    usedLabel: isTR ? "İkinci El" : "Used",
    generate: isTR ? "DEĞER ANALİZİ" : "VALUE ANALYSIS",
    analyzing: isTR ? "ANALİZ EDİLİYOR..." : "ANALYZING ASSET...",
    standingBy: isTR ? "VERİ GİRİŞİ BEKLENİYOR" : "Standing by for input",
    standingBySub: isTR ? "PAZAR SENKRONU ÖNCESİ VERİ DOĞRULAMASI GEREKLİ." : "Data verification required before market synchronization.",
    calculating: isTR ? "PİYASA SAPMASI HESAPLANIYOR" : "Calculating Market Deviation",
    appraisal: isTR ? "PAZAR DEĞERLEMESİ" : "MARKET APPRAISAL",
    estimateLabel: isTR ? "TAHMİNİ FİYAT" : "Estimated price",
    minLabel: isTR ? "EN DÜŞÜK" : "Lowest",
    maxLabel: isTR ? "EN YÜKSEK" : "Highest",
    confidence: isTR ? "ALGORİTMA GÜVENİ" : "ALGORITHM CONFIDENCE",
    synthesis: isTR ? "AI SENTEZİ" : "AI SYNTHESIS",
    profile: isTR ? "ARAÇ PROFİLİ" : "VEHICLE PROFILE",
    profileLoading: isTR ? "ARAÇ BİLGİSİ HAZIRLANIYOR" : "Compiling vehicle brief",
    pdf: isTR ? "GÜVENLİ RAPOR (PDF)" : "SECURE REPORT (PDF)",
    share: isTR ? "DOSYAYI PAYLAŞ" : "SHARE DOSSIER"
  };;;

  const parsedCarInfo = useMemo(() => parseCarInfoText(carInfo), [carInfo]);
  const shineOffset = useMemo(() => -((Date.now() % 3000) / 1000), [result?.estimatedPrice, carInfo]);
  const shineStyle: React.CSSProperties = useMemo(
    () => ({ animationDelay: `${shineOffset}s` }),
    [shineOffset]
  );
  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(isTR ? 'tr-TR' : 'en-US', { maximumFractionDigits: 0 }),
    [isTR]
  );
  const priceRange = useMemo(() => {
    if (!result?.estimatedPrice) {
      return null;
    }
    return getPriceRange(result.estimatedPrice);
  }, [result?.estimatedPrice]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numericFields = ['year', 'mileage', 'horsepower', 'torque', 'engineDisplacement'];
    if (name === 'mileage') {
      setFeatures(prev => {
        const minMileage = prev.isNew ? 0 : 5000;
        const nextMileage = Math.min(350000, Math.max(minMileage, Number(value)));
        return { ...prev, mileage: nextMileage };
      });
      return;
    }
    setFeatures(prev => ({
      ...prev,
      [name]: numericFields.includes(name) ? Number(value) : value
    }));
  };

  const handleCustomSelectChange = (name: string, value: string) => {
    if (name === 'brand') {
      setFeatures(prev => ({ ...prev, brand: value, model: '', year: 0 }));
      return;
    }
    if (name === 'model') {
      setFeatures(prev => ({ ...prev, model: value, year: 0 }));
      return;
    }
    if (name === 'year') {
      setFeatures(prev => ({ ...prev, year: Number(value) }));
      return;
    }
    if (['fuelType', 'transmission', 'engineType'].includes(name)) {
      setFeatures(prev => ({ ...prev, [name]: value } as CarFeatures));
      return;
    }
    if (['engineDisplacement', 'horsepower', 'torque'].includes(name)) {
      setFeatures(prev => ({ ...prev, [name]: Number(value) } as CarFeatures));
      return;
    }
    if (name === 'isNew') {
      const nextIsNew = value === 'true';
      setFeatures(prev => ({
        ...prev,
        isNew: nextIsNew,
        mileage: nextIsNew ? 0 : Math.min(350000, Math.max(prev.mileage, 5000)),
      }));
      return;
    }
    setFeatures(prev => ({ ...prev, [name]: value }));
  };

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!features.brand || !features.model || !features.year) {
      carInfoRequestRef.current += 1;
      setCarInfo('');
      setIsCarInfoLoading(false);
      setResult({
        estimatedPrice: 0,
        marketAnalysis: isTR ? "Lütfen marka, model ve yıl seçiniz." : "Please select a brand, model, and year.",
        confidenceScore: 0
      });
      return;
    }
    setIsCalculating(true);
    setResult(null);
    setCarInfo('');
    setIsCarInfoLoading(true);
    const carInfoRequestId = ++carInfoRequestRef.current;

    try {
      const imagesPromise = generateCarImages({ brand: features.brand, model: features.model, year: features.year })
        .catch((err) => {
          console.error("Image generation error:", err);
          return [];
        });

      const apiResult = await predictPrice(features);
      const [analysis, carInfoText, images] = await Promise.all([
        getMarketAnalysis(features, apiResult.estimatedPrice, language),
        getCarInfoCard(features, language),
        imagesPromise
      ]);

      if (images && images.length) {
        setGeneratedImages(images);
        setCurrentImageIndex(0);
      } else {
        setGeneratedImages(FALLBACK_IMAGES);
      }

      setResult({
        estimatedPrice: apiResult.estimatedPrice,
        marketAnalysis: analysis,
        confidenceScore: apiResult.confidenceScore ?? 0.94,
        raw: apiResult.raw
      });
      if (carInfoRequestRef.current === carInfoRequestId) {
        setCarInfo(carInfoText);
      }
    } catch (error) {
      console.error("Prediction error:", error);
      setGeneratedImages(FALLBACK_IMAGES);
      setResult({
        estimatedPrice: 0,
        marketAnalysis: isTR ? "Model tahmini alınamadı. Lütfen daha sonra tekrar deneyin." : "Prediction service unavailable. Please try again.",
        confidenceScore: 0
      });
      if (carInfoRequestRef.current === carInfoRequestId) {
        setCarInfo('');
      }
    } finally {
      if (carInfoRequestRef.current === carInfoRequestId) {
        setIsCarInfoLoading(false);
      }
      setIsCalculating(false);
    }
  };

  const labelClasses = "text-[10px] uppercase tracking-[0.3em] font-bold opacity-60 dark:opacity-50 group-focus-within:opacity-100 transition-opacity font-serif";
  const inputClasses = "w-full bg-transparent border-b border-black/20 dark:border-white/20 py-2 text-xl focus:border-black dark:focus:border-white focus:outline-none transition-all font-serif tabular-nums lining-nums placeholder:opacity-30 placeholder:font-serif font-medium";
  const MIN_ZOOM = 0.8;
  const MAX_ZOOM = 2.5;
  const ZOOM_STEP = 0.1;

  // Metallic button styles
  const absoluteMetallicBtnStyle: React.CSSProperties = {
    background: 'linear-gradient(90deg, #a3a3a3 0%, #e5e5e5 50%, #a3a3a3 100%)',
    border: '1px solid #737373',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    color: '#000000'
  };

  const clampZoom = (value: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
  const handleWheelZoom = (event: WheelEvent) => {
    event.preventDefault();
    const delta = event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
    setZoomLevel(prev => clampZoom(Math.round((prev + delta) * 10) / 10));
  };

  useEffect(() => {
    const container = zoomContainerRef.current;
    if (!container || !isModalOpen) {
      return;
    }
    const listener = (event: WheelEvent) => handleWheelZoom(event);
    container.addEventListener('wheel', listener, { passive: false });
    return () => {
      container.removeEventListener('wheel', listener);
    };
  }, [isModalOpen]);

    const conditionOptions = [
    { value: "true", label: t.newLabel },
    { value: "false", label: t.usedLabel },
  ];

  const openImageModal = (idx: number) => {
    setModalIndex(idx);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const modalImages = generatedImages.length ? generatedImages : FALLBACK_IMAGES;
  const currentModalImage = modalImages[modalIndex] ?? modalImages[0];
  const hasMultipleModalImages = modalImages.length > 1;
  const goToPrevImage = () => {
    if (modalImages.length < 2) {
      return;
    }
    setModalIndex(prev => (prev - 1 + modalImages.length) % modalImages.length);
  };
  const goToNextImage = () => {
    if (modalImages.length < 2) {
      return;
    }
    setModalIndex(prev => (prev + 1) % modalImages.length);
  };

  return (
    <div className="max-w-[1720px] mx-auto px-6 md:px-10 pb-24 font-serif">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 items-start">
        <div className="lg:col-span-6 space-y-6">
          {(t.formCat || t.formTitle) && (
            <div className="reveal active">
              <span className="text-[10px] tracking-[0.5em] uppercase opacity-70 dark:opacity-40 font-bold mb-4 block">{t.formCat}</span>
              <h2 className="text-3xl md:text-5xl font-serif leading-none tracking-tight">{t.formTitle}</h2>
            </div>
          )}

          <div className="relative z-30 glass rounded-[2.5rem] p-8 md:p-10 border border-black/10 dark:border-white/5 shadow-2xl !overflow-visible lg:min-h-[560px]">
            <form onSubmit={handleCalculate} className="space-y-4 reveal active transition-all duration-1000 flex flex-col">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3 items-end">
              <CustomSelect 
                label={t.brand}
                name="brand"
                value={features.brand}
                options={brandOptions}
                onChange={handleCustomSelectChange}
                labelClasses={labelClasses}
                inputClasses={inputClasses}
              />
              <CustomSelect 
                label={t.model}
                name="model"
                value={features.model}
                options={modelOptions}
                onChange={handleCustomSelectChange}
                labelClasses={labelClasses}
                inputClasses={inputClasses}
              />
              <CustomSelect 
                label={t.year}
                name="year"
                value={features.year ? String(features.year) : ''}
                options={yearOptions}
                onChange={handleCustomSelectChange}
                labelClasses={labelClasses}
                inputClasses={inputClasses}
              />
              <CustomSelect 
                label={t.isNew}
                name="isNew"
                value={features.isNew ? "true" : "false"}
                options={conditionOptions}
                onChange={handleCustomSelectChange}
                labelClasses={labelClasses}
                inputClasses={inputClasses}
              />
              <div className="group space-y-0">
                <label className={labelClasses}>{t.mileage}</label>
                <input
                  type="number"
                  name="mileage"
                  required
                  min={features.isNew ? 0 : 5000}
                  max={350000}
                  value={features.mileage}
                  onChange={handleInputChange}
                  disabled={features.isNew}
                  className={`${inputClasses} ${features.isNew ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
              </div>
              
              <CustomSelect 
                label={t.fuel}
                name="fuelType"
                value={features.fuelType}
                options={fuelOptions}
                onChange={handleCustomSelectChange}
                labelClasses={labelClasses}
                inputClasses={inputClasses}
              />

              <CustomSelect 
                label={t.transmission}
                name="transmission"
                value={features.transmission}
                options={transmissionOptions}
                onChange={handleCustomSelectChange}
                labelClasses={labelClasses}
                inputClasses={inputClasses}
              />

              <CustomSelect 
                label={t.engineType}
                name="engineType"
                value={features.engineType}
                options={engineTypeOptions}
                onChange={handleCustomSelectChange}
                labelClasses={labelClasses}
                inputClasses={inputClasses}
              />

              <CustomSelect 
                label={t.displacement}
                name="engineDisplacement"
                value={String(features.engineDisplacement)}
                options={displacementOptions}
                onChange={handleCustomSelectChange}
                labelClasses={labelClasses}
                inputClasses={inputClasses}
              />

              <CustomSelect 
                label={t.horsepower}
                name="horsepower"
                value={String(features.horsepower)}
                options={horsepowerOptions}
                onChange={handleCustomSelectChange}
                labelClasses={labelClasses}
                inputClasses={inputClasses}
              />

              <CustomSelect 
                label={t.torque}
                name="torque"
                value={String(features.torque)}
                options={torqueOptions}
                onChange={handleCustomSelectChange}
                labelClasses={labelClasses}
                inputClasses={inputClasses}
              />


              <button 
                type="submit" 
                disabled={isCalculating} 
                className={`group relative w-full max-w-[220px] mt-2 inline-flex items-center justify-center h-14 overflow-hidden rounded-full transition-all duration-500 hover:scale-[1.05] hover:-translate-y-0.5 active:scale-[0.98] shadow-xl md:col-start-2 justify-self-end self-end ${isCalculating ? 'opacity-50 cursor-not-allowed' : ''}`}
                style={absoluteMetallicBtnStyle}
              >
                <span 
                  className="text-[12px] tracking-[0.25em] uppercase font-black relative z-10 font-serif text-black leading-none"
                >
                  {isCalculating ? t.analyzing : t.generate}
                </span>
              </button>
              </div>
            </form>
          </div>

          {result && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom duration-1000 font-serif">
              <div className="relative z-10 rounded-[3rem] glass p-6 md:p-8 overflow-hidden border border-black/10 dark:border-white/5 shadow-2xl lg:min-h-[220px]">
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-soft-light" style={{backgroundImage: 'url("https://www.transparenttextures.com/patterns/brilliant.png")'}}></div>

                <div className="relative z-10 text-center">
                  <div className="text-[11px] uppercase tracking-[0.45em] font-bold opacity-70 dark:opacity-60 font-serif">
                    {t.appraisal}
                  </div>
                  <div
                    className="text-4xl md:text-5xl font-serif mt-4 tracking-tight lining-nums tabular-nums shiny-text"
                    style={shineStyle}
                  >
                    ${numberFormatter.format(result.estimatedPrice)}
                  </div>
                  {priceRange && (
                    <div className="mt-4 grid grid-cols-2 gap-6 text-base md:text-lg font-serif opacity-80 justify-items-center">
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-60 font-serif">{t.minLabel}</div>
                        <div className="text-2xl md:text-3xl font-serif lining-nums tabular-nums">
                          ${numberFormatter.format(priceRange.lower)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-60 font-serif">{t.maxLabel}</div>
                        <div className="text-2xl md:text-3xl font-serif lining-nums tabular-nums">
                          ${numberFormatter.format(priceRange.upper)}
                        </div>
                      </div>
                    </div>
                  )}

                  {result.marketAnalysis?.trim() && (
                    <div className="space-y-6 pt-12 border-t border-black/10 dark:border-white/10">
                      <div className="flex items-center gap-4">
                        <div className="w-2 h-2 bg-black dark:bg-white rounded-full animate-pulse"></div>
                        <span className="text-[10px] uppercase tracking-[0.5em] font-bold opacity-60 font-serif">{t.synthesis}</span>
                      </div>
                      <p className="text-2xl md:text-3xl font-serif leading-snug opacity-90 italic max-w-4xl">"{result.marketAnalysis}"</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-6 space-y-6">
          <div className="relative group rounded-[3rem] overflow-hidden glass border border-black/10 dark:border-white/5 transition-all duration-1000 reveal active aspect-[16/9] md:aspect-[16/8] lg:h-[50vh] lg:aspect-auto cursor-zoom-in">
             <div className="absolute inset-0 z-0">
                {(generatedImages.length ? generatedImages : FALLBACK_IMAGES).map((img, idx) => {
                  const src = (img.startsWith('http') || img.startsWith('/') || img.startsWith('blob:') || img.includes('assets/'))
                    ? img
                    : (img.startsWith('data:') ? img : `data:image/png;base64,${img}`);
                  const isActive = idx === currentImageIndex;
                  return (
                    <div
                      key={idx}
                      onClick={() => openImageModal(idx)}
                      className={`absolute inset-0 transition-all duration-1000 ease-in-out cursor-zoom-in ${isActive ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-100 pointer-events-none'}`}
                    >
                      <img
                        src={src}
                        className="absolute inset-0 w-full h-full object-cover object-center grayscale brightness-[0.85] contrast-[1.1] dark:brightness-[1.08] dark:contrast-[1.05] transition-all duration-700 group-hover:grayscale-0 group-hover:brightness-100 group-hover:contrast-100"
                        alt={`Asset Visualization ${idx}`}
                      />
                    </div>
                  );
                })}
             </div>
             
             <div className="absolute top-10 left-10 w-6 h-6 border-t-2 border-white/20"></div>
             <div className="absolute top-10 right-10 w-6 h-6 border-t-2 border-white/20"></div>
             <div className="absolute bottom-10 left-10 w-6 h-6 border-b-2 border-white/20"></div>
             <div className="absolute bottom-10 right-10 w-6 h-6 border-b-2 border-white/20"></div>
          </div>

          {(parsedCarInfo || carInfo?.trim()) && (
            <div className="relative rounded-[3rem] glass p-8 md:p-10 overflow-hidden border border-black/10 dark:border-white/5 shadow-2xl lg:min-h-[320px]">
              <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-soft-light" style={{backgroundImage: 'url("https://www.transparenttextures.com/patterns/brilliant.png")'}}></div>
              <div className="relative z-10 space-y-6 pr-2">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-black dark:bg-white rounded-full animate-pulse"></div>
                  <span className="text-[10px] uppercase tracking-[0.5em] font-bold opacity-60 font-serif">{t.profile}</span>
                </div>
                {!isCarInfoLoading && parsedCarInfo && (
                  <>
                    {parsedCarInfo.title && (
                      <h3 className="text-3xl md:text-4xl font-serif tracking-tight lining-nums tabular-nums">{renderCarInfoTitle(parsedCarInfo.title, shineOffset)}</h3>
                    )}
                    {parsedCarInfo.summary && (
                      <p className="text-lg md:text-xl font-serif italic opacity-90">{parsedCarInfo.summary}</p>
                    )}
                    {parsedCarInfo.extra && (
                      <p className="text-base md:text-lg font-serif opacity-85">{parsedCarInfo.extra}</p>
                    )}
                    {parsedCarInfo.bullets.length > 0 && (
                      <ul className="space-y-2 text-base md:text-lg font-serif opacity-85 lining-nums tabular-nums">
                        {parsedCarInfo.bullets.map((item, idx) => (
                          <li key={`${item}-${idx}`} className="flex gap-3">
                            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-black/70 dark:bg-white/70"></span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
                {!isCarInfoLoading && !parsedCarInfo && carInfo?.trim() && (
                  <p className="text-lg md:text-xl font-serif italic opacity-90">{carInfo}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

            {isModalOpen && currentModalImage && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm px-6"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-5xl overflow-visible"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={goToPrevImage}
              aria-label="Previous image"
              disabled={!hasMultipleModalImages}
              className="absolute -left-16 top-1/2 -translate-y-1/2 z-20 h-11 w-11 rounded-full border border-black/50 dark:border-white/50 bg-white/90 dark:bg-black/70 text-black/80 dark:text-white/80 shadow-lg transition hover:scale-[1.03] hover:text-black dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={goToNextImage}
              aria-label="Next image"
              disabled={!hasMultipleModalImages}
              className="absolute -right-16 top-1/2 -translate-y-1/2 z-20 h-11 w-11 rounded-full border border-black/50 dark:border-white/50 bg-white/90 dark:bg-black/70 text-black/80 dark:text-white/80 shadow-lg transition hover:scale-[1.03] hover:text-black dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
            <div className="relative glass rounded-[3rem] border border-black/10 dark:border-white/10 p-5 sm:p-6 shadow-2xl w-full">
              <div className="flex flex-col gap-5">
                <div className="relative w-full">
                  <div
                    ref={zoomContainerRef}
                    className="relative w-full rounded-[2.5rem] overflow-hidden bg-white/70 dark:bg-black/40 border border-black/5 dark:border-white/5"
                  >
                    <img
                      src={(currentModalImage.startsWith('http') || currentModalImage.startsWith('/') || currentModalImage.startsWith('blob:') || currentModalImage.includes('assets/'))
                        ? currentModalImage
                        : (currentModalImage.startsWith('data:') ? currentModalImage : `data:image/png;base64,${currentModalImage}`)}
                      alt="Car image"
                      className="w-full max-h-[70vh] object-contain bg-black/5 dark:bg-white/5 transition-transform duration-200 ease-out origin-center"
                      style={{ transform: `scale(${zoomLevel})` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PredictionPage;
