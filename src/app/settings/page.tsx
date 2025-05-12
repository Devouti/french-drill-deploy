'use client';

import { useRef, useState } from 'react';
import Papa from 'papaparse';
import Header from '@/components/Header';
import { useAudioStore } from '@/lib/store';
import { saveAudioFiles } from '@/lib/audioStorage';

export default function SettingsPage() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const csvRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLInputElement>(null);

  const handleUpload = () => {
    setError('');
    setSuccess('');

    const csvFile = csvRef.current?.files?.[0];
    const audioFiles = audioRef.current?.files;

    if (!csvFile || !audioFiles || audioFiles.length === 0) {
      setError('Please select both a CSV file and MP3 files.');
      return;
    }

    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as Record<string, string>[];

        // Validate required headers
        const required = ['Filename', 'Phrase', 'English', 'Grammar and Structure', 'Transliteration'];
        const hasAll = required.every((key) => key in data[0]);

        if (!hasAll) {
          setError('CSV is missing one or more required columns.');
          return;
        }

        // Build audio file map
        const fileMap: Record<string, File> = {};
        for (const file of Array.from(audioFiles)) {
          fileMap[file.name] = file;
        }

        // ✅ Save to Zustand + IndexedDB
        useAudioStore.getState().setAudioFiles(fileMap);
        saveAudioFiles(fileMap);

        // ✅ Save phrases + activate dataset
        localStorage.setItem('customDataset', JSON.stringify(data));
        localStorage.setItem('activeDataset', 'custom');
        setSuccess('Custom dataset uploaded successfully!');
      },
      error: (err) => setError(`CSV parse error: ${err.message}`),
    });
  };

  const handleUseDefault = () => {
    localStorage.setItem('activeDataset', 'default');
    setSuccess('Switched to default dataset.');
  };

  return (
    <>
      <Header />
      <main className="p-6 max-w-xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span>⚙️</span> <span>Settings</span>
        </h1>

        {error && <div className="text-red-600">{error}</div>}
        {success && <div className="text-green-600">{success}</div>}

        <div>
          <label className="block font-semibold mb-1">Upload CSV File</label>
          <input type="file" accept=".csv" ref={csvRef} className="mb-4" />
        </div>

        <div>
          <label className="block font-semibold mb-1">Upload MP3 Files</label>
          <input type="file" accept=".mp3" ref={audioRef} multiple className="mb-4" />
        </div>

        <div className="flex gap-4 mt-4">
          <button
            onClick={handleUpload}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Upload Custom Dataset
          </button>

          <button
            onClick={handleUseDefault}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Use Default Dataset
          </button>
        </div>
      </main>
    </>
  );
}