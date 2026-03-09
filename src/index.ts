const args = process.argv.slice(2);
const command = args[0];

if (!command || command === "--help" || command === "-h") {
  console.log(`taskkit - A lightweight CLI task tracker

Usage:
  taskkit add --title "..." [--description "..."] [--priority low|normal|high|urgent] [--tags "bug,ui"]
  taskkit list [--status todo|in-progress|done] [--priority high] [--tag bug]
  taskkit done <id>
  taskkit rm <id>
  taskkit search <query>

Options:
  -h, --help  Show this help message
`);
  process.exit(0);
}

console.error(`Unknown command: ${command}. Run taskkit --help for usage.`);
process.exit(1);
