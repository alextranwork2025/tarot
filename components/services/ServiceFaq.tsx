"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

export type ServiceFaqItem = { question: string; answer: string };

export function ServiceFaq({ items }: { items: ServiceFaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="grid gap-3">
      {items.map((item, index) => {
        const open = openIndex === index;
        const panelId = `service-faq-panel-${index}`;
        return (
          <div key={item.question} className="border-b border-gilded/35">
            <button
              type="button"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpenIndex(open ? null : index)}
              className="flex min-h-16 w-full items-center justify-between gap-5 py-4 text-left font-medium text-ivory transition hover:text-antique-gold focus:outline-none focus:ring-2 focus:ring-antique-gold"
            >
              {item.question}
              <ChevronDown className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} size={18} aria-hidden="true" />
            </button>
            {open ? <p id={panelId} className="pb-5 text-sm leading-7 text-stone-mist">{item.answer}</p> : null}
          </div>
        );
      })}
    </div>
  );
}
