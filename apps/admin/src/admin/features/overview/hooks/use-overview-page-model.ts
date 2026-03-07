"use client";

import { useRouter } from "next/navigation";

import { useAdminStore } from "@/admin/shared/store/admin-store";

export function useOverviewPageModel() {
  const router = useRouter();
  const store = useAdminStore();

  return {
    form: store.form,
    selectedMods: store.selectedMods,
    summaryStats: store.summaryStats,
    rail: store.rail,
    goToIdentity: () => store.setView("identity"),
    goToMods: () => router.push("/assets/mods"),
    goToFancy: () => store.setView("fancy"),
  };
}
