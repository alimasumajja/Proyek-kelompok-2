import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSheetDraft } from '@/hooks/use-sheet-draft';
import type { UserAccount } from '@/types/profile';
import { isValidEmail } from '@/utils/service';
import { Button, Input } from '../atoms';
import { BottomSheet, FormField } from '../molecules';

type AccountInfo = Pick<UserAccount, 'name' | 'email'>;

interface AccountInfoSheetProps {
  visible: boolean;
  account: AccountInfo;
  onClose: () => void;
  onSave: (account: AccountInfo) => void;
}

/** Sheet "Informasi Akun": ubah nama dan email pengguna aktif. */
export function AccountInfoSheet({ visible, account, onClose, onSave }: AccountInfoSheetProps) {
  const [draft, setDraft] = useSheetDraft<AccountInfo>(visible, { name: account.name, email: account.email });

  const nameEmpty = draft.name.trim().length === 0;
  const emailInvalid = !isValidEmail(draft.email);

  const save = () => {
    onSave({ name: draft.name.trim(), email: draft.email.trim() });
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Informasi Akun">
      <View style={styles.form}>
        <FormField label="Nama" error={nameEmpty ? 'Nama tidak boleh kosong' : undefined}>
          <Input
            value={draft.name}
            onChangeText={(name) => setDraft({ ...draft, name })}
            placeholder="Masukkan nama"
            invalid={nameEmpty}
            autoCapitalize="words"
            accessibilityLabel="Nama"
          />
        </FormField>

        <FormField
          label="Email"
          error={emailInvalid && draft.email.length > 0 ? 'Format email belum valid' : undefined}>
          <Input
            value={draft.email}
            onChangeText={(email) => setDraft({ ...draft, email })}
            placeholder="Masukkan email"
            invalid={emailInvalid && draft.email.length > 0}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Email"
          />
        </FormField>

        <Button label="Simpan Perubahan" disabled={nameEmpty || emailInvalid} onPress={save} />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  form: { gap: 16 },
});
