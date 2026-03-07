import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { unlink } from "node:fs/promises";
import { TaskStore, createTask } from "../store.js";
import { runDone } from "../commands/done.js";

function makeTmpPath(): string {
  return join(tmpdir(), `taskkit-done-test-${Date.now()}-${Math.random().toString(36).slice(2)}.json`);
}

function makeIO() {
  const out: string[] = [];
  const err: string[] = [];
  let exitCode: number | undefined;
  const io = {
    stdout: (msg: string) => out.push(msg),
    stderr: (msg: string) => err.push(msg),
    exit: (code: number): never => {
      exitCode = code;
      throw new Error(`process.exit(${code})`);
    },
  };
  return { io, out, err, getExitCode: () => exitCode };
}

describe("runDone", () => {
  let filePath: string;
  let store: TaskStore;

  beforeEach(() => {
    filePath = makeTmpPath();
    store = new TaskStore(filePath);
  });

  afterEach(async () => {
    await unlink(filePath).catch(() => undefined);
  });

  it("exits 1 with error when id is missing", async () => {
    const { io, err } = makeIO();
    await expect(runDone(undefined, io, store)).rejects.toThrow("process.exit(1)");
    expect(err.some((e) => e.includes("<id> is required"))).toBe(true);
  });

  it("exits 1 with 'Task not found' for unknown id", async () => {
    const { io, err } = makeIO();
    await expect(runDone("nonexistent-id", io, store)).rejects.toThrow("process.exit(1)");
    expect(err.some((e) => e.includes("Task not found"))).toBe(true);
  });

  it("marks task as done and prints confirmation", async () => {
    const task = createTask({ title: "My task" });
    await store.add(task);

    const { io, out } = makeIO();
    await runDone(task.id, io, store);

    expect(out.some((o) => o.includes(`Task ${task.id} marked as done.`))).toBe(true);

    const updated = await store.getById(task.id);
    expect(updated?.status).toBe("done");
  });

  it("does not call exit on success", async () => {
    const task = createTask({ title: "Another task" });
    await store.add(task);

    const { io, getExitCode } = makeIO();
    await runDone(task.id, io, store);

    expect(getExitCode()).toBeUndefined();
  });
});
