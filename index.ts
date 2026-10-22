/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Lennydev
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import definePlugin, { OptionType } from "@utils/types";

import { buildCss } from "./selectors";

const STYLE_ID = "vc-sponsorblock-style";
let active = false;
let style: HTMLStyleElement | undefined;

function updateStyle() {
    if (!active) return;
    if (!style?.isConnected) {
        style = document.createElement("style");
        style.id = STYLE_ID;
        document.documentElement.append(style);
    }
    style.textContent = buildCss(settings.store);
}

const settings = definePluginSettings({
    hideQuests: {
        type: OptionType.BOOLEAN,
        description: "Hide promoted Quest activity cards, Quest banners and the Quests shortcut.",
        default: true,
        onChange: updateStyle
    },
    hideSponsoredContent: {
        type: OptionType.BOOLEAN,
        description: "Hide Discord UI cards explicitly marked as promoted, sponsored or advertisements.",
        default: true,
        onChange: updateStyle
    },
    hideNitroPromotions: {
        type: OptionType.BOOLEAN,
        description: "Hide recognized Nitro upsell banners and trial promotions.",
        default: true,
        onChange: updateStyle
    },
    hideStoreNavigation: {
        type: OptionType.BOOLEAN,
        description: "Hide Nitro Home and Shop links in the direct-message sidebar.",
        default: true,
        onChange: updateStyle
    },
    hideGiftButton: {
        type: OptionType.BOOLEAN,
        description: "Hide the Nitro gift button beside the message composer.",
        default: true,
        onChange: updateStyle
    }
});

export default definePlugin({
    name: "SponsorBlock",
    description: "Hides Discord Quest promotions, recognized sponsored cards, Nitro upsells and store shortcuts. Unaffiliated with the SponsorBlock video project.",
    authors: [{ name: "Lennydev", id: 0n }],
    tags: ["Appearance", "Utility"],
    settings,
    start() {
        active = true;
        updateStyle();
    },
    stop() {
        active = false;
        style?.remove();
        style = undefined;
    }
});
