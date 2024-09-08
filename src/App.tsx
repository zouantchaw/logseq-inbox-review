import React, { useRef, useState, useEffect } from "react";
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

        if (inboxPages && inboxPages.length > 0) {
          const firstInboxPage = inboxPages[0][0];
          const pageContent = await logseq.Editor.getPageBlocksTree(
            firstInboxPage.name
          );
          const formattedContent = formatPageContent(pageContent);

          setData({
            title: firstInboxPage.originalName || firstInboxPage.name,
            description: `Content from "${
              firstInboxPage.originalName || firstInboxPage.name
            }"`,
            content: formattedContent,
          });

          setInboxPages(pageContent);
        } else {
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
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
        onClick={(e) => {
          if (!innerRef.current?.contains(e.target as Node)) {
            window.logseq.hideMainUI();
          }
        }}
      >
        <div
          ref={innerRef}
          className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold">{data.title}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {data.description}
            </p>
          </div>
          <div className="flex-grow overflow-auto p-4">
            <pre className="whitespace-pre-wrap text-sm">{data.content}</pre>
          </div>
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-2">
            <button
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
              onClick={() => console.log("AI button clicked")}
            >
              {inferenceLoading ? "Loading..." : "AI"}
            </button>
            <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded transition-colors">
              Save
            </button>
            <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition-colors">
              Delete
            </button>
          </div>
        </div>
      </main>
    );
  }
  return null;
}

function formatPageContent(blocks: BlockEntity[]): string {
  return blocks
    .flatMap((block) => {
      if (block.children && block.children.length > 0) {
        return block.children.map((child) => {
          if (Array.isArray(child)) {
            return `• ${child[1]}`;
          } else if (typeof child === "object" && child.content) {
            return `• ${child.content}`;
          }
          return "";
        });
      }
      return [];
    })
    .filter(Boolean)
    .join("\n");
}

export default App;
