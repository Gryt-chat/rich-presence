#!/usr/bin/env node
/**
 * Checked on every PR that touches overrides.json. These are the entries that
 * win over the rest of the list, so a bad one is a game the client will get wrong.
 */

import assert from "node:assert/strict";

import overrides from "../overrides.json" with { type: "json" };

const OSES = ["win32", "darwin", "linux"];
const ALLOWED_ICON_HOSTS = ["cdn.idsapp.com"];

let failures = 0;
function check(name, run) {
  try {
    run();
    console.log(`  ok  ${name}`);
  } catch (err) {
    failures += 1;
    console.error(`  FAIL  ${name}\n        ${err.message}`);
  }
}

console.log("overrides.json");

check("top level shape", () => {
  assert.equal(typeof overrides, "object");
  assert.equal(overrides.version, 1);
  assert.ok(Array.isArray(overrides.games));
});

check("every entry has a name and at least one app id or executable", () => {
  for (const game of overrides.games) {
    assert.equal(typeof game.name, "string", `${JSON.stringify(game)} has no name`);
    assert.ok(game.name.trim().length > 0 && game.name.length <= 64, `${game.name}: bad name length`);
    const hasId = Array.isArray(game.ids) && game.ids.length > 0;
    const hasExe = game.exe && Object.keys(game.exe).length > 0;
    assert.ok(hasId || hasExe, `${game.name}: no app id and no executable, matches nothing`);
  }
});

check("app id are snowflakes", () => {
  for (const game of overrides.games) {
    for (const id of game.ids ?? []) {
      assert.ok(/^\d{1,32}$/.test(id), `${game.name}: "${id}" isn't a snowflake`);
    }
  }
});

check("exe keys are a known OS, values are non-empty lowercase strings", () => {
  for (const game of overrides.games) {
    for (const [os, names] of Object.entries(game.exe ?? {})) {
      assert.ok(OSES.includes(os), `${game.name}: unknown OS "${os}"`);
      assert.ok(Array.isArray(names) && names.length > 0, `${game.name}: empty exe list for ${os}`);
      for (const n of names) {
        assert.equal(typeof n, "string");
        assert.ok(n.trim().length > 0, `${game.name}: blank executable name`);
        assert.equal(n, n.toLowerCase(), `${game.name}: "${n}" should be lowercase`);
      }
    }
  }
});

check("kind, when given, is game or app", () => {
  for (const game of overrides.games) {
    if (game.kind === undefined) continue;
    assert.ok(game.kind === "game" || game.kind === "app", `${game.name}: kind must be "game" or "app"`);
  }
});

check("no executable is something every machine runs", () => {
  const generic = /^(java|javaw|python|node|electron|steam|launcher|game|client|start|setup|update|updater|hl2|hl2_osx)(\.exe|\.app)?$/;
  for (const game of overrides.games) {
    for (const names of Object.values(game.exe ?? {})) {
      for (const name of names) assert.ok(!generic.test(name), `${game.name} matches on ${name}, that's too generic`);
    }
  }
});

check("no name, app id, or executable is claimed twice", () => {
  const names = new Set();
  const ids = new Set();
  const exes = new Set();
  for (const game of overrides.games) {
    assert.ok(!names.has(game.name), `"${game.name}" appears twice`);
    names.add(game.name);
    for (const id of game.ids ?? []) {
      assert.ok(!ids.has(id), `app id ${id} is claimed by two games`);
      ids.add(id);
    }
    for (const [os, list] of Object.entries(game.exe ?? {})) {
      for (const n of list) {
        const key = `${os}:${n}`;
        assert.ok(!exes.has(key), `${key} is claimed by two games`);
        exes.add(key);
      }
    }
  }
});

check("an optional icon override is a URL on an allowed host", () => {
  for (const game of overrides.games) {
    if (game.icon === undefined) continue;
    assert.equal(typeof game.icon, "string");
    const url = new URL(game.icon);
    assert.equal(url.protocol, "https:", `${game.name}: icon must be https`);
    assert.ok(ALLOWED_ICON_HOSTS.includes(url.host), `${game.name}: icon host "${url.host}" isn't allowed`);
  }
});

console.log(failures === 0 ? "\noverrides.json: ok" : `\noverrides.json: ${failures} failed.`);
process.exit(failures === 0 ? 0 : 1);
