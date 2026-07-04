"use client";

import { getUser, getOrganization } from "../../../lib/api";

export default function PanelHomePage() {
  const user = getUser();
  const org = getOrganization();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-[var(--color-coffee)]">Hoş geldiniz, {user?.full_name}</h1>
      {org && (
        <div className="border border-gray-200 rounded-lg p-4 text-sm space-y-1">
          <p>
            <span className="text-gray-500">Organizasyon:</span> {org.name}
          </p>
          <p>
            <span className="text-gray-500">Tip:</span> {org.type}
          </p>
          <p>
            <span className="text-gray-500">Üyelik:</span>{" "}
            {org.membership_tier === "PREMIUM" ? "Premium" : "Standart"}
          </p>
        </div>
      )}
    </div>
  );
}
