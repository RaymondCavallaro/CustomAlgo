const STORAGE_KEY = "socialLens";

const quickTags = document.querySelector("#quickTags");
const tagEntries = document.querySelector("#tagEntries");
const rules = document.querySelector("#rules");
const tagForm = document.querySelector("#tagForm");
const tagInput = document.querySelector("#tagInput");
const ruleForm = document.querySelector("#ruleForm");
const ruleLabel = document.querySelector("#ruleLabel");
const ruleTarget = document.querySelector("#ruleTarget");
const ruleTag = document.querySelector("#ruleTag");
const ruleAction = document.querySelector("#ruleAction");
const dataBox = document.querySelector("#dataBox");
const exportData = document.querySelector("#exportData");
const importData = document.querySelector("#importData");
const resetData = document.querySelector("#resetData");

let state = null;

function ensureStateShape(nextState) {
  return {
    ...SocialLensDefaults.defaultState,
    ...(nextState || {}),
    tags: nextState?.tags || [],
    rules: nextState?.rules || SocialLensDefaults.defaultState.rules,
    quickTags: nextState?.quickTags || SocialLensDefaults.defaultState.quickTags
  };
}

async function readState() {
  const data = await chrome.storage.local.get(STORAGE_KEY);
  state = ensureStateShape(data[STORAGE_KEY]);
}

async function writeState() {
  await chrome.storage.local.set({ [STORAGE_KEY]: state });
  render();
}

function makeDeleteButton(onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "Remove";
  button.addEventListener("click", onClick);
  return button;
}

function renderQuickTags() {
  quickTags.replaceChildren();

  for (const tag of state.quickTags || []) {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.append(document.createTextNode(tag));
    chip.append(makeDeleteButton(async () => {
      state.quickTags = state.quickTags.filter((item) => item !== tag);
      await writeState();
    }));
    quickTags.append(chip);
  }
}

function renderRules() {
  rules.replaceChildren();

  for (const rule of state.rules || []) {
    const row = document.createElement("label");
    row.className = "row";

    const enabled = document.createElement("input");
    enabled.type = "checkbox";
    enabled.checked = rule.enabled;
    enabled.addEventListener("change", async () => {
      rule.enabled = enabled.checked;
      await writeState();
    });

    const copy = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = rule.label;
    const detail = document.createElement("small");
    detail.textContent = `if ${rule.when.target} has "${rule.when.tag}" then ${rule.then.action}`;
    copy.append(title, detail);

    row.append(enabled, copy, makeDeleteButton(async () => {
      state.rules = state.rules.filter((item) => item.id !== rule.id);
      await writeState();
    }));
    rules.append(row);
  }
}

function renderTagEntries() {
  tagEntries.replaceChildren();

  const entries = [...(state.tags || [])].sort((a, b) => {
    return String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
  });

  if (!entries.length) {
    const empty = document.createElement("p");
    empty.textContent = "No tags yet. Use the overlay on social pages to start classifying content.";
    tagEntries.append(empty);
    return;
  }

  for (const entry of entries.slice(0, 80)) {
    const row = document.createElement("div");
    row.className = "row";

    const copy = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = `${entry.tag} -> ${entry.targetType}`;
    const detail = document.createElement("small");
    detail.textContent = `${entry.platform || "web"} | ${entry.author || entry.domain || entry.url || entry.targetId}`;
    copy.append(title, detail);

    row.append(copy, makeDeleteButton(async () => {
      state.tags = state.tags.filter((item) => item.id !== entry.id);
      await writeState();
    }));
    tagEntries.append(row);
  }
}

function render() {
  renderQuickTags();
  renderRules();
  renderTagEntries();
}

tagForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const tag = tagInput.value.trim();

  if (!tag || state.quickTags.includes(tag)) {
    return;
  }

  state.quickTags = [...state.quickTags, tag];
  tagInput.value = "";
  await writeState();
});

ruleForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const tag = ruleTag.value.trim();
  const label = ruleLabel.value.trim() || `${ruleAction.value} ${tag}`;

  if (!tag) {
    return;
  }

  state.rules = [
    ...state.rules,
    {
      id: crypto.randomUUID(),
      label,
      enabled: true,
      when: { target: ruleTarget.value, tag },
      then: { action: ruleAction.value, weight: ruleAction.value === "boost" ? 1.5 : 0.6, label: tag }
    }
  ];

  ruleLabel.value = "";
  ruleTag.value = "";
  await writeState();
});

exportData.addEventListener("click", () => {
  dataBox.value = JSON.stringify(state, null, 2);
});

importData.addEventListener("click", async () => {
  try {
    const imported = JSON.parse(dataBox.value);
    state = ensureStateShape(imported);
    await writeState();
  } catch (error) {
    dataBox.value = `Invalid JSON: ${error.message}`;
  }
});

resetData.addEventListener("click", async () => {
  state = structuredClone(SocialLensDefaults.defaultState);
  await writeState();
});

readState().then(render);
