# TaskKit CLI

TaskKit CLI is a lightweight command-line task tracker designed for fast terminal workflows. It uses a single JSON file for persistence, keeps data Git-friendly, and is intended to run on Bun with a non-interactive, flag-based interface.

## Status

This repository currently contains the project brief and workflow configuration for TaskKit CLI. The README documents the intended product scope, command surface, and development workflow described in `PROJECT_BRIEF.md`.

## Goals

- Fast, simple task tracking from the terminal
- Git-friendly JSON storage
- No external database
- Zero external dependencies for core functionality
- Strong automated verification

## Planned Features

### Core task management

- Add tasks with title, optional description, priority, and tags
- List tasks with formatted terminal output
- Mark tasks as done
- Remove tasks by ID

### Filtering and search

- Filter tasks by status
- Filter tasks by priority
- Filter tasks by tag
- Combine filters in a single command
- Search task titles and descriptions

### Data portability

- Export tasks as JSON or CSV
- Import tasks from a file

## Task Model

The planned task shape includes:

- `id`
- `title`
- `description`
- `status` (`todo`, `in-progress`, `done`)
- `priority` (`low`, `normal`, `high`, `urgent`)
- `tags`
- `createdAt`
- `updatedAt`

Data is expected to be stored in a single `tasks.json` file.

## Planned CLI

### Add a task

`taskkit add --title "Write docs" --description "Draft README" --priority high --tags "docs,cli"`

### List tasks

`taskkit list`

Filter examples:

- `taskkit list --status todo`
- `taskkit list --priority high`
- `taskkit list --tag docs`
- `taskkit list --status in-progress --priority high --tag backend`

### Complete a task

`taskkit done <id>`

### Remove a task

`taskkit rm <id>`

### Search tasks

`taskkit search <query>`

### Export tasks

`taskkit export`

Optional format:

`taskkit export --format csv`

### Import tasks

`taskkit import <file>`

## Runtime and Tooling

The project brief specifies the following stack:

- Bun
- TypeScript
- Vitest
- ESLint
- GitHub Actions

## Development Workflow

This repository is configured for devagent-hub watch mode. The current workflow references these verification commands:

- `bun test`
- `bun run typecheck`

## Repository Contents

- `PROJECT_BRIEF.md` — product goals, constraints, and milestones
- `WORKFLOW.md` — automation and verification workflow
- `run-claude.sh` — helper script for the local runner

## Constraints

- Bun runtime
- Non-interactive CLI commands
- Single-file JSON persistence
- No external database

## Milestones

### M1: Foundation

- Project scaffold and CI
- Task model and JSON persistence

### M2: Core CLI

- Add and list commands
- Done and remove commands

### M3: Polish

- Filtering and search
- Import and export
