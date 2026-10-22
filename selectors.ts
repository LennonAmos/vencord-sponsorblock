/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Lennydev
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export interface BlockOptions {
    hideQuests: boolean;
    hideSponsoredContent: boolean;
    hideNitroPromotions: boolean;
    hideStoreNavigation: boolean;
    hideGiftButton: boolean;
}

// Match complete CSS-module names, independent of Discord's changing hashes.
// A plain substring such as "ad" would also match avatars, headers and messages.
function moduleClass(name: string): string {
    return `:is([class^="${name}_"], [class*=" ${name}_"])`;
}

// Never hide user messages, embeds, the composer, or Vencord's own settings.
const protectedContent = ":where([id^='chat-messages-'], [id^='chat-messages-'] *, [data-list-item-id^='chat-messages'], [data-list-item-id^='chat-messages'] *, [class*='messageListItem_'], [class*='messageListItem_'] *, [class*='vc-plugin-'], [class*='vc-plugin-'] *)";

export function buildCss(options: BlockOptions): string {
    const selectors: string[] = [];
    const addClasses = (...names: string[]) => selectors.push(...names.map(moduleClass));
    const privateChannels = moduleClass("privateChannels");
    const channel = moduleClass("channel");
    const hideNavigation = (href: string) => selectors.push(
        `${privateChannels} ${channel}:has(a[href="${href}"])`
    );

    if (options.hideQuests) {
        // The first rule removes the complete promoted Active Now card, including
        // its friend header and spacing. Confirmed against Discord desktop.
        selectors.push(`${moduleClass("itemCard")}:has(${moduleClass("questCardContextMenuTrigger")})`);
        addClasses(
            "questCardContextMenuTrigger", "questCard", "questTile", "questBanner",
            "questBar", "questPanel", "questPromotion", "questPromo", "questButton",
            "questsButton", "questBadge", "questEntryPoint", "questDiscoveryCard"
        );
        hideNavigation("/quest-home");
    }

    if (options.hideSponsoredContent) {
        // Structural markers only: no keyword scanning of people's messages,
        // usernames, activities, or game titles.
        addClasses("sponsoredCard", "promotedCard", "sponsorCard", "advertisement", "adCard", "adBanner", "sponsoredBanner");
        selectors.push('[data-sponsored="true"]', '[data-promoted="true"]', '[data-advertisement="true"]');
        selectors.push(`${moduleClass("itemCard")}:has([data-sponsored="true"], [data-promoted="true"], ${moduleClass("sponsoredCard")}, ${moduleClass("promotedCard")})`);
    }

    if (options.hideNitroPromotions) {
        addClasses(
            "nitroPromo", "nitroPromotion", "nitroUpsell", "premiumPromo",
            "premiumPromotion", "premiumUpsell", "premiumTrialOffer",
            "premiumTrialAck", "upsellContainer", "upsellBanner", "nitroTrialBanner"
        );
    }

    if (options.hideStoreNavigation) {
        hideNavigation("/store");
        hideNavigation("/shop");
    }

    if (options.hideGiftButton) {
        addClasses("giftButton", "giftIconButton");
        // Accessibility fallback for English clients; CSS-module rules also
        // work in other locales. This never matches the message editor itself.
        selectors.push('button[aria-label="Send a gift"]', 'button[aria-label="Send a Gift"]');
    }

    return selectors.length
        ? `${selectors.map(selector => `${selector}:not(${protectedContent})`).join(",\n")} { display: none !important; }\n`
        : "";
}
