import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { initialDatabase, demoDatabase } from './src/services/initialData.ts';
import { DatabaseSchema } from './src/types/index.ts';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

const DATA_DIR = path.join(process.cwd(), 'server', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure database file exists with initial data if not already present
function initDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      return parsed;
    } else {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDatabase, null, 2), 'utf-8');
      return initialDatabase;
    }
  } catch (err) {
    console.error('Error initializing database file, falling back to in-memory initialDatabase:', err);
    return initialDatabase;
  }
}

let dbState: DatabaseSchema = initDb();

function saveDb(newState: DatabaseSchema): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(newState, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
    dbState = newState;
    return true;
  } catch (err) {
    console.error('Error saving database file:', err);
    dbState = newState;
    return false;
  }
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// GET complete database
app.get('/api/db', (req, res) => {
  res.json(dbState);
});

// Save complete database state
app.post('/api/db', (req, res) => {
  const updated = req.body;
  if (!updated || typeof updated !== 'object') {
    return res.status(400).json({ error: 'Payload de banco de dados inválido' });
  }
  saveDb(updated);
  res.json({ success: true, message: 'Dados salvos com sucesso no servidor' });
});

// Reset to demo data
app.post('/api/reset-demo', (req, res) => {
  saveDb(demoDatabase);
  res.json({ success: true, message: 'Dados de demonstração restaurados', data: dbState });
});

// Clear all data (start fresh)
app.post('/api/clear-all', (req, res) => {
  const emptyDb: DatabaseSchema = {
    settings: {
      ...dbState.settings,
    },
    clients: [],
    leads: [],
    projects: [],
    portfolio: [],
    payments: [],
    installments: [],
    timeLogs: [],
    tasks: [],
    proposals: [],
    services: [],
    servicePackages: [],
    events: [],
    clientHistory: [],
    files: [],
    expenses: [],
  };
  saveDb(emptyDb);
  res.json({ success: true, message: 'Todos os dados foram limpos com sucesso', data: dbState });
});

// ----------------------------------------------------
// VITE MIDDLEWARE / SPA FALLBACK
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FreelanceHub server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
