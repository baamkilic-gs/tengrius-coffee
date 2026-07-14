"use client";

import { getUser, getOrganization } from "../../../lib/api";

export default function PanelHomePage() {
  const user = getUser();
  const org = getOrganization();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-[var(--color-coffee)]">Hoş geldiniz, {user?.full_name}</h1>
      {org && (
        <div className="card text-sm space-y-1">
          <p>
            <span className="text-[var(--text-tertiary)]">Organizasyon:</span> {org.name}
          </p>
          <p>
            <span className="text-[var(--text-tertiary)]">Tip:</span> {org.type}
          </p>
          <p>
            <span className="text-[var(--text-tertiary)]">Üyelik:</span>{" "}
            {org.membership_tier === "PREMIUM" ? "Premium" : "Standart"}
          </p>
        </div>
      )}
    </div>
  );
}
