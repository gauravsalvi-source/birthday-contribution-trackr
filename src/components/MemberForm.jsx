import React from 'react';
import { eventTypeLabels, contributionStatuses } from '../constants.js';
import { formatMonthLabel, getNextMonth } from '../utils/formatters.js';
import { getEventMeta } from '../utils/sheetHelpers.js';

export const MemberForm = React.memo(function MemberForm({
  form,
  onUpdateField,
  onSubmit,
  onReset,
  nameInputRef,
}) {
  return (
    <form className="form-panel" onSubmit={onSubmit}>
      <div className="section-heading">
        <h2>{form.id ? 'Edit Record' : 'Add Member'}</h2>
        {form.id ? (
          <button type="button" className="ghost-button" onClick={onReset}>
            Cancel
          </button>
        ) : null}
      </div>

      {form.id ? (
        <>
          <div className="edit-month-group">
            {form.birthdayMonth.includes('&') ? (
              <div>
                <div className="section-heading" style={{ marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.92rem', fontWeight: 750, color: '#39352f' }}>Month (Combined)</span>
                  <button
                    type="button"
                    className="ghost-button"
                    style={{ padding: '0 4px', fontSize: '0.8rem' }}
                    onClick={() => {
                      const first = form.birthdayMonth.split('&')[0].trim();
                      onUpdateField('birthdayMonth', first);
                    }}
                  >
                    Switch to Single Month
                  </button>
                </div>
                <div className="combined-inputs-row">
                  <input
                    type="month"
                    value={form.birthdayMonth.split('&')[0].trim()}
                    onChange={(e) => {
                      const parts = form.birthdayMonth.split('&').map((p) => p.trim());
                      parts[0] = e.target.value;
                      onUpdateField('birthdayMonth', parts.join(' & '));
                    }}
                    required
                  />
                  <span className="combined-separator">&</span>
                  <input
                    type="month"
                    value={form.birthdayMonth.split('&')[1]?.trim() || ''}
                    onChange={(e) => {
                      const parts = form.birthdayMonth.split('&').map((p) => p.trim());
                      parts[1] = e.target.value;
                      onUpdateField('birthdayMonth', parts.join(' & '));
                    }}
                    required
                  />
                </div>
                <div style={{ fontSize: '0.8rem', color: '#0f766e', marginTop: '4px', fontWeight: 600 }}>
                  {formatMonthLabel(form.birthdayMonth)}
                </div>
              </div>
            ) : (
              <div>
                <div className="section-heading" style={{ marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.92rem', fontWeight: 750, color: '#39352f' }}>Month</span>
                  <button
                    type="button"
                    className="ghost-button"
                    style={{ padding: '0 4px', fontSize: '0.8rem' }}
                    onClick={() => {
                      onUpdateField('birthdayMonth', `${form.birthdayMonth} & ${getNextMonth(form.birthdayMonth)}`);
                    }}
                  >
                    + Combine 2nd Month
                  </button>
                </div>
                <input
                  type="month"
                  value={form.birthdayMonth}
                  onChange={(event) => onUpdateField('birthdayMonth', event.target.value)}
                  required
                />
              </div>
            )}
          </div>

          <label>
            Occasion
            <select
              value={form.eventType}
              onChange={(event) => onUpdateField('eventType', event.target.value)}
              required
            >
              {Object.entries(eventTypeLabels).map(([value, meta]) => (
                <option key={value} value={value}>{meta.name}</option>
              ))}
            </select>
          </label>

          <label>
            {getEventMeta(form.eventType).sheetLabel}
            <input
              type="text"
              placeholder={getEventMeta(form.eventType).recipientPlaceholder}
              value={form.birthdayFor}
              onChange={(event) => onUpdateField('birthdayFor', event.target.value)}
              required
            />
          </label>
        </>
      ) : (
        <div className="sheet-context">
          <p><strong>Month:</strong> {formatMonthLabel(form.birthdayMonth)}</p>
          <p><strong>Occasion:</strong> {getEventMeta(form.eventType).name}</p>
          <p><strong>{getEventMeta(form.eventType).sheetLabel}:</strong> {form.birthdayFor}</p>
        </div>
      )}

      <label>
        Team Member Name
        <input
          ref={nameInputRef}
          type="text"
          placeholder="Contributor name"
          value={form.name}
          onChange={(event) => onUpdateField('name', event.target.value)}
          list="team-member-suggestions"
          required
        />
      </label>

      <label>
        Contribution Status
        <select
          value={form.status}
          onChange={(event) => onUpdateField('status', event.target.value)}
          required
        >
          {contributionStatuses.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </label>

      <label>
        Contribution Amount
        <input
          type="number"
          min="0"
          step="1"
          placeholder="100"
          value={form.contribution}
          onChange={(event) => onUpdateField('contribution', event.target.value)}
          disabled={form.status === 'NA' || form.status === 'Exempted'}
          required
        />
      </label>

      <label>
        Birth Date
        <input
          type="date"
          value={form.birthDate}
          onChange={(event) => onUpdateField('birthDate', event.target.value)}
        />
      </label>

      <label>
        Note
        <input
          type="text"
          placeholder="Optional"
          value={form.note}
          onChange={(event) => onUpdateField('note', event.target.value)}
        />
      </label>

      <button type="submit" className="primary-button">
        {form.id ? 'Save Record' : 'Add Member'}
      </button>
    </form>
  );
});
