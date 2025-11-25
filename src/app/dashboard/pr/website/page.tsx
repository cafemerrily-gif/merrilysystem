'use client';

import { useState } from 'react';
import Link from 'next/link';

type Section = {
  id: string;
  title: string;
  body: string;
};

export default function PrWebsiteEditor() {
  const [heroTitle, setHeroTitle] = useState('MERRILY CAFE');
  const [heroSubtitle, setHeroSubtitle] = useState('季節のこだわりメニューとくつろぎの空間');
  const [ctaLabel, setCtaLabel] = useState('オンラインで予約する');
  const [sections, setSections] = useState<Section[]>([
    { id: 'about', title: 'お店について', body: '丁寧に淹れたコーヒーと手作りスイーツでお待ちしています。' },
    { id: 'news', title: 'お知らせ', body: '春の新作スイーツが登場しました。数量限定です。' },
  ]);
  const [previewUrl, setPreviewUrl] = useState('https://example.com');

  const updateSection = (id: string, field: 'title' | 'body', value: string) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const addSection = () => {
    const newId = `sec-${sections.length + 1}`;
    setSections([...sections, { id: newId, title: '新しいセクション', body: 'ここに本文を入力' }]);
  };

  const removeSection = (id: string) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="bg-gradient-to-r from-primary/15 via-accent/10 to-secondary/20 border-b border-border sticky top-0 z-10 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg text-xl">📰</div>
            <div>
              <h1 className="text-2xl font-bold">公式ホームページ編集</h1>
              <p className="text-sm text-muted-foreground">広報部向け簡易CMS（プレビューのみ、保存は未実装）</p>
            </div>
          </div>
          <Link href="/dashboard/pr" className="px-4 py-2 rounded-xl border border-border bg-card hover:border-accent text-sm">
            広報部トップへ戻る
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4 bg-card border border-border rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold">コンテンツ編集</h2>
          <label className="text-sm text-muted-foreground flex flex-col gap-2">
            ヒーロータイトル
            <input
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2"
            />
          </label>
          <label className="text-sm text-muted-foreground flex flex-col gap-2">
            サブタイトル
            <input
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2"
            />
          </label>
          <label className="text-sm text-muted-foreground flex flex-col gap-2">
            CTAボタン
            <input
              value={ctaLabel}
              onChange={(e) => setCtaLabel(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2"
            />
          </label>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground flex-1">
              プレビューURL（任意）
              <input
                value={previewUrl}
                onChange={(e) => setPreviewUrl(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2"
                placeholder="https://example.com"
              />
            </label>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">セクション</h3>
              <button onClick={addSection} className="text-xs px-3 py-1 rounded-lg border border-border hover:border-accent">
                追加
              </button>
            </div>
            <div className="space-y-3">
              {sections.map((sec) => (
                <div key={sec.id} className="border border-border rounded-xl p-3 bg-muted/30 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <input
                      value={sec.title}
                      onChange={(e) => updateSection(sec.id, 'title', e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                    <button
                      onClick={() => removeSection(sec.id)}
                      className="text-xs px-2 py-1 rounded-lg border border-border hover:border-accent"
                    >
                      削除
                    </button>
                  </div>
                  <textarea
                    value={sec.body}
                    onChange={(e) => updateSection(sec.id, 'body', e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    rows={3}
                  />
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            ※ 現在はプレビューのみで保存機能は未実装です。必要に応じて API と連携してください。
          </p>
        </div>

        <div className="space-y-4 bg-card border border-border rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold">プレビュー</h2>
          <div className="border border-border rounded-xl overflow-hidden">
            <div className="bg-gradient-to-r from-primary/20 to-accent/20 p-6 text-left space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Hero</p>
              <h3 className="text-2xl font-bold">{heroTitle}</h3>
              <p className="text-sm text-muted-foreground">{heroSubtitle}</p>
              <button className="mt-3 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold">
                {ctaLabel}
              </button>
            </div>
            <div className="p-6 space-y-3">
              {sections.map((sec) => (
                <div key={sec.id} className="space-y-1">
                  <h4 className="text-lg font-semibold">{sec.title}</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{sec.body}</p>
                </div>
              ))}
            </div>
          </div>
          {previewUrl && (
            <a
              href={previewUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center text-sm text-accent hover:underline"
            >
              現在のサイトを開く
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
