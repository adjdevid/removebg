import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import app from './api/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

// Serve static files from Vite build output
app.use(express.static(path.join(__dirname, 'dist')));

// Handle React routing, return all other requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
