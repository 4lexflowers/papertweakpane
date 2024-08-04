/* Delete
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.js'
*/

import paper from 'paper';
import { Pane } from 'tweakpane';

//paper.setup(document.getElementById('myCanvas'));
paper.setup('myCanvas');

// Old Circle
var circle = new paper.Path.Circle({
    center: paper.view.center,
    radius: 100,
    strokeColor: 'green',
    strokeWidth: 5,
    visible: false
});
// New Circle
var circulo = new paper.Path({
  strokeColor: 'red',
  strokeWidth: 5,
  closed: true,
  visible: false
});

// Círculo Personalizado
const numSegments = 32;
const radius = 100;
const center = paper.view.center;
for (let i = 0; i < numSegments; i++) {
    const angle = (i / numSegments) * 2 * Math.PI;
    const x = center.x + Math.cos(angle) * radius;
    const y = center.y + Math.sin(angle) * radius;
    circulo.add(new paper.Point(x, y));
}
circulo.smooth({ type: 'continuous' });

/* Normal Line
var offset = circulo.length;
var point = circulo.getPointAt(offset);
var normal = circulo.getNormalAt(offset).multiply(30);
var line = new paper.Path({
    segments: [point, point.add(normal)],
    strokeColor: 'red',
    strokeWidth: 5
});*/

// Window Resize
paper.view.onResize = function(event) {
	if(!circulo) return
	circulo.position = paper.view.center;
}

var testeC = new paper.Path({
  strokeColor: 'purple',
  strokeWidth: 5,
  closed: true
});

var a = 0;
var myShape = testeC.clone();

paper.view.onFrame = function(event) {
  /* old circle path. doesn't move if you don't rotate
  const frequency = params.frequency;
  for (let i = 0; i < frequency; i++) {
      //const angle = (i / frequency) * 2 * Math.PI + (newAngle*Math.PI/180);
      const angle = (i / frequency) * 2 * Math.PI;
      var x = center.x + Math.cos(angle) * radius;
      var y = center.y + Math.sin(angle) * radius;
      const newPoint = new paper.Point(x, y);
      if(i % 2 == 0) {
        x = center.x + Math.cos(angle) * radius * 1.1;
        y = center.y + Math.sin(angle) * radius * 1.1;
      }
      testeC.add(new paper.Point(x, y));
  }
  */

  myShape.strokeColor = params.color;
  myShape.strokeWidth = params.weight;

  myShape.segments = [];
	var res = params.resolution; // 512 é o valor minimo que o marlus usa
	var freq = params.frequency // é quantas ondinhas vão ter, min 3, sem max
	var ratio = circulo.length / freq // o tamanho de cada ondinha em px
  a += params.speed / 100 // sppeed
  var n = 1 / res * Math.PI * 0.1 // de quanto em quantos px vai ter um point, pra ficar smooth
  var h = params.height // altura das ondas
  var r = params.radius // zoom, ou tamanho do circulo
	
	for(var i = 0; i < 1; i += n ){
		var P = (1-i) * circulo.length;
		var P2 = (P % ratio) / ratio;

		var point = circulo.getPointAt(P);
		var normal = circulo.getNormalAt(P).multiply(h*r/512);
    
		myShape.add(point.add(normal.multiply((1 + Math.sin(a + P2 * 2 * Math.PI)) * 0.5)));
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
const style = pane.addFolder({
  title: 'Style',
});
const waves = pane.addFolder({
  title: 'Waves',
});
const debug = pane.addFolder({
  title: 'Debug',
});
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
    myShape.fillColor = 'none';
  }
});
fillColor.on('change', function(event) {
  if (params.fill) myShape.fillColor = new paper.Color(params.fillColor);
  else myShape.fillColor = 'none';
});
const s = waves.addBinding( params, 'radius', {min: 10, max: paper.view.size.height/2} );
waves.addBinding( params, 'speed', {min: 0, max: 20} );
waves.addBinding( params, 'frequency', {min: 16, max: 64, step: 8} );
waves.addBinding( params, 'resolution', {min: 16, max: 512} );
waves.addBinding( params, 'height', {min: 0, max: 1000} );
debug.addBinding( params, 'showSelection' );
debug.addBinding( params, 'showOrigin' );
s.on('change', function(e) {
  circulo.scale(e.value/(circulo.bounds.width/2));
});