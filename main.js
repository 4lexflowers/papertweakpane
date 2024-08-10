/* SVGs
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
*/

import paper from 'paper';
import { Pane } from 'tweakpane';
import { createNoise2D } from 'simplex-noise';
const noise2D = createNoise2D();

//paper.setup(document.getElementById('myCanvas'));
paper.setup('myCanvas');

// path base para usar de referência
var circulo = new paper.Path({
  strokeColor: 'red',
  strokeWidth: 5,
  closed: true,
  visible: false
});

// criação de círculo personalizado (com vários pontos) ao invés de utilizar Path.Circle
var numSegments = 32;
var radius = 100;
var center = paper.view.center;
for (let i = 0; i < numSegments; i++) {
    var angle = (i / numSegments) * 2*Math.PI;
    var x = center.x + Math.cos(angle) * radius;
    var y = center.y + Math.sin(angle) * radius;
    circulo.add(new paper.Point(x, y));
}
circulo.smooth({ type: 'continuous' });

/* primeiro teste de getNormalAt
var offset = circulo.length;
var point = circulo.getPointAt(offset);
var normal = circulo.getNormalAt(offset).multiply(30);
var line = new paper.Path({
    segments: [point, point.add(normal)],
    strokeColor: 'red',
    strokeWidth: 5
});*/

paper.view.onResize = function(event) {
	if(!circulo) return
	circulo.position = paper.view.center;
}

var reference = new paper.Path({
  strokeColor: 'purple',
  strokeWidth: 5,
  closed: true
});
var myShape = reference.clone(); // necessário para poder alterar o estilo

var numPoints = 48;
var baseRadius = radius;
var noiseOffset = 0.2;
const noiseRef = new paper.Path({
    strokeColor: 'white',
    strokeWidth: 1,
    closed: true
});
for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2;
    const x = center.x + Math.cos(angle) * baseRadius;
    const y = center.y + Math.sin(angle) * baseRadius;
    noiseRef.add(new paper.Point(x, y));
}
var noisedPath = noiseRef.clone();

var a = 0; // ângulo de rotação

paper.view.onFrame = function(event) {
  a += params.speed / 200;
  
  // noise
  baseRadius = params.radius;
  noisedPath.segments = [];
  for(let i = 0; i < params.resolution; i ++){
		const angle = (i / params.resolution) * Math.PI * 2;
    const x = circulo.position.x + Math.cos(angle) * baseRadius;
    const y = circulo.position.y + Math.sin(angle) * baseRadius;

    var noiseValue = noise2D(x + a/2, y + a/2);
    noiseValue = (noiseValue + 1) / 2;
    var realRadius = baseRadius + noiseValue * baseRadius * noiseOffset;
		noisedPath.add(new paper.Point(
      circulo.position.x + Math.cos(angle) * realRadius,
      circulo.position.y + Math.sin(angle) * realRadius
    ));
	}
  if(noisedPath.visible) {
    noisedPath.strokeColor = params.color;
    noisedPath.strokeWidth = params.weight;
  }
  noiseOffset = params.height/500;
  noisedPath.smooth();

  // primeiro teste, esse "newAngle" ajudava a rotacionar, e o if fazia ondas
  /*for (let i = 0; i < params.frequency; i++) {
      const angle = (i / params.frequency) * 2 * Math.PI + (newAngle*Math.PI/180);
      var x = center.x + Math.cos(angle) * radius;
      var y = center.y + Math.sin(angle) * radius;
      const newPoint = new paper.Point(x, y);
      if(i % 2 == 0) {
        x = center.x + Math.cos(angle) * radius * 1.1;
        y = center.y + Math.sin(angle) * radius * 1.1;
      }
      circulo.add(new paper.Point(x, y));
  }*/
  if(myShape.visible) {
    myShape.strokeColor = params.color;
    myShape.strokeWidth = params.weight;
  }

  myShape.segments = [];
	var res = params.resolution; // quantos pontos meu path vai ter
	var freq = params.frequency; // quantas "ondinhas" vão ter
	var ratio = circulo.length / freq; // o tamanho de cada ondinha, em px (eu acho)
  var n = 1 / res * Math.PI * 0.1; // de quanto em quantos px vai ter um point
  var h = params.height; // altura das ondas (distância da origem)
  var r = params.radius; // "zoom", ou seja, raio do círculo original
	
	for(var i = 0; i < 1; i += n ){
		var P = (1-i) * circulo.length;
		var P2 = (P % ratio) / ratio;

		var point = circulo.getPointAt(P);
		var normal = circulo.getNormalAt(P).multiply(r*h/500);
    
    // 1 determina a distância da origem, a aplica a rotação, P2 aplica a frequencia, 0.5 é escala
		myShape.add(point.add(normal.multiply((1 + Math.sin(a + P2 * 2*Math.PI)) * 0.5)));
	}
  myShape.smooth({ type: 'continuous' });

  if(params.showSelection) {
    if(myShape.visible) myShape.fullySelected = true;
    if(noisedPath.visible) noisedPath.fullySelected = true;
  } else {
    if(myShape.visible) myShape.fullySelected = false;
    if(noisedPath.visible) noisedPath.fullySelected = false;
  }

  if(params.showOrigin) {circulo.visible = true; circulo.bringToFront();}
  else circulo.visible = false;
  noiseRef.visible = false;

  if(type.value == "math") {
    myShape.visible = true;
    noisedPath.visible = false;
    noisedPath.fullySelected = false;
    f.disabled = false;
  } else if(type.value == "noise") {
    myShape.visible = false;
    noisedPath.visible = true;
    myShape.fullySelected = false;
    f.disabled = true;
  }

  if(fillType.value == "solid") {
    myShape.fillColor = new paper.Color(params.fillColor);
    noisedPath.fillColor = new paper.Color(params.fillColor);
  } else if(fillType.value == "gradient") {
    var stops = [
      [params.fillColor, 0],
      [params.fillColor2, params.gradientSize]
    ];
    var mygradient = new paper.Gradient(stops, true);
    myShape.fillColor = new paper.Color(mygradient, paper.view.center, paper.view.center.add(params.radius));
    noisedPath.fillColor = new paper.Color(mygradient, paper.view.center, paper.view.center.add(params.radius));
  } else {
    myShape.fillColor = null;
    noisedPath.fillColor = null;
  }
}
  
