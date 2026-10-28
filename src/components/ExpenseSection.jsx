import React from 'react';
import { formatMoney } from '../utils/formatters.js';

function ExpenseSummaryComponent({ expenses }) {
  const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <section className="expense-panel">
      <div className="section-heading">
        <div>
          <h2>Monthly Expenses</h2>
          <p>Read-only expense summary</p>
        </div>
      </div>
      <div className="table-scroll">
        <table className="expense-table">
          <thead>
            <tr>
              <th>Expense Item</th>
              <th className="number-cell">Amount</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr>
                <td className="empty-state" colSpan="2">No expenses added for this month.</td>
              </tr>
            ) : (
              expenses.map((expense) => (
                <tr key={expense.id}>
                  <td>{expense.item}</td>
                  <td className="number-cell">{formatMoney(expense.amount)}</td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr>
              <th>Total Expense</th>
              <th className="number-cell">{formatMoney(totalExpense)}</th>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}

export const ExpenseSummary = React.memo(ExpenseSummaryComponent);

function ExpenseSectionComponent({
  form,
  expenses,
  onFieldChange,
  onSubmit,
  onCancel,
  onEdit,
  onDelete,
}) {
  const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <section className="expense-panel">
      <div className="section-heading">
        <div>
          <h2>Monthly Expenses</h2>
          <p>Spent from total contribution amount</p>
        </div>
        {form.id ? (
          <button type="button" className="ghost-button" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
      </div>

      <form className="expense-form" onSubmit={onSubmit}>
        <input
          type="hidden"
          value={form.birthdayMonth}
          onChange={(event) => onFieldChange('birthdayMonth', event.target.value)}
        />
        <input
          type="hidden"
          value={form.eventType}
          onChange={(event) => onFieldChange('eventType', event.target.value)}
        />
        <label>
          Expense Item
          <input
            type="text"
            placeholder="Cake, snacks, decoration"
            value={form.item}
            onChange={(event) => onFieldChange('item', event.target.value)}
            required
          />
        </label>
        <label>
          Expense Amount
          <input
            type="number"
            min="0"
            step="1"
            placeholder="0"
            value={form.amount}
            onChange={(event) => onFieldChange('amount', event.target.value)}
            required
          />
        </label>
        <button type="submit" className="primary-button">
          {form.id ? 'Update Expense' : 'Add Expense'}
        </button>
      </form>

      <div className="table-scroll">
        <table className="expense-table">
          <thead>
            <tr>
              <th>Expense Item</th>
              <th className="number-cell">Amount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr>
                <td className="empty-state" colSpan="3">No expenses added for this month.</td>
              </tr>
            ) : (
              expenses.map((expense) => (
                <tr key={expense.id}>
                  <td>{expense.item}</td>
                  <td className="number-cell">{formatMoney(expense.amount)}</td>
                  <td>
                    <div className="actions">
                      <button type="button" className="action-button" onClick={() => onEdit(expense)}>
                        Edit
                      </button>
                      <button type="button" className="action-button danger" onClick={() => onDelete(expense)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr>
              <th>Total Expense</th>
              <th className="number-cell">{formatMoney(totalExpense)}</th>
              <th></th>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}

export const ExpenseSection = React.memo(ExpenseSectionComponent);
