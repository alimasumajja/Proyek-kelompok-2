import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { ServiceNote } from '@/types/service';
import { EmptyState, NoteCard, SectionHeader } from '../molecules';

interface NotesPanelProps {
  notes: ServiceNote[];
  onAdd: () => void;
}

/** Tab Catatan: daftar catatan progres/kendala + tombol tambah (PRD §6.6). */
export function NotesPanel({ notes, onAdd }: NotesPanelProps) {
  return (
    <View>
      <SectionHeader
        eyebrow="PEMBARUAN"
        title="Catatan Progres & Kendala"
        actionLabel="+ Tambah"
        actionAccessibilityLabel="Tambah catatan"
        onActionPress={onAdd}
      />
      {notes.length > 0 ? (
        <View style={styles.list}>
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </View>
      ) : (
        <EmptyState
          icon="create-outline"
          title="Belum ada catatan"
          description="Tambahkan pembaruan progres atau kendala pertama."
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12 },
});
