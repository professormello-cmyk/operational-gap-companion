const kB_eV_per_K = 8.617333262e-5;

const state = {
  elements: [],
  selectedElement: null
};

function byId(id){
  return document.getElementById(id);
}

function absVal(x){
  return Math.abs(x);
}

function fmt(x, digits = 4){
  if (!Number.isFinite(x)) return "NaN";
  return Number(x).toFixed(digits);
}

function categoryLabel(category){
  if (!category) return "unspecified";
  return String(category).replace(/-/g, " ");
}

function calc2x2(delta, V){
  const denom = Math.sqrt(delta * delta + 4 * V * V);
  const R = absVal(V) > 0 ? absVal(delta) / absVal(V) : (absVal(delta) > 0 ? Infinity : NaN);
  const sin2phi = denom > 0 ? 0.5 * (1 - delta / denom) : NaN;
  const DeltaAdiab = denom;
  const DeltaMin = 2 * absVal(V);
  return { R, sin2phi, DeltaAdiab, DeltaMin };
}

function classifyCRS(dop, R){
  if (dop >= 0.5 && R >= 5) return 0;
  if (dop >= 0.2 && R >= 2) return 1;
  if (dop >= 0.1 && R >= 1) return 2;
  return 3;
}

function crsText(crs){
  if (crs === 0) return "Open-gap robust";
  if (crs === 1) return "Moderately stable";
  if (crs === 2) return "Corridor-sensitive";
  return "Fragile / strong competition";
}

function crsTagClass(crs){
  if (crs === 0) return "tag tag-ok";
  if (crs === 1) return "tag tag-ok";
  if (crs === 2) return "tag tag-mid";
  return "tag tag-risk";
}

function readInputs(){
  return {
    delta: Number(byId("delta").value),
    V: Number(byId("V").value),
    dop: Number(byId("dop").value),
    T: Number(byId("T").value)
  };
}

function updateSelectedPanel(element){
  if (!element){
    byId("selectedSymbol").textContent = "—";
    byId("selectedName").textContent = "No element selected";
    byId("selectedMeta").textContent = "Click one element in the periodic table.";
    byId("selectedNote").textContent = "No preset loaded yet.";
    return;
  }

  byId("selectedSymbol").textContent = element.symbol;
  byId("selectedName").textContent = element.name;
  byId("selectedMeta").textContent =
    `Z = ${element.Z} • ${categoryLabel(element.category)} • ${element.DMC}`;
  byId("selectedNote").textContent =
    `${element.note} ${element.hint}`;
}

function highlightSelectedCell(){
  const cells = document.querySelectorAll(".element-cell");
  cells.forEach((cell) => {
    const isSelected =
      state.selectedElement &&
      cell.dataset.symbol === state.selectedElement.symbol;
    cell.classList.toggle("selected", Boolean(isSelected));
  });
}

function applyElementPreset(element){
  if (!element) return;
  byId("delta").value = Number(element.delta).toFixed(3);
  byId("V").value = Number(element.V).toFixed(3);
  byId("dop").value = Number(element.dop).toFixed(3);
  byId("T").value = Number(element.T).toFixed(0);
}

function interpretResult(element, diagnostics, dop, T){
  const { R, sin2phi } = diagnostics;
  const kBT = kB_eV_per_K * T;
  const crs = classifyCRS(dop, R);

  let sentence1 = "";
  if (crs === 0){
    sentence1 = "The current parameter window is consistent with a comparatively robust electronic-state assignment.";
  } else if (crs === 1){
    sentence1 = "The current parameter window suggests moderate assignment stability, but local competition should still be monitored.";
  } else if (crs === 2){
    sentence1 = "The system lies near a chemically relevant near-degeneracy corridor, so the assignment should be treated as control-sensitive.";
  } else {
    sentence1 = "Strong local competition is expected, and a rigid single-label assignment is not recommended in the present parameter window.";
  }

  let sentence2 = "";
  if (!Number.isFinite(sin2phi)){
    sentence2 = "The current input does not define a regular two-state mixing estimate.";
  } else if (sin2phi < 0.10){
    sentence2 = "Two-state leakage remains limited in this simplified 2×2 picture.";
  } else if (sin2phi < 0.30){
    sentence2 = "Mixing is already noticeable and should not be ignored in chemical interpretation.";
  } else {
    sentence2 = "Mixing is substantial, indicating that the competing descriptions are no longer cleanly separable.";
  }

  let sentence3 = "";
  if (Number.isFinite(kBT) && dop <= 2 * kBT){
    sentence3 = "At the chosen temperature, the operational gap is thermally soft enough to deserve caution.";
  } else {
    sentence3 = "At the chosen temperature, thermal smearing alone is unlikely to dominate the operational gap.";
  }

  const elementSentence = element
    ? `For ${element.name}, the current preset is framed around ${element.DMC}; ${element.hint}`
    : "No element-specific preset is currently selected, so the interpretation is purely generic.";

  return `${sentence1} ${sentence2} ${sentence3} ${elementSentence}`;
}

