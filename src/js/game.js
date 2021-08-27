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


/*
Interstellar Planet Pollinator
collect resources to turn into planet food. 
Press down to pollinate the planet. 360 around the planet gets bonus points.
planets will have a different number of sectors to be pollinated depending on circumference.
planet object will track sector pollination status
pollinated: complete
overpollinated: will damage harvest bots as they walk over

ability to escape planets gravity depends on how much planet food you're carrying. emptier tank = higher jump.

harvest bots are obstacles walking each planet disable them by overpollinating the surface they walk on.
the overgrowth will drain them and then consume their bodies
they will do damage if you touch them.

Greeble Artifacts
give bonuses
bonuses:
increased fuel capacity
increased jump strength (threshold is relative much food you have)

no shooting! (unless it becomes apparent after implementation of mechanics that its not fun)
fuel is auto-collected by proxixmity. 
fuel chunk asteroids will shrink as you consume them.


*/


w = Math.floor(innerWidth/4);
h = Math.floor(innerHeight/4);
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
const atlasURL = 'DATAURL:src/img/palette.webp';
atlasImage = new Image();
atlasImage.src = atlasURL;

atlasImage.onload = function(){ 
  let c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  let ctx = c.getContext('2d');
  ctx.drawImage(this, 0, 0);
  atlas = new Uint32Array( ctx.getImageData(0,0,64, 64).data.buffer );
  console.log(atlas);
  window.r = new RetroBuffer(w, h, atlas, 10);
  console.log(window.r);
  gameInit();
};

function gameInit(){
  window.playSound = playSound;
  gamebox = document.getElementById("game");
  gamebox.appendChild(r.c);
  gameloop();
}

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
darkness = 0; 

function initGameData(){
  for(let i = 0; i < 500; i++){
    let p = new Planet();
    p.x = Math.floor(Math.random()*(12000));
    p.y = Math.floor(Math.random()*(12000));
    p.radius = Math.floor(Math.random()*( (h-25)/2 ))+10;
    p.field = p.radius + Math.floor(Math.random()*(20)) + 30;
    let c = Math.floor(Math.random()*(55));
    p.color = c;
    planets.push(p);
    //console.log(p);
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


  for(let i = 0; i < 100; i++){
    artifacts.push(new Artifact(
      Math.floor(Math.random()*(6000)), 
      Math.floor(Math.random()*(6000)),
      Math.floor(Math.random()*(20)),
      Math.floor(Math.random()*(63))
    ));
  }
  //populate buffer with something to fill planets with
  r.renderTarget = r.PAGE_2;
  r.pal = r.palDefault;
  r.fillRect(0,0,w,h,1);
  
 
  for(let i = 0; i < 5000; i++){
    r.pat = r.dither[(Math.floor(Math.random()*(15)))];
    r.fillCircle(Math.random()*(w), Math.random()*(h), Math.random()*(4), Math.floor(Math.random()*(5)));
  }
  for(let i = 0; i < 500; i++){
    r.pat = r.dither[(Math.floor(Math.random()*(15)))];
    r.fillCircle(Math.random()*(w), Math.random()*(h), Math.random()*(20), Math.floor(Math.random()*(7)));
   
  }
  r.pat = r.dither[0];
  r.line(mw, mh-10, mw, mh+10, 0);
  r.line(mw-10, mh, mw+10, mh, 0);
  r.renderTarget = r.SCREEN;

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
  r.pal = r.brightness.slice(64*darkness, 64*darkness + 64);
  r.clear(0, r.PAGE_1);
  r.renderTarget = r.PAGE_1;
  
  stars.forEach(function(e){
    if(inView(e)){
      r.pset(e.x - view.x, e.y-view.y, e.c);
    }
  });

  planets.forEach(e=>{
    //r.pal = e.palette;
    e.draw()
    //r.pal = r.palDefault;
  });
  splodes.forEach(e=>e.draw());
  artifacts.forEach(e=>e.draw());
  
  p.draw();

  drawCollected();
  r.renderSource = r.PAGE_1;
  r.renderTarget = r.SCREEN;
  r.sspr(0,0,w,h,0,0,w,h,false,false);
  r.render();

}

function titlescreen(){
  r.clear(0, r.PAGE_1);
  r.renderTarget = r.PAGE_1;

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
  r.renderSource = r.PAGE_1;
  r.renderTarget = r.SCREEN;
  r.sspr(0,0,w,h,0,0,w,h,false,false);
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


