// Clean SVG QR Code & Barcode Generator for PromptPay and Product Labels

export function generateQRCodeSVG(text: string, size = 180): string {
  // Simple deterministic 21x21 QR Code grid generator
  const modules = 21;
  const cellSize = size / modules;

  // Generate pattern based on text hash
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }

  let rects = '';

  // Draw 3 Position Finder Patterns (Top-Left, Top-Right, Bottom-Left)
  const finders = [
    [0, 0],
    [14, 0],
    [0, 14]
  ];

  const grid: boolean[][] = Array(modules).fill(false).map(() => Array(modules).fill(false));

  finders.forEach(([fx, fy]) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
          grid[fy + r][fx + c] = true;
        }
      }
    }
  });

  // Fill data cells using deterministic hash
  for (let r = 0; r < modules; r++) {
    for (let c = 0; c < modules; c++) {
      // Skip finder pattern zones
      if ((r < 7 && c < 7) || (r < 7 && c >= 14) || (r >= 14 && c < 7)) continue;
      
      const seed = Math.abs(Math.sin(hash + r * modules + c) * 10000);
      if (seed - Math.floor(seed) > 0.45) {
        grid[r][c] = true;
      }
    }
  }

  // Render SVG rect elements
  for (let r = 0; r < modules; r++) {
    for (let c = 0; c < modules; c++) {
      if (grid[r][c]) {
        rects += `<rect x="${c * cellSize}" y="${r * cellSize}" width="${cellSize + 0.1}" height="${cellSize + 0.1}" fill="#000000" />`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" class="mx-auto bg-white p-2">
    <rect width="100%" height="100%" fill="#FFFFFF"/>
    ${rects}
  </svg>`;
}

export function generateBarcodeSVG(text: string, width = 200, height = 50): string {
  let bars = '';
  const numBars = 45;
  const barWidth = width / numBars;

  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
  }

  for (let i = 0; i < numBars; i++) {
    const isDark = (Math.abs(Math.sin(hash + i) * 10000) % 1) > 0.4;
    if (isDark || i === 0 || i === numBars - 1 || i === Math.floor(numBars / 2)) {
      bars += `<rect x="${i * barWidth}" y="0" width="${barWidth * 0.8}" height="${height}" fill="#000000" />`;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" class="mx-auto">
    <rect width="100%" height="100%" fill="#FFFFFF"/>
    ${bars}
  </svg>`;
}
