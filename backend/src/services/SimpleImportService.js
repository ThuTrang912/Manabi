import CardSet from "../models/CardSet.js";
import Card from "../models/Card.js";

class SimpleImportService {
  // Import từ CSV text (user paste vào)
  static async importFromCsvText(
    csvText,
    userId,
    setName,
    sourceType = "import"
  ) {
    try {
      console.log(
        "SimpleImportService.importFromCsvText called with setName:",
        setName
      );

      const lines = csvText.split("\n").filter((line) => line.trim());

      if (lines.length === 0) {
        throw new Error("CSV text is empty");
      }

      // Create CardSet - ensure setName is properly used
      const finalSetName =
        setName && setName.trim() ? setName.trim() : "Imported Card Set";
      console.log("CSV final setName:", finalSetName);

      const cardSet = new CardSet({
        name: finalSetName,
        userId: userId,
        source: sourceType, // Use provided source type
        sourceMetadata: {
          importFormat: "csv",
          importDate: new Date(),
          originalSource: sourceType === "import" ? "csv" : sourceType,
          providedName: setName, // Save what was provided
        },
      });

      console.log("Creating CardSet with name:", finalSetName);

      await cardSet.save();
      console.log(
        "CSV CardSet saved to database with name:",
        cardSet.name,
        "and ID:",
        cardSet._id
      );

      const cards = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // CSV format: "Front,Back" or "Front;Back" or "Front\tBack"
        let parts;
        if (line.includes("\t")) {
          parts = line.split("\t");
        } else if (line.includes(";")) {
          parts = line.split(";");
        } else if (line.includes(",")) {
          parts = line.split(",");
        } else {
          continue; // Skip lines that don't have separators
        }

        if (parts.length < 2) continue;

        const card = new Card({
          cardSetId: cardSet._id,
          position: i,
          content: {
            front: {
              text: parts[0].trim().replace(/^["']|["']$/g, ""), // Remove quotes
            },
            back: {
              text: parts[1].trim().replace(/^["']|["']$/g, ""), // Remove quotes
            },
          },
          source: "import",
        });

        cards.push(card);
      }

      if (cards.length === 0) {
        await CardSet.findByIdAndDelete(cardSet._id);
        throw new Error("No valid cards found in CSV");
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
      console.error("CSV import error:", error);
      throw new Error(`Failed to import CSV: ${error.message}`);
    }
  }

  // Import từ JSON (Quizlet export format)
  static async importFromQuizletJson(
    jsonData,
    userId,
    sourceType = "quizlet",
    customName = null
  ) {
    try {
      console.log("SimpleImportService.importFromQuizletJson called with:", {
        hasJsonData: !!jsonData,
        userId,
        sourceType,
        customName,
      });

      let data;
      if (typeof jsonData === "string") {
        data = JSON.parse(jsonData);
      } else {
        data = jsonData;
      }

      // Use customName if provided, otherwise use data title or default
      const setName =
        customName && customName.trim()
          ? customName.trim()
          : data.title || data.name || "Imported from Quizlet";

      console.log(
        "Final setName selected:",
        setName,
        "from customName:",
        customName,
        "or data.title:",
        data.title
      );
      const terms = data.terms || data.cards || [];

      if (terms.length === 0) {
        throw new Error("No terms found in JSON data");
      }

      // Create CardSet
      const cardSet = new CardSet({
        name: setName,
        userId: userId,
        source: sourceType, // Use provided source type
        sourceMetadata: {
          importFormat: "json",
          importDate: new Date(),
          originalData: data,
          originalSource: sourceType,
          providedCustomName: customName, // Save what was provided
          originalTitle: data.title || data.name, // Save original title
        },
      });

      console.log("Creating CardSet with final name:", setName);

      await cardSet.save();
      console.log(
        "JSON CardSet saved to database with name:",
        cardSet.name,
        "and ID:",
        cardSet._id
      );

      const cards = [];
      for (let i = 0; i < terms.length; i++) {
        const term = terms[i];

        const card = new Card({
          cardSetId: cardSet._id,
          position: i,
          content: {
            front: {
              text: term.term || term.front || term.question || "",
              image: term.image || term.frontImage || "",
            },
            back: {
              text: term.definition || term.back || term.answer || "",
              image: term.definitionImage || term.backImage || "",
            },
          },
          source: "quizlet",
          sourceMetadata: term,
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
      console.error("JSON import error:", error);
      throw new Error(`Failed to import JSON: ${error.message}`);
    }
  }

  // Import manual cards (từ form)
  static async createManualCardSet(data, userId) {
    try {
      const { name, description, cards } = data;

      if (!name || !cards || cards.length === 0) {
        throw new Error("Name and cards are required");
      }

      // Create CardSet
      const cardSet = new CardSet({
        name: name,
        description: description || "",
        userId: userId,
        source: "manual",
      });

      await cardSet.save();

      const cardDocuments = [];
      for (let i = 0; i < cards.length; i++) {
        const cardData = cards[i];

        const card = new Card({
          cardSetId: cardSet._id,
          position: i,
          content: {
            front: {
              text: cardData.front || cardData.term || "",
              image: cardData.frontImage || "",
            },
            back: {
              text: cardData.back || cardData.definition || "",
              image: cardData.backImage || "",
            },
          },
          source: "manual",
        });

        cardDocuments.push(card);
      }

      await Card.insertMany(cardDocuments);

      cardSet.stats.totalCards = cardDocuments.length;
      await cardSet.save();

      return {
        cardSet,
        cardsCount: cardDocuments.length,
        success: true,
      };
    } catch (error) {
      console.error("Manual card set creation error:", error);
      throw new Error(`Failed to create card set: ${error.message}`);
    }
  }
}

export default SimpleImportService;
