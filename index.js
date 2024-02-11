// Register the main command
logseq.ready().then(() => {
  logseq.provideModel({
    async showFlashcardUI() {
      const result = await logseq.DB.datascriptQuery(
        `[:find (pull ?p [*])
        :where
        [?p :block/name ?name]
        [(clojure.string/includes? ?name "highlights")]
        :limit 1]`
      );

      // Check if there is at least one result
      if (result.length > 0) {
        const firstPage = result[0][0]; // Take the first result
        const pageTitle = firstPage.properties.title; // Assuming the title is stored in the title property
        const pageId = firstPage.uuid; // Assuming the id is stored in the id property
        const pageName = firstPage.name; // Assuming the name is stored in the name property
        logseq.App.showMsg(`Reviewing: ${pageName}`);

        // Now, get the content from that page
        const pageContentResult = await logseq.DB.datascriptQuery(
          `[:find (pull ?b [*])
            :where
            [?p :block/name "${pageName}"]
            [?b :block/page ?p]]`
        );

        let allBlockContents = "";
        // Limit the number of paragraphs to 3
        const limitedResults = pageContentResult.slice(0, 3);
        limitedResults.forEach((blockArray) => {
          const block = blockArray[0];
          allBlockContents += `<p>${block.content}</p>`;
        });

        const mainUI = document.querySelector("#app");
        mainUI.innerHTML = `
        <div class="flashcard-ui">
          <div class="flashcard-content">
            <button class="close-btn" onclick="logseq.hideMainUI()">X</button>
            <h2 class="flashcard-title">${pageTitle}</h2>
            <div class="flashcard-note">
              ${allBlockContents}
            </div>
            <div class="flashcard-actions">
              <button class="action-btn delete">Delete</button>
              <button class="action-btn save">Save</button>
            </div>
          </div>
        </div>
      `;
      }
      logseq.showMainUI();
    },
  });

  logseq.App.registerUIItem("toolbar", {
    key: "logseq-flashcards-open",
    template: `
      <a data-on-click="showFlashcardUI" class="button">
        <i class="ti ti-layers-difference"></i>
      </a>
    `,
  });

  // Close UI on ESC key
  document.addEventListener(
    "keydown",
    async function (e) {
      if (e.keyCode === 27) {
        await logseq.hideMainUI();
      }
    },
    false
  );
});

// Example HTML for the flashcard UI with styling
document.addEventListener("DOMContentLoaded", () => {
  const mainUI = document.querySelector("#app");
  mainUI.innerHTML = `
  <div class="flashcard-ui">
  <div class="flashcard-content">
    <button class="close-btn" onclick="logseq.hideMainUI()">X</button>
    <h2 class="flashcard-title">Inbox Review</h2>
    <div class="flashcard-note">
      <h3 class="note-title">Markdown Note</h3>
      <p class="note-content">
        # This is a Markdown Note
        <br>
        Here is some content for the note. You can use **Markdown** syntax to format your note.
      </p>
    </div>
    <div class="flashcard-actions">
      <button class="action-btn delete">Delete</button>
      <button class="action-btn save">Save</button>
    </div>
  </div>
</div>
  `;
});
