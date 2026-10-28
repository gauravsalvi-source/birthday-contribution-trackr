import React from 'react';
import { eventTypeLabels } from '../constants.js';
import { formatMonthLabel, getNextMonth } from '../utils/formatters.js';
import { getEventMeta } from '../utils/sheetHelpers.js';

export const MonthCreatePanel = React.memo(function MonthCreatePanel({
  monthForm,
  setMonthForm,
  onUpdateMonthField,
  onSubmit,
  onOpenCombineModal,
  canCombine,
}) {
  return (
    <form className="month-create-panel" onSubmit={onSubmit}>
      <div className="month-create-header">
        <div>
          <h2>Create Monthly Sheet</h2>
          <p>All team members will be added automatically. You can include extra names below.</p>
        </div>
        {canCombine && (
          <button
            type="button"
            className="secondary-button combine-btn"
            onClick={onOpenCombineModal}
            title="Combine two existing monthly sheets into one"
          >
            🔄 Combine Existing Months
          </button>
        )}
      </div>

      <div className={`month-create-row ${monthForm.isCombined ? 'has-combined' : ''}`}>
        <label>
          Occasion
          <select
            value={monthForm.eventType}
            onChange={(event) => onUpdateMonthField('eventType', event.target.value)}
            required
          >
            {Object.entries(eventTypeLabels).map(([value, meta]) => (
              <option key={value} value={value}>{meta.name}</option>
            ))}
          </select>
        </label>

        <div className="month-picker-container">
          <div className="combine-checkbox-row">
            <label className="checkbox-toggle">
              <input
                type="checkbox"
                checked={monthForm.isCombined}
                onChange={(event) => {
                  const checked = event.target.checked;
                  setMonthForm((cur) => ({
                    ...cur,
                    isCombined: checked,
                    birthdayMonth2: checked && !cur.birthdayMonth2 ? getNextMonth(cur.birthdayMonth) : cur.birthdayMonth2,
                  }));
                }}
              />
              <span>Combine two months (e.g. Sept & Oct for cake)</span>
            </label>
          </div>

          {!monthForm.isCombined ? (
            <label>
              Month
              <input
                type="month"
                value={monthForm.birthdayMonth}
                onChange={(event) => {
                  const val = event.target.value;
                  setMonthForm((cur) => ({
                    ...cur,
                    birthdayMonth: val,
                    birthdayMonth2: getNextMonth(val),
                  }));
                }}
                required
              />
            </label>
          ) : (
            <div className="combined-months-fields">
              <div className="combined-months-inputs">
                <label>
                  Month 1
                  <input
                    type="month"
                    value={monthForm.birthdayMonth}
                    onChange={(event) => {
                      const val = event.target.value;
                      setMonthForm((cur) => ({
                        ...cur,
                        birthdayMonth: val,
                        birthdayMonth2: cur.birthdayMonth2 || getNextMonth(val),
                      }));
                    }}
                    required
                  />
                </label>
                <span className="combined-separator">&</span>
                <label>
                  Month 2
                  <input
                    type="month"
                    value={monthForm.birthdayMonth2}
                    onChange={(event) => onUpdateMonthField('birthdayMonth2', event.target.value)}
                    required
                  />
                </label>
              </div>
              {monthForm.birthdayMonth && monthForm.birthdayMonth2 && (
                <div className="combined-preview-pill">
                  🎂 Combined: <strong>{formatMonthLabel(`${monthForm.birthdayMonth} & ${monthForm.birthdayMonth2}`)}</strong>
                </div>
              )}
            </div>
          )}
        </div>

        <label>
          {getEventMeta(monthForm.eventType).sheetLabel}
          <input
            type="text"
            placeholder={monthForm.isCombined ? 'e.g. Rahul (Sep) & Priya (Oct)' : getEventMeta(monthForm.eventType).recipientPlaceholder}
            value={monthForm.birthdayFor}
            onChange={(event) => onUpdateMonthField('birthdayFor', event.target.value)}
            required
          />
        </label>

        {monthForm.isCombined && (
          <label>
            Contribution (Rs.)
            <input
              type="number"
              min="0"
              step="10"
              value={monthForm.contributionPerMember}
              onChange={(event) => onUpdateMonthField('contributionPerMember', event.target.value)}
              placeholder="100"
              required
            />
          </label>
        )}

        <button type="submit" className="primary-button">
          {monthForm.isCombined ? 'Create Combined Sheet' : 'Create Month'}
        </button>
      </div>

      <label className="month-create-full-width">
        Additional Members
        <input
          type="text"
          placeholder="Optional: comma-separated names (e.g. Rahul, Priya)"
          value={monthForm.additionalMembers}
          onChange={(event) => onUpdateMonthField('additionalMembers', event.target.value)}
          list="team-member-suggestions"
        />
      </label>
    </form>
  );
});
