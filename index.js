const canvas = document.getElementById("my-canvas");
const context = canvas.getContext("2d");

class Vec {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	add(v) {
		this.x += v.x;
		this.y += v.y;
	}

	subtract(v) {
		this.x -= v.x;
		this.y -= v.y;
	}

	dot(v) {
		return this.x * v.x + this.y * v.y;
	}

	magnitude() {
		return getDistance(new Vec(0, 0), this);
	}

	normalize(len) {
		const m = this.magnitude();
		this.x *= len / m;
		this.y *= len / m;
	}

	clone() {
		return new Vec(this.x, this.y);
	}
}

class Ball {
	constructor(pos, vel) {
		this.pos = pos;
		this.vel = vel;
		this.radius = 8;
	}

	intersect(v) {
		return get_distance(this.pos, v) <= this.radius;
	}

	move() {
		if (Math.random() < 0.4) {
			trail.unshift(this.pos.clone());
		}
		if (trail.length > 15) {
			trail.splice(trail.length - 1, 1);
		}
		this.pos.add(this.vel);
	}
}

const center = new Vec(Math.floor(canvas.width / 2), Math.floor(canvas.height / 2));
const radius = 130;
let angle, score, highscore, launched, ball, speed, trail;

const setup = () => {
	highscore = 0;
	score = 0;
	launched = false;
	trail = [];
	angle = -Math.PI / 2;
	requestAnimationFrame(update);
};

const update = () => {
	if (ball) {
		ball.move();
		testForBounce();
		testForLose();
	}
	draw();
	requestAnimationFrame(update);
};

const draw = () => {
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.fillStyle = "black";
	context.fillRect(0, 0, canvas.width, canvas.height);
	context.fillStyle = "white";
	context.beginPath();
	context.arc(center.x, center.y, radius, 0, 7);
	context.fill();

	context.font = "80px 'Open Sans'";
	context.textAlign = "center";
	context.fillStyle = "#c4c4c4";
	context.fillText(score, center.x, center.y + 25);
	context.fillStyle = "white";
	context.font = "36px 'Open Sans'";
	context.fillText("HIGHSCORE: " + highscore, center.x, 70);
	if (!launched) {
		context.fillText("CLICK TO LAUNCH", center.x, 450);
	}

	context.save();
	context.translate(center.x, center.y);
	context.rotate(angle);
	context.fillStyle = "red";
	context.fillRect(radius - 5, -35, 18, 70);
	if (!launched) {
		context.fillStyle = "black";
		context.beginPath();
		context.arc(radius - 20, 0, 8, 0, 7);
		context.fill();
	}
	context.restore();

	for (let i = 0; i < trail.length; i++) {
		context.fillStyle = "rgba(0, 0, 0, " + (0.3 - i / 40) + ")";
		context.beginPath();
		context.arc(trail[i].x, trail[i].y, ball.radius - 1, 0, 7);
		context.fill();
	}

	if (ball) {
		context.fillStyle = "black";
		context.beginPath();
		context.arc(ball.pos.x, ball.pos.y, ball.radius, 0, 7);
		context.fill();
	}
};

const testForLose = () => {
	if (getDistance(center, ball.pos) > radius + ball.radius) {
		launched = false;
		ball = undefined;
		trail = [];
		if (score > highscore) {
			highscore = score;
		}
	}
};

const testForBounce = () => {
	const paddle = new Vec(Math.cos(angle) * (radius - 5) + center.x, Math.sin(angle) * (radius - 5) + center.y);
	const rel = new Vec(ball.pos.x - paddle.x, ball.pos.y - paddle.y);
	const angleCos = Math.cos(-angle);
	const angleSin = Math.sin(-angle);
	const local = new Vec(angleCos * rel.x - angleSin * rel.y, angleSin * rel.x + angleCos * rel.y);

	if (local.x >= -8 && local.x <= 0 && local.y >= -43 && local.y <= 43) {
		const normal = new Vec(center.x - paddle.x, center.y - paddle.y);
		normal.normalize(1);
		const relVec = new Vec(paddle.x - ball.pos.x, paddle.y - ball.pos.y);
		relVec.normalize(1);
		if (normal.dot(relVec) < 0) {
			const incident = ball.vel.clone();
			incident.normalize(1);
			const angle = normal.dot(incident);
			normal.normalize(2 * angle);
			incident.subtract(normal);
			speed += 0.1;
			incident.normalize(speed);
			ball.vel = incident;

			const ballAngle = Math.atan2(ball.pos.y - center.y, ball.pos.x - center.x);
			ball.pos.x = center.x + Math.cos(ballAngle) * 115;
			ball.pos.y = center.y + Math.sin(ballAngle) * 115;
			score++;
		}
	}
};

const getDistance = (v1, v2) => {
	return Math.sqrt(Math.pow(v2.y - v1.y, 2) + Math.pow(v2.x - v1.x, 2));
};

canvas.onmousemove = (e) => {
	const rect = canvas.getBoundingClientRect();
	const pos = new Vec(e.clientX - rect.left, e.clientY - rect.top);

	angle = Math.atan2(pos.y - center.y, pos.x - center.x);
};

canvas.onmousedown = (e) => {
	const rect = canvas.getBoundingClientRect();
	const pos = new Vec(e.clientX - rect.left, e.clientY - rect.top);
	if (!launched) {
		launched = true;
		speed = 3;
		score = 0;
		const vel = new Vec(center.x - pos.x, center.y - pos.y);
		vel.normalize(speed);
		const ballPos = new Vec(Math.cos(angle) * (radius - 20) + center.x, Math.sin(angle) * (radius - 20) + center.y);
		ball = new Ball(ballPos, vel);
	}
};

window.onload = setup();
