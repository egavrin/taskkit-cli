import { describe, it, expect } from "vitest";
import taskkitDefault, { getName, getVersion } from "./index.js";

describe("taskkit entry point", () => {
  it("exports a truthy default export", () => {
    expect(taskkitDefault).toBeTruthy();
  });

  it("getName returns the CLI name", () => {
    expect(getName()).toBe("taskkit");
  });

  it("getVersion returns a semver string", () => {
    expect(getVersion()).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("default export contains getName and getVersion", () => {
    expect(typeof taskkitDefault.getName).toBe("function");
    expect(typeof taskkitDefault.getVersion).toBe("function");
  });
});
