export function createTag(input) {
  return {
    id: input.id || createId("tag"),
    tag: input.tag,
    targetType: input.targetType,
    targetId: input.targetId,
    platform: input.platform || "web",
    url: input.url || "",
    title: input.title || "",
    author: input.author || "",
    sourceUser: input.sourceUser || "me",
    visibility: input.visibility || "private",
    confidence: input.confidence ?? 1,
    note: input.note || "",
    createdAt: input.createdAt || new Date().toISOString()
  };
}

export function upsertRule(state, rule) {
  const rules = state.rules || [];
  const existing = rules.findIndex((item) => item.id === rule.id);

  if (existing === -1) {
    return { ...state, rules: [...rules, rule] };
  }

  return {
    ...state,
    rules: rules.map((item) => (item.id === rule.id ? { ...item, ...rule } : item))
  };
}

export function toggleLayer(state, layerId, enabled) {
  return {
    ...state,
    layers: (state.layers || []).map((layer) => {
      if (layer.id !== layerId) {
        return layer;
      }

      return { ...layer, enabled };
    })
  };
}

export function mergeLens(baseState, importedState, sourceName) {
  const source = sourceName || importedState.name || importedState.sourceUser || "imported";
  const importedTags = (importedState.tags || []).map((tag) => ({
    ...tag,
    sourceUser: tag.sourceUser || source
  }));
  const importedRules = (importedState.rules || []).map((rule) => ({
    ...rule,
    id: rule.id || createId("rule")
  }));

  return {
    ...baseState,
    tags: [...(baseState.tags || []), ...importedTags],
    rules: [...(baseState.rules || []), ...importedRules],
    layers: [
      ...(baseState.layers || []),
      {
        id: `layer-import-${Date.now()}`,
        name: `${source} import`,
        type: "tag_pack",
        enabled: true,
        priority: 30,
        sourceUser: source
      }
    ]
  };
}

export function createId(prefix = "id") {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `${prefix}:${Date.now().toString(36)}:${Math.random().toString(36).slice(2, 10)}`;
}
