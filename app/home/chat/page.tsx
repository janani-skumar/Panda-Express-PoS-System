"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useCart } from "@/app/providers/cart-provider";
import { MealOrder, IndividualItem, OrderInfo, MealType, Recipe } from "@/lib/types";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { useAccessibilityStyles } from "@/hooks/use-accessibility-styles";
import { Send, Volume2, VolumeX } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { stripMarkdown, speakText, stopSpeaking } from "@/lib/chat-tts";
import { handleFunctionCall } from "@/lib/chat-cart-handlers";

export default function TestChat() {
  const { meals, individualItems, addMeal, addIndividualItem, removeMeal, removeIndividualItem, clearCart } = useCart();
  const { textClasses } = useAccessibilityStyles();
  const [mealtypes, setMealtypes] = useState<MealType[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [isTTSEnabled, setIsTTSEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastBotMessageRef = useRef<string>("");
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Text-to-speech function using browser's native API
  const handleSpeakText = useCallback((text: string) => {
    speakText(text, isTTSEnabled, speechSynthesisRef);
  }, [isTTSEnabled]);

  const handleStopSpeaking = useCallback(() => {
    stopSpeaking(speechSynthesisRef);
  }, []);

  // Helper function to limit messages to the 15 most recent
  const addMessage = (message: { role: "user" | "assistant"; text: string }) => {
    setMessages(prev => {
      const updated = [...prev, message];
      // Keep only the last 15 messages
      return updated.slice(-15);
    });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Speak bot messages when they arrive
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === "assistant" && lastMessage.text !== lastBotMessageRef.current) {
      lastBotMessageRef.current = lastMessage.text;
      if (isTTSEnabled && lastMessage.text) {
        // Small delay to ensure message is displayed before speaking
        setTimeout(() => {
          handleSpeakText(lastMessage.text);
        }, 300);
      }
    }
  }, [messages, isTTSEnabled, handleSpeakText]);


  const handleFunctionCallWrapper = (functionName: string, jsonString: string) => {
    handleFunctionCall(functionName, jsonString, {
      addMessage,
      addMeal,
      addIndividualItem,
      removeMeal,
      removeIndividualItem,
      clearCart,
      meals,
      individualItems,
      mealtypes,
      recipes
    });
  };

  // fetch recipes and meal types
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recipesRes, mealtypesRes] = await Promise.all([
          fetch("/api/recipes"),
          fetch("/api/mealtypes"),
        ]);

        if (recipesRes.ok) {
          const recipesData = await recipesRes.json();
          setRecipes(recipesData);
          console.log("Loaded recipes:", recipesData.length);
        }
        if (mealtypesRes.ok) {
          const mealtypesData = await mealtypesRes.json();
          setMealtypes(mealtypesData);
          console.log("Loaded meal types:", mealtypesData.length);
        }
      } catch (err) {
        console.error("Failed to fetch recipes or meal types", err);
      }
    };
    fetchData();
  }, []);

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend) return;

    const userMessage = textToSend;
    const currentMessages = messages; // Capture current messages before state update
    addMessage({ role: "user", text: userMessage });
    setInput("");

    try {
      // Send conversation history along with the new message
      // Limit conversation history to last 15 messages
      const limitedHistory = currentMessages.slice(-15);
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userMessage,
          conversationHistory: limitedHistory,
          cart: {
            meals: meals,
            individualItems: individualItems
          }
        })
      });

      if (!res.ok) {
        throw new Error(`API returned ${res.status}`);
      }

      const data = await res.json();
      console.log("API Response:", data);

      // If bot sent a function call, handle it
      if (data.function_call) {
        console.log("Function call detected:", data.function_call);
        handleFunctionCallWrapper(data.function_call.name, data.function_call.arguments);
      }

      // Display bot message
      const botMessage = data.message || data.text;
      if (botMessage) {
        addMessage({ role: "assistant", text: botMessage });
      } else if (!data.function_call) {
        console.warn("No message or function_call in response", data);
      }
    } catch (err) {
      console.error("Chat error:", err);
      addMessage({ 
        role: "assistant", 
        text: "Error contacting bot" 
      });
    }
  };


  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="p-6 border-b border-border shrink-0">
        <h1 className={`text-3xl font-bold text-tamu-maroon ${textClasses}`}>
          Chat with Kiosk Bot
        </h1>
        <p className={`text-muted-foreground mt-1 ${textClasses}`}>
          Ask me about menu items, place orders, or get recommendations
        </p>
      </div>

      {/* Messages Container */}
      <div 
        className="flex-1 overflow-y-auto p-6 space-y-4 bg-neutral-50 min-h-0"
      >
        {messages.length === 0 && (
          <div className={`text-center text-muted-foreground mt-12 ${textClasses}`}>
            <div className="max-w-md mx-auto space-y-2">
              <p className="text-lg font-medium">Start a conversation</p>
              <p className="text-sm">
                Try asking: &quot;I&apos;d like to order orange chicken&quot; or &quot;What entrees do you have?&quot;
              </p>
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div 
            key={i} 
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-xl px-4 py-3 ${
                m.role === "user"
                  ? "bg-tamu-maroon text-white rounded-br-sm"
                  : "bg-white text-foreground border border-border rounded-bl-sm shadow-sm"
              } ${textClasses}`}
            >
              {m.role === "assistant" ? (
                <div className="markdown-content">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="whitespace-pre-wrap wrap-break-word my-2 first:mt-0 last:mb-0">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc list-inside my-2 space-y-1 ml-2">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside my-2 space-y-1 ml-2">{children}</ol>,
                      li: ({ children }) => <li className="ml-1">{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                      em: ({ children }) => <em className="italic">{children}</em>,
                      code: ({ children, className }) => {
                        const isInline = !className;
                        return isInline ? (
                          <code className="bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>
                        ) : (
                          <code className={`block bg-neutral-100 dark:bg-neutral-800 p-3 rounded text-sm font-mono overflow-x-auto my-2 ${className || ""}`}>{children}</code>
                        );
                      },
                      pre: ({ children }) => <pre className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded text-sm font-mono overflow-x-auto my-2">{children}</pre>,
                      h1: ({ children }) => <h1 className="text-xl font-bold my-3 first:mt-0">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-lg font-bold my-2.5 first:mt-0">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-base font-semibold my-2 first:mt-0">{children}</h3>,
                      h4: ({ children }) => <h4 className="text-sm font-semibold my-1.5 first:mt-0">{children}</h4>,
                      blockquote: ({ children }) => <blockquote className="border-l-4 border-neutral-300 dark:border-neutral-600 pl-4 italic my-2 text-neutral-600 dark:text-neutral-400">{children}</blockquote>,
                      a: ({ children, href }) => <a href={href} className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300" target="_blank" rel="noopener noreferrer">{children}</a>,
                      hr: () => <hr className="my-3 border-neutral-200 dark:border-neutral-700" />,
                    }}
                  >
                    {m.text}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap wrap-break-word">{m.text}</p>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Container - Fixed at Bottom */}
      <div className="sticky bottom-0 bg-white border-t border-border p-4 shadow-lg shrink-0">
        <div className="flex gap-3 max-w-4xl mx-auto">
          <Input
            className={`flex-1 ${textClasses}`}
            placeholder="Type your message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
          />
          
          {/* Text-to-Speech Toggle Button */}
          <Button
            variant={isTTSEnabled ? "default" : "outline"}
            className={isTTSEnabled ? "bg-tamu-maroon hover:bg-tamu-maroon-dark text-white" : ""}
            onClick={() => {
              setIsTTSEnabled(!isTTSEnabled);
              if (!isTTSEnabled && window.speechSynthesis.speaking) {
                handleStopSpeaking();
              }
            }}
            title={isTTSEnabled ? "Disable text-to-speech" : "Enable text-to-speech"}
          >
            {isTTSEnabled ? (
              <>
                <Volume2 className="h-4 w-4 mr-2" />
                <span className="sr-only">Disable text-to-speech</span>
              </>
            ) : (
              <>
                <VolumeX className="h-4 w-4 mr-2" />
                <span className="sr-only">Enable text-to-speech</span>
              </>
            )}
          </Button>
          
          <Button 
            className="bg-tamu-maroon hover:bg-tamu-maroon-dark text-white px-6"
            onClick={() => handleSendMessage()}
            disabled={!input.trim()}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </div>
    </div>
  );
}