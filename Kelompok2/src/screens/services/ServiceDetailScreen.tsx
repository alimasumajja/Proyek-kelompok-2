import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NotaryColors } from '@/constants/notary-theme';
import { useServiceStore } from '@/context/service-store';
import { useToast } from '@/context/toast';
import { useSession } from '@/hooks/use-session';
import { useStatusBarStyle } from '@/hooks/use-status-bar-style';
import { canAssignService, canViewService } from '@/utils/permissions';
import { computeStageChange } from '@/utils/service-workflow';
import { Button } from '@/components/atoms';
import { AiCallout, EmptyState, UnderlineTabs } from '@/components/molecules';
import {
  AddNoteSheet,
  AiAssistantSheet,
  AppHeader,
  AssignmentCard,
  AssignmentSheet,
  HistoryPanel,
  NotesPanel,
  ProgressSummaryCard,
  ServiceActionsSheet,
  ServiceHero,
  StageUpdateSheet,
  WorkflowCard,
  type AssignmentInput,
  type NoteDraft,
  type StageUpdateInput,
} from '@/components/organisms';

const TABS = ['Ringkasan', 'Alur Kerja', 'Catatan', 'Riwayat'] as const;
type DetailTab = (typeof TABS)[number];
type Sheet = 'stage' | 'note' | 'assignment' | 'actions' | 'ai' | null;

const EMPTY_DRAFT: NoteDraft = { category: 'Pembaruan Progres', text: '' };

interface ServiceDetailScreenProps {
  serviceId: string;
  onBack: () => void;
}

/**
 * Detail Layanan (Figma: Ringkasan, Alur Kerja, Catatan, Riwayat + sheet Perbarui Tahap,
 * Tambah Catatan, Ubah Penugasan, Tindakan, Asisten AI).
 * Terintegrasi penuh dengan Supabase RPCs dan audit log.
 */
