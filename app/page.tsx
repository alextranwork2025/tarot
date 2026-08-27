import { FinalCTA } from "@/components/FinalCTA";
import { BlogHighlights } from "@/components/blog/BlogHighlights";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Introduction } from "@/components/Introduction";
import { QuoteSection } from "@/components/QuoteSection";
import { ReaderProfile } from "@/components/ReaderProfile";
import { ReadingTypes } from "@/components/ReadingTypes";
import { SymbolLibrary } from "@/components/SymbolLibrary";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Introduction />
        <ReadingTypes />
        <SymbolLibrary />
        <QuoteSection />
        <BlogHighlights />
        <ReaderProfile />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
