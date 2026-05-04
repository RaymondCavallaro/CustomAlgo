(function attachSocialLensDefaults(global) {
  const defaultRules = [
    {
      id: "rule-hide-ragebait",
      label: "Hide ragebait",
      enabled: true,
      when: { target: "content", tag: "ragebait" },
      then: { action: "hide", weight: 1 }
    },
    {
      id: "rule-hide-spam",
      label: "Hide spam",
      enabled: true,
      when: { target: "content", tag: "spam" },
      then: { action: "hide", weight: 1 }
    },
    {
      id: "rule-dim-low-quality",
      label: "Dim low-quality",
      enabled: true,
      when: { target: "content", tag: "low-quality" },
      then: { action: "dim", weight: 0.6 }
    },
    {
      id: "rule-dim-clickbait",
      label: "Dim clickbait",
      enabled: true,
      when: { target: "content", tag: "clickbait" },
      then: { action: "dim", weight: 0.7 }
    },
    {
      id: "rule-boost-research",
      label: "Boost deep research",
      enabled: true,
      when: { target: "content", tag: "deep-research" },
      then: { action: "boost", weight: 1.7 }
    },
    {
      id: "rule-boost-source-backed",
      label: "Boost source-backed posts",
      enabled: true,
      when: { target: "content", tag: "source-backed" },
      then: { action: "boost", weight: 1.2 }
    },
    {
      id: "rule-badge-saved",
      label: "Badge saved items",
      enabled: true,
      when: { target: "content", tag: "save-for-later" },
      then: { action: "badge", label: "saved" }
    },
    {
      id: "rule-badge-trusted-author",
      label: "Badge trusted authors",
      enabled: true,
      when: { target: "author", tag: "trusted" },
      then: { action: "badge", label: "trusted" }
    }
  ];

  const defaultTags = [
    "high-signal",
    "source-backed",
    "save-for-later",
    "ragebait",
    "spam",
    "clickbait",
    "AI",
    "politics",
    "trusted",
    "low-quality",
    "sales-funnel",
    "deep-research",
    "funny",
    "misleading"
  ];

  const defaultState = {
    version: 1,
    mode: "clean",
    tags: [],
    contacts: [],
    circles: [
      { id: "circle-private", name: "Private", description: "Only visible to you." },
      { id: "circle-trusted", name: "Trusted", description: "People you explicitly trust." },
      { id: "circle-public", name: "Public", description: "Safe to share broadly." }
    ],
    layers: [
      {
        id: "layer-platform",
        name: "Platform default",
        type: "base",
        enabled: true,
        priority: 0
      },
      {
        id: "layer-personal-tags",
        name: "My personal tags",
        type: "tag_pack",
        enabled: true,
        priority: 10,
        sourceUser: "me"
      },
      {
        id: "layer-personal-rules",
        name: "My personal algorithm",
        type: "rules",
        enabled: true,
        priority: 20,
        sourceUser: "me"
      }
    ],
    rules: defaultRules,
    quickTags: defaultTags
  };

  global.SocialLensDefaults = {
    defaultRules,
    defaultState,
    defaultTags
  };
})(globalThis);
