# SponsorBlock for Vencord

A Vencord **custom userplugin** that hides recognized Discord promotional UI, including the promoted Quest cards in Friends → Active Now. It is independent of, and unaffiliated with, the SponsorBlock video project. It does not use the SponsorBlock API.

## What it hides

All five options default to enabled and can be changed without restarting Discord:

| Option | Coverage |
| --- | --- |
| Quests | Promoted Quest activity cards, recognized Quest banners/panels, and the Quests sidebar shortcut |
| Sponsored content | Cards with recognized sponsored/promoted/ad CSS-module names or explicit data markers |
| Nitro promotions | Nitro partner reward popups (including “Bring Nitro to your loadout”), recognized upsell banners and trial promotions |
| Store navigation | Nitro Home and Shop in the direct-message sidebar |
| Gift button | The Nitro gift button beside the message composer |

Normal friend activity, DMs, messages, and message embeds remain visible. The plugin does not scan message text, usernames, or game titles for advertising words. The Nitro partner-marketing renderer is patched specifically; ordinary popovers are preserved. Restart Discord after enabling or disabling the plugin. Its five options apply immediately without a restart.

## Install

This is not an official bundled Vencord plugin or a browser extension. Vencord custom plugins must be compiled into a source build; dropping this folder into the standard installed Vencord directory will not load it.

1. Follow [Vencord's source installation guide](https://docs.vencord.dev/installing/).
2. From your Vencord source checkout, run:

   ```sh
   git clone https://github.com/LennonAmos/vencord-sponsorblock.git src/userplugins/sponsorBlock
   pnpm install --frozen-lockfile
   pnpm build --disable-updater
   pnpm inject
   ```

3. Restart Discord, then enable **Settings → Vencord → Plugins → SponsorBlock**.
4. Open its settings to select which promotional surfaces to hide.

See the [official custom-plugin instructions](https://docs.vencord.dev/installing/custom-plugins/) for supported folder layouts and rebuild instructions. `--disable-updater` prevents an official update from replacing the custom build. Update the Vencord source and this plugin, rebuild, and inject again when you want to update.

## Scope and limitations

This is a visual filter. It does **not** block ad network requests, tracking, sponsored videos inside external embeds, or advertisements posted by people or bots. It cannot guarantee coverage of every promotion: Discord can introduce new UI or rename its CSS modules. Existing selectors match semantic class names independently of their changing hash suffixes. The promoted Quest card, store navigation, and “Bring Nitro to your loadout” partner popup were verified against a live Discord desktop session; other recognized surfaces have browser fixture coverage.

The partner-marketing patch omits the complete advertising popover portal while preserving its navigation trigger. It does not click “Unlock Reward”, dismiss a campaign, open a payment screen, or change account promotion preferences. No network calls, telemetry, credentials, native code, or external services are used by this plugin. No affiliation with Discord, Vencord, or SponsorBlock is implied.

## Development and verification

Version 1.1.0 was built and type-checked with Vencord 1.15.12, commit `b0e636df2ed5c9006b80ddc6644bc41110404bc3`.

To run the browser regression checks from this plugin folder:

```sh
npm install
npm test
```

An installed Edge, Chrome, or Chromium is required. Set `BROWSER_PATH` if it is not detected. Tests use synthetic HTML, not your Discord account. They verify complete Quest-card removal, ordinary content preservation, message exclusion, changing CSS hashes, dynamically inserted cards, settings toggles, and plugin start/stop cleanup. The Vencord API is mocked for these tests; use Vencord's TypeScript and lint checks when changing the integration.

To remove: disable SponsorBlock in Vencord and restart Discord. To remove it from the build, delete `src/userplugins/sponsorBlock`, rebuild Vencord, and inject again.

## License

GPL-3.0-or-later. See [LICENSE](LICENSE).
