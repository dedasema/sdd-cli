import path from "node:path";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { ensureDir, fileExists, isKebabCase, writeFileSafe } from "../utils/fs.js";
import {
  getDesignTemplate,
  getProposalTemplate,
  getSpecsTemplate,
  getTasksTemplate,
} from "../templates/change.js";

export interface NewOptions {
  cwd?: string;
  silent?: boolean;
}

export async function newCommand(
  changeName: string,
  options: NewOptions = {}
): Promise<{ success: boolean; message: string; changePath?: string }> {
  const cwd = options.cwd ? path.resolve(options.cwd) : process.cwd();

  if (!options.silent) {
    p.intro(pc.bgCyan(pc.black(" sdd new ")));
  }

  // 1. Validate kebab-case
  if (!isKebabCase(changeName)) {
    const errorMsg = `Invalid change name "${changeName}". Change names MUST be kebab-case (e.g. "add-user-auth", "login-flow").`;
    if (!options.silent) {
      p.log.error(pc.red(errorMsg));
      p.outro(pc.yellow("Aborted without making changes."));
    }
    return { success: false, message: errorMsg };
  }

  const changeDir = path.join(cwd, "openspec", "changes", changeName);
  const exists = await fileExists(changeDir);

  if (exists) {
    const errorMsg = `Change "${changeName}" already exists at openspec/changes/${changeName}`;
    if (!options.silent) {
      p.log.error(pc.red(errorMsg));
      p.outro(pc.yellow("Aborted to prevent overwriting existing work."));
    }
    return { success: false, message: errorMsg };
  }

  // 2. Create change folder
  await ensureDir(changeDir);

  // 3. Populate standard templates
  await writeFileSafe(path.join(changeDir, "proposal.md"), getProposalTemplate(changeName));
  await writeFileSafe(path.join(changeDir, "specs.md"), getSpecsTemplate(changeName));
  await writeFileSafe(path.join(changeDir, "design.md"), getDesignTemplate(changeName));
  await writeFileSafe(path.join(changeDir, "tasks.md"), getTasksTemplate(changeName));

  const successMsg = `Change workspace created at openspec/changes/${changeName}`;
  if (!options.silent) {
    p.log.success(pc.green(`Created change workspace: ${pc.bold(changeName)}`));
    p.log.step(pc.dim("Generated proposal.md, specs.md, design.md, tasks.md"));
    p.outro(
      pc.cyan(
        `Next: Open the chat with your AI and prompt: "Help me fill out the proposal and specs for change '${changeName}'".`
      )
    );
  }

  return { success: true, message: successMsg, changePath: changeDir };
}
