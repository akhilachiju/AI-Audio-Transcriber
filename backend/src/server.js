import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { initTranscriber, transcribeAudio } from './transcribe.js';

const app = express();
const PORT = 7071;

const upload = multer({ dest: 'uploads/' });

initTranscriber();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

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
    res.status(500).json({ error: 'Transcription failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
