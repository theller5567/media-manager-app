"use client";

import { Hero } from "@/components/sections/Hero";
import { Features } from "@/components/sections/Features";
import { ProblemSolution } from "@/components/sections/ProblemSolution";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Pricing } from "@/components/sections/Pricing";
import { FAQ } from "@/components/sections/FAQ";
import { CTA } from "@/components/sections/CTA";
import IntroHero from "@/components/sections/IntroHero";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function Home() {
    const [introFinished, setIntroFinished] = useState(false);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.5, delay: 0.5 } },
    };

  return (
    <main className="min-h-screen">
    {/* <AnimatePresence mode="wait">
      {!introFinished && (
        <motion.div
          key="intro-container"
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
          variants={containerVariants}
        >
          <IntroHero onComplete={() => setIntroFinished(true)} />
        </motion.div>
      )}
    </AnimatePresence> */}
      <Hero />
      <ProblemSolution />
      <Features />
      <HowItWorks />
      <Pricing />
      <FAQ />
      <CTA />
    </main>
  );
}
