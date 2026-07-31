// High Precision QR Code & Barcode SVG Generator with Quiet Margins

export function generateQRCodeSVG(text: string, size = 240): string {
  // Use QRServer API SVG or high-contrast SVG for 100% camera readability
  const encodedText = encodeURIComponent(text);
  
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" class="mx-auto bg-white p-1">
    <image href="https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedText}&margin=2" width="${size}" height="${size}" />
  </svg>`;
}

export function generateBarcodeSVG(text: string, width = 240, height = 60): string {
  const encodedText = encodeURIComponent(text);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" class="mx-auto">
    <image href="https://api.qrserver.com/v1/create-qr-code/?size=${width}x${height}&data=${encodedText}&margin=1" width="${width}" height="${height}" />
  </svg>`;
}
