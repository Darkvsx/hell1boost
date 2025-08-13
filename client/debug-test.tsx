import "./global.css";
import { createRoot } from "react-dom/client";

function DebugTest() {
  const path = window.location.pathname;
  
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🔧 MPA Debug Test</h1>
      <p><strong>Current Path:</strong> {path}</p>
      <p><strong>React Version:</strong> {React.version}</p>
      <p><strong>Environment:</strong> {import.meta.env.MODE}</p>
      <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
      
      <div style={{ marginTop: '20px' }}>
        <h2>Test Links:</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '200px' }}>
          <a href="/" style={{ padding: '8px', background: '#e2e8f0', textDecoration: 'none', borderRadius: '4px' }}>Home (/)</a>
          <a href="/bundles" style={{ padding: '8px', background: '#e2e8f0', textDecoration: 'none', borderRadius: '4px' }}>Bundles</a>
          <a href="/contact" style={{ padding: '8px', background: '#e2e8f0', textDecoration: 'none', borderRadius: '4px' }}>Contact</a>
          <a href="/faq" style={{ padding: '8px', background: '#e2e8f0', textDecoration: 'none', borderRadius: '4px' }}>FAQ</a>
        </div>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h2>DOM Information:</h2>
        <p><strong>Root Element:</strong> {document.getElementById('root') ? '✅ Found' : '❌ Not found'}</p>
        <p><strong>Scripts:</strong> {document.scripts.length}</p>
        <p><strong>Title:</strong> {document.title}</p>
      </div>
    </div>
  );
}

console.log('🧪 Debug test initializing...');

const root = document.getElementById("root");
if (!root) {
  console.error("❌ Root element not found!");
} else {
  console.log("✅ Root element found, rendering debug test...");
  createRoot(root).render(<DebugTest />);
}
