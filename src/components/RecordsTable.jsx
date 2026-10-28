import React from 'react';
import { formatMoney, formatMonthLabel } from '../utils/formatters.js';

function RecordRowComponent({ record, onEdit, onDelete, canEdit }) {
  return (
    <tr>
      <td>{formatMonthLabel(record.birthdayMonth)}</td>
      <td>{record.name}</td>
      <td>
        <span className={`status-pill ${record.status.toLowerCase()}`}>{record.status}</span>
      </td>
      <td className="number-cell">{formatMoney(record.contribution)}</td>
      <td className="number-cell muted-cell">-</td>
      {canEdit ? (
        <td>
          <div className="actions">
            <button type="button" className="action-button" onClick={() => onEdit(record)}>
              Edit
            </button>
            <button type="button" className="action-button danger" onClick={() => onDelete(record)}>
              Delete
            </button>
          </div>
        </td>
      ) : null}
    </tr>
  );
}

export const RecordRow = React.memo(RecordRowComponent);

function RecordsTableComponent({ records, totals, onEdit, onDelete, canEdit }) {
  return (
    <div className="table-scroll">
      <table className={canEdit ? 'records-table editable-table' : 'records-table viewer-table'}>
        <thead>
          <tr>
            <th>Month</th>
            <th>Team Member Name</th>
            <th>Status</th>
            <th className="number-cell">Contribution Amount</th>
            <th className="number-cell">Total Balance</th>
            {canEdit ? <th>Action</th> : null}
          </tr>
        </thead>
        <tbody>
          {records.length === 0 ? (
            <tr>
              <td className="empty-state" colSpan={canEdit ? 6 : 5}>No records found.</td>
            </tr>
          ) : (
            records.map((record) => (
              <RecordRow
                key={record.id}
                record={record}
                onEdit={onEdit}
                onDelete={onDelete}
                canEdit={canEdit}
              />
            ))
          )}
        </tbody>
        <tfoot>
          <tr>
            <th></th>
            <th>Total</th>
            <th>
              Paid {totals.paidCount} / Pending {totals.pendingCount} / NA {totals.naCount}
            </th>
            <th className="number-cell">{formatMoney(totals.collected)}</th>
            <th className={`number-cell ${totals.closingBalance < 0 ? 'negative' : 'positive'}`}>
              {formatMoney(totals.closingBalance)}
            </th>
            {canEdit ? <th></th> : null}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export const RecordsTable = React.memo(RecordsTableComponent);
