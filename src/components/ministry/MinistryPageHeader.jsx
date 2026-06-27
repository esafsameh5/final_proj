import React from "react";
import HeaderUserBadge from "../common/HeaderUserBadge";

function MinistryPageHeader({ title, description, badgeCount = 2 }) {
  return (
    <div className="topbar">
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <HeaderUserBadge name="مدير الوزارة" badgeCount={badgeCount} />
    </div>
  );
}

export default MinistryPageHeader;
