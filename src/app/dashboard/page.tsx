'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

function formatTime(seconds: number): string {
  const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function getWeekStart(dateStr: string): string {
  const date = new Date(dateStr);
  const day = date.getDay(); // 0 = Sunday
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust to Monday
  const monday = new Date(date.setDate(diff));
  return monday.toISOString().split('T')[0];
}

export default function DashboardPage() {
  const [dailyData, setDailyData] = useState<{ date: string; seconds: number }[]>([]);
  const [weeklyTotals, setWeeklyTotals] = useState<Record<string, number>>({});
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [allTimeTotal, setAllTimeTotal] = useState(0);

  useEffect(() => {
    const raw = JSON.parse(localStorage.getItem('listeningTime') || '{}');
    const entries = Object.entries(raw).map(([date, seconds]) => ({
      date,
      seconds: Number(seconds), // ✅ Ensure seconds is a number
    }));

    const sorted = entries.sort((a, b) => b.date.localeCompare(a.date));
    setDailyData(sorted);

    const today = new Date();
    const thisMonth = today.toISOString().slice(0, 7);
    let monthly = 0;
    let allTime = 0;
    const weekTotals: Record<string, number> = {};

    for (const { date, seconds } of entries) {
      allTime += seconds;
      if (date.startsWith(thisMonth)) monthly += seconds;

      const weekStart = getWeekStart(date);
      weekTotals[weekStart] = (weekTotals[weekStart] || 0) + seconds;
    }

    setMonthlyTotal(monthly);
    setAllTimeTotal(allTime);
    setWeeklyTotals(weekTotals);
  }, []);

  return (
    <>
      <Header />
      <main className="p-6 max-w-3xl mx-auto">
        <h1 className="text-xl font-bold mb-4">📊 My Listening Stats</h1>

        <div className="h-64 mb-8 bg-white p-4 border rounded">
          <h2 className="text-sm font-semibold mb-2">Daily Listening Time</h2>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData.slice().reverse()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip
                formatter={(val: number) => formatTime(val)}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Bar dataKey="seconds" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mb-6">
          <h2 className="font-semibold mb-2">🗓️ Weekly Totals</h2>
          <ul className="text-sm space-y-1">
            {Object.entries(weeklyTotals)
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([weekStart, seconds]) => (
                <li key={weekStart}>
                  Week of {weekStart}: {formatTime(seconds)}
                </li>
              ))}
          </ul>
        </div>

        <div className="border-t pt-4 text-sm text-gray-700 space-y-1">
          <div>📅 Monthly Total: {formatTime(monthlyTotal)}</div>
          <div>⏱️ All Time Total: {formatTime(allTimeTotal)}</div>
        </div>
      </main>
    </>
  );
}