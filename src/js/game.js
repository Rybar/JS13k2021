import RetroBuffer from './retrobuffer.js';
import MusicPlayer from './musicplayer.js';
import song from './song.js';
import cellComplete from './cellComplete.js';
import { playSound, Key } from './utils.js';
import Stats from './Stats.js';
import Splode from './splode.js';

var stats = new Stats();
stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom

const w = Math.floor(innerWidth/3);
const h = Math.floor(innerHeight/3);
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

function drawGame(){
  r.clear(0, r.SCREEN);
  r.renderTarget = r.SCREEN;
  
  splodes.forEach(splode=>{splode.draw()})
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
  stats
  if(!paused){
    stats.begin();
    step();
    drawGame();
    stats.end();
  }
  requestAnimationFrame(gameloop);

}
gameloop();






