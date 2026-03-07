import { TaskStore } from "../store.js";
import type { CommandIO } from "./add.js";

export async function runRm(
  id: string | undefined,
  io: CommandIO,
  store?: TaskStore
): Promise<void> {
  const { stdout, stderr, exit } = io;

  if (!id) {
    stderr("Error: <id> is required");
    exit(1);
    return;
  }

  const taskStore = store ?? new TaskStore();
  const removed = await taskStore.remove(id);

  if (!removed) {
    stderr(`Task not found: ${id}`);
    exit(1);
    return;
  }

  stdout(`Task ${id} removed.`);
}
