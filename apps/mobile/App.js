import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import * as SQLite from "expo-sqlite";
import {
  createDefaultState,
  createTag,
  evaluateRules,
  summarizeActions,
  tagsForTarget,
  toggleLayer
} from "@customalgo/sociallens-core";

const STORAGE_KEY = "customalgo.sociallens.state.v1";

const tabs = [
  { id: "capture", label: "Capture" },
  { id: "lens", label: "Lens" },
  { id: "tags", label: "Tags" },
  { id: "data", label: "Data" }
];

const starterContent = {
  platform: "mobile-share",
  url: "https://example.org/research-note",
  title: "Example shared page",
  author: "Shared from mobile",
  domain: "example.org",
  contentId: "mobile-share:example-research-note",
  authorId: "mobile-share:author:shared-from-mobile"
};

const fastTags = [
  { tag: "spam", label: "Spam" },
  { tag: "ragebait", label: "Ragebait" },
  { tag: "clickbait", label: "Clickbait" },
  { tag: "low-quality", label: "Low quality" },
  { tag: "source-backed", label: "Source backed" },
  { tag: "deep-research", label: "Deep research" },
  { tag: "save-for-later", label: "Save" }
];

let db;

function getDb() {
  if (!db) {
    db = SQLite.openDatabaseSync("sociallens.db");
    db.execSync("CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL)");
  }

  return db;
}

function loadStoredState() {
  const row = getDb().getFirstSync("SELECT value FROM kv WHERE key = ?", STORAGE_KEY);

  if (!row?.value) {
    return null;
  }

  return JSON.parse(row.value);
}

function saveStoredState(state) {
  getDb().runSync(
    "INSERT OR REPLACE INTO kv (key, value) VALUES (?, ?)",
    STORAGE_KEY,
    JSON.stringify(state)
  );
}

function ensureStateShape(value) {
  const defaults = createDefaultState();

  if (!value || typeof value !== "object") {
    return defaults;
  }

  return {
    ...defaults,
    ...value,
    circles: Array.isArray(value.circles) ? value.circles : defaults.circles,
    contacts: Array.isArray(value.contacts) ? value.contacts : defaults.contacts,
    layers: Array.isArray(value.layers) ? value.layers : defaults.layers,
    quickTags: mergeUnique(defaults.quickTags, value.quickTags),
    rules: mergeById(defaults.rules, value.rules),
    tags: Array.isArray(value.tags) ? value.tags : defaults.tags
  };
}

function mergeById(defaultItems, userItems) {
  if (!Array.isArray(userItems)) {
    return defaultItems;
  }

  const seen = new Set(userItems.map((item) => item.id));
  const missingDefaults = defaultItems.filter((item) => !seen.has(item.id));

  return [...userItems, ...missingDefaults];
}

function mergeUnique(defaultItems, userItems) {
  if (!Array.isArray(userItems)) {
    return defaultItems;
  }

  return [...userItems, ...defaultItems.filter((item) => !userItems.includes(item))];
}

