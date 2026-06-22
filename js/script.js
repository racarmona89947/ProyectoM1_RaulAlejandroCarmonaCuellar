const generateButton = document.getElementById("generate-btn");
const savePaletteButton = document.getElementById("save-palette-btn");
const generatorSection = document.getElementById("generador");
const paletteSizeButtons = document.querySelectorAll(".size-option");
const paletteContainer = document.getElementById("palette-container");
const savedPalettesContainer = document.getElementById("saved-palettes");
const toast = document.getElementById("toast");

const allowedPaletteSizes = [6, 8, 9];

const lockedColors = [];

let currentPalette = [];
let currentPaletteSize = 6;

// Genera un color HEX aleatorio
function generateHexColor() {
  const characters = "0123456789ABCDEF";
  let color = "#";

  for (let i = 0; i < 6; i++) {
    color += characters[Math.floor(Math.random() * 16)];
  }

  return color;
}

// Convierte HEX a HSL
function hexToHsl(hex) {
  let r = parseInt(hex.substring(1, 3), 16) / 255;
  let g = parseInt(hex.substring(3, 5), 16) / 255;
  let b = parseInt(hex.substring(5, 7), 16) / 255;

  let max = Math.max(r, g, b);
  let min = Math.min(r, g, b);

  let h;
  let s;
  let l = (max + min) / 2;

  if (max === min) {
    h = 0;
    s = 0;
  } else {
    const difference = max - min;

    s =
      l > 0.5
        ? difference / (2 - max - min)
        : difference / (max + min);

    switch (max) {
      case r:
        h = (g - b) / difference + (g < b ? 6 : 0);
        break;

      case g:
        h = (b - r) / difference + 2;
        break;

      default:
        h = (r - g) / difference + 4;
    }

    h /= 6;
  }

  return `hsl(${Math.round(h * 360)}°, ${Math.round(
    s * 100
  )}%, ${Math.round(l * 100)}%)`;
}

// Asegura tamaño de la paleta
function ensurePaletteSize(totalColors) {
  while (currentPalette.length < totalColors) {
    currentPalette.push(generateHexColor());
  }
}