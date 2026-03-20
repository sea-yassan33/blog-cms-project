import type { DefaultNodeTypes } from '@payloadcms/richtext-lexical'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import {type JSXConvertersFunction,RichText as RichTextConverter,} from '@payloadcms/richtext-lexical/react'
import { JSX } from 'react'

const jsxConverters: JSXConvertersFunction<DefaultNodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,

  // 見出し
  heading: ({ node, nodesToJSX }) => {
    const children = nodesToJSX({ nodes: node.children })

    const styles: Record<string, string> = {
      h1: 'text-4xl font-extrabold text-gray-900 mt-10 mb-4',
      h2: 'text-4xl font-bold text-gray-800 mt-8 mb-3 border-b-2 border-gray-200 pb-2',
      h3: 'text-2xl font-semibold text-gray-700 mt-6 mb-2',
      h4: 'text-xl font-semibold text-gray-600 mt-4 mb-2',
    }

    const Tag = node.tag as keyof JSX.IntrinsicElements
    return <Tag className={styles[node.tag] ?? ''}>{children}</Tag>
  },

  // 段落
  paragraph: ({ node, nodesToJSX }) => (
    <p className="text-base leading-8 text-gray-700 mb-4">
      {nodesToJSX({ nodes: node.children })}
    </p>
  ),

  // 引用
  quote: ({ node, nodesToJSX }) => (
    <blockquote className="border-l-4 border-blue-400 pl-4 italic text-gray-500 my-4">
      {nodesToJSX({ nodes: node.children })}
    </blockquote>
  ),
})

type Props = {
  data: SerializedEditorState
  className?: string
}

export function RichText({ data, className }: Props) {
  return (
    <RichTextConverter
      converters={jsxConverters}
      data={data}
      className={className}
    />
  )
}