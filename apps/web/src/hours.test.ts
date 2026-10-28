import { describe, expect, it } from 'vitest';
import { jakartaClock, openStatus, statusText } from './hours';

const weekday = { open: '10:00', close: '22:00' };
const hours = {
  senin: weekday,
  selasa: weekday,
  rabu: null, // tutup
  kamis: weekday,
  jumat: weekday,
  sabtu: { open: '16:00', close: '02:00' }, // lewat tengah malam
  minggu: { open: '00:00', close: '24:00' }, // 24 jam
};

// Jakarta is UTC+7 all year; 2026-10-26 is a Monday.
const wib = (isoLocal: string) => new Date(`${isoLocal}+07:00`);

describe('jakartaClock', () => {
  it('converts any instant to Jakarta day and minute', () => {
    // 2026-10-26 20:30 UTC is Tuesday 03:30 in Jakarta.
    expect(jakartaClock(new Date('2026-10-26T20:30:00Z'))).toEqual({ day: 2, minute: 210 });
  });
});

describe('openStatus', () => {
  it('is open inside a normal span', () => {
    expect(openStatus(hours, wib('2026-10-26T12:00'))).toEqual({ open: true, until: '22:00' });
  });

  it('is closed before opening and points at today', () => {
    expect(openStatus(hours, wib('2026-10-26T08:00'))).toEqual({
      open: false,
      next: { inDays: 0, day: 'senin', time: '10:00' },
    });
  });

  it('closes exactly at closing time', () => {
    expect(openStatus(hours, wib('2026-10-26T22:00')).open).toBe(false);
  });

  it('skips a closed day when finding the next opening', () => {
    // Tuesday night: Wednesday is closed, so next is Thursday.
    expect(openStatus(hours, wib('2026-10-27T23:00'))).toEqual({
      open: false,
      next: { inDays: 2, day: 'kamis', time: '10:00' },
    });
  });

  it('stays open after midnight on a span that crosses it', () => {
    // Saturday 16:00 to 02:00: Sunday 01:30 is still Saturday's shift.
    expect(openStatus(hours, wib('2026-11-01T01:30'))).toEqual({ open: true, until: '02:00' });
  });

  it('is open late on the evening a crossing span starts', () => {
    expect(openStatus(hours, wib('2026-10-31T23:59'))).toEqual({ open: true, until: '02:00' });
  });

  it('treats 00:00 to 24:00 as open all day', () => {
    expect(openStatus(hours, wib('2026-11-01T12:00'))).toEqual({ open: true, until: '24:00' });
  });

  it('reports no next opening when every day is closed', () => {
    const closed = Object.fromEntries(Object.keys(hours).map((k) => [k, null])) as unknown as typeof hours;
    expect(openStatus(closed, wib('2026-10-26T12:00'))).toEqual({ open: false, next: null });
  });
});

describe('statusText', () => {
  it('says "besok" for tomorrow and the day name further out', () => {
    expect(statusText({ open: false, next: { inDays: 1, day: 'selasa', time: '10:00' } }).detail).toBe('Buka besok 10.00');
    expect(statusText({ open: false, next: { inDays: 2, day: 'kamis', time: '10:00' } }).detail).toBe('Buka Kamis 10.00');
    expect(statusText({ open: true, until: '22:00' }).detail).toBe('Sampai 22.00');
  });
});
