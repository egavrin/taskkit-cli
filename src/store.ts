import { readFileSync, writeFileSync, existsSync, renameSync } from "fs";
import { randomUUID } from "crypto";
import type { Task, TaskStatus, TaskPriority } from "./task.js";

export interface AddTaskOptions {
  title: string;
  description?: string;
  priority?: TaskPriority;
  tags?: string[];
}

export interface ListTaskOptions {
  status?: TaskStatus;
  priority?: TaskPriority;
  tag?: string;
}

export class TaskStore {
  private filePath: string;

  constructor(filePath: string = "tasks.json") {
    this.filePath = filePath;
  }

  private read(): Task[] {
    if (!existsSync(this.filePath)) {
      return [];
    }
    const content = readFileSync(this.filePath, "utf-8");
    return JSON.parse(content) as Task[];
  }

  private write(tasks: Task[]): void {
    const tmp = this.filePath + ".tmp";
    writeFileSync(tmp, JSON.stringify(tasks, null, 2), "utf-8");
    renameSync(tmp, this.filePath);
  }

  add(options: AddTaskOptions): Task {
    const tasks = this.read();
    const now = new Date().toISOString();
    const task: Task = {
      id: randomUUID(),
      title: options.title,
      description: options.description,
      status: "todo",
      priority: options.priority ?? "normal",
      tags: options.tags ?? [],
      createdAt: now,
      updatedAt: now,
    };
    tasks.push(task);
    this.write(tasks);
    return task;
  }

  list(options: ListTaskOptions = {}): Task[] {
    let tasks = this.read();
    if (options.status) {
      tasks = tasks.filter((t) => t.status === options.status);
    }
    if (options.priority) {
      tasks = tasks.filter((t) => t.priority === options.priority);
    }
    if (options.tag) {
      tasks = tasks.filter((t) => t.tags.includes(options.tag!));
    }
    return tasks;
  }

  getById(id: string): Task | undefined {
    return this.read().find((t) => t.id === id);
  }

  update(id: string, changes: Partial<Omit<Task, "id" | "createdAt">>): Task {
    const tasks = this.read();
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) {
      throw new Error(`Task ${id} not found`);
    }
    tasks[idx] = { ...tasks[idx], ...changes, updatedAt: new Date().toISOString() };
    this.write(tasks);
    return tasks[idx];
  }

  remove(id: string): void {
    const tasks = this.read();
    const filtered = tasks.filter((t) => t.id !== id);
    if (filtered.length === tasks.length) {
      throw new Error(`Task ${id} not found`);
    }
    this.write(filtered);
  }
}
