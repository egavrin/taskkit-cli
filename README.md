# TaskKit CLI

Lightweight terminal task tracker with JSON-file persistence.

## Quickstart

1. Install dependencies:
   `bun install`
2. Add a task:
   `bun run src/cli.ts add --title "Write docs" --priority high --tags "docs,cli"`
3. List tasks:
   `bun run src/cli.ts list`
4. Mark done:
   `bun run src/cli.ts done <id>`
5. Remove:
   `bun run src/cli.ts rm <id>`

By default, tasks are stored in `tasks.json` in the current working directory.
