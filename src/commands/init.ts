import path from "node:path";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { ensureDir, fileExists, writeFileSafe } from "../utils/fs.js";
import { getAgentsTemplate } from "../templates/agents.js";
import { getConfigTemplate } from "../templates/config.js";

export interface InitOptions {
  cwd?: string;
  silent?: boolean;
}

export async function initCommand(options: InitOptions = {}): Promise<{
  success: boolean;
  message: string;
}> {
  const cwd = options.cwd ? path.resolve(options.cwd) : process.cwd();
  const projectName = path.basename(cwd);

  if (!options.silent) {
    p.intro(pc.bgCyan(pc.black(" sdd init ")));
  }

  const openspecDir = path.join(cwd, "openspec");
  const alreadyInitialized = await fileExists(openspecDir);

  if (alreadyInitialized) {
    const msg = "SDD (OpenSpec) is already initialized in this repository.";
    if (!options.silent) {
      p.log.warn(pc.yellow(msg));
      p.outro(pc.dim("No files were overwritten."));
    }
    return { success: true, message: msg };
  }

  // 1. Create directory structure
  const specsDir = path.join(openspecDir, "specs");
  const archiveDir = path.join(openspecDir, "changes", "archive");
  await ensureDir(specsDir);
  await ensureDir(archiveDir);

  // 2. Create openspec/config.yaml
  const configPath = path.join(openspecDir, "config.yaml");
  await writeFileSafe(configPath, getConfigTemplate(projectName));

  // 3. Create root AGENTS.md
  const agentsPath = path.join(cwd, "AGENTS.md");
  const agentsExist = await fileExists(agentsPath);
  if (!agentsExist) {
    await writeFileSafe(agentsPath, getAgentsTemplate());
  }

  const msg = "SDD initialized successfully with OpenSpec structure and AGENTS.md.";
  if (!options.silent) {
    p.log.success(pc.green("Created openspec/ directory hierarchy"));
    p.log.success(pc.green("Generated openspec/config.yaml"));
    if (!agentsExist) {
      p.log.success(pc.green("Injected strict SDD guidelines into AGENTS.md"));
    } else {
      p.log.info(pc.dim("Existing AGENTS.md preserved."));
    }
    p.outro(pc.cyan("Ready to plan features! Run `sdd new <change-name>` to begin."));
  }

  return { success: true, message: msg };
}
