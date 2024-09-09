import React, { useState, useEffect, useCallback } from "react";
import { useAppVisible } from "./utils";
import HighlightsInbox from "./components/highlights-inbox";
import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user";

type InboxPage = {
  id: string;
  name: string;
  originalName: string;
  content: string;
};

const BATCH_SIZE = 10;

function App() {
  const visible = useAppVisible();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [aiStatus, setAiStatus] = useState<"idle" | "processing" | "complete">(
    "idle"
  );
  const [inboxPages, setInboxPages] = useState<InboxPage[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPageBatch = useCallback(async (startIndex: number) => {
    try {
      const pages = await logseq.DB.datascriptQuery(`
        [:find (pull ?p [*])
         :where
         [?p :block/name ?name]
         [?p :block/properties ?props]
         [(get ?props :tags) ?tags]
         [(contains? ?tags "Inbox")]]
      `);

      if (pages && pages.length > 0) {
        const endIndex = Math.min(startIndex + BATCH_SIZE, pages.length);
        const batch = pages.slice(startIndex, endIndex);

        const formattedPages = await Promise.all(
          batch.map(async ([page]: [any]) => {
            const pageContent = await logseq.Editor.getPageBlocksTree(
              page.name
            );
            return {
              id: page.id,
              name: page.name,
              originalName: page.originalName || page.name,
              content: formatPageContent(pageContent),
            };
          })
        );

        setInboxPages((prevPages) => [...prevPages, ...formattedPages]);
        setTotalPages(pages.length);
      }
    } catch (error) {
      console.error("Error fetching Inbox pages:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      fetchPageBatch(0);
    }
  }, [visible, fetchPageBatch]);

  useEffect(() => {
    if (
      currentIndex >= inboxPages.length - 5 &&
      inboxPages.length < totalPages
    ) {
      fetchPageBatch(inboxPages.length);
    }
  }, [currentIndex, inboxPages, totalPages, fetchPageBatch]);

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

  const handleNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % inboxPages.length);
    setAiStatus("processing");
    setTimeout(() => setAiStatus("complete"), 1500);
  }, [inboxPages.length]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + inboxPages.length) % inboxPages.length
    );
    setAiStatus("processing");
    setTimeout(() => setAiStatus("complete"), 1500);
  }, [inboxPages.length]);

  const handleDelete = useCallback(async () => {
    const currentPage = inboxPages[currentIndex];
    if (currentPage) {
      try {
        await logseq.Editor.deletePage(currentPage.name);
        setInboxPages((prevPages) =>
          prevPages.filter((page) => page.id !== currentPage.id)
        );
        setTotalPages((prev) => prev - 1);
        if (currentIndex >= inboxPages.length - 1) {
          setCurrentIndex(Math.max(0, inboxPages.length - 2));
        }
      } catch (error) {
        console.error("Error deleting page:", error);
      }
    }
  }, [currentIndex, inboxPages]);

  const handleClose = useCallback(() => {
    window.logseq.hideMainUI();
  }, []);

  if (visible) {
    return (
      <HighlightsInbox
        isLoading={isLoading}
        currentPage={inboxPages[currentIndex]}
        currentIndex={currentIndex}
        totalPages={totalPages}
        aiStatus={aiStatus}
        onClose={handleClose}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onDelete={handleDelete}
      />
    );
  }
  return null;
}

export default App;
