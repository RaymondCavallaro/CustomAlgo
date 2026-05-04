import React, { useMemo, useState } from "react";
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
import {
  createDefaultState,
  createTag,
  evaluateRules,
  summarizeActions,
  tagsForTarget,
  toggleLayer
} from "@customalgo/sociallens-core";

const tabs = [
  { id: "capture", label: "Capture" },
  { id: "lens", label: "Lens" },
  { id: "tags", label: "Tags" }
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

export default function App() {
  const [state, setState] = useState(() => createDefaultState());
  const [activeTab, setActiveTab] = useState("capture");
  const [draftUrl, setDraftUrl] = useState(starterContent.url);
  const [draftTitle, setDraftTitle] = useState(starterContent.title);
  const [selectedTag, setSelectedTag] = useState("deep-research");

  const capturedContent = useMemo(() => {
    const url = draftUrl.trim() || starterContent.url;
    const title = draftTitle.trim() || url;
    const domain = domainFromUrl(url);

    return {
      ...starterContent,
      url,
      title,
      domain,
      contentId: `mobile-share:${stableId(url)}`
    };
  }, [draftTitle, draftUrl]);

  const actions = evaluateRules(state, capturedContent);
  const summary = summarizeActions(actions);
  const capturedTags = tagsForTarget(state, "content", capturedContent.contentId);

  function addContentTag() {
    const tag = createTag({
      tag: selectedTag,
      targetType: "content",
      targetId: capturedContent.contentId,
      platform: capturedContent.platform,
      url: capturedContent.url,
      title: capturedContent.title,
      author: capturedContent.author,
      visibility: "private"
    });

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

  return (
    <SafeAreaView style={styles.shell}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>CustomAlgo</Text>
          <Text style={styles.title}>SocialLens Mobile</Text>
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
            draftTitle={draftTitle}
            draftUrl={draftUrl}
            onAddTag={addContentTag}
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
          <TagsView tags={state.tags} onRemoveTag={removeTag} />
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
        <Text style={styles.meta}>{props.capturedContent.domain}</Text>
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
        </View>
        <Text style={styles.meta}>Score {props.summary.score.toFixed(1)}</Text>
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

function TagsView({ onRemoveTag, tags }) {
  return (
    <View style={styles.stack}>
      <Section title="Local Mobile Tags">
        {tags.length === 0 ? (
          <Text style={styles.empty}>Captured mobile tags will appear here.</Text>
        ) : (
          tags.map((tag) => (
            <TagRow key={tag.id} tag={tag} onRemove={() => onRemoveTag(tag.id)} />
          ))
        )}
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
  warning: "#7c2d12"
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
    paddingHorizontal: 10
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
  primaryButton: {
    alignItems: "center",
    backgroundColor: palette.ink,
    borderRadius: 7,
    minHeight: 44,
    justifyContent: "center"
  },
  primaryButtonText: {
    color: "#ffffff",
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
