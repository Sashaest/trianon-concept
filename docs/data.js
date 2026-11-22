// Dati stagione 2026|2027 — fonte: teatrotrianon.org (consultato 22/11/2026)
window.TRIANON = {
  HOUR: "21:00", // orario indicativo per la demo
  GEN: {
    prosa: ["Prosa", "g-prosa"],
    concerto: ["Concerto", "g-concerto"],
    musica: ["Musica", "g-musica"],
    danza: ["Danza", "g-danza"],
    musicale: ["Teatro musicale", "g-musicale"]
  },
  SHOWS: [
    { id: "venere", t: "Venere vs Adone", w: "Enzo Cosimi", g: "danza", d: ["2026-11-01"] },
    { id: "camorra", t: "'A camorra song", w: "'A 67 e Cristina Donadio", g: "musica", d: ["2026-11-06"] },
    { id: "tempesta", t: "Il figlio della tempesta", w: "Armando Punzo e Andrea Salvadori", g: "musica", d: ["2026-11-07", "2026-11-08"] },
    { id: "ruvia", t: "Le fiabe di donna Ruvia", w: "Dadà", g: "musicale", d: ["2026-11-14", "2026-11-15"] },
    { id: "guagliunera", t: "Guagliunera", w: "Rassegna della Musica Campana · a cura di Polo", g: "musica", d: ["2026-11-18"] },
    { id: "pinocchio", t: "Pinocchio. Che cos'è una persona?", w: "Davide Iodice · Scuola Elementare del Teatro", g: "prosa", d: ["2026-11-21", "2026-11-22"] },
    { id: "granatino", t: "'80, '90 e Mo'", w: "Ivan Granatino · Favola di un'amicizia", g: "prosa", d: ["2026-11-25", "2026-11-26"] },
    { id: "weekend", t: "Week-end", w: "Sabrina Scuccimarra", g: "prosa", d: ["2026-11-28", "2026-11-29"] },
    { id: "ricciardi", t: "Franco Ricciardi in concerto", w: "Franco Ricciardi", g: "concerto", d: ["2026-12-02"] },
    { id: "napucalisse", t: "Napucalisse", w: "Mimmo Borrelli", g: "prosa", d: ["2026-12-05", "2026-12-06"] },
    { id: "cupiello", t: "Natale in casa Cupiello", w: "Luca Saccoia · spettacolo per attore cum figuris", g: "prosa", d: ["2026-12-09", "2026-12-10", "2026-12-11", "2026-12-12", "2026-12-13"] },
    { id: "truppi", t: "Solo piano", w: "Giovanni Truppi", g: "concerto", d: ["2026-12-16"] },
    { id: "cantata", t: "La Cantata dei Pastori", w: "Peppe Barra", g: "musicale", d: ["2026-12-19", "2026-12-20", "2026-12-26", "2026-12-27", "2026-12-29", "2026-12-30"] },
    { id: "nummere", t: "Nummere. Scostumatissima Tombola", w: "Gino Curcione", g: "prosa", d: ["2026-12-22", "2026-12-23"] },
    { id: "scarlatti", t: "Concerto di Capodanno", w: "Nuova Orchestra Scarlatti", g: "concerto", d: ["2027-01-01"] }
  ],
  // Prezzi DI ESEMPIO per la demo (i prezzi reali sono gestiti dalla biglietteria del teatro)
  SETTORI: [
    { id: "platea", n: "Platea", intero: 25, ridotto: 20 },
    { id: "galleria", n: "Galleria", intero: 18, ridotto: 15 }
  ],
  STUDENTI: 5, // dato reale: news del teatro
  ABB: [
    { id: "stagione", n: "Stagione intera", d: "Tutti gli spettacoli di prosa, posto fisso", ico: "🎭" },
    { id: "carnet", n: "Carnet libero", d: "Scegli tu titoli e date", ico: "🎟️" },
    { id: "musica", n: "Musica & concerti", d: "Concerti e rassegna della musica campana", ico: "🎶" }
  ],
  EXP: [
    { id: "torre", ico: "🏛️", t: "Visita alla Torre della Sirena", p: "Un percorso guidato tra le mura di Neapolis custodite dentro il teatro.", m: "Sabato mattina · 45 min · gratuita", tot: 25, left: 9 },
    { id: "prove", ico: "🎭", t: "Prove aperte", p: "Entra in sala mentre lo spettacolo prende forma. Posti limitati, riservati agli iscritti.", m: "Date comunicate via newsletter", tot: 60, left: 22 },
    { id: "incontro", ico: "🎙️", t: "Dopo il sipario", p: "Incontro con artisti e compagnie al termine della replica domenicale.", m: "Domenica · ingresso col biglietto", tot: 120, left: 64 },
    { id: "lab", ico: "🎶", t: "Laboratorio di canzone napoletana", p: "Per ragazzi e famiglie: storia, ritmo e voce della canzone che ha fatto il giro del mondo.", m: "Ciclo di 4 incontri", tot: 20, left: 6 },
    { id: "pulcinella", ico: "🎪", t: "Audizioni · Pulcinella", p: "Per \"Pulcinella, ovvero una cosa che somiglia al mondo\" di Noemi Francesca, in scena dal 14 al 23 maggio 2027.", m: "Oltre 500 candidature ricevute", tot: 500, left: 0 }
  ],
  NEWS: [
    { s: "audizioni-pulcinella", c: "Produzioni", t: "Oltre 500 candidature per le audizioni di \"Pulcinella\"", p: "La nuova produzione scritta e diretta da Noemi Francesca debutta a Napoli dal 14 al 23 maggio 2027.", rel: [] },
    { s: "nuova-stagione", c: "Stagione", t: "«Curre curre guaglio'», la nuova stagione", p: "Tradizione e scritture contemporanee, musica popolare e sinfonica, teatro civile e festa: il cartellone 2026|2027.", rel: ["cantata", "napucalisse", "cupiello"] },
    { s: "musica-campana", c: "Musica", t: "Rassegna della Musica campana", p: "Un viaggio dalla polifonia rinascimentale ai 99 Posse.", rel: ["guagliunera"] },
    { s: "biglietto-5-euro", c: "Pubblico", t: "Biglietto a 5 euro per chi studia", p: "Per studenti universitari, allievi delle scuole di teatro, musica, danza e dell'Accademia di Belle Arti.", rel: [] },
    { s: "nuova-presidente", c: "Fondazione", t: "Clementina Chieffo è la nuova Presidente", p: "Cambio al vertice della Fondazione Trianon Viviani.", rel: [] },
    { s: "festa-in-piazza", c: "Stagione", t: "\"Il Trianon fa festa in piazza\"", p: "La presentazione della nuova stagione in piazza Calenda.", rel: [] },
    { s: "peppino-di-capri", c: "Memoria", t: "Il Trianon Viviani piange Peppino di Capri", p: "Il saluto del teatro a una voce della canzone italiana.", rel: [] }
  ],
  BANDI: [
    { t: "Avviso pubblico per una figura professionale per comunicazione integrata e media relations", s: "27 nov 2026 · via PEC" },
    { t: "Avviso pubblico per la selezione del componente unico dell'Organismo di Vigilanza", s: "21 dic 2026 · ore 12:00 · via PEC" }
  ],
  BOTTEGHINO: [
    ["Lunedì", "chiuso"],
    ["Martedì – sabato", "10:00–13:30 · 16:00–19:00"],
    ["Domenica e festivi", "10:00–13:00 · dalle 16:00 nei giorni di spettacolo"]
  ]
};
