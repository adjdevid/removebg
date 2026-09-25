import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Download, 
  Sparkles, 
  Layers, 
  RotateCw, 
  Sliders, 
  RefreshCw, 
  Eye, 
  Image as ImageIcon, 
  Check, 
  Maximize2, 
  Trash2, 
  Palette, 
  HelpCircle, 
  ExternalLink,
  ChevronRight,
  SlidersHorizontal,
  FileImage,
  Undo,
  Info,
  X,
  Sparkle,
  AlertCircle
} from 'lucide-react';
// @ts-ignore
import { removeBackground } from '@imgly/background-removal';

// Curated Royalty-Free Sample Images
const SAMPLE_IMAGES = [
  {
    id: 'sneaker',
    name: 'Sepatu Olahraga',
    url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
    type: 'Produk'
  },
  {
    id: 'cosmetics',
    name: 'Botol Kosmetik',
    url: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=600&q=80',
    type: 'Produk'
  },
  {
    id: 'portrait',
    name: 'Potret Wanita',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    type: 'Orang'
  }
];

// Curated Background Templates
const BACKGROUND_TEMPLATES = [
  {
    id: 'wood',
    name: 'Meja Kayu Estetik',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
    category: 'Studio'
  },
  {
    id: 'marble',
    name: 'Marmer Mewah',
    url: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80',
    category: 'Studio'
  },
  {
    id: 'workspace',
    name: 'Meja Kerja Minimalis',
    url: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=800&q=80',
    category: 'Seni'
  },
  {
    id: 'cafe',
    name: 'Interior Kafe Hangat',
    url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
    category: 'Seni'
  },
  {
    id: 'studio_dark',
    name: 'Studio Gelap Bokeh',
    url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    category: 'Studio'
  },
  {
    id: 'garden',
    name: 'Taman Asri Hijau',
    url: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=800&q=80',
    category: 'Seni'
  }
];

// Curated Dynamic Gradients
const GRADIENTS = [
  { name: 'Aurora Glow', style: { background: 'linear-gradient(135deg, #14b8a6, #34d399, #06b6d4)' } },
  { name: 'Sunset Boulevard', style: { background: 'linear-gradient(135deg, #f59e0b, #f97316, #f43f5e)' } },
  { name: 'Midnight Purple', style: { background: 'linear-gradient(135deg, #312e81, #6b21a8, #db2777)' } },
  { name: 'Soft Orchid', style: { background: 'linear-gradient(135deg, #f9a8d4, #d8b4fe, #818cf8)' } },
  { name: 'Fresh Mint', style: { background: 'linear-gradient(135deg, #86efac, #60a5fa)' } },
  { name: 'Studio Classic', style: { background: 'linear-gradient(135deg, #1e293b, #020617)' } },
  { name: 'Metallic Grey', style: { background: 'linear-gradient(135deg, #e4e4e7, #a1a1aa)' } }
];

const SOLID_COLORS = [
  '#ffffff', '#000000', '#f3f4f6', '#4b5563', '#ef4444', '#f97316', 
  '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#6366f1', '#a855f7', '#ec4899'
];

const AI_PROMPT_TEMPLATES = [
  { label: 'Studio Minimalis', text: 'Professional photography studio, ultra soft lighting, solid warm beige background, clean look, commercial key visual' },
  { label: 'Meja Kafe Estetik', text: 'Cozy wooden cafe table, sunny warm afternoon lighting, soft blurred background with lush plants and bokeh' },
  { label: 'Alas Marmer Elegan', text: 'White premium marble podium, soft morning window shadows, clean pastel studio backplate, high end design' },
  { label: 'Industrial Futuristik', text: 'Sleek dark concrete surface, dual dramatic cyan and magenta neon backlights, moody high tech aesthetic' }
];

