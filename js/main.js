const shell = document.getElementById("system-shell");
const powerButton = document.getElementById("power-on");
const desktop = document.getElementById("desktop");
const bootStatus = document.getElementById("boot-status");
const startButton = document.getElementById("start-button");
const startMenu = document.getElementById("start-menu");
const taskButtons = document.getElementById("task-buttons");
const gifElement = document.getElementById("random-gif");
const systemToast = document.getElementById("system-toast");
const languageToggle = document.getElementById("language-toggle");
const translations = {
  en: { localTime: "LOCAL TIME", discordPresence: "DISCORD STATUS", discordUnavailable: "Presence unavailable · retrying", connecting: "Connecting...", checking: "Checking the signal", start: "start", localTag: "LOCAL", syncedTag: "SYNCED", toastMessage: "A new frame found its way in.", menuHeading: "YOUR APPS", userLabel: "Shiro OS user", sleepButton: "Put computer to sleep", open: "Open", minimize: "Minimize", maximize: "Maximize", restore: "Restore", windowSuffix: "window", appNames: { about: "About", projects: "Projects", experiments: "Experiments", fiction: "Fiction", archive: "Archive" }, status: { online: "ONLINE", idle: "IDLE", dnd: "DO NOT DISTURB", offline: "OFFLINE", unavailable: "UNAVAILABLE" }, device: { desktop: "DESKTOP", mobile: "MOBILE" }, activity: { 0: "Playing", 2: "Listening to", 3: "Watching", 5: "Competing in" }, dateLocale: "en-US", switchLabel: "Switch language to Vietnamese" },
  vi: { localTime: "GIỜ ĐỊA PHƯƠNG", discordPresence: "TRẠNG THÁI DISCORD", discordUnavailable: "Không lấy được trạng thái · sẽ thử lại", connecting: "Đang kết nối...", checking: "Đang kiểm tra tín hiệu", start: "bắt đầu", localTag: "CỤC BỘ", syncedTag: "ĐÃ ĐỒNG BỘ", toastMessage: "Một khung hình mới vừa ghé qua.", menuHeading: "ỨNG DỤNG", userLabel: "người dùng Shiro OS", sleepButton: "Cho máy tính ngủ", open: "Mở", minimize: "Thu nhỏ", maximize: "Phóng to", restore: "Khôi phục", windowSuffix: "cửa sổ", appNames: { about: "Giới thiệu", projects: "Dự án", experiments: "Thử nghiệm", fiction: "Truyện", archive: "Lưu trữ" }, status: { online: "ĐANG ONLINE", idle: "ĐANG CHỜ", dnd: "ĐỪNG LÀM PHIỀN", offline: "OFFLINE", unavailable: "KHÔNG KHẢ DỤNG" }, device: { desktop: "MÁY TÍNH", mobile: "ĐIỆN THOẠI" }, activity: { 0: "Đang chơi", 2: "Đang nghe", 3: "Đang xem", 5: "Đang thi đấu" }, dateLocale: "vi-VN", switchLabel: "Chuyển ngôn ngữ sang tiếng Anh" }
};
let language = localStorage.getItem("shiro-language") === "vi" ? "vi" : "en";

let appNames = {
  about: "About",
  projects: "Projects",
  experiments: "Experiments",
  fiction: "Fiction",
  archive: "Archive"
};
let gifList = [];
let toastTimer;
let thoughts = [];
let ambientSymbols = [];
let siteCopy;
let siteCopies = {};
let collectionData = {};

let bootTimer;
let discordPollTimer;
let lastGif = -1;
let thoughtIndex = 0;
let topZIndex = 1;
const openApps = new Set();

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

