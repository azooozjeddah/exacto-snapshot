import { useState, useEffect, useRef } from "react";

interface TypewriterEntry {
  line1: string;
  line2?: string;
  colorSplitAt?: number;
}

type Phase = "typing1" | "typing2" | "holding" | "deleting2" | "deleting1";

export function useTypewriter(entries: TypewriterEntry[], {
  typeSpeed = 100,
  deleteSpeed = 60,
  holdTime = 3000,
}: { typeSpeed?: number; deleteSpeed?: number; holdTime?: number } = {}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayLine1, setDisplayLine1] = useState("");
  const [displayLine2, setDisplayLine2] = useState("");
  const [phase, setPhase] = useState<Phase>("typing1");
  const charRef = useRef(0);

  useEffect(() => {
    const entry = entries[currentIndex];
    const hasLine2 = !!entry.line2;

    const timeout = setTimeout(() => {
      switch (phase) {
        case "typing1": {
          const next = charRef.current + 1;
          setDisplayLine1(entry.line1.slice(0, next));
          charRef.current = next;
          if (next >= entry.line1.length) {
            charRef.current = 0;
            if (hasLine2) {
              setPhase("typing2");
            } else {
              setPhase("holding");
            }
          }
          break;
        }
        case "typing2": {
          const line2 = entry.line2!;
          const next = charRef.current + 1;
          setDisplayLine2(line2.slice(0, next));
          charRef.current = next;
          if (next >= line2.length) {
            setPhase("holding");
          }
          break;
        }
        case "holding": {
          if (hasLine2) {
            charRef.current = entry.line2!.length;
            setPhase("deleting2");
          } else {
            charRef.current = entry.line1.length;
            setPhase("deleting1");
          }
          break;
        }
        case "deleting2": {
          charRef.current--;
          setDisplayLine2(entry.line2!.slice(0, charRef.current));
          if (charRef.current <= 0) {
            charRef.current = entry.line1.length;
            setPhase("deleting1");
          }
          break;
        }
        case "deleting1": {
          charRef.current--;
          setDisplayLine1(entry.line1.slice(0, charRef.current));
          if (charRef.current <= 0) {
            setDisplayLine2("");
            setCurrentIndex((currentIndex + 1) % entries.length);
            charRef.current = 0;
            setPhase("typing1");
          }
          break;
        }
      }
    }, phase === "holding" ? holdTime : phase.startsWith("deleting") ? deleteSpeed : typeSpeed);

    return () => clearTimeout(timeout);
  }, [phase, currentIndex, displayLine1, displayLine2, entries, typeSpeed, deleteSpeed, holdTime]);

  const hasLine2 = !!entries[currentIndex].line2;
  const colorSplitAt = entries[currentIndex].colorSplitAt;

  return { displayLine1, displayLine2, phase, hasLine2, colorSplitAt };
}
