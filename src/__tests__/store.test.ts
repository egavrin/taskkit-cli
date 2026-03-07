import { describe, it, expect, beforeEach } from "vitest";
import { randomUUID } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { writeFile, readFile } from "node:fs/promises";
import { TaskStore, createTask } from "../store.js";

function tempPath(): string {
  return join(tmpdir(), `taskkit-test-${randomUUID()}.json`);
}

describe("TaskStore", () => {
  let storePath: string;
  let store: TaskStore;

  beforeEach(() => {
    storePath = tempPath();
    store = new TaskStore(storePath);
  });

  it("load returns empty array when file does not exist", async () => {
    const tasks = await store.load();
    expect(tasks).toEqual([]);
  });

  it("add persists a task to disk", async () => {
    const task = createTask({ title: "First task" });
    await store.add(task);

    const raw = await readFile(storePath, "utf-8");
    const parsed = JSON.parse(raw) as unknown[];
    expect(parsed).toHaveLength(1);
    expect((parsed[0] as { id: string }).id).toBe(task.id);
  });

  it("getAll returns all tasks", async () => {
    const t1 = createTask({ title: "Task 1" });
    const t2 = createTask({ title: "Task 2" });
    await store.add(t1);
    await store.add(t2);

    const all = await store.getAll();
    expect(all).toHaveLength(2);
  });

  it("getById returns the correct task", async () => {
    const t1 = createTask({ title: "Alpha" });
    const t2 = createTask({ title: "Beta" });
    await store.add(t1);
    await store.add(t2);

    const found = await store.getById(t1.id);
    expect(found?.title).toBe("Alpha");
  });

  it("getById returns undefined for unknown id", async () => {
    const result = await store.getById("nonexistent");
    expect(result).toBeUndefined();
  });

  it("update merges patch fields", async () => {
    const task = createTask({ title: "Original" });
    await store.add(task);

    const updated = await store.update(task.id, { title: "Updated", status: "done" });
    expect(updated?.title).toBe("Updated");
    expect(updated?.status).toBe("done");
    expect(updated?.priority).toBe(task.priority);
  });

  it("update bumps updatedAt", async () => {
    const task = createTask({ title: "test" });
    await store.add(task);

    await new Promise((resolve) => setTimeout(resolve, 5));
    const updated = await store.update(task.id, { status: "in-progress" });
    expect(updated?.updatedAt).not.toBe(task.updatedAt);
    expect(new Date(updated!.updatedAt) > new Date(task.updatedAt)).toBe(true);
  });

  it("update returns undefined for unknown id", async () => {
    const result = await store.update("unknown", { title: "x" });
    expect(result).toBeUndefined();
  });

  it("remove deletes a task and returns true", async () => {
    const task = createTask({ title: "To remove" });
    await store.add(task);

    const removed = await store.remove(task.id);
    expect(removed).toBe(true);

    const all = await store.getAll();
    expect(all).toHaveLength(0);
  });

  it("remove returns false for unknown id", async () => {
    const result = await store.remove("nonexistent");
    expect(result).toBe(false);
  });

  it("corrupted JSON throws an error", async () => {
    await writeFile(storePath, "not valid json {{", "utf-8");
    await expect(store.load()).rejects.toThrow();
  });

  it("written file is valid JSON parseable independently", async () => {
    const task = createTask({ title: "Persistent" });
    await store.add(task);

    const raw = await readFile(storePath, "utf-8");
    expect(() => JSON.parse(raw)).not.toThrow();
  });

  it("atomic write: original data survives if tmp is abandoned", async () => {
    const task = createTask({ title: "Safe data" });
    await store.add(task);

    const before = await store.load();
    expect(before).toHaveLength(1);

    // Write a tmp file with bad content but don't rename — original remains intact
    const badTmp = `${storePath}.tmp.${randomUUID()}`;
    await writeFile(badTmp, "corrupted json {{{", "utf-8");
    const after = await store.load();
    expect(after).toHaveLength(1);
    expect(after[0]?.title).toBe("Safe data");
  });
});
