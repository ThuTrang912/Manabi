import CardSet from "../models/CardSet.js";
import Card from "../models/Card.js";
import fs from "fs";
import path from "path";

class AnkiIntegrationService {
  // Import từ file .apkg (Anki package)
  static async importFromAnkiPackage(filePath, userId) {
    try {
      // Anki .apkg files are SQLite databases in a ZIP container
      // You'll need libraries like 'sqlite3' and 'yauzl' to handle this

      const ankiData = await this.parseAnkiPackage(filePath);

      // Create CardSet for each deck
      const results = [];

      for (const deck of ankiData.decks) {
        const cardSet = new CardSet({
          name: deck.name,
          userId: userId,
          source: "anki",
          externalId: deck.id.toString(),
          sourceMetadata: {
            deckConfig: deck.config,
            importDate: new Date(),
            originalPath: filePath,
          },
          settings: {
            algorithm: "anki",
            studyModes: ["flashcard"],
          },
        });

        await cardSet.save();

        // Create cards
        const cards = [];
        for (let i = 0; i < deck.notes.length; i++) {
          const note = deck.notes[i];

          const card = new Card({
            cardSetId: cardSet._id,
            position: i,
            content: {
              front: {
                text: this.stripAnkiHtml(note.fields[0] || ""),
                html: note.fields[0] || "",
              },
              back: {
                text: this.stripAnkiHtml(note.fields[1] || ""),
                html: note.fields[1] || "",
              },
              // Store all fields for complex note types
              extraFields: note.fields.slice(2),
            },
            source: "anki",
            externalId: note.id.toString(),
            sourceMetadata: {
              noteType: note.noteType,
              tags: note.tags,
              deck: deck.name,
            },
            learning: {
              // Import existing Anki scheduling data if available
              easeFactor: note.easeFactor || 2.5,
              interval: note.interval || 1,
              repetition: note.reps || 0,
              status: note.queue === 0 ? "new" : "review",
              deckName: deck.name,
            },
            tags: note.tags || [],
          });

          cards.push(card);
        }

        await Card.insertMany(cards);

        // Update card count
        cardSet.stats.totalCards = cards.length;
        await cardSet.save();

        results.push({
          cardSet,
          cardsCount: cards.length,
        });
      }

      return {
        results,
        totalDecks: results.length,
        totalCards: results.reduce((sum, r) => sum + r.cardsCount, 0),
        success: true,
      };
    } catch (error) {
      console.error("Anki import error:", error);
      throw new Error(`Failed to import from Anki: ${error.message}`);
    }
  }

  // Parse Anki .apkg file
  static async parseAnkiPackage(filePath) {
    // This is a simplified implementation
    // You'll need to implement proper SQLite parsing for .apkg files

    // Anki package structure:
    // - collection.anki21 (SQLite database)
    // - media (JSON file with media mappings)
    // - media files (numbered: 0, 1, 2, etc.)

    throw new Error(
      "Anki package parsing not yet implemented. Please implement SQLite parsing for .apkg files."
    );
  }

  // Import from exported .txt file (simpler format)
  static async importFromAnkiText(
    filePath,
    userId,
    deckName = "Imported Deck"
  ) {
    try {
      console.log(
        "AnkiIntegrationService.importFromAnkiText called with deckName:",
        deckName
      );

      const content = fs.readFileSync(filePath, "utf-8");
      const lines = content.split("\n").filter((line) => line.trim());

      const cardSet = new CardSet({
        name: deckName,
        userId: userId,
        source: "anki",
        sourceMetadata: {
          importFormat: "text",
          importDate: new Date(),
          originalPath: filePath,
        },
      });

      console.log("Creating CardSet with name:", deckName);

      await cardSet.save();

      const cards = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Anki text format: "Front\tBack" or "Front\tBack\tTags"
        const parts = line.split("\t");
        if (parts.length < 2) continue;

        const card = new Card({
          cardSetId: cardSet._id,
          position: i,
          content: {
            front: {
              text: this.stripAnkiHtml(parts[0]),
              html: parts[0],
            },
            back: {
              text: this.stripAnkiHtml(parts[1]),
              html: parts[1],
            },
          },
          source: "anki",
          tags: parts[2] ? parts[2].split(" ").filter((tag) => tag.trim()) : [],
        });

        cards.push(card);
      }

      await Card.insertMany(cards);

      cardSet.stats.totalCards = cards.length;
      await cardSet.save();

      return {
        cardSet,
        cardsCount: cards.length,
        success: true,
      };
    } catch (error) {
      console.error("Anki text import error:", error);
      throw new Error(`Failed to import Anki text file: ${error.message}`);
    }
  }

  // Export to Anki format
  static async exportToAnkiText(cardSetId) {
    const cardSet = await CardSet.findById(cardSetId);
    const cards = await Card.find({ cardSetId }).sort({ position: 1 });

    let content = "";
    for (const card of cards) {
      const front = card.content.front.html || card.content.front.text;
      const back = card.content.back.html || card.content.back.text;
      const tags = card.tags.join(" ");

      content += `${front}\t${back}`;
      if (tags) {
        content += `\t${tags}`;
      }
      content += "\n";
    }

    return {
      filename: `${cardSet.name}.txt`,
      content,
      mimeType: "text/plain",
    };
  }

  // Helper: Remove Anki HTML formatting but keep basic structure
  static stripAnkiHtml(html) {
    if (!html) return "";

    return html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<div[^>]*>/gi, "\n")
      .replace(/<\/div>/gi, "")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .trim();
  }
}

export default AnkiIntegrationService;
