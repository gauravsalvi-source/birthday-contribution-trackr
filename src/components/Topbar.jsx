import React from 'react';

export const Topbar = React.memo(function Topbar({
  isManagerMode,
  managerPasswordInput,
  onPasswordChange,
  onUnlock,
  onLock,
  onExportCsv,
  onImportCsv,
  fileInputRef,
}) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Monthly Team Birthday Fund</p>
        <h1>Birthday Contribution Tracker</h1>
      </div>
      <div className="topbar-actions">
        {isManagerMode ? (
          <>
            <button type="button" className="secondary-button" onClick={onExportCsv}>
              Export CSV
            </button>
            <button type="button" className="secondary-button" onClick={() => fileInputRef.current?.click()}>
              Import CSV
            </button>
            <button type="button" className="secondary-button danger-button" onClick={onLock}>
              Lock Editing
            </button>
            <input
              ref={fileInputRef}
              className="hidden-file"
              type="file"
              accept=".csv,text/csv"
              onChange={onImportCsv}
            />
          </>
        ) : (
          <form className="manager-login" onSubmit={onUnlock}>
            <input
              type="password"
              placeholder="Manager password"
              value={managerPasswordInput}
              onChange={(event) => onPasswordChange(event.target.value)}
            />
            <button type="submit" className="secondary-button">
              Unlock Editing
            </button>
          </form>
        )}
      </div>
    </header>
  );
});
