import RetroBuffer from './retrobuffer.js';
import MusicPlayer from './musicplayer.js';
import song from './song.js';
import cellComplete from './cellComplete.js';
import { playSound, Key } from './utils.js';
import Stats from './Stats.js';
import Splode from './splode.js';

stats = new Stats();
stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom

w = Math.floor(innerWidth/3);
h = Math.floor(innerHeight/3);
mw = w/2; mh = h/2;
k=[]
gamestate=0;
paused = false;


p = {
  x: 100,
  y: 100
}

r = new RetroBuffer(w,h,3);
window.playSound = playSound;
gamebox = document.getElementById("game");
gamebox.appendChild(r.c);
document.body.appendChild( stats.dom );

window.t = 1;
splodes = [];
planets = [];
sndData = [];

sounds = {};
soundsReady = 0;
totalSounds = 2;
audioTxt = "";

function initAudio(){
  console.log('audio initializing');
  audioCtx = new AudioContext;
  audioMaster = audioCtx.createGain();
  audioMaster.connect(audioCtx.destination);

  sndData = [
    {name:'song', data: song},
    {name:'cellComplete', data: cellComplete},
  ]
  totalSounds = sndData.length;
  soundsReady = 0;
  sndData.forEach(function(o){
    var sndGenerator = new MusicPlayer();
    sndGenerator.init(o.data);
    var done = false;
    setInterval(function () {
      if (done) {
        return;
      }
      done = sndGenerator.generate() == 1;
      soundsReady+=done;
      if(done){
        let wave = sndGenerator.createWave().buffer;
        audioCtx.decodeAudioData(wave, function(buffer) {
          sounds[o.name] = buffer;
          //soundsReady++;
        })
      }
    },0)
  })
}

function updateGame(){
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
}

function titlescreen(){
  r.clear(0,r.SCREEN);
  splodes.forEach(splode=>{splode.draw()})
  r.text(["UNTITLED SPACE GAME", w/2-2, 50, 1, 3, 'center', 'top', 3, 7]);
  r.text([audioTxt, w/2-2, 90, 1, 3, 'center', 'top', 1, 22]);
  if(Key.justReleased(Key.UP) || Key.justReleased(Key.W) || Key.justReleased(Key.Z)){
    if(soundsReady == 0){
    initAudio();
    }else {
      playSound(sounds.song, 1,0,0.3, true);
      gamestate = 1;
    }
  }; 
  if(soundsReady == totalSounds){
    audioTxt="ALL SOUNDS LOADED.\nPRESS UP/W/Z TO CONTINUE";
  } else if (soundsReady > 0){
    audioTxt = "SOUNDS LOADING... " + soundsReady;
  } else {
    audioTxt = "CLICK TO INITIALIZE\nLOADING SEQUENCE";
  }
  r.render();
}

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

onclick=e=>{
  x=e.pageX;y=e.pageY;
  paused = false;
  switch(gamestate){
      case 0: // react to clicks on screen 0s
        if(soundsReady == 0){
          initAudio();
        }else if(soundsReady == totalSounds) {gamestate = 1;}
      break;
      case 1: // react to clicks on screen 1
      case 2: // react to clicks on screen 2
      case 3: // react to clicks on screen 3
  }
  }

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
    stats.begin();
    switch(gamestate){
      case 0: //title screen
        titlescreen();
        break;
      case 1: //game
        updateGame();
        drawGame();
        break;
      case 2: //game over
        gameover();
        break;
    }
    Key.update();
    stats.end();
    requestAnimationFrame(gameloop);
  }
}

gameloop();

