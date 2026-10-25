const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export function formatTanggal(iso?: string): string {
  if (!iso) return '-';
  const d = new Date(iso);
  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

export function selisihHari(dariIso: string, keIso?: string): number {
  const dari = new Date(dariIso).getTime();
  const ke = keIso ? new Date(keIso).getTime() : Date.now();
  return Math.max(0, Math.round((ke - dari) / 86400000));
}

export function inisial(nama: string): string {
  return nama
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((k) => k[0].toUpperCase())
    .join('');
}
