#!/usr/bin/env bun
import { runAdd } from "./commands/add.js";
import { runList } from "./commands/list.js";

export interface ParsedArgs {
  command: string | undefined;
  flags: Record<string, string | boolean>;
  positional: string[];
}

export function parseArgs(argv: string[]): ParsedArgs {
  // argv = process.argv.slice(2)
  const flags: Record<string, string | boolean> = {};
  const positional: string[] = [];
  let command: string | undefined;

  let i = 0;
  while (i < argv.length) {
    const arg = argv[i]!;
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith("--")) {
        flags[key] = next;
        i += 2;
      } else {
        flags[key] = true;
        i += 1;
      }
    } else {
      positional.push(arg);
      i += 1;
    }
  }

  command = positional[0];
  return { command, flags, positional: positional.slice(1) };
}

function printUsage(out: (msg: string) => void): void {
  out("Usage: taskkit <command> [options]");
  out("");
  out("Commands:");
  out("  add    Add a new task");
  out("  list   List tasks");
  out("");
  out("Options for add:");
  out("  --title       Task title (required)");
  out("  --description Task description");
  out("  --priority    Priority: low | normal | high | urgent");
  out("  --tags        Comma-separated tags (e.g. bug,ui)");
  out("");
  out("Options for list:");
  out("  --status    Filter by status: todo | in-progress | done");
  out("  --priority  Filter by priority: low | normal | high | urgent");
  out("  --tag       Filter by tag");
}

export async function runCLI(
  argv: string[],
  options: {
    stdout?: (msg: string) => void;
    stderr?: (msg: string) => void;
    exit?: (code: number) => never;
  } = {}
): Promise<void> {
  const stdout = options.stdout ?? ((msg) => console.log(msg));
  const stderr = options.stderr ?? ((msg) => console.error(msg));
  const exit = options.exit ?? ((code) => process.exit(code));

  const { command, flags } = parseArgs(argv);

  if (!command) {
    printUsage(stderr);
    exit(1);
    return;
  }

  switch (command) {
    case "add":
      await runAdd(flags, { stdout, stderr, exit });
      break;
    case "list":
      await runList(flags, { stdout, stderr, exit });
      break;
    default:
      stderr(`Unknown command: ${command}`);
      stderr("");
      printUsage(stderr);
      exit(1);
  }
}

// Only run when executed directly (not imported)
if (import.meta.main) {
  await runCLI(process.argv.slice(2));
}
