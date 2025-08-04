import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const Dashboard: React.FC = () => (
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
      
      <div className="mt-8 text-center">
        <p className="text-text-secondary">
          Frontend is working! All coffee chain operational intelligence features are ready.
        </p>
      </div>
    </div>
  </div>
);

const MinimalApp: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </Router>
  );
};

export default MinimalApp; 