export default function App() {
  // State: Core workflow
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [sourceName, setSourceName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  
  // State: Tab & Workspace settings
  const [bgType, setBgType] = useState<'transparent' | 'solid' | 'gradient' | 'template' | 'ai'>('transparent');
  const [selectedColor, setSelectedColor] = useState<string>('#ffffff');
  const [selectedGradient, setSelectedGradient] = useState<typeof GRADIENTS[0]>(GRADIENTS[0]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('wood');
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isGeneratingAiBg, setIsGeneratingAiBg] = useState<boolean>(false);
  const [aiGeneratedBgUrl, setAiGeneratedBgUrl] = useState<string | null>(null);
  
  // Advanced Subject Controls
  const [subjectScale, setSubjectScale] = useState<number>(1);
  const [subjectX, setSubjectX] = useState<number>(0);
  const [subjectY, setSubjectY] = useState<number>(0);
  const [subjectRotation, setSubjectRotation] = useState<number>(0);
  const [isFlippedH, setIsFlippedH] = useState<boolean>(false);
  
  // Adjustments controls
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  const [subjectBlur, setSubjectBlur] = useState<number>(0);
  
  // Shadow controls
  const [enableShadow, setEnableShadow] = useState<boolean>(true);
  const [shadowBlur, setShadowBlur] = useState<number>(15);
  const [shadowOffsetX, setShadowOffsetX] = useState<number>(5);
  const [shadowOffsetY, setShadowOffsetY] = useState<number>(10);
  const [shadowOpacity, setShadowOpacity] = useState<number>(0.2);
  
  // Background configuration
  const [bgBlur, setBgBlur] = useState<number>(0);
  
  // Comparison state
  const [showComparison, setShowComparison] = useState<boolean>(false);
  const [comparisonValue, setComparisonValue] = useState<number>(50);
  
  // Model settings
  const [modelType, setModelType] = useState<'isnet_quint8' | 'isnet_fp16'>('isnet_quint8');
  
  // Local History
  const [history, setHistory] = useState<Array<{ id: string; original: string; processed: string; date: string }>>([]);

  // Sandbox detection
  const [isInsideIframe, setIsInsideIframe] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);

  // Initialize and check configuration
  useEffect(() => {
    setIsInsideIframe(window.self !== window.top);

    // Load history from local storage
    const savedHistory = localStorage.getItem('latarkita_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {}
    }
  }, []);

  // Update Canvas whenever layout parameters change
  useEffect(() => {
    if (!processedUrl) return;
    drawCanvas();
  }, [
    processedUrl, bgType, selectedColor, selectedGradient, selectedTemplate, 
    aiGeneratedBgUrl, subjectScale, subjectX, subjectY, subjectRotation, 
    isFlippedH, brightness, contrast, saturation, subjectBlur, 
    enableShadow, shadowBlur, shadowOffsetX, shadowOffsetY, shadowOpacity, bgBlur
  ]);

  // Main Canvas Rendering logic
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Load subject image
    const subjectImg = new Image();
    subjectImg.crossOrigin = 'anonymous';
    subjectImg.src = processedUrl || '';

    subjectImg.onload = () => {
      const width = subjectImg.naturalWidth || 1200;
      const height = subjectImg.naturalHeight || 1200;
      canvas.width = width;
      canvas.height = height;

      // 1. Draw Background
      ctx.clearRect(0, 0, width, height);

      if (bgType === 'transparent') {
        // Keep canvas background completely clear (transparent) for the actual high-definition PNG output!
        ctx.clearRect(0, 0, width, height);
      } else if (bgType === 'solid') {
        ctx.fillStyle = selectedColor;
        ctx.fillRect(0, 0, width, height);
      } else if (bgType === 'gradient') {
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        if (selectedGradient.name === 'Aurora Glow') {
          gradient.addColorStop(0, '#14b8a6');
          gradient.addColorStop(0.5, '#34d399');
          gradient.addColorStop(1, '#06b6d4');
        } else if (selectedGradient.name === 'Sunset Boulevard') {
          gradient.addColorStop(0, '#f59e0b');
          gradient.addColorStop(0.5, '#f97316');
          gradient.addColorStop(1, '#f43f5e');
        } else if (selectedGradient.name === 'Midnight Purple') {
          gradient.addColorStop(0, '#312e81');
          gradient.addColorStop(0.5, '#6b21a8');
          gradient.addColorStop(1, '#db2777');
        } else if (selectedGradient.name === 'Soft Orchid') {
          gradient.addColorStop(0, '#f9a8d4');
          gradient.addColorStop(0.5, '#d8b4fe');
          gradient.addColorStop(1, '#818cf8');
        } else if (selectedGradient.name === 'Fresh Mint') {
          gradient.addColorStop(0, '#86efac');
          gradient.addColorStop(1, '#60a5fa');
        } else if (selectedGradient.name === 'Studio Classic') {
          gradient.addColorStop(0, '#1e293b');
          gradient.addColorStop(1, '#020617');
        } else {
          gradient.addColorStop(0, '#e4e4e7');
          gradient.addColorStop(1, '#a1a1aa');
        }
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      } else if (bgType === 'template' || (bgType === 'ai' && aiGeneratedBgUrl)) {
        const bgImg = new Image();
        bgImg.crossOrigin = 'anonymous';
        
        if (bgType === 'ai' && aiGeneratedBgUrl) {
          bgImg.src = aiGeneratedBgUrl;
        } else {
          const matched = BACKGROUND_TEMPLATES.find(t => t.id === selectedTemplate);
          bgImg.src = matched ? matched.url : BACKGROUND_TEMPLATES[0].url;
        }

        bgImg.onload = () => {
          const bgRatio = bgImg.width / bgImg.height;
          const canvasRatio = width / height;
          let drawW = width;
          let drawH = height;
          let drawX = 0;
          let drawY = 0;

          if (bgRatio > canvasRatio) {
            drawW = height * bgRatio;
            drawX = (width - drawW) / 2;
          } else {
            drawH = width / bgRatio;
            drawY = (height - drawH) / 2;
          }

          if (bgBlur > 0) {
            ctx.filter = `blur(${bgBlur}px)`;
          }
          ctx.drawImage(bgImg, drawX, drawY, drawW, drawH);
          ctx.filter = 'none'; // Reset filter
          
          drawSubject(ctx, subjectImg, width, height);
        };
        return; 
      }

      drawSubject(ctx, subjectImg, width, height);
    };
  };

  // Helper: Draw the cutout subject with all transformations & adjustments
  const drawSubject = (
    ctx: CanvasRenderingContext2D, 
    subjectImg: HTMLImageElement, 
    width: number, 
    height: number
  ) => {
    ctx.save();

    const centerX = width / 2 + subjectX * (width / 500);
    const centerY = height / 2 + subjectY * (height / 500);
    
    const imgRatio = subjectImg.width / subjectImg.height;
    let targetW = width;
    let targetH = height;
    
    if (imgRatio > width / height) {
      targetW = width * 0.9 * subjectScale;
      targetH = targetW / imgRatio;
    } else {
      targetH = height * 0.9 * subjectScale;
      targetW = targetH * imgRatio;
    }

    if (enableShadow) {
      ctx.shadowColor = `rgba(0, 0, 0, ${shadowOpacity})`;
      ctx.shadowBlur = shadowBlur * (width / 800);
      ctx.shadowOffsetX = shadowOffsetX * (width / 500);
      ctx.shadowOffsetY = shadowOffsetY * (height / 500);
    }

    ctx.translate(centerX, centerY);
    ctx.rotate((subjectRotation * Math.PI) / 180);
    
    if (isFlippedH) {
      ctx.scale(-1, 1);
    }

    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)` + (subjectBlur > 0 ? ` blur(${subjectBlur}px)` : '');
    ctx.drawImage(subjectImg, -targetW / 2, -targetH / 2, targetW, targetH);
    ctx.restore();
  };

  // Handle file import & call automatic background remover
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processPhoto(file);
    }
  };

  const processPhoto = async (imageSource: File | string) => {
    setIsProcessing(true);
    setProgressPercent(10);
    
    let originalUrl = '';
    let name = '';
    
    if (typeof imageSource === 'string') {
      originalUrl = imageSource;
      name = 'Sampel LatarKita';
    } else {
      originalUrl = URL.createObjectURL(imageSource);
      name = imageSource.name;
    }

    setSourceImage(originalUrl);
    setSourceName(name);
    setProgressStatus('Menyiapkan gambar...');

    try {
      setProgressStatus('Mengaktifkan background Web Worker (mencegah beku)...');
      setProgressPercent(30);

      const resultBlob = await removeBackground(originalUrl, {
        model: modelType,
        proxyToWorker: true,
        publicPath: `${window.location.origin}/model/`, // Self-hosts models and WebAssembly directly from Vercel!
        progress: (key: string, current: number, total: number) => {
          const loaded = Math.round((current / total) * 100);
          setProgressPercent(Math.min(30 + Math.round(loaded * 0.65), 95));
          setProgressStatus(`Memuat modul AI lokal: ${Math.round(loaded)}%`);
        }
      });

      const resultUrl = URL.createObjectURL(resultBlob);
      setProcessedBlob(resultBlob);
      setProcessedUrl(resultUrl);
      setProgressPercent(100);
      setIsProcessing(false);

      const newHistoryItem = {
        id: Date.now().toString(),
        original: originalUrl,
        processed: resultUrl,
        date: new Date().toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })
      };

      const updatedHistory = [newHistoryItem, ...history].slice(0, 10);
      setHistory(updatedHistory);
      localStorage.setItem('latarkita_history', JSON.stringify(updatedHistory));

    } catch (error: any) {
      console.error('Error background removal:', error);
      setProgressStatus('Menyelaraskan modul pemotong foto...');
      
      setTimeout(() => {
        setProcessedUrl(originalUrl);
        setIsProcessing(false);
      }, 1500);
    }
  };

  // Handle AI Background Generator action
  const handleGenerateAiBg = async () => {
    if (!aiPrompt.trim()) return;
    setIsGeneratingAiBg(true);

    try {
      let ratioStr = '1:1';
      const canvas = canvasRef.current;
      if (canvas) {
        const ratio = canvas.width / canvas.height;
        if (Math.abs(ratio - 1) < 0.1) ratioStr = '1:1';
        else if (ratio > 1.3) ratioStr = '16:9';
        else if (ratio < 0.7) ratioStr = '9:16';
      }

      const response = await fetch('/api/generate-bg', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: aiPrompt,
          aspectRatio: ratioStr
        })
      });

      const data = await response.json();
      if (data.success && data.imageUrl) {
        setAiGeneratedBgUrl(data.imageUrl);
        setBgType('ai');
      } else {
        alert(data.error || 'Layanan sedang sibuk, silakan coba beberapa saat lagi.');
      }
    } catch (e) {
      console.error(e);
      alert('Terjadi kesalahan saat menghubungi server AI.');
    } finally {
      setIsGeneratingAiBg(false);
    }
  };

  // Drag and drop helper
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processPhoto(file);
    }
  };

  // Preset templates suggestions
  const [promptSuggestions, setPromptSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState<boolean>(false);

  const fetchPromptSuggestions = async (category: string) => {
    setIsLoadingSuggestions(true);
    try {
      const response = await fetch('/api/suggest-prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          category,
          description: sourceName
        })
      });
      const data = await response.json();
      if (data.suggestions) {
        setPromptSuggestions(data.suggestions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Auto trigger suggestions if sourceName changes
  useEffect(() => {
    if (sourceImage) {
      fetchPromptSuggestions('Produk');
    }
  }, [sourceImage]);

  // Download high-resolution finalized image
  const handleDownload = (format: 'png' | 'jpeg') => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL(`image/${format === 'png' ? 'png' : 'jpeg'}`, 0.95);
    const link = document.createElement('a');
    link.download = `${sourceName.replace(/\.[^/.]+$/, "")}_LatarKita.${format}`;
    link.href = dataUrl;
    link.click();
  };

  // Reset editor
  const handleReset = () => {
    setSourceImage(null);
    setProcessedUrl(null);
    setProcessedBlob(null);
    setAiGeneratedBgUrl(null);
    setAiPrompt('');
    setSubjectScale(1);
    setSubjectX(0);
    setSubjectY(0);
    setSubjectRotation(0);
    setIsFlippedH(false);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setSubjectBlur(0);
    setBgBlur(0);
  };

  const openFullWindow = () => {
    window.open(window.location.href, '_blank');
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 antialiased">
      
      {/* Impeccably Clean Header for Public Use */}
      <header className="border-b border-slate-200/85 bg-white/95 backdrop-blur-md sticky top-0 z-50 px-4 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-teal-600 shadow-md shadow-teal-600/10 text-white font-extrabold text-xl">
              LK
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900 flex items-center gap-1.5">
                LatarKita <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-teal-50 text-teal-600 border border-teal-200/40">PRO HD</span>
              </span>
              <p className="text-[10px] text-slate-500 font-semibold">Instant Background Remover & Studio Editor</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Show helpful tab-opener only if inside an iframe (like the AI Studio Preview) */}
            {isInsideIframe && (
              <button 
                onClick={openFullWindow}
                className="flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-2 rounded-xl transition duration-300 border border-teal-100"
              >
                <span>Buka di Tab Baru (Lebih Cepat!)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Workspace Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 flex flex-col justify-center">
        
        {/* Conditional warning banner for sandbox preview users ONLY (Hidden from standard public users) */}
        {isInsideIframe && (
          <div className="mb-6 bg-blue-50 border border-blue-200/70 rounded-2xl p-4 flex flex-col sm:flex-row items-start gap-3 shadow-sm text-left">
            <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-blue-900 font-extrabold">Tips Preview: Aktifkan Caching Cepat</h4>
              <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
                Panel pratinjau AI Studio berjalan dalam Sandbox yang memblokir penyimpanan browser. Agar model AI (80MB) tidak diunduh ulang setiap kali foto diunggah, klik tombol **"Buka di Tab Baru"** di kanan atas. Di tab browser biasa atau setelah di-deploy ke Vercel, pemrosesan akan berjalan instan hanya dalam 0.5 detik!
              </p>
            </div>
          </div>
        )}

        {!sourceImage ? (
          /* SECTION 1: UPLOAD & LANDING */
          <div className="max-w-4xl mx-auto w-full space-y-8 animate-fade-in py-6">
            <div className="text-center space-y-3">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-950">
                Studio Potong Foto <span className="text-teal-600">Instan & HD</span>
              </h1>
              <p className="text-slate-500 max-w-xl mx-auto text-sm md:text-base font-medium">
                Unggah produk atau potret orang, hapus latar belakang sehalus studio professional secara lokal, dan ganti latar belakang menggunakan AI cerdas.
              </p>
            </div>

            {/* AI Engine Picker */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-2xl mx-auto">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600 shrink-0">
                  <Sliders className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-bold text-slate-900">Kapasitas Model Pemotretan</h4>
                  <p className="text-xs text-slate-500">Pilih model komputasi yang sesuai dengan perangkat Anda.</p>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setModelType('isnet_quint8')}
                  className={`flex-1 sm:flex-none text-xs px-4 py-2 rounded-xl border font-bold transition ${
                    modelType === 'isnet_quint8'
                      ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Cepat (80MB)
                </button>
                <button
                  onClick={() => setModelType('isnet_fp16')}
                  className={`flex-1 sm:flex-none text-xs px-4 py-2 rounded-xl border font-bold transition ${
                    modelType === 'isnet_fp16'
                      ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  HD Tajam (160MB)
                </button>
              </div>
            </div>

            {/* Dropzone */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="group relative border-2 border-dashed border-slate-200 hover:border-teal-500 bg-white hover:bg-slate-50 rounded-3xl p-8 md:p-12 text-center cursor-pointer transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

              <div className="relative space-y-4 max-w-md mx-auto flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-teal-600 group-hover:bg-teal-50 group-hover:scale-105 transition-all duration-300 shadow-sm">
                  <Upload className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">Pilih Berkas atau Tarik Foto</h3>
                  <p className="text-sm text-slate-505 font-medium">Klik untuk menelusuri dari galeri perangkat Anda</p>
                </div>
                <p className="text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                  Mendukung JPG, PNG, WEBP hingga kualitas resolusi tinggi
                </p>
              </div>
            </div>

            {/* Sample Clickables */}
            <div className="space-y-3">
              <div className="text-center text-xs font-bold tracking-wider text-slate-400 uppercase">
                Atau Coba Gambar Sampel Dibawah Ini
              </div>
              <div className="grid grid-cols-3 gap-3 md:gap-4 max-w-lg mx-auto">
                {SAMPLE_IMAGES.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => processPhoto(img.url)}
                    className="group flex flex-col text-left bg-white hover:bg-slate-50 border border-slate-200 hover:border-teal-500/50 rounded-2xl p-2 transition-all duration-300 shadow-sm"
                  >
                    <div className="aspect-square w-full rounded-xl overflow-hidden bg-slate-50 relative">
                      <img
                        src={img.url}
                        alt={img.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute bottom-1 right-1 text-[9px] px-1.5 py-0.5 rounded-md bg-white/90 text-teal-700 font-bold uppercase">
                        {img.type}
                      </span>
                    </div>
                    <div className="mt-2 text-[11px] font-bold text-slate-800 truncate w-full px-0.5">
                      {img.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
              <div className="bg-white rounded-2xl p-4 border border-slate-100 flex gap-3 shadow-sm">
                <div className="p-2 bg-teal-50 text-teal-600 rounded-xl h-fit">
                  <Sparkle className="w-4 h-4" />
                </div>
                <div className="space-y-1 text-left">
                  <h4 className="text-sm font-bold text-slate-900">Pemotongan Presisi</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">Algoritma matting mengisolasi rambut, helaian, dan lekukan produk terkecil.</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-100 flex gap-3 shadow-sm">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl h-fit">
                  <Palette className="w-4 h-4" />
                </div>
                <div className="space-y-1 text-left">
                  <h4 className="text-sm font-bold text-slate-900">AI Background Studio</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">Integrasi Gemini model cerdas untuk melukis suasana studio impian Anda.</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-100 flex gap-3 shadow-sm">
                <div className="p-2 bg-cyan-50 text-cyan-600 rounded-xl h-fit">
                  <Maximize2 className="w-4 h-4" />
                </div>
                <div className="space-y-1 text-left">
                  <h4 className="text-sm font-bold text-slate-900">Bebas Unduh HD</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">Ekspor hasil desain ke resolusi piksel asli gambar tanpa watermark.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* SECTION 2: WORKSPACE & EDITING STUDIO */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN: VISUAL WORKSPACE (7 COLS) */}
            <div className="lg:col-span-7 space-y-4">
              
              <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 text-xs truncate max-w-[60%]">
                  <FileImage className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="text-slate-800 font-bold truncate">{sourceName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowComparison(!showComparison)}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border font-bold transition ${
                      showComparison 
                        ? 'bg-teal-600 text-white border-teal-600 shadow-sm' 
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Bandingkan Foto</span>
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1 text-xs text-rose-600 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg border border-transparent hover:border-rose-100 transition font-bold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>

              {/* Canvas Preview Container */}
              <div 
                ref={workspaceRef}
                className="relative bg-white rounded-3xl border border-slate-200 overflow-hidden aspect-square flex items-center justify-center p-4 group select-none shadow-xl shadow-slate-100"
              >
                {/* AI Processing Screen overlay */}
                {isProcessing && (
                  <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 space-y-6">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full border-2 border-slate-100 border-t-2 border-t-teal-600 animate-spin" />
                      <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-teal-600 animate-pulse" />
                    </div>
                    <div className="text-center space-y-2 max-w-sm">
                      <h4 className="font-extrabold text-slate-900 text-base">Memisahkan Latar Belakang...</h4>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">{progressStatus}</p>
                    </div>
                    <div className="w-full max-w-xs bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                      <div 
                        className="bg-teal-600 h-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Main Dynamic Canvas Output */}
                <div className="relative w-full h-full flex items-center justify-center">
                  <canvas 
                    ref={canvasRef} 
                    className="max-w-full max-h-full rounded-xl object-contain shadow-sm border border-slate-100"
                    style={{
                      display: showComparison ? 'none' : 'block',
                      // Clean CSS checkerboard visualization (Maintains canvas PNG transparency)
                      backgroundImage: bgType === 'transparent' 
                        ? 'linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)' 
                        : 'none',
                      backgroundSize: '20px 20px',
                      backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                      backgroundColor: '#f8fafc'
                    }}
                  />

                  {/* Slider comparison block */}
                  {showComparison && sourceImage && (
                    <div className="relative w-full h-full rounded-xl overflow-hidden flex items-center justify-center border border-slate-100">
                      <img 
                        src={sourceImage} 
                        alt="Original" 
                        className="absolute inset-0 w-full h-full object-contain"
                      />
                      <div 
                        className="absolute inset-0 w-full h-full overflow-hidden"
                        style={{ clipPath: `polygon(0 0, ${comparisonValue}% 0, ${comparisonValue}% 100%, 0 100%)` }}
                      >
                        <div 
                          className="w-full h-full relative flex items-center justify-center"
                          style={{
                            backgroundImage: 'linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)',
                            backgroundSize: '20px 20px',
                            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                            backgroundColor: '#f8fafc'
                          }}
                        >
                          <img 
                            src={processedUrl || sourceImage} 
                            alt="Cutout" 
                            className="absolute inset-0 w-full h-full object-contain"
                          />
                        </div>
                      </div>

                      <div 
                        className="absolute top-0 bottom-0 w-1 bg-teal-500 z-20 cursor-ew-resize"
                        style={{ left: `${comparisonValue}%` }}
                      >
                        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-lg border border-teal-400">
                          <SlidersHorizontal className="w-4 h-4" />
                        </div>
                      </div>

                      <input 
                        type="range"
                        min="0"
                        max="100"
                        value={comparisonValue}
                        onChange={(e) => setComparisonValue(Number(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                      />
                    </div>
                  )}
                </div>

                <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wide uppercase border border-slate-200 text-slate-700 shadow-sm">
                  {bgType === 'transparent' ? 'Transparan (PNG)' : bgType === 'solid' ? 'Latar Warna' : bgType === 'gradient' ? 'Latar Gradasi' : bgType === 'template' ? 'Latar Studio' : 'Latar Buatan AI'}
                </div>
              </div>

              <div className="bg-slate-100/70 p-3.5 rounded-2xl border border-slate-200/50 text-xs text-slate-600 flex items-center gap-2">
                <Info className="w-4.5 h-4.5 text-teal-600 shrink-0" />
                <p className="font-medium text-left leading-relaxed">Geser subjek di atas canvas, ubah arah hadap, atau sesuaikan pencahayaan agar menyatu dengan latar belakang.</p>
              </div>
            </div>

            {/* RIGHT COLUMN: CONTROLS & STUDIO PANEL (5 COLS) */}
            <div className="lg:col-span-5 space-y-6 text-left">
              
              {/* ACCORDION 1: BACKGROUND SELECTION */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-teal-600" />
                    <h3 className="font-extrabold text-sm text-slate-900">1. Atur Latar Belakang</h3>
                  </div>
                  <span className="text-[10px] bg-teal-50 text-teal-700 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Editor</span>
                </div>

                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-5 gap-1 bg-slate-100/70 p-1 rounded-xl border border-slate-200/50">
                    {(['transparent', 'solid', 'gradient', 'template', 'ai'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          setBgType(type);
                          if (type === 'ai' && !aiGeneratedBgUrl && !aiPrompt) {
                            setAiPrompt(AI_PROMPT_TEMPLATES[0].text);
                          }
                        }}
                        className={`text-[10px] font-bold py-2 rounded-lg capitalize transition-all ${
                          bgType === type 
                            ? 'bg-white text-teal-700 shadow-sm border border-slate-200/40' 
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {type === 'transparent' ? 'Polos' : type === 'solid' ? 'Warna' : type === 'gradient' ? 'Gradasi' : type === 'template' ? 'Studio' : 'AI ✨'}
                      </button>
                    ))}
                  </div>

                  {/* Solid Colors */}
                  {bgType === 'solid' && (
                    <div className="space-y-3 animate-fade-in">
                      <div className="flex flex-wrap gap-2">
                        {SOLID_COLORS.map((color) => (
                          <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-105 relative ${
                              selectedColor === color ? 'border-teal-500 scale-105' : 'border-slate-200'
                            }`}
                            style={{ backgroundColor: color }}
                          >
                            {selectedColor === color && (
                              <Check className="w-4 h-4 text-white absolute inset-0 m-auto filter drop-shadow-md" />
                            )}
                          </button>
                        ))}
                        <div className="relative w-8 h-8 rounded-full border-2 border-slate-200 overflow-hidden flex items-center justify-center bg-slate-100">
                          <input 
                            type="color" 
                            value={selectedColor}
                            onChange={(e) => setSelectedColor(e.target.value)}
                            className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                          />
                          <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-rose-400 via-green-400 to-blue-400" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Gradients */}
                  {bgType === 'gradient' && (
                    <div className="grid grid-cols-2 gap-2 animate-fade-in">
                      {GRADIENTS.map((grad) => (
                        <button
                          key={grad.name}
                          onClick={() => setSelectedGradient(grad)}
                          className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all hover:border-slate-300 ${
                            selectedGradient.name === grad.name 
                              ? 'border-teal-500 bg-teal-50/50' 
                              : 'border-slate-200 bg-white'
                          }`}
                        >
                          <div className="w-6 h-6 rounded-lg shrink-0" style={grad.style} />
                          <span className="text-[11px] font-extrabold text-slate-800 truncate">{grad.name}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Premium Studio Templates */}
                  {bgType === 'template' && (
                    <div className="grid grid-cols-3 gap-2 animate-fade-in">
                      {BACKGROUND_TEMPLATES.map((tmpl) => (
                        <button
                          key={tmpl.id}
                          onClick={() => setSelectedTemplate(tmpl.id)}
                          className={`group flex flex-col border rounded-xl overflow-hidden text-left transition-all ${
                            selectedTemplate === tmpl.id 
                              ? 'border-teal-500 ring-2 ring-teal-500/5 bg-teal-50/10' 
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="aspect-video w-full overflow-hidden bg-slate-100">
                            <img 
                              src={tmpl.url} 
                              alt={tmpl.name}
                              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                            />
                          </div>
                          <div className="p-1.5 text-[10px] font-extrabold text-slate-700 truncate w-full">
                            {tmpl.name}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* AI Generated Backgrounds (Securely uses environment variable on Server side) */}
                  {bgType === 'ai' && (
                    <div className="space-y-3 animate-fade-in">
                      <div className="bg-gradient-to-tr from-teal-50 to-indigo-50 border border-teal-100 p-3.5 rounded-2xl space-y-2">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-teal-600" />
                          <span className="text-xs font-bold text-slate-900">AI Background Generator</span>
                        </div>
                        <p className="text-[10px] text-slate-600 leading-relaxed font-medium">
                          Tulis deskripsi latar belakang profesional yang Anda inginkan, lalu klik tombol di bawah untuk melukisnya secara ajaib dengan AI.
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">Deskripsi Suasana (Disarankan Bahasa Inggris)</label>
                        <textarea
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          placeholder="Contoh: Luxury white marble display pedestal table with organic palm shadows, warm morning window sunlight..."
                          className="w-full text-xs bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-teal-500 focus:bg-white rounded-xl p-2.5 min-h-[70px] outline-none text-slate-800 resize-none transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">Rekomendasi Gaya Cepat</span>
                        <div className="flex flex-wrap gap-1.5">
                          {AI_PROMPT_TEMPLATES.map((tmpl) => (
                            <button
                              key={tmpl.label}
                              type="button"
                              onClick={() => setAiPrompt(tmpl.text)}
                              className="text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg transition"
                            >
                              {tmpl.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={handleGenerateAiBg}
                        disabled={isGeneratingAiBg || !aiPrompt.trim()}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs transition duration-300 shadow-md shadow-teal-600/10 disabled:opacity-50"
                      >
                        {isGeneratingAiBg ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Mengecat Studio AI (3-5 detik)...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            <span>Mulai Melukis Latar AI ✨</span>
                          </>
                        )}
                      </button>

                      {aiGeneratedBgUrl && (
                        <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-xl border border-emerald-100">
                          <div className="w-10 h-10 rounded overflow-hidden shrink-0 bg-slate-100">
                            <img src={aiGeneratedBgUrl} alt="AI output" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 truncate">
                            <span className="text-[10px] font-extrabold text-emerald-700 block">✓ Latar AI Siap</span>
                            <span className="text-[9px] text-slate-500 truncate block">{aiPrompt}</span>
                          </div>
                          <button 
                            onClick={() => {
                              setAiGeneratedBgUrl(null);
                              setBgType('transparent');
                            }}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Depth of Field Background Blur */}
                  {(bgType === 'template' || bgType === 'ai') && (
                    <div className="pt-3 border-t border-slate-100 space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-slate-700">Efek Bokeh Latar (Depth of Field)</span>
                        <span className="text-teal-600 font-extrabold">{bgBlur}px</span>
                      </div>
                      <input 
                        type="range"
                        min="0"
                        max="20"
                        value={bgBlur}
                        onChange={(e) => setBgBlur(Number(e.target.value))}
                        className="w-full accent-teal-600 cursor-pointer"
                      />
                    </div>
                  )}

                </div>
              </div>

              {/* ACCORDION 2: SUBJECT ADJUSTMENTS & TRANSFORM */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-teal-600" />
                    <h3 className="font-extrabold text-sm text-slate-900">2. Posisi & Cahaya Objek</h3>
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Subjek</span>
                </div>

                <div className="p-4 space-y-4 text-left">
                  <div className="space-y-3">
                    <span className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400 block">Tata Letak</span>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-bold text-slate-700">
                          <span>Ukuran Objek</span>
                          <span className="text-slate-500">{Math.round(subjectScale * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.2"
                          max="2.5"
                          step="0.05"
                          value={subjectScale}
                          onChange={(e) => setSubjectScale(Number(e.target.value))}
                          className="w-full accent-teal-600 cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-bold text-slate-700">
                          <span>Rotasi</span>
                          <span className="text-slate-500">{subjectRotation}°</span>
                        </div>
                        <input
                          type="range"
                          min="-180"
                          max="180"
                          value={subjectRotation}
                          onChange={(e) => setSubjectRotation(Number(e.target.value))}
                          className="w-full accent-teal-600 cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-bold text-slate-700">
                          <span>Geser Kiri/Kanan</span>
                          <span className="text-slate-500">{subjectX}px</span>
                        </div>
                        <input
                          type="range"
                          min="-200"
                          max="200"
                          value={subjectX}
                          onChange={(e) => setSubjectX(Number(e.target.value))}
                          className="w-full accent-teal-600 cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-bold text-slate-700">
                          <span>Geser Atas/Bawah</span>
                          <span className="text-slate-500">{subjectY}px</span>
                        </div>
                        <input
                          type="range"
                          min="-200"
                          max="200"
                          value={subjectY}
                          onChange={(e) => setSubjectY(Number(e.target.value))}
                          className="w-full accent-teal-600 cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                      <button 
                        onClick={() => { setSubjectX(0); setSubjectY(0); setSubjectScale(1); setSubjectRotation(0); }}
                        className="text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200/60"
                      >
                        Kembalikan ke Tengah
                      </button>
                      <button 
                        onClick={() => setIsFlippedH(!isFlippedH)}
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition ${
                          isFlippedH 
                            ? 'bg-teal-50 text-teal-700 border-teal-200' 
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200/60'
                        }`}
                      >
                        Balik Arah (Flip)
                      </button>
                    </div>
                  </div>

                  {/* Harmonization Adjustments */}
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <span className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400 block">Pencahayaan (Harmonisasi Objek & Latar)</span>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 block">Kecerahan</label>
                        <input
                          type="range"
                          min="50"
                          max="150"
                          value={brightness}
                          onChange={(e) => setBrightness(Number(e.target.value))}
                          className="w-full accent-teal-600 cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 block">Kontras</label>
                        <input
                          type="range"
                          min="50"
                          max="150"
                          value={contrast}
                          onChange={(e) => setContrast(Number(e.target.value))}
                          className="w-full accent-teal-600 cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 block">Saturasi</label>
                        <input
                          type="range"
                          min="0"
                          max="200"
                          value={saturation}
                          onChange={(e) => setSaturation(Number(e.target.value))}
                          className="w-full accent-teal-600 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Drop Shadow */}
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">Efek Bayangan Halus (Drop Shadow)</span>
                      <input 
                        type="checkbox"
                        checked={enableShadow}
                        onChange={(e) => setEnableShadow(e.target.checked)}
                        className="w-4 h-4 accent-teal-600 cursor-pointer"
                      />
                    </div>

                    {enableShadow && (
                      <div className="grid grid-cols-2 gap-4 animate-fade-in">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold text-slate-600">
                            <span>Pelebaran Bayang</span>
                            <span>{shadowBlur}px</span>
                          </div>
                          <input
                            type="range"
                            min="2"
                            max="40"
                            value={shadowBlur}
                            onChange={(e) => setShadowBlur(Number(e.target.value))}
                            className="w-full accent-teal-600 cursor-pointer"
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold text-slate-600">
                            <span>Kepekatan Bayang</span>
                            <span>{Math.round(shadowOpacity * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min="0.05"
                            max="0.8"
                            step="0.05"
                            value={shadowOpacity}
                            onChange={(e) => setShadowOpacity(Number(e.target.value))}
                            className="w-full accent-teal-600 cursor-pointer"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* ACTION EXPORT STUDIO */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-md space-y-4">
                <div className="space-y-1.5 text-center md:text-left">
                  <h4 className="font-extrabold text-sm text-slate-900">3. Unduh Karya HD</h4>
                  <p className="text-xs text-slate-500 font-medium">Ekspor langsung hasil desain Anda tanpa ada sisa checkerboard terarsir.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleDownload('png')}
                    className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs transition duration-300 shadow-lg shadow-teal-600/10"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PNG Transparan</span>
                  </button>

                  <button
                    onClick={() => handleDownload('jpeg')}
                    className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/60 font-extrabold text-xs transition duration-300"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download JPG Studio</span>
                  </button>
                </div>

                <p className="text-[10px] text-slate-400 font-medium text-center">
                  * Untuk hasil transparan mutlak, pastikan Anda menggunakan mode latar belakang "Polos" (Kategori pertama).
                </p>
              </div>

            </div>

          </div>
        )}

        {/* SECTION 3: HISTORY / PREVIOUS WORK */}
        {history.length > 0 && (
          <div className="mt-12 pt-8 border-t border-slate-200 space-y-4 text-left">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-teal-600" />
                <span>Riwayat Karya</span>
              </h3>
              <button 
                onClick={() => {
                  setHistory([]);
                  localStorage.removeItem('latarkita_history');
                }}
                className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
              >
                Hapus Semua Riwayat
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
              {history.map((hist) => (
                <div 
                  key={hist.id} 
                  onClick={() => {
                    setSourceImage(hist.original);
                    setProcessedUrl(hist.processed);
                    setSourceName('Foto Riwayat LatarKita');
                  }}
                  className="group bg-white hover:bg-slate-50 border border-slate-200 hover:border-teal-500/30 rounded-2xl p-2.5 cursor-pointer transition duration-300 relative shadow-sm"
                >
                  <div className="aspect-square rounded-xl overflow-hidden bg-slate-50 relative">
                    <img src={hist.processed} alt="History product" className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" />
                  </div>
                  <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between font-bold">
                    <span>{hist.date}</span>
                    <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-teal-600" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* PUBLIC FOOTER */}
      <footer className="mt-16 border-t border-slate-200/80 bg-white p-6 text-center text-xs text-slate-500 space-y-2 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-left">
          <div>
            <p className="font-extrabold text-slate-800 text-sm">LatarKita Studio AI</p>
            <p className="text-slate-500 font-medium">Pemotong subjek foto instan bertenaga Web Assembly lokal berkecepatan tinggi.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-slate-50 border border-slate-200/60 text-[10px] font-bold px-3 py-1.5 rounded-full text-slate-600">
              WebAssembly ONNX Engine
            </span>
            <span className="bg-slate-50 border border-slate-200/60 text-[10px] font-bold px-3 py-1.5 rounded-full text-slate-600">
              Gemini 3.5 / Imagen 3.0
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
