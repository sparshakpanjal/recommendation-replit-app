import express from "express";
import path from "path";
import fs from "fs";
import recommendationCtrl from "../controllers/recommendationCtrl.js";
import { fileURLToPath } from "url";

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CSV path
const recommendationsFilePath = path.join(__dirname, '../data/recommendations.csv');

const router = express.Router();

// Helper: Read from CSV
const readRecommendationsFromCSV = () => {
    if (!fs.existsSync(recommendationsFilePath)) return [];

    const csvData = fs.readFileSync(recommendationsFilePath, 'utf8');
    const rows = csvData.trim().split('\n').slice(1); // Skip header

    return rows.map(row => {
        const [id, productId, recommendedProductId] = row.split(',');
        return { id, productId, recommendedProductId };
    });
};

// Helper: Write to CSV
const writeRecommendationsToCSV = (recommendations) => {
    const header = 'id,productId,recommendedProductId';
    const rows = recommendations.map(rec => `${rec.id},${rec.productId},${rec.recommendedProductId}`);
    fs.writeFileSync(recommendationsFilePath, `${header}\n${rows.join('\n')}`);
};

// 📌 GET recommendations for a specific product
router.get("/:productId", (req, res) => {
    try {
        const { productId } = req.params;
        const recommendations = readRecommendationsFromCSV();

        const result = recommendations.filter(rec => rec.productId === productId);

        if (!result.length) {
            return res.status(404).json({ message: "No recommendations found for this product." });
        }

        res.json(result);
    } catch (err) {
        res.status(500).json({ message: "Error reading recommendations.", error: err.message });
    }
});

// 📌 POST a new recommendation
router.post("/", (req, res) => {
    try {
        const { productId, recommendedProductId } = req.body;

        if (!productId || !recommendedProductId) {
            return res.status(400).json({ message: "Both productId and recommendedProductId are required." });
        }

        const recommendations = readRecommendationsFromCSV();

        const alreadyExists = recommendations.find(rec =>
            rec.productId === productId && rec.recommendedProductId === recommendedProductId
        );

        if (alreadyExists) {
            return res.status(409).json({ message: "Recommendation already exists." });
        }

        const newId = Date.now().toString();
        const newRecommendation = { id: newId, productId, recommendedProductId };

        recommendations.push(newRecommendation);
        writeRecommendationsToCSV(recommendations);

        res.status(201).json(newRecommendation);
    } catch (err) {
        res.status(500).json({ message: "Error adding recommendation.", error: err.message });
    }
});

export default router;
