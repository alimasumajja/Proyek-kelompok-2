const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

/** Date → "18 Mar 2026" (format tanggal singkat Indonesia). */
export function formatDateId(date: Date): string {
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}`;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** "14 Mar 2026" → "14-03-2026" (nilai awal kolom tanggal). Mengembalikan '' bila tidak dikenali. */
export function displayDateToInput(display: string): string {
  const [day, month, year] = display.split(' ');
  const monthIndex = MONTHS_SHORT.indexOf(month);
  if (!day || monthIndex < 0 || !year) return '';
  return `${pad(Number(day))}-${pad(monthIndex + 1)}-${year}`;
}

/** "18-03-2026" → Date, atau null bila format/tanggal tidak valid (mis. 31-02-2026). */
export function parseInputDate(value: string): Date | null {
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value.trim());
  if (!match) return null;
  const [, d, m, y] = match.map(Number) as unknown as [string, number, number, number];
  const date = new Date(y, m - 1, d);
  const valid = date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
  return valid ? date : null;
}

/** "14 Mar 2026" → Date, atau null bila tidak dikenali (mis. "Belum ditentukan"). */
export function parseDisplayDate(display: string): Date | null {
  const [day, month, year] = display.split(' ');
  const monthIndex = MONTHS_SHORT.indexOf(month);
  if (!day || monthIndex < 0 || !year) return null;
  const date = new Date(Number(year), monthIndex, Number(day));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Singkatan bulan kapital, mis. "MAR". */
export function monthShortUpper(date: Date): string {
  return MONTHS_SHORT[date.getMonth()].toUpperCase();
}

/** Date → "18-03-2026" (nilai kolom tanggal). Kebalikan dari parseInputDate. */
export function formatInputDate(date: Date): string {
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;
}
