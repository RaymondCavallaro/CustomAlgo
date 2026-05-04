importScripts("shared/defaults.js");

chrome.runtime.onInstalled.addListener(async () => {
  const current = await chrome.storage.local.get("socialLens");

  if (!current.socialLens) {
    await chrome.storage.local.set({
      socialLens: globalThis.SocialLensDefaults
        ? globalThis.SocialLensDefaults.defaultState
        : {
            version: 1,
            mode: "clean",
            tags: [],
            contacts: [],
            circles: [],
            layers: [],
            rules: [],
            quickTags: []
          }
    });
  }
});
