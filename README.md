# Shiro OS — KenzoGz

Shiro OS is a personal website presented as a small, dreamy desktop computer. Its visual language mixes a purple CRT display, Windows XP-style windows and taskbar, and PS Vita-inspired glass panels.

The home desktop keeps four main widgets: local time, Discord presence, a rotating Shiro GIF, and a random thought. The taskbar opens About, Projects, Experiments, Fiction, and Archive in movable app windows. The interface supports English and Vietnamese and works as a static site; it has no build step or custom backend.

## Run locally

The page loads its copy, assets, and collection entries with `fetch`, so opening `index.html` directly with `file://` will not work. From the repository root, start any static web server. For example, with Python:

```powershell
python -m http.server 8000
```

Then open <http://localhost:8000/>. Stop the server with `Ctrl+C`.

## Project layout

```text
index.html                 Main page structure and app windows
css/style.css              Desktop, CRT, responsive, and motion styles
js/main.js                 Boot flow, widgets, language, windows, and Discord
data/site-copy.json        English page copy and rotating thoughts
data/site-copy.vi.json     Vietnamese page copy
data/assets.json           Images and GIFs used by the page
content/projects/          Projects app data
content/experiments/       Experiments app data
content/archive/           Archive app data
assets/images/             Original images, wallpaper, favicon, and GIFs
```

This root README is the project's single maintenance guide.

## Update page copy and translations

Edit `data/site-copy.json` for the English home screen, About window, and Fiction window. Add the same keys and structure to `data/site-copy.vi.json` for Vietnamese. The language button switches between the two files; the selected language is remembered in the visitor's browser.

Small interface labels such as window controls and Discord activity prefixes live in the `translations` object near the top of `js/main.js`. Keep those labels in both `en` and `vi` when adding a new interface string.

The random thought is chosen from `home.thoughts`. Other home fields include the owner name, boot messages, top bar text, the “Now playing with life” line, and the GIF label. Keep English and Vietnamese keys aligned so the language switch never leaves a field untranslated.

## Add Projects, Experiments, or Archive entries

Each app reads its own JSON file. Add entries to the existing `items` array; no HTML changes are needed. An item can use:

```json
{
  "title": "Project name",
  "summary": "A short description",
  "status": "In progress",
  "date": "2026",
  "tags": ["web", "javascript"],
  "url": "https://example.com",
  "vi": {
    "title": "Tên dự án",
    "summary": "Mô tả ngắn"
  }
}
```

Only `title` is required. `summary`, `status`, `date`, `tags`, and `url` are optional. Add a `vi` object to translate fields when needed; fields without a Vietnamese override use their English value. Keep valid JSON syntax, including commas between entries.

## Add or replace assets

Place image files in `assets/images/` and update `data/assets.json`, which is the manifest used by the page:

- `favicon`: browser icon.
- `wallpaper`: desktop wallpaper.
- `avatar`: sleep screen, Discord, and Start menu avatar.
- `aboutAvatar`: About window portrait.
- `gifs`: GIF paths used by the album shuffle button.

Paths are relative to the repository root and are case-sensitive on GitHub Pages. Keep source artwork in the repository; only assets listed in the manifest are loaded by the page. The original `shiro1.gif` is retained in `assets/images/` but is currently excluded from the home GIF rotation.

## Features and external services

- The sleep screen runs a short boot sequence before showing the desktop.
- App windows can be dragged, resized, minimized, maximized, restored, and closed. On narrow screens the windows adapt to the viewport and resizing is disabled.
- Background parallax and interface motion are reduced when the visitor enables the operating system's reduced-motion preference.
- Discord presence is read from the public Lanyard API and refreshed periodically. If the service is unavailable, the desktop stays usable and shows a translated fallback. Spotify activity can show track progress. No API key or custom backend is required.
- Discord avatars and Spotify artwork are loaded from Discord's CDN.

## Build and publish

There is no package installation, build command, or compilation step. The repository can be served directly as static files. To publish with GitHub Pages, configure the repository to serve the `main` branch from the repository root, then push the files to GitHub.

Before publishing, check that JSON files parse, asset paths match their filenames, and the page works in both English and Vietnamese. Keep GIFs and wallpaper images reasonably sized so the desktop opens quickly on mobile connections.
