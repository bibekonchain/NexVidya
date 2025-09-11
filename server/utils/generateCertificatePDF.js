// server/utils/generateCertificatePDF.js
import { createCanvas, loadImage } from "canvas";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import PDFDocument from "pdfkit";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const generateCertificatePDF = async ({
  studentName,
  courseTitle,
  instructorName,
  completionDate,
  outputPath,
}) => {
  try {
    console.log("⚙️ Starting certificate generation...");

    // Locate the certificate template
    const templatePath = path.join(
      __dirname,
      "../assets/certificate-template.png"
    );

    if (!fs.existsSync(templatePath)) {
      throw new Error(
        "Certificate template not found. Place your template at server/assets/certificate-template.png"
      );
    }
    console.log(" Certificate template found:", templatePath);

    // Load template image
    const template = await loadImage(templatePath);
    console.log(
      "✅ Template loaded. Width:",
      template.width,
      "Height:",
      template.height
    );

    // Create canvas
    const canvas = createCanvas(template.width, template.height);
    const ctx = canvas.getContext("2d");

    // Draw background template
    ctx.drawImage(template, 0, 0);

    // Set text alignment
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Scale text size based on template size
    const baseWidth = 1920;
    const scaleFactor = canvas.width / baseWidth;

    // Helper to draw wrapped text if needed
    const drawWrappedText = (text, y, fontSize, color) => {
      ctx.fillStyle = color;
      ctx.font = `bold ${Math.round(
        fontSize * scaleFactor
      )}px "Times New Roman", serif`;

      const maxWidth = canvas.width * 0.7;
      if (ctx.measureText(text).width <= maxWidth) {
        ctx.fillText(text, canvas.width / 2, y);
        return;
      }

      const words = text.split(" ");
      let line = "";
      const lines = [];

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        if (ctx.measureText(testLine).width > maxWidth && n > 0) {
          lines.push(line);
          line = words[n] + " ";
        } else {
          line = testLine;
        }
      }
      lines.push(line);

      const lineHeight = Math.round(fontSize * 1.25 * scaleFactor);
      const startY = y - ((lines.length - 1) * lineHeight) / 2;

      lines.forEach((l, i) => {
        ctx.fillText(l.trim(), canvas.width / 2, startY + i * lineHeight);
      });
    };

    // Draw student name
    drawWrappedText(studentName, canvas.height * 0.42, 48, "#1a202c");

    // Draw course title
    drawWrappedText(`"${courseTitle}"`, canvas.height * 0.58, 32, "#2d3748");

    // Draw completion date
    const formattedDate = completionDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    ctx.fillStyle = "#4a5568";
    ctx.font = `${Math.round(24 * scaleFactor)}px "Times New Roman", serif`;
    ctx.fillText(formattedDate, canvas.width / 2, canvas.height * 0.72);

    // Draw instructor name
    ctx.fillStyle = "#2d3748";
    ctx.font = `${Math.round(26 * scaleFactor)}px "Times New Roman", serif`;
    ctx.fillText(instructorName, canvas.width / 2, canvas.height * 0.85);

    // Create PDF
    const pdf = new PDFDocument({
      size: [canvas.width * 0.75, canvas.height * 0.75],
      layout: "landscape",
      margins: { top: 0, left: 0, right: 0, bottom: 0 },
    });

    const writeStream = fs.createWriteStream(outputPath);
    pdf.pipe(writeStream);

    // Insert certificate image into PDF
    const buffer = canvas.toBuffer("image/png");
    pdf.image(buffer, 0, 0, {
      width: canvas.width * 0.75,
      height: canvas.height * 0.75,
    });

    pdf.end();

    return new Promise((resolve, reject) => {
      writeStream.on("finish", () => {
        console.log("✅ Certificate PDF generated at:", outputPath);
        resolve(outputPath);
      });
      writeStream.on("error", reject);
    });
  } catch (err) {
    console.error("❌ Error generating certificate:", err);
    throw err;
  }
};

export default generateCertificatePDF;
