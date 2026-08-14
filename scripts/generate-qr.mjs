// Generates a scan-ready QR code pointing at your deployed AeroAvalia URL.
//
// Usage (after you've deployed and know the real URL):
//   node scripts/generate-qr.mjs https://your-real-domain.vercel.app
//
// Produces qr-aeroavalia.png in the project root.
import QRCode from "qrcode";
import { writeFile } from "node:fs/promises";

const url = process.argv[2];

if (!url || !url.startsWith("http")) {
  console.error(
    "Uso: node scripts/generate-qr.mjs https://sua-url-real-de-producao"
  );
  process.exit(1);
}

const outFile = "qr-aeroavalia.png";

const buffer = await QRCode.toBuffer(url, {
  type: "png",
  errorCorrectionLevel: "H",
  margin: 2,
  scale: 12,
  color: {
    dark: "#0a0f1e",
    light: "#ffffff",
  },
});

await writeFile(outFile, buffer);
console.log(`QR code gerado: ${outFile}`);
console.log(`Aponta para: ${url}`);
