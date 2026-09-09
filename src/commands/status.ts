import { promises as fs } from "node:fs";
import path from "node:path";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { fileExists, parseTasksProgress } from "../utils/fs.js";

export interface StatusOptions {
  cwd?: string;
  silent?: boolean;
}

export interface ChangeStatusResult {
  name: string;
  hasTasks: boolean;
  total: number;
  completed: number;
  percentage: number;
}

export async function statusCommand(options: StatusOptions = {}): Promise<{
  success: boolean;
  changes: ChangeStatusResult[];
  message: string;
}> {
  const cwd = options.cwd ? path.resolve(options.cwd) : process.cwd();

  if (!options.silent) {
    p.intro(pc.bgCyan(pc.black(" sdd status ")));
  }

  const changesDir = path.join(cwd, "openspec", "changes");
  const exists = await fileExists(changesDir);

  if (!exists) {
    const msg = "No openspec/changes directory found. Run `sdd init` first.";
    if (!options.silent) {
      p.log.warn(pc.yellow(msg));
      p.outro(pc.dim("Nothing to report."));
    }
    return { success: false, changes: [], message: msg };
  }

  const entries = await fs.readdir(changesDir, { withFileTypes: true });
  const activeChangeDirs = entries.filter(
    (e) => e.isDirectory() && e.name.toLowerCase() !== "archive"
  );

  if (activeChangeDirs.length === 0) {
    const msg = "No active changes found in openspec/changes/.";
    if (!options.silent) {
      p.log.info(pc.cyan(msg));
      p.outro(pc.dim("Create a new change with `sdd new <change-name>`."));
    }
    return { success: true, changes: [], message: msg };
  }

  const results: ChangeStatusResult[] = [];

  for (const dir of activeChangeDirs) {
    const tasksPath = path.join(changesDir, dir.name, "tasks.md");
    const hasTasks = await fileExists(tasksPath);

    if (hasTasks) {
      const content = await fs.readFile(tasksPath, "utf-8");
      const { total, completed, percentage } = parseTasksProgress(content);
      results.push({
        name: dir.name,
        hasTasks: true,
        total,
        completed,
        percentage,
      });
    } else {
      results.push({
        name: dir.name,
        hasTasks: false,
        total: 0,
        completed: 0,
        percentage: 0,
      });
    }
  }

  if (!options.silent) {
    for (const change of results) {
      if (change.hasTasks) {
        const color =
          change.percentage === 100
            ? pc.green
            : change.percentage > 0
            ? pc.yellow
            : pc.dim;
        const progressLabel = `${change.completed}/${change.total} tasks (${change.percentage}%)`;
        p.log.step(
          `${pc.bold(change.name)}: ${color(progressLabel)}`
        );
      } else {
        p.log.step(
          `${pc.bold(change.name)}: ${pc.yellow("tasks.md pending creation")}`
        );
      }
    }
    p.outro(pc.dim(`${results.length} active change(s) tracked.`));
  }

  return {
    success: true,
    changes: results,
    message: `${results.length} active change(s) found`,
  };
}
