import { describe, it, expect } from "vitest";
import { createTask } from "../store.js";

describe("createTask factory", () => {
  it("sets required fields from input", () => {
    const task = createTask({ title: "My task" });
    expect(task.id).toBeTypeOf("string");
    expect(task.id.length).toBeGreaterThan(0);
    expect(task.title).toBe("My task");
  });

  it("defaults status to todo", () => {
    const task = createTask({ title: "test" });
    expect(task.status).toBe("todo");
  });

  it("defaults priority to normal", () => {
    const task = createTask({ title: "test" });
    expect(task.priority).toBe("normal");
  });

  it("defaults tags to empty array", () => {
    const task = createTask({ title: "test" });
    expect(task.tags).toEqual([]);
  });

  it("sets provided priority", () => {
    const task = createTask({ title: "test", priority: "urgent" });
    expect(task.priority).toBe("urgent");
  });

  it("sets provided tags", () => {
    const task = createTask({ title: "test", tags: ["bug", "ui"] });
    expect(task.tags).toEqual(["bug", "ui"]);
  });

  it("sets description when provided", () => {
    const task = createTask({ title: "test", description: "details" });
    expect(task.description).toBe("details");
  });

  it("omits description when not provided", () => {
    const task = createTask({ title: "test" });
    expect("description" in task).toBe(false);
  });

  it("sets createdAt as valid ISO string", () => {
    const task = createTask({ title: "test" });
    expect(() => new Date(task.createdAt)).not.toThrow();
    expect(new Date(task.createdAt).toISOString()).toBe(task.createdAt);
  });

  it("sets updatedAt as valid ISO string equal to createdAt", () => {
    const task = createTask({ title: "test" });
    expect(task.updatedAt).toBe(task.createdAt);
  });

  it("generates unique ids for each task", () => {
    const a = createTask({ title: "a" });
    const b = createTask({ title: "b" });
    expect(a.id).not.toBe(b.id);
  });

  it("id is a valid UUID format", () => {
    const task = createTask({ title: "test" });
    expect(task.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    );
  });
});
