export function Callout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded border border-slate-200 bg-slate-50 p-4">
      <div className="font-medium">{title}</div>
      <div className="mt-1 text-sm text-slate-700">{children}</div>
    </div>
  );
}
