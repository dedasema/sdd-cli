import { promises as fs } from "node:fs";
import path from "node:path";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { ensureDir, fileExists, parseTasksProgress, writeFileSafe } from "../utils/fs.js";

export interface ArchiveOptions {
  cwd?: string;
  silent?: boolean;
  force?: boolean;
  noSync?: boolean;
}

export interface ArchiveResult {
  success: boolean;
  changeName: string;
  archivePath?: string;
  livingSpecPath?: string;
  message: string;
}

export async function archiveCommand(
  changeName?: string,
  options: ArchiveOptions = {}
): Promise<ArchiveResult> {
  const cwd = options.cwd ? path.resolve(options.cwd) : process.cwd();

  if (!options.silent) {
    p.intro(pc.bgCyan(pc.black(" sdd archive ")));
  }

  const changesDir = path.join(cwd, "openspec", "changes");
  const exists = await fileExists(changesDir);

  if (!exists) {
    const msg = "No openspec/changes directory found. Run `sdd init` first.";
    if (!options.silent) {
      p.log.error(pc.red(msg));
      p.outro(pc.yellow("Aborted."));
    }
    return { success: false, changeName: "", message: msg };
  }

  const entries = await fs.readdir(changesDir, { withFileTypes: true });
  const activeChangeDirs = entries.filter(
    (e) => e.isDirectory() && e.name.toLowerCase() !== "archive"
  );

  if (activeChangeDirs.length === 0) {
    const msg = "No active changes found to archive in openspec/changes/.";
    if (!options.silent) {
      p.log.warn(pc.yellow(msg));
      p.outro(pc.dim("Nothing to archive."));
    }
    return { success: false, changeName: "", message: msg };
  }

  // Resolve target change
  let targetChange = changeName?.trim();
  if (!targetChange) {
    if (activeChangeDirs.length === 1) {
      targetChange = activeChangeDirs[0].name;
      if (!options.silent) {
        p.log.info(pc.cyan(`Auto-selected active change: ${pc.bold(targetChange)}`));
      }
    } else {
      if (options.silent) {
        return {
          success: false,
          changeName: "",
          message: "Multiple active changes exist. Specify change name to archive.",
        };
      }

      const selected = await p.select({
        message: "Select an active change to archive:",
        options: activeChangeDirs.map((d) => ({
          value: d.name,
          label: d.name,
        })),
      });

      if (p.isCancel(selected)) {
        p.cancel("Archive cancelled.");
        return { success: false, changeName: "", message: "Cancelled by user" };
      }
      targetChange = selected as string;
    }
  }

  const changeDir = path.join(changesDir, targetChange);
  if (!(await fileExists(changeDir))) {
    const msg = `Change "${targetChange}" does not exist at openspec/changes/${targetChange}`;
    if (!options.silent) {
      p.log.error(pc.red(msg));
      p.outro(pc.yellow("Aborted."));
    }
    return { success: false, changeName: targetChange, message: msg };
  }

  // Check task completion
  const tasksPath = path.join(changeDir, "tasks.md");
  if (await fileExists(tasksPath)) {
    const content = await fs.readFile(tasksPath, "utf-8");
    const { total, completed, percentage } = parseTasksProgress(content);

    if (total > 0 && completed < total && !options.force) {
      if (options.silent) {
        return {
          success: false,
          changeName: targetChange,
          message: `Cannot archive "${targetChange}": ${total - completed} task(s) remain incomplete. Use --force to override.`,
        };
      }

      p.log.warn(
        pc.yellow(
          `Warning: Change "${targetChange}" has incomplete tasks (${completed}/${total} completed, ${percentage}%).`
        )
      );

      const confirmArchive = await p.confirm({
        message: "Are you sure you want to archive this change with incomplete tasks?",
        initialValue: false,
      });

      if (p.isCancel(confirmArchive) || !confirmArchive) {
        p.cancel("Archival aborted. Finish your tasks first!");
        return {
          success: false,
          changeName: targetChange,
          message: "Archival cancelled due to incomplete tasks.",
        };
      }
    }
  }

  // 1. Promote Living Specs to openspec/specs/<change-name>.md
  let livingSpecPath: string | undefined;
  if (!options.noSync) {
    const specsPath = path.join(changeDir, "specs.md");
    if (await fileExists(specsPath)) {
      const specsContent = await fs.readFile(specsPath, "utf-8");
      const targetSpecsDir = path.join(cwd, "openspec", "specs");
      await ensureDir(targetSpecsDir);
      livingSpecPath = path.join(targetSpecsDir, `${targetChange}.md`);
      await writeFileSafe(livingSpecPath, specsContent, true);
      if (!options.silent) {
        p.log.success(
          pc.green(
            `Promoted living specifications: ${pc.bold(`openspec/specs/${targetChange}.md`)}`
          )
        );
      }
    }
  }

  // 2. Move change directory to openspec/changes/archive/YYYY-MM-DD-<change-name>/
  const archiveBaseDir = path.join(changesDir, "archive");
  await ensureDir(archiveBaseDir);

  const datePrefix = new Date().toISOString().slice(0, 10);
  let archiveFolderName = `${datePrefix}-${targetChange}`;
  let targetArchiveDir = path.join(archiveBaseDir, archiveFolderName);

  // Avoid folder collisions
  let counter = 1;
  while (await fileExists(targetArchiveDir)) {
    archiveFolderName = `${datePrefix}-${targetChange}-${counter}`;
    targetArchiveDir = path.join(archiveBaseDir, archiveFolderName);
    counter++;
  }

  try {
    await fs.rename(changeDir, targetArchiveDir);
  } catch {
    // Cross-device fallback: copy then rm
    await fs.cp(changeDir, targetArchiveDir, { recursive: true });
    await fs.rm(changeDir, { recursive: true, force: true });
  }

  const successMsg = `Change "${targetChange}" archived to openspec/changes/archive/${archiveFolderName}`;
  if (!options.silent) {
    p.log.success(pc.green(`Archived change workspace: ${pc.bold(archiveFolderName)}`));
    p.outro(pc.cyan("SDD lifecycle loop closed successfully."));
  }

  return {
    success: true,
    changeName: targetChange,
    archivePath: targetArchiveDir,
    livingSpecPath,
    message: successMsg,
  };
}
