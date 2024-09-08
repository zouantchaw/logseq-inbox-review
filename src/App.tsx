import React from "react";
import HighlightsInbox from "./components/highlights-inbox";
import { useAppVisible } from "./utils";

function App() {
  const visible = useAppVisible();

  const handleClose = () => {
    window.logseq.hideMainUI();
  };

  if (visible) {
    return (
      <div className="App">
        <HighlightsInbox onClose={handleClose} />
      </div>
    );
  }
  return null;
}

export default App;
