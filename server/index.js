import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: path.join(__dirname, 'uploads') });
const DATA_FILE = path.join(__dirname, 'data.json');

// Ensure uploads dir and data file
fs.mkdirSync(path.join(__dirname, 'uploads'), { recursive: true });
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ reports: [], tokens: [] }, null, 2));
}

function readData() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
  catch (e) { return { reports: [], tokens: [] }; }
}
function writeData(d) { fs.writeFileSync(DATA_FILE, JSON.stringify(d, null, 2)); }

// List reports
app.get('/reports', (req, res) => {
  const data = readData();
  res.json(data.reports);
});

// Create report (multipart for optional image)
app.post('/reports', upload.single('image'), (req, res) => {
  const data = readData();
  const body = req.body || {};
  const id = Date.now().toString();
  const report = {
    id,
    title: body.title || body.type || 'Untitled',
    description: body.description || '',
    type: body.type || '',
    location: body.location || null,
    priority: body.priority || 'normal',
    status: 'new',
    createdAt: new Date().toISOString(),
    image: null,
    ...body
  };
  if (req.file) {
    // move to uploads with original extension if present
    const ext = path.extname(req.file.originalname) || '';
    const dest = path.join(__dirname, 'uploads', req.file.filename + ext);
    fs.renameSync(req.file.path, dest);
    report.image = `/uploads/${path.basename(dest)}`;
  }
  data.reports.push(report);
  writeData(data);
  res.status(201).json(report);
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Get single report
app.get('/reports/:id', (req, res) => {
  const data = readData();
  const r = data.reports.find(x => x.id === req.params.id);
  if (!r) return res.status(404).json({ error: 'Not found' });
  res.json(r);
});

// Update report
app.patch('/reports/:id', (req, res) => {
  const data = readData();
  const idx = data.reports.findIndex(x => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const allowed = ['status','department','assignee','priority','title','description'];
  for (const k of allowed) if (k in req.body) data.reports[idx][k] = req.body[k];
  data.reports[idx].updatedAt = new Date().toISOString();
  writeData(data);
  res.json(data.reports[idx]);
});

// Simple routing engine
app.post('/route/:id', (req, res) => {
  const data = readData();
  const idx = data.reports.findIndex(x => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const report = data.reports[idx];
  const t = (report.type||'').toLowerCase();
  let department = 'General';
  if (t.includes('garbage') || t.includes('litter')) department = 'Sanitation';
  else if (t.includes('pothole') || t.includes('road')) department = 'Public Works';
  else if (t.includes('noise')) department = 'Enforcement';
  report.department = department;
  report.status = 'routed';
  report.updatedAt = new Date().toISOString();
  writeData(data);
  res.json(report);
});

// Subscribe device token (simple)
app.post('/subscribe', (req, res) => {
  const token = req.body?.token;
  if (!token) return res.status(400).json({ error: 'token required' });
  const data = readData();
  if (!data.tokens.includes(token)) data.tokens.push(token);
  writeData(data);
  res.json({ ok: true, tokens: data.tokens.length });
});

// Basic health
app.get('/_health', (req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

app.listen(port, '0.0.0.0', () => {
  console.log(`API listening on http://0.0.0.0:${port}`);
});
