import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import { setupCommand } from "../src/commands/setup.js";
import { fileExists } from "../src/utils/fs.js";

describe("SDD CLI Setup Command", () => {
  let tempHome: string;

  beforeEach(async () => {
    tempHome = await fs.mkdtemp(path.join(os.tmpdir(), "sdd-setup-test-"));
  });

  afterEach(async () => {
    await fs.rm(tempHome, { recursive: true, force: true });
  });

  it("provisions selected environments in target homedir with --all and --silent", async () => {
    // We pass specific selected environments or simulate all detected
    const res = await setupCommand({
      all: true,
      silent: true,
      homedir: tempHome,
      detectedEnvironments: ["zed", "cursor"],
    });

    expect(res.success).toBe(true);

    const zedDir =
      process.platform === "win32"
        ? path.join(tempHome, "AppData", "Roaming", "Zed")
        : path.join(tempHome, ".config", "zed");
    const zedSkill = path.join(zedDir, "skills", "sdd", "SKILL.md");
    const zedAgents = path.join(zedDir, "AGENTS.md");
    const zedSettings = path.join(zedDir, "settings.json");

    expect(await fileExists(zedSkill)).toBe(true);
    expect(await fileExists(zedAgents)).toBe(true);
    expect(await fileExists(zedSettings)).toBe(true);

    const settingsContent = await fs.readFile(zedSettings, "utf-8");
    expect(settingsContent).toContain("slash_commands");
    expect(settingsContent).toContain("sdd-archive");

    // Universal Agent Skills for Zed Assistant
    expect(await fileExists(path.join(tempHome, ".agents", "skills", "sdd", "SKILL.md"))).toBe(true);
    expect(await fileExists(path.join(tempHome, ".agents", "skills", "sdd-tasks", "SKILL.md"))).toBe(true);
    expect(await fileExists(path.join(tempHome, ".agents", "skills", "sdd-apply", "SKILL.md"))).toBe(true);
    expect(await fileExists(path.join(tempHome, ".agents", "skills", "sdd-archive", "SKILL.md"))).toBe(true);

    // Verify Cursor skill and rule
    const cursorSkill = path.join(tempHome, ".cursor", "skills", "sdd", "SKILL.md");
    const cursorRule = path.join(tempHome, ".cursor", "rules", "sdd.mdc");

    expect(await fileExists(cursorSkill)).toBe(true);
    expect(await fileExists(cursorRule)).toBe(true);

    // Verify unselected (e.g. Claude) was NOT provisioned
    const claudeSkill = path.join(tempHome, ".claude", "skills", "sdd", "SKILL.md");
    expect(await fileExists(claudeSkill)).toBe(false);
  });
});
