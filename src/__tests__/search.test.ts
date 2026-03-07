import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { unlink } from "node:fs/promises";
import { TaskStore, createTask } from "../store.js";
import { runSearch } from "../commands/search.js";

function makeTmpPath(): string {
  return join(tmpdir(), `taskkit-search-test-${Date.now()}-${Math.random().toString(36).slice(2)}.json`);
}

function makeIO() {
  const out: string[] = [];
  const err: string[] = [];
  const io = {
    stdout: (msg: string) => out.push(msg),
    stderr: (msg: string) => err.push(msg),
    exit: (code: number): never => {
      throw new Error(`process.exit(${code})`);
    },
  };
  return { io, out, err };
}

describe("runSearch", () => {
  let filePath: string;
  let store: TaskStore;

  beforeEach(() => {
    filePath = makeTmpPath();
    store = new TaskStore(filePath);
  });

  afterEach(async () => {
    await unlink(filePath).catch(() => undefined);
  });

  it("exits 1 with error when query is missing", async () => {
    const { io, err } = makeIO();
    await expect(runSearch(undefined, io, store)).rejects.toThrow("process.exit(1)");
    expect(err.some((l) => l.includes("Error"))).toBe(true);
  });

  it("exits 1 with error when query is empty string", async () => {
    const { io, err } = makeIO();
    await expect(runSearch("", io, store)).rejects.toThrow("process.exit(1)");
    expect(err.some((l) => l.includes("Error"))).toBe(true);
  });

  it("exits 1 with error when query is whitespace only", async () => {
    const { io, err } = makeIO();
    await expect(runSearch("   ", io, store)).rejects.toThrow("process.exit(1)");
    expect(err.some((l) => l.includes("Error"))).toBe(true);
  });

  it("prints 'No tasks found.' when no tasks match query", async () => {
    const { io, out } = makeIO();
    await store.add(createTask({ title: "Buy groceries" }));
    await runSearch("deploy", io, store);
    expect(out).toContain("No tasks found.");
  });

  it("matches task by title substring (case-insensitive)", async () => {
    const { io, out } = makeIO();
    await store.add(createTask({ title: "Fix authentication bug" }));
    await store.add(createTask({ title: "Update README" }));
    await runSearch("auth", io, store);
    expect(out.some((l) => l.includes("Fix authentication bug"))).toBe(true);
    expect(out.some((l) => l.includes("Update README"))).toBe(false);
  });

  it("matches title case-insensitively (uppercase query)", async () => {
    const { io, out } = makeIO();
    await store.add(createTask({ title: "deploy to production" }));
    await runSearch("DEPLOY", io, store);
    expect(out.some((l) => l.includes("deploy to production"))).toBe(true);
  });

  it("matches task by description substring", async () => {
    const { io, out } = makeIO();
    await store.add(createTask({ title: "Task A", description: "Handle the payment gateway integration" }));
    await store.add(createTask({ title: "Task B", description: "Update UI components" }));
    await runSearch("payment", io, store);
    expect(out.some((l) => l.includes("Task A"))).toBe(true);
    expect(out.some((l) => l.includes("Task B"))).toBe(false);
  });

  it("matches description case-insensitively", async () => {
    const { io, out } = makeIO();
    await store.add(createTask({ title: "Backend task", description: "Refactor the Database layer" }));
    await runSearch("database", io, store);
    expect(out.some((l) => l.includes("Backend task"))).toBe(true);
  });

  it("does not throw when task has no description", async () => {
    const { io, out } = makeIO();
    // task has no description; query only matches description (not present)
    await store.add(createTask({ title: "Simple task" }));
    await runSearch("xyznotfound", io, store);
    expect(out).toContain("No tasks found.");
  });

  it("returns multiple matching tasks", async () => {
    const { io, out } = makeIO();
    await store.add(createTask({ title: "API endpoint one" }));
    await store.add(createTask({ title: "API endpoint two" }));
    await store.add(createTask({ title: "Unrelated task" }));
    await runSearch("api", io, store);
    expect(out.some((l) => l.includes("API endpoint one"))).toBe(true);
    expect(out.some((l) => l.includes("API endpoint two"))).toBe(true);
    expect(out.some((l) => l.includes("Unrelated task"))).toBe(false);
  });

  it("renders results in table format with header", async () => {
    const { io, out } = makeIO();
    await store.add(createTask({ title: "Search result task" }));
    await runSearch("search result", io, store);
    expect(out[0]).toMatch(/ID/);
    expect(out[0]).toMatch(/STATUS/);
    expect(out[0]).toMatch(/TITLE/);
    expect(out.some((l) => l.includes("Search result task"))).toBe(true);
  });

  it("matches both title and description across different tasks", async () => {
    const { io, out } = makeIO();
    await store.add(createTask({ title: "cache invalidation", description: "some detail" }));
    await store.add(createTask({ title: "other task", description: "about cache busting" }));
    await store.add(createTask({ title: "unrelated", description: "nothing here" }));
    await runSearch("cache", io, store);
    expect(out.some((l) => l.includes("cache invalidation"))).toBe(true);
    expect(out.some((l) => l.includes("other task"))).toBe(true);
    expect(out.some((l) => l.includes("unrelated"))).toBe(false);
  });
});
