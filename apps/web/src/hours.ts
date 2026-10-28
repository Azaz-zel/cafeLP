import type { Cafe, DayKey } from '../../api/src/cafes/cafe.schema';

type Hours = Cafe['hours'];

/** Index = Date#getDay() (0 = Minggu). */
export const DAY_KEYS: DayKey[] = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
export const DAY_LABELS: Record<DayKey, string> = {
  senin: 'Senin',
  selasa: 'Selasa',
  rabu: 'Rabu',
  kamis: 'Kamis',
  jumat: 'Jumat',
  sabtu: 'Sabtu',
  minggu: 'Minggu',
};
/** Display order, Monday first as Indonesian schedules are written. */
export const WEEK_ORDER: DayKey[] = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu'];

export type Status =
  | { open: true; until: string }
  | { open: false; next: { inDays: number; day: DayKey; time: string } | null };

const toMinutes = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

/** "08:00" → "08.00", the Indonesian way of writing times. */
export const formatTime = (t: string) => (t === '24:00' ? '24.00' : t.replace(':', '.'));

const parts = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Jakarta',
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});
const WEEKDAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Day index and minute of day in Jakarta, regardless of the viewer's timezone. */
export function jakartaClock(date: Date): { day: number; minute: number } {
  const p = Object.fromEntries(parts.formatToParts(date).map((x) => [x.type, x.value]));
  return { day: WEEKDAY.indexOf(p.weekday), minute: Number(p.hour) * 60 + Number(p.minute) };
}

/**
 * A day whose close is not after its open (16:00 to 02:00) runs past midnight
 * into the next day. "00:00" to "24:00" is open all day.
 */
export function openStatus(hours: Hours, date: Date): Status {
  const { day, minute } = jakartaClock(date);
  const today = hours[DAY_KEYS[day]];
  const yesterday = hours[DAY_KEYS[(day + 6) % 7]];

  if (yesterday) {
    const [o, c] = [toMinutes(yesterday.open), toMinutes(yesterday.close)];
    if (c <= o && minute < c) return { open: true, until: yesterday.close };
  }
  if (today) {
    const [o, c] = [toMinutes(today.open), toMinutes(today.close)];
    if (minute >= o && (c <= o || minute < c)) return { open: true, until: today.close };
    if (minute < o) return { open: false, next: { inDays: 0, day: DAY_KEYS[day], time: today.open } };
  }
  for (let i = 1; i <= 7; i++) {
    const key = DAY_KEYS[(day + i) % 7];
    const h = hours[key];
    if (h) return { open: false, next: { inDays: i, day: key, time: h.open } };
  }
  return { open: false, next: null };
}

export function statusText(s: Status): { title: string; detail: string } {
  if (s.open) return { title: 'Buka sekarang', detail: `Sampai ${formatTime(s.until)}` };
  if (!s.next) return { title: 'Sedang tutup', detail: 'Jadwal belum tersedia' };
  const when = s.next.inDays === 0 ? '' : s.next.inDays === 1 ? 'besok ' : `${DAY_LABELS[s.next.day]} `;
  return { title: 'Sedang tutup', detail: `Buka ${when}${formatTime(s.next.time)}` };
}
