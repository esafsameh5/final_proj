import React from "react";
import { FaCircleExclamation, FaFolderOpen, FaSpinner } from "react-icons/fa6";

function MinistryDataState({
  loading = false,
  error = false,
  isEmpty = false,
  loadingText = "جارٍ تحميل البيانات...",
  errorText = "تعذر تحميل البيانات من الخادم.",
  emptyText = "لا توجد بيانات متاحة حالياً.",
  onRetry,
}) {
  if (loading) {
    return (
      <div className="ministry-state-card">
        <FaSpinner style={{ fontSize: "28px", color: "var(--primary)", animation: "spin 1s linear infinite" }} />
        <p>{loadingText}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ministry-state-card error">
        <FaCircleExclamation style={{ fontSize: "26px", color: "var(--accent-red)" }} />
        <p>{errorText}</p>
        {onRetry ? (
          <button type="button" className="btn" onClick={onRetry}>
            إعادة المحاولة
          </button>
        ) : null}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="ministry-state-card empty">
        <FaFolderOpen style={{ fontSize: "26px", color: "var(--text-muted)" }} />
        <p>{emptyText}</p>
      </div>
    );
  }

  return null;
}

export default MinistryDataState;
