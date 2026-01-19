import React, { useState, useEffect, useMemo, useRef } from 'react';

// --- 核心配置 ---
const STORAGE_KEY = 'life_os_data_v8_final';
const CUSTOM_CATS_KEY = 'life_os_custom_categories_v1';

// --- 基础样式重置 ---
const appContainerStyle = {
  width: '100vw',
  minHeight: '100vh',
  backgroundColor: '#f9fafb',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  overflowX: 'hidden',
  margin: 0,
  padding: 0,
};

// --- ⚡️ 强力样式注入 ---
const GlobalStyles = () => (
  <style>{`
    html, body, #root { width: 100vw; min-height: 100vh; margin: 0; padding: 0; overflow-x: hidden; background-color: #f9fafb; }
    *, *::before, *::after { outline: none !important; -webkit-tap-highlight-color: transparent !important; }
    button:focus, input:focus, select:focus, textarea:focus, [role="button"]:focus { outline: none !important; box-shadow: none !important; border-color: transparent !important; }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    .safe-top-padding { padding-top: env(safe-area-inset-top); }
    .safe-bottom-padding { padding-bottom: env(safe-area-inset-bottom); }
    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
    
    /* 强制单行文本不换行 */
    .whitespace-nowrap { white-space: nowrap; }
  `}</style>
);

