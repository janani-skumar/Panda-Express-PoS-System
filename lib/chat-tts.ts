/**
 * Text-to-Speech utilities for chat functionality
 */

/**
 * Strips markdown formatting from text for text-to-speech
 */
export function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/`(.*?)`/g, '$1') // Remove inline code
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
    .replace(/^[-*+]\s+/gm, '') // Remove list markers
    .replace(/^\d+\.\s+/gm, '') // Remove numbered list markers
    .trim();
}

/**
 * Text-to-speech function using browser's native API
 */
export function speakText(
  text: string,
  isTTSEnabled: boolean,
  speechSynthesisRef: { current: SpeechSynthesisUtterance | null }
): void {
  if (!isTTSEnabled || !text.trim()) return;
  
  // Stop any current speech
  if (speechSynthesisRef.current) {
    window.speechSynthesis.cancel();
  }

  // Strip markdown for TTS
  const plainText = stripMarkdown(text);

  const utterance = new SpeechSynthesisUtterance(plainText);
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.volume = 1;
  
  speechSynthesisRef.current = utterance;
  window.speechSynthesis.speak(utterance);
}

/**
 * Stops any currently playing speech
 */
export function stopSpeaking(
  speechSynthesisRef: { current: SpeechSynthesisUtterance | null }
): void {
  window.speechSynthesis.cancel();
  speechSynthesisRef.current = null;
}
