import React, { useState } from 'react';
import EnhancedParsedText from '../../utils/enhancedAiTextParser';

const RichTextTest: React.FC = () => {
  const [testText, setTestText] = useState(`# Test Rich Text Parsing

## **Bold Text Test**
This text contains **bold formatting** and __alternative bold__.

## *Italic Text Test*
This text contains *italic formatting* and _alternative italic_.

## Code and Links
- Inline code: \`const example = "test";\`
- Link: [Visit our website](https://example.com)
- Strikethrough: ~~old text~~
- Highlight: ==important text==

## Lists
1. **Numbered list item 1**
2. *Numbered list item 2*
3. \`Numbered list item 3\`

- **Bullet point 1**
- *Bullet point 2*
- \`Bullet point 3\`

## Table Test
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| **Bold** | *Italic* | \`Code\` |
| Normal | Text | Here |

## Code Block
\`\`\`
function testFunction() {
  console.log("This is a code block");
  return "Hello World";
}
\`\`\`

## Indented Text
    This text is indented
        This is more indented
            This is even more indented`);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Rich Text Parser Test</h2>
          <p className="text-gray-600 mt-2">
            Test the rich text parsing functionality with custom input
          </p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Input Text</h3>
              <textarea
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                className="w-full h-96 p-3 border border-gray-300 rounded-lg font-mono text-sm resize-none"
                placeholder="Enter text with formatting..."
              />
            </div>
            
            {/* Output Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Parsed Output</h3>
              <div className="h-96 overflow-y-auto border border-gray-300 rounded-lg p-4 bg-gray-50">
                <EnhancedParsedText 
                  text={testText} 
                  className="text-sm text-gray-700"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Supported Formatting</h3>
            <div className="text-blue-800 text-sm space-y-1">
              <p><strong>Bold:</strong> **text** or __text__</p>
              <p><em>Italic:</em> *text* or _text_</p>
              <p><code className="bg-blue-100 px-1 rounded">Code:</code> `code`</p>
              <p><del>Strikethrough:</del> ~~text~~</p>
              <p><mark className="bg-yellow-200 px-1">Highlight:</mark> ==text==</p>
              <p>Headers: # ## ### etc.</p>
              <p>Lists: - item or 1. item</p>
              <p>Tables: | col1 | col2 |</p>
              <p>Code blocks: ```code```</p>
              <p>Links: [text](url)</p>
              <p>Indentation: spaces at line start</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RichTextTest;
