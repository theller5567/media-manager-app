"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, LayoutGroup } from "framer-motion";
import { cn } from "@/lib/utils";

export const WordFlip = ({
  words,
  duration = 3000,
  className,
  onAnimationComplete,
}: {
  words: string[];
  duration?: number;
  className?: string;
  onAnimationComplete?: () => void;
}) => {
  const [index, setIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState(false);

  const startAnimation = useCallback(() => {
    if (index === words.length - 1) {
      setIsFinished(true);
      onAnimationComplete?.();
      return;
    }
    setIndex(index + 1);
    setIsAnimating(true);
  }, [index, words, onAnimationComplete]);

  useEffect(() => {
    if (!isAnimating && !isFinished) {
      const timer = setTimeout(() => {
        startAnimation();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isAnimating, isFinished, duration, startAnimation]);

  return (
    <motion.div
      animate={isFinished ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 1 }}
      className="inline-block"
    >
      <AnimatePresence
        onExitComplete={() => {
          setIsAnimating(false);
        }}
      >
        <motion.div
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 10,
          }}
          exit={{
            opacity: 0,
            y: -40,
            x: 40,
            filter: "blur(8px)",
            scale: 2,
            position: "absolute",
          }}
          className={cn(
            "text-2xl md:text-3xl z-10 inline-block relative text-left text-neutral-900 dark:text-neutral-100 px-2",
            className
          )}
          key={index}
        >
          {/* edit suggested by Sajal: https://x.com/DewanganSajal */}
          {words[index].split(" ").map((word, wordIndex) => (
          <motion.span
            key={word + wordIndex}
            initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{
              delay: wordIndex * 0.3,
              duration: 0.3,
            }}
            className="inline-block whitespace-nowrap"
          >
            {word.split("").map((letter, letterIndex) => (
              <motion.span
                key={word + letterIndex}
                initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  delay: wordIndex * 0.3 + letterIndex * 0.05,
                  duration: 0.2,
                }}
                className="inline-block"
              >
                {letter}
              </motion.span>
            ))}
            <span className="inline-block">&nbsp;</span>
          </motion.span>
        ))}
      </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};
