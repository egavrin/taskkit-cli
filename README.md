# TaskKit CLI

A CLI toolkit for managing tasks.

## Prerequisites

- [Bun](https://bun.sh) v1.1 or later

## Installation

```bash
# Clone the repository
git clone <repo-url>
cd taskkit-cli

# Install dependencies
bun install
```

## Quickstart

```bash
# Run tests
bun test

# Run tests with coverage
bun run test:coverage

# Lint source files
bun run lint

# Build for distribution
bun run build

# Run the CLI (after build)
./dist/index.js
```

## Development

```bash
# Watch mode for tests
bun run test:watch
```

## Tech Stack

- **Runtime:** Bun
- **Language:** TypeScript
- **Testing:** Vitest
- **Linting:** ESLint + @typescript-eslint
- **CI:** GitHub Actions
