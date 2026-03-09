import { mkdir, readFile, rename, stat, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { AddTaskInput, ListTaskFilters, Task } from './types';

const DEFAULT_PATH = 'tasks.json';

export class TaskStore {
  constructor(private readonly filePath = DEFAULT_PATH) {}

  async list(filters: ListTaskFilters = {}): Promise<Task[]> {
    const tasks = await this.readTasks();
    return tasks.filter((task) => {
      if (filters.status && task.status !== filters.status) {
        return false;
      }
      if (filters.priority && task.priority !== filters.priority) {
        return false;
      }
      if (filters.tag && !task.tags.includes(filters.tag)) {
        return false;
      }
      return true;
    });
  }

  async add(input: AddTaskInput): Promise<Task> {
    const tasks = await this.readTasks();
    const timestamp = new Date().toISOString();
    const task: Task = {
      id: crypto.randomUUID(),
      title: input.title.trim(),
      description: input.description?.trim() ?? '',
      status: 'todo',
      priority: input.priority ?? 'normal',
      tags: input.tags ?? [],
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    tasks.push(task);
    await this.writeTasks(tasks);
    return task;
  }

  async markDone(id: string): Promise<Task> {
    const tasks = await this.readTasks();
    const task = tasks.find((entry) => entry.id === id);
    if (!task) {
      throw new Error(`Task not found: ${id}`);
    }
    task.status = 'done';
    task.updatedAt = new Date().toISOString();
    await this.writeTasks(tasks);
    return task;
  }

  async remove(id: string): Promise<Task> {
    const tasks = await this.readTasks();
    const index = tasks.findIndex((entry) => entry.id === id);
    if (index === -1) {
      throw new Error(`Task not found: ${id}`);
    }
    const [removed] = tasks.splice(index, 1);
    await this.writeTasks(tasks);
    return removed;
  }

  private async readTasks(): Promise<Task[]> {
    try {
      await stat(this.filePath);
    } catch {
      return [];
    }

    const content = await readFile(this.filePath, 'utf8');
    const parsed = JSON.parse(content) as unknown;
    if (!Array.isArray(parsed)) {
      throw new Error(`Invalid task data in ${this.filePath}`);
    }
    return parsed as Task[];
  }

  private async writeTasks(tasks: Task[]): Promise<void> {
    const dir = dirname(this.filePath);
    if (dir !== '.') {
      await mkdir(dir, { recursive: true });
    }
    const tempPath = `${this.filePath}.tmp`;
    await writeFile(tempPath, `${JSON.stringify(tasks, null, 2)}\n`, 'utf8');
    await rename(tempPath, this.filePath);
  }
}
