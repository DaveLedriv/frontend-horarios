import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

async function enableMocking() {
  if (
    typeof window === 'undefined' ||
    !import.meta.env.DEV ||
    import.meta.env.VITE_USE_API_MOCKS === 'false'
  ) {
    return;
  }

  const { worker } = await import('./mocks/browser');
  await worker.start({ onUnhandledRequest: 'bypass' });
}

enableMocking()
  .catch((error) => {
    console.error('No fue posible configurar el entorno de mocks', error);
  })
  .finally(() => {
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
  });