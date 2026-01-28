import { useParams } from "react-router-dom";
import QRCode from "react-qr-code";
import { Button, Paper, Stack, Text } from "@mantine/core";
import PageTop from "../../components/global/PageTop";
import { useRef } from "react";

const AssetQRPage = () => {
  const { uid } = useParams();
  const qrRef = useRef();

  // ✅ Download QR + UID as PNG
  const downloadQR = () => {
    const svg = document.getElementById("qr-code-svg");
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);

    const img = new Image();
    const svgBlob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = img.width;
      canvas.height = img.height + 30; // UID text space

      ctx.drawImage(img, 0, 0);

      // Draw UID below QR
      ctx.font = "16px sans-serif";
      ctx.fillStyle = "#000";
      ctx.textAlign = "center";
      ctx.fillText(uid, canvas.width / 2, img.height + 20);

      URL.revokeObjectURL(url);

      const pngImg = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngImg;
      downloadLink.download = `${uid}.png`;
      downloadLink.click();
    };

    img.src = url;
  };

  // ✅ Print QR + UID exactly like PNG
  const printQR = () => {
    const printWindow = window.open("", "_blank");
    const qrContent = qrRef.current.innerHTML;

    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR</title>
          <style>
            body { text-align: center; font-family: sans-serif; padding: 20px; }
            svg { width: 160px; height: 160px; }
            .uid { font-weight: 600; margin-top: 10px; font-size: 16px; }
          </style>
        </head>
        <body>
          ${qrContent}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <>
      <PageTop PAGE_TITLE="QR" backBtn />
      <Paper mt={20} p="lg" withBorder>
        <Stack align="center" spacing="md">
          {/* Hidden QR div for download & print */}
          <div ref={qrRef} style={{ textAlign: "center" }}>
            <QRCode id="qr-code-svg" value={uid} size={160} />
            <Text className="uid">Asset UID: {uid}</Text>
          </div>

          {/* Buttons */}
          <Stack spacing="sm" align="center">
            <Button onClick={printQR}>Print QR</Button>
            <Button onClick={downloadQR} color="green">
              Download QR
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </>
  );
};

export default AssetQRPage;
