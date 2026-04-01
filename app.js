// Pocket Corridor Table starter

const kB_eV_per_K = 8.617333262e-5;

function abs(x){ return Math.abs(x); }

function calc2x2(delta, V){
  const denom = Math.sqrt(delta*delta + 4*V*V);
  const R = abs(delta)/abs(V);
  const sin2phi = 0.5*(1 - delta/denom);
  const DeltaMix = denom;
  return {R, sin2phi, DeltaMix};
}

function classifyCRS(dop, R){
  if (dop >= 0.5 && R >= 5) return 0;
  if (dop >= 0.2 && R >= 2) return 1;
  if (dop >= 0.1 && R >= 1) return 2;
  return 3;
}

function fmt(x, n=4){
  if (!isFinite(x)) return "NaN";
  return Number(x).toFixed(n);
}

function renderOut(){
  const delta = Number(document.getElementById("delta").value);
  const V = Number(document.getElementById("V").value);
  const dop = Number(document.getElementById("dop").value);
  const T = Number(document.getElementById("T").value);

  const {R, sin2phi, DeltaMix} = calc2x2(delta, V);
  const CRS = classifyCRS(dop, R);
  const kBT = kB_eV_per
