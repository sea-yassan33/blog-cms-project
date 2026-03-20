type LexicalTextNode = {
  type: 'text'
  text: string
  format: number
  version: 1
}

type LexicalParagraphNode = {
  type: 'paragraph'
  children: LexicalTextNode[]
  direction: 'ltr'
  format: ''
  indent: 0
  version: 1
}

type LexicalHeadingNode = {
  type: 'heading'
  tag: 'h2' | 'h3'
  children: LexicalTextNode[]
  direction: 'ltr'
  format: ''
  indent: 0
  version: 1
}

type LexicalNode = LexicalParagraphNode | LexicalHeadingNode

export function textToLexical(text: string) {
  const lines = text.split('\n').filter((line) => line.trim() !== '')

  const children: LexicalNode[] = lines.map((line) => {
    // ## 見出し2
    if (line.startsWith('## ')) {
      return {
        type: 'heading',
        tag: 'h2',
        children: [{ type: 'text', text: line.replace('## ', ''), format: 0, version: 1 }],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      }
    }
    // ### 見出し3
    if (line.startsWith('### ')) {
      return {
        type: 'heading',
        tag: 'h3',
        children: [{ type: 'text', text: line.replace('### ', ''), format: 0, version: 1 }],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      }
    }
    // 通常段落
    return {
      type: 'paragraph',
      children: [{ type: 'text', text: line, format: 0, version: 1 }],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    }
  })

  return {
    root: {
      type: 'root',
      children,
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}