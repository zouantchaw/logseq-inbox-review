import React, { useRef, useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Share2,
  Trash2,
  X,
} from "lucide-react";

type Highlight = {
  id: string;
  content: string;
  source: string;
  date: string;
};

export default function HighlightsInbox({ onClose }: { onClose: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [aiStatus, setAiStatus] = useState<"idle" | "processing" | "complete">(
    "idle"
  );

  const innerRef = useRef<HTMLDivElement>(null);

  // Mock data - replace with actual data fetching logic
  const highlights: Highlight[] = [
    {
      id: "1",
      content: "The best way to predict the future is to invent it.",
      source: "Alan Kay",
      date: "2023-05-15",
    },
    {
      id: "2",
      content: "Innovation distinguishes between a leader and a follower.",
      source: "Steve Jobs",
      date: "2023-05-16",
    },
    {
      id: "3",
      content: "Stay hungry, stay foolish.",
      source: "Whole Earth Catalog",
      date: "2023-05-17",
    },
  ];

  const currentHighlight = highlights[currentIndex];
  console.log(currentHighlight);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % highlights.length);
    setAiStatus("processing");
    setTimeout(() => setAiStatus("complete"), 1500); // Simulate AI processing
  };

  const handlePrevious = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + highlights.length) % highlights.length
    );
    setAiStatus("processing");
    setTimeout(() => setAiStatus("complete"), 1500); // Simulate AI processing
  };

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscKey);

    return () => {
      window.removeEventListener("keydown", handleEscKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      onClick={(e) => {
        if (!innerRef.current?.contains(e.target as Node)) {
          onClose();
        }
      }}
    >
      <div
        ref={innerRef}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          <X size={24} />
        </button>
        <div className="p-8">
          <h2 className="text-3xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
            Highlights Inbox
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Review and process your captured highlights
          </p>

          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 mb-6">
            <p className="text-xl text-gray-800 dark:text-gray-200 leading-relaxed">
              "{currentHighlight.content}"
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              Source: {currentHighlight.source} | Date: {currentHighlight.date}
            </p>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex space-x-4">
              <button
                onClick={handlePrevious}
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <button
                onClick={handleNext}
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
              <button className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors">
                <Trash2 size={24} />
              </button>
            </div>
          </div>
        </div>

        <div className="px-8 py-4 bg-gray-100 dark:bg-gray-800 flex justify-between items-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {currentIndex + 1} of {highlights.length} highlights
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
