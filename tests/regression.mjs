// SPDX-License-Identifier: GPL-3.0-or-later
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import puppeteer from "puppeteer-core";
const executablePath = process.env.BROWSER_PATH || [
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "/usr/bin/chromium", "/usr/bin/google-chrome",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
].find(existsSync);
if (!executablePath) throw new Error("Set BROWSER_PATH to an installed Chrome, Chromium or Edge executable.");
const { outputFiles } = await build({
    entryPoints: [fileURLToPath(new URL("../index.ts", import.meta.url))],
    bundle: true, write: false, format: "iife", globalName: "TestPlugin",
    plugins: [{
        name: "vencord-test-api",
        setup(api) {
            api.onResolve({ filter: /^@(api\/Settings|utils\/types)$/ }, args => ({ path: args.path, namespace: "mock" }));
            api.onLoad({ filter: /.*/, namespace: "mock" }, args => ({ contents: args.path === "@api/Settings"
                ? `export function definePluginSettings(def) {
                    const store = Object.fromEntries(Object.entries(def).map(([key,value]) => [key,value.default]));
                    globalThis.testSettings = { store, def };
                    return globalThis.testSettings;
                }`
                : 'export const OptionType = { BOOLEAN: 1 }; export default value => value;'
            }));
        }
    }]
});
const browser = await puppeteer.launch({ executablePath, headless: true });
try {
    const page = await browser.newPage();
    await page.setContent(`<!doctype html><html><head></head><body>
        <div class="itemCard__7e549" id="quest"><div><div class="questCardContextMenuTrigger__7e549"><button>Accept Quest</button></div></div></div>
        <div class="itemCard__newhash" id="ordinary">Playing a game</div>
        <div class="itemCard__newhash" id="sponsor"><span data-sponsored="true">Ad</span></div>
        <div class="unrelated promotedCard_newhash extra" id="promoted">Promotion</div>
        <div class="questBanner_abc" id="banner">Quest</div>
        <div class="premiumTrialOffer_abc" id="trial">Try Nitro</div>
        <div class="privateChannels_abc">
          <div class="channel__abc" id="shop"><div><a href="/shop">Shop</a></div></div>
          <div class="channel__abc" id="nitro"><a href="/store">Nitro Home</a></div>
          <div class="channel__abc" id="questnav"><a href="/quest-home">Quests</a></div>
          <div class="channel__abc" id="friend"><a href="/channels/@me/123">Friend</a></div>
        </div>
        <div id="chat-messages-123-456"><div class="promotedCard_abc" data-sponsored="true" id="message">Sponsored is a word in a message</div><a href="/shop" id="chatlink">Shop link</a></div>
        <div class="messageListItem_abc"><div class="adCard_xyz" id="message2">Another message</div></div>
        <div class="vc-plugin-settings"><div class="questCard_abc" id="settings">Preview</div></div>
        <div id="word">Promoted sponsored advertisement</div>
        <div class="header_abc" id="header">Header</div><div class="avatar_abc" id="avatar">Avatar</div>
        <div class="questCardigan_abc" id="similar">Different class prefix</div>
        <div class="adCard_abc" data-test id="ad">Ad</div>
        <div contenteditable="true" id="editor">Draft</div>
        <button aria-label="Send a gift" id="gift">Gift</button>
    </body></html>`);
    await page.addScriptTag({ content: outputFiles[0].text });
    const results = await page.evaluate(() => {
        const plugin = TestPlugin.default;
        const hidden = id => getComputedStyle(document.getElementById(id)).display === "none";
        const report = {};
        plugin.start();
        report.blocks = ["quest", "sponsor", "promoted", "banner", "trial", "shop", "nitro", "questnav", "gift", "ad"].every(hidden);
        report.preserves = ["ordinary", "friend", "message", "message2", "chatlink", "settings", "word", "header", "avatar", "similar", "editor"].every(id => !hidden(id));
        const late = document.createElement("div");
        late.className = "first questCard_later";
        document.body.append(late);
        report.dynamic = getComputedStyle(late).display === "none";
        testSettings.store.hideQuests = false;
        testSettings.def.hideQuests.onChange();
        report.questToggle = !hidden("quest") && !hidden("questnav") && hidden("sponsor");
        for (const key of Object.keys(testSettings.store)) testSettings.store[key] = false;
        testSettings.def.hideQuests.onChange();
        report.allOff = ["quest", "sponsor", "promoted", "banner", "trial", "shop", "nitro", "questnav", "gift", "ad"].every(id => !hidden(id));
        for (const key of Object.keys(testSettings.store)) testSettings.store[key] = true;
        testSettings.def.hideQuests.onChange();
        plugin.start();
        report.idempotent = document.querySelectorAll("#vc-sponsorblock-style").length === 1;
        plugin.stop();
        report.stop = !document.getElementById("vc-sponsorblock-style") && !hidden("quest");
        testSettings.def.hideQuests.onChange();
        report.staysStopped = !document.getElementById("vc-sponsorblock-style");
        plugin.start();
        report.restart = hidden("quest");
        plugin.stop();
        return report;
    });
    for (const [name, success] of Object.entries(results)) {
        assert.equal(success, true, name);
        console.log(`PASS ${name}`);
    }
} finally {
    await browser.close();
}
