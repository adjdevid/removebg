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

// API: Generate background image using Gemini Image model
app.post(['/api/generate-bg', '/generate-bg'], async (req: Request, res: Response) => {
  const { prompt, aspectRatio = '1:1', userApiKey } = req.body;

  if (!prompt) {
    res.status(400).json({ error: 'Prompt is required.' });
    return;
  }

  // Determine client to use (server-side configured key or user-provided header key)
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
    } catch (e) {
      res.status(500).json({ error: 'Failed to initialize Gemini with the provided API Key.' });
      return;
    }
  }

  if (!activeAi) {
    res.status(400).json({ 
      error: 'API Key is missing. Silakan masukkan API Key Anda di pengaturan atau pastikan rahasia sistem dikonfigurasi.' 
    });
    return;
  }

  try {
    console.log(`Generating image for prompt: "${prompt}" with aspect ratio: ${aspectRatio}`);
    
    // Using gemini-3.1-flash-lite-image as the high-speed standard image generator
    const response = await activeAi.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: [
          {
            text: `${prompt}, high resolution, professional photography studio lighting, photorealistic, 8k, commercially usable background backplate`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
        },
      },
    });

    if (!response.candidates?.[0]?.content?.parts) {
      throw new Error('No content returned from Gemini model.');
    }

    // Iterate through parts to find the image part
    let base64Image = '';
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        base64Image = part.inlineData.data;
        break;
      }
    }

    if (!base64Image) {
      let textResponse = '';
      for (const part of response.candidates[0].content.parts) {
        if (part.text) {
          textResponse += part.text;
        }
      }
      throw new Error(textResponse || 'Model did not return any image data.');
    }

    res.json({
      success: true,
      imageUrl: `data:image/png;base64,${base64Image}`,
    });
  } catch (error: any) {
    console.error('Error in background generation:', error);
    res.status(500).json({ 
      error: error.message || 'Gagal menghasilkan latar belakang AI. Silakan coba deskripsi lain atau gunakan API Key yang valid.' 
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