// --- 图标组件 (SVG) ---
const Icons = {
  BookOpen: (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  Search: (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  Settings: (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>,
  Plus: (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>,
  X: (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
  Trash2: (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>,
  Star: (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  BarChart3: (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>,
  Filter: (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  ChevronDown: (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>,
  Download: (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>,
  Upload: (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>,
  Info: (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>,
  Calendar: (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>,
  TrendingUp: (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  Award: (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>,
  Users: (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Clock: (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  CheckCircle: (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  Flag: (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>,
  PauseCircle: (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="10" x2="10" y1="15" y2="9"/><line x1="14" x2="14" y1="15" y2="9"/></svg>,
  Film: (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="7" x2="7" y1="3" y2="21"/><line x1="17" x2="17" y1="3" y2="21"/><line x1="3" x2="21" y1="12" y2="12"/><line x1="3" x2="7" y1="7" y2="7"/><line x1="3" x2="7" y1="17" y2="17"/><line x1="17" x2="21" y1="17" y2="17"/><line x1="17" x2="21" y1="7" y2="7"/></svg>,
  MapPin: (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
};

// --- 配置数据 ---
const COLOR_PRESETS = [
  { label: '蓝', color: 'text-blue-500', bg: 'bg-blue-50' },
  { label: '绿', color: 'text-green-500', bg: 'bg-green-50' },
  { label: '紫', color: 'text-purple-500', bg: 'bg-purple-50' },
  { label: '橙', color: 'text-orange-500', bg: 'bg-orange-50' },
  { label: '红', color: 'text-red-500', bg: 'bg-red-50' },
  { label: '粉', color: 'text-pink-500', bg: 'bg-pink-50' },
  { label: '青', color: 'text-cyan-600', bg: 'bg-cyan-50' },
  { label: '琥珀', color: 'text-amber-500', bg: 'bg-amber-50' },
  { label: '灰', color: 'text-slate-600', bg: 'bg-gray-100' },
  { label: '玫瑰', color: 'text-rose-500', bg: 'bg-red-50' },
];

const SUPER_CATEGORIES = {
  all:   { label: '全部时光', icon: Icons.BookOpen },
  media: { label: '影音娱乐', icon: Icons.Film },
  life:  { label: '生活成就', icon: Icons.Award },
  place: { label: '现实足迹', icon: Icons.MapPin },
};

const DEFAULT_CATEGORIES = {
  movie:   { group: 'media', label: '电影', icon: '🎬', color: 'text-blue-500', bg: 'bg-blue-50' },
  tv:      { group: 'media', label: '剧集', icon: '📺', color: 'text-green-500', bg: 'bg-green-50' },
  anime:   { group: 'media', label: '番剧', icon: '🎢', color: 'text-purple-500', bg: 'bg-purple-50' },
  manga:   { group: 'media', label: '漫画', icon: '📖', color: 'text-orange-500', bg: 'bg-orange-50' },
  game:    { group: 'media', label: '游戏', icon: '🎮', color: 'text-indigo-500', bg: 'bg-indigo-50' },
  music:   { group: 'media', label: '音乐', icon: '🎵', color: 'text-red-500', bg: 'bg-red-50' },
  concert: { group: 'media', label: 'Live', icon: '🎤', color: 'text-pink-500', bg: 'bg-pink-50' },
  recipe:  { group: 'life', label: '食谱/烹饪', icon: '🍳', color: 'text-emerald-600', bg: 'bg-green-50' },
  place:   { group: 'place', label: '地点/探店', icon: '📍', color: 'text-rose-500', bg: 'bg-red-50' },
};

const EMOJI_PICKER = ['😀', '😂', '🥰', '😎', '🤔', '😴', '😭', '🤯', '🥳', '👻', '💀', '👽', '🤖', '💩', '👍', '👎', '👊', '✌️', '🫶', '🧠', '👀', '👶', '🐶', '🐱', '🐭', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷️', '🕸️', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🦣', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🦬', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐈‍⬛', '🐓', '🦃', '🦚', '🦜', '🦢', '🦩', '🕊️', '🐇', '🦝', '🦨', '🦡', '🦦', '🦫', '🦥', '🐁', '🐀', '🐿️', '🦔', '🐾', '🐉', '🐲', '🌵', '🎄', '🌲', '🌳', '🌴', '🪵', '🌱', '🌿', '☘️', '🍀', '🎍', '🪴', '🎋', '🍃', '🍂', '🍁', '🍄', '🐚', '🪨', '🌾', '💐', '🌷', '🌹', '🥀', '🌺', '🌸', '🌼', '🌻', '🌞', '🌝', '🌛', '🌜', '🌚', '🌕', '🌖', '🌗', '🌘', '🌑', '🌒', '🌓', '🌔', '🌙', '🌎', '🌍', '🌏', '🪐', '💫', '⭐️', '🌟', '✨', '⚡️', '☄️', '💥', '🔥', '🌪️', '🌈', '☀️', '🌤️', '⛅️', '🌥️', '☁️', '🌦️', '🌧️', '🌨️', '🌩️', '', '❄️', '☃️', '⛄️', '🌬️', '💨', '💧', '💦', '🫧', '☂️', '☔️', '⛱️', '⚡', '❄️', '🔥', '💧', '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🥅', '🏒', '🏑', '🏏', '🥍', '🏹', '🎣', '🤿', '🥊', '🥋', '⛸️', '🥌', '🛷', '🎿', '⛷️', '🏂', '🪂', '🏋️‍♀️', '🤼‍♀️', '🤸‍♀️', '⛹️‍♀️', '🤺', '🤾‍♀️', '🏌️‍♀️', '🏇', '🧘‍♀️', '🏄‍♀️', '🏊‍♀️', '🤽‍♀️', '🚣‍♀️', '🧗‍♀️', '🚵‍♀️', '🚴‍♀️', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '🏵️', '🎗️', '🎫', '🎟️', '🎪', '🤹', '🎭', '🩰', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🪘', '🎷', '🎺', '🪗', '🎸', '🪕', '🎻', '🎲', '♟️', '🎯', '🎳', '🎮', '🎰', '🧩', '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🦯', '🦽', '🦼', '🛴', '🚲', '🛵', '🏍️', '🛺', '🚨', '🚔', '🚍', '🚘', '🚖', '🚡', '🚠', '🚟', '🚃', '🚋', '🚞', '🚝', '🚄', '🚅', '🚈', '🚂', '🚆', '🚇', '🚊', '🚉', '✈️', '🛫', '🛬', '🛩️', '💺', '🛰️', '🚀', '🛸', '🚁', '🛶', '⛵', '🚤', '🛥️', '🛳️', '⛴️', '🚢', '⚓', '🪝', '⛽', '🚧', '🚦', '🚥', '🚏', '🗺️', '🗿', '🗽', '🗼', '🏰', '🏯', '🏟️', '🎡', '🎢', '🎠', '⛲', '⛱️', '🏖️', '🏝️', '🏜️', '🌋', '⛰️', '🏔️', '🗻', '🏕️', '⛺', '🛖', '🏠', '🏡', '🏘️', '🏚️', '🏗️', '🏭', '🏢', '🏬', '🏣', '🏤', '🏥', '🏦', '🏨', '🏪', '🏫', '🏩', '💒', '🏛️', '⛪', '🕌', '🕍', '🛕', '🕋', '⛩️', '🛤️', '🛣️', '🗾', '🎑', '🏞️', '🌅', '🌄', '🌠', '🎇', '🎆', '🌇', '🌆', '🏙️', '🌃', '🌌', '🌉', '🌁'];

const RATING_LABELS = ['差', '一般', '还行', '不错', '神作']; // 精简文案

const STATUS_OPTIONS = {
  todo:    { icon: Icons.Flag,        color: 'text-blue-500', bg: 'bg-blue-100' },
  doing:   { icon: Icons.Clock,       color: 'text-yellow-600', bg: 'bg-yellow-100' },
  done:    { icon: Icons.CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
  dropped: { icon: Icons.PauseCircle, color: 'text-gray-500', bg: 'bg-gray-100' },
};

// ⚡️ 修复：精简文案，防止换行
const getStatusLabel = (status, group) => {
  const map = {
    media: { todo: '待办', doing: '在看', done: '完成', dropped: '搁置' },
    life:  { todo: '计划', doing: '进行', done: '完成', dropped: '放弃' },
    place: { todo: '想去', doing: '途中', done: '去过', dropped: '取消' },
  };
  return map[group]?.[status] || map.media[status];
};

const useSystemInit = () => {
  useEffect(() => {
    if (!document.querySelector('meta[name="viewport"]')) {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
      document.head.appendChild(meta);
    }
    if (!document.getElementById('tailwind-css')) {
      const link = document.createElement('link');
      link.id = 'tailwind-css';
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css';
      document.head.appendChild(link);
    }
    const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="#18181b"/><path d="M256 96 L256 416" stroke="white" stroke-width="32" stroke-linecap="round"/><path d="M160 256 L352 256" stroke="white" stroke-width="32" stroke-linecap="round"/><circle cx="256" cy="256" r="64" fill="white"/></svg>`;
    const iconUrl = `data:image/svg+xml;base64,${btoa(iconSvg)}`;
    const links = [{ rel: 'icon', href: iconUrl }, { rel: 'apple-touch-icon', href: iconUrl }];
    links.forEach(attr => {
      let link = document.querySelector(`link[rel="${attr.rel}"]`);
      if (!link) { link = document.createElement('link'); link.rel = attr.rel; document.head.appendChild(link); }
      link.href = attr.href;
    });
  }, []);
};

const StarRating = ({ rating, setRating, editable = false }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!editable}
          className={`transition-all duration-200 ${editable ? 'cursor-pointer transform hover:scale-110' : 'cursor-default'} outline-none focus:outline-none focus:ring-0`}
          style={{ outline: 'none', border: 'none' }} 
          onClick={() => setRating && setRating(star)}
          onMouseEnter={() => editable && setHover(star)}
          onMouseLeave={() => editable && setHover(0)}
        >
          <Icons.Star size={editable ? 24 : 14} className={`${star <= (hover || rating) ? 'text-yellow-400' : 'text-gray-200'}`} fill={star <= (hover || rating) ? "currentColor" : "none"} />
        </button>
      ))}
      {editable && (hover || rating) > 0 && (
        <span className="ml-2 text-xs font-medium text-gray-500 animate-fade-in">{RATING_LABELS[(hover || rating) - 1]}</span>
      )}
    </div>
  );
};

const EmptyState = ({ type, year }) => (
  <div className="flex flex-col items-center justify-center py-20 text-gray-400 animate-fade-in">
    <div className="bg-gray-100 p-6 rounded-full mb-6 shadow-inner">
      {type === 'analytics' ? <Icons.BarChart3 size={48} className="text-gray-300" /> : <Icons.BookOpen size={48} className="text-gray-300" />}
    </div>
    <h3 className="text-xl font-bold text-gray-600 mb-2">{type === 'analytics' ? '数据分析空白' : '开始记录'}</h3>
    <p className="text-sm text-gray-500 max-w-xs text-center leading-relaxed">
      {type === 'analytics' ? `${year}年还没有足够的数据。` : `在${year === 'all' ? '' : year + '年'}还没有记录。点击“记录”按钮，开始记录你的人生。`}
    </p>
  </div>
);

const Card = ({ item, categoryConfig, onDelete }) => {
  const config = categoryConfig || DEFAULT_CATEGORIES.movie;
  const categoryLabel = config.icon || '📦';
  const statusKey = item.status || 'done'; 
  const statusConfig = STATUS_OPTIONS[statusKey] || STATUS_OPTIONS.done;
  const StatusIcon = statusConfig.icon;
  const statusLabel = getStatusLabel(statusKey, config.group || 'media');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300 group relative flex flex-col h-full">
      <div className="relative h-40 bg-gray-100 overflow-hidden flex-shrink-0">
        {item.coverUrl ? (
          <img src={item.coverUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" onError={(e) => {e.target.style.display='none'; e.target.nextSibling.style.display='flex'}} />
        ) : null}
        <div className={`absolute inset-0 flex items-center justify-center bg-gray-50 text-5xl ${item.coverUrl ? 'hidden' : 'flex'}`}>
          <span className="opacity-50 filter grayscale">{categoryLabel}</span>
        </div>
        {/* ⚡️ 修复：使用 whitespace-nowrap 防止文字换行 */}
        <div className={`absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full font-bold shadow-sm flex items-center gap-1 whitespace-nowrap ${statusConfig.bg} ${statusConfig.color} bg-opacity-90`}>
          <StatusIcon size={10} strokeWidth={3} /> {statusLabel}
        </div>
        <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-0.5 rounded font-mono z-10">{item.date}</div>
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-2">
           <div className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider whitespace-nowrap ${config.bg} ${config.color}`}>{config.label}</div>
           {statusKey !== 'todo' && <StarRating rating={item.rating} />}
        </div>
        <h3 className="font-bold text-gray-800 text-lg mb-1 truncate group-hover:text-black transition-colors" title={item.title}>{item.title}</h3>
        {/* ⚡️ 修复：图标与文字对齐，使用 leading-none 和 relative top-[1px] 微调 */}
        {item.companions && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2 leading-none">
            <Icons.Users size={13} className="text-gray-400 flex-shrink-0 relative top-[1px]" />
            <span className="truncate">与 {item.companions}</span>
          </div>
        )}
        {item.summary && <p className="text-xs text-gray-500 mb-3 leading-relaxed opacity-80 h-8 overflow-hidden">{item.summary}</p>}
        <div className="relative mt-auto pt-3 border-t border-gray-50">
           {item.comment ? <p className="text-sm text-gray-700 italic leading-relaxed">"{item.comment}"</p> : <p className="text-xs text-gray-300 italic">暂无短评...</p>}
        </div>
        <button onClick={() => onDelete(item.id)} className="absolute top-2 left-2 p-1.5 bg-white bg-opacity-90 text-gray-400 hover:text-red-500 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 group-hover:translate-x-0 outline-none focus:outline-none focus:ring-0" title="删除" style={{outline:'none'}}><Icons.Trash2 size={14} /></button>
      </div>
    </div>
  );
};

const AddCategoryModal = ({ isOpen, onClose, onAdd }) => {
  const [data, setData] = useState({ label: '', group: 'life', icon: '😀', colorIndex: 0 });
  if (!isOpen) return null;
  const handleSubmit = (e) => {
    e.preventDefault();
    const key = `custom_${Date.now()}`;
    const colorPreset = COLOR_PRESETS[data.colorIndex];
    onAdd(key, { group: data.group, label: data.label, icon: data.icon, color: colorPreset.color, bg: colorPreset.bg, isCustom: true });
    setData({ label: '', group: 'life', icon: '😀', colorIndex: 0 }); onClose();
  };
  
  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(17, 24, 39, 0.4)', zIndex: 60, backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-fade-in p-6">
        <div className="flex justify-between items-center mb-6"><h2 className="text-lg font-bold">新增分类</h2><button onClick={onClose} className="outline-none focus:outline-none focus:ring-0" style={{outline:'none'}}><Icons.X size={20} className="text-gray-400" /></button></div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">名称</label><input required autoFocus className="w-full border rounded-lg p-2 focus:border-black transition-colors outline-none focus:outline-none focus:ring-0" placeholder="例如：健身、摄影..." value={data.label} onChange={e => setData({...data, label: e.target.value})} style={{outline:'none'}} /></div>
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">所属大类</label><div className="grid grid-cols-3 gap-2">{Object.entries(SUPER_CATEGORIES).filter(([k]) => k !== 'all').map(([k, v]) => (<button key={k} type="button" onClick={() => setData({...data, group: k})} className={`text-xs p-2 rounded-lg border font-bold flex flex-col items-center gap-1 outline-none focus:outline-none focus:ring-0 ${data.group === k ? 'bg-black text-white border-black' : 'bg-gray-50 text-gray-600 border-gray-200'}`} style={{outline:'none'}}><v.icon size={14} /> {v.label}</button>))}</div></div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">图标</label>
            <div className="grid grid-cols-8 gap-2 p-1 text-xl overflow-y-auto" style={{ maxHeight: '8rem' }}>
              {EMOJI_PICKER.map(emoji => (
                <button key={emoji} type="button" onClick={() => setData({...data, icon: emoji})} className={`p-1 rounded flex items-center justify-center outline-none focus:outline-none focus:ring-0 ${data.icon === emoji ? 'bg-blue-100 ring-2 ring-blue-500' : 'hover:bg-gray-100'}`} style={{outline:'none'}}>{emoji}</button>
              ))}
            </div>
          </div>
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-2">主题色</label><div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">{COLOR_PRESETS.map((p, idx) => (<button key={idx} type="button" onClick={() => setData({...data, colorIndex: idx})} className={`w-6 h-6 rounded-full flex-shrink-0 border-2 outline-none focus:outline-none focus:ring-0 ${p.bg} ${data.colorIndex === idx ? 'border-black transform scale-110' : 'border-transparent'}`} style={{ backgroundColor: 'currentColor', color: 'inherit', outline:'none' }}><div className={`w-full h-full rounded-full ${p.color.replace('text-', 'bg-')}`}></div></button>))}</div></div>
          <button type="submit" className="w-full bg-black text-white py-3 rounded-xl font-bold mt-4 outline-none focus:outline-none focus:ring-0" style={{outline:'none'}}>创建</button>
        </form>
      </div>
    </div>
  )
}

const Modal = ({ isOpen, onClose, onSubmit, categories }) => {
  const [formData, setFormData] = useState({ title: '', category: 'movie', rating: 0, date: new Date().toISOString().split('T')[0], comment: '', summary: '', link: '', coverUrl: '', status: 'done', companions: '' });

  const currentCat = categories[formData.category] || DEFAULT_CATEGORIES.movie;
  const group = currentCat.group || 'media';

  const handleSearchInfo = () => {
    if (!formData.title) return;
    const catLabel = currentCat.label || '';
    let keyword = '简介';
    if (formData.category === 'recipe' || catLabel.includes('食')) keyword = '做法';
    if (group === 'place') keyword = '地址 介绍';
    const query = `${formData.title} ${catLabel} ${keyword}`;
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
  };

  if (!isOpen) return null;
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setTimeout(() => setFormData({ title: '', category: 'movie', rating: 0, date: new Date().toISOString().split('T')[0], comment: '', summary: '', link: '', coverUrl: '', status: 'done', companions: '' }), 200);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto" style={{ backgroundColor: 'rgba(17, 24, 39, 0.4)', zIndex: 50, backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl animate-fade-in my-8 flex flex-col" style={{ maxHeight: '90vh' }}>
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2"><Icons.Plus className="bg-black text-white rounded-full p-0.5" size={18} /> 新记录</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-800 transition-colors outline-none focus:outline-none focus:ring-0" style={{outline:'none'}}><Icons.X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
          <div className="bg-gray-50 p-1.5 rounded-xl flex gap-1">
             {Object.keys(STATUS_OPTIONS).map(key => {
               const config = STATUS_OPTIONS[key];
               const Icon = config.icon;
               const label = getStatusLabel(key, group);
               const isActive = formData.status === key;
               return (
                 <button key={key} type="button" onClick={() => setFormData({...formData, status: key})} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all outline-none focus:outline-none focus:ring-0 ${isActive ? 'bg-white shadow-sm text-black' : 'text-gray-400 hover:text-gray-600'}`} style={{outline:'none'}}>
                   <Icon size={14} className={isActive ? config.color : ''} /> {label}
                 </button>
               )
             })}
          </div>
          <div><div className="flex justify-between mb-1"><label className="text-xs font-bold text-gray-500 uppercase tracking-wide">名称 *</label><button type="button" onClick={handleSearchInfo} disabled={!formData.title} className="text-xs text-blue-600 hover:underline disabled:opacity-50 flex items-center gap-1 outline-none focus:outline-none focus:ring-0" style={{outline:'none'}}><Icons.Search size={10} /> 搜资料</button></div><input required autoFocus type="text" placeholder="标题 / 地点 / 菜名..." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black focus:border-black outline-none transition-all text-lg font-medium focus:outline-none focus:ring-0" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{outline:'none'}} /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">分类</label><div className="relative"><select className="w-full pl-3 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none font-medium text-gray-700 focus:outline-none focus:ring-0" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{outline:'none'}}><optgroup label="📺 影音娱乐">{Object.entries(categories).filter(([,v]) => v.group === 'media').map(([k,v]) => <option key={k} value={k}>{v.label} {v.label}</option>)}</optgroup><optgroup label="🍳 生活成就">{Object.entries(categories).filter(([,v]) => v.group === 'life').map(([k,v]) => <option key={k} value={k}>{v.label} {v.label}</option>)}</optgroup><optgroup label="📍 现实足迹">{Object.entries(categories).filter(([,v]) => v.group === 'place').map(([k,v]) => <option key={k} value={k}>{v.label} {v.label}</option>)}</optgroup></select><Icons.ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} /></div></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">日期</label><input type="date" required className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-700 focus:outline-none focus:ring-0" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} style={{outline:'none'}} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">和谁一起? (可选)</label><div className="relative"><input type="text" placeholder="女朋友 / 基友 / 爸妈" className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:border-blue-500 outline-none focus:outline-none focus:ring-0" value={formData.companions} onChange={e => setFormData({...formData, companions: e.target.value})} style={{outline:'none'}} /><Icons.Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} /></div></div>
             {formData.status !== 'todo' && (<div className="bg-yellow-50/50 p-2 rounded-xl border border-yellow-100 flex flex-col items-center justify-center gap-1"><span className="text-xs font-bold text-yellow-600 uppercase tracking-wide">评价</span><StarRating rating={formData.rating} setRating={(r) => setFormData({...formData, rating: r})} editable /></div>)}
          </div>
          <div className="space-y-3"><div className="grid grid-cols-1 gap-3"><input type="text" placeholder="一句话简介 / 位置 / 备注" className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:border-blue-500 outline-none focus:outline-none focus:ring-0" value={formData.summary} onChange={e => setFormData({...formData, summary: e.target.value})} style={{outline:'none'}} /><div className="flex flex-col sm:flex-row gap-3"><input type="url" placeholder="封面图片 URL" className="w-full sm:w-1/2 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:border-blue-500 outline-none focus:outline-none focus:ring-0" value={formData.coverUrl} onChange={e => setFormData({...formData, coverUrl: e.target.value})} style={{outline:'none'}} /><input type="url" placeholder="相关链接 URL" className="w-full sm:w-1/2 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:border-blue-500 outline-none focus:outline-none focus:ring-0" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} style={{outline:'none'}} /></div></div></div>
          <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">详细记录</label><textarea rows="3" placeholder="写点什么..." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black focus:border-black outline-none resize-none text-gray-700 leading-relaxed focus:outline-none focus:ring-0" value={formData.comment} onChange={e => setFormData({...formData, comment: e.target.value})} style={{outline:'none'}} /></div>
          <button type="submit" className="w-full bg-black text-white py-3.5 rounded-xl font-bold hover:bg-gray-800 transition-all transform active:scale-[0.98] shadow-lg shadow-gray-200 outline-none focus:outline-none focus:ring-0" style={{outline:'none'}}>保存记录</button>
        </form>
      </div>
    </div>
  );
};

const SettingsModal = ({ isOpen, onClose, items, onImport }) => {
    const fileInputRef = useRef(null);
    const [importStatus, setImportStatus] = useState('');
    if (!isOpen) return null;
    const handleExport = () => {
        const dataStr = JSON.stringify(items, null, 2);
        const link = document.createElement("a");
        link.href = URL.createObjectURL(new Blob([dataStr], { type: "application/json" }));
        link.download = `life_os_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
        setImportStatus('备份已下载'); setTimeout(() => setImportStatus(''), 3000);
    };
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedData = JSON.parse(event.target.result);
                if (Array.isArray(importedData)) {
                    if(confirm(`准备导入 ${importedData.length} 条数据，这将覆盖当前数据。确定吗？`)) {
                        onImport(importedData); setImportStatus('✅ 成功'); setTimeout(() => { setImportStatus(''); onClose(); }, 1500);
                    }
                } else alert('格式错误');
            } catch (err) { alert('文件无效'); }
        };
        reader.readAsText(file); e.target.value = null; 
    };
    return (
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 50, backdropFilter: 'blur(2px)' }}>
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-fade-in">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2"><Icons.Settings size={18} /> 数据管理</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 outline-none focus:outline-none focus:ring-0" style={{outline:'none'}}><Icons.X size={20} /></button>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-sm text-gray-500 bg-blue-50 p-3 rounded-lg flex gap-2"><Icons.Info size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />数据仅存在本地。换设备前请先导出。</p>
                    <button onClick={handleExport} className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-all shadow-md active:scale-95 outline-none focus:outline-none focus:ring-0" style={{outline:'none'}}><Icons.Download size={18} /> 导出备份</button>
                    <div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400">或</span></div></div>
                    <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileChange} />
                    <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-all active:scale-95 outline-none focus:outline-none focus:ring-0" style={{outline:'none'}}><Icons.Upload size={18} /> 导入恢复</button>
                    {importStatus && <p className="text-center text-sm font-medium text-green-600 animate-bounce">{importStatus}</p>}
                </div>
            </div>
        </div>
    );
};

const Dashboard = ({ items, categories, year, availableYears, onYearChange }) => {
  const stats = useMemo(() => {
    const activeItems = items.filter(item => (!item.status || item.status !== 'todo'));
    const yearItems = activeItems.filter(item => item.date.startsWith(year));
    if (yearItems.length === 0) return null;
    const total = yearItems.length;
    const avgRating = (yearItems.reduce((acc, cur) => acc + cur.rating, 0) / total).toFixed(1);
    const superDist = { media: 0, life: 0, place: 0 };
    yearItems.forEach(item => {
        const catConfig = categories[item.category] || DEFAULT_CATEGORIES.movie;
        const group = catConfig.group || 'media';
        if (superDist[group] !== undefined) superDist[group]++;
    });
    const months = Array(12).fill(0);
    yearItems.forEach(item => { months[parseInt(item.date.split('-')[1], 10) - 1]++; });
    return { total, avgRating, superDist, months, favorites: yearItems.filter(i => i.rating === 5), topRated: yearItems.sort((a, b) => b.rating - a.rating)[0] };
  }, [items, year, categories]);

  return (
    <div className="space-y-8 animate-fade-in w-full px-6">
      {/* ⚡️ 修复：手机端布局优化，防止时间溢出 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-6">
        <div><h2 className="text-3xl font-black text-gray-900 tracking-tight">年度回顾</h2><p className="text-gray-500 mt-1">只统计已完成或进行中的足迹</p></div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm w-full sm:w-auto"><span className="text-xs font-medium text-gray-400 px-2 flex-shrink-0">选择年份</span><select value={year} onChange={(e) => onYearChange(e.target.value)} className="bg-gray-100 border-none rounded-md px-3 py-1.5 font-bold text-gray-800 outline-none cursor-pointer hover:bg-gray-200 transition-colors outline-none focus:outline-none focus:ring-0 flex-grow sm:flex-grow-0" style={{outline:'none'}}>{availableYears.map(y => <option key={y} value={y}>{y}</option>)}</select></div>
      </div>
      {!stats ? <EmptyState type="analytics" year={year} /> : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Icons.TrendingUp size={100} /></div>
              <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">{year} 活跃记录</p>
              <div className="flex items-baseline gap-2"><span className="text-5xl font-black tracking-tighter">{stats.total}</span><span className="text-lg opacity-60 font-medium">项</span></div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
               <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-4">领域分布</p>
               <div className="space-y-3">
                   <div className="flex justify-between items-center"><span className="flex items-center gap-2">🎬 影音娱乐</span><span className="font-bold">{stats.superDist.media}</span></div>
                   <div className="flex justify-between items-center"><span className="flex items-center gap-2">🍳 生活成就</span><span className="font-bold">{stats.superDist.life}</span></div>
                   <div className="flex justify-between items-center"><span className="flex items-center gap-2">📍 现实足迹</span><span className="font-bold">{stats.superDist.place}</span></div>
               </div>
            </div>
             <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
               <div><p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-2">平均体验</p><div className="flex items-center gap-3"><span className="text-5xl font-black text-gray-900 tracking-tighter">{stats.avgRating}</span><div className="flex flex-col"><div className="flex text-yellow-400">{[...Array(5)].map((_, i) => <Icons.Star key={i} size={12} fill={i < Math.round(stats.avgRating) ? "currentColor" : "none"} className={i < Math.round(stats.avgRating) ? "" : "text-gray-300"} />)}</div><span className="text-xs text-gray-400 mt-1">满分 5.0</span></div></div></div>
            </div>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-8 flex items-center gap-2 text-lg"><Icons.Calendar className="text-gray-400" size={20} /> 月度活跃热力图</h3>
            <div className="flex items-end justify-between h-32 gap-3">{stats.months.map((count, idx) => { const max = Math.max(...stats.months); const height = max === 0 ? 0 : (count / max) * 100; const isMax = count === max && max > 0; return (<div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end"><div className={`w-full rounded-md transition-all duration-500 relative min-h-0 ${isMax ? 'bg-gray-800' : 'bg-gray-200 group-hover:bg-gray-400'}`} style={{ height: `${height}%`, minHeight: '4px' }}><div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs font-bold px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">{count}<div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-black rotate-45"></div></div></div><span className={`text-xs uppercase mt-3 font-medium ${isMax ? 'text-black' : 'text-gray-400'}`}>{idx + 1}月</span></div>); })}</div>
          </div>
          {stats.topRated && (
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5"><Icons.Award size={120} /></div>
              <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2"><Icons.Award className="text-yellow-500" /> 年度之最</h3>
              <div className="flex gap-5 relative z-10">
                  <div className="w-24 h-36 bg-gray-100 rounded-lg shadow-md flex-shrink-0 overflow-hidden relative">
                     {stats.topRated.coverUrl ? <img src={stats.topRated.coverUrl} className="w-full h-full object-cover" alt="Top Rated" /> : <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-100"><Icons.Award size={32} /></div>}
                     <div className="absolute top-2 left-0 bg-yellow-400 text-white text-xs font-bold px-2 py-0.5 shadow-sm">TOP 1</div>
                  </div>
                  <div className="flex-1 py-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${categories[stats.topRated.category]?.bg || 'bg-gray-100'} ${categories[stats.topRated.category]?.color || 'text-gray-600'}`}>{categories[stats.topRated.category]?.label || '未知'}</span>
                        <span className="text-xs text-gray-400">{stats.topRated.date}</span>
                    </div>
                    <h4 className="font-bold text-xl text-gray-900 mb-1 leading-tight">{stats.topRated.title}</h4>
                    <div className="flex mb-3"><StarRating rating={stats.topRated.rating} /></div>
                    {stats.topRated.comment && <div className="mt-auto bg-gray-50 p-3 rounded-lg border border-gray-100"><p className="text-xs text-gray-600 italic">"{stats.topRated.comment}"</p></div>}
                  </div>
                </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default function App() {
  useSystemInit(); 
  const [items, setItems] = useState(() => { try { const saved = localStorage.getItem(STORAGE_KEY); return saved ? JSON.parse(saved) : []; } catch (e) { return [] } });
  const [customCats, setCustomCats] = useState(() => { try { const saved = localStorage.getItem(CUSTOM_CATS_KEY); return saved ? JSON.parse(saved) : {}; } catch (e) { return {} } });
  const categories = useMemo(() => ({ ...DEFAULT_CATEGORIES, ...customCats }), [customCats]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }, [items]);
  useEffect(() => { localStorage.setItem(CUSTOM_CATS_KEY, JSON.stringify(customCats)); }, [customCats]);
  const [activeSuperCat, setActiveSuperCat] = useState('all'); 
  const [activeSubCat, setActiveSubCat] = useState('all');    
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState(() => new Date().getFullYear().toString());
  const [analyticsYear, setAnalyticsYear] = useState(() => new Date().getFullYear().toString());
  const availableYears = useMemo(() => { const years = new Set(items.map(item => item.date.split('-')[0])); const list = Array.from(years).sort().reverse(); const current = new Date().getFullYear().toString(); if (!list.includes(current)) list.unshift(current); return list; }, [items]);
  const addItem = (data) => { const newItem = { ...data, id: Date.now().toString(), rating: parseInt(data.rating) }; setItems([newItem, ...items]); setFilterYear(newItem.date.split('-')[0]); setViewMode('list'); };
  const addCategory = (key, data) => { setCustomCats({...customCats, [key]: data}); };
  const deleteItem = (id) => { if (confirm('确定要删除吗？')) setItems(items.filter(item => item.id !== id)); };
  
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (activeSuperCat !== 'all') {
        const catConfig = categories[item.category] || DEFAULT_CATEGORIES.movie;
        const itemGroup = catConfig.group || 'media';
        if (itemGroup !== activeSuperCat) return false;
      }
      if (activeSubCat !== 'all') {
        if (item.category !== activeSubCat) return false;
      }
      return true;
    })
    .filter(item => filterYear === 'all' || item.date.startsWith(filterYear))
    .filter(item => item.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [items, activeSuperCat, activeSubCat, filterYear, searchTerm, categories]);

  const handleSuperCatChange = (key) => { setActiveSuperCat(key); setActiveSubCat('all'); };

  return (
    <div style={appContainerStyle}>
      <GlobalStyles />
      <nav className="sticky top-0 z-40 bg-white bg-opacity-80 border-b border-gray-200 safe-top-padding" style={{ backdropFilter: 'blur(12px)' }}>
        <div className="w-full px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setViewMode('list')}><div className="bg-black text-white p-1.5 rounded-lg shadow-lg transform group-hover:scale-110 transition-transform"><Icons.BookOpen size={20} /></div><h1 className="font-bold text-xl tracking-tight hidden sm:block">LifeOS</h1></div>
             <div className="hidden md:flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                <button onClick={() => setViewMode('list')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all outline-none focus:outline-none focus:ring-0 ${viewMode === 'list' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`} style={{outline:'none'}}>列表</button>
                <button onClick={() => setViewMode('analytics')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all outline-none focus:outline-none focus:ring-0 ${viewMode === 'analytics' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`} style={{outline:'none'}}>回顾</button>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="relative hidden md:block group"><Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={16} /><input type="text" placeholder="搜索..." className="bg-gray-100 border-transparent focus:bg-white border focus:border-black rounded-full pl-9 pr-4 py-1.5 text-sm transition-all w-32 focus:w-48 outline-none focus:outline-none focus:ring-0" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{outline:'none'}} /></div>
             <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors outline-none focus:outline-none focus:ring-0" style={{outline:'none'}}><Icons.Settings size={20} /></button>
             <button className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-full outline-none focus:outline-none focus:ring-0" onClick={() => setViewMode(viewMode === 'list' ? 'analytics' : 'list')} style={{outline:'none'}}>{viewMode === 'list' ? <Icons.BarChart3 size={20} /> : <Icons.Filter size={20} />}</button>
            <button onClick={() => setIsModalOpen(true)} className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all transform active:scale-95 shadow-xl shadow-gray-200 outline-none focus:outline-none focus:ring-0" style={{outline:'none'}}><Icons.Plus size={16} /><span className="hidden sm:inline">记录</span></button>
          </div>
        </div>
        {viewMode === 'list' && (
            <div className="border-t border-gray-100 bg-white">
                <div className="w-full px-6 flex items-center overflow-x-auto no-scrollbar">
                    {/* ⚡️ 修复：使用下划线导航风格，且无聚焦黑框 */}
                    {Object.entries(SUPER_CATEGORIES).map(([key, value]) => { const Icon = value.icon; return (
                      <button 
                        key={key} 
                        onClick={() => handleSuperCatChange(key)} 
                        className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap outline-none focus:outline-none focus:ring-0 ${activeSuperCat === key ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                        style={{outline:'none'}}
                      >
                        <Icon size={16} />{value.label}
                      </button>
                    )})}
                     <div className="ml-auto pl-4 border-l border-gray-100 flex items-center gap-2"><span className="text-xs font-bold text-gray-400 uppercase">年份</span><select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="bg-transparent text-sm font-bold text-gray-900 outline-none cursor-pointer outline-none focus:outline-none focus:ring-0" style={{outline:'none'}}><option value="all">全部</option>{availableYears.map(y => <option key={y} value={y}>{y}</option>)}</select></div>
                </div>
            </div>
        )}
        {viewMode === 'list' && activeSuperCat !== 'all' && (
             <div className="bg-gray-50 border-b border-gray-200">
                 <div className="w-full px-6 py-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
                     <button onClick={() => setActiveSubCat('all')} className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap outline-none focus:outline-none focus:ring-0 ${activeSubCat === 'all' ? 'bg-white shadow-sm text-black ring-1 ring-black ring-opacity-5' : 'text-gray-500 hover:bg-gray-200'}`} style={{outline:'none'}}>全部</button>
                     {Object.entries(categories).filter(([, value]) => value.group === activeSuperCat).map(([key, value]) => (<button key={key} onClick={() => setActiveSubCat(key)} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap outline-none focus:outline-none focus:ring-0 ${activeSubCat === key ? `${value.bg} ${value.color} ring-1 ring-inset ring-black ring-opacity-5` : 'text-gray-500 hover:bg-white hover:shadow-sm'}`} style={{outline:'none'}}>{value.label}</button>))}
                     <button onClick={() => setIsCatModalOpen(true)} className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gray-200 text-gray-600 hover:bg-black hover:text-white transition-colors outline-none focus:outline-none focus:ring-0" title="添加新分类" style={{outline:'none'}}><Icons.Plus size={12} /></button>
                 </div>
             </div>
        )}
      </nav>
      <main className="w-full px-6 py-8 safe-bottom-padding">{viewMode === 'analytics' ? <Dashboard items={items} categories={categories} year={analyticsYear} availableYears={availableYears.filter(y => y !== 'all')} onYearChange={setAnalyticsYear} /> : <>{filteredItems.length > 0 ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 animate-fade-in">{filteredItems.map(item => <Card key={item.id} item={item} categoryConfig={categories[item.category]} onDelete={deleteItem} />)}</div> : <EmptyState type="list" year={filterYear} />}</>}</main>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={addItem} categories={categories} />
      <AddCategoryModal isOpen={isCatModalOpen} onClose={() => setIsCatModalOpen(false)} onAdd={addCategory} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} items={items} onImport={(data) => { setItems(data); handleSuperCatChange('all'); }} />
    </div>
  );
}