function renderOut(){
  const { delta, V, dop, T } = readInputs();
  const diagnostics = calc2x2(delta, V);
  const kBT = kB_eV_per_K * T;
  const crs = classifyCRS(dop, diagnostics.R);

  byId("out").innerHTML = `
    <div class="metrics-row">
      <span class="${crsTagClass(crs)}">CRS ${crs} · ${crsText(crs)}</span>
      <span class="metric"><strong>R</strong> = ${fmt(diagnostics.R)}</span>
      <span class="metric"><strong>sin²φ</strong> = ${fmt(diagnostics.sin2phi)}</span>
    </div>
    <div class="metrics-row">
      <span class="metric"><strong>Δadiab</strong> = ${fmt(diagnostics.DeltaAdiab)} eV</span>
      <span class="metric"><strong>Δmin</strong> = ${fmt(diagnostics.DeltaMin)} eV</span>
      <span class="metric"><strong>Δop</strong> = ${fmt(dop)} eV</span>
      <span class="metric"><strong>kBT</strong> = ${fmt(kBT)} eV</span>
    </div>
  `;

  byId("quickInterpretation").textContent =
    interpretResult(state.selectedElement, diagnostics, dop, T);
}

function selectElement(element){
  state.selectedElement = element;
  updateSelectedPanel(element);
  highlightSelectedCell();
  applyElementPreset(element);
  renderOut();
}

function resetToSelectedElementPreset(){
  if (!state.selectedElement){
    byId("quickInterpretation").textContent =
      "No element is currently selected. Click one element in the periodic table first.";
    return;
  }
  applyElementPreset(state.selectedElement);
  renderOut();
}

function makeEmptyCell(){
  const div = document.createElement("div");
  div.className = "empty-cell";
  div.setAttribute("aria-hidden", "true");
  return div;
}

function makeElementCell(element){
  const button = document.createElement("button");
  button.type = "button";
  button.className = "element-cell";
  button.dataset.symbol = element.symbol;
  button.setAttribute(
    "aria-label",
    `${element.name}, atomic number ${element.Z}`
  );

  const num = document.createElement("div");
  num.className = "element-number";
  num.textContent = element.Z;

  const sym = document.createElement("div");
  sym.className = "element-symbol";
  sym.textContent = element.symbol;

  button.appendChild(num);
  button.appendChild(sym);

  button.addEventListener("click", () => {
    selectElement(element);
  });

  return button;
}

function renderPeriodicTable(elements){
  const container = byId("periodicTable");
  container.innerHTML = "";

  const maxRow = Math.max(...elements.map((el) => el.row));
  const maxCol = 18;

  const posMap = new Map();
  elements.forEach((el) => {
    posMap.set(`${el.row}-${el.col}`, el);
  });

  for (let row = 1; row <= maxRow; row += 1){
    for (let col = 1; col <= maxCol; col += 1){
      const key = `${row}-${col}`;
      const element = posMap.get(key);
      container.appendChild(element ? makeElementCell(element) : makeEmptyCell());
    }
  }
}

async function loadElements(){
  const response = await fetch("data/elements.json", { cache: "no-cache" });
  if (!response.ok){
    throw new Error(`Failed to load elements.json (${response.status})`);
  }
  const data = await response.json();
  if (!data.elements || !Array.isArray(data.elements)){
    throw new Error("Invalid elements.json format");
  }
  return data.elements;
}

function registerServiceWorker(){
  const isSecureContextLike =
    location.protocol === "https:" || location.hostname === "localhost";

  if ("serviceWorker" in navigator && isSecureContextLike){
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("./sw.js")
        .catch((err) => console.warn("Service Worker registration failed:", err));
    });
  }
}

function bindUI(){
  byId("calc").addEventListener("click", renderOut);
  byId("resetPreset").addEventListener("click", resetToSelectedElementPreset);
}

async function init(){
  bindUI();
  registerServiceWorker();
  updateSelectedPanel(null);

  try {
    state.elements = await loadElements();
    renderPeriodicTable(state.elements);

    const iron = state.elements.find((el) => el.symbol === "Fe");
    if (iron){
      selectElement(iron);
    } else {
      renderOut();
    }
  } catch (err){
    console.error(err);
    byId("selectedName").textContent = "Dataset loading failed";
    byId("selectedMeta").textContent = "The periodic table dataset could not be loaded.";
    byId("selectedNote").textContent = String(err.message || err);
    byId("quickInterpretation").textContent =
      "The app could not load the element presets. Check data/elements.json and try again.";
    byId("out").innerHTML =
      `<span class="tag tag-risk">Dataset error</span>`;
  }
}

document.addEventListener("DOMContentLoaded", init);
