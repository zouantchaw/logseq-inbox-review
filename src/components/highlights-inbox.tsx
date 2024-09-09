import React from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Share2,
  Trash2,
  X,
} from "lucide-react";

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
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
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

          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 mb-6 max-h-96 overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              {currentPage.originalName}
            </h3>
            <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
              {currentPage.content}
            </p>
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
              <button className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors">
                <Bookmark size={24} />
              </button>
              <button className="p-2 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors">
                <Share2 size={24} />
              </button>
              <button
                onClick={onDelete}
                className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                <Trash2 size={24} />
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
                aiStatus === "idle"
                  ? "bg-gray-400"
                  : aiStatus === "processing"
                  ? "bg-yellow-400"
                  : "bg-green-400"
              }`}
            ></div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              AI Status: {aiStatus.charAt(0).toUpperCase() + aiStatus.slice(1)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
