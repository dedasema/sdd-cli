import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import { isKebabCase, parseTasksProgress, fileExists } from "../src/utils/fs.js";
import { initCommand, SDD_RULES_START } from "../src/commands/init.js";
import { newCommand } from "../src/commands/new.js";
import { statusCommand } from "../src/commands/status.js";
import { verifyCommand } from "../src/commands/verify.js";
import { archiveCommand } from "../src/commands/archive.js";

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

  it("sdd init safely injects SDD guidelines into pre-existing AGENTS.md without overwriting", async () => {
    const customContent = "# My Custom Project Guidelines\n\nAlways write tests in Vitest.\n";
    await fs.writeFile(path.join(tempDir, "AGENTS.md"), customContent, "utf-8");

    const res = await initCommand({ cwd: tempDir, silent: true });
    expect(res.success).toBe(true);

    const updatedContent = await fs.readFile(path.join(tempDir, "AGENTS.md"), "utf-8");
    expect(updatedContent).toContain("Always write tests in Vitest.");
    expect(updatedContent).toContain(SDD_RULES_START);
    expect(updatedContent).toContain("Spec-Driven Development (SDD)");
  });

  it("sdd new creates change workspace with proposal template only", async () => {
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

  it("sdd status detects active phase and artifact status correctly", async () => {
    await initCommand({ cwd: tempDir, silent: true });
    await newCommand("feature-proposal", { cwd: tempDir, silent: true });

    // Phase 1: Only proposal
    let statusRes = await statusCommand({ cwd: tempDir, silent: true });
    expect(statusRes.changes[0].phase).toBe("Proposal");
    expect(statusRes.changes[0].artifacts.proposal).toBe(true);
    expect(statusRes.changes[0].artifacts.specs).toBe(false);

    // Phase 2: Proposal + Specs -> Specs
    const changeDir = path.join(tempDir, "openspec", "changes", "feature-proposal");
    await fs.writeFile(path.join(changeDir, "specs.md"), "# Specs\n", "utf-8");
    statusRes = await statusCommand({ cwd: tempDir, silent: true });
    expect(statusRes.changes[0].phase).toBe("Specs");

    // Phase 3: Proposal + Specs + Design -> Design
    await fs.writeFile(path.join(changeDir, "design.md"), "# Design\n", "utf-8");
    statusRes = await statusCommand({ cwd: tempDir, silent: true });
    expect(statusRes.changes[0].phase).toBe("Design");

    // Phase 4: Tasks created with 0 completed -> Tasks
    await fs.writeFile(path.join(changeDir, "tasks.md"), "- [ ] 1.1 Task A\n", "utf-8");
    statusRes = await statusCommand({ cwd: tempDir, silent: true });
    expect(statusRes.changes[0].phase).toBe("Tasks");

    // Phase 5: Partial completion -> Apply
    await fs.writeFile(path.join(changeDir, "tasks.md"), "- [x] 1.1 Done\n- [ ] 1.2 Pending\n", "utf-8");
    statusRes = await statusCommand({ cwd: tempDir, silent: true });
    expect(statusRes.changes[0].phase).toBe("Apply");
    expect(statusRes.changes[0].completed).toBe(1);
    expect(statusRes.changes[0].total).toBe(2);

    // Phase 6: 100% completion -> Verify
    await fs.writeFile(path.join(changeDir, "tasks.md"), "- [x] 1.1 Done\n- [x] 1.2 Done\n", "utf-8");
    statusRes = await statusCommand({ cwd: tempDir, silent: true });
    expect(statusRes.changes[0].phase).toBe("Verify");
    expect(statusRes.changes[0].percentage).toBe(100);
  });

  it("sdd verify audits all 4 artifacts and task checklist", async () => {
    await initCommand({ cwd: tempDir, silent: true });
    await newCommand("billing-flow", { cwd: tempDir, silent: true });
    const changeDir = path.join(tempDir, "openspec", "changes", "billing-flow");

    // Initially fails because specs, design, tasks are missing
    const initialVerify = await verifyCommand("billing-flow", { cwd: tempDir, silent: true });
    expect(initialVerify.success).toBe(false);

    // Add specs and design, tasks incomplete
    await fs.writeFile(path.join(changeDir, "specs.md"), "# Specs\n", "utf-8");
    await fs.writeFile(path.join(changeDir, "design.md"), "# Design\n", "utf-8");
    await fs.writeFile(path.join(changeDir, "tasks.md"), "- [x] 1.1 Done\n- [ ] 1.2 Incomplete\n", "utf-8");

    const partialVerify = await verifyCommand("billing-flow", { cwd: tempDir, silent: true });
    expect(partialVerify.success).toBe(false);

    // Complete all tasks
    await fs.writeFile(path.join(changeDir, "tasks.md"), "- [x] 1.1 Done\n- [x] 1.2 Done\n", "utf-8");
    const completeVerify = await verifyCommand("billing-flow", { cwd: tempDir, silent: true });
    expect(completeVerify.success).toBe(true);
  });

  it("sdd archive promotes living specs and moves folder to archive", async () => {
    await initCommand({ cwd: tempDir, silent: true });
    await newCommand("search-bar", { cwd: tempDir, silent: true });
    const changeDir = path.join(tempDir, "openspec", "changes", "search-bar");

    await fs.writeFile(path.join(changeDir, "specs.md"), "# Living Specs for Search Bar\n", "utf-8");
    await fs.writeFile(path.join(changeDir, "tasks.md"), "- [x] 1.1 Done\n", "utf-8");

    const archiveRes = await archiveCommand("search-bar", { cwd: tempDir, silent: true });
    expect(archiveRes.success).toBe(true);

    // Change directory should no longer be in changes/
    expect(await fileExists(changeDir)).toBe(false);

    // Spec must be promoted to openspec/specs/search-bar.md
    const livingSpecPath = path.join(tempDir, "openspec", "specs", "search-bar.md");
    expect(await fileExists(livingSpecPath)).toBe(true);
    const livingSpecContent = await fs.readFile(livingSpecPath, "utf-8");
    expect(livingSpecContent).toBe("# Living Specs for Search Bar\n");

    // Folder must exist under openspec/changes/archive/
    const archiveFiles = await fs.readdir(path.join(tempDir, "openspec", "changes", "archive"));
    expect(archiveFiles.some((f) => f.includes("search-bar"))).toBe(true);
  });
});
