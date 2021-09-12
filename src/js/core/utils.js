export function rand(min, max) {
  return Math.floor(Math.random() * (max + 1 - min) + min);
};

export function choice(values) {
  return values[rand(0, values.length - 1)];
};
export function lerp(a, b, x){
   return a + (b -a ) * x;
}
export function planetCollision(circleA, circleB){
  let distX = circleA.x - circleB.x,
      distY = circleA.y - circleA.y,
      distance = Math.sqrt( (distX*distX) + (distY*distY) );
  return distance < circleA.field + circleB.field;
}

export function doesPlanetHaveCollision(planet, spaceBetween) {
  for(var i = 0; i < planets.length; i++) {
    var otherPlanet = planets[i];
    var a = planet.field + otherPlanet.field + spaceBetween;
    var x = planet.x - otherPlanet.x;
    var y = planet.y - otherPlanet.y;

    if (a >= Math.sqrt((x*x) + (y*y))) {
      return true;
    }
  }
  
  if(planet.x + planet.field >= Ww ||
     planet.x - planet.field <= 0) {
    return true;
  }
    
  if(planet.y + planet.field >= Wh ||
      planet.y - planet.field <= 0) {
    return true;
  }
  
  return false;
}

export function inView(o, padding=0){
  return o.x - view.x + padding > 0 &&
         o.y - view.y + padding > 0 &&
         o.x - view.x - padding < w &&
         o.y - view.y - padding < h
}

export function playSound(buffer, playbackRate = 1, pan = 0, volume = .5, loop = false) {

  var source = window.audioCtx.createBufferSource();
  var gainNode = window.audioCtx.createGain();
  var panNode = window.audioCtx.createStereoPanner();

  source.buffer = buffer;
  source.connect(panNode);
  panNode.connect(gainNode);
  gainNode.connect(audioMaster);

  source.playbackRate.value = playbackRate;
  source.loop = loop;
  gainNode.gain.value = volume;
  panNode.pan.value = pan;
  source.start();
  return {volume: gainNode, sound: source};

}

export const Key = {

  _pressed: {},
  _released: {},

  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  SPACE: 32,
  ONE: 49,
  TWO: 50,
  THREE: 51,
  FOUR: 52,
  a: 65,
  c: 67,
  w: 87,
  s: 83,
  d: 68,
  z: 90,
  x: 88,
  f: 70,
  p: 80,
  r: 82,
  m: 77,
  h: 72,

  isDown(keyCode) {
      return this._pressed[keyCode];
  },

  justReleased(keyCode) {
      return this._released[keyCode];
  },

  onKeydown(event) {
      this._pressed[event.keyCode] = true;
  },

  onKeyup(event) {
      this._released[event.keyCode] = true;
      delete this._pressed[event.keyCode];

  },

  update() {
      this._released = {};
  }
};

