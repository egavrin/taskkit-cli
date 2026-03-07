import { TaskStore, createTask } from "../store.js";
import type { TaskPriority } from "../types.js";

export interface CommandIO {
  stdout: (msg: string) => void;
  stderr: (msg: string) => void;
  exit: (code: number) => never;
}

const VALID_PRIORITIES: TaskPriority[] = ["low", "normal", "high", "urgent"];

export async function runAdd(
  flags: Record<string, string | boolean>,
  io: CommandIO,
  store?: TaskStore
): Promise<void> {
  const { stdout, stderr, exit } = io;

  const title = typeof flags["title"] === "string" ? flags["title"].trim() : "";
  if (!title) {
    stderr("Error: --title is required");
    exit(1);
    return;
  }

  const description =
    typeof flags["description"] === "string" ? flags["description"] : undefined;

  let priority: TaskPriority = "normal";
  if (typeof flags["priority"] === "string") {
    const p = flags["priority"] as TaskPriority;
    if (!VALID_PRIORITIES.includes(p)) {
      stderr(
        `Error: invalid --priority "${flags["priority"]}". Must be one of: ${VALID_PRIORITIES.join(", ")}`
      );
      exit(1);
      return;
    }
    priority = p;
  }

  let tags: string[] = [];
  if (typeof flags["tags"] === "string" && flags["tags"].trim() !== "") {
    tags = flags["tags"]
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
  }

  const task = createTask({
    title,
    ...(description !== undefined ? { description } : {}),
    priority,
    tags,
  });
  const taskStore = store ?? new TaskStore();
  await taskStore.add(task);

  stdout(`Task added: ${task.id} – ${task.title}`);
}
