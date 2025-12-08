import fs from "fs";
import path from "path";

export const BibleLoader = {
  asv: null as any,
  kjv: null as any,
  web: null as any,

  load() {
    const dataPath = path.join(__dirname, "../../data");

    try {
      this.asv = JSON.parse(
        fs.readFileSync(path.join(dataPath, "asv.json"), "utf8")
      );
      console.log("✔ ASV JSON loaded successfully");
    } catch (err: any) {
      console.error("❌ FAILED to load ASV JSON:", err.message);
      this.asv = null;
    }

    try {
      this.kjv = JSON.parse(
        fs.readFileSync(path.join(dataPath, "kjv.json"), "utf8")
      );
      console.log("✔ KJV JSON loaded successfully");
    } catch (err: any) {
      console.error("❌ FAILED to load KJV JSON:", err.message);
      this.kjv = null;
    }

    try {
      this.web = JSON.parse(
        fs.readFileSync(path.join(dataPath, "web.json"), "utf8")
      );
      console.log("✔ WEB JSON loaded successfully");
    } catch (err: any) {
      console.error("❌ FAILED to load WEB JSON:", err.message);
      this.web = null;
    }

    console.log("📘 Bible JSON loader results:");
    console.log("ASV loaded:", !!this.asv);
    console.log("KJV loaded:", !!this.kjv);
    console.log("WEB loaded:", !!this.web);
  },

  getVersion(version: string) {
    switch (version.toLowerCase()) {
      case "asv":
        return this.asv;
      case "kjv":
        return this.kjv;
      case "web":
        return this.web;
      default:
        return null;
    }
  }
};
