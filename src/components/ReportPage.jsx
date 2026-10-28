import React from 'react';
import { formatMoney, formatMonthLabel } from '../utils/formatters.js';

function ReportPageComponent({
  title,
  records,
  emptyText,
  showBirthDate = false,
  canEdit = false,
  onEdit = null,
}) {
  return (
    <section className="report-page">
      <div className="report-page-header">
        <h3>{title}</h3>
        <span>{records.length} members</span>
      </div>
      {records.length === 0 ? (
        <p className="empty-report">{emptyText}</p>
      ) : (
        <div className="table-scroll">
          <table className="report-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Team Member Name</th>
                <th>Status</th>
                {showBirthDate ? <th>Birth Date</th> : <th className="number-cell">Contribution Amount</th>}
                <th>Note</th>
                {canEdit ? <th>Action</th> : null}
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id}>
                  <td>{formatMonthLabel(record.birthdayMonth)}</td>
                  <td>{record.name}</td>
                  <td><span className={`status-pill ${record.status.toLowerCase()}`}>{record.status}</span></td>
                  {showBirthDate ? (
                    <td>{record.birthDate ? new Date(record.birthDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '-'}</td>
                  ) : (
                    <td className="number-cell">{formatMoney(record.contribution)}</td>
                  )}
                  <td>{record.note || '-'}</td>
                  {canEdit ? (
                    <td>
                      <div className="actions">
                        <button type="button" className="action-button" onClick={() => onEdit && onEdit(record)}>
                          Edit
                        </button>
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export const ReportPage = React.memo(ReportPageComponent);
