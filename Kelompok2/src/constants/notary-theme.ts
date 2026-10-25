export const FigmaTokens = {
  colors: {
    text: '#202a27',
    pageBg: '#f7f8f5',
    canvasBg: '#e9ede9',
    green: '#173f35',
    emerald: '#2f6b57',
    gold: '#c5a46d',
    cream: '#f7f8f5',
    line: '#e2e8e3',
    muted: '#75817b',
    danger: '#a64c46',
    amber: '#b2782d',
    white: '#ffffff',

    // Badges from cssReference.txt
    badgeDangerBg: '#fae9e7',
    badgeDangerText: '#91443f',
    badgeWarningBg: '#fff0d8',
    badgeWarningText: '#915f20',
    badgeSuccessBg: '#e3f1e9',
    badgeSuccessText: '#28614b',
    badgeInfoBg: '#e7f0ed',
    badgeInfoText: '#285d4d',
    badgeNeutralBg: '#eef1ef',
    badgeNeutralText: '#66726c',
    badgeGoldBg: '#f4ead9',
    badgeGoldText: '#826633',

    // Stat cards from cssReference.txt
    statAlertBg: '#fae9e7',
    statAlertIcon: '#a64c46',
    statWarningBg: '#fff2de',
    statWarningIcon: '#b2782d',
    statNormalBg: '#e9f3ee',
    statNormalIcon: '#2f6b57',

    // Progress bar & dividers
    progressTrack: '#e7ece8',
    borderLight: '#edf0ed',
    timelineLine: '#dfe6e1',
  },
  fonts: {
    regular: 'Manrope_400Regular',
    medium: 'Manrope_500Medium',
    semiBold: 'Manrope_600SemiBold',
    bold: 'Manrope_700Bold',
    extraBold: 'Manrope_800ExtraBold',
    serif: 'Georgia',
  },
};

export const NotaryColors = {
  ...FigmaTokens.colors,

  // Semantic UI color aliases
  primary: FigmaTokens.colors.green,
  background: FigmaTokens.colors.cream,
  card: FigmaTokens.colors.white,
  textPrimary: FigmaTokens.colors.text,
  textSecondary: FigmaTokens.colors.muted,
  textMuted: '#99A39E',
  border: FigmaTokens.colors.line,

  // Header colors
  headerDateGold: FigmaTokens.colors.gold,
  headerSubtitleSage: 'rgba(255, 255, 255, 0.72)',
  headerNotifBg: 'rgba(255, 255, 255, 0.08)',
  headerNotifBadge: FigmaTokens.colors.gold,

  // Tabs & Segmented Controls
  tabActive: FigmaTokens.colors.green,
  tabInactive: '#8A958F',
  segmentBg: '#E9EEEA',
  segmentActiveBg: FigmaTokens.colors.white,

  // Progress Bar
  progressFill: FigmaTokens.colors.emerald,
  progressTrack: FigmaTokens.colors.progressTrack,

  // Status badges
  status: {
    aktif: {
      bg: FigmaTokens.colors.badgeSuccessBg,
      text: FigmaTokens.colors.badgeSuccessText,
    },
    perluPerhatian: {
      bg: FigmaTokens.colors.badgeWarningBg,
      text: FigmaTokens.colors.badgeWarningText,
    },
    terlambat: {
      bg: FigmaTokens.colors.badgeDangerBg,
      text: FigmaTokens.colors.badgeDangerText,
    },
    selesai: {
      bg: FigmaTokens.colors.badgeNeutralBg,
      text: FigmaTokens.colors.badgeNeutralText,
    },
  },

  // Summary Stat Cards
  summaryIcons: {
    activeIcon: FigmaTokens.colors.statNormalIcon,
    activeBg: FigmaTokens.colors.statNormalBg,
    completedIcon: FigmaTokens.colors.badgeSuccessText,
    completedBg: FigmaTokens.colors.badgeSuccessBg,
    lateIcon: FigmaTokens.colors.statAlertIcon,
    lateBg: FigmaTokens.colors.statAlertBg,
    attentionIcon: FigmaTokens.colors.statWarningIcon,
    attentionBg: FigmaTokens.colors.statWarningBg,
  },
};

/** Skala radius sudut — dipakai konsisten di seluruh komponen. */
export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  sheet: 24,
  pill: 999,
} as const;

/** Skala jarak (spacing) dasar. */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

/** Bayangan kartu standar (iOS shadow + Android elevation). */
export const Shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  bar: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
} as const;
