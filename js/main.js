const shell = document.getElementById("system-shell");
const powerButton = document.getElementById("power-on");
const desktop = document.getElementById("desktop");
const bootStatus = document.getElementById("boot-status");
const startButton = document.getElementById("start-button");
const startMenu = document.getElementById("start-menu");
const taskButtons = document.getElementById("task-buttons");
const gifElement = document.getElementById("random-gif");

const appNames = {
  about: "About",
  projects: "Projects",
  experiments: "Experiments",
  fiction: "Fiction",
  archive: "Archive"
};
let gifList = [];
let thoughts = [];
let statusLines = [];
let littleThingsPool = [];
let ambientSymbols = [];
let siteCopy;

let bootTimer;
let discordPollTimer;
let lastGif = -1;
let thoughtIndex = 0;
let topZIndex = 1;
const openApps = new Set();

function sampleUnique(items, count) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled.slice(0, count);
}

const symbolColors = ["glow-pink", "glow-cyan", "glow-purple"];

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Could not load ${path}`);
  return response.json();
}

function getCopyValue(path) {
  return path.split(".").reduce((value, key) => value?.[key], siteCopy);
}

function applySiteCopy() {
  document.querySelectorAll("[data-copy]").forEach((element) => {
    const value = getCopyValue(element.dataset.copy);
    if (typeof value === "string") element.textContent = value;
  });
  document.querySelector('[data-copy="about.facebookLabel"]').href = siteCopy.about.facebookUrl;
  document.querySelector('[data-copy="about.youtubeLabel"]').href = siteCopy.about.youtubeUrl;
}

function renderCollection(root, data) {
  root.querySelector("[data-collection-kicker]").textContent = data.kicker;
  root.querySelector("[data-collection-title]").textContent = data.title;
  const description = root.querySelector("[data-collection-description]");
  description.textContent = data.description;
  const list = root.querySelector(".collection-items");
  list.replaceChildren();

  for (const item of data.items || []) {
    const card = document.createElement("article");
    card.className = "collection-entry";
    const title = document.createElement("h3");
    title.textContent = item.title || "Untitled";
    card.append(title);
    if (item.summary) {
      const summary = document.createElement("p");
      summary.textContent = item.summary;
      card.append(summary);
    }
    if (item.tags?.length) {
      const tags = document.createElement("ul");
      tags.className = "collection-tags";
      for (const label of item.tags) {
        const tag = document.createElement("li");
        tag.textContent = label;
        tags.append(tag);
      }
      card.append(tags);
    }
    const meta = [item.status, item.date].filter(Boolean).join(" · ");
    if (meta) {
      const footer = document.createElement("span");
      footer.className = "collection-meta";
      footer.textContent = meta;
      card.append(footer);
    }
    if (item.url) {
      const target = new URL(item.url, window.location.href);
      if (["http:", "https:"].includes(target.protocol)) {
        const link = document.createElement("a");
        link.href = target.href;
        link.textContent = "Open ↗";
        if (target.origin !== window.location.origin) {
          link.target = "_blank";
          link.rel = "noreferrer";
        }
        card.append(link);
      }
    }
    list.append(card);
  }
}

async function initializeContent() {
  const [copy, assets, projects, experiments, archive] = await Promise.all([
    loadJson("data/site-copy.json"),
    loadJson("data/assets.json"),
    loadJson("content/projects/projects.json"),
    loadJson("content/experiments/experiments.json"),
    loadJson("content/archive/archive.json")
  ]);
  siteCopy = copy;
  thoughts = copy.home.thoughts;
  statusLines = copy.home.statusLines;
  littleThingsPool = copy.home.littleThings;
  ambientSymbols = copy.home.ambientSymbols;
  gifList = assets.gifs;

  applySiteCopy();
  document.getElementById("site-icon").href = assets.favicon;
  const wallpaperUrl = new URL(assets.wallpaper, document.baseURI);
  document.documentElement.style.setProperty("--wallpaper-image", `url("${wallpaperUrl.href}")`);
  document.querySelectorAll("[data-asset]").forEach((image) => {
    const path = assets[image.dataset.asset];
    if (path) image.src = path;
  });

  document.getElementById("random-status").textContent = statusLines[Math.floor(Math.random() * statusLines.length)];
  const littleThings = document.getElementById("little-pills");
  littleThings.replaceChildren(...sampleUnique(littleThingsPool, 3).map((item) => {
    const chip = document.createElement("span");
    chip.textContent = item;
    return chip;
  }));

  const ambientLayer = document.getElementById("ngnl-background");
  for (let index = 0; index < 22; index += 1) {
    const symbol = document.createElement("span");
    const duration = 18 + Math.random() * 18;
    symbol.className = `ngnl-symbol ${symbolColors[Math.floor(Math.random() * symbolColors.length)]}`;
    symbol.textContent = ambientSymbols[Math.floor(Math.random() * ambientSymbols.length)];
    symbol.style.left = `${Math.random() * 100}%`;
    symbol.style.fontSize = `${13 + Math.random() * 17}px`;
    symbol.style.animationDuration = `${duration}s`;
    symbol.style.animationDelay = `${-Math.random() * duration}s`;
    ambientLayer.append(symbol);
  }

  renderCollection(document.querySelector('[data-collection="projects"]'), projects);
  renderCollection(document.querySelector('[data-collection="experiments"]'), experiments);
  renderCollection(document.querySelector('[data-collection="archive"]'), archive);
  chooseGif();
  thoughtIndex = Math.floor(Math.random() * thoughts.length);
  document.getElementById("random-thought").textContent = thoughts[thoughtIndex];
  window.setInterval(() => {
    thoughtIndex = (thoughtIndex + 1) % thoughts.length;
    document.getElementById("random-thought").textContent = thoughts[thoughtIndex];
  }, 24000);
}

initializeContent().catch((error) => console.error("Shiro content failed to load:", error));

function updateClocks() {
  const now = new Date();
  const time = new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(now);
  const date = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric"
  }).format(now);
  const longDate = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(now).toUpperCase();

  document.getElementById("sleep-time").textContent = time;
  document.getElementById("sleep-date").textContent = longDate;
  document.getElementById("widget-time").textContent = time;
  document.getElementById("widget-date").textContent = date;
  document.getElementById("tray-clock").textContent = time;
}
updateClocks();
window.setInterval(updateClocks, 1000);

const reducedMotionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const screen = document.querySelector(".screen");
if (screen) {
  let pointerFrame = 0;
  let pointerX = 0;
  let pointerY = 0;
  const moveWallpaper = () => {
    pointerFrame = 0;
    const bounds = screen.getBoundingClientRect();
    const x = (pointerX - bounds.left) / bounds.width - 0.5;
    const y = (pointerY - bounds.top) / bounds.height - 0.5;
    shell.style.setProperty("--pointer-x", `${(-x * 18).toFixed(1)}px`);
    shell.style.setProperty("--pointer-y", `${(-y * 14).toFixed(1)}px`);
  };
  screen.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch" || reducedMotionPreference.matches) return;
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (!pointerFrame) pointerFrame = window.requestAnimationFrame(moveWallpaper);
  }, { passive: true });
  screen.addEventListener("pointerleave", () => {
    shell.style.setProperty("--pointer-x", "0px");
    shell.style.setProperty("--pointer-y", "0px");
  }, { passive: true });
}

function chooseGif() {
  if (!gifElement || !gifList.length) return;
  let next = Math.floor(Math.random() * gifList.length);
  if (gifList.length > 1) {
    while (next === lastGif) next = Math.floor(Math.random() * gifList.length);
  }
  lastGif = next;
  gifElement.src = gifList[next];
}
document.getElementById("gif-widget").addEventListener("click", chooseGif);

powerButton.addEventListener("click", () => {
  if (shell.dataset.state !== "sleeping") return;
  shell.dataset.state = "booting";
  if (lastGif === -1) chooseGif();
  fetchDiscordStatus();
  if (!discordPollTimer) discordPollTimer = window.setInterval(fetchDiscordStatus, 30000);
  document.getElementById("sleep-screen").setAttribute("aria-hidden", "true");
  document.getElementById("boot-screen").setAttribute("aria-hidden", "false");
  powerButton.disabled = true;
  const messages = siteCopy?.home.bootStages || [];
  let index = 0;
  bootStatus.textContent = messages[index] || "";
  const messageTimer = window.setInterval(() => {
    if (!messages.length) return;
    index = Math.min(index + 1, messages.length - 1);
    bootStatus.textContent = messages[index];
  }, 560);
  window.clearInterval(bootTimer);
  bootTimer = window.setTimeout(() => {
    window.clearInterval(messageTimer);
    desktop.classList.add("is-awake");
    shell.dataset.state = "awake";
    document.getElementById("boot-screen").setAttribute("aria-hidden", "true");
    desktop.setAttribute("aria-hidden", "false");
    powerButton.disabled = false;
    startButton.focus({ preventScroll: true });
  }, 1750);
});

function closeStartMenu() {
  startMenu.hidden = true;
  startButton.setAttribute("aria-expanded", "false");
}

function renderTaskButtons() {
  taskButtons.replaceChildren();
  for (const app of openApps) {
    const button = document.createElement("button");
    const win = document.getElementById(`window-${app}`);
    button.type = "button";
    button.className = "task-app";
    button.textContent = appNames[app];
    button.setAttribute("aria-label", `${win.hidden ? "Restore" : "Minimize"} ${appNames[app]}`);
    button.classList.toggle("active", !win.hidden);
    button.addEventListener("click", () => {
      if (!win.hidden) {
        win.hidden = true;
      } else {
        win.hidden = false;
        win.style.zIndex = String(++topZIndex);
      }
      renderTaskButtons();
    });
    taskButtons.append(button);
  }
}

function openWindow(app) {
  if (!appNames[app]) return;
  closeStartMenu();
  const win = document.getElementById(`window-${app}`);
  openApps.add(app);
  win.hidden = false;
  win.style.zIndex = String(++topZIndex);
  renderTaskButtons();
  win.querySelector(".window-close").focus({ preventScroll: true });
}

function closeWindow(app) {
  const win = document.getElementById(`window-${app}`);
  if (!win) return;
  win.hidden = true;
  openApps.delete(app);
  renderTaskButtons();
}

function minimizeWindow(app) {
  const win = document.getElementById(`window-${app}`);
  if (!win) return;
  win.hidden = true;
  renderTaskButtons();
}

function toggleMaximize(win) {
  const button = win.querySelector("[data-maximize]");
  if (win.classList.contains("is-maximized")) {
    const previous = JSON.parse(win.dataset.restoreGeometry || "{}");
    for (const [property, value] of Object.entries(previous)) win.style[property] = value;
    delete win.dataset.restoreGeometry;
    win.classList.remove("is-maximized");
    button.setAttribute("aria-label", `Maximize ${appNames[win.dataset.window]} window`);
    button.title = "Maximize";
    button.textContent = "□";
  } else {
    const properties = ["left", "top", "width", "height", "transform", "resize"];
    win.dataset.restoreGeometry = JSON.stringify(Object.fromEntries(properties.map((key) => [key, win.style[key]])));
    win.classList.add("is-maximized");
    button.setAttribute("aria-label", `Restore ${appNames[win.dataset.window]} window`);
    button.title = "Restore";
    button.textContent = "▢";
  }
  win.style.zIndex = String(++topZIndex);
  renderTaskButtons();
}

document.addEventListener("click", (event) => {
  const minimizeButton = event.target.closest("[data-minimize]");
  if (minimizeButton) {
    minimizeWindow(minimizeButton.dataset.minimize);
    return;
  }
  const maximizeButton = event.target.closest("[data-maximize]");
  if (maximizeButton) {
    toggleMaximize(maximizeButton.closest(".app-window"));
    return;
  }
  const openButton = event.target.closest("[data-open]");
  if (openButton) {
    openWindow(openButton.dataset.open);
    return;
  }
  const closeButton = event.target.closest("[data-close]");
  if (closeButton) closeWindow(closeButton.dataset.close);
});

document.querySelectorAll(".app-window").forEach((win) => {
  win.addEventListener("pointerdown", () => {
    win.style.zIndex = String(++topZIndex);
    renderTaskButtons();
  });

  const titlebar = win.querySelector(".window-titlebar");
  titlebar.addEventListener("pointerdown", (event) => {
    if (event.target.closest(".window-controls") || win.classList.contains("is-maximized")) return;
    const layer = win.closest(".window-layer");
    const layerRect = layer.getBoundingClientRect();
    const winRect = win.getBoundingClientRect();
    const originLeft = winRect.left - layerRect.left;
    const originTop = winRect.top - layerRect.top;
    const pointerX = event.clientX;
    const pointerY = event.clientY;
    win.style.left = `${originLeft}px`;
    win.style.top = `${originTop}px`;
    win.style.transform = "none";
    titlebar.setPointerCapture(event.pointerId);

    const moveWindow = (moveEvent) => {
      const maxLeft = Math.max(0, layer.clientWidth - win.offsetWidth);
      const maxTop = Math.max(0, layer.clientHeight - titlebar.offsetHeight);
      win.style.left = `${Math.max(0, Math.min(maxLeft, originLeft + moveEvent.clientX - pointerX))}px`;
      win.style.top = `${Math.max(0, Math.min(maxTop, originTop + moveEvent.clientY - pointerY))}px`;
    };
    const stopDragging = () => {
      titlebar.removeEventListener("pointermove", moveWindow);
      titlebar.removeEventListener("pointerup", stopDragging);
      titlebar.removeEventListener("pointercancel", stopDragging);
    };
    titlebar.addEventListener("pointermove", moveWindow);
    titlebar.addEventListener("pointerup", stopDragging, { once: true });
    titlebar.addEventListener("pointercancel", stopDragging, { once: true });
  });

  titlebar.addEventListener("dblclick", (event) => {
    if (event.target.closest(".window-controls")) return;
    toggleMaximize(win);
  });
});

window.addEventListener("resize", () => {
  document.querySelectorAll(".app-window:not([hidden]):not(.is-maximized)").forEach((win) => {
    if (!win.style.left || !win.style.top) return;
    const layer = win.closest(".window-layer");
    const maxLeft = Math.max(0, layer.clientWidth - win.offsetWidth);
    const maxTop = Math.max(0, layer.clientHeight - win.querySelector(".window-titlebar").offsetHeight);
    win.style.left = `${Math.min(maxLeft, Math.max(0, parseFloat(win.style.left)))}px`;
    win.style.top = `${Math.min(maxTop, Math.max(0, parseFloat(win.style.top)))}px`;
  });
});

startButton.addEventListener("click", () => {
  startMenu.hidden = !startMenu.hidden;
  startButton.setAttribute("aria-expanded", String(!startMenu.hidden));
});
document.addEventListener("pointerdown", (event) => {
  if (!startMenu.hidden && !startMenu.contains(event.target) && !startButton.contains(event.target)) {
    closeStartMenu();
  }
});
document.getElementById("sleep-again").addEventListener("click", () => {
  window.clearTimeout(bootTimer);
  window.clearInterval(discordPollTimer);
  window.clearInterval(spotifyProgressTimer);
  discordPollTimer = undefined;
  spotifyProgressTimer = undefined;
  currentSpotify = null;
  spotifyProgress.hidden = true;
  desktop.classList.remove("is-awake");
  closeStartMenu();
  openApps.clear();
  document.querySelectorAll(".app-window").forEach((win) => { win.hidden = true; });
  renderTaskButtons();
  desktop.setAttribute("aria-hidden", "true");
  document.getElementById("sleep-screen").setAttribute("aria-hidden", "false");
  shell.dataset.state = "sleeping";
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeStartMenu();
  if (event.key === "Enter" && shell.dataset.state === "sleeping" && document.activeElement === powerButton) {
    powerButton.click();
  }
});

/* Live Discord presence is optional: the desktop remains usable if Lanyard is unavailable. */
const DISCORD_USER_ID = "366492309375811597";
const discordUsername = document.getElementById("discord-username");
const discordTag = document.getElementById("discord-tag");
const discordActivity = document.getElementById("discord-activity");
const discordStatus = document.getElementById("discord-status-dot");
const discordStatusText = document.getElementById("discord-status-text");
const spotifyCover = document.getElementById("spotify-cover");
const spotifyProgress = document.getElementById("spotify-progress");
const spotifyTrack = document.getElementById("spotify-track");
let currentSpotify = null;
let spotifyProgressTimer;

function formatTrackTime(milliseconds) {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function updateSpotifyProgress() {
  const start = Number(currentSpotify?.timestamps?.start);
  const end = Number(currentSpotify?.timestamps?.end);
  if (!start || !end || end <= start) {
    spotifyProgress.hidden = true;
    window.clearInterval(spotifyProgressTimer);
    spotifyProgressTimer = undefined;
    return;
  }

  const duration = end - start;
  const elapsed = Math.min(duration, Math.max(0, Date.now() - start));
  const percentage = Math.round((elapsed / duration) * 100);
  document.getElementById("spotify-current-time").textContent = formatTrackTime(elapsed);
  document.getElementById("spotify-duration").textContent = formatTrackTime(duration);
  document.getElementById("spotify-progress-fill").style.width = `${percentage}%`;
  spotifyTrack.setAttribute("aria-valuenow", String(percentage));
  spotifyProgress.hidden = false;
}

async function fetchDiscordStatus() {
  try {
    const response = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000)
    });
    if (!response.ok) throw new Error("Presence unavailable");
    const result = await response.json();
    if (!result.success || !result.data) throw new Error("Presence unavailable");

    const { data } = result;
    const user = data.discord_user || {};
    discordUsername.textContent = user.global_name || user.username || "Discord user";
    discordTag.textContent = user.username && user.discriminator && user.discriminator !== "0"
      ? `${user.username}#${user.discriminator}`
      : user.username ? `@${user.username}` : "Discord presence";
    if (user.avatar) {
      const extension = user.avatar.startsWith("a_") ? "gif" : "png";
      document.getElementById("discord-avatar").src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${extension}?size=96`;
    }
    const status = ["online", "idle", "dnd"].includes(data.discord_status) ? data.discord_status : "offline";
    discordStatus.className = `status-dot ${status}`;
    const statusLabels = { online: "ONLINE", idle: "IDLE", dnd: "DND", offline: "OFFLINE" };
    const device = data.active_on_discord_desktop ? "DESKTOP" : data.active_on_discord_mobile ? "MOBILE" : "";
    discordStatusText.textContent = device ? `${statusLabels[status]} · ${device}` : statusLabels[status];
    document.querySelector(".discord-live").className = `discord-live status-${status}`;

    const spotify = data.listening_to_spotify && data.spotify;
    const activities = Array.isArray(data.activities) ? data.activities : [];
    const game = activities.find((activity) => activity.type === 0);
    const listening = activities.find((activity) => activity.type === 2);
    const watching = activities.find((activity) => activity.type === 3);
    const competing = activities.find((activity) => activity.type === 5);
    const custom = activities.find((activity) => activity.type === 4);
    let activity = "";

    if (spotify) {
      const song = spotify.song || spotify.track || spotify.details || "a song";
      const artist = spotify.artist || spotify.state;
      activity = `♫ ${song}${artist ? ` · ${artist}` : ""}`;
      currentSpotify = spotify;
      const artwork = spotify.album_art_url;
      if (artwork) {
        spotifyCover.src = artwork;
        spotifyCover.hidden = false;
      } else {
        spotifyCover.hidden = true;
      }
      updateSpotifyProgress();
      if (!spotifyProgressTimer && spotify.timestamps?.start && spotify.timestamps?.end) {
        spotifyProgressTimer = window.setInterval(updateSpotifyProgress, 1000);
      }
    } else {
      currentSpotify = null;
      spotifyCover.hidden = true;
      spotifyProgress.hidden = true;
      window.clearInterval(spotifyProgressTimer);
      spotifyProgressTimer = undefined;
      const otherActivity = game || listening || watching || competing;
      const activityLabels = { 0: "Playing", 2: "Listening to", 3: "Watching", 5: "Competing in" };
      activity = otherActivity
        ? `${activityLabels[otherActivity.type]} ${otherActivity.name}${otherActivity.details ? ` · ${otherActivity.details}` : otherActivity.state ? ` · ${otherActivity.state}` : ""}`
        : custom?.state || "";
    }
    discordActivity.textContent = activity;
    discordActivity.hidden = !activity;
  } catch {
    discordUsername.textContent = "KenzoGz";
    discordTag.textContent = "Discord presence sleeping";
    discordActivity.textContent = "";
    discordActivity.hidden = true;
    discordStatus.className = "status-dot offline";
    discordStatusText.textContent = "UNAVAILABLE";
    document.querySelector(".discord-live").className = "discord-live status-offline";
    spotifyCover.hidden = true;
    spotifyProgress.hidden = true;
    currentSpotify = null;
    window.clearInterval(spotifyProgressTimer);
    spotifyProgressTimer = undefined;
  }
}
