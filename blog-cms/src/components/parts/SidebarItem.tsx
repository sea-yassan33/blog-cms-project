export default function SidebarItem({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode
  label: string
  active?: boolean
}) {
  return (
    <div
      className={[
        'flex items-center gap-2.5 py-2 text-[13px] cursor-pointer transition-colors',
        active
          ? 'bg-[#1f76c8]/30 text-white border-l-[3px] border-[#1f76c8] pl-[17px] pr-5'
          : 'text-white/75 hover:bg-white/10 hover:text-white px-5',
      ].join(' ')}
    >
      <span className="w-4 h-4 shrink-0 opacity-80">{icon}</span>
      <span>{label}</span>
    </div>
  )
}