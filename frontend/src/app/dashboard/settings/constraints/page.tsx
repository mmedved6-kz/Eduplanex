"use client";

import  ConstraintsSettingsPage from "@/app/components/ConstraintsSettingsPage";
import RequireAuth from "@/app/components/RequireAuth";

export default function ConstraintsSettingsRoute() {
  return (
    <RequireAuth allowedRoles={["admin"]}>
      <ConstraintsSettingsPage />
    </RequireAuth>
  );
}