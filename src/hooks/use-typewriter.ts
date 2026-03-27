import { useState, useEffect, useRef } from "react";

interface TypewriterEntry {
  line1: string;
  line2: string;
}

export function useTypewriter(entries: TypewriterEntry[], {
  typeSpeed = 100,
  deleteSpeed = 60,
  holdTime = 3000,
}: { typeSpeed?: number; deleteSpeed?: number; holdTime?: number } = {}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayLine1, setDisplayLine1] = useState("");
  const [displayLine2, setDisplayLine2] = useState("");
  const [phase, setPhase] = useState<"typing1" | "typing2" | "holding" | "deleting2" | "deleting1">("typing1");
  const charIndex = useRef(0);

  useEffect(() => {
    const entry = entries[currentIndex];
    let timeout: ReturnType<typeof setTimeout>;

    switch (phase) {
      case "typing1": {
        if (charIndex.current <= entry.line1.length) {
          setDisplayLine1(entry.line1.slice(0, charIndex.current));
          charIndex.current++;
          timeout = setTimeout(() => {}, typeSpeed);
          timeout = setTimeout(() => setDisplayLine1(prev => {
            const next = entry.line1.slice(0, prev.length + 1);
            if (next.length >= entry.line1.length) {
              charIndex.current = 0;
              setPhase("typing2");
            }
            return next;
          }), typeSpeed);
        }
        break;
      }
      case "typing2": {
        if (charIndex.current <= entry.line2.length) {
          timeout = setTimeout(() => {
            setDisplayLine2(entry.line2.slice(0, charIndex.current + 1));
            charIndex.current++;
            if (charIndex.current >= entry.line2.length) {
              setPhase("holding");
            }
          }, typeSpeed);
        }
        break;
      }
      case "holding": {
        timeout = setTimeout(() => {
          charIndex.current = entry.line2.length;
          setPhase("deleting2");
        }, holdTime);
        break;
      }
      case "deleting2": {
        timeout = setTimeout(() => {
          charIndex.current--;
          setDisplayLine2(entry.line2.slice(0, charIndex.current));
          if (charIndex.current <= 0) {
            charIndex.current = entry.line1.length;
            setPhase("deleting1");
          }
        }, deleteSpeed);
        break;
      }
      case "deleting1": {
        timeout = setTimeout(() => {
          charIndex.current--;
          setDisplayLine1(entry.line1.slice(0, charIndex.current));
          if (charIndex.current <= 0) {
            setCurrentIndex((currentIndex + 1) % entries.length);
            charIndex.current = 0;
            setPhase("typing1");
          }
        }, deleteSpeed);
        break;
      }
    }

    return () => clearTimeout(timeout);
  }, [phase, currentIndex, displayLine1, displayLine2, entries, typeSpeed, deleteSpeed, holdTime]);

  return { displayLine1, displayLine2, isTyping: phase === "typing1" || phase === "typing2" };
}
