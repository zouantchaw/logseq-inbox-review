import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Trash2,
  Blocks,
  X,
  Save,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { runInference } from "../services/inferenceService";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Tweet } from "react-twitter-widgets";

type InboxPage = {
  id: string;
  name: string;
  originalName: string;
  content: string;
};

interface HighlightsInboxProps {
  isLoading: boolean;
  currentPage: InboxPage | undefined;
  currentIndex: number;
  totalPages: number;
  aiStatus: "idle" | "processing" | "complete";
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onDelete: () => void;
}

const YouTubeEmbed = ({ url }: { url: string }) => {
  const videoId = url.split("v=")[1] || url.split("/").pop();
  return (
    <div className="aspect-w-16 aspect-h-9">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      ></iframe>
    </div>
  );
};

const TweetEmbed = ({ url }: { url: string }) => {
  const tweetId = url.split("/").pop() || "";
  return <Tweet tweetId={tweetId} options={{ width: "100%" }} />;
};

const CustomLink = (props: any) => {
  const href = props.href;
  if (href.includes("youtube.com") || href.includes("youtu.be")) {
    return <YouTubeEmbed url={href} />;
  } else if (href.includes("twitter.com") && href.includes("/status/")) {
    return <TweetEmbed url={href} />;
  }
  return (
    <a
      {...props}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-500 underline"
    />
  );
};

export default function HighlightsInbox({
  isLoading,
  currentPage,
  currentIndex,
  totalPages,
  aiStatus,
  onClose,
  onNext,
  onPrevious,
  onDelete,
}: HighlightsInboxProps) {
  const [localAiStatus, setLocalAiStatus] = useState(aiStatus);
  const [generatedTitle, setGeneratedTitle] = useState("");
  const [generatedSummary, setGeneratedSummary] = useState("");
  const [showGeneratedContent, setShowGeneratedContent] = useState(false);
  const [isContentExpanded, setIsContentExpanded] = useState(false);

  const toggleContentExpansion = () => {
    setIsContentExpanded(!isContentExpanded);
  };

  const generateContent = useCallback(async () => {
    if (!currentPage) return;

    setLocalAiStatus("processing");

    try {
      const titlePrompt = `Generate a concise title for the following content. Only provide the title, nothing else:\n\n${currentPage.content}`;
      const summaryPrompt = `Summarize the following content in a few sentences. Only provide the summary, nothing else:\n\n${currentPage.content}`;

      const [title, summary] = await Promise.all([
        runInference("llama3:latest", titlePrompt),
        runInference("llama3:latest", summaryPrompt),
      ]);

      const cleanTitle = title
        .replace(/^.*?:\s*/, "")
        .replace(/"/g, "")
        .trim();
      const cleanSummary = summary
        .replace(/^.*?:\s*/, "")
        .replace(/"/g, "")
        .trim();

      setGeneratedTitle(cleanTitle);
      setGeneratedSummary(cleanSummary);
      setLocalAiStatus("complete");
      setShowGeneratedContent(true);

      console.log("Generated Title:", cleanTitle);
      console.log("Generated Summary:", cleanSummary);
    } catch (error) {
      console.error("Error generating content:", error);
      setLocalAiStatus("idle");
    }
  }, [currentPage]);

  const handleSave = useCallback(async () => {
    if (!currentPage || !generatedTitle || !generatedSummary) return;

    setLocalAiStatus("processing");

    try {
      // Create a new page with the generated title and summary
      const newPage = await logseq.Editor.createPage(
        generatedTitle,
        {
          "ai-generated-summary": generatedSummary + "#card",
        },
        {
          format: "markdown",
          redirect: false,
        }
      );

      if (!newPage) {
        throw new Error("Failed to create new page");
      }

      console.log("New page created:", newPage);

      // Attempt to delete the old page
      try {
        await logseq.Editor.deletePage(currentPage.name);
        console.log("Old page deleted:", currentPage.name);
      } catch (deleteError) {
        console.error("Error deleting old page:", deleteError);
        // If we can't delete the old page, we'll just leave it
      }

      // Move to the next page
      onNext();

      // Reset the generated content
      setGeneratedTitle("");
      setGeneratedSummary("");
      setShowGeneratedContent(false);
      setLocalAiStatus("idle");

      // Show a success message
      logseq.UI.showMsg("Page processed and saved successfully", "success");
    } catch (error) {
      console.error("Error saving new page:", error);
      setLocalAiStatus("idle");
      logseq.UI.showMsg("Failed to save new page. Please try again.", "error");
    }
  }, [currentPage, generatedTitle, generatedSummary, onNext]);

  useEffect(() => {
    setShowGeneratedContent(false);
    setGeneratedTitle("");
    setGeneratedSummary("");
    setLocalAiStatus("idle");
  }, [currentPage]);

  const handleBlocksClick = () => {
    if (!currentPage || localAiStatus === "processing") return;
    generateContent();
  };

  const renderContent = (content: string) => (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        a: CustomLink,
        img: (props) => (
          <img {...props} className="max-w-full h-auto rounded-lg shadow-md" />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8">
          <p className="text-lg text-gray-800 dark:text-gray-200">
            Loading inbox pages...
          </p>
        </div>
      </div>
    );
  }

  if (!currentPage) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden">
        <div className="p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
          <h2 className="text-3xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
            Inbox
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Review and process your highlights
          </p>

          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 mb-6 overflow-hidden transition-all duration-300 ease-in-out">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={toggleContentExpansion}
            >
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 transition-colors hover:text-blue-500 dark:hover:text-blue-400">
                {showGeneratedContent
                  ? generatedTitle
                  : currentPage.originalName}
              </h3>
              {isContentExpanded ? (
                <ChevronUp size={24} />
              ) : (
                <ChevronDown size={24} />
              )}
            </div>
            <div
              className={`mt-4 text-lg text-gray-800 dark:text-gray-200 leading-relaxed ${
                isContentExpanded ? "max-h-[60vh]" : "max-h-48"
              } overflow-y-auto transition-all duration-300 ease-in-out`}
            >
              {showGeneratedContent
                ? renderContent(generatedSummary)
                : renderContent(currentPage.content)}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex space-x-4">
              <button
                onClick={onPrevious}
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <button
                onClick={onNext}
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <ArrowRight size={24} />
              </button>
            </div>
            <div className="flex space-x-4">
              {showGeneratedContent ? (
                <button
                  onClick={handleSave}
                  className="px-4 py-2 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors flex items-center"
                >
                  <Save size={20} className="mr-2" />
                  Save
                </button>
              ) : (
                <button
                  onClick={handleBlocksClick}
                  className="px-4 py-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  disabled={localAiStatus === "processing"}
                >
                  <Blocks size={20} className="mr-2" />
                  Generate
                </button>
              )}
              <button
                onClick={onDelete}
                className="px-4 py-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center"
              >
                <Trash2 size={20} className="mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>

        <div className="px-8 py-4 bg-gray-100 dark:bg-gray-800 flex justify-between items-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {currentIndex + 1} of {totalPages} highlights
          </p>
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                localAiStatus === "idle"
                  ? "bg-gray-400"
                  : localAiStatus === "processing"
                  ? "bg-yellow-400"
                  : "bg-green-400"
              }`}
            ></div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              AI Status:{" "}
              {localAiStatus.charAt(0).toUpperCase() + localAiStatus.slice(1)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
