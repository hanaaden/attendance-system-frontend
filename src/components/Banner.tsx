interface Props {
  kind?: 'error' | 'success';
  children: React.ReactNode;
}

export default function Banner({ kind = 'error', children }: Props) {
  const style =
    kind === 'error'
      ? 'border-pen-red/40 bg-pen-red/5 text-pen-red'
      : 'border-pen-green/40 bg-pen-green/5 text-pen-green';

  return (
    <div className={`rounded border px-4 py-2.5 text-sm ${style}`}>
      {children}
    </div>
  );
}
