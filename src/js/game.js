import RetroBuffer from './retrobuffer.js';
import MusicPlayer from './musicplayer.js';
import song from './song.js';
import cellComplete from './cellComplete.js';
import { playSound, Key } from './utils.js';
import Stats from './Stats.js';
import Splode from './splode.js';

var stats = new Stats();
stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom

const w = 320;
const h = 180;
const mw = w/2; const mh = h/2;
let paused = false;

p = {
  x: 100,
  y: 100
}

p1 = {x: 30, y:30},
p2 = {x: 200, y: 60},
p3 = {x: 90, y: 100};

audioCtx = new AudioContext;
audioMaster = audioCtx.createGain();
audioMaster.connect(audioCtx.destination);

const r = new RetroBuffer(w,h);
window.r = r;
gamebox = document.getElementById("game");
gamebox.appendChild(r.c);
document.body.appendChild( stats.dom );

window.t = 1;

sounds = {};
soundsReady = 0;
  sndData = [
    {name:'song', data: song},
    {name:'cellComplete', data: cellComplete},
    ]
  //music stuff-----------------------------------------------------
      sndData.forEach(function(o){
          var sndGenerator = new MusicPlayer();
          sndGenerator.init(o.data);
          var done = false;
          setInterval(function () {
            if (done) {
              return;
            }
            done = sndGenerator.generate() == 1;
            if(done){
              let wave = sndGenerator.createWave().buffer;
              audioCtx.decodeAudioData(wave, function(buffer) {
                sounds[o.name] = buffer;
                soundsReady++;
                //gameSong = playSound(sounds.song, 1, 0, 0.2, true);
              })
            }
          },0)
    })

function step(){
  t+=1;
  splodes.push(new Splode(Math.random()*w, Math.random()*h, Math.random()*70, 16+Math.random()*4) );

  if(Key.isDown(Key.LEFT)){ p.x -= 1}
  else if(Key.isDown(Key.RIGHT)){p.x += 1}
  if(Key.isDown(Key.UP)){p.y -= 1}
  else if(Key.isDown(Key.DOWN)){p.y += 1}
  if(Key.justReleased(Key.d)){
    for(let i = 10; i > 0; i--){
    splodes.push(new Splode(p.x+Math.random()*20-10, p.y+Math.random()*20-10, Math.random()*70, 20*Math.random()*5) );
    }
    playSound(sounds.cellComplete)
  }
  splodes.forEach(e=>e.update());
  pruneDead(splodes);
  Key.update();
}

splodes = [];
bullets = [];
triangles= [];
for(let i = 0; i < 30; i++){
  let cx = Math.random() *  w,
      cy = Math.random() *  h,
      rad = 100;
      p1x = cx + (Math.random() * 2 - 1) * rad;
      p1y = cy + (Math.random() * 2 - 1) * rad;
      p2x = cx + (Math.random() * 2 - 1) * rad; 
      p2y = cy + (Math.random() * 2 - 1) * rad;
      p3x = cx + (Math.random() * 2 - 1) * rad;
      p3y = cy + (Math.random() * 2 - 1) * rad;

  triangles.push( {
    p1: {x: p1x, y: p1y},
    p2: {x: p2x, y: p2y},
    p3: {x: p3x, y: p3y},
    color: 28 + Math.random() * 3,
    dither: Math.floor(Math.random()*16)
  });

}

function drawTriangleDemo(){
  //r.clear(1, r.SCREEN);
  //r.renderTarget = r.SCREEN;
  
  
  triangles.forEach(function(triangle){
    /*
var rotatedX = Math.cos(angle) * (point.x - center.x) - Math.sin(angle) * (point.y-center.y) + center.x;
var rotatedY = Math.sin(angle) * (point.x - center.x) + Math.cos(angle) * (point.y - center.y) + center.y;

    */
    r.pat = r.dither[14];
    p1.x = Math.cos(t/100) * (triangle.p1.x - mh) - Math.sin(t/100) * (triangle.p1.y - mh) + mh;
    p1.y = Math.sin(t/100) * (triangle.p1.x - mh) + Math.cos(t/100) * (triangle.p1.y - mh) + mh;
    p2.x = Math.cos(t/100) * (triangle.p2.x - mh) - Math.sin(t/100) * (triangle.p2.y - mh) + mh;
    p2.y = Math.sin(t/100) * (triangle.p2.x - mh) + Math.cos(t/100) * (triangle.p2.y - mh) + mh;
    p3.x = Math.cos(t/100) * (triangle.p3.x - mh) - Math.sin(t/100) * (triangle.p3.y - mh) + mh;
    p3.y = Math.sin(t/100) * (triangle.p3.x - mh) + Math.cos(t/100) * (triangle.p3.y - mh) + mh;
    r.pat = r.dither[triangle.dither];
    r.fillTriangle(p1, p2, p3, triangle.color);
    r.triangle(p1,p2,p3,triangle.color-1);

  })
   
  r.render();
}

function drawGame(){
  r.clear(0, r.SCREEN);
  r.renderTarget = r.SCREEN;
  drawTriangleDemo();
  //r.fillCircle(p.x, p.y, 10, 8);
  splodes.forEach(splode=>{splode.draw()})
  bullets.forEach(bullet=>{bullet.draw()})
  //[textstring, x, y, hspacing, vspacing, halign, valign, scale, color, offset, delay, frequency]
  r.pat = r.dither[8]
  r.text(["JS13K", w/2-2, 100+2, 7, 1, 'center', 'center', 8, 7]);
  r.pat = r.dither[0]
  r.text(["JS13K", w/2, 100, 7, 1, 'center', 'center', 8, 8]);
  r.text(["0 DAYS TIL", w/2-2, 50, 3, 1, 'center', 'center', 4, 22]);

  r.render();

}

//initialize  event listeners--------------------------
window.addEventListener('keyup', function (event) {
  Key.onKeyup(event);
}, false);
window.addEventListener('keydown', function (event) {
  Key.onKeydown(event);
}, false);
window.addEventListener('blur', function (event) {
  paused = true;
}, false);
window.addEventListener('focus', function (event) {
  paused = false;
}, false);



function pruneDead(entitiesArray){
  for(let i = 0; i < entitiesArray.length; i++){
    let e = entitiesArray[i];
    if(!e.alive){
      entitiesArray.splice(i,1);
    }
  }
}



function gameloop(){
  if(!paused){
    step();
    drawGame();
  }
  requestAnimationFrame(gameloop);

}
gameloop();






