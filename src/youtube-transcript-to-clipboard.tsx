import { Toast, getPreferenceValues, showToast } from "@raycast/api";
import { getActiveTab } from "./lib/active-tab";
import { runConversionToHud } from "./lib/run-conversion";

export default async function CopyYouTubeTranscript() {
  const preferences = getPreferenceValues<Preferences>();
  try {
    // Only the URL is needed: the transcript is fetched by video id.
    const tab = await getActiveTab();
    await runConversionToHud({
      url: tab.url,
      destination: "clipboard",
      preferences,
      kind: "youtube-transcript",
    });
  } catch (err) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Could not read active tab",
      message: err instanceof Error ? err.message : String(err),
    });
  }
}
