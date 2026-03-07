import { TaskStore } from "../store.js";
import type { CommandIO } from "./add.js";

export async function runDone(
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
  const updated = await taskStore.update(id, { status: "done" });

  if (!updated) {
    stderr(`Task not found: ${id}`);
    exit(1);
    return;
  }

  stdout(`Task ${id} marked as done.`);
}
