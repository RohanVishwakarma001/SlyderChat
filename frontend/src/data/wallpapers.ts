export type Wallpaper = { id: string; label: string; light: string; dark: string };

export const wallpapers: Wallpaper[] = [
  { id: 'default', label: 'Default', light: '#efe7de', dark: '#0b141a' },
  { id: 'mint', label: 'Mint', light: '#dff5ec', dark: '#0c1f18' },
  { id: 'sand', label: 'Sand', light: '#f3e8d3', dark: '#241d10' },
  { id: 'sky', label: 'Sky', light: '#dcecfb', dark: '#0e1b2b' },
  { id: 'blush', label: 'Blush', light: '#fbe3ea', dark: '#26121a' },
  { id: 'slate', label: 'Slate', light: '#e4e6eb', dark: '#16181c' },
  { id: 'lavender', label: 'Lavender', light: '#ece3fb', dark: '#1d1730' },
];

export function wallpaperById(id: string): Wallpaper {
  return wallpapers.find((w) => w.id === id) ?? wallpapers[0];
}
