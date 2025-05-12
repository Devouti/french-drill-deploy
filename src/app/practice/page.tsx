'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { useAudioStore } from '@/lib/store';
import { loadAudioFiles } from '@/lib/audioStorage';

type Phrase = {
  'Filename': string;
  'Phrase': string;
  'English': string;
  'Grammar and Structure': string;
  'Transliteration': string;
};

function formatTime(seconds: number): string {
  const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export default function PracticePage() {
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [index, setIndex] = useState(0);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [dailyTime, setDailyTime] = useState(0);
  const { audioFiles, setAudioFiles } = useAudioStore();

  const current = phrases[index];

  useEffect(() => {
    const active = localStorage.getItem('activeDataset') || 'default';

    if (active === 'custom') {
      const dataset = JSON.parse(localStorage.getItem('customDataset') || '[]');
      setPhrases(dataset);

      // ✅ Load audio files from IndexedDB into Zustand
      loadAudioFiles().then((files) => {
        setAudioFiles(files);
      });
    } else {
      fetch('/data/default.json')
        .then((res) => res.json())
        .then((data) => setPhrases(data));
    }

    // Load listening time
    const today = new Date().toISOString().split('T')[0];
    const stored = JSON.parse(localStorage.getItem('listeningTime') || '{}');
    setDailyTime(stored[today] || 0);
  }, [setAudioFiles]);

  const playAudio = () => {
    if (!current) return;

    const active = localStorage.getItem('activeDataset') || 'default';
    const filename = current['Filename'];

    let url = '';
    if (active === 'custom') {
      const file = audioFiles[filename];
      if (!file) {
        alert(`Audio file not found: ${filename}`);
        return;
      }
      url = URL.createObjectURL(file);
    } else {
      url = `/audio/${filename}`;
    }

    const newAudio = new Audio(url);
    setAudio(newAudio);
    newAudio.play().catch((err) => {
      console.error('Playback failed:', err);
    });

    newAudio.onloadedmetadata = () => {
      const duration = Math.floor(newAudio.duration);
      const today = new Date().toISOString().split('T')[0];
      const stored = JSON.parse(localStorage.getItem('listeningTime') || '{}');
      stored[today] = (stored[today] || 0) + duration;
      localStorage.setItem('listeningTime', JSON.stringify(stored));
      setDailyTime(stored[today]);
    };
  };

  const next = () => setIndex((index + 1) % phrases.length);
  const prev = () => setIndex((index - 1 + phrases.length) % phrases.length);

  return (
    <>
      <Header />
      <main className="p-6 max-w-xl mx-auto">
        {current ? (
          <>
            <div className="text-2xl font-bold mb-2">
              {current['Phrase']}
            </div>

            <div className="text-gray-600 text-sm mb-4">
              {current['Transliteration']}
            </div>

            <div className="flex gap-4 items-center mb-4">
              <button
                onClick={playAudio}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                ▶️ Play
              </button>

              <div className="relative group">
                <span className="underline cursor-pointer">🧠 Grammar</span>
                <div
                  className="absolute hidden group-hover:block border border-gray-300 p-2 text-sm w-64 shadow-lg z-10"
                  style={{ backgroundColor: 'white', color: 'black' }}
                >
                  {current['Grammar and Structure']}
                </div>
              </div>

              <div className="relative group">
                <span className="underline cursor-pointer">🗨️ Translation</span>
                <div
                  className="absolute hidden group-hover:block border border-gray-300 p-2 text-sm w-64 shadow-lg z-10"
                  style={{ backgroundColor: 'white', color: 'black' }}
                >
                  {current['English']}
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button onClick={prev} className="text-blue-600 hover:underline">
                ← Back
              </button>
              <button onClick={next} className="text-blue-600 hover:underline">
                Next →
              </button>
            </div>

            <div className="mt-6 text-center text-sm text-gray-600">
              Daily Listening Time: {formatTime(dailyTime)}
            </div>
          </>
        ) : (
          <div>Loading phrases...</div>
        )}
      </main>
    </>
  );
}