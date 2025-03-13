// hooks/useVoiceAssistant.ts
import { useEffect, useRef, useState } from 'react';

export const useVoiceAssistant = ({
  sessionId,
  onMessage,
}: {
  sessionId?: string;
  onMessage?: (role: 'user' | 'assistant', content: string) => void;
}) => {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [listening, setListening] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState(sessionId || '');
  const stopRequested = useRef(false);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = 'en-US';
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
  }, []);

  const speak = (text: string) => {
    return new Promise<void>((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.onend = () => resolve();
      speechSynthesis.speak(utterance);
    });
  };

  const startConversation = () => {
    stopRequested.current = false;
    setListening(true);
    listenAndRespond();
  };

  const stopConversation = () => {
    stopRequested.current = true;
    recognitionRef.current?.abort();
    setListening(false);
  };

  const listenAndRespond = () => {
    if (!recognitionRef.current || stopRequested.current) return;

    const recognition = recognitionRef.current;

    recognition.start();

    recognition.onresult = async (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript.trim();
      console.log('You said:', transcript);

      onMessage?.('user', transcript);

      recognition.stop();

      // Send query to backend (search or follow-up)
      try {
        const res = await fetch(
          activeSessionId ? '/api/follow-up' : '/api/search',
          {
            method: activeSessionId ? 'POST' : 'GET',
            headers: { 'Content-Type': 'application/json' },
            ...(activeSessionId
              ? {
                  body: JSON.stringify({
                    sessionId: activeSessionId,
                    query: transcript,
                  }),
                }
              : undefined),
          }
        );

        const data = await res.json();
        console.log('AI Response:', data);

        const responseText = data.summary;
        onMessage?.('assistant', responseText);

        if (!activeSessionId && data.sessionId) {
          setActiveSessionId(data.sessionId);
        }

        await speak(responseText);

        if (!stopRequested.current) {
          listenAndRespond(); // Loop!
        }
      } catch (err) {
        console.error(err);
        stopConversation();
      }
    };

    recognition.onerror = (event) => {
      console.error('Recognition error:', event.error);
      if (!stopRequested.current) {
        listenAndRespond(); // Retry listening
      }
    };

    recognition.onend = () => {
      if (!stopRequested.current) {
        listenAndRespond(); // Start listening again
      }
    };
  };

  return {
    listening,
    startConversation,
    stopConversation,
  };
};
