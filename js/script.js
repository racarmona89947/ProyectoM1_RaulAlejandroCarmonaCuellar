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

function generateNewPalette() {
  ensurePaletteSize(currentPaletteSize);

  const animatedIndexes = new Set();

  currentPalette = currentPalette.map((color, index) => {
    if (lockedColors[index]) return color;

    if (index < currentPaletteSize) {
      animatedIndexes.add(index);
    }

    return generateHexColor();
  });

  renderPalette(animatedIndexes);
}

function renderPalette(animatedIndexes = new Set()) {
  paletteContainer.innerHTML = "";

  const totalColors = currentPaletteSize;
  ensurePaletteSize(totalColors);

  for (let i = 0; i < totalColors; i++) {
    const hex = currentPalette[i];
    const hsl = hexToHsl(hex);
    const isLocked = Boolean(lockedColors[i]);
    const shouldAnimate = animatedIndexes.has(i);

    const card = document.createElement("article");
    card.className = shouldAnimate ? "color-card" : "color-card no-animation";

    if (shouldAnimate) {
      card.style.animationDelay = `${i * 80}ms`;
    }

    card.innerHTML = `
        <div
            class="color-preview-area"
            role="button"
            tabindex="0"
            aria-label="Copiar ${hex}"
        >
            <div
                class="color-preview"
                style="background-color: ${hex};"
                aria-hidden="true"
            ></div>

            <button
                class="lock-btn"
                type="button"
                aria-label="${isLocked ? "Desbloquear color" : "Bloquear color"}"
                title="${isLocked ? "Desbloquear" : "Bloquear"}"
            >
                ${isLocked ? "🔒" : "🔓"}
            </button>
        </div>

        <div class="color-info">
            <p class="hex-code">${hex}</p>
            <p>${hsl}</p>
        </div>
    `;

    paletteContainer.appendChild(card);
    const previewArea = card.querySelector(".color-preview-area");
    const lockButton = card.querySelector(".lock-btn");

    previewArea.addEventListener("click", () => {
      copyHexColor(hex);
    });

    previewArea.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        copyHexColor(hex);
      }
    });

    lockButton.addEventListener("click", (event) => {
      event.stopPropagation();

      if (lockedColors[i]) {
        lockedColors[i] = null;
        showToast("Color desbloqueado");
      } else {
        lockedColors[i] = hex;
        showToast("Color bloqueado");
      }

      renderPalette();
    });
  }
}

function setPaletteSize(totalColors) {
  if (!allowedPaletteSizes.includes(totalColors)) return;

  currentPaletteSize = totalColors;

  ensurePaletteSize(totalColors);

  paletteSizeButtons.forEach((button) => {
    const isSelected = Number(button.dataset.size) === totalColors;

    button.classList.toggle("is-active", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });
}

function saveCurrentPalette() {
  const colors = [];

  paletteContainer.querySelectorAll(".hex-code").forEach((element) => {
    colors.push(element.textContent);
  });

  const savedPalettes = JSON.parse(localStorage.getItem("savedPalettes")) || [];

  const alreadyExists = savedPalettes.some(
    (palette) => JSON.stringify(palette) === JSON.stringify(colors)
  );

  if (alreadyExists) {
    showToast("Esta paleta ya está guardada");
    return;
  }

  savedPalettes.push(colors);

  localStorage.setItem("savedPalettes", JSON.stringify(savedPalettes));

  showToast("✓ Paleta guardada correctamente");

  renderSavedPalettes();
}

if (savePaletteButton) {
  savePaletteButton.addEventListener("click", saveCurrentPalette);
}

if (paletteSizeButtons.length > 0) {
  paletteSizeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const selectedSize = Number(button.dataset.size);

      if (selectedSize === currentPaletteSize) return;

      setPaletteSize(selectedSize);
      renderPalette();
    });
  });
}

function renderSavedPalettes() {
  savedPalettesContainer.innerHTML = "";

  const savedPalettes = JSON.parse(localStorage.getItem("savedPalettes")) || [];

  if (savedPalettes.length === 0) {
    savedPalettesContainer.innerHTML = `
            <article class="empty-message">
                Aún no hay paletas guardadas.
            </article>
        `;
    return;
  }

  savedPalettes.forEach((palette, index) => {
    const card = document.createElement("article");
    card.className = "color-card saved-palette-card";

    const preview = palette
      .map(
        (color) =>
          `<span class="saved-preview-swatch" style="background-color: ${color};" aria-hidden="true"></span>`
      )
      .join("");

    card.innerHTML = `
            <div class="saved-palette-preview">${preview}</div>

            <div class="saved-palette-info">
                <p class="saved-palette-title">Paleta guardada</p>
                <p class="saved-palette-meta">${palette.join(" · ")}</p>

                <button class="delete-palette-btn" type="button">
                    Eliminar
                </button>
            </div>
        `;

    savedPalettesContainer.appendChild(card);

    const deleteButton = card.querySelector(".delete-palette-btn");

    deleteButton.addEventListener("click", () => {
      deleteSavedPalette(index);
    });
  });
}

function deleteSavedPalette(index) {
  const savedPalettes = JSON.parse(localStorage.getItem("savedPalettes")) || [];

  savedPalettes.splice(index, 1);

  localStorage.setItem("savedPalettes", JSON.stringify(savedPalettes));

  renderSavedPalettes();

  showToast("✓ Paleta eliminada");
}

function scrollToSection(section) {
  if (!section) return;

  section.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href").slice(1);
    const targetSection = document.getElementById(targetId);

    if (!targetSection) return;

    event.preventDefault();
    scrollToSection(targetSection);
  });
});

setPaletteSize(currentPaletteSize);
if (paletteContainer) generateNewPalette();
if (savedPalettesContainer) renderSavedPalettes();

function copyHexColor(hexColor) {
  navigator.clipboard.writeText(hexColor);

  showToast(`✓ ${hexColor} copiado correctamente`);
}

function showToast(message) {
  toast.textContent = message;

  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}
