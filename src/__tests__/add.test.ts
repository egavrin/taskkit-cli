import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { unlink } from "node:fs/promises";
import { TaskStore } from "../store.js";
import { runAdd } from "../commands/add.js";

function makeTmpPath(): string {
  return join(tmpdir(), `taskkit-add-test-${Date.now()}-${Math.random().toString(36).slice(2)}.json`);
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

describe("runAdd", () => {
  let filePath: string;
  let store: TaskStore;

  beforeEach(() => {
    filePath = makeTmpPath();
    store = new TaskStore(filePath);
  });

  afterEach(async () => {
    await unlink(filePath).catch(() => undefined);
  });

  it("exits 1 with error when --title is missing", async () => {
    const { io, err } = makeIO();
    await expect(runAdd({}, io, store)).rejects.toThrow("process.exit(1)");
    expect(err.some((e) => e.includes("--title is required"))).toBe(true);
  });

  it("exits 1 when --title is empty string", async () => {
    const { io, err } = makeIO();
    await expect(runAdd({ title: "  " }, io, store)).rejects.toThrow("process.exit(1)");
    expect(err.some((e) => e.includes("--title is required"))).toBe(true);
  });

  it("creates and persists a task with required flag", async () => {
    const { io, out } = makeIO();
    await runAdd({ title: "My task" }, io, store);
    expect(out.some((o) => o.includes("Task added:"))).toBe(true);
    expect(out.some((o) => o.includes("My task"))).toBe(true);

    const tasks = await store.getAll();
    expect(tasks).toHaveLength(1);
    expect(tasks[0]!.title).toBe("My task");
  });

  it("defaults priority to 'normal'", async () => {
    const { io } = makeIO();
    await runAdd({ title: "Task" }, io, store);
    const tasks = await store.getAll();
    expect(tasks[0]!.priority).toBe("normal");
  });

  it("sets priority from --priority flag", async () => {
    const { io } = makeIO();
    await runAdd({ title: "Task", priority: "high" }, io, store);
    const tasks = await store.getAll();
    expect(tasks[0]!.priority).toBe("high");
  });

  it("exits 1 for invalid --priority", async () => {
    const { io, err } = makeIO();
    await expect(runAdd({ title: "Task", priority: "critical" }, io, store)).rejects.toThrow("process.exit(1)");
    expect(err.some((e) => e.includes("invalid --priority"))).toBe(true);
  });

  it("parses comma-separated --tags", async () => {
    const { io } = makeIO();
    await runAdd({ title: "Task", tags: "bug,ui,auth" }, io, store);
    const tasks = await store.getAll();
    expect(tasks[0]!.tags).toEqual(["bug", "ui", "auth"]);
  });

  it("trims whitespace from tags", async () => {
    const { io } = makeIO();
    await runAdd({ title: "Task", tags: "bug, ui , auth" }, io, store);
    const tasks = await store.getAll();
    expect(tasks[0]!.tags).toEqual(["bug", "ui", "auth"]);
  });

  it("sets empty tags when --tags is not provided", async () => {
    const { io } = makeIO();
    await runAdd({ title: "Task" }, io, store);
    const tasks = await store.getAll();
    expect(tasks[0]!.tags).toEqual([]);
  });

  it("sets description when provided", async () => {
    const { io } = makeIO();
    await runAdd({ title: "Task", description: "A description" }, io, store);
    const tasks = await store.getAll();
    expect(tasks[0]!.description).toBe("A description");
  });
});
