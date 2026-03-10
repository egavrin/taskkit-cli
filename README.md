# TaskKit CLI

This workspace currently contains the project brief and workflow configuration for TaskKit CLI.

## Validation run

The workflow defines the validation commands that should be run after implementation:

- `bun test`
- `bun run typecheck`

These commands are configured in `WORKFLOW.md` under `verify.commands` and represent the expected post-change validation pass for implementation tasks.

## Files

- `PROJECT_BRIEF.md` — product scope and milestones
- `WORKFLOW.md` — watch-mode workflow and verification commands
- `run-claude.sh` — runner wrapper