export default function App() {
  const [state, setState] = useState(() => createDefaultState());
  const [activeTab, setActiveTab] = useState("capture");
  const [draftUrl, setDraftUrl] = useState(starterContent.url);
  const [draftTitle, setDraftTitle] = useState(starterContent.title);
  const [draftNote, setDraftNote] = useState("");
  const [selectedTag, setSelectedTag] = useState("deep-research");
  const [tagFilter, setTagFilter] = useState("");
  const [dataText, setDataText] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [status, setStatus] = useState("Loading local lens...");

  useEffect(() => {
    try {
      const stored = loadStoredState();
      const nextState = ensureStateShape(stored);
      setState(nextState);
      setDataText(JSON.stringify(nextState, null, 2));
      setStatus(stored ? "Loaded saved iPad/local lens." : "Started a fresh local lens.");
    } catch (error) {
      setStatus(`Local storage error: ${error.message}`);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    try {
      saveStoredState(state);
      setStatus("Saved locally on this device.");
    } catch (error) {
      setStatus(`Save failed: ${error.message}`);
    }
  }, [isLoaded, state]);

  const capturedContent = useMemo(() => {
    const url = draftUrl.trim() || starterContent.url;
    const title = draftTitle.trim() || url;
    const domain = domainFromUrl(url);

    return {
      ...starterContent,
      url,
      title,
      domain,
      contentId: `mobile-share:${stableId(url)}`,
      authorId: `mobile-share:domain:${domain}`
    };
  }, [draftTitle, draftUrl]);

  const actions = evaluateRules(state, capturedContent);
  const summary = summarizeActions(actions);
  const capturedTags = tagsForTarget(state, "content", capturedContent.contentId);

  function addContentTag(tagName = selectedTag) {
    const tag = createTag({
      tag: tagName,
      targetType: "content",
      targetId: capturedContent.contentId,
      platform: capturedContent.platform,
      url: capturedContent.url,
      title: capturedContent.title,
      author: capturedContent.author,
      visibility: "private",
      note: draftNote
    });

    setSelectedTag(tagName);
    setState((current) => {
      const exists = current.tags.some((item) => {
        return item.targetId === tag.targetId && item.targetType === tag.targetType && item.tag === tag.tag;
      });

      if (exists) {
        return current;
      }

      return { ...current, tags: [...current.tags, tag] };
    });
  }

  function removeTag(tagId) {
    setState((current) => ({
      ...current,
      tags: current.tags.filter((tag) => tag.id !== tagId)
    }));
  }

  function setLayerEnabled(layerId, enabled) {
    setState((current) => toggleLayer(current, layerId, enabled));
  }

  function exportLens() {
    setDataText(JSON.stringify(state, null, 2));
    setStatus("Export prepared from current local lens.");
  }

  function importLens() {
    try {
      const parsed = JSON.parse(dataText);
      const nextState = ensureStateShape(parsed);
      setState(nextState);
      setStatus("Imported lens JSON into local storage.");
    } catch (error) {
      setStatus(`Import failed: ${error.message}`);
    }
  }

  function resetLens() {
    const nextState = createDefaultState();
    setState(nextState);
    setDataText(JSON.stringify(nextState, null, 2));
    setStatus("Reset to the default clean-feed lens.");
  }

  return (
    <SafeAreaView style={styles.shell}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.kicker}>CustomAlgo</Text>
          <Text style={styles.title}>SocialLens Mobile</Text>
          <Text style={styles.status}>{status}</Text>
        </View>
        <View style={styles.counter}>
          <Text style={styles.counterNumber}>{state.tags.length}</Text>
          <Text style={styles.counterLabel}>tags</Text>
        </View>
      </View>

      <View style={styles.tabs}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            accessibilityRole="button"
            onPress={() => setActiveTab(tab.id)}
            style={[styles.tabButton, activeTab === tab.id && styles.tabButtonActive]}
          >
            <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === "capture" && (
          <CaptureView
            actions={actions}
            capturedContent={capturedContent}
            capturedTags={capturedTags}
            draftNote={draftNote}
            draftTitle={draftTitle}
            draftUrl={draftUrl}
            onAddFastTag={addContentTag}
            onAddTag={() => addContentTag()}
            onDraftNoteChange={setDraftNote}
            onDraftTitleChange={setDraftTitle}
            onDraftUrlChange={setDraftUrl}
            onRemoveTag={removeTag}
            onSelectedTagChange={setSelectedTag}
            quickTags={state.quickTags}
            selectedTag={selectedTag}
            summary={summary}
          />
        )}

        {activeTab === "lens" && (
          <LensView
            layers={state.layers}
            mode={state.mode}
            rules={state.rules}
            onLayerToggle={setLayerEnabled}
          />
        )}

        {activeTab === "tags" && (
          <TagsView
            filter={tagFilter}
            onFilterChange={setTagFilter}
            onRemoveTag={removeTag}
            tags={state.tags}
          />
        )}

        {activeTab === "data" && (
          <DataView
            dataText={dataText}
            onDataTextChange={setDataText}
            onExport={exportLens}
            onImport={importLens}
            onReset={resetLens}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function CaptureView(props) {
  return (
    <View style={styles.stack}>
      <Section title="Shared Item">
        <TextInput
          autoCapitalize="none"
          keyboardType="url"
          onChangeText={props.onDraftUrlChange}
          placeholder="Paste or share a URL"
          style={styles.input}
          value={props.draftUrl}
        />
        <TextInput
          onChangeText={props.onDraftTitleChange}
          placeholder="Title or note"
          style={styles.input}
          value={props.draftTitle}
        />
        <TextInput
          multiline
          onChangeText={props.onDraftNoteChange}
          placeholder="Why this tag matters"
          style={[styles.input, styles.noteInput]}
          value={props.draftNote}
        />
        <Text style={styles.meta}>{props.capturedContent.domain}</Text>
      </Section>

      <Section title="Fast Decisions">
        <View style={styles.chips}>
          {fastTags.map((item) => (
            <TouchableOpacity
              key={item.tag}
              onPress={() => props.onAddFastTag(item.tag)}
              style={styles.chip}
            >
              <Text style={styles.chipText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Section>

      <Section title="Quick Tag">
        <View style={styles.chips}>
          {props.quickTags.map((tag) => (
            <TouchableOpacity
              key={tag}
              onPress={() => props.onSelectedTagChange(tag)}
              style={[styles.chip, props.selectedTag === tag && styles.chipActive]}
            >
              <Text style={[styles.chipText, props.selectedTag === tag && styles.chipTextActive]}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <PrimaryButton label="Tag this item" onPress={props.onAddTag} />
      </Section>

      <Section title="Lens Result">
        <View style={styles.resultRow}>
          <ResultBadge active={props.summary.hidden} label="Hidden" />
          <ResultBadge active={props.summary.dimmed} label="Dimmed" />
          <ResultBadge active={props.summary.boosted} label="Boosted" />
          {props.summary.badges.map((badge) => (
            <ResultBadge key={badge} active label={badge} />
          ))}
        </View>
        <Text style={styles.meta}>Score {props.summary.score.toFixed(1)}</Text>
        {props.actions.length > 0 && (
          <View style={styles.stackCompact}>
            {props.actions.map((action) => (
              <Text key={action.ruleId} style={styles.meta}>{action.label}</Text>
            ))}
          </View>
        )}
      </Section>

      <Section title="Current Item Tags">
        {props.capturedTags.length === 0 ? (
          <Text style={styles.empty}>No tags on this item yet.</Text>
        ) : (
          props.capturedTags.map((tag) => (
            <TagRow key={tag.id} tag={tag} onRemove={() => props.onRemoveTag(tag.id)} />
          ))
        )}
      </Section>
    </View>
  );
}

function LensView({ layers, mode, onLayerToggle, rules }) {
  return (
    <View style={styles.stack}>
      <Section title="Mode">
        <Text style={styles.bodyText}>{mode}</Text>
      </Section>

      <Section title="Layer Stack">
        {[...layers].sort((a, b) => a.priority - b.priority).map((layer) => (
          <View key={layer.id} style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>{layer.name}</Text>
              <Text style={styles.meta}>{layer.type} layer, priority {layer.priority}</Text>
            </View>
            <TouchableOpacity
              onPress={() => onLayerToggle(layer.id, !layer.enabled)}
              style={[styles.toggle, layer.enabled && styles.toggleActive]}
            >
              <Text style={[styles.toggleText, layer.enabled && styles.toggleTextActive]}>
                {layer.enabled ? "On" : "Off"}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </Section>

      <Section title="Rules">
        {rules.map((rule) => (
          <View key={rule.id} style={styles.rule}>
            <Text style={styles.rowTitle}>{rule.label}</Text>
            <Text style={styles.meta}>if {rule.when.target} has "{rule.when.tag}" then {rule.then.action}</Text>
          </View>
        ))}
      </Section>
    </View>
  );
}

function TagsView({ filter, onFilterChange, onRemoveTag, tags }) {
  const normalizedFilter = filter.trim().toLowerCase();
  const visibleTags = normalizedFilter
    ? tags.filter((tag) => {
        const haystack = `${tag.tag} ${tag.title} ${tag.url} ${tag.note}`.toLowerCase();
        return haystack.includes(normalizedFilter);
      })
    : tags;

  return (
    <View style={styles.stack}>
      <Section title="Local Mobile Tags">
        <TextInput
          autoCapitalize="none"
          onChangeText={onFilterChange}
          placeholder="Filter local tags"
          style={styles.input}
          value={filter}
        />
        {visibleTags.length === 0 ? (
          <Text style={styles.empty}>Captured mobile tags will appear here.</Text>
        ) : (
          visibleTags.map((tag) => (
            <TagRow key={tag.id} tag={tag} onRemove={() => onRemoveTag(tag.id)} />
          ))
        )}
      </Section>
    </View>
  );
}

function DataView({ dataText, onDataTextChange, onExport, onImport, onReset }) {
  return (
    <View style={styles.stack}>
      <Section title="Portable Lens Data">
        <TextInput
          autoCapitalize="none"
          multiline
          onChangeText={onDataTextChange}
          placeholder="Exported lens JSON"
          style={[styles.input, styles.dataInput]}
          value={dataText}
        />
        <View style={styles.buttonRow}>
          <PrimaryButton label="Export" onPress={onExport} />
          <PrimaryButton label="Import" onPress={onImport} />
        </View>
        <DangerButton label="Reset defaults" onPress={onReset} />
      </Section>
    </View>
  );
}

function Section({ children, title }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function PrimaryButton({ label, onPress }) {
  return (
    <TouchableOpacity accessibilityRole="button" onPress={onPress} style={styles.primaryButton}>
      <Text style={styles.primaryButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

function DangerButton({ label, onPress }) {
  return (
    <TouchableOpacity accessibilityRole="button" onPress={onPress} style={styles.dangerButton}>
      <Text style={styles.dangerButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

function ResultBadge({ active, label }) {
  return (
    <View style={[styles.resultBadge, active && styles.resultBadgeActive]}>
      <Text style={[styles.resultBadgeText, active && styles.resultBadgeTextActive]}>{label}</Text>
    </View>
  );
}

function TagRow({ onRemove, tag }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{tag.tag}</Text>
        <Text style={styles.meta}>{tag.targetType} | {tag.platform} | {tag.visibility}</Text>
        {!!tag.title && <Text style={styles.bodyText}>{tag.title}</Text>}
        {!!tag.note && <Text style={styles.meta}>{tag.note}</Text>}
      </View>
      <TouchableOpacity accessibilityRole="button" onPress={onRemove} style={styles.removeButton}>
        <Text style={styles.removeButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );
}

function domainFromUrl(value) {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch (_error) {
    return "unknown";
  }
}

function stableId(value) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash).toString(36);
}

const palette = {
  ink: "#172033",
  muted: "#667085",
  line: "#d8dee8",
  panel: "#ffffff",
  canvas: "#f6f7f9",
  accent: "#0f766e",
  accentSoft: "#d9f3ee",
  warning: "#7c2d12",
  warningSoft: "#fff1eb"
};

const styles = StyleSheet.create({
  shell: {
    backgroundColor: palette.canvas,
    flex: 1
  },
  header: {
    alignItems: "center",
    backgroundColor: palette.panel,
    borderBottomColor: palette.line,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14
  },
  headerText: {
    flex: 1,
    paddingRight: 10
  },
  kicker: {
    color: palette.accent,
    fontSize: 12,
    fontWeight: "700"
  },
  title: {
    color: palette.ink,
    fontSize: 22,
    fontWeight: "800",
    marginTop: 2
  },
  status: {
    color: palette.muted,
    fontSize: 12,
    marginTop: 4
  },
  counter: {
    alignItems: "center",
    backgroundColor: palette.accentSoft,
    borderRadius: 8,
    minWidth: 58,
    paddingHorizontal: 10,
    paddingVertical: 7
  },
  counterNumber: {
    color: palette.accent,
    fontSize: 18,
    fontWeight: "800"
  },
  counterLabel: {
    color: palette.accent,
    fontSize: 11,
    fontWeight: "700"
  },
  tabs: {
    backgroundColor: palette.panel,
    borderBottomColor: palette.line,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 8,
    padding: 10
  },
  tabButton: {
    alignItems: "center",
    borderColor: palette.line,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minHeight: 38,
    justifyContent: "center"
  },
  tabButtonActive: {
    backgroundColor: palette.ink,
    borderColor: palette.ink
  },
  tabText: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: "700"
  },
  tabTextActive: {
    color: "#ffffff"
  },
  content: {
    padding: 14,
    paddingBottom: 32
  },
  stack: {
    gap: 12
  },
  stackCompact: {
    gap: 4
  },
  section: {
    backgroundColor: palette.panel,
    borderColor: palette.line,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 14
  },
  sectionTitle: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: "800"
  },
  input: {
    borderColor: palette.line,
    borderRadius: 7,
    borderWidth: 1,
    color: palette.ink,
    fontSize: 15,
    minHeight: 42,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  noteInput: {
    minHeight: 72,
    textAlignVertical: "top"
  },
  dataInput: {
    fontFamily: "monospace",
    minHeight: 260,
    textAlignVertical: "top"
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7
  },
  chip: {
    borderColor: palette.line,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7
  },
  chipActive: {
    backgroundColor: palette.accent,
    borderColor: palette.accent
  },
  chipText: {
    color: palette.ink,
    fontSize: 12,
    fontWeight: "700"
  },
  chipTextActive: {
    color: "#ffffff"
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: palette.ink,
    borderRadius: 7,
    flex: 1,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 10
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800"
  },
  dangerButton: {
    alignItems: "center",
    backgroundColor: palette.warningSoft,
    borderColor: "#f1c6b5",
    borderRadius: 7,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 10
  },
  dangerButtonText: {
    color: palette.warning,
    fontSize: 15,
    fontWeight: "800"
  },
  resultRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  resultBadge: {
    borderColor: palette.line,
    borderRadius: 7,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7
  },
  resultBadgeActive: {
    backgroundColor: palette.accentSoft,
    borderColor: palette.accent
  },
  resultBadgeText: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: "800"
  },
  resultBadgeTextActive: {
    color: palette.accent
  },
  row: {
    alignItems: "center",
    borderColor: palette.line,
    borderRadius: 7,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
    padding: 10
  },
  rowText: {
    flex: 1,
    gap: 3
  },
  rowTitle: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: "800"
  },
  meta: {
    color: palette.muted,
    fontSize: 12
  },
  bodyText: {
    color: palette.ink,
    fontSize: 14
  },
  empty: {
    color: palette.muted,
    fontSize: 14
  },
  removeButton: {
    borderColor: "#f1c6b5",
    borderRadius: 7,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 7
  },
  removeButtonText: {
    color: palette.warning,
    fontSize: 12,
    fontWeight: "800"
  },
  toggle: {
    borderColor: palette.line,
    borderRadius: 7,
    borderWidth: 1,
    minWidth: 48,
    paddingHorizontal: 9,
    paddingVertical: 7
  },
  toggleActive: {
    backgroundColor: palette.accent,
    borderColor: palette.accent
  },
  toggleText: {
    color: palette.ink,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center"
  },
  toggleTextActive: {
    color: "#ffffff"
  },
  rule: {
    borderColor: palette.line,
    borderRadius: 7,
    borderWidth: 1,
    gap: 3,
    padding: 10
  }
});
