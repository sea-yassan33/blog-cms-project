export default function AuthorAvatar({ author }: { author: any }) {
  const initial =
    typeof author === 'object' && author?.email
      ? author.email.charAt(0).toUpperCase()
      : '?'
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white text-[10px] font-bold shrink-0">
      {initial}
    </span>
  )
}