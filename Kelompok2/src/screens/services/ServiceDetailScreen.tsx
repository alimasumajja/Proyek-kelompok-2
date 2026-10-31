import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NotaryColors } from '@/constants/notary-theme';
import { stageTimingData, supportStaffName } from '@/data/dummy';
import { useServiceStore } from '@/context/service-store';
import { useToast } from '@/context/toast';
import { useSession } from '@/hooks/use-session';
import { useStatusBarStyle } from '@/hooks/use-status-bar-style';
import { formatDateId } from '@/utils/date';
import { getInitials } from '@/utils/service';
import { canAssignService, canViewService, isNotaris } from '@/utils/permissions';
import { buildStageActivity, computeStageChange } from '@/utils/service-workflow';
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
const TIMELINE_DATE = (d: Date) =>
  `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

interface ServiceDetailScreenProps {
  serviceId: string;
  onBack: () => void;
}

/**
 * Detail Layanan (Figma: Ringkasan, Alur Kerja, Catatan, Riwayat + sheet Perbarui Tahap,
 * Tambah Catatan, Ubah Penugasan, Tindakan, Asisten AI). Perubahan disimpan ke ServiceStore
 * sehingga langsung tampil di Beranda dan Layanan.
 */
export function ServiceDetailScreen({ serviceId, onBack }: ServiceDetailScreenProps) {
  useStatusBarStyle('dark');
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const { getService, updateService, notes, activities, addNote, addActivity, addNotification } =
    useServiceStore();
  const { actor } = useSession();
  const actorName = actor.name;

  // Staf hanya boleh membuka layanan yang ditugaskan kepadanya (termasuk lewat notifikasi/tautan).
  const found = getService(serviceId);
  const forbidden = !!found && !canViewService(actor, found);
  const service = found && !forbidden ? found : undefined;
  const serviceNotes = notes[serviceId] ?? [];
  const serviceActivities = activities[serviceId] ?? [];

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

  const confirmStage = (input: StageUpdateInput) => {
    const result = computeStageChange(service, input.action, input.nextStage);
    updateService({
      ...service,
      currentStage: result.targetStage,
      progressPercent: result.progressPercent,
    });
    addActivity(service.id, buildStageActivity(service, result, actorName, input.note));
    // Alur pemeriksaan: Staf menyelesaikan draf → Notaris diberi tahu untuk memeriksa.
    if (!isNotaris(actor) && result.targetStage === 'Penyelesaian Draf') {
      addNotification({
        serviceId: service.id,
        title: 'Draf siap diperiksa',
        text: `${actorName} menyelesaikan draf ${service.code}.`,
        tone: 'info',
        audience: 'Notaris',
      });
    }
    closeSheet();
    setTab('Riwayat');
    showToast('Perubahan berhasil disimpan');
  };

  const saveNote = () => {
    const text = noteDraft.text.trim();
    if (!text) return;
    addNote(service.id, { category: noteDraft.category, text }, actorName);
    addActivity(service.id, {
      title: noteDraft.category === 'Kendala' ? 'Kendala baru dicatat' : 'Catatan ditambahkan',
      text: `${actorName}: ${text}`,
      tone: noteDraft.category === 'Kendala' ? 'amber' : 'blue',
    });
    // Kendala yang dicatat Staf langsung diteruskan ke Notaris.
    if (noteDraft.category === 'Kendala' && !isNotaris(actor)) {
      addNotification({
        serviceId: service.id,
        title: 'Kendala baru ditambahkan',
        text: `${actorName} menambahkan kendala pada ${service.code}.`,
        tone: 'warning',
        audience: 'Notaris',
      });
    }
    setNoteDraft(EMPTY_DRAFT);
    closeSheet();
    setTab('Catatan');
    showToast('Catatan berhasil disimpan');
  };

  const saveAssignment = ({ staffName, dueDate }: AssignmentInput) => {
    updateService({
      ...service,
      assignedStaff: { name: staffName, initials: getInitials(staffName) },
      dueDate: formatDateId(dueDate),
    });
    addActivity(service.id, {
      title: 'Penugasan dan target diubah',
      text: `${actorName} menugaskan ${staffName} dengan target ${TIMELINE_DATE(dueDate)}.`,
      tone: 'blue',
    });
    // Staf yang baru ditugaskan mendapat pemberitahuan.
    if (staffName !== service.assignedStaff.name) {
      addNotification({
        serviceId: service.id,
        title: 'Layanan ditugaskan kepada Anda',
        text: `${service.code} · ${service.clientName}`,
        tone: 'info',
        audience: 'Staf',
        recipient: staffName,
      });
    }
    closeSheet();
    showToast('Perubahan berhasil disimpan');
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
                stageStartedAt={stageTimingData.currentStageStartedAt}
                stageDuration={stageTimingData.currentStageDuration}
                totalDuration={stageTimingData.totalDuration}
              />
              <Button label="Perbarui Tahap" icon="create-outline" onPress={() => setSheet('stage')} />
              <AssignmentCard
                service={service}
                supportName={supportStaffName}
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
              startedAt={stageTimingData.currentStageStartedAt}
              completedAt={stageTimingData.completedStageAt}
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
