(function attachSocialLensRules(global) {
  function normalizeTag(tag) {
    return String(tag || "").trim().toLowerCase();
  }

  function tagsForTarget(state, targetType, identity) {
    if (!isLayerEnabled(state, "tag_pack")) {
      return [];
    }

    return (state.tags || []).filter((entry) => {
      return entry.targetType === targetType && entry.targetId === identity;
    });
  }

  function isLayerEnabled(state, type) {
    const layers = state.layers || [];
    const matching = layers.filter((layer) => layer.type === type);

    if (!matching.length) {
      return true;
    }

    return matching.some((layer) => layer.enabled);
  }

  function hasTag(state, targetType, identity, tag) {
    const wanted = normalizeTag(tag);
    return tagsForTarget(state, targetType, identity).some((entry) => {
      return normalizeTag(entry.tag) === wanted;
    });
  }

  function ruleMatches(rule, context, state) {
    if (!rule.enabled || !rule.when) {
      return false;
    }

    const target = rule.when.target || "content";
    const tag = rule.when.tag;

    if (!tag) {
      return false;
    }

    if (target === "content") {
      return hasTag(state, "content", context.contentId, tag);
    }

    if (target === "author") {
      return context.authorId && hasTag(state, "author", context.authorId, tag);
    }

    if (target === "domain") {
      return context.domain && hasTag(state, "domain", context.domain, tag);
    }

    return false;
  }

  function evaluateRules(state, context) {
    if (!isLayerEnabled(state, "rules")) {
      return [];
    }

    const actions = [];

    for (const rule of state.rules || []) {
      if (ruleMatches(rule, context, state)) {
        actions.push({
          ruleId: rule.id,
          label: rule.label,
          ...rule.then
        });
      }
    }

    return actions;
  }

  function summarizeActions(actions) {
    const summary = {
      hidden: false,
      dimmed: false,
      boosted: false,
      badges: [],
      score: 1
    };

    for (const action of actions) {
      if (action.action === "hide") {
        summary.hidden = true;
      }

      if (action.action === "dim") {
        summary.dimmed = true;
        summary.score -= Number(action.weight || 0.4);
      }

      if (action.action === "boost") {
        summary.boosted = true;
        summary.score += Number(action.weight || 1);
      }

      if (action.action === "badge") {
        summary.badges.push(action.label || action.ruleId || "tagged");
      }
    }

    return summary;
  }

  global.SocialLensRules = {
    evaluateRules,
    hasTag,
    isLayerEnabled,
    normalizeTag,
    summarizeActions,
    tagsForTarget
  };
})(globalThis);
