import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSheetDraft } from '@/hooks/use-sheet-draft';
import type { StaffMember } from '@/types/profile';
import { isValidEmail } from '@/utils/service';
import { Button, Input } from '../atoms';
import { BottomSheet, FormField, InfoNote } from '../molecules';

export interface StaffFormInput {
  name: string;
  email: string;
  username: string;
  /** Kata sandi sementara (dummy MVP); hanya diisi saat menambah staf. */
  password: string;
}

interface StaffFormSheetProps {
  visible: boolean;
  /** Kosong = mode tambah staf; terisi = mode ubah data staf. */
  staff: StaffMember | null;
  isUsernameTaken: (username: string) => boolean;
  onClose: () => void;
  onSave: (input: StaffFormInput) => void;
  onToggleStatus: (id: string) => void;
}

const EMPTY: StaffFormInput = { name: '', email: '', username: '', password: '' };
const USERNAME_PATTERN = /^[a-z0-9._]{3,}$/;
const MIN_PASSWORD = 6;

/** Sheet "Tambah Staf" / "Ubah Staf" — hanya dapat dibuka oleh Notaris (PRD §12). */
export function StaffFormSheet({
  visible,
  staff,
  isUsernameTaken,
  onClose,
  onSave,
  onToggleStatus,
}: StaffFormSheetProps) {
  const isEdit = staff !== null;
  const initial: StaffFormInput = staff
    ? { name: staff.name, email: staff.email, username: staff.username, password: '' }
    : EMPTY;
  const [draft, setDraft] = useSheetDraft(visible, initial);

  const username = draft.username.trim().toLowerCase();
  const nameEmpty = draft.name.trim().length === 0;
  const emailInvalid = !isValidEmail(draft.email);
  const usernameFormatBad = !USERNAME_PATTERN.test(username);
  const usernameTaken = !isEdit && username.length > 0 && isUsernameTaken(username);
  const passwordShort = draft.password.length < MIN_PASSWORD;

  const showEmailError = emailInvalid && draft.email.length > 0;
  const showUsernameError = !isEdit && username.length > 0 && (usernameFormatBad || usernameTaken);
  const showPasswordError = !isEdit && draft.password.length > 0 && passwordShort;

  const invalid =
    nameEmpty ||
    emailInvalid ||
    (!isEdit && (usernameFormatBad || usernameTaken || passwordShort));

  const save = () => {
    onSave({ ...draft, name: draft.name.trim(), email: draft.email.trim(), username });
    onClose();
  };

  const toggleStatus = () => {
    if (!staff) return;
    onToggleStatus(staff.id);
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title={isEdit ? 'Ubah Staf' : 'Tambah Staf'}>
      <View style={styles.form}>
        <FormField label="Nama staf" required>
          <Input
            value={draft.name}
            onChangeText={(name) => setDraft({ ...draft, name })}
            placeholder="Masukkan nama staf"
            autoCapitalize="words"
            accessibilityLabel="Nama staf"
          />
        </FormField>

        <FormField
          label="Email"
          required
          error={showEmailError ? 'Format email belum valid' : undefined}>
          <Input
            value={draft.email}
            onChangeText={(email) => setDraft({ ...draft, email })}
            placeholder="Masukkan email"
            invalid={showEmailError}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Email"
          />
        </FormField>

        <FormField
          label="Username"
          required={!isEdit}
          hint={isEdit ? 'Username tidak dapat diubah' : 'Huruf kecil, angka, titik, atau garis bawah (min. 3)'}
          error={
            showUsernameError
              ? usernameTaken
                ? 'Username sudah dipakai'
                : 'Format username belum valid'
              : undefined
          }>
          <Input
            value={draft.username}
            onChangeText={(value) => setDraft({ ...draft, username: value })}
            placeholder="mis. budi.santoso"
            invalid={showUsernameError}
            editable={!isEdit}
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Username"
          />
        </FormField>

        {!isEdit ? (
          <FormField
            label="Kata sandi sementara"
            required
            hint={`Minimal ${MIN_PASSWORD} karakter`}
            error={showPasswordError ? `Minimal ${MIN_PASSWORD} karakter` : undefined}>
            <Input
              value={draft.password}
              onChangeText={(password) => setDraft({ ...draft, password })}
              placeholder="Kata sandi untuk login pertama"
              invalid={showPasswordError}
              secureTextEntry
              autoCapitalize="none"
              accessibilityLabel="Kata sandi sementara"
            />
          </FormField>
        ) : null}

        <InfoNote
          tone="neutral"
          icon="information-circle-outline"
          text="Staf memiliki akses operasional. Persetujuan dan pengelolaan staf hanya untuk Notaris."
        />

        <Button label={isEdit ? 'Simpan Perubahan' : 'Tambah Staf'} disabled={invalid} onPress={save} />

        {staff ? (
          <Button
            label={staff.status === 'Aktif' ? 'Nonaktifkan Staf' : 'Aktifkan Staf'}
            variant="outline"
            onPress={toggleStatus}
          />
        ) : null}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  form: { gap: 16 },
});
