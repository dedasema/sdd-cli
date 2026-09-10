import fs from "node:fs";
import path from "node:path";
import os from "node:os";

export type EnvironmentId =
  | "antigravity_2"
  | "agy_cli"
  | "codex"
  | "copilot"
  | "opencode"
  | "claude"
  | "cursor"
  | "zed";

export interface EnvironmentInfo {
  id: EnvironmentId;
  name: string;
  configPathHint: string;
  installed: boolean;
}

export interface DetectionOptions {
  env?: NodeJS.ProcessEnv;
  fsExists?: (filePath: string) => boolean;
  homedir?: string;
}

function isExecutableInPath(
  binName: string,
  env: NodeJS.ProcessEnv,
  fsExists: (filePath: string) => boolean
): boolean {
  const pathEnv = env.PATH || "";
  const isWindows = process.platform === "win32" || env.PATHEXT !== undefined;
  const delimiter = isWindows ? ";" : ":";
  const extensions = isWindows
    ? (env.PATHEXT || ".EXE;.CMD;.BAT;.COM").split(";")
    : [""];

  for (const dir of pathEnv.split(delimiter)) {
    if (!dir) continue;
    for (const ext of extensions) {
      const extFormatted = ext.startsWith(".")
        ? ext.toLowerCase()
        : ext
          ? `.${ext.toLowerCase()}`
          : "";
      const fullPath = path.join(dir, `${binName}${extFormatted}`);
      try {
        if (fsExists(fullPath)) return true;
      } catch {
        // ignore errors
      }
    }
  }
  return false;
}

export function detectEnvironment(
  id: EnvironmentId,
  options: DetectionOptions = {}
): boolean {
  const env = options.env ?? process.env;
  const exists = options.fsExists ?? ((p: string) => fs.existsSync(p));
  const homedir = options.homedir ?? os.homedir();
  const localAppData = env.LOCALAPPDATA || path.join(homedir, "AppData", "Local");
  const appData = env.APPDATA || path.join(homedir, "AppData", "Roaming");

  switch (id) {
    case "antigravity_2":
      return (
        isExecutableInPath("agy", env, exists) ||
        isExecutableInPath("antigravity", env, exists) ||
        exists(path.join(homedir, ".gemini", "antigravity")) ||
        exists(path.join(appData, "Google", "Antigravity")) ||
        exists(path.join(homedir, ".gemini"))
      );
    case "agy_cli":
      return (
        isExecutableInPath("agy", env, exists) ||
        exists(path.join(homedir, ".gemini", "skills"))
      );
    case "codex":
      return (
        isExecutableInPath("codex", env, exists) ||
        exists(path.join(homedir, ".codex"))
      );
    case "copilot":
      return (
        isExecutableInPath("code", env, exists) ||
        exists(path.join(homedir, ".copilot")) ||
        exists(path.join(localAppData, "Programs", "Microsoft VS Code")) ||
        exists("/Applications/Visual Studio Code.app") ||
        exists("/usr/share/code")
      );
    case "opencode":
      return (
        isExecutableInPath("opencode", env, exists) ||
        exists(path.join(homedir, ".config", "opencode")) ||
        exists(path.join(appData, "opencode"))
      );
    case "claude":
      return (
        isExecutableInPath("claude", env, exists) ||
        exists(path.join(homedir, ".claude"))
      );
    case "cursor":
      return (
        isExecutableInPath("cursor", env, exists) ||
        exists(path.join(homedir, ".cursor")) ||
        exists(path.join(localAppData, "Programs", "cursor")) ||
        exists("/Applications/Cursor.app")
      );
    case "zed":
      return (
        isExecutableInPath("zed", env, exists) ||
        exists(path.join(localAppData, "Programs", "Zed")) ||
        exists(path.join(appData, "Zed")) ||
        exists(path.join(homedir, ".config", "zed")) ||
        exists("/Applications/Zed.app")
      );
  }
}

export const ENVIRONMENTS_META: Array<{
  id: EnvironmentId;
  name: string;
  configPathHint: string;
}> = [
  {
    id: "antigravity_2",
    name: "Antigravity 2.0",
    configPathHint: "~/.gemini/config/skills/sdd + /sdd",
  },
  {
    id: "agy_cli",
    name: "Antigravity CLI (agy)",
    configPathHint: "~/.gemini/skills/sdd + /sdd",
  },
  {
    id: "codex",
    name: "OpenAI Codex",
    configPathHint: "~/.codex/AGENTS.md + skills",
  },
  {
    id: "copilot",
    name: "GitHub Copilot (VS Code)",
    configPathHint: "~/.copilot/copilot-instructions.md + skills",
  },
  {
    id: "opencode",
    name: "OpenCode",
    configPathHint: "~/.config/opencode/AGENTS.md + skills",
  },
  {
    id: "claude",
    name: "Claude Code",
    configPathHint: "~/.claude/CLAUDE.md + /sdd commands",
  },
  {
    id: "cursor",
    name: "Cursor",
    configPathHint: "~/.cursor/rules/sdd.mdc + skills",
  },
  {
    id: "zed",
    name: "Zed",
    configPathHint: "%APPDATA%/Zed: rule + /sdd + skill",
  },
];

export function detectAllEnvironments(options: DetectionOptions = {}): EnvironmentInfo[] {
  return ENVIRONMENTS_META.map((meta) => ({
    ...meta,
    installed: detectEnvironment(meta.id, options),
  }));
}
