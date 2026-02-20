import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import { initTranscriber, transcribeAudio } from './transcribe.js';

const app = express();
const PORT = 7071;

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Initialize transcription model on startup
initTranscriber();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Transcription endpoint
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const transcription = await transcribeAudio(req.file.path);
    res.json({ 
      transcription,
      filename: req.file.originalname 
    });
  } catch (error) {
    console.error('Transcription error:', error);
    // Clean up file on error
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Transcription failed' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
