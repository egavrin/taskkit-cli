---
version: 1
mode: watch

runner:
  bin: claude
  approval_mode: full-auto
  max_iterations: 40

profiles:
  default:
    bin: claude
    model: sonnet

roles:
  triage: default
  plan: default
  implement: default
  verify: default
  review: default
  repair: default

verify:
  commands:
    - bun test
    - bun run typecheck

repair:
  max_rounds: 2

budget:
  stage_wall_time_minutes: 30
  run_wall_time_minutes: 45
  run_max_cost_usd: 5
  run_max_iterations: 40
  run_max_changed_files: 30
  repo_max_cost_usd: 25
  session_max_cost_usd: 40
  max_unresolved_escalations: 3
---

# TaskKit CLI Workflow

This project is managed by devagent-hub with automated watch-mode gates.
