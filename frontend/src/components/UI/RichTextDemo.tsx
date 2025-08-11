import React from 'react';
import EnhancedParsedText from '../../utils/enhancedAiTextParser';

const RichTextDemo: React.FC = () => {
  const sampleAIResponse = `# Coffee Chain Optimization Recommendations

## 🎯 **Top Priority Actions**

Based on your current analytics, here are the **most critical** recommendations:

### 1. **Inventory Management**
- **Arabica Coffee Beans**: Reduce order frequency by 20% (currently overstocked)
- **Whole Milk**: Increase safety stock by 15% (frequent stockouts)
- **Vanilla Syrup**: Consider bulk purchasing to reduce costs by 12%

### 2. **Waste Reduction Strategies**
- Implement **first-in-first-out** (FIFO) system for perishables
- Set up **daily waste tracking** for better visibility
- Train staff on **portion control** techniques

## 📊 **Performance Analysis**

| Metric | Current | Target | Impact |
|--------|---------|--------|--------|
| Waste Rate | 8.5% | 5.0% | **RM 2,400/month** |
| Stock Turnover | 12 days | 8 days | **RM 1,800/month** |
| Customer Satisfaction | 4.2/5 | 4.5/5 | **+15% retention** |

## 💡 **Quick Wins**

1. **Immediate Actions** (This Week):
   - Review and adjust milk ordering schedule
   - Implement waste tracking for coffee grounds
   - Update staff training on portion control

2. **Short-term Goals** (Next Month):
   - Negotiate better pricing with suppliers
   - Install digital inventory tracking system
   - Launch customer feedback program

## 🔧 **Technical Implementation**

\`\`\`
// Example inventory optimization code
const optimizeOrder = (currentStock, dailyUsage, leadTime) => {
  const safetyStock = dailyUsage * leadTime * 1.2;
  const reorderPoint = safetyStock + (dailyUsage * leadTime);
  return Math.max(0, reorderPoint - currentStock);
};
\`\`\`

## 📈 **Expected Outcomes**

With these implementations, you can expect:
- **30% reduction** in food waste
- **25% improvement** in inventory turnover
- **RM 15,000 annual savings** in operational costs

*Note: These recommendations are based on your current data patterns and industry best practices.*`;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Rich Text Parsing Demo</h2>
          <p className="text-gray-600 mt-2">
            This demonstrates how AI-generated text is parsed and displayed with rich formatting
          </p>
        </div>
        
        <div className="p-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Sample AI Response</h3>
            <p className="text-blue-800 text-sm">
              This is how the AI recommendation text would look when properly parsed with formatting:
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6">
            <EnhancedParsedText 
              text={sampleAIResponse} 
              className="text-sm text-gray-700"
            />
          </div>
          
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-900 mb-2">Supported Formatting</h3>
            <ul className="text-green-800 text-sm space-y-1">
              <li>• <strong>Bold text</strong> using **text** or __text__</li>
              <li>• <em>Italic text</em> using *text* or _text_</li>
              <li>• <code className="bg-green-100 px-1 rounded">Inline code</code> using `code`</li>
              <li>• Headers using # ## ### etc.</li>
              <li>• Bullet points using - or *</li>
              <li>• Numbered lists using 1. 2. 3.</li>
              <li>• Tables using | column1 | column2 |</li>
              <li>• Code blocks using ```code```</li>
              <li>• Links using [text](url)</li>
              <li>• Strikethrough using ~~text~~</li>
              <li>• Highlights using ==text==</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RichTextDemo;
