interface Props {
  value?: string;
}

const STYLES: Record<string, string> = {
  PRESENT: 'text-pen-green border-pen-green',
  ACTIVE: 'text-pen-green border-pen-green',
  ABSENT: 'text-pen-red border-pen-red',
  INACTIVE: 'text-pen-red border-pen-red',
  EXCUSED: 'text-board border-board',
  PENDING: 'text-ink border-rule',
  APPROVED: 'text-pen-green border-pen-green',
  REJECTED: 'text-pen-red border-pen-red'
};

export default function StatusBadge({ value }: Props) {
  const normalized = value?.toUpperCase() ?? '';
  const style = STYLES[normalized] || 'text-ink border-rule';
  const label = value || 'Unknown';

  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${style}`}
    >
      {label}
    </span>
  );
}
