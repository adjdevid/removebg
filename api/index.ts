import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware with large payload limit for base64 images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize Gemini API Client
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    console.log('Gemini API successfully initialized on server-side.');
  } catch (error) {
    console.error('Failed to initialize Gemini API:', error);
  }
} else {
  console.warn('GEMINI_API_KEY is not defined in the environment. AI background generation will require user API keys or fallbacks.');
}

// API: Get app configuration status (support both /api/config and /config for Vercel rewrites)
app.get(['/api/config', '/config'], (req: Request, res: Response) => {
  res.json({
    hasApiKey: !!apiKey || !!req.headers['x-api-key'],
    hasRemoveBgKey: !!process.env.REMOVE_BG_API_KEY,
    hasPollinationsKey: !!(process.env.POLLINATIONS_API_KEY || process.env.POLLINATION_API_KEY || process.env.POLLINATIONS_KEY),
    appName: "LatarKita AI"
  });
});

// API: Server-side Remove.bg Background Removal using REMOVE_BG_API_KEY from environment
app.post(['/api/remove-bg', '/remove-bg'], async (req: Request, res: Response) => {
  const { image } = req.body;

  if (!image) {
    res.status(400).json({ error: 'Data gambar wajib disertakan.' });
    return;
  }

  const rmbgKey = process.env.REMOVE_BG_API_KEY;
  if (!rmbgKey) {
    res.status(400).json({
      error: 'NO_KEY',
      message: 'REMOVE_BG_API_KEY belum dikonfigurasi di file environment (.env) server.'
    });
    return;
  }

  try {
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': rmbgKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image_file_b64: base64Data,
        size: 'auto'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      let detailMsg = errorText;
      try {
        const parsed = JSON.parse(errorText);
        if (parsed.errors && parsed.errors.length > 0) {
          detailMsg = parsed.errors.map((e: any) => e.title).join(', ');
        }
      } catch (e) {}
      throw new Error(`Remove.bg error (${response.status}): ${detailMsg}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    res.json({
      success: true,
      imageUrl: `data:image/png;base64,${base64}`,
      engine: 'removebg'
    });
  } catch (err: any) {
    console.error('Remove.bg error:', err);
    res.status(500).json({ error: err.message || 'Gagal memproses dengan Remove.bg' });
  }
});

// API: Generate background image using Pollinations.ai (Flux) with POLLINATIONS_API_KEY from environment
app.post(['/api/generate-bg', '/generate-bg'], async (req: Request, res: Response) => {
  const { prompt, aspectRatio = '1:1', userApiKey } = req.body;

  if (!prompt) {
    res.status(400).json({ error: 'Deskripsi prompt latar belakang wajib diisi.' });
    return;
  }

  const pollinationsKey = userApiKey || 
    process.env.POLLINATIONS_API_KEY || 
    process.env.POLLINATION_API_KEY || 
    process.env.POLLINATIONS_KEY || 
    '';

  // Map aspect ratio to optimal image resolutions for Pollinations Flux
  let width = 1024;
  let height = 1024;
  if (aspectRatio === '16:9') {
    width = 1280;
    height = 720;
  } else if (aspectRatio === '9:16') {
    width = 720;
    height = 1280;
  } else if (aspectRatio === '4:3') {
    width = 1024;
    height = 768;
  } else if (aspectRatio === '3:4') {
    width = 768;
    height = 1024;
  }

  // Enhanced prompt to ensure a clean studio backdrop without random people or unwanted artifacts
  const enhancedPrompt = `${prompt}, commercial product photography studio background, professional lighting, photorealistic, 8k, ultra detailed, clean backplate, empty scene, no people`;
  const seed = Math.floor(Math.random() * 100000000);

  try {
    console.log(`[Pollinations.ai] Generating background with prompt: "${prompt}", size: ${width}x${height}`);

    const primaryUrl = `https://gen.pollinations.ai/image/${encodeURIComponent(enhancedPrompt)}?width=${width}&height=${height}&model=flux&seed=${seed}&nologo=true`;
    
    const fetchHeaders: Record<string, string> = {
      'Accept': 'image/*'
    };
    if (pollinationsKey) {
      fetchHeaders['Authorization'] = `Bearer ${pollinationsKey}`;
    }

    let response = await fetch(primaryUrl, {
      method: 'GET',
      headers: fetchHeaders
    });

    // Fallback to image.pollinations.ai endpoint if needed
    if (!response.ok) {
      const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=${width}&height=${height}&model=flux&seed=${seed}&nologo=true${pollinationsKey ? `&key=${encodeURIComponent(pollinationsKey)}` : ''}`;
      console.log(`[Pollinations.ai] Trying alternative endpoint...`);
      response = await fetch(fallbackUrl, {
        method: 'GET',
        headers: fetchHeaders
      });
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`Pollinations API error (${response.status}): ${errorText || 'Gagal menghasilkan gambar dari Pollinations.ai'}`);
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    res.json({
      success: true,
      imageUrl: `data:${contentType};base64,${base64}`,
      engine: 'pollinations.ai',
      model: 'flux'
    });
  } catch (error: any) {
    console.error('Error generating background with Pollinations.ai:', error);

    // Optional Gemini fallback if GEMINI_API_KEY is available
    if (ai) {
      try {
        console.log('Attempting Gemini fallback for background generation...');
        const geminiRes = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite-image',
          contents: {
            parts: [{ text: `${prompt}, commercial studio background, 8k, photorealistic` }]
          },
          config: {
            imageConfig: {
              aspectRatio: aspectRatio as any
            }
          }
        });
        const imgPart = geminiRes.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        if (imgPart?.inlineData?.data) {
          res.json({
            success: true,
            imageUrl: `data:image/png;base64,${imgPart.inlineData.data}`,
            engine: 'gemini-fallback'
          });
          return;
        }
      } catch (geminiErr) {
        console.warn('Gemini fallback failed:', geminiErr);
      }
    }

    res.status(500).json({ 
      error: error.message || 'Gagal menghasilkan latar belakang AI dengan Pollinations.ai. Pastikan POLLINATIONS_API_KEY telah diisi di file .env.' 
    });
  }
});

// API: Get AI background prompt suggestions based on image description
app.post(['/api/suggest-prompts', '/suggest-prompts'], async (req: Request, res: Response) => {
  const { description, category, userApiKey } = req.body;

  let activeAi = ai;
  const requestKey = userApiKey || req.headers['x-api-key'] || apiKey;

  if (!activeAi && requestKey) {
    try {
      activeAi = new GoogleGenAI({
        apiKey: requestKey as string,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (e) {}
  }

  // If no AI client, return some pre-made curated local prompts
  if (!activeAi) {
    res.json({
      suggestions: [
        "Studio profesional modern dengan pencahayaan softbox minimalis",
        "Meja kayu rustic hangat di kafe estetik sore hari dengan bokeh lembut",
        "Latar belakang marmer putih mewah dengan bayangan tanaman tropis daun palem",
        "Dinding beton industrial modern abu-abu dengan pencahayaan dramatis"
      ]
    });
    return;
  }

  try {
    const promptText = `Anda adalah ahli pengarah gaya foto profesional. Berikan 4 ide deskripsi latar belakang (background prompt) kreatif dan spesifik dalam bahasa Indonesia untuk foto subjek berkategori "${category || 'Umum'}".
Deskripsi tambahan subjek: "${description || 'Foto produk/orang'}".
Fokuskan pada gaya pencahayaan (lighting), material alas, suasana (mood), dan estetika studio profesional yang akan mempercantik subjek tersebut.
Setiap ide harus ringkas, maksimal 12 kata, berformat langsung deskripsi adegan dalam bahasa Indonesia. Jangan sertakan nomor atau pengantar. Pisahkan setiap ide dengan baris baru.`;

    const response = await activeAi.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
    });

    const text = response.text || '';
    const suggestions = text
      .split('\n')
      .map(s => s.replace(/^\d+[\.\-\s]+/, '').trim())
      .filter(s => s.length > 0)
      .slice(0, 4);

    if (suggestions.length > 0) {
      res.json({ suggestions });
      return;
    }
  } catch (error: any) {
    if (error?.status === 'RESOURCE_EXHAUSTED' || error?.message?.includes('429') || error?.message?.includes('Quota exceeded')) {
      console.info('Catatan: Kuota Gemini sedang padat, menggunakan saran template kurasi profesional.');
    } else {
      console.warn('Catatan prompt Gemini:', error?.message || error);
    }
  }

  // Smart contextual fallback based on category
  const categoryPrompts: Record<string, string[]> = {
    'Produk': [
      "Studio podium minimalis elegan dengan pencahayaan softbox lembut pastel",
      "Meja marmer putih mewah dengan bayangan dedaunan palem tropis",
      "Alas kayu jati alami di kafe estetik dengan latar bokeh hangat",
      "Dinding semen ekspos industrial modern dengan pencahayaan dramatis"
    ],
    'Orang': [
      "Studio foto profesional abu-abu netral dengan pencahayaan rim light",
      "Kafe bernuansa hangat dengan jendela kaca besar dan cahaya sore",
      "Latar perkotaan modern estetik luar ruangan dengan bokeh lembut",
      "Interior kantor minimalis modern bersih dan profesional"
    ],
    'Makanan': [
      "Meja marmer dapur estetik dengan taburan rempah dan pencahayaan pagi",
      "Meja kayu pedesaan dengan piring keramik dan tanaman hijau segar",
      "Restoran fine dining mewah dengan pencahayaan lilin dramatis",
      "Kafe brunch cerah dengan sinar matahari alami menerpa meja"
    ]
  };

  const fallback = categoryPrompts[category as string] || [
    "Studio profesional modern dengan pencahayaan softbox minimalis",
    "Meja kayu rustic hangat di kafe estetik sore hari dengan bokeh lembut",
    "Latar belakang marmer putih mewah dengan bayangan tanaman tropis",
    "Dinding beton industrial abu-abu dengan pencahayaan dramatis"
  ];

  res.json({ suggestions: fallback });
});

export default app;
