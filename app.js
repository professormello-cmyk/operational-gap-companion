const K_B_EV_PER_K = 8.617333262e-5;

const state = {
  elements: [],
  selectedElement: null
};

function byId(id) {
  return document.getElementById(id);
}

function absVal(x) {
  return Math.abs(x);
}

function fmt(x, digits = 4) {
  if (!Number.isFinite(x)) return "NaN";
  return Number(x).toFixed(digits);
}

function categoryLabel(category) {
  if (!category) return "unspecified";
  return String(category).replace(/-/g, " ");
}

function calc2x2(delta, V) {
  const denom = Math.sqrt(delta * delta + 4 * V * V);
  const R = absVal(V) > 0 ? absVal(delta) / absVal(V) : (absVal(delta) > 0 ? Infinity : NaN);
  const sin2phi = denom > 0 ? 0.5 * (1 - delta / denom) : NaN;
  const DeltaAdiab = denom;
  const DeltaMin = 2 * absVal(V);
  return { R, sin2phi, DeltaAdiab, DeltaMin };
}

function classifyCRS(dop, R) {
  if (dop >= 0.5 && R >= 5) return 0;
  if (dop >= 0.2 && R >= 2) return 1;
  if (dop >= 0.1 && R >= 1) return 2;
  return 3;
}

function crsText(crs) {
  if (crs === 0) return "Open-gap robust";
  if (crs === 1) return "Moderately stable";
  if (crs === 2) return "Corridor-sensitive";
  return "Fragile / strong competition";
}

function crsTagClass(crs) {
  if (crs === 0) return "tag tag-ok";
  if (crs === 1) return "tag tag-ok";
  if (crs === 2) return "tag tag-mid";
  return "tag tag-risk";
}

function readInputs() {
  return {
    delta: Number(byId("delta").value),
    V: Number(byId("V").value),
    dop: Number(byId("dop").value),
    T: Number(byId("T").value)
  };
}

