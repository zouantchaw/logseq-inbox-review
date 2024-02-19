import React, { useRef, CSSProperties } from "react";
import { useAppVisible } from "./utils";

function App() {
  const innerRef = useRef<HTMLDivElement>(null);
  const visible = useAppVisible();
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
            <h3 className="whitespace-nowrap tracking-tight text-lg font-bold">Review your inbox</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Using llama and mistral locally</p>
          </div>
          <div className="p-6 text-sm leading-relaxed">
            <div
              dir="ltr"
              className="relative overflow-hidden h-64"
              style={{ position: 'relative', '--radix-scroll-area-corner-width': '0px', '--radix-scroll-area-corner-height': '0px' } as CSSProperties}
            >
              <style>{`[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}`}</style>
              <div
                data-radix-scroll-area-viewport=""
                className="h-full w-full rounded-[inherit]"
                style={{ overflow: 'hidden scroll' }}
              >
                <div style={{ minWidth: '100%', display: 'table' }}>
                  <p>
                    "Realize deeply that the present moment is all you have. Make the NOW the primary focus of your life."
                  </p>
                  <p className="mt-4">
                    "The Power of Now is a guide to spiritual enlightenment from a man who is emerging as one of this
                    generation's clearest, most inspiring teachers. Eckhart Tolle is not aligned with any particular
                    religion but does what all the great masters have done: shows that the way, the truth, and the light
                    already exist within each human being. There is no need to look elsewhere."
                  </p>
                  <p className="mt-4">
                    "To make the journey into the Now we will need to leave our analytical mind and its false created self,
                    the ego, behind. From the very first page of Eckhart Tolle's extraordinary book, we move rapidly into a
                    significantly higher altitude where we breathe a lighter air. We become connected to the indestructible
                    essence of our Being, “The eternal, ever present One Life beyond the myriad forms of life that are
                    subject to birth and death."
                  </p>
                  <p className="mt-4">
                    "Although the journey is challenging, Eckhart Tolle uses simple language and an easy question and answer
                    format to guide us. A word of mouth phenomenon since its first publication, The Power of Now is one of
                    those rare books with the power to create an experience in readers, one that can radically change their
                    lives for the better."
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="items-center p-6 flex justify-end space-x-4">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">ai</button>
            <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Save</button>
            <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Delete</button>
          </div>
        </div>
      </main>
    );
  }
  return null;
}

export default App;
