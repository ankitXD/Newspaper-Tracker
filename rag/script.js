import fs from "fs";
import path from "path";
import Poppler from "pdf-poppler";
import Tesseract from "tesseract.js";
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

// ----- CONFIG -----
// const PDF_PATH = "./today-newspaper.pdf";
const PDF_PATH = "./today.pdf";
const IMAGES_DIR = "./images";
const MAX_PAGES = 64; // process all 64 pages
const DPI = 200;

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ----- 1. Convert PDF pages to images with Poppler -----
async function pdfToImages(pdfPath, imagesDir, limitPages = MAX_PAGES) {
  if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

  const opts = {
    format: "png",
    out_dir: imagesDir,
    out_prefix: "page",
    page: null, // convert all pages
    dpi: DPI,
  };

  await Poppler.convert(pdfPath, opts);

  const files = fs
    .readdirSync(imagesDir)
    .filter((f) => f.endsWith(".png"))
    .sort();

  console.log(`${files.length} pages converted to images.`);

  return files.slice(0, limitPages).map((f) => path.join(imagesDir, f));
}

// ----- 2. OCR each image -----
async function ocrImages(imagePaths) {
  let fullText = "";
  for (const img of imagePaths) {
    console.log("OCR processing:", img);
    const { data } = await Tesseract.recognize(img, "eng");
    fullText += data.text + "\n";
  }
  console.log("OCR complete.");
  return fullText;
}

// ----- 3. Create embeddings -----
async function createEmbeddings(text) {
  const chunks = text.match(/[\s\S]{1,2000}/g) || [];
  const embeddings = [];

  for (const chunk of chunks) {
    const res = await client.embeddings.create({
      model: "text-embedding-3-small",
      input: chunk,
    });
    embeddings.push({ embedding: res.data[0].embedding, text: chunk });
  }

  return embeddings;
}

// ----- 4. Simple similarity search -----
function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (magA * magB);
}

async function searchTopChunks(query, embeddings) {
  const queryEmbedRes = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: query,
  });
  const queryEmbedding = queryEmbedRes.data[0].embedding;

  return embeddings
    .map((e) => ({
      ...e,
      score: cosineSimilarity(e.embedding, queryEmbedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

// ----- 5. Summarize top news -----
async function summarizeTopNews(chunks) {
  const context = chunks.map((c) => c.text).join("\n\n");
  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a news summarizer. Summarize top 15 News Headlines. Don't Summarize any Advertisement. Summarize key headlines clearly within a sentence or two. Give summary of every page important development. Cover all category of news. Cover Special Stories about current development around the globe too.",
      },
      { role: "user", content: context },
    ],
  });

  return res.choices[0].message.content;
}

// ----- 6. Cleanup images folder -----
function cleanupImages(imagesDir) {
  if (!fs.existsSync(imagesDir)) return;
  const files = fs.readdirSync(imagesDir);
  for (const f of files) fs.unlinkSync(path.join(imagesDir, f));
  fs.rmdirSync(imagesDir);
  console.log("Images folder cleaned up.");
}

// ----- 7. Main pipeline -----
(async () => {
  try {
    const pages = await pdfToImages(PDF_PATH, IMAGES_DIR, MAX_PAGES);
    if (pages.length === 0) throw new Error("No pages found in PDF.");

    const text = await ocrImages(pages);
    if (!text || text.trim().length === 0)
      throw new Error("No text extracted from PDF.");

    const embeddings = await createEmbeddings(text);

    const topChunks = await searchTopChunks("today's top news", embeddings);

    const summary = await summarizeTopNews(topChunks);

    console.log("\n📰 Top News Summary:\n");
    console.log(summary);

    // Delete all images after processing
    cleanupImages(IMAGES_DIR);
  } catch (err) {
    console.error("Error:", err.message);
  }
})();
