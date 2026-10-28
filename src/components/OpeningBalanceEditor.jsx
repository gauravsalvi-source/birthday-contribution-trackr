import { useState, useEffect } from 'react';
import { formatMoney } from '../utils/formatters.js';

export function OpeningBalanceEditor({ currentAdjustment, onSave }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(currentAdjustment);

  useEffect(() => {
    setValue(currentAdjustment);
  }, [currentAdjustment]);

  if (editing) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave(parseFloat(value) || 0);
          setEditing(false);
        }}
        style={{ display: 'inline-flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}
      >
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={{
            width: '80px',
            height: '24px',
            fontSize: '0.8rem',
            padding: '2px 6px',
            border: '1px solid #cec6bb',
            borderRadius: '4px',
            background: '#ffffff',
            color: '#202124',
          }}
          required
        />
        <button
          type="submit"
          className="primary-button"
          style={{ minHeight: '24px', padding: '0 6px', fontSize: '0.75rem', fontWeight: 'bold' }}
        >
          Save
        </button>
        <button
          type="button"
          className="secondary-button"
          onClick={() => {
            setValue(currentAdjustment);
            setEditing(false);
          }}
          style={{ minHeight: '24px', padding: '0 6px', fontSize: '0.75rem' }}
        >
          Cancel
        </button>
      </form>
    );
  }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginLeft: '4px' }}>
      <strong>{formatMoney(currentAdjustment)}</strong>
      <button
        type="button"
        className="ghost-button"
        onClick={() => setEditing(true)}
        style={{ minHeight: '20px', padding: '0px 4px', fontSize: '0.75rem', textDecoration: 'underline' }}
      >
        Edit
      </button>
    </span>
  );
}
