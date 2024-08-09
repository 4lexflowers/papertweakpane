/* SVGs
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
*/

import paper from 'paper';
import { Pane } from 'tweakpane';

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

var a = 0; // ângulo de rotação
var myShape = reference.clone(); // necessário para poder alterar o estilo

paper.view.onFrame = function(event) {
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

  myShape.strokeColor = params.color;
  myShape.strokeWidth = params.weight;

  myShape.segments = [];
	var res = params.resolution; // quantos pontos meu path vai ter
	var freq = params.frequency // quantas "ondinhas" vão ter
	var ratio = circulo.length / freq // o tamanho de cada ondinha, em px (eu acho)
  a += params.speed / 100 // velocidade de rotação
  var n = 1 / res * Math.PI * 0.1 // de quanto em quantos px vai ter um point
  var h = params.height // altura das ondas (distância da origem)
  var r = params.radius // "zoom", ou seja, raio do círculo original
	
	for(var i = 0; i < 1; i += n ){
		var P = (1-i) * circulo.length;
		var P2 = (P % ratio) / ratio;

		var point = circulo.getPointAt(P);
		var normal = circulo.getNormalAt(P).multiply(r*h/500);
    
    // 1 determina a distância da origem, a aplica a rotação, P2 aplica a frequencia, 0.5 é escala
		myShape.add(point.add(normal.multiply((1 + Math.sin(a + P2 * 2*Math.PI)) * 0.5)));
	}
  myShape.smooth({ type: 'continuous' });

  if(params.showSelection) myShape.fullySelected = true;
  else myShape.fullySelected = false;
  if(params.showOrigin) circulo.visible = true;
  else circulo.visible = false;
}
  
// Tweakpane
const pane = new Pane({
    container: document.getElementById('pane-container'),
    title: 'Parameters'
});
const style = pane.addFolder({ title: 'Style' });
const waves = pane.addFolder({ title: 'Waves' });
const debug = pane.addFolder({ title: 'Debug' });
const params = {
  color: "#e68c1e",
  weight: 5,
  fill: false,
  fillColor: "#ffda3f",
  radius: circulo.bounds.height,
  speed: 2,
  frequency: 48,
  resolution: 32,
  height: 500,
  showSelection: false,
  showOrigin: false,
};

style.addBinding( params, 'color' );
style.addBinding( params, 'weight', {min: 1, max: 20} );
const fillOption = style.addBinding( params, 'fill' );
const fillColor = style.addBinding( params, 'fillColor' );
fillColor.hidden = true;
fillOption.on('change', function(event) {
  if (params.fill) {
    fillColor.hidden = false;
    myShape.fillColor = new paper.Color(params.fillColor);
  }
  else {
    fillColor.hidden = true;
    myShape.fillColor = null;
  }
});
fillColor.on('change', function(event) {
  if (params.fill) myShape.fillColor = new paper.Color(params.fillColor);
  else myShape.fillColor = null;
});

const s = waves.addBinding( params, 'radius', {min: 10, max: paper.view.size.height/2} );
s.on('change', function(e) {
  circulo.scale(e.value/(circulo.bounds.width/2));
});

waves.addBinding( params, 'speed', {min: 0, max: 20} );
waves.addBinding( params, 'frequency', {min: 16, max: 64, step: 8} );
waves.addBinding( params, 'resolution', {min: 16, max: 512} );
waves.addBinding( params, 'height', {min: 0, max: 1000} );
debug.addBinding( params, 'showSelection' );
debug.addBinding( params, 'showOrigin' );