'use client'

import { useField, useFormFields } from '@payloadcms/ui'
import { useState } from 'react'

export function AIGenerateButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedContent, setGeneratedContent] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const titleField = useFormFields(([fields]) => fields['title'])
  const title = titleField?.value as string

  const { setValue: setExcerpt } = useField({ path: 'excerpt' })
  
  const handleGenerate = async () => {
    if (!title) {
      setError('先にタイトルを入力してください')
      return
    }

    setLoading(true)
    setError(null)
    setGeneratedContent(null)

    try {
      const res = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      })

      if (!res.ok) throw new Error('生成に失敗しました')
      
      const { content } = await res.json()
      const firstSentence = content.split('\n').find((s: string) => s.trim()) ?? ''
      setExcerpt(firstSentence)
      setGeneratedContent(content)
    } catch (e) {
      setError('記事の生成に失敗しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!generatedContent) return
    await navigator.clipboard.writeText(generatedContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      {/* 生成ボタン */}
      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading || !title}
        style={{
          padding: '8px 16px',
          backgroundColor: loading || !title ? '#ccc' : '#6d5dfc',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading || !title ? 'not-allowed' : 'pointer',
          fontWeight: 'bold',
        }}
      >
        {loading ? '生成中...' : '✨ AIで記事を自動生成'}
      </button>

      {!title && (
        <p style={{ color: '#888', fontSize: '12px', marginTop: '4px' }}>
          タイトルを入力すると生成できます
        </p>
      )}

      {error && (
        <p style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{error}</p>
      )}

      {/* 生成結果プレビューエリア */}
      {generatedContent && (
        <div style={{ marginTop: '1rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '4px',
          }}>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 'bold' }}>
              生成結果（下のエディタにコピペしてください）
            </p>
            {/* コピーボタン */}
            <button
              type="button"
              onClick={handleCopy}
              style={{
                padding: '4px 12px',
                backgroundColor: copied ? '#22c55e' : '#e2e8f0',
                color: copied ? 'white' : '#333',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              {copied ? '✓ コピーしました' : 'クリップボードにコピー'}
            </button>
          </div>

          {/* テキスト表示エリア */}
          <textarea
            readOnly
            value={generatedContent}
            rows={15}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '13px',
              lineHeight: '1.7',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              backgroundColor: '#f9fafb',
              resize: 'vertical',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />
        </div>
      )}
    </div>
  )
}