function applyLanguage() {
  siteCopy = siteCopies[language] || siteCopies.en;
  appNames = translations[language].appNames;
  document.documentElement.lang = language;
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const value = translations[language][element.dataset.i18n];
    if (typeof value === "string") element.textContent = value;
  });
  const common = translations[language];
  document.querySelector(".start-menu-label").textContent = common.menuHeading;
  document.querySelector(".start-menu-head > div > span").textContent = common.userLabel;
  document.getElementById("sleep-again").lastChild.textContent = ` ${common.sleepButton}`;
  languageToggle.dataset.language = language;
  languageToggle.setAttribute("aria-label", translations[language].switchLabel);
  languageToggle.title = translations[language].switchLabel;
  startButton.querySelector("b").textContent = translations[language].start;
  applySiteCopy();
  thoughts = siteCopy.home.thoughts;
  if (thoughts.length) document.getElementById("random-thought").textContent = thoughts[thoughtIndex % thoughts.length];
  document.querySelectorAll("[data-collection]").forEach((root) => {
    const data = collectionData[root.dataset.collection];
    if (data) renderCollection(root, data);
  });
  document.querySelectorAll(".start-apps button").forEach((button) => {
    const app = button.dataset.open;
    const icon = button.querySelector("span");
    button.replaceChildren(icon, document.createTextNode(` ${appNames[app]}`));
  });
  document.querySelectorAll("[data-open]").forEach((button) => {
    const app = button.dataset.open;
    if (button.matches(".start-apps button")) return;
    button.title = `${common.open} ${appNames[app]}`;
    if (button.hasAttribute("aria-label")) button.setAttribute("aria-label", button.title);
  });
  document.querySelectorAll(".app-window").forEach((win) => {
    const app = win.dataset.window;
    const title = win.querySelector(".window-titlebar > span");
    const glyph = title.querySelector(".window-glyph");
    const executable = { about: "user.exe", projects: "projects.exe", experiments: "lab.exe", fiction: "storybook.exe", archive: "archive.exe" }[app];
    title.replaceChildren(glyph, document.createTextNode(` ${executable} — ${appNames[app]}`));
    const controls = win.querySelectorAll("[data-minimize], [data-maximize], [data-close]");
    controls.forEach((control) => {
      const action = control.hasAttribute("data-minimize") ? common.minimize : control.hasAttribute("data-maximize") ? common.maximize : (language === "vi" ? "Đóng" : "Close");
      control.title = action;
      control.setAttribute("aria-label", `${action} ${appNames[app]} ${common.windowSuffix}`);
    });
  });
  renderTaskButtons();
  updateClocks();
  updateDiscordLabels();
}

