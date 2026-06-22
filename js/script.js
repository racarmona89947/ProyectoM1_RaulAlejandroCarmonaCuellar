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
function generateHexColor() {}

// Convierte HEX a HSL
function hexToHsl(hex) {}

// Asegura tamaño de la paleta
function ensurePaletteSize(totalColors) {}