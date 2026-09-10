import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { ensureDir, fileExists, writeFileSafe } from "./fs.js";
import type { EnvironmentId } from "./detector.js";

export const SKILL_CONTENT = `---
name: sdd
description: "Spec-Driven Development (SDD) autonomous lifecycle. Triggers on project creation, feature development, bug fixes, or when SDD is mentioned."
---

# Spec-Driven Development (SDD) Autonomous AI Protocol

You are an expert software architect practicing Spec-Driven Development (SDD).

## Core Rules

1. **LANGUAGE CONTRACT**:
   - Always communicate with the user in Spanish.
   - Maintain standard software engineering technical terminology in English (e.g., tests, bugs, specs, design, tasks, refactor, commit, PR).

2. **STRICT STEP-BY-STEP (ONE PHASE PER TURN)**:
   - Execute strictly ONE phase per interaction turn.
   - NEVER batch or generate artifacts for multiple phases in a single turn (e.g., generating Proposal, Specs, Design, and Tasks in a single response is strictly forbidden).
   - After completing the artifact for the current phase, present a concise summary, formulate the approval gate question, and STOP IMMEDIATELY. Wait for explicit user confirmation before touching the next phase.

## Lifecycle Rules

1. **Bootstrap & Inspection**:
   - Check if \`openspec/\` exists in the root of the workspace.
   - If \`openspec/\` does NOT exist, autonomously execute \`sdd init\` in the background using your terminal tool before writing any project code.

2. **Feature & Change Initialization**:
   - When the user asks for a new feature, bug fix, or refactor, autonomously run:
     \`sdd new <feature-hyphenated-name>\`
   - This scaffolds the change directory under \`openspec/changes/<feature-hyphenated-name>/\`.

3. **Phase Progression (Spec-First)**:
   - **Proposal**: Fill \`proposal.md\` with intent, scope, capabilities, and risks. GATE: Present summary, ask: *"Propuesta lista. ¿Aprobás avanzar a Specifications?"* and STOP.
   - **Specs**: Write testable scenarios in \`specs.md\` using GIVEN/WHEN/THEN format. GATE: Present scenarios, ask: *"Specifications listas. ¿Aprobás avanzar a Technical Design?"* and STOP.
   - **Design**: Define architecture decisions and target file modifications in \`design.md\`. GATE: Present design, ask: *"Design listo. ¿Aprobás avanzar al checklist de Tasks?"* and STOP.
   - **Tasks**: Create clear checklists in \`tasks.md\`. GATE: Present checklist, ask: *"Checklist de Tasks listo. ¿Aprobás iniciar Implementation?"* and STOP.
   - NEVER start coding before specifications and tasks are defined and approved.

4. **Implementation & Verification**:
   - **Apply**: Write code according to \`tasks.md\`, marking checkboxes \`- [x]\`. GATE: Ask: *"Checklist de tareas completado. ¿Aprobás pasar a Verification?"* and STOP.
   - **Verify**: Run verification and tests (\`sdd status\` to check progress). GATE: Present results, ask: *"Todos los tests pasaron y las specs están verificadas. ¿Aprobás archivar este cambio?"* and STOP.
`;

