import { promises as fs } from "node:fs";
import path from "node:path";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { ensureDir, fileExists, isKebabCase, writeFileSafe } from "../utils/fs.js";
import { getProposalTemplate } from "../templates/change.js";

export interface NewOptions {
  cwd?: string;
  silent?: boolean;
}

export async function newCommand(
  changeName?: string,
  options: NewOptions = {}
): Promise<{ success: boolean; message: string; changePath?: string }> {
  const cwd = options.cwd ? path.resolve(options.cwd) : process.cwd();

  if (!options.silent) {
    p.intro(pc.bgCyan(pc.black(" sdd new ")));
  }

  // 1. Resolve changeName (interactive fallback if omitted)
  let resolvedName = changeName?.trim();
  if (!resolvedName) {
    if (options.silent) {
      return { success: false, message: "Missing required change name" };
    }
    const entered = await p.text({
      message: "Enter change name (kebab-case, e.g. add-user-auth):",
      placeholder: "feature-name",
      validate(val) {
        if (!val || val.trim().length === 0) return "Change name is required";
        if (!isKebabCase(val.trim())) return "Must be kebab-case (e.g. add-user-auth)";
      },
    });

    if (p.isCancel(entered)) {
      p.cancel("Operation cancelled.");
      return { success: false, message: "Cancelled by user" };
    }
    resolvedName = entered.trim();
  }

  // 2. Validate kebab-case
  if (!isKebabCase(resolvedName)) {
    const errorMsg = `Invalid change name "${resolvedName}". Change names MUST be kebab-case (e.g. "add-user-auth", "login-flow").`;
    if (!options.silent) {
      p.log.error(pc.red(errorMsg));
      p.outro(pc.yellow("Aborted without making changes."));
    }
    return { success: false, message: errorMsg };
  }

  const changesDir = path.join(cwd, "openspec", "changes");

  // 3. Anti-WIP Guardrail: warn if other changes are already in progress
  if (await fileExists(changesDir)) {
    const entries = await fs.readdir(changesDir, { withFileTypes: true });
    const activeChanges = entries.filter(
      (e) => e.isDirectory() && e.name.toLowerCase() !== "archive" && e.name !== resolvedName
    );

    if (activeChanges.length > 0 && !options.silent) {
      const activeList = activeChanges.map((c) => pc.bold(c.name)).join(", ");
      p.log.warn(
        pc.yellow(
          `Notice: You currently have ${activeChanges.length} active change(s) in progress: ${activeList}`
        )
      );

      const shouldProceed = await p.confirm({
        message: "Do you want to create an additional change workspace anyway?",
        initialValue: true,
      });

      if (p.isCancel(shouldProceed) || !shouldProceed) {
        p.cancel("Aborted. Focus on completing your active change first!");
        return { success: false, message: "Aborted by user due to active WIP" };
      }
    }
  }

  const changeDir = path.join(changesDir, resolvedName);
  const exists = await fileExists(changeDir);

  if (exists) {
    const errorMsg = `Change "${resolvedName}" already exists at openspec/changes/${resolvedName}`;
    if (!options.silent) {
      p.log.error(pc.red(errorMsg));
      p.outro(pc.yellow("Aborted to prevent overwriting existing work."));
    }
    return { success: false, message: errorMsg };
  }

  // 4. Create change folder
  await ensureDir(changeDir);

  // 5. Populate initial proposal template only (Just-In-Time progressive lifecycle)
  await writeFileSafe(path.join(changeDir, "proposal.md"), getProposalTemplate(resolvedName));

  const successMsg = `Change workspace created at openspec/changes/${resolvedName}`;
  if (!options.silent) {
    p.log.success(pc.green(`Created change workspace: ${pc.bold(resolvedName)}`));
    p.log.step(pc.dim("Generated proposal.md (subsequent artifacts are created Just-In-Time per phase)"));
    p.outro(
      pc.cyan(
        `Next: Open the chat with your AI and run "/sdd" or "/sdd-propose" to draft the proposal.`
      )
    );
  }

  return { success: true, message: successMsg, changePath: changeDir };
}
