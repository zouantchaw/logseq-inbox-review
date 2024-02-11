// Register the main command
logseq.ready().then(() => {
  logseq.provideModel({
    async showFlashcardUI() {
      const result = await logseq.DB.datascriptQuery(
        `[:find (pull ?p [*])
        :where
        [?p :block/name ?name]
        [(clojure.string/includes? ?name "highlights")]
        [?b :block/page ?p]
        [(not= "" ?b :block/content)]
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
        // Limit the number of paragraphs to 1-10
        const limitedResults = pageContentResult.slice(1, 4);
        limitedResults.forEach((blockArray) => {
          const block = blockArray[0];
          allBlockContents += `<p>${block.content}</p>`;
        });
        // Prepare the data for the POST request to LLaMA
        const postData = {
          model: "llama2",
          prompt: `Generate only one title for this content: ${allBlockContents}`,
        };
        logseq.App.showMsg("Fetching data from LLaMA...");
        try {
          const response = await fetch("http://localhost:11434/api/generate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(postData),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder("utf-8");

          let result = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            result += decoder.decode(value);
          }

          const data = result.split("\n").filter(Boolean).map(JSON.parse);
          const fullResponse = data.map((obj) => obj.response).join("");
          logseq.App.showMsg("Data fetched from LLaMA");
          logseq.App.showMsg(`Data: ${fullResponse}`);
        } catch (error) {
          logseq.App.showMsg(`Error fetching data from LLaMA: ${error}`);
        }

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
                  <button class="action-btn delete" onclick="deletePage('${pageName}')">Delete</button>
                  <button class="action-btn save">Save</button>
                </div>
              </div>
            </div>
        `;
      }
      logseq.showMainUI();
    },
  });

  window.deletePage = async (pageId) => {
    console.log(`Attempting to delete page with ID: ${pageId}`); // Debug log
    try {
      await logseq.DB.deletePage(pageId);
      console.log("Page deleted successfully"); // Success log
      logseq.App.showMsg("Page deleted successfully");
      logseq.hideMainUI(); // Hide the UI after deletion
    } catch (error) {
      console.error("Failed to delete page:", error); // Error log
      logseq.App.showMsg("Failed to delete page");
    }
  };

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
