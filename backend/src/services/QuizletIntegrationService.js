import CardSet from "../models/CardSet.js";
import Card from "../models/Card.js";
import axios from "axios";

class QuizletIntegrationService {
  // Import set từ Quizlet public URL
  static async importFromQuizletUrl(url, userId, customName = null) {
    try {
      // Parse Quizlet URL to get set ID
      const setIdMatch = url.match(/\/(\d+)\//);
      if (!setIdMatch) {
        throw new Error("Invalid Quizlet URL format");
      }

      const setId = setIdMatch[1];

      console.log(
        "QuizletIntegrationService.importFromQuizletUrl called with customName:",
        customName
      );

      // Note: Quizlet API requires authentication and may have restrictions
      // This is a simplified example - you might need to use web scraping or official API

      const response = await axios.get(`https://quizlet.com/${setId}`, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      // Parse HTML to extract data (simplified - you'd need proper HTML parsing)
      const html = response.data;

      // Extract set title
      const titleMatch = html.match(/<title>(.*?) \| Quizlet<\/title>/);
      const originalTitle = titleMatch
        ? titleMatch[1]
        : "Imported from Quizlet";

      // Use customName if provided, otherwise use original title
      const setTitle = customName || originalTitle;

      console.log(
        "Using setTitle:",
        setTitle,
        "from customName:",
        customName,
        "or originalTitle:",
        originalTitle
      );

      // Extract terms and definitions (this would need proper HTML parsing)
      // This is a placeholder - in reality you'd parse the JSON data embedded in the page
      const termsData = this.parseQuizletHTML(html);

      // Create CardSet
      const cardSet = new CardSet({
        name: setTitle,
        userId: userId,
        source: "quizlet",
        externalId: setId,
        sourceUrl: url,
        sourceMetadata: {
          originalTitle: originalTitle, // Save original title for reference
          customName: customName, // Save custom name used
          importDate: new Date(),
        },
        stats: {
          totalCards: termsData.length,
        },
      });

      await cardSet.save();

      // Create Cards
      const cards = [];
      for (let i = 0; i < termsData.length; i++) {
        const termData = termsData[i];

        const card = new Card({
          cardSetId: cardSet._id,
          position: i,
          content: {
            front: {
              text: termData.term,
              image: termData.termImage || "",
            },
            back: {
              text: termData.definition,
              image: termData.definitionImage || "",
            },
          },
          source: "quizlet",
          externalId: termData.id,
          sourceMetadata: termData,
        });

        cards.push(card);
      }

      await Card.insertMany(cards);

      return {
        cardSet,
        cardsCount: cards.length,
        success: true,
      };
    } catch (error) {
      console.error("Quizlet import error:", error);
      throw new Error(`Failed to import from Quizlet: ${error.message}`);
    }
  }

  // Parse Quizlet HTML to extract terms (simplified)
  static parseQuizletHTML(html) {
    // This is a placeholder - you'd need to implement proper HTML parsing
    // or use Quizlet's official API if available

    // Look for JSON data in script tags
    const jsonMatch = html.match(/window\.Quizlet\["setPageData"\] = ({.*?});/);
    if (jsonMatch) {
      try {
        const data = JSON.parse(jsonMatch[1]);
        return data.termIdToTermsMap
          ? Object.values(data.termIdToTermsMap)
          : [];
      } catch (e) {
        console.error("Failed to parse Quizlet JSON:", e);
      }
    }

    return [];
  }

  // Sync với Quizlet để cập nhật thay đổi
  static async syncWithQuizlet(cardSetId) {
    const cardSet = await CardSet.findById(cardSetId);
    if (!cardSet || cardSet.source !== "quizlet") {
      throw new Error("CardSet is not from Quizlet");
    }

    // Re-import from source URL
    const updated = await this.importFromQuizletUrl(
      cardSet.sourceUrl,
      cardSet.userId
    );

    // Update existing cards or create new ones
    // Implementation depends on your update strategy

    return updated;
  }
}

export default QuizletIntegrationService;
