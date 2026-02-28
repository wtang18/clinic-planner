/**
 * Lightweight Markdown Renderer
 *
 * Minimal inline markdown parser for AI response text. Supports:
 * - **bold** and *italic*
 * - Bullet lists (lines starting with "- " or "• ")
 * - Numbered lists (lines starting with "1. ")
 * - Line breaks (\n)
 * - Inline code (`code`)
 *
 * No dependency on react-markdown or any external library.
 * Designed for controlled AI response content, not arbitrary user input.
 */

import React from 'react';

// ============================================================================
// Inline Formatting
// ============================================================================

/**
 * Parse inline formatting: **bold**, *italic*, `code`
 * Returns an array of React nodes.
 */
function parseInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Regex matches **bold**, *italic*, `code` — in priority order
  const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`(.+?)`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let idx = 0;

  while ((match = regex.exec(text)) !== null) {
    // Push preceding plain text
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    if (match[1]) {
      // **bold**
      nodes.push(
        <strong key={`${keyPrefix}-b${idx}`} style={{ fontWeight: 600 }}>
          {match[2]}
        </strong>,
      );
    } else if (match[3]) {
      // *italic*
      nodes.push(
        <em key={`${keyPrefix}-i${idx}`}>{match[4]}</em>,
      );
    } else if (match[5]) {
      // `code`
      nodes.push(
        <code
          key={`${keyPrefix}-c${idx}`}
          style={{
            backgroundColor: 'rgba(128, 128, 128, 0.15)',
            borderRadius: 3,
            padding: '1px 4px',
            fontSize: '0.9em',
            fontFamily: 'monospace',
          }}
        >
          {match[6]}
        </code>,
      );
    }

    lastIndex = match.index + match[0].length;
    idx++;
  }

  // Push remaining text
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length > 0 ? nodes : [text];
}

// ============================================================================
// Block Parsing
// ============================================================================

interface ParsedBlock {
  type: 'paragraph' | 'bullet' | 'numbered';
  content: string;
  number?: number;
}

function parseBlocks(text: string): ParsedBlock[] {
  const lines = text.split('\n');
  const blocks: ParsedBlock[] = [];

  for (const line of lines) {
    const trimmed = line.trimStart();

    // Bullet: "- " or "• " or "– "
    if (/^[-•–]\s/.test(trimmed)) {
      blocks.push({ type: 'bullet', content: trimmed.replace(/^[-•–]\s+/, '') });
    }
    // Numbered: "1. ", "2. " etc.
    else if (/^\d+\.\s/.test(trimmed)) {
      const num = parseInt(trimmed, 10);
      blocks.push({ type: 'numbered', content: trimmed.replace(/^\d+\.\s+/, ''), number: num });
    }
    // Everything else is paragraph (including empty lines)
    else {
      blocks.push({ type: 'paragraph', content: line });
    }
  }

  return blocks;
}

// ============================================================================
// Component
// ============================================================================

export interface LightMarkdownProps {
  content: string;
  /** Theme affects code block and bullet styling */
  theme?: 'light' | 'dark';
  style?: React.CSSProperties;
}

export const LightMarkdown: React.FC<LightMarkdownProps> = ({
  content,
  theme = 'light',
  style,
}) => {
  const blocks = parseBlocks(content);
  const elements: React.ReactNode[] = [];
  let listBuffer: { type: 'bullet' | 'numbered'; items: ParsedBlock[] } | null = null;
  let blockIdx = 0;

  const flushList = () => {
    if (!listBuffer) return;
    const Tag = listBuffer.type === 'numbered' ? 'ol' : 'ul';
    elements.push(
      <Tag
        key={`list-${blockIdx}`}
        style={{
          margin: '4px 0',
          paddingLeft: 20,
          listStyleType: listBuffer.type === 'numbered' ? 'decimal' : 'disc',
        }}
      >
        {listBuffer.items.map((item, i) => (
          <li key={i} style={{ marginBottom: 2, lineHeight: 1.5 }}>
            {parseInline(item.content, `li-${blockIdx}-${i}`)}
          </li>
        ))}
      </Tag>,
    );
    listBuffer = null;
  };

  for (const block of blocks) {
    if (block.type === 'bullet' || block.type === 'numbered') {
      // Accumulate list items
      if (listBuffer && listBuffer.type === block.type) {
        listBuffer.items.push(block);
      } else {
        flushList();
        listBuffer = { type: block.type, items: [block] };
      }
    } else {
      flushList();
      // Empty lines become spacing
      if (block.content.trim() === '') {
        elements.push(<div key={`sp-${blockIdx}`} style={{ height: 8 }} />);
      } else {
        elements.push(
          <div key={`p-${blockIdx}`} style={{ lineHeight: 1.5 }}>
            {parseInline(block.content, `p-${blockIdx}`)}
          </div>,
        );
      }
    }
    blockIdx++;
  }

  flushList();

  return (
    <div
      style={{
        fontSize: 14,
        color: theme === 'dark' ? 'rgba(255,255,255,0.9)' : undefined,
        fontFamily: 'inherit',
        ...style,
      }}
    >
      {elements}
    </div>
  );
};

LightMarkdown.displayName = 'LightMarkdown';
