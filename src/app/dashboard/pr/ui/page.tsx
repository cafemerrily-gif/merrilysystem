 'use client';

 import { ChangeEvent, useEffect, useMemo, useState } from 'react';
 import Link from 'next/link';
 import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

 type ModeKey = 'light' | 'dark';

 type SectionColors = {
   bg: string;
   bgAlpha: number;
   gradient: string;
   fg: string;
   border: string;
 };

 type ModeSections = {
   header: SectionColors & { title: string; subtitle: string; user: string };
   welcome: SectionColors & { title: string; body: string };
   card: SectionColors;
 };

type UiPayload = {
  uiSettings?: {
    [key: string]: any;
  };
  appTitle?: string;
   homeIconUrl?: string;
   loginIconUrl?: string;
   appIconUrl?: string;
   lightBackground?: string;
   lightBackgroundAlpha?: number;
   lightBackgroundGradient?: string;
   lightBorder?: string;
   lightForeground?: string;
   darkBackground?: string;
   darkBackgroundAlpha?: number;
   darkBackgroundGradient?: string;
   darkBorder?: string;
   darkForeground?: string;
   headerBgLight?: string;
   headerBgGradientLight?: string;
   headerBgAlphaLight?: number;
   headerFgLight?: string;
   headerBorderLight?: string;
   headerTitleColorLight?: string;
   headerSubtitleColorLight?: string;
   headerUserColorLight?: string;
   headerBgDark?: string;
   headerBgGradientDark?: string;
   headerBgAlphaDark?: number;
   headerFgDark?: string;
   headerBorderDark?: string;
   headerTitleColorDark?: string;
   headerSubtitleColorDark?: string;
   headerUserColorDark?: string;
   welcomeBgLight?: string;
   welcomeBgGradientLight?: string;
   welcomeBgAlphaLight?: number;
   welcomeFgLight?: string;
   welcomeBorderLight?: string;
   welcomeTitleColorLight?: string;
   welcomeBodyColorLight?: string;
   welcomeBgDark?: string;
   welcomeBgGradientDark?: string;
   welcomeBgAlphaDark?: number;
   welcomeFgDark?: string;
   welcomeBorderDark?: string;
   welcomeTitleColorDark?: string;
   welcomeBodyColorDark?: string;
   cardBgLight?: string;
   cardBgGradientLight?: string;
   cardBgAlphaLight?: number;
   cardFgLight?: string;
   cardBorderLight?: string;
   cardBgDark?: string;
   cardBgGradientDark?: string;
   cardBgAlphaDark?: number;
   cardFgDark?: string;
   cardBorderDark?: string;
   welcomeTitleText?: string;
   welcomeBodyText?: string;
   presets?: any[];
 };

 const gradientOptions = [
   { label: 'なし', value: '' },
   { label: 'Night sky', value: 'linear-gradient(135deg, #0b1220, #1f2937)' },
   { label: 'Sunrise', value: 'linear-gradient(135deg, rgba(255, 145, 0, 0.45), rgba(255, 72, 94, 0.35))' },
   { label: 'Pastel glow', value: 'linear-gradient(120deg, rgba(173, 212, 255, 0.45), rgba(255, 255, 255, 0))' },
 ];

 const defaultModeSections: ModeSections = {
   header: { bg: '#0b1220', bgAlpha: 1, gradient: '', fg: '#e5e7eb', border: '#1f2937', title: '#e5e7eb', subtitle: '#94a3b8', user: '#cbd5e1' },
   welcome: { bg: '#ffffff', bgAlpha: 1, gradient: '', fg: '#0f172a', border: '#e2e8f0', title: '#0f172a', body: '#1f2937' },
   card: { bg: '#0f172a', bgAlpha: 1, gradient: '', fg: '#e5e7eb', border: '#1f2937' },
 };

 export default function UiEditor() {
   const supabase = createClientComponentClient();
   const [selectedMode, setSelectedMode] = useState<ModeKey>('light');
   const [sections, setSections] = useState<Record<ModeKey, ModeSections>>({
     light: defaultModeSections,
     dark: defaultModeSections,
   });
   const [appTitle, setAppTitle] = useState('MERRILY');
   const [welcomeTitle, setWelcomeTitle] = useState('ようこそダッシュボードへ');
   const [welcomeBody, setWelcomeBody] = useState('最新の動きを表示します。');
   const [loginIconUrl, setLoginIconUrl] = useState('/MERRILY_Simbol.png');
   const [appIconUrl, setAppIconUrl] = useState('/MERRILY_Simbol.png');
   const [homeIconUrl, setHomeIconUrl] = useState('/MERRILY_Simbol.png');
   const [message, setMessage] = useState<string | null>(null);
   const [error, setError] = useState<string | null>(null);
   const [saving, setSaving] = useState(false);
   const [loading, setLoading] = useState(true);
   const [basePayload, setBasePayload] = useState<any>({});
   const [presets, setPresets] = useState<any[]>([{ name: 'Default', sections: { ...defaultModeSections }, base: { background: '#0f172a', border: '#1f2937', foreground: '#e5e7eb' } }]);

   useEffect(() => {
     (async () => {
       try {
          const res = await fetch('/api/pr/website', { cache: 'no-store' });
          const data: UiPayload = await res.json();
          const ui = data?.uiSettings || {};
         setAppTitle(ui.appTitle || appTitle);
         setLoginIconUrl(ui.loginIconUrl || loginIconUrl);
         setAppIconUrl(ui.appIconUrl || appIconUrl);
         setHomeIconUrl(ui.homeIconUrl || homeIconUrl);
         const nextSections: Record<ModeKey, ModeSections> = {
           light: {
             header: {
               bg: ui.headerBgLight || ui.headerBackground || defaultModeSections.header.bg,
               bgAlpha: ui.headerBgAlphaLight ?? defaultModeSections.header.bgAlpha,
               gradient: ui.headerBgGradientLight || '',
               fg: ui.headerFgLight || ui.headerForeground || defaultModeSections.header.fg,
               border: ui.headerBorderLight || defaultModeSections.header.border,
               title: ui.headerTitleColorLight || defaultModeSections.header.title,
               subtitle: ui.headerSubtitleColorLight || defaultModeSections.header.subtitle,
               user: ui.headerUserColorLight || defaultModeSections.header.user,
             },
             welcome: {
               bg: ui.welcomeBgLight || ui.welcomeBackground || defaultModeSections.welcome.bg,
               bgAlpha: ui.welcomeBgAlphaLight ?? defaultModeSections.welcome.bgAlpha,
               gradient: ui.welcomeBgGradientLight || '',
               fg: ui.welcomeFgLight || ui.welcomeForeground || defaultModeSections.welcome.fg,
               border: ui.welcomeBorderLight || defaultModeSections.welcome.border,
               title: ui.welcomeTitleColorLight || defaultModeSections.welcome.title,
               body: ui.welcomeBodyColorLight || defaultModeSections.welcome.body,
             },
             card: {
               bg: ui.cardBgLight || ui.cardBackground || defaultModeSections.card.bg,
               bgAlpha: ui.cardBgAlphaLight ?? defaultModeSections.card.bgAlpha,
               gradient: ui.cardBgGradientLight || '',
               fg: ui.cardFgLight || ui.cardForeground || defaultModeSections.card.fg,
               border: ui.cardBorderLight || defaultModeSections.card.border,
             },
           },
           dark: {
             header: {
               bg: ui.headerBgDark || ui.headerBackground || defaultModeSections.header.bg,
               bgAlpha: ui.headerBgAlphaDark ?? defaultModeSections.header.bgAlpha,
               gradient: ui.headerBgGradientDark || '',
               fg: ui.headerFgDark || ui.headerForeground || defaultModeSections.header.fg,
               border: ui.headerBorderDark || defaultModeSections.header.border,
               title: ui.headerTitleColorDark || defaultModeSections.header.title,
               subtitle: ui.headerSubtitleColorDark || defaultModeSections.header.subtitle,
               user: ui.headerUserColorDark || defaultModeSections.header.user,
             },
             welcome: {
               bg: ui.welcomeBgDark || ui.welcomeBackground || defaultModeSections.welcome.bg,
               bgAlpha: ui.welcomeBgAlphaDark ?? defaultModeSections.welcome.bgAlpha,
               gradient: ui.welcomeBgGradientDark || '',
               fg: ui.welcomeFgDark || ui.welcomeForeground || defaultModeSections.welcome.fg,
               border: ui.welcomeBorderDark || defaultModeSections.welcome.border,
               title: ui.welcomeTitleColorDark || defaultModeSections.welcome.title,
               body: ui.welcomeBodyColorDark || defaultModeSections.welcome.body,
             },
             card: {
               bg: ui.cardBgDark || ui.cardBackground || defaultModeSections.card.bg,
               bgAlpha: ui.cardBgAlphaDark ?? defaultModeSections.card.bgAlpha,
               gradient: ui.cardBgGradientDark || '',
               fg: ui.cardFgDark || ui.cardForeground || defaultModeSections.card.fg,
               border: ui.cardBorderDark || defaultModeSections.card.border,
             },
           },
         };
         setSections(nextSections);
         setMessage('保存済みの設定を読み込みました');
       } catch (e) {
         setError('設定の取得に失敗しました');
       } finally {
         setLoading(false);
       }
     })();
   }, []);

   const currentSection = sections[selectedMode];
   const cardTextColor = currentSection.card.fg;
   const cardBorderColor = currentSection.card.border;

   const updateSection = (section: keyof ModeSections, field: keyof SectionColors, value: string | number) => {
     setSections((prev) => ({
       ...prev,
       [selectedMode]: {
         ...prev[selectedMode],
         [section]: {
           ...prev[selectedMode][section],
           [field]: value,
         },
       },
     }));
   };

   const handleSave = async () => {
     setSaving(true);
     try {
       const payload: UiPayload = {
         appTitle,
         homeIconUrl,
         loginIconUrl,
         appIconUrl,
         lightBackground: '#f8fafc',
       };
       await fetch('/api/pr/website', {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ payload, updated_by: 'UI editor' }),
       });
       setMessage('保存しました');
     } catch {
       setError('保存に失敗しました');
     } finally {
       setSaving(false);
     }
   };

   const preset = useMemo(
     () => ({
       name: 'Default',
       sections: {
         light: sections.light,
         dark: sections.dark,
       },
     }),
     [sections],
   );

   if (loading) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-background text-foreground">読み込み中...</div>
     );
   }

   return (
     <div className="min-h-screen bg-background text-foreground">
       <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
         <div className="flex items-center justify-between">
           <h1 className="text-xl font-semibold">UI 編集</h1>
           <Link href="/dashboard/pr" className="text-sm text-muted-foreground hover:text-accent">広報トップへ</Link>
         </div>

         <div className="grid gap-3 md:grid-cols-2">
           {(['light', 'dark'] as ModeKey[]).map((mode) => (
             <button
               key={mode}
               onClick={() => setSelectedMode(mode)}
               className={`rounded-xl border px-3 py-2 text-sm font-semibold ${selectedMode === mode ? 'border-accent bg-accent/10' : 'border-border'}`}
             >
               {mode === 'light' ? 'ライトモード' : 'ダークモード'}
             </button>
           ))}
         </div>

         <div
           className="rounded-2xl border bg-card p-5 shadow"
           style={{ color: cardTextColor, borderColor: cardBorderColor }}
         >
           <h2 className="text-lg font-semibold mb-3">カード全体</h2>
           <div className="grid gap-3 md:grid-cols-3">
             <label className="text-sm space-y-1">
               文字色
               <input type="color" value={cardTextColor} onChange={(e) => updateSection('card', 'fg', e.target.value)} />
             </label>
             <label className="text-sm space-y-1">
               背景色
               <input type="color" value={currentSection.card.bg} onChange={(e) => updateSection('card', 'bg', e.target.value)} />
             </label>
             <label className="text-sm space-y-1">
               グラデーション
               <select
                 value={currentSection.card.gradient}
                 onChange={(e) => updateSection('card', 'gradient', e.target.value)}
               >
                 {gradientOptions.map((opt) => (
                   <option key={opt.value} value={opt.value}>
                     {opt.label}
                   </option>
                 ))}
               </select>
             </label>
           </div>
         </div>

         <button
           onClick={handleSave}
           disabled={saving}
           className="w-full rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
         >
           {saving ? '保存中...' : 'UI設定を保存'}
         </button>

         {message && <p className="text-sm text-foreground">{message}</p>}
         {error && <p className="text-sm text-destructive">{error}</p>}
       </div>
     </div>
   );
 }
