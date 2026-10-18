import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { IconBriefcase, IconUser } from './icons';
import { NotarisColors } from './theme';

export type UserRole = 'notaris' | 'staf';

interface RoleDemoCardProps {
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
}

export function RoleDemoCard({ currentRole, onSelectRole }: RoleDemoCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>MODE DEMO</Text>
      
      <View style={styles.cardRow}>
        {/* Notaris Card */}
        <Pressable
          onPress={() => onSelectRole('notaris')}
          style={[
            styles.card,
            currentRole === 'notaris' ? styles.cardActive : styles.cardInactive,
          ]}>
          <View style={styles.iconWrapper}>
            <IconBriefcase
              size={20}
              color={currentRole === 'notaris' ? NotarisColors.primary : '#9CA3AF'}
            />
          </View>
          <View style={styles.textWrapper}>
            <Text
              style={[
                styles.roleTitle,
                currentRole === 'notaris' ? styles.textActive : styles.textInactive,
              ]}>
              Notaris
            </Text>
            <Text style={styles.roleSubtitle}>Akses penuh & persetujuan</Text>
          </View>
        </Pressable>

        {/* Staf Card */}
        <Pressable
          onPress={() => onSelectRole('staf')}
          style={[
            styles.card,
            currentRole === 'staf' ? styles.cardActive : styles.cardInactive,
          ]}>
          <View style={styles.iconWrapper}>
            <IconUser
              size={20}
              color={currentRole === 'staf' ? NotarisColors.primary : '#9CA3AF'}
            />
          </View>
          <View style={styles.textWrapper}>
            <Text
              style={[
                styles.roleTitle,
                currentRole === 'staf' ? styles.textActive : styles.textInactive,
              ]}>
              Staf
            </Text>
            <Text style={styles.roleSubtitle}>Akses operasional</Text>
          </View>
        </Pressable>
      </View>

      <Text style={styles.disclaimerText}>
        Pembatasan antarmuka ini juga harus diterapkan kembali pada backend dan database produksi.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  cardActive: {
    backgroundColor: '#EFF3F0',
    borderColor: NotarisColors.primary,
  },
  cardInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
  },
  iconWrapper: {
    marginRight: 10,
  },
  textWrapper: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  textActive: {
    color: '#111827',
  },
  textInactive: {
    color: '#4B5563',
  },
  roleSubtitle: {
    fontSize: 10,
    color: '#6B7280',
    lineHeight: 13,
  },
  disclaimerText: {
    fontSize: 10.5,
    color: '#9CA3AF',
    marginTop: 8,
    lineHeight: 15,
  },
});
