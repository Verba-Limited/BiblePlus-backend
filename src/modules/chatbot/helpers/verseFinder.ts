// src/modules/chatbot/verseFinder.ts
import Fuse from "fuse.js";
import { VerseItem } from "../chatbot.types";
import { BibleLoader } from "../../bible/bible.loader";

class VerseFinderClass {
  private fuse: Fuse<VerseItem> | null = null;
  private ready = false;

  init() {
    const kjv = BibleLoader.getVersion("kjv");
    if (!kjv) {
      console.error("⚠️ VerseFinder: KJV not loaded");
      return;
    }

    const allVerses: VerseItem[] = [];

    kjv.books.forEach((b: any) => {
      b.chapters.forEach((c: any) => {
        c.verses.forEach((v: any) => {
          allVerses.push({
            book: b.name,
            chapter: c.chapter,
            verse: v.verse,
            text: v.text
          });
        });
      });
    });

    this.fuse = new Fuse(allVerses, {
      keys: ["text"],
      threshold: 0.3,
    });

    this.ready = true;
    console.log("📖 VerseFinder initialized with", allVerses.length, "verses");
  }

  search(query: string, limit = 5): VerseItem[] {
    if (!this.ready || !this.fuse) return [];
    return this.fuse.search(query).slice(0, limit).map((r: Fuse.FuseResult<VerseItem>) => r.item);
  }
}

export const VerseFinder = new VerseFinderClass();
