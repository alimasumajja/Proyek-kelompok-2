import { FigmaTokens } from './notary-theme';

const F = FigmaTokens.fonts;

/**
 * Varian tipografi aplikasi (font Manrope sesuai referensi Figma).
 * Catatan: pada Android bobot huruf harus dipilih lewat fontFamily,
 * bukan fontWeight, sehingga setiap varian menyimpan family-nya sendiri.
 */
export const Typography = {
  display: { fontFamily: F.extraBold, fontSize: 22, lineHeight: 28 },
  title: { fontFamily: F.bold, fontSize: 18, lineHeight: 24 },
  heading: { fontFamily: F.bold, fontSize: 15, lineHeight: 20 },
  body: { fontFamily: F.regular, fontSize: 13.5, lineHeight: 19 },
  bodyStrong: { fontFamily: F.semiBold, fontSize: 13.5, lineHeight: 19 },
  label: { fontFamily: F.semiBold, fontSize: 12.5, lineHeight: 17 },
  caption: { fontFamily: F.medium, fontSize: 12, lineHeight: 16 },
  micro: { fontFamily: F.semiBold, fontSize: 10.5, lineHeight: 14 },
  eyebrow: { fontFamily: F.bold, fontSize: 11, lineHeight: 14, letterSpacing: 1.2 },
  stat: { fontFamily: F.extraBold, fontSize: 22, lineHeight: 26 },
} as const;

export type TextVariant = keyof typeof Typography;
