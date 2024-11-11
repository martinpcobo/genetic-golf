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
			this.vel = force.copy();
			this.acc.mult(0);
		}
	}

	update() {
		// Actualizar posición usando la velocidad
		if (!this.stopped && !this.slowed) {
			this.pos.add(this.vel);

			// Detener si la velocidad mínima se mantiene
			if (this.vel.mag() < 0.5 && counter > 20) {
				this.stopped = true;
			}
		}

		 // Si golpeas un búnker tu velocidad se reduce en un 10% hasta que llegues a 0.
		if (this.slowed) {
			this.vel.div(1.1);
			this.pos.add(this.vel);
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
		let d = dist(this.pos.x, this.pos.y, x, y);

		if (d < r) {
			this.slowed = true;
		}
	}

	completed(x, y) {
		let d = dist(this.pos.x, this.pos.y, x, y);
		if (d < 30 / 2) {
			this.finished = true;
			this.time = counter;
		}
	}

	calcFitness(hx, hy) {
		// (1) Distancia de la pelota al agujero
		let distance = dist(this.pos.x, this.pos.y, hx, hy);
		this.fitness = 1 / (distance + 1); // Invertir la distancia para que una menor distancia tenga un mayor fitness

		if (this.finished) {
			// (2) Gran recompensa por terminar con éxito
			this.fitness *= 10;
		} else {
			// (3) Penalización si la pelota se queda en la arena
			if (this.slowed) {
				this.fitness *= 0.5;
			}

			// (4) Penalización por salir de la cancha
			if (
				this.stopped &&
				(this.pos.x < 0 ||
					this.pos.x > width ||
					this.pos.y < 0 ||
					this.pos.y > height)
			) {
				this.fitness *= 0.1;
			}
		}

		return this.fitness;
	}

	breed(coParent) {
		let childDNA = [];
		let endPoint = this.fitness + coParent.fitness;
		let midPoint = 0;
		let betterParent = false;

		if (coParent.fitness > this.fitness) {
			midPoint = coParent.fitness;
			betterParent = true;
		} else {
			midPoint = this.fitness;
		}

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
