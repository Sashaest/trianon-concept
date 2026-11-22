(function () {
"use strict";
const D = window.TRIANON;
const { GEN, SHOWS, HOUR } = D;

// ---------- utils ----------
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const MESI = ["gennaio","febbraio","marzo","aprile","maggio","giugno","luglio","agosto","settembre","ottobre","novembre","dicembre"];
const GG = ["domenica","lunedì","martedì","mercoledì","giovedì","venerdì","sabato"];
const parse = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const at = (s, h = HOUR) => { const d = parse(s); const [H, M] = h.split(":"); d.setHours(+H, +M); return d; };
const fmtDay = s => { const d = parse(s); return `${GG[d.getDay()].slice(0, 3)} ${d.getDate()} ${MESI[d.getMonth()].slice(0, 3)}`; };
const fmtLong = s => { const d = parse(s); return `${GG[d.getDay()]} ${d.getDate()} ${MESI[d.getMonth()]} ${d.getFullYear()}`; };
const range = sh => { const a = parse(sh.d[0]), b = parse(sh.d[sh.d.length - 1]);
  if (sh.d.length === 1) return `${a.getDate()} ${MESI[a.getMonth()]}`;
  if (a.getMonth() === b.getMonth()) return `${a.getDate()} – ${b.getDate()} ${MESI[a.getMonth()]}`;
  return `${a.getDate()} ${MESI[a.getMonth()].slice(0, 3)} – ${b.getDate()} ${MESI[b.getMonth()].slice(0, 3)}`; };
const now = () => new Date();
const isPast = sh => at(sh.d[sh.d.length - 1], "23:59") < now();
const upcoming = sh => sh.d.filter(d => at(d) > now());
const showById = id => SHOWS.find(s => s.id === id);
const euro = n => n.toLocaleString("it-IT", { style: "currency", currency: "EUR", minimumFractionDigits: n % 1 ? 2 : 0 });
const hash = str => { let h = 2166136261; for (const c of str) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const rng = seed => () => (seed = Math.imul(seed ^ (seed >>> 15), 2246822507) + 0x9e3779b9 >>> 0) / 4294967296;
const store = { get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
let favs = new Set(store.get("t2_favs", []));
let regs = store.get("t2_regs", []);
let tickets = store.get("t2_tickets", []);
const mailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 3000); }
function updCount() { $("#myCount").textContent = favs.size + regs.length + tickets.length; }
function nextPerf() { let b = null; SHOWS.forEach(s => s.d.forEach(d => { const t = at(d); if (t > now() && (!b || t < b.t)) b = { s, d, t }; })); return b; }
let timers = [];
const every = (fn, ms) => timers.push(setInterval(fn, ms));

// ---------- components ----------
const poster = (s, big) => `<div class="poster ${GEN[s.g][1]}"${big ? ' style="aspect-ratio:auto;min-height:100%"' : ""}><span class="pgen">${GEN[s.g][0]}</span><div class="ptitle">${esc(s.t)}</div><span class="photo-hint">spazio foto</span></div>`;
function card(s) {
  const p = isPast(s), f = favs.has(s.id);
  return `<a class="card ${p ? "past" : ""}" href="#/spettacolo/${s.id}">
    <button class="fav" data-fav="${s.id}" aria-pressed="${f}" aria-label="${f ? "Rimuovi dai" : "Aggiungi ai"} preferiti">${f ? "♥" : "♡"}</button>
    ${poster(s)}
    <div class="card-body"><div class="date">${range(s)}${s.d.length > 1 ? ` · ${s.d.length} repliche` : ""}</div><h3>${esc(s.t)}</h3><div class="who">${esc(s.w)}</div>
    <div class="card-foot">${p ? `<span class="note" style="margin:0">Concluso</span>` : `<span class="btn btn-primary btn-sm">Biglietti</span>`}<span class="muted" style="font-size:13px">Dettagli →</span></div></div></a>`;
}
const phead = (eyebrow, title, text, crumbs) => `<div class="phead maiolica"><div class="wrap">${crumbs ? `<div class="crumbs">${crumbs}</div>` : ""}<div class="eyebrow">${eyebrow}</div><h1>${title}</h1>${text ? `<p>${text}</p>` : ""}</div></div>`;
function newsCard(n, feat) { return `<a class="news ${feat ? "feat" : ""}" href="#/news/${n.s}"><div class="cat">${n.c}</div><h3>${esc(n.t)}</h3><p>${esc(n.p)}</p><span style="margin-top:auto;font-weight:600;font-size:14px">Leggi →</span></a>`; }
function expCard(x) {
  const done = regs.some(r => r.id === x.id), closed = x.left <= 0;
  return `<div class="exp-card"><div class="ico" aria-hidden="true">${x.ico}</div><h3>${esc(x.t)}</h3><p>${esc(x.p)}</p><div class="meta">${esc(x.m)}</div>
  ${closed ? `<div class="note" style="margin:0">Candidature chiuse</div>` : `<div class="note" style="margin:0">${x.left} posti disponibili su ${x.tot}</div><div class="posti"><i style="width:${100 - x.left / x.tot * 100}%"></i></div>`}
  <button class="btn ${done ? "btn-line" : "btn-primary"}" data-exp="${x.id}" ${closed ? "disabled" : ""}>${done ? "Iscritto ✓" : closed ? "Chiuso" : "Iscriviti"}</button></div>`;
}
function countdown(el, t) {
  const tick = () => { const ms = t - now(); if (ms < 0) return;
    const v = [[Math.floor(ms / 864e5), "giorni"], [Math.floor(ms / 36e5) % 24, "ore"], [Math.floor(ms / 6e4) % 60, "min"], [Math.floor(ms / 1e3) % 60, "sec"]];
    el.innerHTML = v.map(([n, l]) => `<div><b>${String(n).padStart(2, "0")}</b><small>${l}</small></div>`).join(""); };
  tick(); every(tick, 1000);
}
function drawQR(canvas, text) {
  const N = 25, c = canvas.getContext("2d"), r = rng(hash(text)); canvas.width = canvas.height = N;
  c.fillStyle = "#fff"; c.fillRect(0, 0, N, N); c.fillStyle = "#1b1414";
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (r() > .52) c.fillRect(x, y, 1, 1);
  [[0, 0], [N - 7, 0], [0, N - 7]].forEach(([x, y]) => { c.fillStyle = "#fff"; c.fillRect(x - (x ? 1 : 0), y - (y ? 1 : 0), 8, 8); c.fillStyle = "#1b1414"; c.fillRect(x, y, 7, 7); c.fillStyle = "#fff"; c.fillRect(x + 1, y + 1, 5, 5); c.fillStyle = "#1b1414"; c.fillRect(x + 2, y + 2, 3, 3); });
}

// ---------- pages ----------
const pages = {};

pages.home = () => {
  const n = nextPerf();
  const week = SHOWS.filter(s => !isPast(s)).slice(0, 8);
  const strip = SHOWS.filter(s => !isPast(s)).map(x => `<span>${esc(x.t)} ✦</span>`).join("");
  return `
  <div class="hero maiolica">
    <div class="sipario l" aria-hidden="true"></div><div class="sipario r" aria-hidden="true"></div>
    <div class="wrap hero-in" style="padding-left:22px;padding-right:22px">
      <div>
        <div class="eyebrow">Stagione 2026 | 2027 · Forcella, Napoli</div>
        <h1>Curre curre<br><em>guaglio'</em></h1>
        <p class="lead">Dal 1911 nel cuore di Forcella. Prosa, musica, danza e la grande canzone napoletana: la tradizione che si fa contemporanea, sera dopo sera.</p>
        <div class="cta-row"><a class="btn btn-oro" href="#/stagione">Scopri la stagione</a><a class="btn btn-ghost" href="#/biglietti">Acquista biglietti</a></div>
      </div>
      <div class="next-card">${n ? `<div class="eyebrow">Prossimo in scena · ${GEN[n.s.g][0]}</div><h3>${esc(n.s.t)}</h3><div style="opacity:.85">${esc(n.s.w)}</div>
        <div class="count" id="count"></div><div style="font-size:14px;opacity:.85;margin-bottom:16px">${fmtDay(n.d)} · ore ${HOUR}</div>
        <div class="cta-row" style="margin-top:0"><a class="btn btn-oro" href="#/biglietti?show=${n.s.id}&date=${n.d}">Prenota il tuo posto</a><a class="btn btn-ghost" href="#/spettacolo/${n.s.id}">Dettagli</a></div>`
        : `<h3>Nuovi titoli in arrivo</h3>`}</div>
    </div>
  </div>
  <div class="strip" aria-hidden="true"><div class="strip-in">${strip}${strip}</div></div>

  <section><div class="wrap">
    <div class="sec-head"><h2>In scena ora</h2><a class="link-more" href="#/stagione">Tutta la stagione →</a></div>
    <div class="hscroll">${week.map(card).join("")}</div>
  </div></section>

  <section style="background:#fff8ec"><div class="wrap quote">
    <div class="portrait" role="img" aria-label="Spazio per il ritratto del direttore artistico"><small>Ritratto · Pierpaolo Sepe</small></div>
    <div>
      <div class="eyebrow r">Direzione artistica</div>
      <p class="big-quote" style="margin:12px 0 16px">Un'identità che non è confine né nostalgia, ma memoria, trasformazione e creazione.</p>
      <p class="muted">Il tema della stagione 2026|2027 secondo il direttore artistico <b style="color:var(--inchiostro)">Pierpaolo Sepe</b>.</p>
      <div class="cta-row"><a class="btn btn-primary" href="#/direzione-artistica">Leggi le note</a><a class="btn btn-line" href="#/chi-siamo">Chi siamo</a></div>
    </div>
  </div></section>

  <section><div class="wrap duo">
    <div class="promo maiolica"><div class="eyebrow">Under 30 e formazione</div><div class="big">5€</div><h3>Il biglietto per chi studia</h3>
      <p>Per studenti universitari, allievi delle scuole di teatro, musica, danza e dell'Accademia di Belle Arti.</p>
      <div class="cta-row"><a class="btn btn-oro" href="#/biglietti">Acquista ridotto</a></div></div>
    <div class="promo blu"><div class="eyebrow">Abbonamenti</div><h3>Una stagione, il tuo posto</h3><p>Formule pensate per chi torna.</p>
      ${D.ABB.map(a => `<div class="abb"><div><b>${a.ico} ${a.n}</b><br><small>${a.d}</small></div><a class="btn btn-oro btn-sm" href="#/biglietti/abbonamenti">Scegli</a></div>`).join("")}</div>
  </div></section>

  <section style="background:var(--carta-2)"><div class="wrap">
    <div class="sec-head"><h2>Esperienze</h2><a class="link-more" href="#/esperienze">Tutte le esperienze →</a></div>
    <div class="exp-grid">${D.EXP.slice(0, 3).map(expCard).join("")}</div>
  </div></section>

  <section><div class="wrap">
    <div class="sec-head"><h2>News</h2><a class="link-more" href="#/news">Tutte le news →</a></div>
    <div class="news-grid">${D.NEWS.slice(0, 3).map((x, i) => newsCard(x, i === 0)).join("")}</div>
  </div></section>`;
};
pages.home.after = () => { const n = nextPerf(); if (n && $("#count")) countdown($("#count"), n.t); };

// --- stagione
let sv = { g: "all", past: false, q: "", view: "lista", mi: null, sel: null };
pages.stagione = () => `
  ${phead("Stagione 2026 | 2027", "La stagione", "Tradizione e scritture contemporanee, musica popolare e sinfonica, teatro civile e festa.", `<a href="#/">Home</a> / Stagione`)}
  <section><div class="wrap">
    <div class="toolbar">
      <div class="seg" role="group" aria-label="Vista"><button data-view="lista" aria-pressed="${sv.view === "lista"}">Lista</button><button data-view="calendario" aria-pressed="${sv.view === "calendario"}">Calendario</button></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><input class="search" id="q" type="search" placeholder="Cerca spettacolo o artista…" aria-label="Cerca" value="${esc(sv.q)}"><button class="chip" id="past" aria-pressed="${sv.past}">${sv.past ? "Nascondi passati" : "Mostra passati"}</button></div>
    </div>
    <div class="filters" id="gf" style="margin-bottom:24px">${[["all", "Tutti"], ...Object.entries(GEN).map(([k, v]) => [k, v[0]])].map(([k, l]) => `<button class="chip" data-g="${k}" aria-pressed="${sv.g === k}">${l}</button>`).join("")}</div>
    <div id="sv"></div>
  </div></section>`;
pages.stagione.after = () => {
  const render = () => {
    const list = SHOWS.filter(s => (sv.g === "all" || s.g === sv.g) && (sv.past || !isPast(s)) && (!sv.q || (s.t + " " + s.w).toLowerCase().includes(sv.q.toLowerCase())));
    if (sv.view === "lista") { $("#sv").innerHTML = `<div class="grid fade">${list.length ? list.map(card).join("") : `<div class="empty">Nessuno spettacolo trovato.</div>`}</div>`; }
    else renderCal(list);
  };
  const months = [[2026, 10], [2026, 11], [2027, 0]];
  if (sv.mi === null) { const t = now(); const i = months.findIndex(([y, m]) => y === t.getFullYear() && m === t.getMonth()); sv.mi = i < 0 ? 0 : i; }
  const key = (y, m, d) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  function renderCal(list) {
    const by = {}; list.forEach(s => s.d.forEach(d => (by[d] = by[d] || []).push(s)));
    const [y, m] = months[sv.mi], pref = `${y}-${String(m + 1).padStart(2, "0")}`;
    const t = now(), tk = key(t.getFullYear(), t.getMonth(), t.getDate());
    if (!sv.sel || !sv.sel.startsWith(pref) || !by[sv.sel]) { const ks = Object.keys(by).filter(k => k.startsWith(pref)).sort(); sv.sel = ks.find(k => k >= tk) || ks[0] || null; }
    const first = (new Date(y, m, 1).getDay() + 6) % 7, days = new Date(y, m + 1, 0).getDate();
    let g = ["L", "M", "M", "G", "V", "S", "D"].map(d => `<div class="dow">${d}</div>`).join("");
    for (let i = 0; i < first; i++) g += `<div class="day blank"></div>`;
    for (let d = 1; d <= days; d++) { const k = key(y, m, d), ev = by[k];
      g += `<button class="day ${ev ? "has" : ""} ${k === tk ? "today" : ""} ${k === sv.sel ? "sel" : ""}" ${ev ? `data-day="${k}" aria-label="${d} ${MESI[m]}: ${ev.length} spettacolo"` : `tabindex="-1" aria-hidden="true"`}>${d}${ev ? `<span class="dots">${ev.map(() => "<i></i>").join("")}</span>` : ""}</button>`; }
    const ev = sv.sel ? by[sv.sel] || [] : [];
    $("#sv").innerHTML = `<div class="cal-wrap fade"><div class="cal"><div class="cal-head"><button data-m="-1" ${sv.mi === 0 ? "disabled" : ""} aria-label="Mese precedente">‹</button><h3>${MESI[m]} ${y}</h3><button data-m="1" ${sv.mi === months.length - 1 ? "disabled" : ""} aria-label="Mese successivo">›</button></div><div class="cal-grid">${g}</div></div>
    <div class="day-list maiolica" aria-live="polite">${sv.sel ? `<div class="eyebrow">In scena</div><h4>${fmtLong(sv.sel)}</h4>${ev.map(s => `<div class="day-item"><div><b>${esc(s.t)}</b><small style="opacity:.8">${esc(s.w)} · ore ${HOUR}</small></div>${at(sv.sel) > now() ? `<a class="btn btn-oro btn-sm" href="#/biglietti?show=${s.id}&date=${sv.sel}">Prenota</a>` : `<a class="btn btn-ghost btn-sm" href="#/spettacolo/${s.id}">Dettagli</a>`}</div>`).join("")}` : `<h4>Nessuna data</h4><p>Nessuno spettacolo in questo mese con i filtri scelti.</p>`}</div></div>`;
  }
  $("#gf").onclick = e => { const b = e.target.closest("[data-g]"); if (!b) return; sv.g = b.dataset.g; $$("#gf .chip").forEach(c => c.setAttribute("aria-pressed", c === b)); render(); };
  $("#past").onclick = e => { sv.past = !sv.past; e.currentTarget.setAttribute("aria-pressed", sv.past); e.currentTarget.textContent = sv.past ? "Nascondi passati" : "Mostra passati"; render(); };
  $("#q").oninput = e => { sv.q = e.target.value.trim(); render(); };
  $$("[data-view]").forEach(b => b.onclick = () => { sv.view = b.dataset.view; $$("[data-view]").forEach(x => x.setAttribute("aria-pressed", x === b)); render(); });
  $("#sv").onclick = e => { const m = e.target.closest("[data-m]"); if (m) { sv.mi += +m.dataset.m; sv.sel = null; render(); return; }
    const d = e.target.closest("[data-day]"); if (d) { sv.sel = d.dataset.day; render(); } };
  render();
};

// --- spettacolo
pages.spettacolo = (id) => {
  const s = showById(id); if (!s) return pages.notfound();
  const up = upcoming(s), related = SHOWS.filter(x => x.g === s.g && x.id !== s.id && !isPast(x)).slice(0, 3);
  return `
  <div class="show-hero ${GEN[s.g][1]}" style="color:#fff;position:relative">
    <div class="wrap"><div class="crumbs"><a href="#/">Home</a> / <a href="#/stagione">Stagione</a> / ${esc(s.t)}</div>
      <span class="pgen">${GEN[s.g][0]}</span><h1>${esc(s.t)}</h1><p style="font-size:18px;opacity:.9">${esc(s.w)}</p>
      <p style="margin-top:6px;font-weight:600;color:var(--oro-2)">${range(s)} · ${s.d.length} ${s.d.length > 1 ? "repliche" : "replica"}</p></div>
  </div>
  <section><div class="wrap show-grid">
    <div>
      <div class="facts"><div><b>Genere</b>${GEN[s.g][0]}</div><div><b>Orario</b>ore ${HOUR}*</div><div><b>Durata</b>da comunicare</div><div><b>Luogo</b>Sala grande</div></div>
      <div class="prose"><h3 style="margin-top:0">Lo spettacolo</h3>
        <div class="slot">Spazio per la sinossi, le note di regia e la locandina ufficiale, gestiti dal teatro tramite CMS.</div>
        <h3>Crediti</h3><p>${esc(s.w)}</p>
        <h3>Galleria e video</h3><div class="slot">Foto di scena e trailer dalla Web TV del Trianon (Vimeo / YouTube).</div>
      </div>
      <p class="note">* Orario indicativo nella demo.</p>
    </div>
    <aside class="panel sticky">
      <h3>Biglietti</h3>
      ${up.length ? `<p class="muted" style="font-size:14px">Scegli una data per continuare</p>
      <div class="dates" id="sd">${s.d.map(d => `<button data-d="${d}" ${at(d) < now() ? "disabled" : ""} aria-pressed="${d === up[0]}"><b>${fmtDay(d)}</b><br><small>ore ${HOUR}</small></button>`).join("")}</div>
      <a class="btn btn-primary" style="width:100%" id="goBuy" href="#/biglietti?show=${s.id}&date=${up[0]}">Scegli i posti</a>
      <p class="note">Studenti e allievi: <b>5€</b>. Riduzioni e abbonamenti nella pagina Biglietti.</p>`
      : `<p class="muted">Spettacolo concluso.</p>`}
      <div class="cta-row" style="margin-top:16px">
        <button class="btn btn-line btn-sm" id="ics">📅 Calendario</button>
        <button class="btn btn-line btn-sm" id="share">↗ Condividi</button>
        <button class="btn btn-line btn-sm" data-fav="${s.id}" aria-pressed="${favs.has(s.id)}">${favs.has(s.id) ? "♥ Salvato" : "♡ Salva"}</button>
      </div>
    </aside>
  </div></section>
  ${related.length ? `<section style="padding-top:0"><div class="wrap"><div class="sec-head"><h2>Potrebbe piacerti</h2></div><div class="grid">${related.map(card).join("")}</div></div></section>` : ""}`;
};
pages.spettacolo.after = (id) => {
  const s = showById(id); if (!s) return; let chosen = upcoming(s)[0] || s.d[0];
  const sd = $("#sd"); if (sd) sd.onclick = e => { const b = e.target.closest("[data-d]"); if (!b || b.disabled) return; chosen = b.dataset.d; $$("#sd button").forEach(x => x.setAttribute("aria-pressed", x === b)); $("#goBuy").href = `#/biglietti?show=${s.id}&date=${chosen}`; };
  $("#ics").onclick = () => ics(s, chosen);
  $("#share").onclick = () => share(`${s.t} al Trianon Viviani · ${range(s)}`);
};
function ics(s, d) {
  const st = at(d), en = new Date(st.getTime() + 2 * 36e5);
  const f = x => x.getFullYear() + String(x.getMonth() + 1).padStart(2, "0") + String(x.getDate()).padStart(2, "0") + "T" + String(x.getHours()).padStart(2, "0") + String(x.getMinutes()).padStart(2, "0") + "00";
  const txt = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Trianon Concept//IT", "BEGIN:VEVENT", `UID:${s.id}-${d}@trianon-concept`, `DTSTAMP:${f(new Date())}`, `DTSTART;TZID=Europe/Rome:${f(st)}`, `DTEND;TZID=Europe/Rome:${f(en)}`, `SUMMARY:${s.t} – Teatro Trianon Viviani`, `DESCRIPTION:${s.w}`, "LOCATION:Teatro Trianon Viviani\\, Piazza Vincenzo Calenda 9\\, Napoli", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([txt], { type: "text/calendar" })); a.download = `trianon-${s.id}-${d}.ics`; document.body.appendChild(a); a.click(); a.remove(); toast("Evento scaricato per il calendario");
}
async function share(text) {
  try { if (navigator.share) { await navigator.share({ title: "Trianon Viviani", text, url: location.href }); return; } } catch (e) { return; }
  try { await navigator.clipboard.writeText(text + " — " + location.href); toast("Link copiato"); } catch (e) { toast(text); }
}

// --- biglietti
let bk = null;
function newBk(q) {
  const s = q.show && showById(q.show) && upcoming(showById(q.show)).length ? q.show : null;
  const d = s && q.date && upcoming(showById(s)).includes(q.date) ? q.date : null;
  return { show: s, date: d, settore: "platea", n: { intero: 0, ridotto: 0, studenti: 0 }, seats: [], step: s ? (d ? 3 : 2) : 1, buyer: {} };
}
pages.biglietti = (sub, q) => {
  if (sub === "abbonamenti") return pages.abbonamenti();
  bk = newBk(q);
  return `${phead("Botteghino online", "Biglietti", "Spettacolo, data, posti, pagamento: quattro passi, biglietto con QR sul telefono.", `<a href="#/">Home</a> / Biglietti`)}
  <section><div class="wrap">
    <div class="toolbar"><div class="seg"><button aria-pressed="true">Biglietti singoli</button><button onclick="location.hash='#/biglietti/abbonamenti'" aria-pressed="false">Abbonamenti</button></div></div>
    <ol class="steps" id="steps"></ol>
    <div class="book"><div id="bstep"></div><aside id="bsum"></aside></div>
  </div></section>`;
};
const TOT = () => bk.n.intero + bk.n.ridotto + bk.n.studenti;
function price() { const S = D.SETTORI.find(x => x.id === bk.settore); return bk.n.intero * S.intero + bk.n.ridotto * S.ridotto + bk.n.studenti * D.STUDENTI; }
function seatLayout(settore) { return settore === "platea" ? { rows: "ABCDEFGHIL".split(""), cols: 14 } : { rows: "ABCDE".split(""), cols: 12 }; }
function taken(settore) { const r = rng(hash(bk.show + bk.date + settore)), L = seatLayout(settore), set = new Set(); L.rows.forEach(row => { for (let c = 1; c <= L.cols; c++) if (r() < .38) set.add(row + c); }); return set; }
function renderBk() {
  const names = ["Spettacolo", "Data", "Posti", "Pagamento"];
  $("#steps").innerHTML = names.map((n, i) => `<li class="${bk.step === i + 1 ? "on" : bk.step > i + 1 ? "done" : ""}"><b>${bk.step > i + 1 ? "✓" : i + 1}</b>${n}</li>`).join("");
  const s = bk.show && showById(bk.show), box = $("#bstep");
  if (bk.step === 1) {
    box.innerHTML = `<div class="fade"><h3 class="serif" style="font-size:30px;color:var(--rosso);margin-bottom:12px">Scegli lo spettacolo</h3><div class="pick" id="pk">${SHOWS.filter(x => upcoming(x).length).map(x => `<button data-s="${x.id}" aria-pressed="${bk.show === x.id}"><small>${GEN[x.g][0]} · ${range(x)}</small><b>${esc(x.t)}</b><small>${esc(x.w)}</small></button>`).join("")}</div></div>`;
    $("#pk").onclick = e => { const b = e.target.closest("[data-s]"); if (!b) return; bk.show = b.dataset.s; bk.date = null; bk.seats = []; bk.step = 2; renderBk(); };
  } else if (bk.step === 2) {
    box.innerHTML = `<div class="fade"><h3 class="serif" style="font-size:30px;color:var(--rosso)">Scegli la data</h3><p class="muted">${esc(s.t)}</p><div class="pick" id="pd" style="margin-top:14px">${upcoming(s).map(d => `<button data-d="${d}" aria-pressed="${bk.date === d}"><small>ore ${HOUR}</small><b style="text-transform:capitalize">${fmtLong(d)}</b><small>${["Buona disponibilità", "Ultimi posti in platea", "Disponibile"][hash(d + s.id) % 3]}</small></button>`).join("")}</div>
      <button class="btn btn-line btn-sm" style="margin-top:18px" data-back>← Cambia spettacolo</button></div>`;
    $("#pd").onclick = e => { const b = e.target.closest("[data-d]"); if (!b) return; bk.date = b.dataset.d; bk.seats = []; bk.step = 3; renderBk(); };
  } else if (bk.step === 3) {
    const L = seatLayout(bk.settore), tk = taken(bk.settore), S = D.SETTORI.find(x => x.id === bk.settore);
    box.innerHTML = `<div class="fade">
      <h3 class="serif" style="font-size:30px;color:var(--rosso)">Biglietti e posti</h3><p class="muted" style="text-transform:capitalize">${esc(s.t)} · ${fmtLong(bk.date)}</p>
      <div class="seg" style="margin:16px 0" id="setSeg">${D.SETTORI.map(x => `<button data-set="${x.id}" aria-pressed="${bk.settore === x.id}">${x.n}</button>`).join("")}</div>
      <div class="panel" style="padding:18px 22px;margin-bottom:18px">
        ${[["intero", "Intero", "", S.intero], ["ridotto", "Ridotto", "Over 65 e under 26", S.ridotto], ["studenti", "Studenti e allievi", "Università, scuole di teatro, musica, danza, Accademia di Belle Arti · tesserino all'ingresso", D.STUDENTI]].map(([k, n, sub, p]) =>
          `<div class="tier"><div><b>${n}</b> · ${euro(p)}<small>${sub}</small></div><div class="qty"><button data-q="${k}" data-v="-1" aria-label="Meno ${n}">−</button><b>${bk.n[k]}</b><button data-q="${k}" data-v="1" aria-label="Più ${n}">+</button></div></div>`).join("")}
        <p class="note" style="margin-top:6px">Prezzi intero/ridotto di esempio · tariffa studenti 5€ come da comunicazione del teatro.</p>
      </div>
      <div class="panel">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px"><b>Scegli ${TOT() || ""} ${TOT() === 1 ? "posto" : "posti"} · ${S.n}</b><button class="btn btn-line btn-sm" id="auto" ${TOT() ? "" : "disabled"}>Scegli per me</button></div>
        <div class="stage">Palcoscenico</div>
        <div class="seat-wrap"><div class="seatmap" id="map">${L.rows.map(r => `<div class="seatrow"><span>${r}</span>${Array.from({ length: L.cols }, (_, i) => { const id = r + (i + 1); const t = tk.has(id), m = bk.seats.includes(id); return `<button class="seat ${t ? "taken" : ""} ${m ? "mine" : ""}" data-seat="${id}" ${t ? "disabled" : ""} aria-label="Fila ${r} posto ${i + 1}${t ? ", occupato" : m ? ", selezionato" : ""}" aria-pressed="${m}"></button>${i + 1 === L.cols / 2 ? '<span></span>' : ""}`; }).join("")}<span>${r}</span></div>`).join("")}</div></div>
        <div class="seat-legend"><span><i style="background:#d9cdb6"></i>Libero</span><span><i style="background:var(--rosso)"></i>Tuo</span><span><i style="background:#8c8279;opacity:.55"></i>Occupato</span></div>
      </div>
      <div class="cta-row"><button class="btn btn-line btn-sm" data-back>← Cambia data</button></div></div>`;
    $("#setSeg").onclick = e => { const b = e.target.closest("[data-set]"); if (!b) return; bk.settore = b.dataset.set; bk.seats = []; renderBk(); };
    box.querySelectorAll("[data-q]").forEach(b => b.onclick = () => { const k = b.dataset.q; bk.n[k] = Math.max(0, Math.min(8, bk.n[k] + +b.dataset.v)); if (TOT() > 10) bk.n[k]--; bk.seats = bk.seats.slice(0, TOT()); renderBk(); });
    $("#map").onclick = e => { const b = e.target.closest("[data-seat]"); if (!b || b.disabled) return; const id = b.dataset.seat;
      if (bk.seats.includes(id)) bk.seats = bk.seats.filter(x => x !== id);
      else { if (!TOT()) { bk.n.intero = 1; } if (bk.seats.length >= TOT()) { toast(`Hai già scelto ${TOT()} posti: aumenta i biglietti o deselezionane uno`); return; } bk.seats.push(id); }
      renderBk(); };
    $("#auto").onclick = () => { const L2 = seatLayout(bk.settore), t2 = taken(bk.settore), need = TOT(); bk.seats = [];
      const order = [...L2.rows.slice(2), ...L2.rows.slice(0, 2)];
      const center = (L2.cols + 1) / 2;
      for (const r of order) { let best = null;
        for (let st = 1; st + need - 1 <= L2.cols; st++) { const run = Array.from({ length: need }, (_, i) => r + (st + i));
          if (run.some(id => t2.has(id))) continue; const sc = Math.abs(st + (need - 1) / 2 - center); if (!best || sc < best.sc) best = { run, sc }; }
        if (best) { bk.seats = best.run; break; } }
      if (!bk.seats.length) toast("Non ci sono abbastanza posti vicini, scegli manualmente"); renderBk(); };
  } else if (bk.step === 4) {
    box.innerHTML = `<div class="fade"><h3 class="serif" style="font-size:30px;color:var(--rosso)">I tuoi dati</h3><p class="muted">Il biglietto arriva via email e nella sezione Il mio Trianon.</p>
      <form id="buyF" novalidate class="panel" style="margin-top:14px">
        <div class="row2"><div class="field"><label for="bN">Nome e cognome *</label><input id="bN" autocomplete="name" value="${esc(bk.buyer.n || "")}"><div class="err"></div></div>
        <div class="field"><label for="bM">Email *</label><input id="bM" type="email" autocomplete="email" value="${esc(bk.buyer.m || "")}"><div class="err"></div></div></div>
        <div class="field"><label>Pagamento</label><div class="seg" id="pay"><button type="button" aria-pressed="true">Carta</button><button type="button" aria-pressed="false">Apple / Google Pay</button><button type="button" aria-pressed="false">PayPal</button></div></div>
        <label class="consent"><input type="checkbox" id="bC"> <span>Accetto le condizioni di vendita e l'informativa privacy.</span></label><div class="err" id="bCe"></div>
        <p class="note">Demo: nessun pagamento reale. Nella versione finale il checkout si collega al circuito di biglietteria del teatro.</p>
      </form><div class="cta-row"><button class="btn btn-line btn-sm" data-back>← Modifica posti</button></div></div>`;
    $("#pay").onclick = e => { const b = e.target.closest("button"); if (!b) return; $$("#pay button").forEach(x => x.setAttribute("aria-pressed", x === b)); };
  } else if (bk.step === 5) {
    const t = tickets[tickets.length - 1];
    box.innerHTML = `<div class="panel success fade"><div class="ok">🎟️</div><h3 class="serif" style="font-size:38px;color:var(--rosso)">Ci vediamo a teatro!</h3>
      <p>${t.q} ${t.q > 1 ? "biglietti" : "biglietto"} per <b>${esc(s.t)}</b><br><span style="text-transform:capitalize">${fmtLong(bk.date)}</span> · ore ${HOUR}<br>${t.settore} · ${t.seats.join(", ")}</p>
      <div class="cta-row" style="justify-content:center"><a class="btn btn-primary" href="#/mio">Vedi il biglietto</a><button class="btn btn-line" id="ics2">📅 Aggiungi al calendario</button></div>
      <p class="note">Simulazione: nessun addebito effettuato.</p></div>`;
    $("#ics2").onclick = () => ics(s, bk.date);
  }
  // summary
  const S = D.SETTORI.find(x => x.id === bk.settore);
  const canNext = bk.step === 3 ? TOT() > 0 && bk.seats.length === TOT() : bk.step === 4;
  $("#bsum").innerHTML = bk.step === 5 ? "" : `<div class="summary sticky"><h3>Riepilogo</h3>
    <div class="sum-row"><span>Spettacolo</span><b style="text-align:right">${s ? esc(s.t) : "—"}</b></div>
    <div class="sum-row"><span>Data</span><b style="text-transform:capitalize">${bk.date ? fmtDay(bk.date) + " · " + HOUR : "—"}</b></div>
    ${bk.step >= 3 ? `<div class="sum-row"><span>Settore</span><b>${S.n}</b></div>
    ${bk.n.intero ? `<div class="sum-row"><span>${bk.n.intero} × Intero</span><span>${euro(bk.n.intero * S.intero)}</span></div>` : ""}
    ${bk.n.ridotto ? `<div class="sum-row"><span>${bk.n.ridotto} × Ridotto</span><span>${euro(bk.n.ridotto * S.ridotto)}</span></div>` : ""}
    ${bk.n.studenti ? `<div class="sum-row"><span>${bk.n.studenti} × Studenti</span><span>${euro(bk.n.studenti * D.STUDENTI)}</span></div>` : ""}
    <div class="sum-row"><span>Posti</span><b>${bk.seats.length ? bk.seats.join(", ") : "—"}</b></div>` : ""}
    <div class="sum-tot"><span>Totale</span><span>${bk.step >= 3 ? euro(price()) : "—"}</span></div>
    ${bk.step >= 3 ? `<button class="btn btn-oro" style="width:100%" id="next" ${canNext ? "" : "disabled"}>${bk.step === 4 ? `Paga ${euro(price())}` : "Continua"}</button>
    ${bk.step === 3 && !canNext ? `<p class="note">${TOT() ? `Seleziona ${TOT() - bk.seats.length} ${TOT() - bk.seats.length === 1 ? "posto" : "posti"} sulla mappa` : "Aggiungi almeno un biglietto"}</p>` : ""}` : `<p class="note">Completa i passaggi a sinistra.</p>`}
  </div>`;
  const nx = $("#next"); if (nx) nx.onclick = () => {
    if (bk.step === 3) { bk.step = 4; renderBk(); scrollTo({ top: 0 }); return; }
    const n = $("#bN"), m = $("#bM"); let ok = true;
    const set = (el, msg) => { el.setAttribute("aria-invalid", !!msg); el.nextElementSibling.textContent = msg || ""; if (msg) ok = false; };
    set(n, n.value.trim().length < 3 ? "Inserisci nome e cognome" : ""); set(m, mailOk(m.value) ? "" : "Email non valida");
    $("#bCe").textContent = $("#bC").checked ? "" : "Serve l'accettazione per procedere"; if (!$("#bC").checked) ok = false;
    if (!ok) return;
    bk.buyer = { n: n.value.trim(), m: m.value.trim() };
    tickets.push({ code: "TRV-" + (hash(bk.show + bk.date + bk.seats.join() + Date.now()) % 1e6).toString().padStart(6, "0"), show: bk.show, date: bk.date, settore: S.n, seats: [...bk.seats], q: TOT(), tot: price(), n: bk.buyer.n });
    store.set("t2_tickets", tickets); updCount(); bk.step = 5; renderBk(); scrollTo({ top: 0 });
  };
  $$("[data-back]", box).forEach(b => b.onclick = () => { bk.step = Math.max(1, bk.step - 1); renderBk(); });
}
pages.biglietti.after = (sub) => { if (sub === "abbonamenti") return; renderBk(); };

pages.abbonamenti = () => `${phead("Botteghino online", "Abbonamenti", "Una stagione, il tuo posto. Scegli la formula, il turno e rinnova ogni anno con un tocco.", `<a href="#/">Home</a> / <a href="#/biglietti">Biglietti</a> / Abbonamenti`)}
  <section><div class="wrap">
    <div class="toolbar"><div class="seg"><button onclick="location.hash='#/biglietti'" aria-pressed="false">Biglietti singoli</button><button aria-pressed="true">Abbonamenti</button></div></div>
    <div class="tiles">${D.ABB.map(a => `<div class="tile"><span style="font-size:34px">${a.ico}</span><b>${a.n}</b><span>${a.d}</span><div class="slot" style="margin:10px 0;padding:14px">Prezzi e turni dal listino ufficiale</div><button class="btn btn-primary btn-sm" data-abb="${a.n}" style="align-self:flex-start">Richiedi</button></div>`).join("")}</div>
    <div class="panel" style="margin-top:26px"><h3>Perché online</h3><ul style="padding-left:18px;display:grid;gap:6px"><li>Biglietti e abbonamenti in un unico checkout, oggi divisi su due piattaforme diverse</li><li>Abbonamento digitale nel telefono, con cambio data in autonomia</li><li>Rinnovo con prelazione sul proprio posto</li></ul></div>
  </div></section>`;

// --- news
pages.news = (slug) => {
  if (slug === "bandi") return `${phead("Fondazione", "Bandi e avvisi", "Avvisi pubblici, selezioni e documenti della Fondazione Trianon Viviani, separati dalla programmazione.", `<a href="#/">Home</a> / <a href="#/news">News</a> / Bandi`)}
    <section><div class="wrap"><div class="bandi"><h4>Avvisi aperti</h4><ul>${D.BANDI.map(b => `<li>${esc(b.t)} <span>Scadenza ${esc(b.s)}</span></li>`).join("")}</ul></div>
    <p class="note">Le candidature si inviano via PEC a trianon@pec.teatrotrianon.org.</p></div></section>`;
  if (slug) { const n = D.NEWS.find(x => x.s === slug); if (!n) return pages.notfound();
    const rel = n.rel.map(showById).filter(Boolean);
    return `${phead(n.c, esc(n.t), "", `<a href="#/">Home</a> / <a href="#/news">News</a> / ${n.c}`)}
    <section><div class="wrap article"><p style="font-size:21px" class="serif">${esc(n.p)}</p>
      <div class="slot" style="margin:20px 0">Testo completo dell'articolo, foto e video dalla Web TV, gestiti dall'ufficio comunicazione tramite CMS.</div>
      <div class="cta-row"><button class="btn btn-line btn-sm" id="shareN">↗ Condividi</button><a class="btn btn-line btn-sm" href="#/news">← Tutte le news</a></div>
      ${rel.length ? `<h3 class="serif" style="font-size:30px;color:var(--rosso);margin:36px 0 14px">Spettacoli citati</h3><div class="grid">${rel.map(card).join("")}</div>` : ""}
    </div></section>`; }
  const cats = ["Tutte", ...new Set(D.NEWS.map(n => n.c))];
  return `${phead("Dal teatro", "News", "Novità sulla stagione, produzioni, musica e vita della Fondazione.", `<a href="#/">Home</a> / News`)}
  <section><div class="wrap">
    <div class="filters" id="nf" style="margin-bottom:24px">${cats.map(c => `<button class="chip" data-c="${c}" aria-pressed="${c === "Tutte"}">${c}</button>`).join("")}</div>
    <div class="news-grid" id="ng"></div>
    <div class="bandi" style="margin-top:30px"><h4>Bandi e avvisi pubblici</h4><ul>${D.BANDI.map(b => `<li>${esc(b.t)} <span>Scadenza ${esc(b.s)}</span></li>`).join("")}</ul><a class="link-more" href="#/news/bandi">Archivio bandi →</a></div>
  </div></section>`;
};
pages.news.after = (slug) => {
  if (slug && slug !== "bandi") { const b = $("#shareN"); if (b) b.onclick = () => share(document.title); return; }
  if (slug) return;
  const r = c => { const l = D.NEWS.filter(n => c === "Tutte" || n.c === c); $("#ng").innerHTML = l.map((n, i) => newsCard(n, i === 0)).join(""); };
  $("#nf").onclick = e => { const b = e.target.closest("[data-c]"); if (!b) return; $$("#nf .chip").forEach(c => c.setAttribute("aria-pressed", c === b)); r(b.dataset.c); };
  r("Tutte");
};

// --- esperienze
pages.esperienze = () => `${phead("Oltre il sipario", "Esperienze", "Visite, prove aperte, incontri e laboratori. Iscriviti in un minuto, ricevi conferma via email.", `<a href="#/">Home</a> / Esperienze`)}
  <section><div class="wrap"><div class="exp-grid" id="eg">${D.EXP.map(expCard).join("")}</div></div></section>`;

// --- chi siamo
pages["chi-siamo"] = () => `${phead("Fondazione Trianon Viviani", "Chi siamo", "Il teatro della canzone napoletana: valorizzarla come bene culturale della città, unendo tradizione e contemporaneità.", `<a href="#/">Home</a> / Chi siamo`)}
  <section><div class="wrap">
    <div class="tiles">
      <a class="tile" href="#/direzione-artistica"><span class="eyebrow r">Direzione artistica</span><b>Pierpaolo Sepe</b><span>Visione e linee della stagione 2026|2027</span></a>
      <div class="tile"><span class="eyebrow r">Presidenza</span><b>Clementina Chieffo</b><span>Presidente della Fondazione</span></div>
      <div class="tile"><span class="eyebrow r">Ente</span><b>Fondazione</b><span>Sotto il controllo e la vigilanza della Regione Campania, socio fondatore</span></div>
      <a class="tile" href="#/chi-siamo/torre"><span class="eyebrow r">Patrimonio</span><b>Torre della Sirena</b><span>L'ultima torre di guardia di Neapolis</span></a>
    </div>
  </div></section>
  <section class="maiolica"><div class="wrap">
    <div class="sec-head"><h2 style="color:var(--oro-2)">La nostra storia</h2><p style="opacity:.85;max-width:480px">Più di un secolo nel centro antico, patrimonio Unesco.</p></div>
    <div class="timeline">
      <div class="tl"><b>1911</b><p>L'8 novembre il sipario si apre con <em>Miseria e Nobiltà</em> di Eduardo Scarpetta.</p></div>
      <div class="tl"><b>Cinema</b><p>Gli anni della sala cinematografica, poi la chiusura e il restauro.</p></div>
      <div class="tl"><b>2002</b><p>Il 7 dicembre il teatro riapre, restituito alla città.</p></div>
      <div class="tl"><b>2006</b><p>Viene intitolato a Raffaele Viviani.</p></div>
      <div class="tl"><b>2026</b><p>Nuova direzione artistica di Pierpaolo Sepe.</p></div>
    </div>
  </div></section>
  <section id="torre"><div class="wrap duo" style="align-items:center">
    <svg viewBox="0 0 300 320" role="img" aria-label="Illustrazione della Torre della Sirena" style="max-width:340px;justify-self:center">
      <defs><linearGradient id="tg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#e6c97a"/><stop offset="1" stop-color="#8f6d2a"/></linearGradient></defs>
      <circle cx="150" cy="140" r="120" fill="#c9a24a" opacity=".15"/><rect x="95" y="80" width="110" height="220" rx="6" fill="url(#tg)"/>
      <g fill="#5a0d17" opacity=".55"><rect x="95" y="110" width="110" height="3"/><rect x="95" y="150" width="110" height="3"/><rect x="95" y="190" width="110" height="3"/><rect x="95" y="230" width="110" height="3"/><rect x="95" y="270" width="110" height="3"/><rect x="140" y="125" width="20" height="25" rx="10"/></g>
      <g fill="url(#tg)"><rect x="88" y="62" width="22" height="24"/><rect x="122" y="62" width="22" height="24"/><rect x="156" y="62" width="22" height="24"/><rect x="190" y="62" width="22" height="24"/></g>
      <path d="M150 26 c18 10 26 4 34 -6 c-4 18 -20 26 -34 22 c-14 4 -30 -4 -34 -22 c8 10 16 16 34 6z" fill="#c9a24a"/><rect x="40" y="300" width="220" height="6" rx="3" fill="#c9a24a"/>
    </svg>
    <div class="prose"><div class="eyebrow r">Dentro il teatro</div><h3 style="font-size:46px;margin-top:6px">La Torre della Sirena</h3>
      <p>L'unica torre di guardia ancora esistente della Neapolis greco-romana vive dentro le mura del Trianon, inglobata nell'edificio dal suo primo proprietario. Il nome richiama Parthenope, il mito che fonda la città.</p>
      <button class="btn btn-primary" data-exp="torre">Prenota una visita</button></div>
  </div></section>
  <section style="padding-top:0"><div class="wrap"><div class="tiles">
    <a class="tile" href="#/visita"><b>Fitto sala ed eventi</b><span>La sala per produzioni, convegni ed eventi privati</span></a>
    <a class="tile" href="#/visita"><b>Scheda tecnica</b><span>Palcoscenico, luci, audio, accessi</span></a>
    <a class="tile" href="#/news/bandi"><b>Amministrazione trasparente</b><span>Bandi, avvisi e documenti</span></a>
  </div></div></section>`;
pages["chi-siamo"].after = (sub) => { if (sub === "torre") setTimeout(() => $("#torre") && $("#torre").scrollIntoView(), 50); };

pages["direzione-artistica"] = () => `${phead("Direzione artistica", "Pierpaolo Sepe", "Le note del direttore artistico sulla stagione 2026|2027.", `<a href="#/">Home</a> / <a href="#/chi-siamo">Chi siamo</a> / Direzione artistica`)}
  <section><div class="wrap quote" style="align-items:start">
    <div class="portrait" role="img" aria-label="Spazio per il ritratto del direttore artistico"><small>Ritratto ufficiale</small></div>
    <div class="prose">
      <p class="big-quote" style="margin-bottom:22px">Il teatro come scelta di sguardo, non come calendario di spettacoli.</p>
      <h3>Uno spazio di incontro</h3><p>Il Trianon Viviani come luogo dove le differenze convivono senza chiudersi in recinti identitari, e dove una comunità cresce imparando ad ascoltarsi.</p>
      <h3>Il tema: identità</h3><p>Non confine, nostalgia o ripetizione, ma memoria, trasformazione e creazione.</p>
      <h3>Forcella, un porto</h3><p>Un quartiere di incontri e cambiamenti che ispira la natura aperta del teatro. Chi lo dirige ne è custode per un tratto di strada.</p>
      <h3>Le linee della stagione</h3><p>Tradizione e scritture contemporanee, musica popolare e sinfonica, teatro civile e festa, danza, parola e corpo: una tradizione viva perché continua a interrogarsi.</p>
      <h3>La dedica</h3><p>La stagione è dedicata a Gennaro Capuozzo, Gennarino, la cui immagine accompagna il manifesto.</p>
      <p class="note">Sintesi redatta per il concept: nella versione finale il testo integrale delle note.</p>
      <a class="btn btn-primary" href="#/stagione">Esplora la stagione</a>
    </div>
  </div></section>`;

// --- visita
pages.visita = () => `${phead("Vieni a teatro", "Visita", "Dove siamo, come arrivare, botteghino e contatti.", `<a href="#/">Home</a> / Visita`)}
  <section><div class="wrap">
    <div class="tiles">
      <div class="tile"><b>Dove siamo</b><span>Piazza Vincenzo Calenda, 9<br>80139 Napoli · Forcella, centro antico</span><a class="btn btn-line btn-sm" style="align-self:flex-start;margin-top:8px" href="https://maps.google.com/?q=Teatro+Trianon+Viviani+Napoli" target="_blank" rel="noopener">Apri in Maps</a></div>
      <div class="tile"><b>Botteghino</b><ul class="hours">${D.BOTTEGHINO.map(([g, h]) => `<li><span>${g}</span><b style="font-family:var(--sans);font-size:14px;color:var(--inchiostro)">${h}</b></li>`).join("")}</ul></div>
      <div class="tile"><b>Contatti</b><span>📞 <a href="tel:+390810128663">+39 081 0128663</a> (anche WhatsApp)<br>📞 <a href="tel:+390810124472">+39 081 0124472</a><br>✉️ <a href="mailto:trianon@teatrotrianon.org">trianon@teatrotrianon.org</a><br>PEC trianon@pec.teatrotrianon.org</span></div>
      <div class="tile"><b>Prima di venire</b><span>♿ Accessibilità e posti riservati<br>🚇 Metro: Garibaldi, Duomo<br>🅿️ Parcheggi in zona<br>🍷 Foyer e bar</span></div>
    </div>
  </div></section>`;

// --- il mio trianon
pages.mio = () => {
  const f = SHOWS.filter(s => favs.has(s.id));
  return `${phead("Area personale", "Il mio Trianon", "I tuoi biglietti, gli spettacoli salvati e le iscrizioni. Nella versione reale: accesso con email o account Google/Apple.", `<a href="#/">Home</a> / Il mio Trianon`)}
  <section><div class="wrap">
    <div class="sec-head"><h2>I miei biglietti</h2></div>
    ${tickets.length ? `<div class="wallet">${tickets.slice().reverse().map(t => { const s = showById(t.show); return `<div class="tk"><div class="tk-top ${GEN[s.g][1]}"><small style="opacity:.8;text-transform:capitalize">${fmtLong(t.date)} · ${HOUR}</small><b>${esc(s.t)}</b></div>
      <div class="tk-body"><div><small class="muted">${t.settore}</small><br><b>${t.seats.join(", ")}</b><br><small class="muted">${t.q} ${t.q > 1 ? "persone" : "persona"} · ${euro(t.tot)}</small><br><small class="muted">${t.code}</small></div><canvas data-qr="${t.code}" aria-label="Codice QR del biglietto"></canvas></div></div>`; }).join("")}</div>`
      : `<div class="slot">Nessun biglietto ancora. <a href="#/biglietti" style="color:var(--rosso);font-weight:600">Acquista il primo →</a></div>`}
    <div class="sec-head" style="margin-top:50px"><h2>Salvati</h2></div>
    ${f.length ? `<div class="grid">${f.map(card).join("")}</div>` : `<div class="slot">Tocca ♡ su uno spettacolo per salvarlo qui.</div>`}
    <div class="sec-head" style="margin-top:50px"><h2>Iscrizioni</h2></div>
    ${regs.length ? `<div style="display:grid;gap:10px">${regs.map(r => `<div class="mini"><div><b>${esc(r.t)}</b><small>${esc(r.n)} · ${r.q} ${r.q > 1 ? "persone" : "persona"}</small></div><span>✅</span></div>`).join("")}</div>` : `<div class="slot">Nessuna iscrizione. <a href="#/esperienze" style="color:var(--rosso);font-weight:600">Scopri le esperienze →</a></div>`}
    ${tickets.length + regs.length + favs.size ? `<button class="btn btn-line btn-sm" id="reset" style="margin-top:30px">Azzera dati demo</button>` : ""}
  </div></section>`;
};
pages.mio.after = () => { $$("canvas[data-qr]").forEach(c => drawQR(c, c.dataset.qr));
  const r = $("#reset"); if (r) r.onclick = () => { tickets = []; regs = []; favs = new Set(); store.set("t2_tickets", []); store.set("t2_regs", []); store.set("t2_favs", []); updCount(); route(); }; };

pages.notfound = () => `${phead("404", "Sipario chiuso", "Questa pagina non esiste.", "")}<section><div class="wrap"><a class="btn btn-primary" href="#/">Torna alla home</a></div></section>`;

// ---------- modal: iscrizione esperienze ----------
let lastFocus = null;
function openModal(html) { lastFocus = document.activeElement; $("#dialog").innerHTML = `<button class="x" aria-label="Chiudi" data-close>×</button>` + html; $("#modal").classList.add("open"); document.body.style.overflow = "hidden"; setTimeout(() => { const f = $("#dialog input, #dialog .btn"); f && f.focus(); }, 60); }
function closeModal() { $("#modal").classList.remove("open"); document.body.style.overflow = ""; lastFocus && lastFocus.focus && lastFocus.focus(); }
$("#modal").addEventListener("click", e => { if (e.target.id === "modal" || e.target.closest("[data-close]")) closeModal(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });
function expModal(id) {
  const x = D.EXP.find(e => e.id === id); if (!x) return;
  openModal(`<div class="eyebrow r">Iscrizione · ${esc(x.m)}</div><h3 class="serif" style="font-size:34px;line-height:1.05;margin:6px 0 10px">${esc(x.t)}</h3><p class="muted">${esc(x.p)}</p>
  <form id="expF" novalidate style="margin-top:18px">
    <div class="row2"><div class="field"><label for="eN">Nome e cognome *</label><input id="eN" autocomplete="name"><div class="err"></div></div>
    <div class="field"><label for="eM">Email *</label><input id="eM" type="email" autocomplete="email"><div class="err"></div></div></div>
    <div class="row2"><div class="field"><label for="eT">Telefono (anche WhatsApp)</label><input id="eT" type="tel" autocomplete="tel"><div class="err"></div></div>
    <div class="field"><label for="eQ">Partecipanti</label><select id="eQ">${[1, 2, 3, 4].filter(n => n <= x.left).map(n => `<option>${n}</option>`).join("")}</select></div></div>
    <label class="consent"><input type="checkbox" id="eC" style="accent-color:var(--rosso)"> <span>Acconsento al trattamento dei dati per gestire l'iscrizione.</span></label><div class="err" id="eCe"></div>
    <button class="btn btn-primary" type="submit">Conferma iscrizione</button></form>`);
  $("#expF").onsubmit = e => { e.preventDefault(); let ok = true;
    const set = (el, msg) => { el.setAttribute("aria-invalid", !!msg); el.nextElementSibling.textContent = msg || ""; if (msg) ok = false; };
    const n = $("#eN"), m = $("#eM"), t = $("#eT");
    set(n, n.value.trim().length < 3 ? "Inserisci nome e cognome" : ""); set(m, mailOk(m.value) ? "" : "Email non valida");
    set(t, t.value && !/^[+\d][\d\s]{6,}$/.test(t.value.trim()) ? "Numero non valido" : "");
    $("#eCe").textContent = $("#eC").checked ? "" : "Serve il consenso per procedere"; if (!$("#eC").checked) ok = false;
    if (!ok) return; const q = +$("#eQ").value;
    regs = regs.filter(r => r.id !== x.id); regs.push({ id: x.id, t: x.t, n: n.value.trim(), q }); store.set("t2_regs", regs); x.left = Math.max(0, x.left - q); updCount();
    $("#dialog").innerHTML = `<button class="x" aria-label="Chiudi" data-close>×</button><div class="success"><div class="ok">✅</div><h3 class="serif" style="font-size:34px">Iscrizione confermata</h3><p>${esc(n.value.trim())}, ti aspettiamo a <b>${esc(x.t)}</b>.<br>Conferma inviata a ${esc(m.value.trim())} (simulazione).</p><div class="cta-row" style="justify-content:center"><a class="btn btn-primary" href="#/mio" data-close>Il mio Trianon</a></div></div>`;
    $$("#eg, .exp-grid").forEach(g => g.innerHTML = (g.id === "eg" ? D.EXP : D.EXP.slice(0, 3)).map(expCard).join(""));
  };
}

// ---------- newsletter ----------
$("#nlForm").onsubmit = e => { e.preventDefault(); const m = $("#nlMail"), ok = mailOk(m.value), c = $("#nlConsent").checked;
  m.setAttribute("aria-invalid", !ok); m.nextElementSibling.textContent = ok ? "" : "Inserisci un'email valida"; $("#nlConsentErr").textContent = c ? "" : "Serve il consenso per iscriverti";
  if (!ok || !c) return; const ints = $$(".interests input:checked").map(i => i.value), nm = $("#nlName").value.trim();
  e.target.innerHTML = `<div class="success"><div class="ok">💌</div><h3 class="serif" style="font-size:34px;color:var(--oro-2)">Benvenut${nm ? "o/a " + esc(nm) : "o/a"}!</h3><p>Ti scriveremo di: ${ints.length ? esc(ints.join(", ")) : "tutto il Trianon"}.</p><p style="opacity:.6;font-size:12.5px;margin-top:8px">Simulazione: nella versione reale partirebbe l'email di conferma (double opt-in).</p></div>`; };

// ---------- global clicks ----------
document.addEventListener("click", e => {
  const f = e.target.closest("[data-fav]");
  if (f) { e.preventDefault(); e.stopPropagation(); const id = f.dataset.fav; favs.has(id) ? favs.delete(id) : favs.add(id); store.set("t2_favs", [...favs]); updCount();
    toast(favs.has(id) ? "Salvato in Il mio Trianon ♥" : "Rimosso dai preferiti");
    $$(`[data-fav="${id}"]`).forEach(b => { const on = favs.has(id); b.setAttribute("aria-pressed", on); b.textContent = b.classList.contains("fav") ? (on ? "♥" : "♡") : (on ? "♥ Salvato" : "♡ Salva"); }); return; }
  const x = e.target.closest("[data-exp]"); if (x && !x.disabled) { expModal(x.dataset.exp); return; }
  const a = e.target.closest("[data-abb]"); if (a) { toast(`Richiesta “${a.dataset.abb}”: demo, il botteghino ti ricontatta`); }
});

// ---------- router ----------
function parseHash() {
  const h = location.hash.replace(/^#\/?/, ""); const [path, qs] = h.split("?");
  const parts = path.split("/").filter(Boolean); const q = Object.fromEntries(new URLSearchParams(qs || ""));
  return { page: parts[0] || "home", arg: parts[1], q };
}
const TITLES = { home: "Home", stagione: "Stagione", spettacolo: "Spettacolo", biglietti: "Biglietti", news: "News", esperienze: "Esperienze", "chi-siamo": "Chi siamo", "direzione-artistica": "Direzione artistica", visita: "Visita", mio: "Il mio Trianon" };
function route() {
  timers.forEach(clearInterval); timers = [];
  const { page, arg, q } = parseHash(); const fn = pages[page] && page !== "notfound" && page !== "abbonamenti" ? pages[page] : pages.notfound;
  $("#main").innerHTML = `<div class="fade">${fn(arg, q)}</div>`;
  fn.after && fn.after(arg, q);
  let t = TITLES[page] || "Pagina non trovata";
  if (page === "spettacolo" && showById(arg)) t = showById(arg).t;
  if (page === "news" && arg && D.NEWS.find(n => n.s === arg)) t = D.NEWS.find(n => n.s === arg).t;
  document.title = `${t} · Trianon Viviani — Concept`;
  const navKey = { spettacolo: "stagione", "direzione-artistica": "chi-siamo" }[page] || page;
  $$("[data-nav]").forEach(a => a.classList.toggle("on", a.dataset.nav === navKey));
  $$("[data-tab]").forEach(a => a.classList.toggle("on", a.dataset.tab === (navKey === "home" ? "home" : navKey)));
  if (!(page === "chi-siamo" && arg)) scrollTo(0, 0);
  $("#main").focus({ preventScroll: true });
}
addEventListener("hashchange", route);
updCount(); route();

// ---------- PWA ----------
if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
let deferred = null; const inst = $("#install");
const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone || window.Capacitor;
const dismissed = () => store.get("t2_install_x", false);
addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferred = e; if (!standalone && !dismissed()) inst.classList.add("show"); });
if (!standalone && !dismissed() && /iphone|ipad/i.test(navigator.userAgent)) { $("#installTxt").textContent = "Tocca Condividi ⎋ e poi “Aggiungi alla schermata Home”."; $("#installBtn").style.display = "none"; setTimeout(() => inst.classList.add("show"), 2500); }
$("#installBtn").onclick = async () => { if (!deferred) return; deferred.prompt(); await deferred.userChoice; deferred = null; inst.classList.remove("show"); };
$("#installX").onclick = () => { inst.classList.remove("show"); store.set("t2_install_x", true); };
})();