function renderCollection(root, data) {
  if (language === "vi" && data.vi) data = { ...data, ...data.vi };
  root.querySelector("[data-collection-kicker]").textContent = data.kicker;
  root.querySelector("[data-collection-title]").textContent = data.title;
  const description = root.querySelector("[data-collection-description]");
  description.textContent = data.description;
  const list = root.querySelector(".collection-items");
  list.replaceChildren();

  for (const item of data.items || []) {
    const localizedItem = language === "vi" && item.vi ? { ...item, ...item.vi } : item;
    const card = document.createElement("article");
    card.className = "collection-entry";
    const title = document.createElement("h3");
    title.textContent = localizedItem.title || (language === "vi" ? "Chưa đặt tên" : "Untitled");
    card.append(title);
    if (localizedItem.summary) {
      const summary = document.createElement("p");
      summary.textContent = localizedItem.summary;
      card.append(summary);
    }
    if (localizedItem.tags?.length) {
      const tags = document.createElement("ul");
      tags.className = "collection-tags";
      for (const label of localizedItem.tags) {
        const tag = document.createElement("li");
        tag.textContent = label;
        tags.append(tag);
      }
      card.append(tags);
    }
    const meta = [localizedItem.status, localizedItem.date].filter(Boolean).join(" · ");
    if (meta) {
      const footer = document.createElement("span");
      footer.className = "collection-meta";
      footer.textContent = meta;
      card.append(footer);
    }
    if (localizedItem.url) {
      const target = new URL(localizedItem.url, window.location.href);
      if (["http:", "https:"].includes(target.protocol)) {
        const link = document.createElement("a");
        link.href = target.href;
        link.textContent = language === "vi" ? "Mở ↗" : "Open ↗";
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
  const [copy, copyVi, assets, projects, experiments, archive] = await Promise.all([
    loadJson("data/site-copy.json"),
    loadJson("data/site-copy.vi.json"),
    loadJson("data/assets.json"),
    loadJson("content/projects/projects.json"),
    loadJson("content/experiments/experiments.json"),
    loadJson("content/archive/archive.json")
  ]);
  siteCopies = { en: copy, vi: copyVi };
  collectionData = { projects, experiments, archive };
  siteCopy = siteCopies[language];
  thoughts = copy.home.thoughts;
  ambientSymbols = copy.home.ambientSymbols;
  gifList = assets.gifs;

  applyLanguage();
  document.getElementById("site-icon").href = assets.favicon;
  const wallpaperUrl = new URL(assets.wallpaper, document.baseURI);
  document.documentElement.style.setProperty("--wallpaper-image", `url("${wallpaperUrl.href}")`);
  document.querySelectorAll("[data-asset]").forEach((image) => {
    const path = assets[image.dataset.asset];
    if (path) image.src = path;
  });

  const ambientLayer = document.getElementById("ngnl-background");
  for (let index = 0; index < 12; index += 1) {
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
  const hhmm = new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(now);
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const time = `${hhmm}:${seconds}`;
  const date = new Intl.DateTimeFormat(translations[language].dateLocale, {
    weekday: "long",
    month: "long",
    day: "numeric"
  }).format(now);
  const longDate = new Intl.DateTimeFormat(translations[language].dateLocale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(now).toUpperCase();

  document.getElementById("sleep-time").textContent = time;
  document.getElementById("sleep-date").textContent = longDate;
  document.getElementById("widget-time").childNodes[0].textContent = hhmm;
  document.getElementById("widget-seconds").textContent = seconds;
  document.getElementById("widget-date").textContent = date;
  document.getElementById("tray-clock").textContent = hhmm;
}
updateClocks();
window.setInterval(updateClocks, 1000);

languageToggle.addEventListener("click", () => {
  language = language === "en" ? "vi" : "en";
  localStorage.setItem("shiro-language", language);
  if (siteCopies.en) applyLanguage();
});

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
    shell.style.setProperty("--pointer-x", `${(-x * 8).toFixed(1)}px`);
    shell.style.setProperty("--pointer-y", `${(-y * 6).toFixed(1)}px`);
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
function showGifToast() {
  if (!systemToast) return;
  window.clearTimeout(toastTimer);
  systemToast.hidden = false;
  systemToast.classList.remove("is-visible");
  requestAnimationFrame(() => systemToast.classList.add("is-visible"));
  toastTimer = window.setTimeout(() => {
    systemToast.classList.remove("is-visible");
    systemToast.hidden = true;
  }, 2200);
}
document.getElementById("gif-widget").addEventListener("click", () => {
  chooseGif();
  showGifToast();
});

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

function setFocusedWindow(win) {
  document.querySelectorAll(".app-window").forEach((item) => {
    item.classList.toggle("is-focused", item === win && !item.hidden);
  });
}

function focusWindow(win) {
  if (!win || win.hidden) return;
  win.style.zIndex = String(++topZIndex);
  setFocusedWindow(win);
}

function focusTopWindow() {
  const visibleWindows = [...document.querySelectorAll(".app-window:not([hidden])")];
  const topWindow = visibleWindows.sort((first, second) => Number(second.style.zIndex || 0) - Number(first.style.zIndex || 0))[0];
  setFocusedWindow(topWindow || null);
}

function renderTaskButtons() {
  taskButtons.replaceChildren();
  for (const app of openApps) {
    const button = document.createElement("button");
    const win = document.getElementById(`window-${app}`);
    button.type = "button";
    button.className = "task-app";
    button.textContent = appNames[app];
    button.setAttribute("aria-label", `${win.hidden ? translations[language].restore : translations[language].minimize} ${appNames[app]}`);
    button.classList.toggle("active", !win.hidden);
    button.addEventListener("click", () => {
      if (!win.hidden) {
        win.hidden = true;
        focusTopWindow();
      } else {
        win.hidden = false;
        focusWindow(win);
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
  focusWindow(win);
  renderTaskButtons();
  win.querySelector(".window-close").focus({ preventScroll: true });
}

function closeWindow(app) {
  const win = document.getElementById(`window-${app}`);
  if (!win) return;
  win.hidden = true;
  openApps.delete(app);
  focusTopWindow();
  renderTaskButtons();
}

function minimizeWindow(app) {
  const win = document.getElementById(`window-${app}`);
  if (!win) return;
  win.hidden = true;
  focusTopWindow();
  renderTaskButtons();
}

function toggleMaximize(win) {
  const button = win.querySelector("[data-maximize]");
  if (win.classList.contains("is-maximized")) {
    const previous = JSON.parse(win.dataset.restoreGeometry || "{}");
    for (const [property, value] of Object.entries(previous)) win.style[property] = value;
    delete win.dataset.restoreGeometry;
    win.classList.remove("is-maximized");
    button.setAttribute("aria-label", `${translations[language].maximize} ${appNames[win.dataset.window]} ${translations[language].windowSuffix}`);
    button.title = translations[language].maximize;
    button.textContent = "□";
  } else {
    const properties = ["left", "top", "right", "bottom", "width", "height", "transform", "resize"];
    win.dataset.restoreGeometry = JSON.stringify(Object.fromEntries(properties.map((key) => [key, win.style[key]])));
    win.classList.add("is-maximized");
    for (const property of properties) win.style[property] = "";
    button.setAttribute("aria-label", `${translations[language].restore} ${appNames[win.dataset.window]} ${translations[language].windowSuffix}`);
    button.title = translations[language].restore;
    button.textContent = "▢";
  }
  focusWindow(win);
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
    focusWindow(win);
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
      const maxTop = Math.max(0, layer.clientHeight - win.offsetHeight);
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
    const maxTop = Math.max(0, layer.clientHeight - win.offsetHeight);
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
const discordActivityRow = document.getElementById("discord-activity-row");
const discordStatus = document.getElementById("discord-status-dot");
const discordStatusText = document.getElementById("discord-status-text");
const spotifyCover = document.getElementById("spotify-cover");
const spotifyProgress = document.getElementById("spotify-progress");
const spotifyTrack = document.getElementById("spotify-track");
let currentSpotify = null;
let spotifyProgressTimer;

function updateDiscordLabels() {
  const labels = translations[language];
  if (discordTag.dataset.presence === "unavailable") discordTag.textContent = labels.discordUnavailable;
  const state = discordStatus.className.split(" ").at(-1);
  if (state in labels.status) {
    const device = discordStatusText.dataset.device;
    discordStatusText.textContent = device ? `${labels.status[state]} · ${labels.device[device]}` : labels.status[state];
  }
  if (discordActivity.dataset.kind && discordActivity.dataset.kind !== "spotify") {
    const prefix = labels.activity[discordActivity.dataset.kind];
    if (prefix && discordActivity.dataset.detail) discordActivity.textContent = `${prefix} ${discordActivity.dataset.detail}`;
  }
}

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
    delete discordTag.dataset.presence;
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
    const statusLabels = translations[language].status;
    const device = data.active_on_discord_desktop ? "DESKTOP" : data.active_on_discord_mobile ? "MOBILE" : "";
    discordStatusText.dataset.device = device === "DESKTOP" ? "desktop" : device === "MOBILE" ? "mobile" : "";
    discordStatusText.textContent = device ? `${statusLabels[status]} · ${translations[language].device[discordStatusText.dataset.device]}` : statusLabels[status];
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
      discordActivity.dataset.kind = "spotify";
      discordActivity.dataset.detail = activity;
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
      const activityDetail = otherActivity
        ? `${otherActivity.name}${otherActivity.details ? ` · ${otherActivity.details}` : otherActivity.state ? ` · ${otherActivity.state}` : ""}`
        : custom?.state || "";
      discordActivity.dataset.kind = otherActivity ? String(otherActivity.type) : "";
      discordActivity.dataset.detail = activityDetail;
      activity = otherActivity ? `${translations[language].activity[otherActivity.type]} ${activityDetail}` : activityDetail;
    }
    discordActivity.textContent = activity;
    discordActivityRow.hidden = !activity;
    document.querySelector(".discord-widget").classList.toggle("has-activity", Boolean(activity));
  } catch {
    discordUsername.textContent = "KenzoGz";
    discordTag.dataset.presence = "unavailable";
    discordTag.textContent = translations[language].discordUnavailable;
    discordActivity.textContent = "";
    discordActivityRow.hidden = true;
    document.querySelector(".discord-widget").classList.remove("has-activity");
    discordStatus.className = "status-dot offline";
    discordStatusText.textContent = translations[language].status.unavailable;
    discordStatusText.dataset.device = "";
    document.querySelector(".discord-live").className = "discord-live status-offline";
    spotifyCover.hidden = true;
    spotifyProgress.hidden = true;
    currentSpotify = null;
    window.clearInterval(spotifyProgressTimer);
    spotifyProgressTimer = undefined;
  }
}
