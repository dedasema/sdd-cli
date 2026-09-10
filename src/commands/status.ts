import { promises as fs } from "node:fs";
import path from "node:path";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { fileExists, parseTasksProgress } from "../utils/fs.js";

export interface StatusOptions {
  cwd?: string;
  silent?: boolean;
}

export type SDDPhase = "Proposal" | "Specs" | "Design" | "Tasks" | "Apply" | "Verify" | "Unknown";

export interface ArtifactStatus {
  proposal: boolean;
  specs: boolean;
  design: boolean;
  tasks: boolean;
}

export interface ChangeStatusResult {
  name: string;
  phase: SDDPhase;
  artifacts: ArtifactStatus;
  hasTasks: boolean;
  total: number;
  completed: number;
  percentage: number;
}

export function computePhase(
  artifacts: ArtifactStatus,
  progress: { total: number; completed: number; percentage: number }
): SDDPhase {
  if (artifacts.tasks) {
    if (progress.percentage === 100 && progress.total > 0) return "Verify";
    if (progress.completed > 0) return "Apply";
    return "Tasks";
  }
  if (artifacts.design) return "Design";
  if (artifacts.specs) return "Specs";
  if (artifacts.proposal) return "Proposal";
  return "Unknown";
}

export function renderPipeline(phase: SDDPhase, artifacts: ArtifactStatus): string {
  const mark = (exists: boolean, isCurrent: boolean) =>
    exists ? pc.green("✓") : isCurrent ? pc.yellow("⏳") : pc.dim("·");

  return [
    `proposal.md ${mark(artifacts.proposal, phase === "Proposal")}`,
    `specs.md ${mark(artifacts.specs, phase === "Specs")}`,
    `design.md ${mark(artifacts.design, phase === "Design")}`,
    `tasks.md ${mark(artifacts.tasks, phase === "Tasks" || phase === "Apply" || phase === "Verify")}`,
  ].join(pc.dim("  |  "));
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
    const changeFolder = path.join(changesDir, dir.name);
    const proposalPath = path.join(changeFolder, "proposal.md");
    const specsPath = path.join(changeFolder, "specs.md");
    const designPath = path.join(changeFolder, "design.md");
    const tasksPath = path.join(changeFolder, "tasks.md");

    const [hasProposal, hasSpecs, hasDesign, hasTasks] = await Promise.all([
      fileExists(proposalPath),
      fileExists(specsPath),
      fileExists(designPath),
      fileExists(tasksPath),
    ]);

    const artifacts: ArtifactStatus = {
      proposal: hasProposal,
      specs: hasSpecs,
      design: hasDesign,
      tasks: hasTasks,
    };

    let total = 0;
    let completed = 0;
    let percentage = 0;

    if (hasTasks) {
      const content = await fs.readFile(tasksPath, "utf-8");
      const progress = parseTasksProgress(content);
      total = progress.total;
      completed = progress.completed;
      percentage = progress.percentage;
    }

    const phase = computePhase(artifacts, { total, completed, percentage });

    results.push({
      name: dir.name,
      phase,
      artifacts,
      hasTasks,
      total,
      completed,
      percentage,
    });
  }

  if (!options.silent) {
    for (const change of results) {
      p.log.step(`${pc.bold(change.name)} ${pc.cyan(`[Phase: ${change.phase}]`)}`);
      p.log.message(`  ${renderPipeline(change.phase, change.artifacts)}`);
      if (change.hasTasks) {
        const color =
          change.percentage === 100
            ? pc.green
            : change.percentage > 0
            ? pc.yellow
            : pc.dim;
        const progressLabel = `${change.completed}/${change.total} tasks completed (${change.percentage}%)`;
        p.log.message(`  ${pc.dim("Progress:")} ${color(progressLabel)}`);
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
