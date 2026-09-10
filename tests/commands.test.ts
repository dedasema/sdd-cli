import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import { isKebabCase, parseTasksProgress, fileExists } from "../src/utils/fs.js";
import { initCommand } from "../src/commands/init.js";
import { newCommand } from "../src/commands/new.js";
import { statusCommand } from "../src/commands/status.js";

describe("SDD CLI Utilities", () => {
  it("validates kebab-case correctly", () => {
    expect(isKebabCase("auth-flow")).toBe(true);
    expect(isKebabCase("create-sdd-cli")).toBe(true);
    expect(isKebabCase("feature1")).toBe(true);
    expect(isKebabCase("AuthFlow")).toBe(false);
    expect(isKebabCase("auth_flow")).toBe(false);
    expect(isKebabCase("auth flow")).toBe(false);
    expect(isKebabCase("-auth")).toBe(false);
  });

  it("parses task progress percentages", () => {
    const markdown = `
# Tasks
- [x] 1.1 First task
- [ ] 1.2 Second task
- [X] 1.3 Third task
- [ ] 1.4 Fourth task
`;
    const result = parseTasksProgress(markdown);
    expect(result.total).toBe(4);
    expect(result.completed).toBe(2);
    expect(result.percentage).toBe(50);
  });

  it("handles empty task checklists gracefully", () => {
    const result = parseTasksProgress("# No tasks here");
    expect(result.total).toBe(0);
    expect(result.completed).toBe(0);
    expect(result.percentage).toBe(0);
  });
});

describe("SDD CLI Commands Integration", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "sdd-test-"));
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("sdd init bootstraps openspec hierarchy and AGENTS.md", async () => {
    const res = await initCommand({ cwd: tempDir, silent: true });
    expect(res.success).toBe(true);

    expect(await fileExists(path.join(tempDir, "openspec", "specs"))).toBe(true);
    expect(await fileExists(path.join(tempDir, "openspec", "changes", "archive"))).toBe(true);
    expect(await fileExists(path.join(tempDir, "openspec", "config.yaml"))).toBe(true);
    expect(await fileExists(path.join(tempDir, "AGENTS.md"))).toBe(true);

    const agentsContent = await fs.readFile(path.join(tempDir, "AGENTS.md"), "utf-8");
    expect(agentsContent).toContain("autonomously execute `sdd new <feature-name>`");

    // Verify idempotency
    const secondRun = await initCommand({ cwd: tempDir, silent: true });
    expect(secondRun.success).toBe(true);
  });

  it("sdd new creates change workspace with templates", async () => {
    await initCommand({ cwd: tempDir, silent: true });

    // Invalid kebab-case
    const invalidRes = await newCommand("Invalid Name!", { cwd: tempDir, silent: true });
    expect(invalidRes.success).toBe(false);

    // Valid creation
    const validRes = await newCommand("user-auth", { cwd: tempDir, silent: true });
    expect(validRes.success).toBe(true);

    const changeDir = path.join(tempDir, "openspec", "changes", "user-auth");
    expect(await fileExists(path.join(changeDir, "proposal.md"))).toBe(true);
    expect(await fileExists(path.join(changeDir, "specs.md"))).toBe(false);
    expect(await fileExists(path.join(changeDir, "design.md"))).toBe(false);
    expect(await fileExists(path.join(changeDir, "tasks.md"))).toBe(false);

    // Duplicate creation prevention
    const dupRes = await newCommand("user-auth", { cwd: tempDir, silent: true });
    expect(dupRes.success).toBe(false);
  });

  it("sdd status calculates progress for active changes", async () => {
    await initCommand({ cwd: tempDir, silent: true });
    await newCommand("feature-a", { cwd: tempDir, silent: true });

    const tasksPath = path.join(tempDir, "openspec", "changes", "feature-a", "tasks.md");
    await fs.writeFile(
      tasksPath,
      "- [x] 1.1 Done\n- [ ] 1.2 Pending\n",
      "utf-8"
    );

    const statusRes = await statusCommand({ cwd: tempDir, silent: true });
    expect(statusRes.success).toBe(true);
    expect(statusRes.changes.length).toBe(1);
    expect(statusRes.changes[0].name).toBe("feature-a");
    expect(statusRes.changes[0].total).toBe(2);
    expect(statusRes.changes[0].completed).toBe(1);
    expect(statusRes.changes[0].percentage).toBe(50);
  });
});
