import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyCode = (codeText: string, index: number) => {
    navigator.clipboard.writeText(codeText);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Split lines and parse basic markdown blocks
  const renderFormatted = () => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBuffer: string[] = [];
    let codeLang = '';
    let codeBlockIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Code blocks ```
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeLang = line.replace('```', '').trim() || 'code';
          codeBuffer = [];
        } else {
          inCodeBlock = false;
          const currentCode = codeBuffer.join('\n');
          const idx = codeBlockIndex++;
          elements.push(
            <div key={`code_${idx}`} className="my-2 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden font-mono text-xs">
              <div className="px-3 py-1.5 bg-slate-900 border-b border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                <span className="uppercase font-semibold tracking-wider text-indigo-400">{codeLang}</span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(currentCode, idx)}
                  className="flex items-center space-x-1 hover:text-white transition-colors"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3 text-slate-200 overflow-x-auto leading-relaxed">
                <code>{currentCode}</code>
              </pre>
            </div>
          );
        }
        continue;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        continue;
      }

      // Headers
      if (line.startsWith('### ')) {
        elements.push(
          <h4 key={i} className="text-xs font-bold text-white mt-2 mb-1">
            {parseInline(line.replace('### ', ''))}
          </h4>
        );
        continue;
      }
      if (line.startsWith('## ')) {
        elements.push(
          <h3 key={i} className="text-sm font-bold text-white mt-2.5 mb-1.5">
            {parseInline(line.replace('## ', ''))}
          </h3>
        );
        continue;
      }
      if (line.startsWith('# ')) {
        elements.push(
          <h2 key={i} className="text-base font-bold text-white mt-3 mb-1.5">
            {parseInline(line.replace('# ', ''))}
          </h2>
        );
        continue;
      }

      // Bullet points
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const bulletText = line.trim().replace(/^[-*]\s+/, '');
        elements.push(
          <div key={i} className="flex items-start space-x-2 my-0.5 pl-2 text-xs">
            <span className="text-indigo-400 shrink-0 select-none">•</span>
            <span className="text-slate-300 leading-relaxed">{parseInline(bulletText)}</span>
          </div>
        );
        continue;
      }

      // Numbered lists
      const numMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        elements.push(
          <div key={i} className="flex items-start space-x-2 my-0.5 pl-2 text-xs">
            <span className="text-indigo-400 font-mono text-[11px] shrink-0 select-none">{numMatch[1]}.</span>
            <span className="text-slate-300 leading-relaxed">{parseInline(numMatch[2])}</span>
          </div>
        );
        continue;
      }

      // Blockquotes
      if (line.startsWith('> ')) {
        elements.push(
          <blockquote key={i} className="border-l-2 border-indigo-500 pl-3 my-1.5 text-xs text-slate-400 italic">
            {parseInline(line.replace('> ', ''))}
          </blockquote>
        );
        continue;
      }

      // Empty line / paragraph break
      if (!line.trim()) {
        elements.push(<div key={i} className="h-1.5" />);
        continue;
      }

      // Regular paragraph
      elements.push(
        <p key={i} className="text-xs leading-relaxed text-slate-300 my-0.5">
          {parseInline(line)}
        </p>
      );
    }

    return elements;
  };

  // Helper to parse bold, inline code, and links
  const parseInline = (text: string): React.ReactNode => {
    // Regex matching **bold**, `code`, [link](url)
    const tokens = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

    return tokens.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-semibold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={index}
            className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-[11px] border border-slate-700/60"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return <div className="space-y-0.5">{renderFormatted()}</div>;
};
