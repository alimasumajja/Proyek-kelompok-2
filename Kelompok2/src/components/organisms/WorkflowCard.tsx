import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NotaryColors, Radius, Shadow } from '@/constants/notary-theme';
import type { ServiceActivity, WorkflowStepState } from '@/types/service';
import { SERVICE_STAGES } from '@/constants/service';
import { getWorkflowSteps } from '@/utils/service-workflow';
import { AppText } from '../atoms';
import { WorkflowStepRow } from '../molecules';

interface WorkflowCardProps {
  currentStage: string;
  activities: ServiceActivity[];
  startedAt: string;
  completedAt: string;
}

/** Tab Alur Kerja: delapan tahap, revisi berulang, dan tahap yang dilewati (PRD §6.4). */
export function WorkflowCard({ currentStage, activities, startedAt, completedAt }: WorkflowCardProps) {
  const steps = getWorkflowSteps(currentStage, activities);

  const caption = (state: WorkflowStepState) => {
    switch (state) {
      case 'done':
        return `Selesai · ${completedAt}`;
      case 'current':
        return `Tahap aktif · dimulai ${startedAt}`;
      case 'skipped':
        return 'Dilewati · alasan tercatat di riwayat';
      default:
        return 'Belum dimulai';
    }
  };

  return (
    <View style={styles.card}>
      <AppText variant="eyebrow" color={NotaryColors.textSecondary}>
        {SERVICE_STAGES.length} TAHAP LAYANAN
      </AppText>
      <AppText variant="title" style={styles.title}>
        Alur Kerja
      </AppText>
      {steps.map((step, index) => (
        <WorkflowStepRow
          key={step.name}
          number={index + 1}
          name={step.name}
          state={step.state}
          caption={caption(step.state)}
          repeatCount={step.repeatCount}
          isLast={index === steps.length - 1}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 18,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: NotaryColors.border,
    backgroundColor: '#FFFFFF',
    ...Shadow.card,
  },
  title: { marginTop: 4, marginBottom: 18 },
});
