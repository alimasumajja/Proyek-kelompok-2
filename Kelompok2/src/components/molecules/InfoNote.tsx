import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FigmaTokens, NotaryColors, Radius } from '@/constants/notary-theme';
import { AppText } from '../atoms';

interface InfoNoteProps {
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  title?: string;
  text: string;
  /** warning: kuning (peringatan/audit) · neutral: hijau muda (informasi). */
  tone?: 'warning' | 'neutral';
}

const TONE = {
  warning: { bg: '#FFF2DE', border: '#F3DDB8', fg: NotaryColors.badgeWarningText },
  neutral: { bg: NotaryColors.statNormalBg, border: '#D3E5DC', fg: NotaryColors.primary },
};

/** Kotak catatan informasi/peringatan dengan ikon di kiri. */
export function InfoNote({ icon = 'warning-outline', title, text, tone = 'warning' }: InfoNoteProps) {
  const { bg, border, fg } = TONE[tone];
  return (
    <View style={[styles.box, { backgroundColor: bg, borderColor: border }]}>
      <Ionicons name={icon} size={18} color={fg} />
      <View style={styles.texts}>
        {title ? (
          <AppText variant="caption" color={fg} style={styles.title}>
            {title}
          </AppText>
        ) : null}
        <AppText variant="caption" color={fg}>
          {text}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  texts: { flex: 1, gap: 2 },
  title: { fontFamily: FigmaTokens.fonts.bold },
});
