import { router } from 'expo-router';

import { Badge, type BadgeTone } from '@/components/ui/badge';
import type { IconName } from '@/components/ui/icon';
import { Row } from '@/components/ui/list';
import { categoryLabels } from '@/lib/ai';
import { formatRelative } from '@/lib/format';
import type { CaseItem } from '@/store/cases';

export function caseStatus(item: CaseItem): { label: string; tone: BadgeTone; icon?: IconName } {
  if (item.status === 'analyzing') return { label: 'Explaining…', tone: 'neutral' };
  if (item.status === 'error') return { label: 'Not explained', tone: 'danger', icon: 'alert' };
  if (item.replied) return { label: 'Replied', tone: 'success', icon: 'check' };
  switch (item.result?.analysis.verdict.urgency) {
    case 'urgent':
      return { label: 'Deadline', tone: 'danger' };
    case 'action':
      return { label: 'To do', tone: 'warning' };
    default:
      return { label: 'Info only', tone: 'neutral' };
  }
}

const sourceTitle = { camera: 'Scanned letter', library: 'Photo', pdf: 'PDF document', text: 'Pasted message', example: 'Example' };

export function CaseRow({ item }: { item: CaseItem }) {
  const analysis = item.result?.analysis;
  const category = analysis?.category ?? item.hint ?? 'other';
  const status = caseStatus(item);
  return (
    <Row
      icon={category}
      title={analysis?.title ?? sourceTitle[item.source]}
      subtitle={`${categoryLabels[category]} · ${formatRelative(item.createdAt)}`}
      accessory={<Badge label={status.label} tone={status.tone} icon={status.icon} />}
      onPress={() => router.push({ pathname: '/case/[id]', params: { id: item.id } })}
    />
  );
}
