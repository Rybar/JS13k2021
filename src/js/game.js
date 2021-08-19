import RetroBuffer from './retrobuffer.js';
import MusicPlayer from './musicplayer.js';
import song from './song.js';
import cellComplete from './cellComplete.js';
import { playSound, Key, choice, inView } from './utils.js';
//import Stats from './Stats.js';
import Player from './player.js';
import Planet from './planet.js';
import Artifact from './artifact.js';

//stats = new Stats();
//stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom

w = Math.floor(innerWidth/3);
h = Math.floor(innerHeight/3);
view = {
  x: 0,
  y: 0,
}
mw = w/2; mh = h/2;
k=[]
gamestate=0;
paused = false;


p = Player;
p.x = 3000; p.y = 3000;

r = new RetroBuffer(w,h,3);
window.playSound = playSound;
gamebox = document.getElementById("game");
gamebox.appendChild(r.c);
//document.body.appendChild( stats.dom );

window.t = 1;
splodes = [];
planets = [];
sndData = [];
stars = [];
collected = [];
artifacts = [];

sounds = {};
soundsReady = 0;
totalSounds = 2;
audioTxt = "";
debugText = "";

function initGameData(){
  for(let i = 0; i < 150; i++){
    let p = new Planet();
    p.x = Math.floor(Math.random()*(6000));
    p.y = Math.floor(Math.random()*(6000));
    p.radius = Math.floor(Math.random()*(100))+20;
    p.field = p.radius + Math.floor(Math.random()*(20)) + 30;
    p.color = Math.floor(Math.random()*(64));
    planets.push(p);
  }

  for(let i = 0; i < 10000; i++){
    stars.push({
      x: Math.floor(Math.random()*(6000)), 
      y: Math.floor(Math.random()*(6000)),
      c: Math.floor(Math.random()*(5))+18
    });
  }
  for(let i = 0; i < 50000; i++){
    stars.push({
      x: Math.floor(Math.random()*(6000)), 
      y: Math.floor(Math.random()*(6000)),
      c: Math.floor(Math.random()*(3))
    });
  }

  planets.push(new Planet(mw-70, mh, 40, 53));
  planets.push(new Planet(mw+100, mh, 70, 54));

  for(let i = 0; i < 100; i++){
    artifacts.push(new Artifact(
      Math.floor(Math.random()*(6000)), 
      Math.floor(Math.random()*(6000)),
      Math.floor(Math.random()*(20)),
      Math.floor(Math.random()*(63))
    ));
  }
    

}

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


/*
  ______                                            ______     __                 __                         
 /      \                                          /      \   |  \               |  \                        
|  $$$$$$\  ______   ______ ____    ______        |  $$$$$$\ _| $$_     ______  _| $$_     ______    _______ 
| $$ __\$$ |      \ |      \    \  /      \       | $$___\$$|   $$ \   |      \|   $$ \   /      \  /       \
| $$|    \  \$$$$$$\| $$$$$$\$$$$\|  $$$$$$\       \$$    \  \$$$$$$    \$$$$$$\\$$$$$$  |  $$$$$$\|  $$$$$$$
| $$ \$$$$ /      $$| $$ | $$ | $$| $$    $$       _\$$$$$$\  | $$ __  /      $$ | $$ __ | $$    $$ \$$    \ 
| $$__| $$|  $$$$$$$| $$ | $$ | $$| $$$$$$$$      |  \__| $$  | $$|  \|  $$$$$$$ | $$|  \| $$$$$$$$ _\$$$$$$\
 \$$    $$ \$$    $$| $$ | $$ | $$ \$$     \       \$$    $$   \$$  $$ \$$    $$  \$$  $$ \$$     \|       $$
  \$$$$$$   \$$$$$$$ \$$  \$$  \$$  \$$$$$$$        \$$$$$$     \$$$$   \$$$$$$$   \$$$$   \$$$$$$$ \$$$$$$$ 
                                                                                                             
                                                                                                                                                                                                                       
*/
function updateGame(){
  t+=1;
  view.x = p.x - mw;
  view.y = p.y - mh;
  splodes.forEach(e=>e.update());
  planets.forEach(e=>e.update());
  artifacts.forEach(e=>e.update());
  p.update();
  pruneDead(splodes);
  pruneDead(artifacts);
  
}

function drawGame(){
  r.clear(0, r.SCREEN);
  r.renderTarget = r.SCREEN;
  
  stars.forEach(function(e){
    if(inView(e)){
      r.pset(e.x - view.x, e.y-view.y, e.c);
    }
  });

  planets.forEach(e=>e.draw());
  splodes.forEach(e=>e.draw());
  artifacts.forEach(e=>e.draw());
  
  p.draw();

  drawCollected();

  r.render();

}

function titlescreen(){
  r.clear(0,r.SCREEN);
  splodes.forEach(splode=>{splode.draw()})
  //[textstring, x, y, hspacing, vspacing, halign, valign, scale, color, offset, delay, frequency]
  r.text(["UNTITLED SPACE GAME", w/2-2, 50, 1, 3, 'center', 'top', 3, 7]);
  r.text([audioTxt, w/2-2, 90, 1, 3, 'center', 'top', 1, 22]);
  if(Key.justReleased(Key.UP) || Key.justReleased(Key.w) || Key.justReleased(Key.z)){
    if(soundsReady == 0){
    initGameData();
    initAudio();
    }else {
      playSound(sounds.song, 1,0,0.3, true);
      gamestate = 1;
    }
  }; 
  if(soundsReady == totalSounds){
    audioTxt="ALL SOUNDS LOADED.\nCLICK OR PRESS UP/W/Z TO CONTINUE";
  } else if (soundsReady > 0){
    audioTxt = "SOUNDS LOADING... " + soundsReady;
  } else {
    audioTxt = "CLICK TO INITIALIZE\nLOADING SEQUENCE";
  }
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
          initGameData();
          initAudio();
        }else if(soundsReady == totalSounds) {gamestate = 1;playSound(sounds.song, 1,0,0.3, true);}
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

function drawCollected(){
  collected.forEach(function(d, i, a){
    r.rect(5+i*20, h-20, 10, 10, 22);
    r.fillRect(5+i*20, h-20, 10, 10, d.color);
  });
}







function gameloop(){
  if(1==1){
    //stats.begin();
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
    //stats.end();
    requestAnimationFrame(gameloop);
  }
}

gameloop();

