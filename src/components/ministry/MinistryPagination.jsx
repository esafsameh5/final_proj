import React from "react";

function MinistryPagination({ page, totalPages, totalCount, currentCount, label = "سجل", onChange }) {
  if (totalCount === 0) {
    return null;
  }

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", fontSize: "13px", color: "var(--text-muted)", flexWrap: "wrap", gap: "10px" }}>
      <div>عرض {currentCount} من {totalCount} {label}</div>
      <div style={{ display: "flex", gap: "6px" }}>
        <button
          type="button"
          className="btn btn-secondary"
          style={{ padding: "6px 12px", fontSize: "12px" }}
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          السابق
        </button>
        <button type="button" className="btn" style={{ padding: "6px 12px", fontSize: "12px", minWidth: "36px" }}>
          {page}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          style={{ padding: "6px 12px", fontSize: "12px" }}
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
        >
          التالي
        </button>
      </div>
    </div>
  );
}

export default MinistryPagination;
