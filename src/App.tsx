import React, { useRef, CSSProperties, useState } from "react";
import { useAppVisible, useInference } from "./utils";

function App() {
  const innerRef = useRef<HTMLDivElement>(null);
  const visible = useAppVisible();
  const [data, setdata] = useState({
    title: "Machine Learning Needs Better Tools",
    description: "Using llama and mistral locally",
    content:
      "In early 2021, there was a shift. Advadnoun released a Colab notebook called [The Big Sleep](https://twitter.com/advadnoun/status/1351038053033406468?lang=en). RiversHaveWings followed up with the [VQGAN+CLIP notebook](https://colab.research.google.com/github/justinjohn0306/VQGAN-CLIP/blob/main/VQGAN%2BCLIP(Updated).ipynb). These notebooks turned text descriptions into images by guiding a GAN with CLIP. ([View Highlight](https://read.readwise.io/read/01gstvetndwz03csdw7dhj6zpv))\n\nThese people were not affiliated with a lab. They were often self-taught, just tinkering in their spare time. Or they were software engineers, cobbling together bits of machine learning code.\n\nPart of what made this all possible was pre-trained foundation models. Instead of having to train a model from scratch at great expense, individuals could pick models off-the-shelf and combine them in interesting ways. Kind of like how you can import a few packages from npm and plug them together to make something new. ([View Highlight](https://read.readwise.io/read/01gstvg3sz6hxf6hbdvhgfxhd5))",
  });

  const {
    data: inferenceData,
    error,
    loading,
  } = useInference({
    model: "mistral",
    prompt: `Summarize this content into a title: ${data.content}`
  });
  console.log(inferenceData);

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
              ai
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
