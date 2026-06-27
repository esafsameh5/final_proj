import React from "react";

function MinistryActionMenu({ isOpen, items, onClose, align = "left" }) {
  if (!isOpen) {
    return null;
  }

  const horizontalPosition = align === "center"
    ? { left: "50%", transform: "translateX(-50%)" }
    : align === "right"
      ? { right: 0 }
      : { left: 0 };

  return (
    <>
      <div
        style={{ position: "fixed", inset: 0, zIndex: 90 }}
        onClick={onClose}
      />
      <div
        className="ministry-action-menu"
        style={{
          position: "absolute",
          top: "42px",
          zIndex: 100,
          width: "210px",
          ...horizontalPosition,
        }}
      >
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => {
              item.onClick();
              onClose();
            }}
            className={`ministry-action-menu-item ${item.tone === "danger" ? "danger" : ""}`}
          >
            <span style={{ display: "inline-flex", fontSize: "13px" }}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}

export default MinistryActionMenu;
