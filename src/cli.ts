#!/usr/bin/env bun
import { TaskStore } from './store';
import type { ListTaskFilters, TaskPriority, TaskStatus } from './types';

const VALID_STATUSES: TaskStatus[] = ['todo', 'in-progress', 'done'];
const VALID_PRIORITIES: TaskPriority[] = ['low', 'normal', 'high', 'urgent'];

function parseArgs(argv: string[]): { command?: string; positionals: string[]; options: Record<string, string> } {
  const [command, ...rest] = argv;
  const positionals: string[] = [];
  const options: Record<string, string> = {};

  for (let index = 0; index < rest.length; index += 1) {
    const value = rest[index];
    if (value.startsWith('--')) {
      const key = value.slice(2);
      const next = rest[index + 1];
      if (!next || next.startsWith('--')) {
        throw new Error(`Missing value for --${key}`);
      }
      options[key] = next;
      index += 1;
      continue;
    }
    positionals.push(value);
  }

  return { command, positionals, options };
}

function assertStatus(status?: string): TaskStatus | undefined {
  if (!status) {
    return undefined;
  }
  if (!VALID_STATUSES.includes(status as TaskStatus)) {
    throw new Error(`Invalid status: ${status}`);
  }
  return status as TaskStatus;
}

function assertPriority(priority?: string): TaskPriority | undefined {
  if (!priority) {
    return undefined;
  }
  if (!VALID_PRIORITIES.includes(priority as TaskPriority)) {
    throw new Error(`Invalid priority: ${priority}`);
  }
  return priority as TaskPriority;
}

function parseTags(value?: string): string[] {
  if (!value) {
    return [];
  }
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function formatTable(rows: string[][]): string {
  if (rows.length === 0) {
    return 'No tasks found.';
  }

  const widths = rows[0].map((_, column) => Math.max(...rows.map((row) => row[column].length)));
  return rows
    .map((row, index) => {
      const line = row.map((cell, column) => cell.padEnd(widths[column])).join('  ');
      if (index === 0) {
        const divider = widths.map((width) => '-'.repeat(width)).join('  ');
        return `${line}\n${divider}`;
      }
      return line;
    })
    .join('\n');
}

async function main(): Promise<void> {
  const { command, positionals, options } = parseArgs(process.argv.slice(2));
  const store = new TaskStore();

  switch (command) {
    case 'add': {
      const title = options.title?.trim();
      if (!title) {
        throw new Error('Missing required option --title');
      }
      const task = await store.add({
        title,
        description: options.description,
        priority: assertPriority(options.priority),
        tags: parseTags(options.tags),
      });
      console.log(`Added task ${task.id}: ${task.title}`);
      return;
    }
    case 'list': {
      const filters: ListTaskFilters = {
        status: assertStatus(options.status),
        priority: assertPriority(options.priority),
        tag: options.tag,
      };
      const tasks = await store.list(filters);
      const rows = [
        ['ID', 'Title', 'Status', 'Priority', 'Tags'],
        ...tasks.map((task) => [task.id, task.title, task.status, task.priority, task.tags.join(',') || '-']),
      ];
      console.log(formatTable(rows));
      return;
    }
    case 'done': {
      const id = positionals[0];
      if (!id) {
        throw new Error('Missing task id');
      }
      const task = await store.markDone(id);
      console.log(`Completed task ${task.id}: ${task.title}`);
      return;
    }
    case 'rm': {
      const id = positionals[0];
      if (!id) {
        throw new Error('Missing task id');
      }
      const task = await store.remove(id);
      console.log(`Removed task ${task.id}: ${task.title}`);
      return;
    }
    default:
      console.log('Usage: taskkit <add|list|done|rm> [options]');
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(message);
  process.exitCode = 1;
});
