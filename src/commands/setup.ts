import * as p from "@clack/prompts";
import pc from "picocolors";
import { detectAllEnvironments, type EnvironmentId } from "../utils/detector.js";
import { gatedMultiselect, type GatedOption } from "../prompts/multiselect.js";
import { provisionEnvironment } from "../utils/provisioner.js";

export interface SetupOptions {
  all?: boolean;
  silent?: boolean;
  homedir?: string;
  detectedEnvironments?: EnvironmentId[];
}

export async function setupCommand(options: SetupOptions = {}): Promise<{
  success: boolean;
  selected: EnvironmentId[];
  message: string;
}> {
  if (!options.silent) {
    p.intro(pc.bgCyan(pc.black(" sdd setup ")));
  }

  const allEnvs = detectAllEnvironments({ homedir: options.homedir });

  if (options.detectedEnvironments) {
    const detectedSet = new Set(options.detectedEnvironments);
    for (const env of allEnvs) {
      env.installed = detectedSet.has(env.id);
    }
  }

  let selected: EnvironmentId[] = [];

  if (options.all) {
    selected = allEnvs.filter((e) => e.installed).map((e) => e.id);
  } else {
    const promptOptions: GatedOption<EnvironmentId>[] = allEnvs.map((env) => ({
      value: env.id,
      label: `${env.name.padEnd(26)} (${env.configPathHint})`,
      disabled: !env.installed,
      hint: env.installed ? undefined : "not installed",
    }));

    const defaultInitial = allEnvs.filter((e) => e.installed).map((e) => e.id);

    const result = await gatedMultiselect<EnvironmentId>({
      message: "Select AI environments to configure (Space to toggle, Enter to confirm):",
      options: promptOptions,
      initialValues: defaultInitial,
      required: false,
    });

    if (p.isCancel(result)) {
      if (!options.silent) {
        p.cancel("Setup cancelled by user.");
      }
      return {
        success: false,
        selected: [],
        message: "Setup cancelled by user.",
      };
    }

    selected = result as EnvironmentId[];
  }

  if (selected.length === 0) {
    const msg = "No environments selected for configuration.";
    if (!options.silent) {
      p.log.warn(pc.yellow(msg));
      p.outro(pc.dim("Zero changes applied."));
    }
    return {
      success: true,
      selected: [],
      message: msg,
    };
  }

  for (const id of selected) {
    await provisionEnvironment(id, options.homedir);
    const envMeta = allEnvs.find((e) => e.id === id);
    if (!options.silent) {
      p.log.success(pc.green(`Provisioned ${envMeta?.name || id}`));
    }
  }

  const completionMsg = `Successfully provisioned ${selected.length} environment(s).`;
  if (!options.silent) {
    p.outro(pc.bgGreen(pc.black(` ${completionMsg} `)));
  }

  return {
    success: true,
    selected,
    message: completionMsg,
  };
}
