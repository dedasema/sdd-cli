import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { Command } from "commander";
import { initCommand } from "./commands/init.js";
import { newCommand } from "./commands/new.js";
import { statusCommand } from "./commands/status.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let pkgVersion = "0.1.3";
try {
  const pkgPath = path.resolve(__dirname, "../package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  if (pkg.version) {
    pkgVersion = pkg.version;
  }
} catch {
  // fallback to default
}

const program = new Command();

program
  .name("sdd")
  .description("Agnostic CLI for Spec-Driven Development with AI agents")
  .version(pkgVersion);

program
  .command("init")
  .description("Initialize OpenSpec directory structure and inject AGENTS.md guidelines")
  .option("--cwd <path>", "Target working directory")
  .action(async (options) => {
    await initCommand({ cwd: options.cwd });
  });

program
  .command("new <change-name>")
  .description("Scaffold a new change workspace with proposal, spec, design, and tasks templates")
  .option("--cwd <path>", "Target working directory")
  .action(async (changeName, options) => {
    await newCommand(changeName, { cwd: options.cwd });
  });

program
  .command("status")
  .description("Report status of active changes and task completion progress")
  .option("--cwd <path>", "Target working directory")
  .action(async (options) => {
    await statusCommand({ cwd: options.cwd });
  });

program.parse(process.argv);
