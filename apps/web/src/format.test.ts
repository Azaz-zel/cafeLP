import { describe, expect, it } from 'vitest';
import { formatPrice, textOn, waLink } from './format';

describe('format', () => {
  it('formats rupiah with Indonesian grouping', () => {
    expect(formatPrice(22000)).toBe('Rp 22.000');
  });

  it('encodes the WhatsApp message', () => {
    expect(waLink('6281234', 'Halo & pesan?')).toBe('https://wa.me/6281234?text=Halo%20%26%20pesan%3F');
  });

  it('picks readable text on light and dark accents', () => {
    expect(textOn('#2F5D50')).toBe('#FFFFFF');
    expect(textOn('#E8D9A8')).toBe('#171513');
  });
});
