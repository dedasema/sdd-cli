import { describe, it, expect } from "vitest";
import { GatedMultiSelectPrompt } from "../src/prompts/multiselect.js";

describe("Gated MultiSelect Prompt", () => {
  it("prevents toggling disabled options with toggleValue", () => {
    const prompt = new GatedMultiSelectPrompt({
      options: [
        { value: "zed", label: "Zed", disabled: false },
        { value: "cursor", label: "Cursor", disabled: true },
      ],
      render() {
        return "";
      },
    });

    // Cursor at index 0 (enabled: zed)
    prompt.cursor = 0;
    prompt.toggleValue();
    expect(prompt.value).toEqual(["zed"]);

    // Cursor at index 1 (disabled: cursor)
    prompt.cursor = 1;
    prompt.toggleValue();
    // Cursor should NOT be added
    expect(prompt.value).toEqual(["zed"]);
  });

  it("toggleAll selects only enabled options and ignores disabled options", () => {
    const prompt = new GatedMultiSelectPrompt({
      options: [
        { value: "antigravity_2", label: "Antigravity 2.0", disabled: true },
        { value: "copilot", label: "Copilot", disabled: false },
        { value: "zed", label: "Zed", disabled: false },
      ],
      render() {
        return "";
      },
    });

    // Toggle all initially
    prompt.toggleAll();
    expect(prompt.value).toEqual(["copilot", "zed"]);

    // Toggle all again when all enabled are selected -> should clear
    prompt.toggleAll();
    expect(prompt.value).toEqual([]);
  });

  it("respects initialValues if provided, filtering out any disabled entries", () => {
    const prompt = new GatedMultiSelectPrompt({
      options: [
        { value: "copilot", label: "Copilot", disabled: false },
        { value: "zed", label: "Zed", disabled: true },
      ],
      initialValues: ["copilot", "zed"],
      render() {
        return "";
      },
    });

    expect(prompt.value).toEqual(["copilot"]);
  });
});
