import { LSPluginUserEvents } from "@logseq/libs/dist/LSPlugin.user";
import React, { useState, FC, useEffect } from "react";
let _visible = logseq.isMainUIVisible;

type InferenceDataable = (allBlockContents: string) => Promise<void>;

type UseInferenceProps = {
  model: string;
  prompt: string;
};


function subscribeLogseqEvent<T extends LSPluginUserEvents>(
  eventName: T,
  handler: (...args: any) => void
) {
  logseq.on(eventName, handler);
  return () => {
    logseq.off(eventName, handler);
  };
}

const subscribeToUIVisible = (onChange: () => void) =>
  subscribeLogseqEvent("ui:visible:changed", ({ visible }) => {
    _visible = visible;
    onChange();
  });

export const useAppVisible = () => {
  return React.useSyncExternalStore(subscribeToUIVisible, () => _visible);
};

export function useInference({ model, prompt }: UseInferenceProps) {
  const [data, setData] = useState<string[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const postData = {
          model,
          prompt,
          stream: false,
        };

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

        const decoder = new TextDecoder("utf-8");
        let result = "";
        const reader = response.body ? response.body.getReader() : null;

        while (true) {
          let done;
          let value;
          if (reader) {
            ({ done, value } = await reader.read());
          }
          if (done) break;
          result += decoder.decode(value);
        }

        const parsedData = result
          .split("\n")
          .filter(Boolean)
          .map((text) => JSON.parse(text));

        setData(parsedData);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [model, prompt]);

  return { data, error, loading };
};
