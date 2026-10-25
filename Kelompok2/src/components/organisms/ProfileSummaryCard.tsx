import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NotaryColors, Radius, Shadow } from '@/constants/notary-theme';
import type { UserAccount } from '@/types/profile';
import type { UserRole } from '@/types/service';
import { AppText, Avatar, Badge } from '../atoms';

interface ProfileSummaryCardProps {
  account: UserAccount;
}

const ROLE_LABEL: Record<UserRole, { title: string; access: string }> = {
  Notaris: { title: 'Notaris (Pemilik Kantor)', access: 'Akses Penuh' },
  Staf: { title: 'Staf Kantor', access: 'Akses Operasional' },
};

/** Kartu identitas pengguna yang sedang masuk di bagian atas halaman Profil. */
export function ProfileSummaryCard({ account }: ProfileSummaryCardProps) {
  const label = ROLE_LABEL[account.role];
  const isOwner = account.role === 'Notaris';

  return (
    <View style={styles.card}>
      <Avatar initials={account.initials} size="lg" tone="soft" />
      <View style={styles.texts}>
        <AppText variant="display" style={styles.center}>
          {account.name}
        </AppText>
        <AppText variant="bodyStrong" color={NotaryColors.textSecondary}>
          {label.title}
        </AppText>
        <AppText variant="caption" color={NotaryColors.textMuted}>
          {account.email} · @{account.username}
        </AppText>
      </View>
      {/* Badge punya alignSelf: flex-start; dibungkus agar mengikuti rata tengah kartu. */}
      <View style={styles.badgeSlot}>
        <Badge
          label={label.access}
          tone={isOwner ? 'gold' : 'info'}
          icon={isOwner ? 'shield-checkmark' : 'shield-outline'}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: 14,
    padding: 24,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: NotaryColors.border,
    backgroundColor: '#FFFFFF',
    ...Shadow.card,
  },
  texts: { alignItems: 'center', gap: 4 },
  center: { textAlign: 'center' },
  badgeSlot: { alignSelf: 'center' },
});
