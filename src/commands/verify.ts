import { promises as fs } from "node:fs";
import path from "node:path";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { fileExists, parseTasksProgress } from "../utils/fs.js";
import { ArtifactStatus, computePhase, SDDPhase } from "./status.js";

export interface VerifyOptions {
  cwd?: string;
  silent?: boolean;
}

export interface VerifyResult {
  success: boolean;
  changeName: string;
  phase: SDDPhase;
  artifacts: ArtifactStatus;
  totalTasks: number;
  completedTasks: number;
  message: string;
}

export async function verifyCommand(
  changeName?: string,
  options: VerifyOptions = {}
): Promise<VerifyResult> {
  const cwd = options.cwd ? path.resolve(options.cwd) : process.cwd();

  if (!options.silent) {
    p.intro(pc.bgCyan(pc.black(" sdd verify ")));
  }

  const changesDir = path.join(cwd, "openspec", "changes");
  const exists = await fileExists(changesDir);

  if (!exists) {
    const msg = "No openspec/changes directory found. Run `sdd init` first.";
    if (!options.silent) {
      p.log.error(pc.red(msg));
      p.outro(pc.yellow("Aborted."));
    }
    return {
      success: false,
      changeName: "",
      phase: "Unknown",
      artifacts: { proposal: false, specs: false, design: false, tasks: false },
      totalTasks: 0,
      completedTasks: 0,
      message: msg,
    };
  }

  const entries = await fs.readdir(changesDir, { withFileTypes: true });
  const activeChangeDirs = entries.filter(
    (e) => e.isDirectory() && e.name.toLowerCase() !== "archive"
  );

  if (activeChangeDirs.length === 0) {
    const msg = "No active changes found to verify in openspec/changes/.";
    if (!options.silent) {
      p.log.warn(pc.yellow(msg));
      p.outro(pc.dim("Nothing to verify."));
    }
    return {
      success: false,
      changeName: "",
      phase: "Unknown",
      artifacts: { proposal: false, specs: false, design: false, tasks: false },
      totalTasks: 0,
      completedTasks: 0,
      message: msg,
    };
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
          phase: "Unknown",
          artifacts: { proposal: false, specs: false, design: false, tasks: false },
          totalTasks: 0,
          completedTasks: 0,
          message: "Multiple active changes exist. Specify change name to verify.",
        };
      }

      const selected = await p.select({
        message: "Select an active change to verify:",
        options: activeChangeDirs.map((d) => ({
          value: d.name,
          label: d.name,
        })),
      });

      if (p.isCancel(selected)) {
        p.cancel("Verification cancelled.");
        return {
          success: false,
          changeName: "",
          phase: "Unknown",
          artifacts: { proposal: false, specs: false, design: false, tasks: false },
          totalTasks: 0,
          completedTasks: 0,
          message: "Cancelled by user",
        };
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
    return {
      success: false,
      changeName: targetChange,
      phase: "Unknown",
      artifacts: { proposal: false, specs: false, design: false, tasks: false },
      totalTasks: 0,
      completedTasks: 0,
      message: msg,
    };
  }

  // Audit artifacts
  const proposalPath = path.join(changeDir, "proposal.md");
  const specsPath = path.join(changeDir, "specs.md");
  const designPath = path.join(changeDir, "design.md");
  const tasksPath = path.join(changeDir, "tasks.md");

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

  const missingDocs: string[] = [];
  if (!hasProposal) missingDocs.push("proposal.md");
  if (!hasSpecs) missingDocs.push("specs.md");
  if (!hasDesign) missingDocs.push("design.md");
  if (!hasTasks) missingDocs.push("tasks.md");

  const allDocsPresent = missingDocs.length === 0;
  const allTasksDone = hasTasks && total > 0 && completed === total;
  const isVerified = allDocsPresent && allTasksDone;

  if (!options.silent) {
    p.log.step(`Auditing artifacts for ${pc.bold(targetChange)}:`);
    p.log.message(`  proposal.md: ${hasProposal ? pc.green("✓ Found") : pc.red("✗ Missing")}`);
    p.log.message(`  specs.md:    ${hasSpecs ? pc.green("✓ Found") : pc.red("✗ Missing")}`);
    p.log.message(`  design.md:   ${hasDesign ? pc.green("✓ Found") : pc.red("✗ Missing")}`);
    p.log.message(`  tasks.md:    ${hasTasks ? pc.green("✓ Found") : pc.red("✗ Missing")}`);

    if (hasTasks) {
      const taskColor = allTasksDone ? pc.green : pc.yellow;
      p.log.message(
        `  Task Checklist: ${taskColor(`${completed}/${total} completed (${percentage}%)`)}`
      );
    }

    if (isVerified) {
      p.log.success(pc.green("All artifacts present and all implementation tasks completed!"));
      p.outro(pc.cyan(`Ready to archive! Run \`sdd archive ${targetChange}\` to close the change.`));
    } else {
      if (!allDocsPresent) {
        p.log.warn(pc.yellow(`Incomplete lifecycle: Missing artifacts (${missingDocs.join(", ")})`));
      }
      if (hasTasks && !allTasksDone) {
        p.log.warn(pc.yellow(`Pending tasks: ${total - completed} task(s) remaining in tasks.md`));
      }
      p.outro(pc.red("Verification failed: Complete all phases and checklist items first."));
    }
  }

  return {
    success: isVerified,
    changeName: targetChange,
    phase,
    artifacts,
    totalTasks: total,
    completedTasks: completed,
    message: isVerified
      ? "Change verified successfully"
      : `Verification failed: ${
          !allDocsPresent
            ? `Missing artifacts: ${missingDocs.join(", ")}`
            : `${total - completed} pending tasks in tasks.md`
        }`,
  };
}
