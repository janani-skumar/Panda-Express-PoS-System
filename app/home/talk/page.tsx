"use client";

import React, { useEffect, useRef, useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { useSpeech } from "react-text-to-speech";

export default function VoiceChatbot() {
  const [conversation, setConversation] = useState<string[]>([]);
  const [botResponse, setBotResponse] = useState<string>("");

  const lastTranscriptRef = useRef<string>("");

  const { transcript, listening, resetTranscript } = useSpeechRecognition();

  const { start: speak, stop: stopSpeaking } = useSpeech({
    text: botResponse,
    pitch: 1,
    rate: 1,
    volume: 1,
  });

  // Start continuous listening on mount
  useEffect(() => {
    SpeechRecognition.startListening({ continuous: true });
  }, []);

  // Interrupt bot speech the moment user talks
  useEffect(() => {
    if (transcript.trim().length > lastTranscriptRef.current.length) {
      stopSpeaking();
    }
    lastTranscriptRef.current = transcript;
  }, [transcript, stopSpeaking]);

  // Detect when user has stopped talking (silence)
  useEffect(() => {
    const handle = setInterval(() => {
      if (!listening) return;
      if (transcript.trim().length === 0) return;

      // User stopped adding new words → treat as end-of-speech
      const finished = transcript.trim();

      if (finished === lastTranscriptRef.current) {
        // Finalize
        processUserInput(finished);
        resetTranscript();
        lastTranscriptRef.current = "";
      }
    }, 500);

    return () => clearInterval(handle);
  }, [transcript, listening, resetTranscript]);

  // Bot logic (replace with your API call)
  const processUserInput = async (userText: string) => {
    setConversation((c) => [...c, "User: " + userText]);

    // Fake bot delay and response
    const reply = "I heard you say: " + userText;
    setBotResponse(reply);
    setConversation((c) => [...c, "Bot: " + reply]);

    // Speak after a short delay to avoid STT bleed
    setTimeout(() => speak(), 200);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Voice Chatbot Demo</h1>

      <p>Listening: {listening ? "Yes" : "No"}</p>

      <button
        onClick={() => SpeechRecognition.startListening({ continuous: true })}
      >
        Restart Listening
      </button>
      <button onClick={stopSpeaking} style={{ marginLeft: "1rem" }}>
        Stop Bot Speech
      </button>

      <div
        style={{
          marginTop: "2rem",
          padding: "1rem",
          border: "1px solid #ccc",
          minHeight: "150px",
        }}
      >
        <h3>Conversation</h3>
        {conversation.map((line, index) => (
          <div key={index}>{line}</div>
        ))}
      </div>
    </div>
  );
}
