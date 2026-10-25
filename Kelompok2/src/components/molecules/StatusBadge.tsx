import React from 'react';
import type { ServiceStatus } from '@/types/service';
import { Badge, type BadgeTone } from '../atoms';

const STATUS_TONE: Record<ServiceStatus, BadgeTone> = {
  Aktif: 'success',
  'Perlu Perhatian': 'warning',
  Terlambat: 'danger',
  Selesai: 'neutral',
};

/** Lencana status layanan: selalu memuat teks (tidak hanya warna) — PRD §13.3. */
export function StatusBadge({
  status,
  shape,
}: {
  status: ServiceStatus;
  shape?: 'pill' | 'square';
}) {
  return (
    <Badge
      label={status}
      tone={STATUS_TONE[status]}
      icon={status === 'Terlambat' ? 'time-outline' : undefined}
      shape={shape}
    />
  );
}
