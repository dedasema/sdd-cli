import { MultiSelectPrompt } from "@clack/core";
import color from "picocolors";

export interface GatedOption<Value> {
  value: Value;
  label?: string;
  hint?: string;
  disabled?: boolean;
}

export interface GatedMultiSelectOptions<Value> {
  message: string;
  options: GatedOption<Value>[];
  initialValues?: Value[];
  required?: boolean;
  cursorAt?: Value;
  maxItems?: number;
}

const BasePrompt = MultiSelectPrompt as unknown as new (
  opts: any
) => any;

export class GatedMultiSelectPrompt<Value = any> extends BasePrompt {
  declare options: GatedOption<Value>[];
  declare cursor: number;
  declare value: Value[];
  declare state: string;

  constructor(opts: any) {
    super(opts);
    if (this.value && this.options) {
      const disabledValues = new Set(
        this.options.filter((o) => o.disabled).map((o) => o.value)
      );
      this.value = this.value.filter((v: Value) => !disabledValues.has(v));
    }
  }

  toggleValue(): void {
    const currentOption = this.options[this.cursor];
    if (currentOption && currentOption.disabled) {
      return;
    }
    const val = currentOption.value;
    const exists = this.value.includes(val);
    this.value = exists
      ? this.value.filter((v: Value) => v !== val)
      : [...this.value, val];
  }

  toggleAll(): void {
    const enabledOptions = this.options.filter((o) => !o.disabled);
    const allEnabledSelected =
      enabledOptions.length > 0 &&
      enabledOptions.every((o) => this.value.includes(o.value));

    this.value = allEnabledSelected ? [] : enabledOptions.map((o) => o.value);
  }
}

export async function gatedMultiselect<Value>(
  opts: GatedMultiSelectOptions<Value>
): Promise<Value[] | symbol> {
  const S_CHECKBOX_ACTIVE = "◻";
  const S_CHECKBOX_SELECTED = "◼";
  const S_CHECKBOX_INACTIVE = "◻";
  const S_BAR = "│";
  const S_BAR_END = "└";
  const S_STEP_ACTIVE = "◆";

  const optRenderer = (
    option: GatedOption<Value>,
    state: "inactive" | "active" | "selected" | "active-selected" | "submitted" | "cancelled"
  ) => {
    const label = option.label ?? String(option.value);
    if (option.disabled) {
      const hint = option.hint ? ` (${option.hint})` : " (not installed)";
      if (state === "active" || state === "active-selected") {
        return `${color.cyan("[-]")} ${color.dim(label)}${color.dim(hint)}`;
      }
      return `${color.dim("[-] " + label + hint)}`;
    }

    if (state === "active") {
      return `${color.cyan(S_CHECKBOX_ACTIVE)} ${label} ${
        option.hint ? color.dim(`(${option.hint})`) : ""
      }`;
    }
    if (state === "selected") {
      return `${color.green(S_CHECKBOX_SELECTED)} ${color.dim(label)}`;
    }
    if (state === "active-selected") {
      return `${color.green(S_CHECKBOX_SELECTED)} ${label} ${
        option.hint ? color.dim(`(${option.hint})`) : ""
      }`;
    }
    if (state === "submitted") {
      return `${color.dim(label)}`;
    }
    if (state === "cancelled") {
      return `${color.strikethrough(color.dim(label))}`;
    }
    return `${color.dim(S_CHECKBOX_INACTIVE)} ${color.dim(label)}`;
  };

  return new GatedMultiSelectPrompt<Value>({
    options: opts.options,
    initialValues: opts.initialValues,
    required: opts.required ?? false,
    cursorAt: opts.cursorAt,
    validate(selected: Value[]) {
      if (this.required && selected.length === 0) {
        return `Please select at least one option.`;
      }
    },
    render() {
      const title = `${color.gray(S_BAR)}\n${color.cyan(S_STEP_ACTIVE)}  ${opts.message}\n`;

      const styleOption = (option: GatedOption<Value>, active: boolean) => {
        const selected = this.value.includes(option.value);
        if (active && selected) {
          return optRenderer(option, "active-selected");
        }
        if (selected) {
          return optRenderer(option, "selected");
        }
        return optRenderer(option, active ? "active" : "inactive");
      };

      switch (this.state) {
        case "submit": {
          const selectedLabels = this.options
            .filter(({ value }: any) => this.value.includes(value))
            .map((option: any) => optRenderer(option, "submitted"))
            .join(color.dim(", "));
          return `${title}${color.gray(S_BAR)}  ${selectedLabels || color.dim("none")}`;
        }
        case "cancel": {
          return `${title}${color.gray(S_BAR)}  ${color.strikethrough(color.dim("cancelled"))}\n${color.gray(S_BAR)}`;
        }
        default: {
          const lines = this.options
            .map((option: any, i: number) => styleOption(option, i === this.cursor))
            .join(`\n${color.cyan(S_BAR)}  `);
          return `${title}${color.cyan(S_BAR)}  ${lines}\n${color.cyan(S_BAR_END)}\n`;
        }
      }
    },
  }).prompt() as Promise<Value[] | symbol>;
}
