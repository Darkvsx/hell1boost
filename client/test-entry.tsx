import "./global.css";
import { createRoot } from "react-dom/client";

function TestApp() {
  return (
    <div style={{ padding: '20px', fontSize: '18px' }}>
      <h1>MPA Test Page</h1>
      <p>Current URL: {window.location.pathname}</p>
      <p>If you can see this, React is working!</p>
      <div>
        <h2>Test Links:</h2>
        <a href="/bundles" style={{ margin: '10px', display: 'block' }}>Go to Bundles</a>
        <a href="/contact" style={{ margin: '10px', display: 'block' }}>Go to Contact</a>
        <a href="/faq" style={{ margin: '10px', display: 'block' }}>Go to FAQ</a>
      </div>
    </div>
  );
}

const root = document.getElementById("root");
if (!root) {
  console.error("Root element not found!");
} else {
  console.log("Root element found, mounting React app...");
  createRoot(root).render(<TestApp />);
}
