let target;
let counter = 0;
let lifespan = 500;
let agents = 500;
let generations = 1;
let golfballs = [];
let matingpool = [];
let pits = [];
let numShots = 15; // Número de tiros por cada golfball
let speedMultiplier = 10; // Factor de velocidad para aumentar el movimiento

function setup() {
	createCanvas(windowWidth, windowHeight);

	// Add starting set of golfballs.
	for (let i = 0; i < agents; i++) {
		let golfball = new Golfball();
		golfballs.push(golfball);
	}

	setCourse();
}

function draw() {
	getCourse();
	runGeneration();
	let activeIndividuals = golfballs.filter(
		(g) => !g.stopped && !g.finished && !g.slowed
	).length;
	if (counter == lifespan || activeIndividuals == 0) {
		newGeneration();
	}
}

function runGeneration() {
	// Para cada golfball, se aplican múltiples tiros secuenciales
	for (let golfball of golfballs) {
		golfball.show();
		if (!golfball.finished) {
			let shotIndex = Math.floor(counter / (lifespan / numShots)); // calcula el índice del tiro
			let force = p5.Vector.mult(
				golfball.dna[shotIndex],
				speedMultiplier
			); // Multiplicamos la fuerza por el factor de velocidad
			golfball.applyForce(force);
			golfball.update();
		}
		for (let i = 0; i < pits.length; i++) {
			golfball.sandCheck(pits[i].x, pits[i].y, pits[i].z);
		}
		golfball.completed(target.x, target.y);
	}
	counter++;
}

function newGeneration() {
	console.log('Creating a new generation...');

	// Calcular la aptitud de cada golfball
	for (let i = 0; i < golfballs.length; i++) {
		golfballs[i].fitness = golfballs[i].calcFitness(width - 70, height / 2);
	}

	// Normalizar y seleccionar individuos para la próxima generación
	normalizeData();
	naturalSelection();
	golfballs = [];

	// Crear una nueva generación de golfballs a partir del mating pool
	for (let i = 0; i < agents; i++) {
		let parentA = random(matingpool);
		let parentB = random(matingpool);
		while (parentA == parentB) {
			parentB = random(matingpool);
		}
		golfballs.push(new Golfball(parentA.breed(parentB)));
	}

	// Mutar el DNA de cada golfball
	for (let i = 0; i < golfballs.length; i++) {
		for (let j = 0; j < golfballs[i].dna.length; j++) {
			let r = random();
			if (r < 0.01) {
				let newDNA = createVector(random(-1, 1), random(-1, 1));
				golfballs[i].dna[j] = newDNA;
			}
		}
	}
	generations++;
	counter = 0;
}

function naturalSelection() {
	matingpool = [];

	for (let i = 0; i < golfballs.length; i++) {
		let odds = golfballs[i].fitness;
		for (let j = 0; j < odds; j++) {
			matingpool.push(golfballs[i]);
		}
	}
}

function normalizeData() {
	let highestFit = 0;
	let lowestFit = Infinity;

	for (let golfball of golfballs) {
		if (golfball.fitness > highestFit) {
			highestFit = golfball.fitness;
		}
		if (golfball.fitness < lowestFit) {
			lowestFit = golfball.fitness;
		}
	}

	for (let golfball of golfballs) {
		// Normalizar fitness para que los mejores tengan valores altos
		golfball.fitness = map(golfball.fitness, lowestFit, highestFit, 1, 10);
	}
}

function setCourse() {
	target = createVector(width - 70, height / 2);
	pits = []; // Reiniciar pits en cada llamada para evitar duplicación

	let numPits = floor(random(20, 30)); // Número de pits aleatorio entre 5 y 10
	let minDistanceFromTarget = 150; // Distancia mínima al objetivo

	for (let i = 0; i < numPits; i++) {
		let x, y, r;

		// Generar posición aleatoria asegurando una distancia mínima del objetivo
		do {
			x = random(100, width - 100);
			y = random(100, height - 100);
		} while (dist(x, y, target.x, target.y) < minDistanceFromTarget);

		// Tamaño aleatorio para cada pit, ajustado para el hitbox
		r = random(50, 100); // Ajusta estos valores para que coincidan con el tamaño visual

		// Agregar el pit a la lista
		pits.push(createVector(x, y, r));
	}
}

function getCourse() {
	background(93, 140, 60);

	// Fairway green background layer
	push();
	noStroke();
	fill(78, 173, 10);
	rect(25, 25, width - 50, height - 50);
	pop();

	// Diagonal stripes on fairway
	push();
	translate(width / 2, height / 2);
	rotate(45);
	noStroke();
	fill(138, 219, 81, 80);
	for (let i = -1000; i < 1000; i += 60) {
		rect(i, -1000, 30, 2000);
	}
	for (let i = -1000; i < 1000; i += 60) {
		rect(-1000, i, 2000, 30);
	}
	pop();

	// Beveled Corners
	push();
	noFill();
	stroke(93, 140, 60);
	strokeWeight(32);
	rect(12, 12, width - 25, height - 25, 55);
	pop();

	// Outermost framing layer
	push();
	noStroke();
	fill(93, 140, 60);
	rect(0, 0, 25, height);
	rect(0, 0, width, 25);
	rect(width - 25, 0, 25, height);
	rect(0, height - 25, width, 25);
	pop();

	// Tee box and blue tee markers
	push();
	noStroke();
	fill(138, 219, 81);
	rect(35, height / 2 - 25, 65, 50, 10);
	fill(0, 0, 255);
	ellipse(65, height / 2 - 20, 6);
	ellipse(65, height / 2 + 20, 6);
	pop();

	// Putting green, hole, and flag
	push();
	strokeWeight(8);
	stroke(77, 153, 23);
	fill(107, 189, 49);
	rect(width - 200, height / 2 - 75, 150, 150, 60);
	noStroke();
	strokeWeight(3);
	fill(0);
	ellipse(width - 70, height / 2, 30);
	stroke(255);
	line(width - 70, height / 2, width - 70, height / 2 - 40);
	noStroke();
	fill(255, 0, 0);
	triangle(
		width - 70,
		height / 2 - 40,
		width - 70,
		height / 2 - 25,
		width - 50,
		height / 2 - 32
	);
	pop();

	// Sand pits - asegúrate de que coincidan con el área de colisión
	push();
	noStroke();
	rectMode(CENTER);
	fill(242, 245, 188);
	for (let pit of pits) {
		ellipse(pit.x, pit.y, pit.z * 2); // Dibuja cada pit como un círculo
	}
	pop();

	// Course text
	push();
	textSize(20);
	noStroke();
	displayInfo();
	pop();
}

function displayInfo() {
	fill(255); // Texto en blanco
	textSize(16);
	textAlign(CENTER, BOTTOM); // Alinea el texto al centro

	let activeIndividuals = golfballs.filter(
		(g) => !g.stopped && !g.finished && !g.slowed
	).length;

	let finishedIndividuals = golfballs.filter((g) => g.finished).length;

	let infoText = `Current Generation: ${generations} | Population: ${agents} | Active Individuals: ${activeIndividuals} | Finished Individuals: ${finishedIndividuals} | Speed Multiplier: ${speedMultiplier} | Lifespan Remaining: ${
		lifespan - counter
	}`;

	// Muestra el texto horizontalmente centrado en la parte inferior de la pantalla
	text(infoText, width / 2, height - 5);
}
