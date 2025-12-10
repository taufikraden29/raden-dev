
// Updated to support streaming
export const formatContentWithAI = async (text, instruction = null, onChunk = null) => {
  try {
    const response = await fetch('/api/ai/format', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, instruction }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({})); // Try parse json, fallback empty
      const errorMessage = data.details ? `${data.error}: ${data.details}` : (data.error || `AI Error ${response.status}: ${response.statusText}`);
      throw new Error(errorMessage);
    }

    // If stream callback provided
    if (onChunk) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        onChunk(chunk); // Callback with delta
      }
      return fullText;
    } else {
      // Fallback for non-streaming usage (reads whole body)
      const text = await response.text();
      return text;
    }

  } catch (error) {
    console.error('AI Service Error:', error);
    throw error;
  }
};

// Generate a complete tutorial structure from a prompt
export const generateTutorialWithAI = async (prompt) => {
  try {
    const response = await fetch('/api/ai/generate-tutorial', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      const errorMessage = data.details ? `${data.error}: ${data.details}` : (data.error || `AI Error ${response.status}: ${response.statusText}`);
      throw new Error(errorMessage);
    }

    const tutorialData = await response.json();
    return tutorialData;

  } catch (error) {
    console.error('AI Tutorial Generation Error:', error);
    throw error;
  }
};

// Generate a complete blog post from a prompt
export const generatePostWithAI = async (prompt, endpoint = 'coding') => {
  try {
    const response = await fetch('/api/ai/generate-post', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, endpoint }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));

      // Handle specific error codes with user-friendly messages
      if (response.status === 429) {
        throw new Error('API quota habis. Silakan recharge saldo Z.AI atau coba lagi nanti.');
      }

      const errorMessage = data.details ? `${data.error}: ${data.details}` : (data.error || `AI Error ${response.status}: ${response.statusText}`);
      throw new Error(errorMessage);
    }

    const postData = await response.json();
    return postData;

  } catch (error) {
    console.error('AI Post Generation Error:', error);
    throw error;
  }
};

