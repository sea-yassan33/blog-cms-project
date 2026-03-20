import Link from 'next/link'
export default function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-bold">
          Blog CMS Sample
        </Link>
        <nav>
          <Link href="/" className="text-sm hover:underline mx-2">
            記事一覧
          </Link>
          <Link href="/admin" className="text-sm hover:underline">
            管理画面
          </Link>
        </nav>
      </div>
    </header>
  );
}