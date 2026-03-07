import { readFile, writeFile, rename, unlink } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import type { Task, TaskPriority, TaskStatus } from "./types.js";

export type CreateTaskInput = {
  title: string;
  description?: string;
  priority?: TaskPriority;
  tags?: string[];
};

export type UpdateTaskPatch = {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  tags?: string[];
};

export function createTask(input: CreateTaskInput): Task {
  const now = new Date().toISOString();
  const task: Task = {
    id: randomUUID(),
    title: input.title,
    status: "todo",
    priority: input.priority ?? "normal",
    tags: input.tags ?? [],
    createdAt: now,
    updatedAt: now,
  };
  if (input.description !== undefined) {
    task.description = input.description;
  }
  return task;
}

export class TaskStore {
  private readonly filePath: string;

  constructor(filePath = "tasks.json") {
    this.filePath = filePath;
  }

  async load(): Promise<Task[]> {
    try {
      const raw = await readFile(this.filePath, "utf-8");
      return JSON.parse(raw) as Task[];
    } catch (err) {
      if (isNodeError(err) && err.code === "ENOENT") {
        return [];
      }
      throw err;
    }
  }

  async save(tasks: Task[]): Promise<void> {
    const tmpPath = `${this.filePath}.tmp.${randomUUID()}`;
    await writeFile(tmpPath, JSON.stringify(tasks, null, 2), "utf-8");
    try {
      await rename(tmpPath, this.filePath);
    } catch (err) {
      await unlink(tmpPath).catch(() => undefined);
      throw err;
    }
  }

  async getAll(): Promise<Task[]> {
    return this.load();
  }

  async getById(id: string): Promise<Task | undefined> {
    const tasks = await this.load();
    return tasks.find((t) => t.id === id);
  }

  async add(task: Task): Promise<void> {
    const tasks = await this.load();
    tasks.push(task);
    await this.save(tasks);
  }

  async update(id: string, patch: UpdateTaskPatch): Promise<Task | undefined> {
    const tasks = await this.load();
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) {
      return undefined;
    }
    const existing = tasks[index];
    if (existing === undefined) {
      return undefined;
    }
    const updated: Task = {
      ...existing,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    if (patch.description === undefined && "description" in patch) {
      delete updated.description;
    }
    tasks[index] = updated;
    await this.save(tasks);
    return updated;
  }

  async remove(id: string): Promise<boolean> {
    const tasks = await this.load();
    const filtered = tasks.filter((t) => t.id !== id);
    if (filtered.length === tasks.length) {
      return false;
    }
    await this.save(filtered);
    return true;
  }
}

function isNodeError(err: unknown): err is NodeJS.ErrnoException {
  return err instanceof Error && "code" in err;
}
