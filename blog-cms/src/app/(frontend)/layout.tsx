import type { Metadata } from "next";
import "@/app/(frontend)/globals.css";
import "@/app/(frontend)/variables.css"

export const metadata: Metadata = {
  title: "blogCMS|ブログCMS",
  description: "payloadで作成したブログCMSです。",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="icon" href="/icon.png" type="image/x-icon" sizes="16x16" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-screen bg-white">
        {children}
      </body>
    </html>
  );
}