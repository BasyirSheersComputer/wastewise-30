import React from 'react';

interface ParsedTextProps {
  text: string;
  className?: string;
}

interface TableData {
  headers: string[];
  rows: string[][];
}

/**
 * AI Text Parser Component
 * 
 * Parses AI-generated text and converts it to rich HTML with:
 * - Bold text (**text** or __text__)
 * - Italic text (*text* or _text_)
 * - Bullet points (- item or * item)
 * - Numbered lists (1. item)
 * - Tables (| header1 | header2 |)
 * - Indentation (spaces at beginning of lines)
 * - Headers (# Header)
 * - Code blocks (`code`)
 */
export const ParsedText: React.FC<ParsedTextProps> = ({ text, className = '' }) => {
  const parseText = (text: string): React.ReactNode[] => {
    if (!text) return [];

    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let currentList: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];

    const processLine = (line: string, index: number): React.ReactNode => {
      const trimmedLine = line.trim();
      const indentLevel = line.length - line.trimStart().length;

      // Handle code blocks
      if (trimmedLine.startsWith('```')) {
        if (inCodeBlock) {
          inCodeBlock = false;
          const codeElement = (
            <pre key={`code-${index}`} className="bg-gray-100 p-3 rounded-md text-sm font-mono overflow-x-auto">
              <code>{codeBlockContent.join('\n')}</code>
            </pre>
          );
          codeBlockContent = [];
          return codeElement;
        } else {
          inCodeBlock = true;
          return null;
        }
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        return null;
      }

      // Handle headers
      if (trimmedLine.startsWith('#')) {
        const level = trimmedLine.match(/^#+/)?.[0].length || 1;
        const headerText = trimmedLine.replace(/^#+\s*/, '');
        const HeaderTag = `h${Math.min(level, 6)}` as keyof JSX.IntrinsicElements;
        return (
          <HeaderTag 
            key={`header-${index}`} 
            className={`font-bold text-gray-900 ${level === 1 ? 'text-2xl' : level === 2 ? 'text-xl' : level === 3 ? 'text-lg' : 'text-base'} mt-4 mb-2`}
          >
            {parseInlineFormatting(headerText)}
          </HeaderTag>
        );
      }

      // Handle tables
      if (trimmedLine.includes('|') && trimmedLine.split('|').length > 2) {
        return parseTableLine(trimmedLine, index);
      }

      // Handle bullet points
      if (trimmedLine.match(/^[-*]\s+/)) {
        const content = trimmedLine.replace(/^[-*]\s+/, '');
        return (
          <li key={`bullet-${index}`} className="ml-4 list-disc">
            <span className="ml-2">{parseInlineFormatting(content)}</span>
          </li>
        );
      }

      // Handle numbered lists
      if (trimmedLine.match(/^\d+\.\s+/)) {
        const content = trimmedLine.replace(/^\d+\.\s+/, '');
        return (
          <li key={`numbered-${index}`} className="ml-4 list-decimal">
            <span className="ml-2">{parseInlineFormatting(content)}</span>
          </li>
        );
      }

      // Handle indented text
      if (indentLevel > 0 && trimmedLine) {
        return (
          <div key={`indent-${index}`} className={`ml-${indentLevel * 4} text-gray-700`}>
            {parseInlineFormatting(trimmedLine)}
          </div>
        );
      }

      // Handle empty lines
      if (!trimmedLine) {
        return <br key={`empty-${index}`} />;
      }

      // Handle regular text
      return (
        <p key={`text-${index}`} className="text-gray-700 mb-2">
          {parseInlineFormatting(trimmedLine)}
        </p>
      );
    };

    // Process all lines
    lines.forEach((line, index) => {
      const element = processLine(line, index);
      if (element !== null) {
        elements.push(element);
      }
    });

    return elements;
  };

  const parseInlineFormatting = (text: string): React.ReactNode => {
    if (!text) return '';

    // Handle bold text (**text** or __text__)
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/__(.*?)__/g, '<strong>$1</strong>');

    // Handle italic text (*text* or _text_)
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    text = text.replace(/_(.*?)_/g, '<em>$1</em>');

    // Handle code inline (`code`)
    text = text.replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>');

    // Split by HTML tags and create React elements
    const parts = text.split(/(<[^>]+>.*?<\/[^>]+>|<[^>]+>)/);
    
    return parts.map((part, index) => {
      if (part.startsWith('<strong>') && part.endsWith('</strong>')) {
        const content = part.replace(/<\/?strong>/g, '');
        return <strong key={index} className="font-bold">{content}</strong>;
      }
      if (part.startsWith('<em>') && part.endsWith('</em>')) {
        const content = part.replace(/<\/?em>/g, '');
        return <em key={index} className="italic">{content}</em>;
      }
      if (part.startsWith('<code')) {
        const content = part.replace(/<code[^>]*>(.*?)<\/code>/, '$1');
        return <code key={index} className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">{content}</code>;
      }
      return part;
    });
  };

  const parseTableLine = (line: string, index: number): React.ReactNode => {
    const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
    
    // Check if this is a header separator line (contains only dashes and spaces)
    if (cells.every(cell => /^[-:\s]+$/.test(cell))) {
      return null; // Skip separator lines
    }

    return (
      <tr key={`table-row-${index}`} className="border-b border-gray-200">
        {cells.map((cell, cellIndex) => (
          <td key={cellIndex} className="px-3 py-2 text-sm">
            {parseInlineFormatting(cell)}
          </td>
        ))}
      </tr>
    );
  };

  const parseTable = (text: string): React.ReactNode[] => {
    const lines = text.split('\n');
    const tableLines = lines.filter(line => line.includes('|') && line.trim().split('|').length > 2);
    
    if (tableLines.length === 0) return [];

    const headers = tableLines[0].split('|').map(cell => cell.trim()).filter(cell => cell);
    const rows = tableLines.slice(2).filter(line => !line.match(/^[-:\s|]+$/)); // Skip separator lines

    return [
      <div key="table-container" className="overflow-x-auto my-4">
        <table className="min-w-full border border-gray-300 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header, index) => (
                <th key={index} className="px-3 py-2 text-left text-sm font-medium text-gray-900 border-b border-gray-300">
                  {parseInlineFormatting(header)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => {
              const cells = row.split('|').map(cell => cell.trim()).filter(cell => cell);
              return (
                <tr key={rowIndex} className="border-b border-gray-200">
                  {cells.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-3 py-2 text-sm">
                      {parseInlineFormatting(cell)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    ];
  };

  // Check if the text contains a table
  const hasTable = text.includes('|') && text.split('\n').some(line => 
    line.includes('|') && line.trim().split('|').length > 2
  );

  if (hasTable) {
    // Split text into table and non-table parts
    const lines = text.split('\n');
    const tableStartIndex = lines.findIndex(line => 
      line.includes('|') && line.trim().split('|').length > 2
    );
    
    const beforeTable = lines.slice(0, tableStartIndex).join('\n');
    const tableText = lines.slice(tableStartIndex).join('\n');
    
    return (
      <div className={className}>
        {parseText(beforeTable)}
        {parseTable(tableText)}
      </div>
    );
  }

  return (
    <div className={className}>
      {parseText(text)}
    </div>
  );
};

export default ParsedText;
