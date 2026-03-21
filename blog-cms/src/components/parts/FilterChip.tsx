export default function FilterChip({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <span
      className={[
        'inline-flex items-center px-2.5 py-0.5 rounded-full border text-[11px] cursor-pointer transition-colors select-none',
        active
          ? 'border-[#1f76c8] text-[#1f76c8] bg-[#e8f0fb] font-semibold'
          : 'border-[#dde0e3] text-[#6b7280] bg-[#f9fafb] hover:border-[#1f76c8] hover:text-[#1f76c8]',
      ].join(' ')}
    >
      {label}
    </span>
  )
}