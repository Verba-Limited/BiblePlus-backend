import fs from "fs";
import path from "path";

export const BibleLoader = {
  versions: {} as Record<string, any>,

  load() {
    const dataPath = path.join(__dirname, "../../data");

    const versionFiles = [
      { key: "kjv", file: "kjv.json" },
      { key: "asv", file: "asv.json" },
      { key: "web", file: "web.json" }
    ];

    versionFiles.forEach(({ key, file }) => {
      try {
        const filePath = path.join(dataPath, file);

        if (!fs.existsSync(filePath)) {
          console.error(`❌ File not found: ${filePath}`);
          this.versions[key] = null;
          return;
        }

        const raw = fs.readFileSync(filePath, "utf8");

        // Validate JSON
        const json = JSON.parse(raw);

        // Store original JSON
        this.versions[key] = json;

        console.log(`✔ Loaded ${file}`);

        // -------------------------------
        // STRUCTURE DEBUG CHECK
        // -------------------------------
        console.log(`🔍 Structure check for ${key.toUpperCase()}:`, {
          translation: json.translation || "MISSING",
          hasBooks: Array.isArray(json.books),
          booksCount: json.books?.length ?? "MISSING",
          firstBookName: json.books?.[0]?.name ?? "MISSING",
          firstBookChapters:
            json.books?.[0]?.chapters?.length ?? "MISSING",
          firstChapterVerses:
            json.books?.[0]?.chapters?.[0]?.verses?.length ?? "MISSING"
        });

      } catch (err: any) {
        console.error(`❌ FAILED to load ${file}:`, err.message);
        this.versions[key] = null;
      }
    });

    console.log("📘 Loaded versions:", Object.keys(this.versions));
  },

  // Return EXACT JSON data without modification
  getVersion(version: string) {
    return this.versions[version.toLowerCase()] || null;
  }
};
