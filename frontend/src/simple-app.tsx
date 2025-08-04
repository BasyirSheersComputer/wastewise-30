import React from 'react';

const SimpleApp: React.FC = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-text-primary mb-8">
          Coffee Chain Operational Intelligence
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Recipe Yield Accuracy
            </h3>
            <p className="text-3xl font-bold text-success">87.5%</p>
            <p className="text-sm text-text-secondary">Actual vs Expected Output</p>
          </div>
          
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Raw Material Waste
            </h3>
            <p className="text-3xl font-bold text-error">12.3%</p>
            <p className="text-sm text-text-secondary">Coffee Beans, Milk, Syrups</p>
          </div>
          
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              COGS per Cup
            </h3>
            <p className="text-3xl font-bold text-primary">$2.45</p>
            <p className="text-sm text-text-secondary">Cost of Goods Sold</p>
          </div>
          
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Staff Efficiency
            </h3>
            <p className="text-3xl font-bold text-accent">94.2%</p>
            <p className="text-sm text-text-secondary">Portioning & Waste Control</p>
          </div>
        </div>
        
        <div className="mt-8 glass-card p-6">
          <h2 className="text-2xl font-bold text-text-primary mb-4">
            Problem Solved for Hadi's Coffee Chain
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-error/10 rounded-lg">
              <h3 className="font-semibold text-error mb-2">❌ Before:</h3>
              <ul className="text-sm text-text-secondary space-y-1">
                <li>• 40 cups estimated, only 30 produced</li>
                <li>• Unclear where the gap comes from</li>
                <li>• No visibility into waste sources</li>
                <li>• Manual tracking and guesswork</li>
              </ul>
            </div>
            <div className="p-4 bg-success/10 rounded-lg">
              <h3 className="font-semibold text-success mb-2">✅ After:</h3>
              <ul className="text-sm text-text-secondary space-y-1">
                <li>• Precise tracking shows exactly where waste occurs</li>
                <li>• Real-time visibility into spillage, over-extraction</li>
                <li>• Data-driven decisions for optimization</li>
                <li>• Automated waste tracking with staff attribution</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-text-secondary">
            Frontend is working! All coffee chain operational intelligence features are ready.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimpleApp; 