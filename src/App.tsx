import React, { useRef, CSSProperties, useState } from "react";
import { useAppVisible, useInference } from "./utils";

function App() {
  const innerRef = useRef<HTMLDivElement>(null);
  const visible = useAppVisible();
  const [data, setData] = useState({
    title: "Machine Learning Needs Better Tools",
    description: "Using llama and mistral locally",
    content: "Who was the first president of the United States?", 
  });

  const {
    data: inferenceData,
    error,
    loading,
  } = useInference({
    model: "llama3:latest", 
    prompt: `Generate a short title for this content: ${data.content}`,
  });

  // Log inference data or error
  if (error) {
    console.error("Inference error:", error);
  } else if (!loading) {
    console.log("Inference result:", inferenceData);
  }

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
            <h3 className="whitespace-nowrap tracking-tight text-lg font-bold">
              {data.title}
            </h3>
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
                  <p>{data.content}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="items-center p-6 flex justify-end space-x-4">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={(e) => {
                console.log("ai");
              }}
            >
              {loading ? "Loading..." : "Ai"}
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
