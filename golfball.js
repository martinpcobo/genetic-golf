class Golfball {
	constructor(dna) {
		this.pos = createVector(65, height / 2);
		this.acc = createVector();
		this.vel = createVector();
		this.radius = 10;
		this.fitness = 0;
		this.time = undefined;
		this.stopped = false;
		this.slowed = false;
		this.finished = false;

		if (dna) {
			this.dna = dna;
		} else {
			this.dna = [];
			for (let i = 0; i < lifespan; i++) {
				let gene = createVector(random(-1, 1), random(-1, 1));
				this.dna.push(gene);
			}
		}
	}

	show() {
		stroke(120);
		ellipse(this.pos.x, this.pos.y, this.radius);
	}

	applyForce(force) {
		if (!this.slowed) {
			this.acc.add(force);
			this.vel.add(this.acc);
			this.acc.mult(0);
		}
	}

	update() {
		if (!this.stopped && !this.slowed) {
			this.vel.limit(4);
			this.pos.add(this.vel);
		}

		//If you hit a sandpit your speed is slowed by 10% until you hit 0.
		if (this.slowed) {
			this.vel.div(1.1);
			this.pos.add(this.vel);
		}

		//Edge of the window check
		if (
			this.pos.x < 0 ||
			this.pos.y < 0 ||
			this.pos.x > width ||
			this.pos.y > height
		) {
			this.stopped = true;
		}
	}

	sandCheck(x, y, r) {
		let d = dist(this.pos.x, this.pos.y, x, y);

		if (d < r) {
			this.slowed = true;
		}
	}

	completed(x, y) {
		let d = dist(this.pos.x, this.pos.y, x, y);
		if (d < this.radius / 2) {
			this.finished = true;
			this.time = counter;
		}
	}

	calcFitness(hx, hy) {
		let d = floor(dist(this.pos.x, this.pos.y, hx, hy));
		return d;
	}

	breed(coParent) {
		let childDNA = [];
		let endPoint = this.fitness + coParent.fitness;
		let midPoint = 0;
		let betterParent = false;

		//Figure out which parent is the better parent and set the midpoint equal to the better parent's fitness.
		if (coParent.fitness > this.fitness) {
			midPoint = coParent.fitness;
			betterParent = true;
		} else {
			midPoint = this.fitness;
		}

		//Loop through the DNA. Get a random number, if that random number is less than or equal to the midpoint, then the gene
		//that should go in to that spot in the DNA array is the better parent's gene.  This insures that the parent with the
		//higher fitness is more likely to pass on their genes at a rate porportional to the worse parent's fitness level.
		//Example found below.
		for (let i = 0; i < this.dna.length; i++) {
			let r = floor(random(0, endPoint + 1));
			if (betterParent) {
				if (r <= midPoint) {
					childDNA.push(coParent.dna[i]);
				} else {
					childDNA.push(this.dna[i]);
				}
			} else {
				if (r <= midPoint) {
					childDNA.push(this.dna[i]);
				} else {
					childDNA.push(coParent.dna[i]);
				}
			}
		}
		return childDNA;
	}
}
/*

class Golfball {
	constructor(dna) {
		this.pos = createVector(65, height / 2);
		this.vel = createVector();
		this.radius = 10;
		this.fitness = 0;
		this.time = undefined;
		this.stopped = false;
		this.finished = false;

		// Generar o asignar el ADN con numShots tiros
		if (dna) {
			this.dna = dna;
		} else {
			this.dna = [];
			for (let i = 0; i < numShots; i++) {
				let gene = createVector(random(-1, 1), random(-1, 1));
				this.dna.push(gene);
			}
		}
	}

	show() {
		stroke(120);
		fill(255);
		ellipse(this.pos.x, this.pos.y, this.radius);
	}

	applyForce(force) {
		// Asignamos la fuerza directamente como velocidad para trayectoria recta
		this.vel = force.copy();
	}

	update() {
		// Actualizar posición usando la velocidad
		if (!this.stopped) {
			this.pos.add(this.vel);

			// Detener si la velocidad mínima se mantiene
			if (this.vel.mag() < 0.5 && counter > 20) {
				this.stopped = true;
			}
		}

		// Verificar si sale de la pantalla
		if (
			this.pos.x < 0 ||
			this.pos.y < 0 ||
			this.pos.x > width ||
			this.pos.y > height
		) {
			this.stopped = true;
		}
	}

	sandCheck(x, y, r) {
		// Verifica si está en un área de arena y detiene completamente la pelota si es así
		let d = dist(this.pos.x, this.pos.y, x, y);
		if (d < r) {
			// Frenar completamente la pelota
			this.vel.set(0, 0); // Detener la velocidad a cero
			this.stopped = true; // Marcar como detenida
		}
	}

	completed(x, y) {
		// Verificar si alcanzó el objetivo
		let d = dist(this.pos.x, this.pos.y, x, y);
		if (d < this.radius / 2) {
			this.finished = true;
			this.time = counter;
		}
	}

	calcFitness(hx, hy) {
		this.fitness = floor(dist(this.pos.x, this.pos.y, hx, hy));
		return this.fitness;

		this.fitness = 0;

		// (1) Fitness positivo si llega al objetivo o agujero
		if (this.finished) {
			this.fitness = 1000; // Gran recompensa por llegar al objetivo
		} else {
			// (4) Fitness positivo cuanto más cerca esté del agujero
			this.fitness += floor(dist(this.pos.x, this.pos.y, hx, hy));

			// (2) Fitness negativo si se queda en la arena
			if (this.slowed) {
				this.fitness *= 0.02; // Penalización por quedarse en arena
			}

			// (3) Fitness negativo si se va fuera de la cancha
			if (
				this.stopped &&
				(this.pos.x < 0 ||
					this.pos.x > width ||
					this.pos.y < 0 ||
					this.pos.y > height)
			) {
				this.fitness = 0; // Penalización por salir de la cancha
				return this.fitness;
			}
		}

		// (5) Fitness positivo cuanto menos tiros haya realizado
		if (this.time !== undefined) {
			this.fitness += map(this.time, 0, lifespan, 200, 0); // Menos tiempo, mayor fitness
		}

		return this.fitness;
	}

	breed(coParent) {
		// Método de cruce de ADN entre dos padres
		let childDNA = [];
		for (let i = 0; i < this.dna.length; i++) {
			childDNA[i] = random() > 0.5 ? this.dna[i] : coParent.dna[i];
		}
		return childDNA;
	}
}
*/