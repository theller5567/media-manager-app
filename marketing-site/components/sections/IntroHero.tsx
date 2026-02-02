import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion';

interface IntroHeroProps {
    onComplete?: () => void;
}

const IntroHero = ({ onComplete }: IntroHeroProps) => {
    const [currentPhase, setCurrentPhase] = useState<'issues' | 'solutions' | 'finished'>('issues');
    const [issuesFinished, setIssuesFinished] = useState(false);
    const [solutionsFinished, setSolutionsFinished] = useState(false);
    const [showList, setShowList] = useState(false);

    useEffect(() => {
        if (currentPhase === 'finished') return;
        setShowList(false);
        const timer = setTimeout(() => {
            setShowList(true);
        }, 1500);
        return () => clearTimeout(timer);
    }, [currentPhase]);

    useEffect(() => {
        if (issuesFinished) {
            const timer = setTimeout(() => {
                setCurrentPhase('solutions');
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [issuesFinished]);

    useEffect(() => {
        if (solutionsFinished) {
            const timer = setTimeout(() => {
                setCurrentPhase('finished');
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [solutionsFinished]);

    useEffect(() => {
        if (currentPhase === 'finished' && onComplete) {
            const timer = setTimeout(() => {
                onComplete();
            }, 1000); // Allow time for exit animation
            return () => clearTimeout(timer);
        }
    }, [currentPhase, onComplete]);
    
    const issuesList = [
        "Media scattered across folders, drives, and cloud storage",
        "Hours wasted searching for the right file",
        "Inconsistent metadata and missing information",
        "Team collaboration bottlenecks and version chaos",
        "Inconsistent metadata and missing information",
        "Team collaboration bottlenecks and version chaos",
        "Inconsistent metadata and missing information",
       ]

    const solutionsList = [
        "Centralized media library with AI-powered organization",
        "Semantic search that understands context and meaning",
        "Custom metadata fields tailored to your workflow",
        "Real-time collaboration with instant updates",
        "Find assets by concept, not just keywords",
    ]

    const renderIssuesList = () => {
        return (
            <ul className="list-inside text-slate-300 text-lg md:text-xl font-medium space-y-2 list-none">
                {issuesList.map((issue, index) => (
                    <motion.li key={index} className="flex items-start gap-3"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: index * 0.2 }}
                        onAnimationComplete={index === issuesList.length - 1 ? () => setIssuesFinished(true) : undefined}
                    >
                        <span className="text-red-400 mt-1">✗</span>
                        <span>{issue}</span>
                    </motion.li>
                ))}
            </ul>
        )
    }
    
    const renderSolutionsList = () => {
        return (
            <ul className="list-inside text-slate-300 text-lg md:text-xl font-medium space-y-2 list-none">
                {solutionsList.map((solution, index) => (
                    <motion.li key={index} className="flex items-start gap-3"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: index * 0.2 }}
                        onAnimationComplete={index === solutionsList.length - 1 ? () => setSolutionsFinished(true) : undefined}
                    >
                        <span className="text-cyan-400 mt-1">✓</span>
                        <span>{solution}</span>
                    </motion.li>
                ))}
            </ul>
        )
    }

  

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-20 bg-linear-to-b from-slate-900 via-slate-800 to-slate-900 pt-24">
        <AnimatePresence mode="wait">
            {currentPhase === 'issues' ? (
                <motion.div 
                    key="issues-phase"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-7xl mx-auto text-center"
                >
                    <h1 className="text-5xl md:text-7xl font-bold bg-linear-to-r from-slate-200 to-slate-300 bg-clip-text text-transparent leading-tight">
                    Is your media working against you?
                    </h1>
                    <div className="mt-8 min-h-[300px] flex justify-center text-left">
                        {showList && renderIssuesList()}
                    </div>
                </motion.div>
            ) : currentPhase === 'solutions' ? (
                <motion.div 
                    key="solutions-phase"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-7xl mx-auto text-center"
                >
                    <h1 className="text-5xl md:text-7xl font-bold bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent leading-tight">
                    Finally, a library that thinks like you
                    </h1>
                    <div className="mt-8 min-h-[300px] flex justify-center text-left">
                        {showList && renderSolutionsList()}
                    </div>
                </motion.div>
            ) : null}
        </AnimatePresence>
    </section>
  )
}

export default IntroHero