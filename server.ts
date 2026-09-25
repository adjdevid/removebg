import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files from Vite build output
app.use(express.static(path.join(__dirname, 'dist')));

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

// API: Get app configuration status
app.get('/api/config', (req: Request, res: Response) => {
  res.json({
    hasApiKey: !!apiKey || !!req.headers['x-api-key'],
    appName: "LatarKita AI"
  });
});

// API: Generate background image using Gemini Image model
app.post('/api/generate-bg', async (req: Request, res: Response) => {
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
      // Check if text was returned instead (e.g. safety block or error message)
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
app.post('/api/suggest-prompts', async (req: Request, res: Response) => {
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

    res.json({ suggestions });
  } catch (error) {
    console.error('Error suggesting prompts:', error);
    res.json({
      suggestions: [
        "Studio profesional modern dengan pencahayaan softbox minimalis",
        "Meja kayu rustic hangat di kafe estetik sore hari dengan bokeh lembut",
        "Latar belakang marmer putih mewah dengan bayangan tanaman tropis",
        "Dinding beton industrial abu-abu dengan pencahayaan dramatis"
      ]
    });
  }
});

// Handle React routing, return all other requests to React app
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
