import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAssetsPageModel } from "./use-assets-page-model";

const { pushMock, requestJsonMock, useAdminStoreMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  requestJsonMock: vi.fn(),
  useAdminStoreMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/admin/client/http", () => ({
  requestJson: requestJsonMock,
}));

vi.mock("@/admin/shared/store/admin-store", () => ({
  useAdminStore: useAdminStoreMock,
}));

describe("useAssetsPageModel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAdminStoreMock.mockReturnValue({
      form: { minecraftVersion: "1.20.1" },
      statuses: { mods: { text: "", tone: "idle" } },
      selectedMods: [],
      selectedResources: [],
      selectedShaders: [],
      setSelectedResources: vi.fn(),
      setSelectedShaders: vi.fn(),
      setStatus: vi.fn(),
    });
  });

  it("loads popular assets from admin API and avoids direct browser fetch", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    requestJsonMock.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useAssetsPageModel());

    await act(async () => {
      result.current.openPopularModal("resourcepack");
    });

    expect(requestJsonMock).toHaveBeenCalledWith(
      "/v1/admin/assets/popular?minecraftVersion=1.20.1&type=resourcepack&limit=12",
      "GET",
    );
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
