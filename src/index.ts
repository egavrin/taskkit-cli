const NAME = "taskkit";
const VERSION = "0.1.0";

export function getVersion(): string {
  return VERSION;
}

export function getName(): string {
  return NAME;
}

export default { getName, getVersion };
