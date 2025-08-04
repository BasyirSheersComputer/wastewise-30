import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

const TestComponent = () => {
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f8fafc',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#1e293b', marginBottom: '20px' }}>
        🎉 Frontend Test Successful!
      </h1>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ color: '#3b82f6', marginBottom: '15px' }}>
          Coffee Chain Operational Intelligence System
        </h2>
        <p style={{ color: '#64748b', marginBottom: '10px' }}>
          ✅ React is working
        </p>
        <p style={{ color: '#64748b', marginBottom: '10px' }}>
          ✅ Vite is working
        </p>
        <p style={{ color: '#64748b', marginBottom: '10px' }}>
          ✅ TypeScript is working
        </p>
        <p style={{ color: '#64748b', marginBottom: '10px' }}>
          ✅ Frontend server is accessible
        </p>
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#f0f9ff',
          borderRadius: '6px',
          border: '1px solid #0ea5e9'
        }}>
          <h3 style={{ color: '#0c4a6e', marginBottom: '10px' }}>
            Key Metrics for Hadi's Coffee Chain:
          </h3>
          <ul style={{ color: '#0c4a6e', margin: 0, paddingLeft: '20px' }}>
            <li>Recipe Yield Accuracy: 87.5%</li>
            <li>Raw Material Waste: 12.3%</li>
            <li>COGS per Cup: $2.45</li>
            <li>Staff Efficiency: 94.2%</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TestComponent />
  </StrictMode>
); 