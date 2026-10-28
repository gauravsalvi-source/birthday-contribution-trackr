import React, { useEffect } from 'react';
import { formatMoney, formatMonthLabel } from '../utils/formatters.js';
import { parseSheetKey, getEventMeta, getSheetKey, formatSheetLabel } from '../utils/sheetHelpers.js';

export function CombineMonthsModal({
  isOpen,
  onClose,
  sheets,
  combineForm,
  onUpdateField,
  onCombine,
  expenses,
  records,
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const { sheet1, sheet2, birthdayFor, contributionStrategy, defaultContribution, deleteOriginals } = combineForm;
  const p1 = parseSheetKey(sheet1);
  const p2 = parseSheetKey(sheet2);
  const m1 = p1.birthdayMonth;
  const m2 = p2.birthdayMonth;
  const combinedMonth = m1 <= m2 ? `${m1} & ${m2}` : `${m2} & ${m1}`;

  const s1Expenses = expenses.filter((e) => getSheetKey(e) === sheet1);
  const s2Expenses = expenses.filter((e) => getSheetKey(e) === sheet2);
  const totalCombinedExpenses = [...s1Expenses, ...s2Expenses].reduce((sum, e) => sum + e.amount, 0);

  const s1Records = records.filter((r) => getSheetKey(r) === sheet1 && r.name !== 'Opening Balance');
  const s2Records = records.filter((r) => getSheetKey(r) === sheet2 && r.name !== 'Opening Balance');
  const uniqueMemberCount = new Set([...s1Records.map((r) => r.name), ...s2Records.map((r) => r.name)]).size;

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="combine-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="combine-modal-title"
      >
        <div className="combine-modal-header">
          <div>
            <h3 id="combine-modal-title">Combine Two Months for Cake / Celebration</h3>
            <p>Merge two monthly sheets into a single combined contribution sheet.</p>
          </div>
          <button type="button" className="ghost-button" onClick={onClose} aria-label="Close dialog">
            ✕
          </button>
        </div>

        <form onSubmit={onCombine} className="combine-modal-body">
          <div className="combine-selects-grid">
            <label>
              First Month Sheet
              <select
                value={sheet1}
                onChange={(e) => onUpdateField('sheet1', e.target.value)}
                required
              >
                {sheets.map((s) => (
                  <option key={s} value={s} disabled={s === sheet2}>
                    {formatSheetLabel(s)}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Second Month Sheet
              <select
                value={sheet2}
                onChange={(e) => onUpdateField('sheet2', e.target.value)}
                required
              >
                {sheets.map((s) => (
                  <option key={s} value={s} disabled={s === sheet1}>
                    {formatSheetLabel(s)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="combine-preview-banner">
            <div>
              <span className="preview-label">Combined Result</span>
              <div className="preview-title">
                🎂 {formatMonthLabel(combinedMonth)} - {getEventMeta(p1.eventType).name}
              </div>
            </div>
            <div className="preview-stats">
              <span>{uniqueMemberCount} team members</span>
              <span>•</span>
              <span>{s1Expenses.length + s2Expenses.length} expenses ({formatMoney(totalCombinedExpenses)})</span>
            </div>
          </div>

          <label>
            Combined Celebrants ({getEventMeta(p1.eventType).sheetLabel})
            <input
              type="text"
              value={birthdayFor}
              onChange={(e) => onUpdateField('birthdayFor', e.target.value)}
              placeholder="e.g. Rahul (Sep) & Priya (Oct)"
              required
            />
            <small style={{ color: '#756e64' }}>
              Birthday celebrants will automatically be marked Exempted (0 contribution).
            </small>
          </label>

          <div className="strategy-section">
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#39352f', display: 'block', marginBottom: '8px' }}>
              Contribution Strategy
            </span>
            <div className="radio-option">
              <label>
                <input
                  type="radio"
                  name="strategy"
                  value="standard"
                  checked={contributionStrategy === 'standard'}
                  onChange={() => onUpdateField('contributionStrategy', 'standard')}
                />
                <div>
                  <strong>Single Contribution (Recommended)</strong>
                  <p>Each member contributes once for the joint celebration (e.g. Rs. 100). If already paid in either month, marked Paid.</p>
                </div>
              </label>
            </div>
            <div className="radio-option">
              <label>
                <input
                  type="radio"
                  name="strategy"
                  value="sum"
                  checked={contributionStrategy === 'sum'}
                  onChange={() => onUpdateField('contributionStrategy', 'sum')}
                />
                <div>
                  <strong>Sum Both Contributions</strong>
                  <p>Combines contribution amounts from both months (e.g. Rs. 100 + Rs. 100 = Rs. 200).</p>
                </div>
              </label>
            </div>
          </div>

          {contributionStrategy === 'standard' && (
            <label>
              Contribution per Member (Rs.)
              <input
                type="number"
                min="0"
                step="10"
                value={defaultContribution}
                onChange={(e) => onUpdateField('defaultContribution', e.target.value)}
                required
              />
            </label>
          )}

          <label className="checkbox-toggle">
            <input
              type="checkbox"
              checked={deleteOriginals}
              onChange={(e) => onUpdateField('deleteOriginals', e.target.checked)}
            />
            <span>Delete original separate month sheets after combining</span>
          </label>

          <div className="combine-modal-actions">
            <button type="button" className="secondary-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-button">
              Combine Sheets Now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
