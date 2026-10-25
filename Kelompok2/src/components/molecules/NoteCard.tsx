import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NotaryColors, Radius } from '@/constants/notary-theme';
import type { ServiceNote } from '@/types/service';
import { AppText, Avatar, Badge } from '../atoms';

/** Kartu catatan progres/kendala: kategori, waktu, isi, dan pembuat. */
export function NoteCard({ note }: { note: ServiceNote }) {
  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <Badge
          label={note.category}
          tone={note.category === 'Kendala' ? 'warning' : 'info'}
        />
        <AppText variant="micro" color={NotaryColors.textMuted}>
          {note.time}
        </AppText>
      </View>
      <AppText variant="body">{note.text}</AppText>
      <View style={styles.author}>
        <Avatar name={note.author} size="sm" />
        <AppText variant="micro" color={NotaryColors.textSecondary}>
          {note.author}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 8,
    padding: 14,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: NotaryColors.border,
    backgroundColor: '#FFFFFF',
  },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  author: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