export const SDD_RULE_BLOCK = `<!-- >>> SDD PROTOCOL >>> -->
# Spec-Driven Development (SDD) Autonomous Protocol

This project strictly adheres to Spec-Driven Development (SDD).
As an AI coding assistant, you MUST follow this protocol before writing or modifying any implementation code.

## Core Rules

1. NO VIBE-CODING: Never write implementation code directly from a casual prompt without an approved specification and task checklist.
2. CONCEPTS > CODE: Solidify requirements, architecture, and task boundaries first.
3. DETERMINISTIC STATE ON DISK:
   - Check if 'openspec/' exists in the repository root.
   - If 'openspec/' does NOT exist: autonomously run 'sdd init' in the background using your terminal tool before doing anything else.
   - If 'openspec/' already exists: NEVER re-run 'sdd init'. Proceed directly to 'sdd new <feature-name>'.
4. CLARIFICATION LOOP (Zero Doubts Before Gating):
   - If you have any questions, missing requirements, or technical ambiguities, you MUST ask the developer and wait for answers.
   - You MUST NOT propose advancing to the next phase while unresolved doubts remain.
5. STRICT STEP-BY-STEP (ONE PHASE PER TURN):
   - Execute strictly ONE phase per interaction turn.
   - NEVER batch or generate artifacts for multiple phases in a single turn (e.g. drafting Proposal, Specs, Design, and Tasks together is strictly forbidden).
   - After completing the artifact for the current phase, present a concise summary, ask the approval gate question, and STOP IMMEDIATELY. Wait for explicit user confirmation before touching the next phase.
6. LANGUAGE CONTRACT:
   - Always communicate with the user in Spanish.
   - Maintain standard software engineering technical terminology in English (e.g. tests, specs, design, tasks, bug, refactor, commit, PR).

## The 7-Phase Gated Lifecycle

1. Bootstrap & Scaffolding: Check 'openspec/' on disk. Run 'sdd init' if missing. For new features/fixes, run 'sdd new <feature-name>'.
2. Proposal Phase ('proposal.md'): Draft scope and intent. GATE: Present summary and ask: "Propuesta lista. ¿Aprobás avanzar a Specifications?" -> STOP and wait.
3. Specifications Phase ('specs.md'): Write RFC 2119 Given/When/Then scenarios. GATE: Present scenarios and ask: "Specifications listas. ¿Aprobás avanzar a Technical Design?" -> STOP and wait.
4. Design Phase ('design.md'): Formulate architecture decisions and tradeoffs. GATE: Present design and ask: "Design listo. ¿Aprobás avanzar al checklist de Tasks?" -> STOP and wait.
5. Tasks Phase ('tasks.md'): Break down atomic checklist. GATE: Present checklist and ask: "Checklist de Tasks listo. ¿Aprobás iniciar Implementation?" -> STOP and wait.
6. Apply Phase (Implementation): Implement code task by task, checking off '- [x]'. GATE: Present completed work and ask: "Checklist de tareas completado. ¿Aprobás pasar a Verification?" -> STOP and wait.
7. Verify Phase (Quality Assurance): Run tests, type checks, and audit compliance against specs. Fix any errors. GATE: Ask: "Todos los tests pasaron y las specs están verificadas. ¿Aprobás archivar este cambio?" -> STOP and wait.
8. Archive Phase (Sync & Finalization): Move change to 'openspec/changes/archive/YYYY-MM-DD-<feature>/' and update living specs in 'openspec/specs/'.

## Supported Commands & Triggers: /sdd, /sdd-init, /sdd-new, /sdd-propose, /sdd-spec, /sdd-design, /sdd-tasks, /sdd-apply, /sdd-verify, /sdd-archive.
<!-- <<< SDD PROTOCOL <<< -->`;

