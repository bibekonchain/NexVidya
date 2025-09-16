// server/utils/generateCertificatePDF.js
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const generateCertificatePDF = async ({
  studentName,
  courseTitle,
  instructorName,
  completionDate,
  outputPath,
}) => {
  let browser;

  try {
    console.log("🎓 Starting certificate generation...");

    // Read HTML template
    const templatePath = path.join(__dirname, "../templates/certificate.html");

    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found at: ${templatePath}`);
    }

    let htmlContent = fs.readFileSync(templatePath, "utf8");

    // Format completion date
    const formattedDate = completionDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Replace placeholders with actual data
    htmlContent = htmlContent
      .replace(/{{STUDENT_NAME}}/g, studentName)
      .replace(/{{COURSE_TITLE}}/g, courseTitle)
      .replace(/{{INSTRUCTOR_NAME}}/g, instructorName)
      .replace(/{{COMPLETION_DATE}}/g, formattedDate);

    console.log("✅ Template loaded and variables replaced");

    // Launch Puppeteer
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
      ],
    });

    const page = await browser.newPage();

    // Set content and wait for fonts to load
    await page.setContent(htmlContent, {
      waitUntil: ["networkidle0", "domcontentloaded"],
    });

    // Add small delay to ensure fonts are loaded
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("✅ Page content set, generating PDF...");

    // Generate PDF
    await page.pdf({
      path: outputPath,
      format: "A4",
      landscape: true,
      printBackground: true,
      margin: {
        top: "0.5in",
        right: "0.5in",
        bottom: "0.5in",
        left: "0.5in",
      },
      preferCSSPageSize: true,
    });

    console.log("✅ Certificate PDF generated successfully at:", outputPath);
    return outputPath;
  } catch (error) {
    console.error("❌ Error generating certificate:", error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

// If run directly (not imported), run a test
if (process.argv[1].includes("generateCertificatePDF.js")) {
  const testOutput = path.join(
    __dirname,
    "../certificates/test-certificate.pdf"
  );

  generateCertificatePDF({
    studentName: "Test Student",
    courseTitle: "Debugging 101",
    instructorName: "John Doe",
    completionDate: new Date(),
    outputPath: testOutput,
  })
    .then((file) => {
      console.log("🎉 Test certificate created at:", file);
    })
    .catch((err) => {
      console.error("🔥 Test run failed:", err);
    });
}

export default generateCertificatePDF;
