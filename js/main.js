const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const { PI, sqrt, sin, cos, acos } = Math;
const TAU = PI*2;
const toRad = (deg) => deg*(PI/180);
const toDeg = (rad) => rad*(180/PI);

let theta = toRad(15);
let e = 0.85;
let f, h, p, i, iAng, o, oAng, secAng;
let viewH;
let viewRadius, axesLen;

const updateVars = () => {
	viewRadius = canvas.width*0.15;
	axesLen = canvas.width*0.24;
	h = sqrt(1 - e*e);
	viewH = h*viewRadius;
};

const solveQuadratic = (a, b, c) => {
	const delta = b*b - 4*a*c;
	return (sqrt(delta) - b)/(2*a);
};

const calcEllipseAnglePoint = () => {
	const dx = cos(theta);
	const dy = sin(theta);
	const t = solveQuadratic(dx*dx + dy*dy/(h*h), -2*dx*e, e*e - 1);
	return [ dx*t - e, dy*t ];
};

const calcCircleAng = ([ x, y ]) => {
	if (y >= 0) return acos(x);
	return TAU - acos(x);
};

const updateSecAng = () => {
	secAng = iAng - oAng;
	if (secAng < 0) {
		secAng += TAU;
	}
};

const project = ([ x, y ]) => [ x*viewRadius, y*-viewRadius ];
const scaleVec = ([ x, y ], s) => [ x*s, y*s ];
const vecLen = ([ x, y ]) => sqrt(x*x + y*y);
const vecAdd = ([ ax, ay ], [ bx, by ]) => [ ax + bx, ay + by ];
const drawAxes = () => {
	const l = 10;

	ctx.strokeStyle = '#2c7';
	ctx.beginPath();
	ctx.moveTo(0, axesLen);
	ctx.lineTo(0, -axesLen);
	ctx.moveTo(-l, l - axesLen);
	ctx.lineTo(0, -axesLen);
	ctx.lineTo(l, l - axesLen);
	ctx.stroke();

	ctx.strokeStyle = '#c43';
	ctx.beginPath();
	ctx.moveTo(-axesLen, 0);
	ctx.lineTo(axesLen, 0);
	ctx.moveTo(axesLen - l, l);
	ctx.lineTo(axesLen, 0);
	ctx.lineTo(axesLen - l, -l);
	ctx.stroke();
};

const drawPoint = (point, label) => {
	point = project(point);
	ctx.fillStyle = '#fff';
	ctx.beginPath();
	ctx.arc(...point, 2, 0, TAU);
	ctx.fill();
	if (!label) {
		return;
	}
	const d = 15;
	const len = vecLen(point);
	if (len === 0) {
		point = vecAdd(point, [ -d, 0 ]);
	} else {
		point = vecAdd(point, scaleVec(point, 1/len*d));
	}
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.font = '14px arial';
	ctx.fillText(label, ...point);
};

const drawArc = (radians, spaces, label) => {
	const s = 5;
	const l = 5;

	ctx.strokeStyle = '#fff';
	ctx.beginPath();
	ctx.arc(0, 0, viewRadius + s*spaces, - radians, 0);
	ctx.stroke();

	if (!label) {
		return;
	}

	const mid = radians/2;
	const dir = [ cos(mid), -sin(mid) ];
	const [ px, py ] = scaleVec(dir, viewRadius + s*spaces + l);

	if (px >= 0) {
		ctx.textAlign = 'left';
	} else {
		ctx.textAlign = 'right';
	}
	if (py >= 0) {
		ctx.textBaseline = 'top';
	} else {
		ctx.textBaseline = 'bottom';
	}
	ctx.font = '14px arial';
	ctx.fillStyle = '#fff';	
	ctx.fillText(label, px, py);
};

const calcPointO = () => {
	const [ ix, iy ] = i;
	const fx = -e;
	const fy = 0;
	const dx = fx - ix;
	const dy = fy - iy;
	const t = solveQuadratic(
		dx*dx + dy*dy,
		2*(ix*dx + iy*dy),
		ix*ix + iy*iy - 1,
	);
	return [ ix + t*dx, iy + t*dy ];
};

