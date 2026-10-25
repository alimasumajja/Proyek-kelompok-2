import { SERVICE_STAGES } from '@/constants/service';
import type {
  ServiceActivity,
  ServiceItem,
  StageChangeKind,
  WorkflowStepState,
} from '@/types/service';

export const STAGE_ACTIONS = [
  'Lanjut ke tahap berikutnya',
  'Ulangi tahap revisi',
  'Lewati Proses Pendaftaran',
] as const;
export type StageAction = (typeof STAGE_ACTIONS)[number];

const STAGE_COUNT = SERVICE_STAGES.length;
const REVISION_STAGE = 'Revisi Draf';
const REGISTRATION_STAGE = 'Proses Pendaftaran';
const FINAL_STAGE = 'Penerbitan dan Penyerahan Hasil';

export const ACTIVITY_TITLE = {
  advance: 'Tahap diperbarui',
  repeat: 'Tahap revisi diulang',
  skip: 'Tahap dilewati',
} as const;

export function getStageIndex(stage: string): number {
  return (SERVICE_STAGES as readonly string[]).indexOf(stage);
}

/**
 * Persentase progres dari tahap (bukan input manual, tidak berubah karena waktu) — PRD §6.5.
 * Memakai rumus referensi Figma: (nomor tahap ÷ 8) × 100. Perlakuan tahap aktif/dilewati/revisi
 * masih menunggu kesepakatan (PRD §16), sehingga rumus ini terpusat di satu fungsi.
 */
export function progressForStage(stage: string): number {
  return ((getStageIndex(stage) + 1) * 100) / STAGE_COUNT;
}

export function getActionKind(action: StageAction): StageChangeKind {
  if (action === 'Ulangi tahap revisi') return 'repeat';
  if (action === 'Lewati Proses Pendaftaran') return 'skip';
  return 'advance';
}

export interface StageChangeResult {
  kind: StageChangeKind;
  targetStage: string;
  progressPercent: number;
}

/** Menghitung tahap & progres baru. Revisi berulang tidak menambah progres. */
export function computeStageChange(
  service: ServiceItem,
  action: StageAction,
  nextStage: string
): StageChangeResult {
  const kind = getActionKind(action);
  const targetStage =
    kind === 'repeat' ? REVISION_STAGE : kind === 'skip' ? FINAL_STAGE : nextStage;
  const progressPercent =
    kind === 'repeat'
      ? service.progressPercent
      : Math.max(service.progressPercent, progressForStage(targetStage));
  return { kind, targetStage, progressPercent };
}

/** Teks riwayat untuk perubahan tahap (sama dengan referensi Figma). */
export function buildStageActivity(
  service: ServiceItem,
  result: StageChangeResult,
  actor: string,
  note: string
): Omit<ServiceActivity, 'id' | 'time'> {
  const extra = note.trim();
  if (result.kind === 'skip') {
    return {
      title: ACTIVITY_TITLE.skip,
      text: `${actor} melewati ${REGISTRATION_STAGE} berdasarkan konfigurasi layanan. ${extra || 'Alasan dicatat pada konfirmasi.'}`,
      tone: 'amber',
    };
  }
  return {
    title: result.kind === 'repeat' ? ACTIVITY_TITLE.repeat : ACTIVITY_TITLE.advance,
    text: `${actor} mengubah tahap dari ${service.currentStage} ke ${result.targetStage}.${extra ? ` ${extra}` : ''}`,
    tone: 'green',
  };
}

/** Pilihan "tahap berikutnya": dari tahap saat ini ke depan. */
export function getNextStageOptions(currentStage: string): string[] {
  const index = Math.max(0, getStageIndex(currentStage));
  return SERVICE_STAGES.slice(index) as unknown as string[];
}

export interface WorkflowStep {
  name: string;
  state: WorkflowStepState;
  /** Jumlah kali Revisi Draf diulang (ditampilkan sebagai "Diulang Nx"). */
  repeatCount: number;
}

/** Status tiap tahap untuk tab Alur Kerja, termasuk tahap yang dilewati & revisi berulang. */
export function getWorkflowSteps(
  currentStage: string,
  activities: ServiceActivity[]
): WorkflowStep[] {
  const currentIndex = getStageIndex(currentStage);
  const registrationSkipped = activities.some((a) => a.title === ACTIVITY_TITLE.skip);
  const repeatCount = activities.filter((a) => a.title === ACTIVITY_TITLE.repeat).length;

  return SERVICE_STAGES.map((name, i) => {
    const skipped = name === REGISTRATION_STAGE && registrationSkipped;
    const state: WorkflowStepState = skipped
      ? 'skipped'
      : i < currentIndex
        ? 'done'
        : i === currentIndex
          ? 'current'
          : 'pending';
    return { name, state, repeatCount: name === REVISION_STAGE ? repeatCount : 0 };
  });
}
