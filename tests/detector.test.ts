import { describe, it, expect } from "vitest";
import { detectEnvironment, detectAllEnvironments, type EnvironmentId } from "../src/utils/detector.js";

describe("Environment Detector", () => {
  it("detects environment when executable is in PATH", () => {
    const customEnv = {
      PATH: "C:\\bin",
      PATHEXT: ".EXE;.CMD",
    };
    const mockFs = (targetPath: string) => targetPath.toLowerCase().includes("zed.exe");

    const isInstalled = detectEnvironment("zed", {
      env: customEnv,
      fsExists: mockFs,
      homedir: "C:\\Users\\MockUser",
    });

    expect(isInstalled).toBe(true);
  });

  it("detects environment when standard application directory exists", () => {
    const customEnv = {
      PATH: "",
      PATHEXT: ".EXE",
      LOCALAPPDATA: "C:\\Users\\MockUser\\AppData\\Local",
    };
    const mockFs = (targetPath: string) => targetPath.includes("Programs\\cursor");

    const isInstalled = detectEnvironment("cursor", {
      env: customEnv,
      fsExists: mockFs,
      homedir: "C:\\Users\\MockUser",
    });

    expect(isInstalled).toBe(true);
  });

  it("reports environment as not installed when absent from PATH and disk", () => {
    const customEnv = {
      PATH: "",
      PATHEXT: ".EXE",
    };
    const mockFs = () => false;

    const isInstalled = detectEnvironment("claude", {
      env: customEnv,
      fsExists: mockFs,
      homedir: "C:\\Users\\MockUser",
    });

    expect(isInstalled).toBe(false);
  });

  it("detectAllEnvironments scans all 8 supported AI environments", () => {
    const mockFs = (targetPath: string) => targetPath.toLowerCase().includes("zed");
    const customEnv = {
      PATH: "C:\\bin",
      PATHEXT: ".EXE",
    };

    const results = detectAllEnvironments({
      env: customEnv,
      fsExists: mockFs,
      homedir: "C:\\Users\\MockUser",
    });

    expect(results).toHaveLength(8);

    const zedInfo = results.find((r) => r.id === "zed");
    expect(zedInfo).toBeDefined();
    expect(zedInfo?.installed).toBe(true);

    const claudeInfo = results.find((r) => r.id === "claude");
    expect(claudeInfo).toBeDefined();
    expect(claudeInfo?.installed).toBe(false);
  });
});
