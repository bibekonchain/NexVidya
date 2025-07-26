import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const generateCertificatePDF = async ({
  studentName,
  courseTitle,
  instructorName,
  date,
  outputPath,
}) => {
  const templatePath = path.join(
    __dirname,
    "../templates/certificateTemplate.html"
  );
  let html = fs.readFileSync(templatePath, "utf-8");

  html = html
    .replace("{{studentName}}", studentName)
    .replace("{{courseTitle}}", courseTitle)
    .replace("{{instructorName}}", instructorName)
    .replace("{{date}}", date.toLocaleDateString());

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: "networkidle0" });
  await page.pdf({ path: outputPath, format: "A4", printBackground: true });

  await browser.close();
};

export default generateCertificatePDF;