function updateSelectedPanel(element) {
  if (!element) {
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

function highlightSelectedCell() {
  const cells = document.querySelectorAll(".element-cell[data-symbol]");
  cells.forEach((cell) => {
    const isSelected =
      state.selectedElement &&
      cell.dataset.symbol === state.selectedElement.symbol;
    cell.classList.toggle("selected", Boolean(isSelected));
  });
}

function applyElementPreset(element) {
  if (!element) return;

  byId("delta").value = Number(element.delta).toFixed(3);
  byId("V").value = Number(element.V).toFixed(3);
  byId("dop").value = Number(element.dop).toFixed(3);
  byId("T").value = Number(element.T).toFixed(0);
}

function baseSummaryFromCRS(crs) {
  if (crs === 0) return "Robust assignment; local inorganic competition appears limited.";
  if (crs === 1) return "Moderately stable assignment; local inorganic competition is present but not dominant.";
  if (crs === 2) return "Corridor-sensitive assignment; chemically relevant local competition is already present.";
  return "Fragile assignment; strong inorganic competition is likely in the current window.";
}

function inorganicConsequenceSentence(element) {
  if (!element) {
    return "Small changes in control variables may still alter the dominant state character, so the present reading should be treated as generic.";
  }

  const category = element.category || "";

  if (category === "transition-metal") {
    return "Small changes in ligand field, oxidation state, or coordination geometry may alter the dominant state character and affect magnetic or redox behaviour.";
  }

  if (category === "lanthanoid") {
    return "Changes in oxidation state, coordination environment, or spin-orbit and multiplet balance may modify the practical assignment and its spectroscopic reading.";
  }

  if (category === "actinoid") {
    return "Changes in covalency, oxidation state, or coordination environment may reorganise 5f participation and alter redox or spectroscopic behaviour.";
  }

  if (category === "post-transition-metal") {
    return "Changes in oxidation state, bond polarity, or heavy-atom effects may shift the balance between competing descriptions and modify reactivity.";
  }

  if (category === "metalloid") {
    return "Changes in covalency, oxidation state, or local geometry may shift the balance between competing bonding descriptions.";
  }

  if (category === "halogen") {
    return "Changes in oxidation state, hypervalent bonding, or charge-transfer environment may shift the dominant description and its reactivity profile.";
  }

  if (category === "noble-gas") {
    return "Only unusual bonding conditions, strong fields, or uncommon oxidation pathways would be expected to challenge the present assignment.";
  }

  if (category === "alkali-metal" || category === "alkaline-earth") {
    return "Unusual covalency, extreme coordination changes, or strong external perturbations would be the main reasons to recheck the present assignment.";
  }

  return "Changes in bonding context, oxidation state, or local environment may still alter the dominant electronic description.";
}

function buildInterpretation(element, diagnostics, dop, T) {
  const { R } = diagnostics;
  const crs = classifyCRS(dop, R);

  const summary = `${baseSummaryFromCRS(crs)} Click to expand the inorganic reading.`;

  const competitionSentence = element
    ? `In inorganic terms, the dominant competition is associated with ${String(element.DMC).toLowerCase()}.`
    : "In inorganic terms, the dominant competition is treated here as a generic two-state electronic competition.";

  const consequenceSentence = inorganicConsequenceSentence(element);

  const expanded = `${competitionSentence} ${consequenceSentence}`;

  return { summary, expanded };
}

function updateInterpretation(element, diagnostics, dop, T) {
  const payload = buildInterpretation(element, diagnostics, dop, T);
  byId("quickSummary").textContent = payload.summary;
  byId("quickExpanded").textContent = payload.expanded;
}

function makeMetricSpan(labelText, valueText) {
  const span = document.createElement("span");
  span.className = "metric";

  const strong = document.createElement("strong");
  strong.textContent = labelText;

  span.appendChild(strong);
  span.appendChild(document.createTextNode(` = ${valueText}`));

  return span;
}

function makeTagSpan(className, text) {
  const span = document.createElement("span");
  span.className = className;
  span.textContent = text;
  return span;
}

function renderOut() {
  const { delta, V, dop, T } = readInputs();
  const diagnostics = calc2x2(delta, V);
  const kBT = K_B_EV_PER_K * T;
  const crs = classifyCRS(dop, diagnostics.R);

  const out = byId("out");
  out.replaceChildren();

  const row1 = document.createElement("div");
  row1.className = "metrics-row";
  row1.appendChild(makeTagSpan(crsTagClass(crs), `CRS ${crs} · ${crsText(crs)}`));
  row1.appendChild(makeMetricSpan("R", fmt(diagnostics.R)));
  row1.appendChild(makeMetricSpan("sin²φ", fmt(diagnostics.sin2phi)));

  const row2 = document.createElement("div");
  row2.className = "metrics-row";
  row2.appendChild(makeMetricSpan("Δadiab", `${fmt(diagnostics.DeltaAdiab)} eV`));
  row2.appendChild(makeMetricSpan("Δmin", `${fmt(diagnostics.DeltaMin)} eV`));
  row2.appendChild(makeMetricSpan("Δop", `${fmt(dop)} eV`));
  row2.appendChild(makeMetricSpan("kBT", `${fmt(kBT)} eV`));

  out.appendChild(row1);
  out.appendChild(row2);

  updateInterpretation(state.selectedElement, diagnostics, dop, T);
}

function selectElement(element) {
  state.selectedElement = element;
  updateSelectedPanel(element);
  highlightSelectedCell();
  applyElementPreset(element);
  renderOut();
}

function resetToSelectedElementPreset() {
  if (!state.selectedElement) {
    byId("quickSummary").textContent =
      "No element is currently selected. Click one element in the periodic table first.";
    byId("quickExpanded").textContent =
      "A full inorganic interpretation requires a selected preset element.";
    return;
  }

  applyElementPreset(state.selectedElement);
  renderOut();
}

function makeElementCell(element) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "element-cell";
  button.dataset.symbol = element.symbol;
  button.dataset.col = String(element.col);
  button.dataset.row = String(element.row);
  button.setAttribute("aria-label", `${element.name}, atomic number ${element.Z}`);

  button.style.gridColumn = String(element.col);
  button.style.gridRow = String(element.row);

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

function makeBridgeCell(row, col, rangeText, labelText) {
  const div = document.createElement("div");
  div.className = "element-cell bridge-cell";
  div.dataset.col = String(col);
  div.dataset.row = String(row);
  div.setAttribute("aria-label", `${rangeText} ${labelText}`);

  div.style.gridColumn = String(col);
  div.style.gridRow = String(row);

  const num = document.createElement("div");
  num.className = "element-number";
  num.textContent = rangeText;

  const sym = document.createElement("div");
  sym.className = "element-symbol";
  sym.textContent = "f";

  const cat = document.createElement("div");
  cat.className = "element-category";
  cat.textContent = labelText;

  div.appendChild(num);
  div.appendChild(sym);
  div.appendChild(cat);

  return div;
}

function renderPeriodicTable(elements) {
  const container = byId("periodicTable");
  container.replaceChildren();

  const ordered = [...elements].sort((a, b) => {
    if (a.row !== b.row) return a.row - b.row;
    if (a.col !== b.col) return a.col - b.col;
    return a.Z - b.Z;
  });

  container.appendChild(makeBridgeCell(6, 3, "57–71", "lanthanoids"));
  container.appendChild(makeBridgeCell(7, 3, "89–103", "actinoids"));

  ordered.forEach((element) => {
    container.appendChild(makeElementCell(element));
  });
}

async function loadElements() {
  const response = await fetch("data/elements.json");
  if (!response.ok) {
    throw new Error(`Failed to load elements.json (${response.status})`);
  }

  const data = await response.json();
  if (!data.elements || !Array.isArray(data.elements)) {
    throw new Error("Invalid elements.json format");
  }

  return data.elements;
}

function registerServiceWorker() {
  const isSecureContextLike =
    location.protocol === "https:" || location.hostname === "localhost";

  if ("serviceWorker" in navigator && isSecureContextLike) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("./sw.js", { scope: "./" })
        .catch((err) => console.warn("Service Worker registration failed:", err));
    });
  }
}

function bindUI() {
  byId("calc").addEventListener("click", renderOut);
  byId("resetPreset").addEventListener("click", resetToSelectedElementPreset);
}

function renderDatasetError(err) {
  byId("selectedName").textContent = "Dataset loading failed";
  byId("selectedMeta").textContent = "The periodic table dataset could not be loaded.";
  byId("selectedNote").textContent = String(err.message || err);
  byId("quickSummary").textContent = "Dataset loading failed.";
  byId("quickExpanded").textContent =
    "The app could not load the element presets. Check data/elements.json and try again.";

  const out = byId("out");
  out.replaceChildren();
  out.appendChild(makeTagSpan("tag tag-risk", "Dataset error"));
}

async function init() {
  bindUI();
  registerServiceWorker();
  updateSelectedPanel(null);

  try {
    state.elements = await loadElements();
    renderPeriodicTable(state.elements);

    const iron = state.elements.find((el) => el.symbol === "Fe");
    if (iron) {
      selectElement(iron);
    } else {
      renderOut();
    }
  } catch (err) {
    console.error(err);
    renderDatasetError(err);
  }
}

document.addEventListener("DOMContentLoaded", init);
