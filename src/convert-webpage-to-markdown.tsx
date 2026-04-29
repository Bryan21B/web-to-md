import { Action, ActionPanel, BrowserExtension, Clipboard, Detail, Form, LaunchProps, Toast, closeMainWindow, getPreferenceValues, popToRoot, showToast } from "@raycast/api";
import { useEffect, useMemo, useState } from "react";
import { convertWebpageToMarkdown } from "./lib/convert";
import { looksLikeUrl, normalizeUrl } from "./lib/url";
import type { CommandArguments, CommandPreferences } from "./lib/types";

type Props = LaunchProps<{ arguments: CommandArguments }>;

export default function ConvertWebpageToMarkdownCommand(props: Props) {
  const preferences = getPreferenceValues<CommandPreferences>();
  const argUrl = props.arguments.url?.trim();

  const [initialUrl, setInitialUrl] = useState<string>("");
  const [running, setRunning] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("Preparing…");
  const [error, setError] = useState<string | null>(null);

  const shouldAutoRun = useMemo(() => Boolean(argUrl && looksLikeUrl(argUrl)), [argUrl]);

  useEffect(() => {
    let cancelled = false;

    async function resolveInitialUrl() {
      // Prefer the active browser tab URL
      try {
        const tabs = await BrowserExtension.getTabs();
        const activeTab = tabs.find((tab) => tab.active);
        if (!cancelled && activeTab?.url && looksLikeUrl(activeTab.url)) {
          setInitialUrl(activeTab.url);
          return;
        }
      } catch {
        // Browser extension not installed — fall through to clipboard
      }

      // Fall back to clipboard
      try {
        const text = (await Clipboard.readText())?.trim() ?? "";
        if (!cancelled && looksLikeUrl(text)) setInitialUrl(text);
      } catch {
        // ignore clipboard errors
      }
    }

    void resolveInitialUrl();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!shouldAutoRun) return;
    if (running) return;

    const url = normalizeUrl(argUrl!);
    void run(url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldAutoRun]);

  async function run(url: string) {
    setRunning(true);
    setError(null);

    try {
      setStatus("Fetching page…");
      const result = await convertWebpageToMarkdown({
        url,
        preferences,
        onProgress: (message) => setStatus(message),
      });

      await Clipboard.copy(result.markdown);

      await showToast({
        style: Toast.Style.Success,
        title: "Saved Markdown",
        message: result.outputPath,
        primaryAction: {
          title: "Copy Path",
          onAction: () => Clipboard.copy(result.outputPath),
        },
      });

      await closeMainWindow({ clearRootSearch: true });
      await popToRoot({ clearSearchBar: true });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message);
      await showToast({ style: Toast.Style.Failure, title: "Conversion failed", message });
    } finally {
      setRunning(false);
    }
  }

  if (shouldAutoRun || running) {
    const markdown = error ? `# Error\n\n${error}` : `# Converting…\n\n${status}`;
    return <Detail isLoading={!error} markdown={markdown} />;
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Convert"
            onSubmit={(values) => {
              const normalized = normalizeUrl(String(values.url ?? ""));
              void run(normalized);
            }}
          />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="url"
        title="URL"
        placeholder="https://example.com/blog-post"
        defaultValue={looksLikeUrl(argUrl ?? "") ? argUrl : initialUrl}
      />
    </Form>
  );
}