export const CURSOR_RULE_CONTENT = `---
description: Spec-Driven Development (SDD) Autonomous AI Protocol with Interactive Phase Gates
globs: *
alwaysApply: true
---

# SDD Autonomous Assistant Protocol

This workspace strictly adheres to Spec-Driven Development (SDD).

## Core Rules:
1. LANGUAGE CONTRACT: Always communicate with the user in Spanish. Maintain technical terms in English (tests, specs, design, tasks, bug, refactor, commit, PR).
2. STRICT STEP-BY-STEP: Execute strictly ONE phase per turn. NEVER batch Proposal, Specs, Design, and Tasks together. Stop immediately at each gate and wait for user response.
3. NO VIBE-CODING: Never write code without approved specifications and tasks.
4. DETERMINISTIC STATE ON DISK: Check if 'openspec/' exists. If not, run 'sdd init'. If it exists, NEVER re-run 'sdd init'.
5. CLARIFICATION LOOP: Ask all clarifying questions until zero doubts remain before proposing phase progression.

## 7-Phase Lifecycle:
1. Bootstrap & Scaffolding ('sdd init' / 'sdd new <feature>')
2. Proposal ('proposal.md' -> GATE: "Propuesta lista. ¿Aprobás avanzar a Specifications?" -> STOP)
3. Specifications ('specs.md' -> GATE: "Specifications listas. ¿Aprobás avanzar a Technical Design?" -> STOP)
4. Design ('design.md' -> GATE: "Design listo. ¿Aprobás avanzar al checklist de Tasks?" -> STOP)
5. Tasks ('tasks.md' -> GATE: "Checklist de Tasks listo. ¿Aprobás iniciar Implementation?" -> STOP)
6. Apply (Implement code per tasks checklist -> GATE: "Checklist de tareas completado. ¿Aprobás pasar a Verification?" -> STOP)
7. Verify (Run tests & audit specs -> GATE: "Todos los tests pasaron y las specs están verificadas. ¿Aprobás archivar este cambio?" -> STOP)
8. Archive (Move change to archive/ and update living specs)

## Supported Triggers:
/sdd, /sdd-init, /sdd-new, /sdd-propose, /sdd-spec, /sdd-design, /sdd-tasks, /sdd-apply, /sdd-verify, /sdd-archive.
`;

export const CLAUDE_COMMANDS: Record<string, string> = {
  "sdd.md":
    'Execute the Spec-Driven Development (SDD) smart orchestrator in this project:\n1. Always communicate in Spanish (keep technical terms like tests, specs, design, tasks in English).\n2. STRICT STEP-BY-STEP: Execute strictly ONE phase per turn. NEVER batch multiple phases together.\n3. Check if \'openspec/\' exists on disk. If not, run \'sdd init\'.\n4. If no active change, ask user for feature name and run \'sdd new $ARGUMENTS\'.\n5. If active change exists, identify current phase and complete ONLY that phase.\n6. Present summary, ask the phase gate approval question in Spanish, and STOP IMMEDIATELY. Wait for user approval.',
  "sdd-init.md":
    'Check if \'openspec/\' exists in workspace. If not, run \'sdd init\' via the terminal tool to bootstrap the environment. Always communicate with user in Spanish.',
  "sdd-new.md":
    'Prompt user in Spanish for feature name (kebab-case) if not provided in arguments ($ARGUMENTS) and execute \'sdd new <feature-name>\' via the terminal tool.',
  "sdd-propose.md":
    'Help draft or refine proposal.md for the active change. Communicate in Spanish (keep technical terms in English). Address intent, scope, and capabilities. Resolve doubts with user. Present summary and ask: "Propuesta lista. ¿Aprobás avanzar a Specifications?" and STOP. Do NOT advance to specifications.',
  "sdd-spec.md":
    'Help draft or refine specs.md for the active change. Use RFC 2119 keywords and GIVEN/WHEN/THEN scenarios. Communicate in Spanish (keep technical terms in English). Present scenarios and ask: "Specifications listas. ¿Aprobás avanzar a Technical Design?" and STOP. Do NOT advance to technical design.',
  "sdd-design.md":
    'Help draft or refine design.md for the active change. Document technical approach, architecture decisions, tradeoffs, and target files. Communicate in Spanish (keep technical terms in English). Present design and ask: "Design listo. ¿Aprobás avanzar al checklist de Tasks?" and STOP. Do NOT advance to tasks checklist.',
  "sdd-tasks.md":
    'Help draft or refine tasks.md for the active change. Create atomic, verifiable checkboxes. Communicate in Spanish (keep technical terms in English). Present checklist and ask: "Checklist de Tasks listo. ¿Aprobás iniciar Implementation?" and STOP. Do NOT begin implementation.',
  "sdd-apply.md":
    'Implement pending tasks from tasks.md for the active change. Communicate in Spanish (keep technical terms in English). Read proposal.md, specs.md, design.md, and tasks.md. Implement each task step-by-step, running tests and marking checkboxes \'- [x]\' as they are completed. When all tasks are done, ask: "Checklist de tareas completado. ¿Aprobás pasar a Verification?" and STOP.',
  "sdd-verify.md":
    'Verify active change: run test suites, static analysis, and verify all requirements in specs.md. Remediate any failures. Communicate in Spanish (keep technical terms in English). When green, ask: "Todos los tests pasaron y las specs están verificadas. ¿Aprobás archivar este cambio?" and STOP.',
  "sdd-archive.md":
    'Ensure verification is complete and tests pass. Communicate in Spanish. Confirm with user: "Todos los tests pasaron y las specs están verificadas. ¿Aprobás archivar este cambio?". Upon confirmation, move change to openspec/changes/archive/YYYY-MM-DD-<feature>/ and update living specs in openspec/specs/.',
};