const drawLine = (a, b, dash = []) => {
	a = project(a);
	b = project(b);
	ctx.strokeStyle = '#fff';
	ctx.setLineDash(dash);
	ctx.beginPath();
	ctx.moveTo(...a);
	ctx.lineTo(...b);
	ctx.stroke();
	ctx.setLineDash([]);
};

const moveToCorner = () => {
	ctx.setTransform(1, 0, 0, 1, 0, 0);
};

const moveToLeft = () => {
	const { width, height } = canvas;
	ctx.setTransform(1, 0, 0, 1, width*0.25, height*0.5);
};

const moveToRight = () => {
	const { width, height } = canvas;
	ctx.setTransform(1, 0, 0, 1, width*0.75, height*0.5);
};

const fillEllipse = () => {
	ctx.fillStyle = '#345';
	ctx.beginPath();
	ctx.ellipse(0, 0, viewRadius, viewH, 0, 0, TAU);
	ctx.fill();
};

const fillCircle = () => {
	ctx.fillStyle = '#345';
	ctx.beginPath();
	ctx.arc(0, 0, viewRadius, 0, TAU);
	ctx.fill();
};

const fillEllipseOrbitArea = () => {
	ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
	ctx.beginPath();
	ctx.lineTo(...project(f));
	ctx.ellipse(0, 0, viewRadius, viewH, 0, TAU - iAng, TAU);
	ctx.fill();
};

const fillCircleOrbitArea = () => {
	ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
	ctx.beginPath();
	ctx.lineTo(...project(f));
	ctx.arc(0, 0, viewRadius, TAU - iAng, TAU);
	ctx.fill();
};

const fillCircleSegment = () => {
	ctx.fillStyle = 'rgba(255, 192, 0, 0.1)';
	ctx.beginPath();
	ctx.arc(0, 0, viewRadius, - iAng, secAng - iAng);
	ctx.fill();
};

const render = () => {
	const { width, height } = canvas;

	f = [-e, 0];
	p = calcEllipseAnglePoint();

	i = [...p];
	i[1] /= h;
	iAng = calcCircleAng(i);

	o = calcPointO();
	oAng = calcCircleAng(o);

	updateSecAng();

	moveToCorner();
	ctx.clearRect(0, 0, width, height);

	moveToLeft();
	fillEllipse();
	fillEllipseOrbitArea();
	drawAxes();

	drawPoint([ 0, 0 ], 'c');
	drawLine(f, p);
	drawPoint(p, 'p');
	drawPoint(f, 'f');

	moveToRight();
	fillCircle();
	fillCircleSegment();
	fillCircleOrbitArea();

	drawAxes();
	drawPoint([ 0, 0 ], 'c');
	drawPoint(f, 'f');
	drawPoint(i, 'i');
	drawPoint(o, 'o');
	drawLine(i, o, [ 3, 4 ]);
	drawArc(iAng, 1);
	drawArc(oAng, 2);
}

const buildDOM = (tagName, attr) => {
	const dom = document.createElement(tagName);
	for (let key in attr) {
		dom.setAttribute(key, attr[key]);
	}
	return dom;
};

const addRange = ({ label, init, min, max, onchange }) => {
	const input = buildDOM('input', {
		type: 'range',
		min: 0,
		max: 1,
		step: 0.001,
	});
	input.value = (init - min)/(max - min);
	const labelDOM = buildDOM('div', { class: 'label' });
	labelDOM.innerText = label;
	labelDOM.innerHTML += ': <span class="val"></span>';
	const spanVal = labelDOM.querySelector('span');
	spanVal.innerText = init;
	const div = document.createElement('div');
	div.appendChild(labelDOM);
	div.appendChild(input);
	document.body.appendChild(div);
	input.oninput = () => {
		const val = Number((input.value*(max - min) + min).toPrecision(8));
		onchange(val);
		spanVal.innerText = val;
		updateVars();
		render();
	};
};

updateVars();
render();

addRange({
	label: 'Theta',
	init: Number(toDeg(theta).toFixed(3)),
	min: 0,
	max: 360,
	onchange: (val) => theta = toRad(val),
});

addRange({
	label: 'Eccentricity',
	init: e,
	min: 0,
	max: 1,
	onchange: (val) => e = val,
});
