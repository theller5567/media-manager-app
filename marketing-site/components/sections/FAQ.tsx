"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "How does AI auto-tagging work?",
    answer: "Our AI analyzes your media files using advanced computer vision and natural language processing. It automatically generates relevant tags, descriptions, and metadata based on the content of your images, videos, and documents.",
  },
  {
    question: "Can I customize the metadata fields?",
    answer: "Yes! Media Manager allows you to create custom Media Types with your own metadata fields. You can define field types, validation rules, and required fields to match your specific workflow needs.",
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. We use enterprise-grade encryption, secure cloud storage, and follow industry best practices for data security. Your media and metadata are encrypted both in transit and at rest.",
  },
  {
    question: "Can I integrate with other tools?",
    answer: "Yes, Media Manager offers API access and webhooks for integrations. We also provide pre-built integrations for popular tools and platforms. Enterprise plans include custom integration support.",
  },
  {
    question: "What file types are supported?",
    answer: "We support all major image formats (JPEG, PNG, GIF, WebP, SVG), video formats (MP4, MOV, AVI, WebM), audio formats (MP3, WAV, OGG), and document formats (PDF, DOC, DOCX, XLS, XLSX).",
  },
  {
    question: "How does semantic search work?",
    answer: "Semantic search uses AI to understand the meaning and context of your queries, not just keywords. For example, searching for 'sunset over ocean' will find images with sunsets, beaches, and ocean scenes, even if those exact words aren't in the tags.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 px-4 bg-slate-800">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-slate-400">
            Everything you need to know about Media Manager.
          </p>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-800 transition-colors"
              >
                <span className="text-lg font-semibold text-white pr-8">
                  {faq.question}
                </span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 text-slate-400 shrink-0 transition-transform",
                    openIndex === index && "rotate-180"
                  )}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-6">
                  <p className="text-slate-300 leading-relaxed pt-2">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
