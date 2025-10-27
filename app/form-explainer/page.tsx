'use client';
import { useState } from 'react';

export default function FormExplainerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [lang, setLang] = useState('en');
  const [out, setOut] = useState('');

  const run = async () => {
    if (!file) return;
    setOut('Analyzing form... this may take a moment.');
    const form = new FormData();
    form.append('file', file);
    form.append('lang', lang);
    const res = await fetch('/api/form-explainer', { method:'POST', body: form });
    const data = await res.json();
    setOut(data.output || data.error || '');
  };

  return (
    <div className="card">
      <h1 className="text-2xl font-bold mb-4">Form Explainer</h1>
      <input className="input" type="file" accept="application/pdf" onChange={e=>setFile(e.target.files?.[0] ?? null)} />
      <div className="flex gap-3 items-center mt-3">
        <label>Language</label>
        <select className="input max-w-xs" value={lang} onChange={e=>setLang(e.target.value)}>
          <option value="en">English</option>
          <option value="ko">Korean</option>
          <option value="zh">Chinese</option>
          <option value="fa">Farsi</option>
          <option value="es">Spanish</option>
        </select>
        <button className="btn" onClick={run}>Explain Form</button>
      </div>
      <div className="card bg-slate-50 mt-4 whitespace-pre-wrap">
        <div className="text-sm text-slate-500 mb-1">Output</div>
        <div>{out}</div>
      </div>
    </div>
  );
}
