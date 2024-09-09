interface InferenceResponse {
  response: string;
}

export async function runInference(model: string, prompt: string): Promise<string> {
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

    const result: InferenceResponse = await response.json();
    return result.response;
  } catch (error) {
    console.error("Inference error:", error);
    throw error;
  }
}