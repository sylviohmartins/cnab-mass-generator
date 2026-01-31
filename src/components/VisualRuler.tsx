import { useRef } from 'react';

interface FieldForRuler {
  id: string;
  name?: string;
  start: number;
  size: number;
  isHeader?: boolean;
}

interface VisualRulerProps {
  headerFields: { id: string; type: string; start: number; size: number }[];
  bodyFields: { id: string; name: string; start: number; size: number }[];
  layoutMode: 'command' | 'response' | 'error';
  highlightFieldId?: string;
}

export function VisualRuler({
  headerFields,
  bodyFields,
  layoutMode,
  highlightFieldId,
}: VisualRulerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const PIXELS_PER_UNIT = 4;
  // Unifica campos de cabeçalho e corpo
  const allFields: FieldForRuler[] = [
    ...headerFields.map((f) => ({
      id: f.id,
      name: f.type,
      start: f.start,
      size: f.size,
      isHeader: true,
    })),
    ...bodyFields.map((f) => ({
      id: f.id,
      name: f.name,
      start: f.start,
      size: f.size,
      isHeader: false,
    })),
  ].sort((a, b) => a.start - b.start);

  const totalLength = allFields.reduce((acc, f) => Math.max(acc, f.start + f.size), 0);

  // Gera marcações de 10 em 10 posições
  const ticks: number[] = [];
  const maxTicks = Math.max(totalLength, 50);
  for (let i = 0; i <= maxTicks + 10; i += 10) ticks.push(i);

  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', overflowX: 'auto' }} ref={scrollRef}>
      <div style={{ position: 'relative', height: '40px', whiteSpace: 'nowrap' }}>
        {ticks.map((pos) => (
          <span
            key={pos}
            style={{
              position: 'absolute',
              left: `${pos * PIXELS_PER_UNIT}px`,
              fontSize: '10px',
              transform: 'translateX(-50%)',
            }}
          >
            {pos}
          </span>
        ))}
        {allFields.map((field) => (
          <div
            key={field.id}
            style={{
              position: 'absolute',
              left: `${(field.start - 1) * PIXELS_PER_UNIT}px`,
              width: `${field.size * PIXELS_PER_UNIT}px`,
              top: '20px',
              height: '15px',
              backgroundColor: field.isHeader ? '#dfe6e9' : '#74b9ff',
              border: '1px solid #636e72',
            }}
            title={`${field.name || ''} (${field.start}-${field.start + field.size - 1})`}
          ></div>
        ))}
      </div>
    </div>
  );
}
