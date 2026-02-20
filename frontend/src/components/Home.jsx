import { useState } from 'react';
import { FileAudio, Upload, Download } from 'lucide-react';
import axios from 'axios';

export default function Home() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState('');

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);

    const formData = new FormData();
    formData.append('audio', file);

    try {
      const response = await axios.post('http://localhost:7071/api/transcribe', formData);
      setTranscript(response.data.transcription || 'Transcription completed');
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 grow">
      <div className="bg-white rounded-lg shadow-lg p-8 sm:p-10 max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <FileAudio className="w-5 h-5" />
          <h2 className="text-lg sm:text-xl font-semibold">Upload Audio File</h2>
        </div>
        
        <div className="flex gap-4 mb-4">
          <input
            type="file"
            accept=""
            onChange={(e) => setFile(e.target.files[0])}
            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-black file:text-white hover:file:bg-gray-800 file:cursor-pointer"
          />
          <button 
            onClick={handleUpload}
            disabled={!file || loading}
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap">
            <Upload className="w-4 h-4" />
            {loading ? 'Uploading...' : 'Transcribe'}
          </button>
          <button 
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap">
            Clear
          </button>
        </div>

        <p className="text-xs text-gray-500 mb-6">Supports mp3, wav, mp4, and m4a files up to 200MB</p>
      </div>

      <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg max-w-3xl mx-auto">
        <p className="text-red-600 text-sm">Error message here</p>
      </div>

      {transcript && (
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6 sm:p-8 max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Transcript:</h3>
            <button 
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition">
              <Download className="w-4 h-4" />
              Export TXT
            </button>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-800 whitespace-pre-wrap">{transcript}</p>
          </div>
        </div>
      )}
    </main>
  );
}
