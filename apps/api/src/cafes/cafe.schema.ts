import { z } from 'zod';

export const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const PHOTO_FILE = /^[a-z0-9][a-z0-9._-]*\.(?:jpe?g|png|webp|avif)$/i;
// Top-level paths the app owns; a cafe folder with one of these names would be unreachable.
export const RESERVED_SLUGS = new Set(['admin', 'api', 'assets', 'media']);

const text = (max: number) => z.string().trim().min(1).max(max);
const time = z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$|^24:00$/, 'format jam HH:MM');
const day = z.strictObject({ open: time, close: time }).nullable();
const photo = z.string().regex(PHOTO_FILE, 'nama file foto tidak valid');
const price = z.number().int().positive().max(10_000_000);
// https only: these end up in href attributes, so javascript: and data: URLs must never pass.
const httpsUrl = z.url({ protocol: /^https$/ });

export const FACILITY_ICONS = ['coffee', 'wifi', 'plug', 'delivery', 'parking', 'music', 'plant', 'pet'] as const;

export const cafeSchema = z.strictObject({
  name: text(40),
  tagline: text(140),
  specialty: text(40),
  since: z.number().int().min(1900).max(2100).optional(),
  area: text(40),
  city: text(40),
  mode: z.enum(['light', 'dark']).default('light'),
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'warna hex #RRGGBB').optional(),
  pitch: z.boolean().default(true),
  contact: z.strictObject({
    whatsapp: z.string().regex(/^62\d{8,13}$/, 'format 62xxxxxxxxxx'),
    whatsappText: text(200).optional(),
    instagram: z.string().regex(/^[A-Za-z0-9._]{1,30}$/).optional(),
    gofood: httpsUrl.optional(),
    grabfood: httpsUrl.optional(),
  }),
  address: text(160),
  mapsUrl: httpsUrl,
  hours: z.strictObject({
    senin: day,
    selasa: day,
    rabu: day,
    kamis: day,
    jumat: day,
    sabtu: day,
    minggu: day,
  }),
  photos: z.strictObject({
    hero: photo,
    atmosphere: photo,
    gallery: z.array(photo).max(3).default([]),
    location: photo,
  }),
  atmosphere: z.strictObject({ title: text(40), text: text(200) }),
  facilities: z
    .array(z.strictObject({ icon: z.enum(FACILITY_ICONS), title: text(20), note: text(40) }))
    .max(3)
    .default([]),
  bestSellers: z.array(z.strictObject({ name: text(50), price, photo })).min(2).max(4),
  menu: z
    .array(
      z.strictObject({
        category: text(20),
        photo: photo.optional(),
        items: z.array(z.strictObject({ name: text(50), price, note: text(80).optional() })).min(1).max(40),
      }),
    )
    .min(1)
    .max(6),
});

export type Cafe = z.output<typeof cafeSchema>;
export type DayKey = keyof Cafe['hours'];

/** Everything the page needs, injected into index.html as JSON. */
export interface PageData {
  slug: string;
  cafe: Cafe;
  pitch: { name: string; whatsapp: string } | null;
}

/** Every photo file a cafe.json points at. */
export function referencedPhotos(cafe: Cafe): string[] {
  const { hero, atmosphere, gallery, location } = cafe.photos;
  return [
    hero,
    atmosphere,
    location,
    ...gallery,
    ...cafe.bestSellers.map((b) => b.photo),
    ...cafe.menu.flatMap((m) => (m.photo ? [m.photo] : [])),
  ];
}