export async function injectDelimitedRule(filePath: string, content: string): Promise<void> {
  await ensureDir(path.dirname(filePath));
  const startMarker = "<!-- >>> SDD PROTOCOL >>> -->";
  const endMarker = "<!-- <<< SDD PROTOCOL <<< -->";
  let newContent = content.trim() + "\n";

  if (await fileExists(filePath)) {
    const existing = await fs.promises.readFile(filePath, "utf8");
    const regex = new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`, "g");
    if (regex.test(existing)) {
      newContent = existing.replace(regex, content.trim());
    } else {
      newContent = existing.trimEnd() + "\n\n" + content.trim() + "\n";
    }
  }
  await fs.promises.writeFile(filePath, newContent, "utf8");
}

function stripJsonc(content: string): string {
  return content
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*/g, "")
    .replace(/,\s*([\]}])/g, "$1");
}

export async function injectZedSettings(settingsPath: string): Promise<void> {
  await ensureDir(path.dirname(settingsPath));
  let settings: any = {};
  let leadingComments = "";

  if (await fileExists(settingsPath)) {
    const raw = await fs.promises.readFile(settingsPath, "utf8");
    const firstBrace = raw.indexOf("{");
    if (firstBrace > 0) {
      leadingComments = raw.slice(0, firstBrace).trim();
    }
    try {
      settings = JSON.parse(stripJsonc(raw));
    } catch {
      return;
    }
  }

  if (!settings.slash_commands) settings.slash_commands = {};
  if (!settings.assistant) settings.assistant = {};
  if (!settings.assistant.slash_commands) settings.assistant.slash_commands = {};

  const commands = {
    sdd: {
      description: "Execute Spec-Driven Development (SDD) smart orchestrator with interactive phase gates",
      text: 'Execute the Spec-Driven Development (SDD) lifecycle in this project:\n1. Always communicate in Spanish (keep technical terms like tests, specs, design, tasks in English).\n2. STRICT STEP-BY-STEP: Execute strictly ONE phase per turn. NEVER batch multiple phases together.\n3. Check if "openspec/" exists on disk. If not, run "sdd init".\n4. If no active change exists, ask for feature name and run "sdd new <feature-name>".\n5. If active change exists, identify current phase and complete ONLY that phase.\n6. Present summary, ask the phase gate approval question in Spanish, and STOP IMMEDIATELY. Wait for user approval.',
    },
    "sdd-init": {
      description: "Initialize Spec-Driven Development (SDD) / OpenSpec in current workspace",
      text: 'Check if "openspec/" exists. If not, execute "sdd init" via the terminal tool to bootstrap directory hierarchy, config, and AGENTS.md guidelines. Always communicate with user in Spanish.',
    },
    "sdd-new": {
      description: "Scaffold a new SDD change workspace",
      text: 'Prompt the user in Spanish for the feature or fix name (kebab-case) and execute "sdd new <feature-name>" via the terminal tool to scaffold the change workspace.',
    },
    "sdd-propose": {
      description: "Draft or refine the SDD change proposal (proposal.md)",
      text: 'Help draft or refine proposal.md for the active change. Communicate in Spanish (keep technical terms in English). Address intent, scope, and capabilities. Resolve doubts with user. Present summary, ask: "Propuesta lista. ¿Aprobás avanzar a Specifications?" and STOP. Do NOT advance to specifications.',
    },
    "sdd-spec": {
      description: "Draft or refine formal specifications (specs.md) with Given/When/Then scenarios",
      text: 'Help draft or refine specs.md for the active change. Use RFC 2119 keywords and GIVEN/WHEN/THEN scenarios. Communicate in Spanish (keep technical terms in English). Present scenarios, ask: "Specifications listas. ¿Aprobás avanzar a Technical Design?" and STOP. Do NOT advance to technical design.',
    },
    "sdd-design": {
      description: "Draft technical design (design.md) with architecture decisions and tradeoffs",
      text: 'Help draft or refine design.md for the active change. Document technical approach, architecture decisions, tradeoffs, and target files. Communicate in Spanish (keep technical terms in English). Present design, ask: "Design listo. ¿Aprobás avanzar al checklist de Tasks?" and STOP. Do NOT advance to tasks checklist.',
    },
    "sdd-tasks": {
      description: "Break down implementation tasks checklist (tasks.md)",
      text: 'Help draft or refine tasks.md for the active change. Create atomic, verifiable checkboxes. Communicate in Spanish (keep technical terms in English). Present checklist, ask: "Checklist de Tasks listo. ¿Aprobás iniciar Implementation?" and STOP. Do NOT begin implementation.',
    },
    "sdd-apply": {
      description: "Implement tasks from tasks.md checklist for the active change",
      text: 'Implement pending tasks from tasks.md for the active change. Communicate in Spanish (keep technical terms in English). Read proposal.md, specs.md, design.md, and tasks.md. Implement each task step-by-step, running tests and marking checkboxes "- [x]" as they are completed. When all tasks are done, ask: "Checklist de tareas completado. ¿Aprobás pasar a Verification?" and STOP.',
    },
    "sdd-verify": {
      description: "Verify implementation: execute tests, lint, and audit compliance against specs",
      text: 'Verify the active change: run test suites, static analysis, and verify all requirements in specs.md. Remediate any failures. Communicate in Spanish (keep technical terms in English). When green, ask: "Todos los tests pasaron y las specs están verificadas. ¿Aprobás archivar este cambio?" and STOP.',
    },
    "sdd-archive": {
      description: "Verify and archive completed SDD change, syncing living specs",
      text: 'Ensure verification is complete and tests pass. Communicate in Spanish. Confirm with the user: "Todos los tests pasaron y las specs están verificadas. ¿Aprobás archivar este cambio?". Upon confirmation, move the change to openspec/changes/archive/YYYY-MM-DD-<feature>/ and update living specs in openspec/specs/.',
    },
  };

  for (const [name, def] of Object.entries(commands)) {
    const entry = {
      description: def.description,
      prompt: def.text,
      text: def.text,
    };
    settings.slash_commands[name] = entry;
    settings.assistant.slash_commands[name] = entry;
  }

  const output = (leadingComments ? leadingComments + "\n" : "") + JSON.stringify(settings, null, 2) + "\n";
  await fs.promises.writeFile(settingsPath, output, "utf8");
}

export const GRANULAR_SKILLS: Record<string, { description: string; instructions: string }> = {
  sdd: {
    description: "Spec-Driven Development (SDD) smart orchestrator with interactive phase gates",
    instructions: `Execute the Spec-Driven Development (SDD) lifecycle in this project:\n1. Always communicate in Spanish (keep technical terms in English like tests, specs, design, tasks, bug, refactor, commit, etc.).\n2. STRICT STEP-BY-STEP: Execute strictly ONE phase per turn. NEVER generate multiple phases together.\n3. Check if "openspec/" exists on disk. If not, run "sdd init".\n4. If no active change exists, ask user for feature name and run "sdd new <feature-name>".\n5. If active change exists, identify current phase and complete ONLY that phase.\n6. At the end of the phase, present the summary, ask the gate approval question in Spanish, and STOP IMMEDIATELY. Wait for user response.`,
  },
  "sdd-init": {
    description: "Initialize Spec-Driven Development (SDD) / OpenSpec in current workspace",
    instructions: 'Check if "openspec/" exists. If not, execute "sdd init" via the terminal tool to bootstrap directory hierarchy, config, and AGENTS.md guidelines. Always communicate with user in Spanish.',
  },
  "sdd-new": {
    description: "Scaffold a new SDD change workspace",
    instructions: 'Prompt the user in Spanish for the feature or fix name (kebab-case) and execute "sdd new <feature-name>" via the terminal tool to scaffold the change workspace.',
  },
  "sdd-propose": {
    description: "Draft or refine the SDD change proposal (proposal.md)",
    instructions: 'Help draft or refine proposal.md for the active change. Communicate in Spanish (keep technical terms like tests, specs, design in English). Address intent, scope, and capabilities. Resolve doubts with user. Present summary, ask: "Propuesta lista. ¿Aprobás avanzar a Specifications?" and STOP. Do NOT advance to specifications.',
  },
  "sdd-spec": {
    description: "Draft or refine formal specifications (specs.md) with Given/When/Then scenarios",
    instructions: 'Help draft or refine specs.md for the active change. Use RFC 2119 keywords and Given/When/Then scenarios. Communicate in Spanish (keep technical terms in English). Present scenarios, ask: "Specifications listas. ¿Aprobás avanzar a Technical Design?" and STOP. Do NOT advance to technical design.',
  },
  "sdd-design": {
    description: "Draft technical design (design.md) with architecture decisions and tradeoffs",
    instructions: 'Help draft or refine design.md for the active change. Document technical approach, architecture decisions, tradeoffs, and target files. Communicate in Spanish (keep technical terms in English). Present design, ask: "Design listo. ¿Aprobás avanzar al checklist de Tasks?" and STOP. Do NOT advance to tasks checklist.',
  },
  "sdd-tasks": {
    description: "Break down implementation tasks checklist (tasks.md)",
    instructions: 'Help draft or refine tasks.md for the active change. Create atomic, verifiable checkboxes. Communicate in Spanish (keep technical terms in English). Present checklist, ask: "Checklist de Tasks listo. ¿Aprobás iniciar Implementation?" and STOP. Do NOT begin implementation.',
  },
  "sdd-apply": {
    description: "Implement tasks from tasks.md checklist for the active change",
    instructions: 'Implement pending tasks from tasks.md for the active change. Communicate in Spanish (keep technical terms in English). Read proposal.md, specs.md, design.md, and tasks.md. Implement each task step-by-step, running tests and marking checkboxes "- [x]" as they are completed. When all tasks are done, ask: "Checklist de tareas completado. ¿Aprobás pasar a Verification?" and STOP.',
  },
  "sdd-verify": {
    description: "Verify implementation: execute tests, lint, and audit compliance against specs",
    instructions: 'Verify the active change: run test suites, static analysis, and verify all requirements in specs.md. Remediate any failures. Communicate in Spanish (keep technical terms in English). When green, ask: "Todos los tests pasaron y las specs están verificadas. ¿Aprobás archivar este cambio?" and STOP.',
  },
  "sdd-archive": {
    description: "Verify and archive completed SDD change, syncing living specs",
    instructions: 'Ensure verification is complete and tests pass. Communicate in Spanish. Confirm with user: "Todos los tests pasaron y las specs están verificadas. ¿Aprobás archivar este cambio?". Upon confirmation, move the change to openspec/changes/archive/YYYY-MM-DD-<feature>/ and update living specs in openspec/specs/.',
  },
};

export async function provisionEnvironment(
  id: EnvironmentId,
  homedir: string = os.homedir()
): Promise<void> {
  const isWindows = process.platform === "win32";
  const appData = process.env.APPDATA || path.join(homedir, "AppData", "Roaming");

  const resolveZedDir = () => {
    if (isWindows) {
      return path.join(homedir, "AppData", "Roaming", "Zed");
    }
    return path.join(homedir, ".config", "zed");
  };

  switch (id) {
    case "antigravity_2": {
      const skillPath = path.join(homedir, ".gemini", "config", "skills", "sdd", "SKILL.md");
      await writeFileSafe(skillPath, SKILL_CONTENT, true);
      break;
    }
    case "agy_cli": {
      const skillPath = path.join(homedir, ".gemini", "skills", "sdd", "SKILL.md");
      await writeFileSafe(skillPath, SKILL_CONTENT, true);
      break;
    }
    case "codex": {
      const skillPath = path.join(homedir, ".codex", "skills", "sdd", "SKILL.md");
      const rulePath = path.join(homedir, ".codex", "AGENTS.md");
      await writeFileSafe(skillPath, SKILL_CONTENT, true);
      await injectDelimitedRule(rulePath, SDD_RULE_BLOCK);
      break;
    }
    case "copilot": {
      const skillPath = path.join(homedir, ".copilot", "skills", "sdd", "SKILL.md");
      const rulePath = path.join(homedir, ".copilot", "copilot-instructions.md");
      await writeFileSafe(skillPath, SKILL_CONTENT, true);
      await injectDelimitedRule(rulePath, SDD_RULE_BLOCK);
      break;
    }
    case "opencode": {
      const skillPath = path.join(homedir, ".config", "opencode", "skills", "sdd", "SKILL.md");
      const rulePath = path.join(homedir, ".config", "opencode", "AGENTS.md");
      await writeFileSafe(skillPath, SKILL_CONTENT, true);
      await injectDelimitedRule(rulePath, SDD_RULE_BLOCK);
      break;
    }
    case "claude": {
      const skillPath = path.join(homedir, ".claude", "skills", "sdd", "SKILL.md");
      const rulePath = path.join(homedir, ".claude", "CLAUDE.md");
      await writeFileSafe(skillPath, SKILL_CONTENT, true);
      await injectDelimitedRule(rulePath, SDD_RULE_BLOCK);

      const commandsDir = path.join(homedir, ".claude", "commands");
      for (const [cmdFile, content] of Object.entries(CLAUDE_COMMANDS)) {
        await writeFileSafe(path.join(commandsDir, cmdFile), content, true);
      }
      break;
    }
    case "cursor": {
      const skillPath = path.join(homedir, ".cursor", "skills", "sdd", "SKILL.md");
      const rulePath = path.join(homedir, ".cursor", "rules", "sdd.mdc");
      await writeFileSafe(skillPath, SKILL_CONTENT, true);
      await writeFileSafe(rulePath, CURSOR_RULE_CONTENT, true);
      break;
    }
    case "zed": {
      const zedDir = resolveZedDir();
      const skillPath = path.join(zedDir, "skills", "sdd", "SKILL.md");
      const rulePath = path.join(zedDir, "AGENTS.md");
      const settingsPath = path.join(zedDir, "settings.json");

      await writeFileSafe(skillPath, SKILL_CONTENT, true);
      await injectDelimitedRule(rulePath, SDD_RULE_BLOCK);
      await injectZedSettings(settingsPath);

      // Universal Agent Skills for Zed Assistant
      const agentSkillsDir = path.join(homedir, ".agents", "skills");
      for (const [name, def] of Object.entries(GRANULAR_SKILLS)) {
        const skillFile = path.join(agentSkillsDir, name, "SKILL.md");
        const content = `---\nname: ${name}\ndescription: "${def.description}"\n---\n\n# ${def.description}\n\n${def.instructions}\n`;
        await writeFileSafe(skillFile, content, true);
      }
      break;
    }
  }
}
