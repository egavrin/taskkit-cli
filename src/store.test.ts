import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { TaskStore } from "./store.js";

let tmpDir: string;
let storePath: string;
let store: TaskStore;

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), "taskkit-test-"));
  storePath = join(tmpDir, "tasks.json");
  store = new TaskStore(storePath);
});

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

describe("TaskStore.add", () => {
  it("creates a task with required fields", () => {
    const task = store.add({ title: "Write tests" });
    expect(task.id).toBeTruthy();
    expect(task.title).toBe("Write tests");
    expect(task.status).toBe("todo");
    expect(task.priority).toBe("normal");
    expect(task.tags).toEqual([]);
    expect(task.createdAt).toBeTruthy();
    expect(task.updatedAt).toBeTruthy();
  });

  it("respects optional fields", () => {
    const task = store.add({
      title: "Fix bug",
      description: "Critical one",
      priority: "urgent",
      tags: ["bug", "ui"],
    });
    expect(task.description).toBe("Critical one");
    expect(task.priority).toBe("urgent");
    expect(task.tags).toEqual(["bug", "ui"]);
  });

  it("persists tasks across instances", () => {
    store.add({ title: "Task A" });
    const store2 = new TaskStore(storePath);
    const tasks = store2.list();
    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe("Task A");
  });
});

describe("TaskStore.list", () => {
  beforeEach(() => {
    store.add({ title: "Todo task", priority: "high" });
    store.add({ title: "Done task", priority: "low", tags: ["done"] });
  });

  it("returns all tasks by default", () => {
    expect(store.list()).toHaveLength(2);
  });

  it("filters by status", () => {
    const id = store.list()[1].id;
    store.update(id, { status: "done" });
    expect(store.list({ status: "done" })).toHaveLength(1);
    expect(store.list({ status: "todo" })).toHaveLength(1);
  });

  it("filters by priority", () => {
    expect(store.list({ priority: "high" })).toHaveLength(1);
    expect(store.list({ priority: "low" })).toHaveLength(1);
    expect(store.list({ priority: "urgent" })).toHaveLength(0);
  });

  it("filters by tag", () => {
    expect(store.list({ tag: "done" })).toHaveLength(1);
    expect(store.list({ tag: "missing" })).toHaveLength(0);
  });
});

describe("TaskStore.getById", () => {
  it("returns the matching task", () => {
    const added = store.add({ title: "Find me" });
    const found = store.getById(added.id);
    expect(found).toBeDefined();
    expect(found!.title).toBe("Find me");
  });

  it("returns undefined for unknown id", () => {
    expect(store.getById("nonexistent")).toBeUndefined();
  });
});

describe("TaskStore.update", () => {
  it("updates task fields", () => {
    const task = store.add({ title: "Old title" });
    const updated = store.update(task.id, { title: "New title", status: "done" });
    expect(updated.title).toBe("New title");
    expect(updated.status).toBe("done");
  });

  it("throws for unknown id", () => {
    expect(() => store.update("bad-id", { title: "x" })).toThrow();
  });
});

describe("TaskStore.remove", () => {
  it("removes an existing task", () => {
    const task = store.add({ title: "Delete me" });
    store.remove(task.id);
    expect(store.list()).toHaveLength(0);
  });

  it("throws for unknown id", () => {
    expect(() => store.remove("bad-id")).toThrow();
  });
});
