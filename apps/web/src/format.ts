const rupiah = new Intl.NumberFormat('id-ID');
export const formatPrice = (n: number) => `Rp ${rupiah.format(n)}`;

export const waLink = (number: string, text: string) => `https://wa.me/${number}?text=${encodeURIComponent(text)}`;

const channel = (v: number) => {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const luminance = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return 0.2126 * channel(n >> 16) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
};
const contrast = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

/** Text color for a button filled with a cafe's accent: whichever of off-white or ink reads better. */
export function textOn(accent: string): string {
  const l = luminance(accent);
  return contrast(l, luminance('#FFFFFF')) >= contrast(l, luminance('#171513')) ? '#FFFFFF' : '#171513';
}
