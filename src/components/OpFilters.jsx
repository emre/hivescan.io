import { useMemo } from "react";

export default function OpFilters({ ops, selected, onToggle, onClear }) {
  const ranked = useMemo(() => {
    const counts = {};
    for (const op of ops) counts[op.name] = (counts[op.name] ?? 0) + 1;
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 14);
  }, [ops]);

  if (!ranked.length) return null;

  return (
    <div style={{ 
      display: 'flex', 
      flexWrap: 'wrap', 
      gap: '8px', 
      marginBottom: '16px',
      alignItems: 'center'
    }}>
      {ranked.map(([name, count]) => (
        <button
          key={name}
          onClick={() => onToggle(name)}
          style={{
            padding: '4px 10px',
            borderRadius: '12px',
            border: selected.has(name) ? '1px solid var(--red)' : '1px solid var(--rule)',
            background: selected.has(name) ? 'var(--band-2)' : 'var(--band)',
            color: selected.has(name) ? 'var(--ink)' : 'var(--ink-2)',
            fontSize: '11.5px',
            fontFamily: 'var(--sans)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            if (!selected.has(name)) {
              e.target.style.borderColor = 'var(--rule-2)';
            }
          }}
          onMouseLeave={(e) => {
            if (!selected.has(name)) {
              e.target.style.borderColor = 'var(--rule)';
            }
          }}
        >
          {name} <span style={{ color: 'var(--ink-3)', marginLeft: '4px' }}>{count}</span>
        </button>
      ))}
      {selected.size > 0 && (
        <button
          onClick={onClear}
          style={{
            padding: '4px 10px',
            borderRadius: '12px',
            border: '1px solid var(--rule)',
            background: 'transparent',
            color: 'var(--red)',
            fontSize: '11.5px',
            fontFamily: 'var(--sans)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'var(--band)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
          }}
        >
          Clear filter
        </button>
      )}
    </div>
  );
}
