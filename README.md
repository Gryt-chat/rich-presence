# rich-presence

Game and app names and icons for activity cards in [Gryt](https://gryt.chat), the voice chat app.

When you play something, Gryt can show it on your card: the game's name, its icon, and what it tells Gryt about your session. A game identifies itself with an app id, and this repo is how the Gryt app turns that id into a name and an icon.

The Gryt app downloads this data once a day and ships with a copy, so it never has to look a game up while you're playing.

## What's in here

- **`games.json`**: about 24,500 games and apps. Each has an id and a name, and where known a Steam id, genres, other names, and the program names it runs as on each system. Gryt uses the program names to spot a game running, if you've turned that on.
- **`overrides.json`**: games and apps we've added or fixed by hand. These win over the rest.
- **`icons/`**: an AVIF icon per game, named by its id.

This repo is updated automatically. Edit only `overrides.json` by hand.

## Adding or fixing a game

1. Edit `overrides.json`. Each entry needs a name and at least one app id or program name. Add `"kind": "app"` for something that isn't a game, like Figma, so it reads "Using Figma".
2. Run `node scripts/validate-overrides.mjs`, or let the check on your PR do it.
3. Open a PR.

Gryt's "Suggest for everyone" button opens an issue here with the id and name filled in.

## The icons belong to their publishers

They're small copies of each game's icon. If you publish a game and want its icon taken down, open an issue and we'll remove it.

## Using the data

`games.json` is small enough to fetch directly, from `https://cdn.jsdelivr.net/gh/Gryt-chat/rich-presence@main/games.json` or the same path on `raw.githubusercontent.com`.
