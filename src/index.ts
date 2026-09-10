import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { Command } from "commander";
import { initCommand } from "./commands/init.js";
import { newCommand } from "./commands/new.js";
import { statusCommand } from "./commands/status.js";
import { verifyCommand } from "./commands/verify.js";
import { archiveCommand } from "./commands/archive.js";
import { setupCommand } from "./commands/setup.js";
import { fileExists } from "./utils/fs.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let pkgVersion = "0.2.0";
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
  .version(pkgVersion)
  .action(async () => {
    // Default action if no subcommand is passed: run status if initialized, or show help
    const isInitialized = await fileExists(path.join(process.cwd(), "openspec"));
    if (isInitialized) {
      await statusCommand();
    } else {
      program.outputHelp();
    }
  });

program
  .command("init")
  .description("Initialize OpenSpec directory structure and inject AGENTS.md guidelines")
  .option("--cwd <path>", "Target working directory")
  .action(async (options) => {
    await initCommand({ cwd: options.cwd });
  });

program
  .command("new [change-name]")
  .description("Scaffold a new change workspace with proposal template (interactive if omitted)")
  .option("--cwd <path>", "Target working directory")
  .action(async (changeName, options) => {
    await newCommand(changeName, { cwd: options.cwd });
  });

program
  .command("status")
  .description("Report status of active changes, active phase, and task completion progress")
  .option("--cwd <path>", "Target working directory")
  .action(async (options) => {
    await statusCommand({ cwd: options.cwd });
  });

program
  .command("verify [change-name]")
  .description("Audit presence of all artifacts and 100% completion of task checklist")
  .option("--cwd <path>", "Target working directory")
  .action(async (changeName, options) => {
    await verifyCommand(changeName, { cwd: options.cwd });
  });

program
  .command("archive [change-name]")
  .description("Promote delta specs to living specs and archive completed change workspace")
  .option("--cwd <path>", "Target working directory")
  .option("-f, --force", "Archive even if incomplete tasks remain")
  .option("--no-sync", "Skip promoting delta specs to openspec/specs/")
  .action(async (changeName, options) => {
    await archiveCommand(changeName, {
      cwd: options.cwd,
      force: options.force,
      noSync: options.sync === false,
    });
  });

program
  .command("setup")
  .description("Configure global SDD skills and rules across detected AI environments")
  .option("-a, --all", "Provision all detected environments without interactive prompts")
  .option("-s, --silent", "Run silently without banners")
  .action(async (options) => {
    await setupCommand({ all: options.all, silent: options.silent });
  });

program.parse(process.argv);
