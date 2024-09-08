import React from "react";
import { useAppVisible } from "./utils";
import HighlightsInbox from "./components/highlights-inbox";

function App() {
  const visible = useAppVisible();

  if (visible) {
    return <HighlightsInbox onClose={() => window.logseq.hideMainUI()} />;
  }
  return null;
}

export default App;
