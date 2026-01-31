import { useState } from 'react';
import { VisualRuler } from './components/VisualRuler';

function App() {
  // exemplo de campos header e body para testar a régua
  const headerFields = [
    { id: 'bank_code', type: 'Numérico', start: 1, size: 3 },
    { id: 'lote_code', type: 'Numérico', start: 4, size: 4 },
    { id: 'registro', type: 'Numérico', start: 8, size: 1 },
  ];

  const bodyFields = [
    { id: 'segment_a', name: 'Segmento A', start: 10, size: 50 },
    { id: 'segment_b', name: 'Segmento B', start: 60, size: 40 },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h1>CNAB Mass Generator</h1>
      <p>Exemplo da Régua de Visualização:</p>
      <VisualRuler headerFields={headerFields} bodyFields={bodyFields} layoutMode="command" />
    </div>
  );
}

export default App;
