const STORAGE_KEY = "socialLens";

const modeSelect = document.querySelector("#mode");
const summary = document.querySelector("#summary");
const quickTags = document.querySelector("#quickTags");
const layers = document.querySelector("#layers");
const openOptions = document.querySelector("#openOptions");

let state = null;

function ensureStateShape(nextState) {
  return {
    ...SocialLensDefaults.defaultState,
    ...(nextState || {}),
    tags: nextState?.tags || [],
    layers: nextState?.layers || SocialLensDefaults.defaultState.layers
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

function renderSummary() {
  const tagCount = state.tags.length;
  const ruleCount = (state.rules || []).filter((rule) => rule.enabled).length;
  summary.textContent = `${tagCount} tags, ${ruleCount} active rules`;
}

function renderQuickTags() {
  quickTags.replaceChildren();

  for (const tag of state.quickTags || []) {
    const chip = document.createElement("span");
    chip.textContent = tag;
    quickTags.append(chip);
  }
}

function renderLayers() {
  layers.replaceChildren();

  for (const layer of [...(state.layers || [])].sort((a, b) => a.priority - b.priority)) {
    const row = document.createElement("label");
    row.className = "layer";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = layer.enabled;
    checkbox.addEventListener("change", async () => {
      layer.enabled = checkbox.checked;
      await writeState();
    });

    const name = document.createElement("strong");
    name.textContent = layer.name;

    const detail = document.createElement("small");
    detail.textContent = `${layer.type} layer, priority ${layer.priority}`;

    row.append(checkbox, name, detail);
    layers.append(row);
  }
}

function render() {
  modeSelect.value = state.mode || "clean";
  renderSummary();
  renderQuickTags();
  renderLayers();
}

modeSelect.addEventListener("change", async () => {
  state.mode = modeSelect.value;
  await writeState();
});

openOptions.addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

readState().then(render);
