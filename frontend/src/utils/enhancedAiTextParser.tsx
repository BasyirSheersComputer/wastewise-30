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
 * Enhanced AI Text Parser Component
 * 
 * Advanced parser for AI-generated text with:
 * - Bold text (**text** or __text__)
 * - Italic text (*text* or _text_)
 * - Bullet points (- item or * item) with proper list grouping
 * - Numbered lists (1. item) with proper list grouping
 * - Tables (| header1 | header2 |) with proper formatting
 * - Indentation (spaces at beginning of lines)
 * - Headers (# Header)
 * - Code blocks (```code```)
 * - Inline code (`code`)
 * - Links [text](url)
 * - Emphasis and highlighting
 */
export const EnhancedParsedText: React.FC<ParsedTextProps> = ({ text, className = '' }) => {
  const parseText = (text: string): React.ReactNode[] => {
    if (!text) return [];

    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let currentList: React.ReactNode[] = [];
    let currentListType: 'bullet' | 'numbered' | null = null;
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let inTable = false;
    let tableContent: string[] = [];

    const processLine = (line: string, index: number): React.ReactNode => {
      const trimmedLine = line.trim();
      const indentLevel = line.length - line.trimStart().length;

      // Handle code blocks
      if (trimmedLine.startsWith('```')) {
        if (inCodeBlock) {
          inCodeBlock = false;
          const codeElement = (
            <pre key={`code-${index}`} className="bg-gray-100 p-4 rounded-lg text-sm font-mono overflow-x-auto border border-gray-200 my-4">
              <code className="text-gray-800">{codeBlockContent.join('\n')}</code>
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

      // Handle tables
      if (trimmedLine.includes('|') && trimmedLine.split('|').length > 2) {
        if (!inTable) {
          inTable = true;
          tableContent = [];
        }
        tableContent.push(line);
        return null;
      } else if (inTable) {
        inTable = false;
        const tableElement = parseTable(tableContent);
        tableContent = [];
        return tableElement;
      }

      // Handle headers
      if (trimmedLine.startsWith('#')) {
        const level = trimmedLine.match(/^#+/)?.[0].length || 1;
        const headerText = trimmedLine.replace(/^#+\s*/, '');
        const HeaderTag = `h${Math.min(level, 6)}` as keyof JSX.IntrinsicElements;
        return (
          <HeaderTag 
            key={`header-${index}`} 
            className={`font-bold text-gray-900 ${level === 1 ? 'text-2xl' : level === 2 ? 'text-xl' : level === 3 ? 'text-lg' : 'text-base'} mt-6 mb-3`}
          >
            {parseInlineFormatting(headerText)}
          </HeaderTag>
        );
      }

      // Handle bullet points
      if (trimmedLine.match(/^[-*]\s+/)) {
        const content = trimmedLine.replace(/^[-*]\s+/, '');
        if (currentListType !== 'bullet') {
          // Start new bullet list
          if (currentList.length > 0) {
            elements.push(renderList(currentList, currentListType!));
            currentList = [];
          }
          currentListType = 'bullet';
        }
        currentList.push(
          <li key={`bullet-${index}`} className="mb-1">
            <span>{parseInlineFormatting(content)}</span>
          </li>
        );
        return null;
      }

      // Handle numbered lists
      if (trimmedLine.match(/^\d+\.\s+/)) {
        const content = trimmedLine.replace(/^\d+\.\s+/, '');
        if (currentListType !== 'numbered') {
          // Start new numbered list
          if (currentList.length > 0) {
            elements.push(renderList(currentList, currentListType!));
            currentList = [];
          }
          currentListType = 'numbered';
        }
        currentList.push(
          <li key={`numbered-${index}`} className="mb-1">
            <span>{parseInlineFormatting(content)}</span>
          </li>
        );
        return null;
      }

      // If we have a current list and this line doesn't continue it, render the list
      if (currentList.length > 0 && !trimmedLine.match(/^[-*]\s+/) && !trimmedLine.match(/^\d+\.\s+/)) {
        elements.push(renderList(currentList, currentListType!));
        currentList = [];
        currentListType = null;
      }

      // Handle indented text
      if (indentLevel > 0 && trimmedLine) {
        return (
          <div key={`indent-${index}`} className={`ml-${Math.min(indentLevel * 4, 16)} text-gray-700 mb-2`}>
            {parseInlineFormatting(trimmedLine)}
          </div>
        );
      }

      // Handle empty lines
      if (!trimmedLine) {
        return <div key={`empty-${index}`} className="h-2"></div>;
      }

      // Handle regular text
      return (
        <p key={`text-${index}`} className="text-gray-700 mb-3 leading-relaxed">
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

    // Render any remaining list
    if (currentList.length > 0) {
      elements.push(renderList(currentList, currentListType!));
    }

    return elements;
  };

  const renderList = (listItems: React.ReactNode[], type: 'bullet' | 'numbered'): React.ReactNode => {
    const listType = type === 'bullet' ? 'list-disc' : 'list-decimal';
    return (
      <ul key={`list-${Date.now()}`} className={`${listType} ml-6 mb-4 space-y-1`}>
        {listItems}
      </ul>
    );
  };

  const parseInlineFormatting = (text: string): React.ReactNode => {
    if (!text) return '';

    // Handle links [text](url)
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">$1</a>');

    // Handle bold text (**text** or __text__)
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/__(.*?)__/g, '<strong>$1</strong>');

    // Handle italic text (*text* or _text_)
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    text = text.replace(/_(.*?)_/g, '<em>$1</em>');

    // Handle strikethrough (~~text~~)
    text = text.replace(/~~(.*?)~~/g, '<del class="line-through">$1</del>');

    // Handle code inline (`code`)
    text = text.replace(/`(.*?)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">$1</code>');

    // Handle highlights (==text==)
    text = text.replace(/==(.*?)==/g, '<mark class="bg-yellow-200 px-1">$1</mark>');

    // Split by HTML tags and create React elements
    const parts = text.split(/(<[^>]+>.*?<\/[^>]+>|<[^>]+>)/);
    
    return parts.map((part, index) => {
      if (part.startsWith('<strong>') && part.endsWith('</strong>')) {
        const content = part.replace(/<\/?strong>/g, '');
        return <strong key={index} className="font-bold text-gray-900">{content}</strong>;
      }
      if (part.startsWith('<em>') && part.endsWith('</em>')) {
        const content = part.replace(/<\/?em>/g, '');
        return <em key={index} className="italic">{content}</em>;
      }
      if (part.startsWith('<del')) {
        const content = part.replace(/<del[^>]*>(.*?)<\/del>/, '$1');
        return <del key={index} className="line-through text-gray-500">{content}</del>;
      }
      if (part.startsWith('<code')) {
        const content = part.replace(/<code[^>]*>(.*?)<\/code>/, '$1');
        return <code key={index} className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">{content}</code>;
      }
      if (part.startsWith('<mark')) {
        const content = part.replace(/<mark[^>]*>(.*?)<\/mark>/, '$1');
        return <mark key={index} className="bg-yellow-200 px-1">{content}</mark>;
      }
      if (part.startsWith('<a')) {
        const content = part.replace(/<a[^>]*>(.*?)<\/a>/, '$1');
        const href = part.match(/href="([^"]+)"/)?.[1] || '#';
        return (
          <a key={index} href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
            {content}
          </a>
        );
      }
      return part;
    });
  };

  const parseTable = (tableLines: string[]): React.ReactNode => {
    if (tableLines.length === 0) return null;

    const validLines = tableLines.filter(line => 
      line.includes('|') && line.trim().split('|').length > 2
    );

    if (validLines.length === 0) return null;

    const headers = validLines[0].split('|').map(cell => cell.trim()).filter(cell => cell);
    const dataRows = validLines.slice(2).filter(line => !line.match(/^[-:\s|]+$/));

    return (
      <div key="table-container" className="overflow-x-auto my-6">
        <table className="min-w-full border border-gray-300 rounded-lg shadow-sm">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header, index) => (
                <th key={index} className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-300">
                  {parseInlineFormatting(header)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            {dataRows.map((row, rowIndex) => {
              const cells = row.split('|').map(cell => cell.trim()).filter(cell => cell);
              return (
                <tr key={rowIndex} className="border-b border-gray-200 hover:bg-gray-50">
                  {cells.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-3 text-sm text-gray-700">
                      {parseInlineFormatting(cell)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      {parseText(text)}
    </div>
  );
};

export default EnhancedParsedText;