// Tweakpane
const pane = new Pane({
    container: document.getElementById('pane-container'),
    title: 'parameters'
});
const type = pane.addBlade({
  view: 'list',
  label: 'type',
  options: [
    {text: 'math', value: 'math'},
    {text: 'noise', value: 'noise'}
  ],
  value: 'math'
});
const style = pane.addFolder({ title: 'style' });
const waves = pane.addFolder({ title: 'waves' });
const debug = pane.addFolder({ title: 'debug' });
const params = {
  color: "#e68c1e",
  weight: 5,
  fill: false,
  fillColor: "#ffda3f",
  fillColor2: "#e68c1e",
  gradientSize: 1,
  radius: circulo.bounds.height/2,
  speed: 5,
  frequency: 48,
  resolution: 32,
  height: 500,
  showSelection: false,
  showOrigin: false,
};

style.addBinding( params, 'color' );
style.addBinding( params, 'weight', {min: 1, max: 20} );
const fillOption = style.addBinding( params, 'fill' );
fillOption.hidden = true;
const fillType = style.addBlade({
  view: 'list',
  label: 'fill type',
  options: [
    {text: 'none', value: 'none'},
    {text: 'solid', value: 'solid'},
    {text: 'gradient', value: 'gradient'}
  ],
  value: 'none'
});

const gradientSize = style.addBinding( params, 'gradientSize', {min: 0.1, max: 1} );
const fillColor = style.addBinding( params, 'fillColor' );
const fillColor2 = style.addBinding( params, 'fillColor2' );
gradientSize.hidden = true;
fillColor.hidden = true;
fillColor2.hidden = true;
fillType.on('change', function(event) {
  if (fillType.value == "none") {
    fillColor.hidden = true;
    fillColor2.hidden = true;
    gradientSize.hidden = true;
  } else if (fillType.value == "solid") {
    fillColor.hidden = false;
    fillColor2.hidden = true;
    gradientSize.hidden = true;
    myShape.fillColor = new paper.Color(params.fillColor);
    noisedPath.fillColor = new paper.Color(params.fillColor);
  } else if (fillType.value == "gradient") {
    fillColor.hidden = false;
    fillColor2.hidden = false;
    gradientSize.hidden = false;
    myShape.fillColor = new paper.Color(params.fillColor);
    noisedPath.fillColor = new paper.Color(params.fillColor);
  }
});

const s = waves.addBinding( params, 'radius', {min: 10, max: paper.view.size.height/2} );
s.on('change', function(e) {
  circulo.scale(e.value/(circulo.bounds.width/2));
});

waves.addBinding( params, 'speed', {min: 0, max: 20} );
const f = waves.addBinding( params, 'frequency', {min: 16, max: 64, step: 8} );
waves.addBinding( params, 'resolution', {min: 16, max: 512} );
waves.addBinding( params, 'height', {min: 0, max: 1000} );
debug.addBinding( params, 'showSelection' );
debug.addBinding( params, 'showOrigin' );