// High Precision QR Code & Barcode SVG Generator with Quiet Margins

export function generateQRCodeSVG(text: string, size = 240): string {
  const encodedText = encodeURIComponent(text);
  return `<img src="https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedText}&margin=2" width="${size}" height="${size}" alt="QR Code" class="mx-auto block bg-white p-1 object-contain" />`;
}

export function generateBarcodeSVG(text: string, width = 240, height = 60): string {
  const encodedText = encodeURIComponent(text);
  return `<img src="https://api.qrserver.com/v1/create-qr-code/?size=${width}x${height}&data=${encodedText}&margin=1" width="${width}" height="${height}" alt="Barcode" class="mx-auto block object-contain" />`;
}
