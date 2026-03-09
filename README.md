# TaskKit CLI

A lightweight CLI task tracker with JSON-file persistence.

## Quickstart

```bash
# Install dependencies
bun install

# Run taskkit
bun run start -- --help

# Add a task
bun run start -- add --title "Fix login bug" --priority high --tags "bug,auth"

# List tasks
bun run start -- list --status todo --priority high

# Mark done
bun run start -- done <id>

# Remove a task
bun run start -- rm <id>
```

## Development

```bash
# Type check
bun run typecheck

# Run tests
bun test

# Lint
bun run lint
```

## Storage

Tasks are stored in `tasks.json` in the current directory. The file is human-readable JSON and git-friendly.
