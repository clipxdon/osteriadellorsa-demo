export const R = {
  name: "Antica Osteria dell'Orsa",
  address: 'Piazza Cesare Battisti 5',
  city: '12038 Savigliano (CN)',
  phone: '0172 711763',
  tel: 'tel:+390172711763',
  whatsapp: '335 835 7473',
  wa: 'https://wa.me/393358357473',
  email: 'osteriadellorsa@alice.it',
  maps: 'https://www.google.com/maps/search/?api=1&query=Antica+Osteria+dell%27Orsa+Piazza+Cesare+Battisti+5+Savigliano',
  facebook: 'https://www.facebook.com/orsa.ristorante/',
}

// Dalla carta pubblicata sul sito attuale (novembre 2026). Senza prezzi: la carta cambia con le stagioni.
export const MENU = [
  { id: 'antipasti', star: 'α', title: 'Antipasti', dishes: [
    'Carne cruda di vitella Fassona battuta al coltello',
    'Vitello tonnato',
    'Flan di porri con salsa al parmigiano',
    'Lingua in salsa rossa',
    'Baccalà mantecato con carciofi in agrodolce',
    'Il misto: insalata russa, carne cruda, bergera alle nocciole, acciughe al bagnet verd',
  ] },
  { id: 'primi', star: 'β', title: 'Primi', dishes: [
    'Plin casalinghi al burro e salvia',
    'Risotto con gorgonzola e pere',
    'Tajarin al ragù di salsiccia',
  ] },
  { id: 'secondi', star: 'γ', title: 'Secondi', dishes: [
    'Stinco di vitella al Barbera',
    'Scamone di vitella Fassona alla piastra',
    'Madama la Piemonteisa con salsa Santarosa',
  ] },
  { id: 'dolci', star: 'δ', title: 'Dolci', dishes: [
    'Pere Martin Sec all’Arneis',
    'Semifreddo al torrone con salsa al cioccolato',
    'Bonet dell’Orsa',
    'Torta di nocciole con zabaione',
  ] },
]

export const MADAMA = [
  { t: 'Carne cruda battuta al coltello', d: 'vitella piemontese da Fassone' },
  { t: 'Madama la Piemonteisa', d: 'costata di vitella femmina, circa 600 g, alla piastra, con la salsa della Contessa di Santa Rosa' },
  { t: 'Un dolce della carta', d: 'a scelta' },
]

export const WINES = [
  { t: 'Mezzine', d: 'mezze bottiglie, per assaggiare di più' },
  { t: 'Bollicine', d: 'spumanti bianchi e rosé' },
  { t: 'Bianchi', d: 'freschi, per gli antipasti' },
  { t: 'Rosati', d: 'per le sere d’estate' },
  { t: 'Rossi', d: 'la parte più lunga della carta' },
  { t: 'Da dessert', d: 'per accompagnare il bonet' },
  { t: 'Birre Trunasse', d: 'birre artigianali, per chi preferisce' },
]

// i = Date.getDay()
export const HOURS = [
  { d: 'Lunedì', i: 1, h: '12:30–14 · 19–22' },
  { d: 'Martedì', i: 2, h: 'Chiuso' },
  { d: 'Mercoledì', i: 3, h: '12:30–14 · 19–22' },
  { d: 'Giovedì', i: 4, h: '12:30–14 · 19–22' },
  { d: 'Venerdì', i: 5, h: '12:30–14 · 19–22' },
  { d: 'Sabato', i: 6, h: '12:30–14 · 19–22' },
  { d: 'Domenica', i: 0, h: '12:30–14 · solo pranzo' },
]
