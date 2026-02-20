import { pipeline } from '@xenova/transformers';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';

const execPromise = promisify(exec);
let transcriber = null;

async function getTranscriber() {
  if (!transcriber) {
    transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en');
  }
  return transcriber;
}

async function processAudio(filePath) {
  const outputPath = filePath + '.wav';
  await execPromise(`ffmpeg -i "${filePath}" -ar 16000 -ac 1 -f f32le -acodec pcm_f32le "${outputPath}"`);
  const audioData = new Float32Array(fs.readFileSync(outputPath).buffer);
  fs.unlinkSync(outputPath);
  return audioData;
}

export async function initTranscriber() {
  await getTranscriber();
  console.log('Transcription model loaded');
}

export async function transcribeAudio(filePath) {
  const model = await getTranscriber();
  const audio = await processAudio(filePath);
  const result = await model(audio, { chunk_length_s: 30, stride_length_s: 5 });
  
  // Clean up uploaded file
  fs.unlinkSync(filePath);
  
  return result.text;
}
