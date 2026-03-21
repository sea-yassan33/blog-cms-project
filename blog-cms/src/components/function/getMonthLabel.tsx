export function getMonthLabel(dateStr: string | null | undefined): string {
  if (!dateStr) return '日付なし'
  const d = new Date(dateStr)
  return `${d.getFullYear()}年${d.getMonth() + 1}月`
}