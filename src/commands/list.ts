import { TaskStore } from "../store.js";
import type { Task, TaskPriority, TaskStatus } from "../types.js";
import type { CommandIO } from "./add.js";

const COL_ID = 8;
const COL_STATUS = 11;
const COL_PRIORITY = 9;
const COL_TAGS = 16;
const COL_TITLE = 40;

function pad(str: string, len: number): string {
  if (str.length >= len) return str.slice(0, len - 1) + "…";
  return str.padEnd(len);
}

function renderTable(tasks: Task[], out: (msg: string) => void): void {
  const header =
    pad("ID", COL_ID) +
    " " +
    pad("STATUS", COL_STATUS) +
    " " +
    pad("PRIORITY", COL_PRIORITY) +
    " " +
    pad("TAGS", COL_TAGS) +
    " " +
    "TITLE";
  const divider =
    "-".repeat(COL_ID) +
    " " +
    "-".repeat(COL_STATUS) +
    " " +
    "-".repeat(COL_PRIORITY) +
    " " +
    "-".repeat(COL_TAGS) +
    " " +
    "-".repeat(COL_TITLE);

  out(header);
  out(divider);
  for (const task of tasks) {
    const shortId = task.id.slice(0, COL_ID - 1);
    const row =
      pad(shortId, COL_ID) +
      " " +
      pad(task.status, COL_STATUS) +
      " " +
      pad(task.priority, COL_PRIORITY) +
      " " +
      pad(task.tags.join(","), COL_TAGS) +
      " " +
      pad(task.title, COL_TITLE);
    out(row);
  }
}

export async function runList(
  flags: Record<string, string | boolean>,
  io: CommandIO,
  store?: TaskStore
): Promise<void> {
  const { stdout, stderr: _stderr, exit: _exit } = io;

  const statusFilter =
    typeof flags["status"] === "string"
      ? (flags["status"] as TaskStatus)
      : undefined;
  const priorityFilter =
    typeof flags["priority"] === "string"
      ? (flags["priority"] as TaskPriority)
      : undefined;
  const tagFilter =
    typeof flags["tag"] === "string" ? flags["tag"] : undefined;

  const taskStore = store ?? new TaskStore();
  let tasks = await taskStore.getAll();

  if (statusFilter) {
    tasks = tasks.filter((t) => t.status === statusFilter);
  }
  if (priorityFilter) {
    tasks = tasks.filter((t) => t.priority === priorityFilter);
  }
  if (tagFilter) {
    tasks = tasks.filter((t) => t.tags.includes(tagFilter));
  }

  if (tasks.length === 0) {
    stdout("No tasks found.");
    return;
  }

  renderTable(tasks, stdout);
}
