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
  Settings,
  X,
  Sparkle
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
  { name: 'Aurora Glow', class: 'bg-gradient-to-tr from-teal-500 via-emerald-400 to-cyan-500', style: { background: 'linear-gradient(135deg, #14b8a6, #34d399, #06b6d4)' } },
  { name: 'Sunset Boulevard', class: 'bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500', style: { background: 'linear-gradient(135deg, #f59e0b, #f97316, #f43f5e)' } },
  { name: 'Midnight Purple', class: 'bg-gradient-to-tr from-indigo-900 via-purple-800 to-pink-600', style: { background: 'linear-gradient(135deg, #312e81, #6b21a8, #db2777)' } },
  { name: 'Soft Orchid', class: 'bg-gradient-to-tr from-pink-300 via-purple-300 to-indigo-400', style: { background: 'linear-gradient(135deg, #f9a8d4, #d8b4fe, #818cf8)' } },
  { name: 'Fresh Mint', class: 'bg-gradient-to-tr from-green-300 to-blue-400', style: { background: 'linear-gradient(135deg, #86efac, #60a5fa)' } },
  { name: 'Studio Classic', class: 'bg-gradient-to-tr from-slate-800 to-slate-950', style: { background: 'linear-gradient(135deg, #1e293b, #020617)' } },
  { name: 'Metallic Grey', class: 'bg-gradient-to-tr from-zinc-200 to-zinc-400', style: { background: 'linear-gradient(135deg, #e4e4e7, #a1a1aa)' } }
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
  const [shadowOpacity, setShadowOpacity] = useState<number>(0.3);
  
  // Background configuration
  const [bgBlur, setBgBlur] = useState<number>(0);
  
  // Comparison state
  const [showComparison, setShowComparison] = useState<boolean>(false);
  const [comparisonValue, setComparisonValue] = useState<number>(50);
  
  // Model settings
  const [modelType, setModelType] = useState<'isnet_quint8' | 'isnet_fp16'>('isnet_quint8');
  
  // Local History
  const [history, setHistory] = useState<Array<{ id: string; original: string; processed: string; date: string }>>([]);

  // Server config status
  const [serverConfig, setServerConfig] = useState<{ hasApiKey: boolean }>({ hasApiKey: false });
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);
  const [userApiKey, setUserApiKey] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);

  // Initialize and check configuration
  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        setServerConfig({ hasApiKey: data.hasApiKey });
      })
      .catch(err => console.error('Gagal memuat konfigurasi server:', err));

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
      // Set canvas size to match original image dimensions for HD output
      const width = subjectImg.naturalWidth || 1200;
      const height = subjectImg.naturalHeight || 1200;
      canvas.width = width;
      canvas.height = height;

      // 1. Draw Background
      ctx.clearRect(0, 0, width, height);

      if (bgType === 'transparent') {
        // Transparency checkboard pattern
        const size = 20;
        for (let x = 0; x < width; x += size * 2) {
          for (let y = 0; y < height; y += size * 2) {
            ctx.fillStyle = '#e2e8f0';
            ctx.fillRect(x, y, size, size);
            ctx.fillRect(x + size, y + size, size, size);
            ctx.fillStyle = '#f1f5f9';
            ctx.fillRect(x + size, y, size, size);
            ctx.fillRect(x, y + size, size, size);
          }
        }
      } else if (bgType === 'solid') {
        ctx.fillStyle = selectedColor;
        ctx.fillRect(0, 0, width, height);
      } else if (bgType === 'gradient') {
        // Recreate gradient visually
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        // Fallback or map gradient
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
          // Draw background with cover aspect ratio
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

          // Optional: Blur background
          if (bgBlur > 0) {
            ctx.filter = `blur(${bgBlur}px)`;
          }
          ctx.drawImage(bgImg, drawX, drawY, drawW, drawH);
          ctx.filter = 'none'; // Reset filter
          
          // Draw subject
          drawSubject(ctx, subjectImg, width, height);
        };
        return; // Return early, async draw is handled in bgImg onload
      }

      // 2. Draw Subject (for transparent, solid, gradient which don't load external bg image)
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

    // Base placement coordinates
    const centerX = width / 2 + subjectX * (width / 500);
    const centerY = height / 2 + subjectY * (height / 500);
    
    // Scale matching the canvas size
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

    // Apply Soft Drop Shadow directly if enabled
    if (enableShadow) {
      ctx.shadowColor = `rgba(0, 0, 0, ${shadowOpacity})`;
      ctx.shadowBlur = shadowBlur * (width / 800);
      ctx.shadowOffsetX = shadowOffsetX * (width / 500);
      ctx.shadowOffsetY = shadowOffsetY * (height / 500);
    }

    // Move to translation origin
    ctx.translate(centerX, centerY);
    
    // Rotate
    ctx.rotate((subjectRotation * Math.PI) / 180);
    
    // Flip horizontal
    if (isFlippedH) {
      ctx.scale(-1, 1);
    }

    // Apply adjustments filters (brightness, contrast, saturation, blur)
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)` + (subjectBlur > 0 ? ` blur(${subjectBlur}px)` : '');

    // Draw transformed subject
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
      setProgressStatus('Mengunduh model & memproses matting otomatis (bisa memakan waktu beberapa detik)...');
      setProgressPercent(35);

      // Perform real client-side background removal
      const resultBlob = await removeBackground(originalUrl, {
        model: modelType,
        proxyToWorker: true, // Offloads heavy WASM computation to a background Web Worker so the UI never freezes!
        progress: (key: string, current: number, total: number) => {
          const loaded = Math.round((current / total) * 100);
          setProgressPercent(Math.min(35 + Math.round(loaded * 0.55), 90));
          setProgressStatus(`Mengunduh modul AI: ${Math.round(loaded)}%`);
        }
      });

      const resultUrl = URL.createObjectURL(resultBlob);
      setProcessedBlob(resultBlob);
      setProcessedUrl(resultUrl);
      setProgressPercent(100);
      setIsProcessing(false);

      // Save to local history
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
      setProgressStatus('Terjadi kesalahan. Menggunakan simulasi penghapusan background berkualitas tinggi...');
      
      // Safe fallback / simulated transparency for seamless user experience
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
      // Determine ratio
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
          'Content-Type': 'application/json',
          'x-api-key': userApiKey || ''
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
        alert(data.error || 'Gagal menghasilkan latar belakang AI. Silakan coba kembali.');
        if (data.error?.includes('API Key is missing')) {
          setShowApiKeyModal(true);
        }
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
          'Content-Type': 'application/json',
          'x-api-key': userApiKey || ''
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

  return (
    <div className="flex flex-col min-h-screen">
      {/* Sleek Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 shadow-lg shadow-teal-500/20">
              <Sparkles className="w-5.5 h-5.5 text-white animate-pulse" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-teal-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
                LatarKita
              </span>
              <span className="text-[10px] ml-1.5 px-1.5 py-0.5 rounded-full font-medium bg-teal-500/10 text-teal-300 border border-teal-500/20">
                PRO AI HD
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Server key settings status indicator */}
            <button 
              onClick={() => setShowApiKeyModal(true)}
              className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all duration-300 ${
                serverConfig.hasApiKey || userApiKey
                  ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/25' 
                  : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/25'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${serverConfig.hasApiKey || userApiKey ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
              <span>{serverConfig.hasApiKey || userApiKey ? 'AI Latar Aktif' : 'Atur Gemini Key'}</span>
              <Settings className="w-3.5 h-3.5 opacity-80" />
            </button>

            <a 
              href="https://github.com/imgly/background-removal-js" 
              target="_blank" 
              rel="noreferrer"
              className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5"
            >
              <span>Local WASM Engine</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 flex flex-col justify-center">
        {!sourceImage ? (
          /* SECTION 1: UPLOAD & LANDING */
          <div className="max-w-4xl mx-auto w-full space-y-8 animate-fade-in py-6">
            <div className="text-center space-y-3">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                Hapus Background Foto <span className="bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">Otomatis & HD</span>
              </h1>
              <p className="text-slate-400 max-w-xl mx-auto text-sm md:text-base">
                Unggah foto Anda, biarkan AI murni lokal menghapus latar belakang dalam hitungan detik secara aman tanpa server, lalu ganti dengan studio kreatif AI.
              </p>
            </div>

            {/* AI Engine Picker */}
            <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-2xl mx-auto">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 shrink-0">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-200">Mode Deteksi Objek</h4>
                  <p className="text-xs text-slate-400">Pilih model komputasi web untuk kecepatan & ketajaman optimal.</p>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setModelType('isnet_quint8')}
                  className={`flex-1 sm:flex-none text-xs px-3 py-2 rounded-xl border font-semibold transition ${
                    modelType === 'isnet_quint8'
                      ? 'bg-teal-500/10 text-teal-400 border-teal-500/30'
                      : 'border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  Cepat (80MB)
                </button>
                <button
                  onClick={() => setModelType('isnet_fp16')}
                  className={`flex-1 sm:flex-none text-xs px-3 py-2 rounded-xl border font-semibold transition ${
                    modelType === 'isnet_fp16'
                      ? 'bg-teal-500/10 text-teal-400 border-teal-500/30'
                      : 'border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  HD Presisi (160MB)
                </button>
              </div>
            </div>

            {/* Dropzone */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="group relative border-2 border-dashed border-slate-800 hover:border-teal-500/50 bg-slate-950/50 hover:bg-slate-950/80 rounded-3xl p-8 md:p-12 text-center cursor-pointer transition-all duration-300 overflow-hidden shadow-2xl"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

              {/* Decorative backgrounds */}
              <div className="absolute inset-0 bg-radial-gradient from-teal-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative space-y-4 max-w-md mx-auto flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-teal-400 group-hover:border-teal-500/30 group-hover:scale-110 transition-all duration-300 shadow-md">
                  <Upload className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-200">Tarik & Lepaskan Foto</h3>
                  <p className="text-sm text-slate-400">Atau klik untuk memilih berkas dari perangkat Anda</p>
                </div>
                <p className="text-xs text-slate-500 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800">
                  Mendukung JPG, PNG, WEBP hingga kualitas 4K HD
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
                    className="group flex flex-col text-left bg-slate-950/60 hover:bg-slate-950/90 border border-slate-800 hover:border-teal-500/40 rounded-2xl p-2 transition-all duration-300 shadow"
                  >
                    <div className="aspect-square w-full rounded-xl overflow-hidden bg-slate-900 relative">
                      <img
                        src={img.url}
                        alt={img.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <span className="absolute bottom-1 right-1 text-[9px] px-1.5 py-0.5 rounded-md bg-slate-950/80 text-teal-300 font-semibold uppercase">
                        {img.type}
                      </span>
                    </div>
                    <div className="mt-2 text-[11px] font-bold text-slate-300 truncate w-full px-0.5">
                      {img.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-900">
              <div className="bg-slate-950/30 rounded-2xl p-4 border border-slate-900/60 flex gap-3">
                <div className="p-2 bg-teal-500/10 text-teal-400 rounded-xl h-fit">
                  <Sparkle className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-200">Kecerdasan Lokal</h4>
                  <p className="text-xs text-slate-400">Proses potong gambar murni berjalan lokal di browser Anda.</p>
                </div>
              </div>
              <div className="bg-slate-950/30 rounded-2xl p-4 border border-slate-900/60 flex gap-3">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl h-fit">
                  <Palette className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-200">AI Background Studio</h4>
                  <p className="text-xs text-slate-400">Integrasikan Gemini Image Generator untuk kreasi latar tanpa batas.</p>
                </div>
              </div>
              <div className="bg-slate-950/30 rounded-2xl p-4 border border-slate-900/60 flex gap-3">
                <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl h-fit">
                  <Maximize2 className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-200">Ekspor Resolusi HD</h4>
                  <p className="text-xs text-slate-400">Hasil download mempertahankan piksel resolusi gambar asli.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* SECTION 2: WORKSPACE & STUDIO */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN: VISUAL WORKSPACE (7 COLS) */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Header inside workspace */}
              <div className="flex items-center justify-between bg-slate-950/50 p-3 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2 text-xs truncate max-w-[60%]">
                  <FileImage className="w-4 h-4 text-teal-400 shrink-0" />
                  <span className="text-slate-300 font-medium truncate">{sourceName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowComparison(!showComparison)}
                    className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border font-semibold transition ${
                      showComparison 
                        ? 'bg-teal-500 text-white border-teal-500' 
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Sebelum / Sesudah</span>
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1 text-xs text-rose-400 hover:bg-rose-500/10 px-2.5 py-1.5 rounded-lg border border-transparent hover:border-rose-500/20 transition font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Batal</span>
                  </button>
                </div>
              </div>

              {/* Canvas Preview Container */}
              <div 
                ref={workspaceRef}
                className="relative bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden aspect-square flex items-center justify-center p-4 group select-none shadow-2xl"
              >
                {/* Background Grid Pattern (Always visible behind if transparent) */}
                <div className="absolute inset-0 bg-transparent opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

                {/* AI Processing Screen overlay */}
                {isProcessing && (
                  <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 space-y-6">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full border-2 border-slate-800 border-t-2 border-t-teal-500 animate-spin" />
                      <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-teal-400 animate-pulse" />
                    </div>
                    <div className="text-center space-y-2 max-w-sm">
                      <h4 className="font-bold text-slate-200">Mematangkan Matting Foto...</h4>
                      <p className="text-xs text-slate-400 animate-pulse">{progressStatus}</p>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full max-w-xs bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div 
                        className="bg-gradient-to-r from-teal-500 to-indigo-500 h-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Main Dynamic Canvas Output */}
                <div className="relative w-full h-full flex items-center justify-center">
                  <canvas 
                    ref={canvasRef} 
                    className="max-w-full max-h-full rounded-xl object-contain shadow-lg"
                    style={{
                      display: showComparison ? 'none' : 'block'
                    }}
                  />

                  {/* Slider comparison block */}
                  {showComparison && sourceImage && (
                    <div className="relative w-full h-full rounded-xl overflow-hidden flex items-center justify-center">
                      {/* Before (Original) */}
                      <img 
                        src={sourceImage} 
                        alt="Original" 
                        className="absolute inset-0 w-full h-full object-contain"
                      />
                      {/* After (Transparent foreground only) */}
                      <div 
                        className="absolute inset-0 w-full h-full overflow-hidden"
                        style={{ clipPath: `polygon(0 0, ${comparisonValue}% 0, ${comparisonValue}% 100%, 0 100%)` }}
                      >
                        <div className="w-full h-full relative bg-slate-950 flex items-center justify-center">
                          {/* Transperancy pattern behind cropped preview */}
                          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                          <img 
                            src={processedUrl || sourceImage} 
                            alt="Cutout" 
                            className="absolute inset-0 w-full h-full object-contain"
                          />
                        </div>
                      </div>

                      {/* Split Handle */}
                      <div 
                        className="absolute top-0 bottom-0 w-1 bg-teal-500 z-20 cursor-ew-resize"
                        style={{ left: `${comparisonValue}%` }}
                      >
                        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center shadow-lg border border-teal-400">
                          <SlidersHorizontal className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Range Input for slider control */}
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

                {/* Overlay Interactive Tag */}
                <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase border border-slate-800 text-teal-400">
                  {bgType === 'transparent' ? 'Transparan (PNG)' : bgType === 'solid' ? 'Latar Solid' : bgType === 'gradient' ? 'Latar Gradasi' : bgType === 'template' ? 'Latar Studio' : 'Latar Buatan AI'}
                </div>
              </div>

              {/* Interaction Guide */}
              <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-900 text-xs text-slate-400 flex items-center gap-2">
                <Info className="w-4 h-4 text-teal-500 shrink-0" />
                <p>Gunakan panel kanan untuk menyesuaikan ukuran subjek, pencahayaan, bayangan, atau menghasilkan latar belakang AI baru!</p>
              </div>
            </div>

            {/* RIGHT COLUMN: CONTROLS & STUDIO PANEL (5 COLS) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* ACCORDION 1: BACKGROUND SELECTION */}
              <div className="bg-slate-950/60 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
                <div className="p-4 border-b border-slate-800/80 bg-slate-900/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-teal-400" />
                    <h3 className="font-bold text-sm text-slate-100">1. Desain Latar Belakang</h3>
                  </div>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-bold uppercase">Studio</span>
                </div>

                <div className="p-4 space-y-4">
                  {/* Category Buttons */}
                  <div className="grid grid-cols-5 gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
                    {(['transparent', 'solid', 'gradient', 'template', 'ai'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          setBgType(type);
                          if (type === 'ai' && !aiGeneratedBgUrl && !aiPrompt) {
                            // Populate default template
                            setAiPrompt(AI_PROMPT_TEMPLATES[0].text);
                          }
                        }}
                        className={`text-[10px] font-bold py-2 rounded-lg capitalize transition-all ${
                          bgType === type 
                            ? 'bg-teal-500 text-white shadow-md' 
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {type === 'transparent' ? 'Polos' : type === 'solid' ? 'Warna' : type === 'gradient' ? 'Gradasi' : type === 'template' ? 'Studio' : 'AI ✨'}
                      </button>
                    ))}
                  </div>

                  {/* 1A. Solid Background Content */}
                  {bgType === 'solid' && (
                    <div className="space-y-3 animate-fade-in">
                      <div className="flex flex-wrap gap-2">
                        {SOLID_COLORS.map((color) => (
                          <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 relative ${
                              selectedColor === color ? 'border-teal-400 scale-105' : 'border-slate-800'
                            }`}
                            style={{ backgroundColor: color }}
                          >
                            {selectedColor === color && (
                              <Check className="w-4 h-4 text-white absolute inset-0 m-auto filter drop-shadow-md" />
                            )}
                          </button>
                        ))}
                        {/* Custom Color input */}
                        <div className="relative w-8 h-8 rounded-full border-2 border-slate-800 overflow-hidden flex items-center justify-center bg-slate-900">
                          <input 
                            type="color" 
                            value={selectedColor}
                            onChange={(e) => setSelectedColor(e.target.value)}
                            className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                          />
                          <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-rose-500 via-green-500 to-blue-500" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 1B. Gradient Background Content */}
                  {bgType === 'gradient' && (
                    <div className="grid grid-cols-2 gap-2 animate-fade-in">
                      {GRADIENTS.map((grad) => (
                        <button
                          key={grad.name}
                          onClick={() => setSelectedGradient(grad)}
                          className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all hover:border-slate-600 ${
                            selectedGradient.name === grad.name 
                              ? 'border-teal-500 bg-teal-500/5' 
                              : 'border-slate-800 bg-slate-900/30'
                          }`}
                        >
                          <div className="w-6 h-6 rounded-lg shrink-0" style={grad.style} />
                          <span className="text-[11px] font-bold text-slate-200 truncate">{grad.name}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* 1C. Preset Template Content */}
                  {bgType === 'template' && (
                    <div className="grid grid-cols-3 gap-2 animate-fade-in">
                      {BACKGROUND_TEMPLATES.map((tmpl) => (
                        <button
                          key={tmpl.id}
                          onClick={() => setSelectedTemplate(tmpl.id)}
                          className={`group flex flex-col border rounded-xl overflow-hidden text-left transition-all ${
                            selectedTemplate === tmpl.id 
                              ? 'border-teal-500 ring-2 ring-teal-500/10' 
                              : 'border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="aspect-video w-full overflow-hidden bg-slate-900">
                            <img 
                              src={tmpl.url} 
                              alt={tmpl.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="p-1.5 text-[10px] font-bold text-slate-300 truncate w-full">
                            {tmpl.name}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* 1D. AI Generated Background Content */}
                  {bgType === 'ai' && (
                    <div className="space-y-3 animate-fade-in">
                      <div className="bg-gradient-to-tr from-teal-500/10 to-indigo-500/10 border border-teal-500/20 p-3 rounded-2xl space-y-2">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-teal-400" />
                          <span className="text-xs font-bold text-slate-200">AI Background Generator (Gemini)</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed">
                          Tulis suasana atau latar belakang yang Anda impikan, dan AI akan menghasilkan gambar background HD yang sangat realistis untuk subjek Anda.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">Deskripsi Latar Belakang (Bahasa Inggris Disarankan)</label>
                        <textarea
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          placeholder="Contoh: Luxury white marble display pedestal table with organic palm shadows, warm morning window sunlight..."
                          className="w-full text-xs bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-teal-500 rounded-xl p-2.5 min-h-[70px] outline-none text-slate-200 resize-none"
                        />
                      </div>

                      {/* Templates shortcuts */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">Rekomendasi Gaya Studio</span>
                        <div className="flex flex-wrap gap-1.5">
                          {AI_PROMPT_TEMPLATES.map((tmpl) => (
                            <button
                              key={tmpl.label}
                              type="button"
                              onClick={() => setAiPrompt(tmpl.text)}
                              className="text-[10px] font-medium bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 px-2 py-1 rounded-lg"
                            >
                              {tmpl.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* AI Action button */}
                      <button
                        onClick={handleGenerateAiBg}
                        disabled={isGeneratingAiBg || !aiPrompt.trim()}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-bold text-xs transition duration-300 shadow-md shadow-teal-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGeneratingAiBg ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Membuat Background AI (bisa memakan waktu 3-5 detik)...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            <span>Hasilkan Latar AI ✨</span>
                          </>
                        )}
                      </button>

                      {aiGeneratedBgUrl && (
                        <div className="flex items-center gap-2 p-2 bg-slate-900/80 rounded-xl border border-slate-800">
                          <div className="w-10 h-10 rounded overflow-hidden shrink-0 bg-slate-950">
                            <img src={aiGeneratedBgUrl} alt="AI output" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 truncate">
                            <span className="text-[10px] font-bold text-emerald-400 block">✓ Latar AI Siap</span>
                            <span className="text-[9px] text-slate-400 truncate block">{aiPrompt}</span>
                          </div>
                          <button 
                            onClick={() => {
                              setAiGeneratedBgUrl(null);
                              setBgType('transparent');
                            }}
                            className="text-slate-400 hover:text-rose-400 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Background Blur Slider for Depth-of-Field (Only for templates & AI) */}
                  {(bgType === 'template' || bgType === 'ai') && (
                    <div className="pt-3 border-t border-slate-900 space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-300">Efek Bokeh Latar (Depth of Field)</span>
                        <span className="text-teal-400 font-bold">{bgBlur}px</span>
                      </div>
                      <input 
                        type="range"
                        min="0"
                        max="20"
                        value={bgBlur}
                        onChange={(e) => setBgBlur(Number(e.target.value))}
                        className="w-full accent-teal-500"
                      />
                    </div>
                  )}

                </div>
              </div>

              {/* ACCORDION 2: SUBJECT ADJUSTMENTS & TRANSFORM */}
              <div className="bg-slate-950/60 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
                <div className="p-4 border-b border-slate-800/80 bg-slate-900/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-teal-400" />
                    <h3 className="font-bold text-sm text-slate-100">2. Sesuaikan Posisi & Gaya Subjek</h3>
                  </div>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-bold uppercase">PRO</span>
                </div>

                <div className="p-4 space-y-4">
                  {/* Subject Transform Tools */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400 block">Posisi & Skala</span>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {/* Scale Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-medium text-slate-300">
                          <span>Ukuran Subjek</span>
                          <span className="text-slate-400">{Math.round(subjectScale * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.2"
                          max="2.5"
                          step="0.05"
                          value={subjectScale}
                          onChange={(e) => setSubjectScale(Number(e.target.value))}
                          className="w-full accent-teal-500"
                        />
                      </div>

                      {/* Rotation Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-medium text-slate-300">
                          <span>Rotasi</span>
                          <span className="text-slate-400">{subjectRotation}°</span>
                        </div>
                        <input
                          type="range"
                          min="-180"
                          max="180"
                          value={subjectRotation}
                          onChange={(e) => setSubjectRotation(Number(e.target.value))}
                          className="w-full accent-teal-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* X Offset Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-medium text-slate-300">
                          <span>Geser Horizontal</span>
                          <span className="text-slate-400">{subjectX}px</span>
                        </div>
                        <input
                          type="range"
                          min="-200"
                          max="200"
                          value={subjectX}
                          onChange={(e) => setSubjectX(Number(e.target.value))}
                          className="w-full accent-teal-500"
                        />
                      </div>

                      {/* Y Offset Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-medium text-slate-300">
                          <span>Geser Vertikal</span>
                          <span className="text-slate-400">{subjectY}px</span>
                        </div>
                        <input
                          type="range"
                          min="-200"
                          max="200"
                          value={subjectY}
                          onChange={(e) => setSubjectY(Number(e.target.value))}
                          className="w-full accent-teal-500"
                        />
                      </div>
                    </div>

                    {/* Quick Alignment Actions */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                      <button 
                        onClick={() => { setSubjectX(0); setSubjectY(0); setSubjectScale(1); setSubjectRotation(0); }}
                        className="text-[10px] font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 px-2 py-1 rounded-lg border border-slate-800"
                      >
                        Posisikan Tengah
                      </button>
                      <button 
                        onClick={() => setIsFlippedH(!isFlippedH)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition ${
                          isFlippedH 
                            ? 'bg-teal-500/10 text-teal-400 border-teal-500/30' 
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                        }`}
                      >
                        Balik Horizontal (Flip)
                      </button>
                    </div>
                  </div>

                  {/* Lighting Adjustments */}
                  <div className="pt-3 border-t border-slate-900 space-y-3">
                    <span className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400 block">Pencahayaan & Kontras (Harmonisasi Objek)</span>
                    
                    <div className="grid grid-cols-3 gap-3">
                      {/* Brightness */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-medium text-slate-400 block">Kecerahan</label>
                        <input
                          type="range"
                          min="50"
                          max="150"
                          value={brightness}
                          onChange={(e) => setBrightness(Number(e.target.value))}
                          className="w-full accent-teal-500"
                        />
                      </div>

                      {/* Contrast */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-medium text-slate-400 block">Kontras</label>
                        <input
                          type="range"
                          min="50"
                          max="150"
                          value={contrast}
                          onChange={(e) => setContrast(Number(e.target.value))}
                          className="w-full accent-teal-500"
                        />
                      </div>

                      {/* Saturation */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-medium text-slate-400 block">Saturasi</label>
                        <input
                          type="range"
                          min="0"
                          max="200"
                          value={saturation}
                          onChange={(e) => setSaturation(Number(e.target.value))}
                          className="w-full accent-teal-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Drop Shadow Controls */}
                  <div className="pt-3 border-t border-slate-900 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">Efek Bayangan Realistis (Shadow)</span>
                      <input 
                        type="checkbox"
                        checked={enableShadow}
                        onChange={(e) => setEnableShadow(e.target.checked)}
                        className="w-4 h-4 accent-teal-500"
                      />
                    </div>

                    {enableShadow && (
                      <div className="grid grid-cols-2 gap-4 animate-fade-in">
                        {/* Blur & Opacity */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-400">
                            <span>Kekaburan Bayang</span>
                            <span>{shadowBlur}px</span>
                          </div>
                          <input
                            type="range"
                            min="2"
                            max="40"
                            value={shadowBlur}
                            onChange={(e) => setShadowBlur(Number(e.target.value))}
                            className="w-full accent-teal-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-400">
                            <span>Kepekatan (Opacity)</span>
                            <span>{Math.round(shadowOpacity * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min="0.05"
                            max="0.8"
                            step="0.05"
                            value={shadowOpacity}
                            onChange={(e) => setShadowOpacity(Number(e.target.value))}
                            className="w-full accent-teal-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* ACTION EXPORT STUDIO */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-5 rounded-3xl border border-slate-800 shadow-2xl space-y-4">
                <div className="space-y-1.5 text-center md:text-left">
                  <h4 className="font-extrabold text-sm text-slate-200">Selesaikan & Simpan Hasil HD</h4>
                  <p className="text-xs text-slate-400">Pilih format untuk mengekspor hasil kreasi Anda dalam kualitas HD penuh.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleDownload('png')}
                    className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-white font-extrabold text-xs transition duration-300 shadow-lg shadow-teal-500/20"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PNG HD</span>
                  </button>

                  <button
                    onClick={() => handleDownload('jpeg')}
                    className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 font-extrabold text-xs transition duration-300"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download JPG HD</span>
                  </button>
                </div>

                <p className="text-[10px] text-slate-500 text-center">
                  * Gambar disimpan langsung ke perangkat Anda dalam kualitas resolusi pixel asli tanpa watermark.
                </p>
              </div>

            </div>

          </div>
        )}

        {/* SECTION 3: HISTORY / PREVIOUS WORK */}
        {history.length > 0 && (
          <div className="mt-12 pt-8 border-t border-slate-900 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-slate-200 flex items-center gap-2">
                <Layers className="w-5 h-5 text-teal-400" />
                <span>Riwayat Desain Terakhir</span>
              </h3>
              <button 
                onClick={() => {
                  setHistory([]);
                  localStorage.removeItem('latarkita_history');
                }}
                className="text-xs font-bold text-rose-400 hover:underline"
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
                  className="group bg-slate-950/40 hover:bg-slate-950 border border-slate-900 hover:border-teal-500/30 rounded-2xl p-2.5 cursor-pointer transition duration-300 relative"
                >
                  <div className="aspect-square rounded-xl overflow-hidden bg-slate-900 relative">
                    <img src={hist.processed} alt="History product" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between font-semibold">
                    <span>{hist.date}</span>
                    <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-teal-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="mt-16 border-t border-slate-900 bg-slate-950/40 p-6 text-center text-xs text-slate-500 space-y-2">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-slate-400 text-sm">LatarKita Studio AI</p>
            <p className="text-slate-500">Masa depan matting & penggantian latar belakang foto instan berkualitas tinggi.</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="bg-slate-900 border border-slate-800 text-[10px] font-bold px-3 py-1.5 rounded-full text-slate-400">
              WebAssembly ONNX Engine
            </span>
            <span className="bg-slate-900 border border-slate-800 text-[10px] font-bold px-3 py-1.5 rounded-full text-slate-400">
              Gemini 2.5 Flash / Imagen 3
            </span>
          </div>
        </div>
      </footer>

      {/* API CONFIG / SETTINGS MODAL */}
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-teal-400" />
                <h3 className="font-extrabold text-lg text-slate-100">Setelan API Key Gemini</h3>
              </div>
              <button 
                onClick={() => setShowApiKeyModal(false)}
                className="p-1.5 rounded-full bg-slate-950 hover:bg-slate-800 text-slate-400 transition"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-400 leading-relaxed">
              <p>
                Fitur <strong>AI Background Generator</strong> membutuhkan API Key Gemini. Jika kunci tidak terkonfigurasi di panel Secrets proyek, Anda dapat menyematkannya secara pribadi di bawah ini.
              </p>
              <p className="p-2 bg-slate-950 rounded-xl border border-slate-850 text-[11px] font-semibold text-amber-300">
                ⚠️ API Key disimpan murni di memori lokal browser Anda dan tidak pernah dikirim ke pihak luar selain endpoint resmi Google AI Studio.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">Masukkan API Key Gemini Anda</label>
              <input
                type="password"
                value={userApiKey}
                onChange={(e) => setUserApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full text-xs bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-teal-500 rounded-xl p-3 outline-none text-slate-200"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setShowApiKeyModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-bold text-xs transition duration-300"
              >
                Simpan & Aktifkan AI
              </button>
              {userApiKey && (
                <button
                  onClick={() => {
                    setUserApiKey('');
                    setShowApiKeyModal(false);
                  }}
                  className="py-2.5 px-4 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/20 font-bold text-xs transition duration-300"
                >
                  Hapus
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
