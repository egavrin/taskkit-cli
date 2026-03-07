import { TaskStore } from "../store.js";
import type { CommandIO } from "./add.js";
import { renderTable } from "./list.js";

export async function runSearch(
  query: string | undefined,
  io: CommandIO,
  store?: TaskStore
): Promise<void> {
  const { stdout, stderr, exit } = io;

  if (!query || query.trim() === "") {
    stderr("Error: search requires a query string");
    stderr("Usage: taskkit search <query>");
    exit(1);
    return;
  }

  const lower = query.toLowerCase();
  const taskStore = store ?? new TaskStore();
  const all = await taskStore.getAll();
  const results = all.filter(
    (t) =>
      t.title.toLowerCase().includes(lower) ||
      (t.description ?? "").toLowerCase().includes(lower)
  );

  if (results.length === 0) {
    stdout("No tasks found.");
    return;
  }

  renderTable(results, stdout);
}
