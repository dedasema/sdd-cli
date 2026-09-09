import { promises as fs } from "node:fs";
import path from "node:path";

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function ensureDir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

export async function writeFileSafe(
  filePath: string,
  content: string,
  overwrite = false
): Promise<{ written: boolean; reason?: string }> {
  const exists = await fileExists(filePath);
  if (exists && !overwrite) {
    return { written: false, reason: "File already exists" };
  }
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content, "utf-8");
  return { written: true };
}

export function isKebabCase(value: string): boolean {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(value);
}

export function parseTasksProgress(tasksContent: string): {
  total: number;
  completed: number;
  percentage: number;
} {
  const taskRegex = /-\s*\[([ xX])\]/g;
  let total = 0;
  let completed = 0;

  let match: RegExpExecArray | null;
  while ((match = taskRegex.exec(tasksContent)) !== null) {
    total++;
    if (match[1].toLowerCase() === "x") {
      completed++;
    }
  }

  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { total, completed, percentage };
}
