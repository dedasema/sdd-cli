# Design: Native Zed Editor Support

## Technical Approach

Zed configuration resides in `%APPDATA%\Zed` on Windows and `~/.config/zed` on Unix/macOS. We configure:
1. **Global Rule**: Injected via `Inject-DelimitedRule` into `AGENTS.md`.
2. **Agent Skill**: Deployed to `skills/sdd/SKILL.md`.
3. **Slash Command**: Safely injected into `settings.json` under `assistant.slash_commands.sdd` using a Node.js snippet.

## Target Paths for Zed

| Platform | Root Path | Global Rule | Slash Command | Skill |
|---|---|---|---|---|
| **Windows** | `%APPDATA%\Zed` | `AGENTS.md` | `settings.json` | `skills\sdd\SKILL.md` |
| **Unix / macOS** | `~/.config/zed` | `AGENTS.md` | `settings.json` | `skills/sdd/SKILL.md` |

## Slash Command Payload

```json
{
  "description": "Execute Spec-Driven Development (SDD) autonomous protocol",
  "text": "Execute the Spec-Driven Development (SDD) lifecycle in this project:\n1. Check if 'openspec/' exists. If not, run 'sdd init'.\n2. For any new feature or fix, run 'sdd new <feature-name>'.\n3. Follow proposal, specs (Given/When/Then), design, and tasks before coding.\n4. Never vibe-code: wait for user approval on specifications."
}
```

## File Changes

| File | Action | Description |
|---|---|---|
| `scripts/install.ps1` | Modify | Add option 8, Zed path resolution, settings.json injection |
| `scripts/install.sh` | Modify | Add option 8, Zed path resolution, settings.json injection |
| `scripts/uninstall.ps1` | Modify | Add option 8 cleanup for Zed |
| `scripts/uninstall.sh` | Modify | Add option 8 cleanup for Zed |
| `README.md` | Modify | Document Zed editor support |

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Isolated Provisioning | Run installer logic for option `8` only | Verify only Zed directory is touched and contains all 3 assets |
| Non-destructive settings.json | Pre-populate `settings.json` with user theme/font | Verify user settings remain untouched while `assistant.slash_commands.sdd` is added |
| Surgical Uninstallation | Run uninstaller logic for option `8` | Verify Zed SDD assets are removed and user settings restored |
