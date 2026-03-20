import { NextRequest, NextResponse } from 'next/server'
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from '@langchain/core/prompts'

export async function POST(req: NextRequest) {
  const { title } = await req.json()

  if (!title) {
    return NextResponse.json({ error: 'タイトルが必要です' }, { status: 400 })
  }

  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    apiKey: process.env.GOOGLE_AI_ST_API,
    temperature: 0.7,
  });

  const prompt = ChatPromptTemplate.fromMessages([
    [
      'system',
      `あなたはブログ記事を書くプロのライターです。
       与えられたタイトルに基づいて、SEOを意識した読みやすいブログ記事を日本語で書いてください。
       構成：導入文 → 本文（見出し2〜3つ） → まとめ`,
    ],
    ['human', 'タイトル: {title}'],
  ])

  const chain = prompt.pipe(model)
  const response = await chain.invoke({ title })

  return NextResponse.json({
    content: response.content,
  })
}