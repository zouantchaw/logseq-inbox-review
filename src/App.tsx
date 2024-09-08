import React, { useRef, CSSProperties, useState, useEffect } from "react";
import { useAppVisible, useInference } from "./utils";
import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user";

function App() {
  const innerRef = useRef<HTMLDivElement>(null);
  const visible = useAppVisible();
  const [inboxPages, setInboxPages] = useState<BlockEntity[]>([]);

  const [data, setData] = useState({
    title: "Loading...",
    description: "Fetching Inbox page content",
    content: "",
  });

  useEffect(() => {
    async function fetchInboxPages() {
      try {
        const inboxPages = await logseq.DB.datascriptQuery(`
          [:find (pull ?p [*])
           :where
           [?p :block/name ?name]
           [?p :block/properties ?props]
           [(get ?props :tags) ?tags]
           [(contains? ?tags "Inbox")]]
        `);
        console.log("Inbox pages:", inboxPages);

        if (inboxPages && inboxPages.length > 0) {
          const firstInboxPage = inboxPages[0][0];
          console.log("First Inbox page:", firstInboxPage);

          // Fetch the content of the first Inbox page
          const pageContent = await logseq.Editor.getPageBlocksTree(
            firstInboxPage.name
          );
          console.log("First Inbox page content:", pageContent);

          // Process the content and format it as bullet points
          const formattedContent = pageContent
            .map((block) => {
              // Remove the properties section if it exists
              const contentWithoutProperties =
                block.content.split("\n\n")[1] || block.content;
              return `• ${contentWithoutProperties.trim()}`;
            })
            .join("\n");

          // Update the data state with the new content and title
          setData({
            title: firstInboxPage.originalName || firstInboxPage.name,
            description: `Content from "${
              firstInboxPage.originalName || firstInboxPage.name
            }"`,
            content: formattedContent,
          });

          setInboxPages(pageContent);
        } else {
          console.log("No Inbox pages found");
          setInboxPages([]);
          setData({
            title: "No Inbox Pages",
            description: "No Inbox pages found",
            content: "There are no pages tagged with Inbox.",
          });
        }
      } catch (error) {
        console.error("Error fetching Inbox pages:", error);
        setData({
          title: "Error",
          description: "Failed to fetch Inbox pages",
          content:
            "An error occurred while fetching Inbox pages. Please try again.",
        });
      }
    }

    fetchInboxPages();
  }, []);

  // Log inference data or error
  const {
    data: inferenceData,
    error: inferenceError,
    loading: inferenceLoading,
  } = useInference({
    model: "llama3:latest",
    prompt: `Generate a short title for this content: ${data.content}`,
  });

  useEffect(() => {
    if (inferenceError) {
      console.error("Inference error:", inferenceError);
    } else if (!inferenceLoading) {
      console.log("Inference result:", inferenceData);
    }
  }, [inferenceData, inferenceError, inferenceLoading]);

  if (visible) {
    return (
      <main
        className="backdrop-filter backdrop-blur-md fixed inset-0 flex items-center justify-center"
        onClick={(e) => {
          if (!innerRef.current?.contains(e.target as any)) {
            console.log("click outside");
            window.logseq.hideMainUI();
          }
        }}
      >
        <div
          ref={innerRef}
          className="bg-white text-card-foreground shadow-lg border border-gray-200 dark:border-gray-800 rounded-lg transition-transform hover:scale-105 w-full md:w-3/4 lg:w-1/2 mx-auto"
          data-v0-t="card"
        >
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="tracking-tight text-lg font-bold">{data.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {data.description}
            </p>
          </div>
          <div className="p-6 text-sm leading-relaxed">
            <div
              dir="ltr"
              className="relative overflow-hidden h-64"
              style={
                {
                  position: "relative",
                  "--radix-scroll-area-corner-width": "0px",
                  "--radix-scroll-area-corner-height": "0px",
                } as CSSProperties
              }
            >
              <style>{`[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}`}</style>
              <div
                data-radix-scroll-area-viewport=""
                className="h-full w-full rounded-[inherit]"
                style={{ overflow: "hidden scroll" }}
              >
                <div style={{ minWidth: "100%", display: "table" }}>
                  <pre className="whitespace-pre-wrap">{data.content}</pre>
                </div>
              </div>
            </div>
          </div>
          <div className="items-center p-6 flex justify-end space-x-4">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => console.log("AI button clicked")}
            >
              {inferenceLoading ? "Loading..." : "AI"}
            </button>
            <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
              Save
            </button>
            <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
              Delete
            </button>
          </div>
        </div>
      </main>
    );
  }
  return null;
}

export default App;
