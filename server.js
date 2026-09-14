import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const KHO_DU_LIEU_BASE_URL = (process.env.KHO_DU_LIEU_BASE_URL || 'https://api.example.com').replace(/\/$/, '');
const KHO_DU_LIEU_API_KEY = process.env.KHO_DU_LIEU_API_KEY || 'fake_key';

// Proxy endpoints
const proxyRequest = async (req, res) => {
  try {
    const url = `${KHO_DU_LIEU_BASE_URL}${req.originalUrl.replace('/api/kho-du-lieu', '/api/v1')}`;
    console.log(`[Proxy] GET ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${KHO_DU_LIEU_API_KEY}`,
        'Content-Type': 'application/json'
      },
      // cache: "no-store"
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error('[Proxy Error]', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

// Map routes
app.get('/api/kho-du-lieu/courses', proxyRequest);
app.get('/api/kho-du-lieu/courses/:slug', proxyRequest);
app.get('/api/kho-du-lieu/lessons/:id/bundle', proxyRequest);
app.get('/api/kho-du-lieu/vocabulary/search', proxyRequest);
app.get('/api/kho-du-lieu/grammar', proxyRequest);

// Serve static frontend in production
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(port, '127.0.0.1', () => {
  console.log(`Backend Server running on http://127.0.0.1:${port}`);
});
