import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { unlink } from "node:fs/promises";
import { TaskStore, createTask } from "../store.js";
import { runList } from "../commands/list.js";

function makeTmpPath(): string {
  return join(tmpdir(), `taskkit-list-test-${Date.now()}-${Math.random().toString(36).slice(2)}.json`);
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

describe("runList", () => {
  let filePath: string;
  let store: TaskStore;

  beforeEach(() => {
    filePath = makeTmpPath();
    store = new TaskStore(filePath);
  });

  afterEach(async () => {
    await unlink(filePath).catch(() => undefined);
  });

  it("prints 'No tasks found.' when store is empty", async () => {
    const { io, out } = makeIO();
    await runList({}, io, store);
    expect(out).toContain("No tasks found.");
  });

  it("displays tasks in a table with header row", async () => {
    const { io, out } = makeIO();
    const task = createTask({ title: "Fix bug" });
    await store.add(task);
    await runList({}, io, store);
    expect(out[0]).toMatch(/ID/);
    expect(out[0]).toMatch(/STATUS/);
    expect(out[0]).toMatch(/PRIORITY/);
    expect(out[0]).toMatch(/TITLE/);
    expect(out.some((line) => line.includes("Fix bug"))).toBe(true);
  });

  it("shows task ID (truncated), status, priority, and title in rows", async () => {
    const { io, out } = makeIO();
    const task = createTask({ title: "My task", priority: "high" });
    await store.add(task);
    await runList({}, io, store);
    const row = out.find((line) => line.includes("My task"))!;
    expect(row).toBeDefined();
    expect(row).toMatch(/todo/);
    expect(row).toMatch(/high/);
  });

  it("filters by --status", async () => {
    const { io, out } = makeIO();
    const todo = createTask({ title: "Todo task" });
    const done = { ...createTask({ title: "Done task" }), status: "done" as const };
    await store.add(todo);
    await store.add(done);
    await runList({ status: "todo" }, io, store);
    expect(out.some((l) => l.includes("Todo task"))).toBe(true);
    expect(out.some((l) => l.includes("Done task"))).toBe(false);
  });

  it("filters by --priority", async () => {
    const { io, out } = makeIO();
    await store.add(createTask({ title: "High task", priority: "high" }));
    await store.add(createTask({ title: "Low task", priority: "low" }));
    await runList({ priority: "high" }, io, store);
    expect(out.some((l) => l.includes("High task"))).toBe(true);
    expect(out.some((l) => l.includes("Low task"))).toBe(false);
  });

  it("filters by --tag (matches any tag in the array)", async () => {
    const { io, out } = makeIO();
    await store.add(createTask({ title: "Bug task", tags: ["bug", "ui"] }));
    await store.add(createTask({ title: "Feat task", tags: ["feature"] }));
    await runList({ tag: "bug" }, io, store);
    expect(out.some((l) => l.includes("Bug task"))).toBe(true);
    expect(out.some((l) => l.includes("Feat task"))).toBe(false);
  });

  it("shows 'No tasks found.' when filter excludes all tasks", async () => {
    const { io, out } = makeIO();
    await store.add(createTask({ title: "Task" }));
    await runList({ status: "done" }, io, store);
    expect(out).toContain("No tasks found.");
  });

  it("combines multiple filters (status + priority)", async () => {
    const { io, out } = makeIO();
    const t1 = createTask({ title: "Match", priority: "high" });
    const t2 = createTask({ title: "No match priority", priority: "low" });
    const t3 = { ...createTask({ title: "No match status", priority: "high" }), status: "done" as const };
    await store.add(t1);
    await store.add(t2);
    await store.add(t3);
    await runList({ status: "todo", priority: "high" }, io, store);
    expect(out.some((l) => l.includes("Match"))).toBe(true);
    expect(out.some((l) => l.includes("No match priority"))).toBe(false);
    expect(out.some((l) => l.includes("No match status"))).toBe(false);
  });

  it("shows tags in the table row", async () => {
    const { io, out } = makeIO();
    await store.add(createTask({ title: "Tagged", tags: ["bug", "ui"] }));
    await runList({}, io, store);
    const row = out.find((l) => l.includes("Tagged"))!;
    expect(row).toContain("bug");
  });
});
