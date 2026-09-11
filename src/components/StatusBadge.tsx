interface Props {
  value: string;
}

const STYLES: Record<string, string> = {
  PRESENT: 'text-pen-green border-pen-green',
  ACTIVE: 'text-pen-green border-pen-green',
  ABSENT: 'text-pen-red border-pen-red',
  INACTIVE: 'text-pen-red border-pen-red'
};

export default function StatusBadge({ value }: Props) {
  const key = value.toUpperCase();
  const style = STYLES[key] || 'text-ink border-rule';

  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${style}`}
    >
      {value}
    </span>
  );
}
