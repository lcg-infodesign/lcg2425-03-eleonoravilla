let data; // Variabile per contenere i dati del CSV

function setup() {
  createCanvas(windowWidth, windowHeight);
  noLoop(); // Disegna una sola volta
}

function preload() {
  // Carica il file CSV
  data = loadTable("assets/rivers-data.csv", "csv", "header");
}

function draw() {
  background(200, 230, 255);
  
  // Disegna il titolo
  textAlign(CENTER, TOP);
  textSize(21); // Dimensione del titolo
  fill(0, 0, 255); // Colore blu per il titolo
  text("Rivers in the world", width / 2, 20); // Posizione del titolo

  // Aggiungi spazio tra il titolo e la legenda
  let titleHeight = 40; // Altezza del titolo
  let spaceBetweenTitleAndLegend = 20; // Spazio tra il titolo e la legenda

  // Disegna la legenda
  textAlign(LEFT, TOP);
  textSize(14); // Dimensione del testo della legenda
  fill(0, 0, 255); // Colore blu per il testo della legenda
  let legendX = width - 290; // Posizione X della legenda
  let legendY = titleHeight + spaceBetweenTitleAndLegend; // Posizione Y della legenda
  text("Legend:", legendX, legendY);
  text("- An 'eye' represents a river", legendX, legendY + 20);
  text("- A line represents a tributary", legendX, legendY + 40); // Modificata la parola "raggi"
  text("- Orange indicates high average temperature", legendX, legendY + 60);
  text("- Height of the eye indicates discharge", legendX, legendY + 80);
  text("- Width of the eye indicates river length", legendX, legendY + 100);

  // Estrai i continenti e i dati dei fiumi dal file CSV
  let continents = {}; // Oggetto per contenere i continenti e i dati dei fiumi
  for (let i = 0; i < data.getRowCount(); i++) {
    let continent = data.getString(i, "continent"); // Colonna "continent" del file CSV
    let length = data.getNum(i, "length"); // Lunghezza del fiume
    let discharge = data.getNum(i, "discharge"); // Portata del fiume
    let tributaries = data.getNum(i, "tributaries"); // Numero di tributari
    let avgTemp = data.getNum(i, "avg_temp"); // Temperatura media

    if (!continents[continent]) {
      continents[continent] = [];
    }
    continents[continent].push({ length, discharge, tributaries, avgTemp });
  }

  // Trasforma l'oggetto in un array per accedere facilmente
  let continentKeys = Object.keys(continents);
  let continentCounts = Object.values(continents);

  // Ordina i continenti in base al numero di fiumi
  continentKeys.sort((a, b) => continents[b].length - continents[a].length);
  continentCounts.sort((a, b) => b.length - a.length);

  // Calcola il numero di colonne e righe della griglia
  let boxSize = 400; // Aumentata la dimensione della casella per creare più spazio
  let margin = 20; // Margine dal bordo
  let cols = floor((width - margin * 2) / boxSize); // Numero di colonne in base alla larghezza
  let rows = ceil(continentKeys.length / cols); // Numero di righe in base al numero di continenti

  let index = 0; // Indice per scorrere i continenti
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (index >= continentKeys.length) break; // Esci se abbiamo disegnato tutti i continenti

      let continent = continentKeys[index];
      let rivers = continentCounts[index];

      // Calcola la posizione del cerchio
      let cx = col * boxSize + boxSize / 2 + margin;
      let cy = row * boxSize + boxSize / 2 + margin;

      // Disegna il cerchio principale senza stroke
      noStroke(); // Assicurati che non ci sia stroke per il cerchio
      fill(135, 206, 250);
      ellipse(cx, cy, 305, 305); // Aumentata la dimensione del cerchio

      // Testo sopra il cerchio senza stroke
      fill(0, 0, 255); // Colore blu come i raggi
      textAlign(CENTER, CENTER);
      textSize(17); // Aumentata la dimensione del testo
      noStroke(); // Assicurati che non ci sia stroke per il testo
      text(continent, cx, cy - 160); // Posiziona il testo sopra il cerchio

      // Resetta l'array delle posizioni occupate
      let positions = [];

      // Disegna gli occhi e i raggi per ogni fiume
      for (let i = 0; i < rivers.length; i++) {
        let river = rivers[i];
        drawRiverGlyph(cx, cy, river, positions);
      }

      index++; // Passa al continente successivo
    }
  }
}

// Funzione per disegnare l'occhio e i raggi
function drawRiverGlyph(cx, cy, river, positions) {
  let ex, ey;

  // Trova una posizione casuale per l'occhio
  let foundPosition = false;
  let attempts = 0;
  const maxAttempts = 100; // Limita il numero di tentativi per trovare una posizione

  while (!foundPosition && attempts < maxAttempts) {
    // Genera una posizione casuale all'interno del cerchio
    let angle = random(TWO_PI);
    let radius = random(0, 120); // Raggio massimo per l'occhio aumentato
    ex = cx + cos(angle) * radius;
    ey = cy + sin(angle) * radius;

    // Controlla se la posizione è occupata
    foundPosition = true;
    for (let pos of positions) {
      if (dist(ex, ey, pos.x, pos.y) < 50) { // Aumentata la distanza minima per evitare sovrapposizioni
        foundPosition = false;
        break;
      }
    }
    attempts++;
  }

  // Se non si trova una posizione valida, esci dalla funzione
  if (!foundPosition) return;

  // Aggiungi la posizione occupata all'array
  positions.push({ x: ex, y: ey });

  // Dimensioni dell'occhio basate su lunghezza e portata
  let w = map(river.length, 0, 10000, 20, 100); // Mappa lunghezza a larghezza aumentata
  let h = map(river.discharge, 0, 100000, 20, 100); // Mappa portata a altezza aumentata

  // temperatura media 

  let avgTemp = river.avgTemp;
  let colorValue = map(avgTemp, 0, 40, 0, 1);
  colorValue = constrain(colorValue, 0, 1); 

  // Calcola la larghezza del gradiente
  let gradientWidth = map(colorValue, 0, 1, 0.2, 1); // Larghezza del colore arancione

  // gradiente
  let gradient = drawingContext.createLinearGradient(ex - w / 2, ey, ex + w / 2, ey);
  gradient.addColorStop(0, 'rgb(255, 165, 0)'); // Arancione 
  gradient.addColorStop(gradientWidth, 'rgb(255, 165, 0)'); // Arancione 
  gradient.addColorStop(1, 'rgb(0, 79, 255)'); // Blu 
  drawingContext.fillStyle = gradient;

  noStroke();
  beginShape();
  vertex(ex - w / 2, ey);
  quadraticVertex(ex, ey - h / 2, ex + w / 2, ey);
  quadraticVertex(ex, ey + h / 2, ex - w / 2, ey);
  endShape(CLOSE);

  // raggi 
  stroke(0, 0, 255);
  strokeWeight(1); //
  let rayLength = 15; //
  let rayCount = river.tributaries; // Numero di raggi corrisponde ai tributari
  for (let j = 0; j < rayCount; j++) {
    let rayAngle = map(j, 0, rayCount - 1, -PI / 6, PI / 6);
    let xStart = ex + w / 2; // Posizione di partenza del raggio
    let yStart = ey;
    let xEnd = xStart + rayLength * cos(rayAngle);
    let yEnd = yStart + rayLength * sin(rayAngle);
    
    // Controlla se il raggio si sovrappone all'occhio
    if (dist(ex, ey, xEnd, yEnd) > 30) { //  distanza minima tra raggi e occhi
      line(xStart, yStart, xEnd, yEnd);
    }
  }
}
