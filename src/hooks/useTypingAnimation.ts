/**
 * Hook for typing animation effect on AI messages
 */

import { useState, useEffect } from 'react';

interface UseTypingAnimationProps {
  content: string;
  enabled?: boolean;
  speed?: number; // characters per update
  delay?: number; // ms between updates
}

export function useTypingAnimation({ 
  content, 
  enabled = true, 
  speed = 2, 
  delay = 50 
}: UseTypingAnimationProps) {
  const [displayedContent, setDisplayedContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setDisplayedContent(content);
      setIsComplete(true);
      return;
    }

    setDisplayedContent('');
    setIsTyping(true);
    setIsComplete(false);

    let currentIndex = 0;
    const timer = setInterval(() => {
      if (currentIndex < content.length) {
        const nextIndex = Math.min(currentIndex + speed, content.length);
        setDisplayedContent(content.slice(0, nextIndex));
        currentIndex = nextIndex;
      } else {
        setIsTyping(false);
        setIsComplete(true);
        clearInterval(timer);
      }
    }, delay);

    return () => clearInterval(timer);
  }, [content, enabled, speed, delay]);

  return {
    displayedContent,
    isTyping,
    isComplete
  };
}