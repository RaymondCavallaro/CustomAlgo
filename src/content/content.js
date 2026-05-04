(function bootSocialLens(global) {
  const STORAGE_KEY = "socialLens";
  const enhancedElements = new WeakSet();
  let state = null;
  let observer = null;
  let scanTimer = null;
  let isApplying = false;

  function ensureStateShape(nextState) {
    return {
      ...global.SocialLensDefaults.defaultState,
      ...(nextState || {}),
      rules: nextState?.rules || global.SocialLensDefaults.defaultState.rules,
      quickTags: nextState?.quickTags || global.SocialLensDefaults.defaultState.quickTags,
      tags: nextState?.tags || []
    };
  }

  async function readState() {
    const data = await chrome.storage.local.get(STORAGE_KEY);
    state = ensureStateShape(data[STORAGE_KEY]);
    return state;
  }

  async function writeState(nextState) {
    state = ensureStateShape(nextState);
    await chrome.storage.local.set({ [STORAGE_KEY]: state });
    applyToPage();
  }

  function findExistingTag(targetType, targetId, tag) {
    const normalized = global.SocialLensRules.normalizeTag(tag);

    return (state.tags || []).find((entry) => {
      return entry.targetType === targetType
        && entry.targetId === targetId
        && global.SocialLensRules.normalizeTag(entry.tag) === normalized;
    });
  }

  async function addTag(context, targetType, tag) {
    const targetId = targetType === "author"
      ? context.authorId
      : targetType === "domain"
        ? context.domain
        : context.contentId;

    if (!targetId || !tag || findExistingTag(targetType, targetId, tag)) {
      return;
    }

    const nextTag = {
      id: crypto.randomUUID(),
      tag,
      targetType,
      targetId,
      platform: context.platform,
      url: context.url,
      title: context.title,
      author: context.author,
      sourceUser: "me",
      visibility: "private",
      confidence: 1,
      createdAt: new Date().toISOString()
    };

    await writeState({
      ...state,
      tags: [...state.tags, nextTag]
    });
  }

  function removeLensChrome(element) {
    element.querySelectorAll(":scope > .slens-toolbar, :scope > .slens-badge-row").forEach((node) => {
      node.remove();
    });
  }

  function renderToolbar(element, context) {
    if (element.querySelector(":scope > .slens-toolbar")) {
      return;
    }

    const toolbar = document.createElement("div");
    toolbar.className = "slens-toolbar";

    const tagSelect = document.createElement("select");
    tagSelect.title = "Tag this item";

    for (const tag of state.quickTags || []) {
      const option = document.createElement("option");
      option.value = tag;
      option.textContent = tag;
      tagSelect.append(option);
    }

    const contentButton = document.createElement("button");
    contentButton.type = "button";
    contentButton.textContent = "Tag post";
    contentButton.addEventListener("click", () => addTag(context, "content", tagSelect.value));

    const authorButton = document.createElement("button");
    authorButton.type = "button";
    authorButton.textContent = "Tag author";
    authorButton.disabled = !context.authorId;
    authorButton.addEventListener("click", () => addTag(context, "author", tagSelect.value));

    const domainButton = document.createElement("button");
    domainButton.type = "button";
    domainButton.textContent = "Tag domain";
    domainButton.addEventListener("click", () => addTag(context, "domain", tagSelect.value));

    toolbar.append(tagSelect, contentButton, authorButton, domainButton);
    element.append(toolbar);
  }

  function renderBadges(element, labels) {
    if (!labels.length) {
      return;
    }

    const row = document.createElement("div");
    row.className = "slens-badge-row";

    for (const label of labels.slice(0, 5)) {
      const badge = document.createElement("span");
      badge.className = "slens-badge";
      badge.textContent = label;
      row.append(badge);
    }

    element.append(row);
  }

  function showHiddenCard(element, context) {
    if (element.previousElementSibling?.classList.contains("slens-hidden-card")) {
      return;
    }

    const card = document.createElement("div");
    card.className = "slens-hidden-card";
    card.textContent = "SocialLens hid this item.";

    const reveal = document.createElement("button");
    reveal.type = "button";
    reveal.textContent = "Show";
    reveal.addEventListener("click", () => {
      element.classList.remove("slens-state-hidden");
      card.remove();
      renderToolbar(element, context);
    });

    card.append(reveal);
    element.before(card);
  }

  function applyActions(element, context) {
    element.classList.remove("slens-state-hidden", "slens-state-dimmed", "slens-state-boosted");
    removeLensChrome(element);

    const actions = global.SocialLensRules.evaluateRules(state, context);
    const summary = global.SocialLensRules.summarizeActions(actions);
    const ownTags = global.SocialLensRules.tagsForTarget(state, "content", context.contentId).map((entry) => entry.tag);
    const badges = [...new Set([...ownTags, ...summary.badges])];

    if (summary.hidden && state.mode !== "default") {
      element.classList.add("slens-state-hidden");
      showHiddenCard(element, context);
      return;
    }

    if (summary.dimmed && state.mode !== "default") {
      element.classList.add("slens-state-dimmed");
    }

    if (summary.boosted && state.mode !== "default") {
      element.classList.add("slens-state-boosted");
    }

    renderBadges(element, badges);
    renderToolbar(element, context);
  }

  function applyToPage() {
    if (!state) {
      return;
    }

    isApplying = true;
    const items = global.SocialLensPlatforms.findItems();

    for (const { element, context } of items) {
      if (!enhancedElements.has(element)) {
        enhancedElements.add(element);
        element.classList.add("slens-enhanced");
      }

      applyActions(element, context);
    }

    window.setTimeout(() => {
      isApplying = false;
    }, 0);
  }

  function scheduleScan() {
    if (isApplying) {
      return;
    }

    window.clearTimeout(scanTimer);
    scanTimer = window.setTimeout(applyToPage, 300);
  }

  async function start() {
    await readState();
    applyToPage();

    observer = new MutationObserver(scheduleScan);
    observer.observe(document.body, { childList: true, subtree: true });

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === "local" && changes[STORAGE_KEY]) {
        state = ensureStateShape(changes[STORAGE_KEY].newValue);
        applyToPage();
      }
    });
  }

  if (document.body) {
    start();
  }
})(globalThis);
