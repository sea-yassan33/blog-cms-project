import Link from 'next/link'
import { Button } from "@/components/ui/button";
import { FileText } from 'lucide-react'
export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-5">
        <FileText className="w-7 h-7 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-700 mb-2">
        ページがありません
      </h3>
      <p className="text-sm text-slate-500 mb-6 max-w-xs leading-relaxed">
        まだ公開されているページがありません。管理画面からページを作成してください。
      </p>
      <Button className="bg-slate-900 hover:bg-slate-700 text-white rounded-xl px-5 py-2.5 text-sm font-medium transition-colors">
        <Link href="/admin">管理画面でページを作成する</Link>
      </Button>
    </div>
  )
}