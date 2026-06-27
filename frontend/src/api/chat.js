const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9001';

export const chatApi = {
  async getHistory(threadId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/chat/${threadId}/history`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.messages || [];
    } catch (error) {
      console.error('Error loading history:', error);
      throw error;
    }
  },

  async sendMessage(message, threadId = null) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message,
          thread_id: threadId
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  async sendMessageStream(message, threadId = null, onChunk, onComplete, onError, onStart, signal = null) {
    let finalThreadId = threadId;
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          thread_id: threadId
        }),
        signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.trim()) {
            try {
              const chunk = JSON.parse(line);
              
              if (chunk.thread_id) {
                finalThreadId = chunk.thread_id;
              }

              if (chunk.start && onStart) {
                onStart();
              }

              if (chunk.error) {
                onError(new Error(chunk.error));
                return;
              }

              if (chunk.done) {
                onComplete(finalThreadId);
                return;
              }

              if (chunk.content) {
                onChunk(chunk.content);
              }
            } catch (e) {
              console.error('Error parsing chunk:', e, line);
            }
          }
        }
      }
    } catch (error) {
      // A user-initiated abort is a graceful stop, not an error
      if (error.name === 'AbortError') {
        onComplete(finalThreadId);
        return;
      }
      console.error('Error in stream:', error);
      onError(error);
    }
  }
};
