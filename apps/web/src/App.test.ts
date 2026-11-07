import { describe, it, expect, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import App from "./App.vue";
import { api } from "./api";

vi.mock("./api", () => ({
  api: { get: vi.fn(), post: vi.fn() },
}));

// Setup smoke test: proves the frontend test infrastructure works.
describe("App starter screen", () => {
  it("shows the API as connected when the health check succeeds", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ status: "ok", timestamp: "now" });
    const wrapper = mount(App);
    await flushPromises();
    expect(wrapper.text()).toContain("API: connected");
  });

  it("shows the API as unreachable when the health check fails", async () => {
    vi.mocked(api.get).mockRejectedValueOnce(new Error("down"));
    const wrapper = mount(App);
    await flushPromises();
    expect(wrapper.text()).toContain("API: unreachable");
  });
});
