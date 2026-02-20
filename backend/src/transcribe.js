import { pipeline } from '@xenova/transformers';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';

const execPromise = promisify(exec);
let transcriber = null;

// Load and cache the Whisper model
async function getTranscriber() {
  if (!transcriber) {
    // Available Whisper models (uncomment to switch):
    // transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en'); // 75MB, fastest, English only
    // transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-base.en'); // 150MB, fast, English only
     transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-small'); // 250MB, balanced accuracy/speed, multilingual
    // transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-medium'); // 1.5GB, high accuracy, slower, multilingual
  }
  return transcriber;
}

// Convert audio to Float32Array format using ffmpeg
async function processAudio(filePath) {
  const outputPath = filePath + '.wav';
  try {
    // Convert to 16kHz mono PCM float32 format
    await execPromise(`ffmpeg -i "${filePath}" -ar 16000 -ac 1 -f f32le -acodec pcm_f32le "${outputPath}"`);
    const audioData = new Float32Array(fs.readFileSync(outputPath).buffer);
    return audioData;
  } finally {
    // Always clean up temporary wav file
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }
  }
}

// Initialize transcriber on server startup
export async function initTranscriber() {
  await getTranscriber();
  console.log('Transcription model loaded');
}

// Transcribe audio file and return text
export async function transcribeAudio(filePath) {
  const model = await getTranscriber();
  const audio = await processAudio(filePath);
  
  // Process audio in chunks for better accuracy
  const result = await model(audio, { chunk_length_s: 30, stride_length_s: 5 });
  
  // Clean up uploaded file
  fs.unlinkSync(filePath);
  
  return result.text;
}