export function ServiceDetailScreen({ serviceId, onBack }: ServiceDetailScreenProps) {
  useStatusBarStyle('dark');
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const {
    getService,
    notes,
    activities,
    serviceTiming,
    activeStaff,
    fetchServiceDetails,
    changeStage,
    updateAssignment,
    addNote,
  } = useServiceStore();
  const { actor } = useSession();

  // Muat detail catatan, riwayat, dan durasi dari database Supabase
  useEffect(() => {
    if (serviceId) {
      void fetchServiceDetails(serviceId);
    }
  }, [serviceId, fetchServiceDetails]);

  // Staf hanya boleh membuka layanan yang ditugaskan kepadanya (termasuk lewat notifikasi/tautan).
  const found = getService(serviceId);
  const forbidden = !!found && !canViewService(actor, found);
  const service = found && !forbidden ? found : undefined;
  const serviceNotes = notes[serviceId] ?? [];
  const serviceActivities = activities[serviceId] ?? [];
  const timing = serviceTiming[serviceId] ?? {
    currentStageStartedAt: service?.receivedDate ?? 'Hari ini',
    currentStageDuration: '< 1 hari',
    totalDuration: '< 1 hari',
    completedStageAt: '—',
  };

  const [tab, setTab] = useState<DetailTab>('Ringkasan');
  const [sheet, setSheet] = useState<Sheet>(null);
  const [noteDraft, setNoteDraft] = useState<NoteDraft>(EMPTY_DRAFT);
  /** Sheet yang dibuka kembali setelah Asisten AI ditutup/dipakai. */
  const [aiReturnTo, setAiReturnTo] = useState<Sheet>(null);

  if (!service) {
    return (
      <View style={styles.screen}>
        <AppHeader title="Detail Layanan" onBack={onBack} />
        <EmptyState
          icon={forbidden ? 'lock-closed-outline' : undefined}
          title={forbidden ? 'Anda tidak memiliki akses' : 'Layanan tidak ditemukan'}
          description={
            forbidden
              ? 'Layanan ini tidak ditugaskan kepada Anda.'
              : 'Layanan ini mungkin sudah dihapus atau tautannya tidak valid.'
          }
          actionLabel="Kembali"
          onActionPress={onBack}
        />
      </View>
    );
  }

  const closeSheet = () => setSheet(null);

  const openAi = (from: Sheet) => {
    setAiReturnTo(from);
    setSheet('ai');
  };
  const closeAi = () => {
    setSheet(aiReturnTo);
    setAiReturnTo(null);
  };

  const confirmStage = async (input: StageUpdateInput) => {
    const result = computeStageChange(service, input.action, input.nextStage);
    const res = await changeStage(service.id, result.targetStage, result.kind, input.note);
    if (!res.ok) {
      showToast(res.error || 'Gagal mengubah tahap');
      return;
    }
    closeSheet();
    setTab('Riwayat');
    showToast('Tahap berhasil diperbarui');
  };

  const saveNote = async () => {
    const text = noteDraft.text.trim();
    if (!text) return;
    const res = await addNote(service.id, { category: noteDraft.category, text });
    if (!res.ok) {
      showToast(res.error || 'Gagal menyimpan catatan');
      return;
    }
    setNoteDraft(EMPTY_DRAFT);
    closeSheet();
    setTab('Catatan');
    showToast('Catatan berhasil disimpan');
  };

  const saveAssignment = async ({ staffId, dueDate }: AssignmentInput) => {
    if (!staffId) {
      showToast('Staf penanggung jawab tidak valid');
      return;
    }
    const res = await updateAssignment(service.id, staffId, dueDate);
    if (!res.ok) {
      showToast(res.error || 'Gagal mengubah penugasan');
      return;
    }
    closeSheet();
    showToast('Penugasan berhasil disimpan');
  };

  const useAiDraft = (text: string) => {
    if (aiReturnTo === 'note') setNoteDraft((d) => ({ ...d, text }));
    closeAi();
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Detail Layanan"
        onBack={onBack}
        action={{ icon: 'ellipsis-horizontal', label: 'Tindakan layanan', onPress: () => setSheet('actions') }}
      />

      <ScrollView
        stickyHeaderIndices={[1]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        <ServiceHero service={service} />
        <UnderlineTabs tabs={TABS} value={tab} onChange={setTab} />

        <View style={styles.content}>
          {tab === 'Ringkasan' ? (
            <>
              <ProgressSummaryCard
                service={service}
                stageStartedAt={timing.currentStageStartedAt}
                stageDuration={timing.currentStageDuration}
                totalDuration={timing.totalDuration}
              />
              <Button label="Perbarui Tahap" icon="create-outline" onPress={() => setSheet('stage')} />
              <AssignmentCard
                service={service}
                supportName={service.supportStaffName ?? '—'}
                canEdit={canAssignService(actor)}
                onEdit={() => setSheet('assignment')}
              />
              <AiCallout onPress={() => openAi(null)} />
            </>
          ) : null}

          {tab === 'Alur Kerja' ? (
            <WorkflowCard
              currentStage={service.currentStage}
              activities={serviceActivities}
              startedAt={timing.currentStageStartedAt}
              completedAt={timing.completedStageAt}
            />
          ) : null}

          {tab === 'Catatan' ? <NotesPanel notes={serviceNotes} onAdd={() => setSheet('note')} /> : null}

          {tab === 'Riwayat' ? <HistoryPanel activities={serviceActivities} /> : null}
        </View>
      </ScrollView>

      <StageUpdateSheet
        visible={sheet === 'stage'}
        service={service}
        onClose={closeSheet}
        onConfirm={confirmStage}
      />
      <AddNoteSheet
        visible={sheet === 'note'}
        draft={noteDraft}
        onDraftChange={setNoteDraft}
        onClose={closeSheet}
        onSave={saveNote}
        onOpenAi={() => openAi('note')}
      />
      <AssignmentSheet
        visible={sheet === 'assignment'}
        service={service}
        staffList={activeStaff}
        onClose={closeSheet}
        onSave={saveAssignment}
      />
      <ServiceActionsSheet
        visible={sheet === 'actions'}
        onClose={closeSheet}
        onOpenHistory={() => {
          closeSheet();
          setTab('Riwayat');
        }}
        onOpenAi={() => openAi(null)}
      />
      <AiAssistantSheet
        visible={sheet === 'ai'}
        service={service}
        notes={serviceNotes}
        onClose={closeAi}
        onUseDraft={useAiDraft}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: NotaryColors.background },
  content: { padding: 16, gap: 14 },
});
