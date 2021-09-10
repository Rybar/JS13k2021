import RetroBuffer from './core/RetroBuffer.js';
import MusicPlayer from './musicplayer.js';
import song from './sounds/song.js';
import cellComplete from './sounds/cellComplete.js';
import tada from './sounds/tada.js';
import absorbray from './sounds/absorbray.js';
import boom1 from './sounds/boom1.js';
import jet from './sounds/jet.js';
import sectorget from './sounds/sectorget.js';
import bump from './sounds/bump.js';
import { playSound, Key, choice, inView, planetCollision } from './core/utils.js';
//import Stats from './Stats.js';
import Player from './player.js';
import Planet from './planet.js';
import Baby from './baby.js';
import Artifact from './artifact.js';
import Fuel from './fuel.js';
window.baby = Baby;
//stats = new Stats();
//stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom


/*
Interstellar Planet Pollinator
collect resources to turn into planet food. 
planets will have a different number of sectors to be pollinated depending on circumference.
planet object will track sector pollination status
pollinated: complete


harvest bots are obstacles walking each planet disable them by overpollinating the surface they walk on.
harvest flyers travel through space collecting free-floating energy, and will follow you to drain you if you get too close.

babies!
-completing a planet give you a baby planet soul.  
-these trail you/orbit you, and actively attack nearby harvester bots on planets and in space

no shooting! (unless it becomes apparent after implementation of mechanics that its not fun)



TODO:  Prioritized

Smaller world.
world reset function
energy bar is always draining
completed planets refill energy bar when flying near
completing planets grants you a baby
babies orbit you
  babies attack nearby harvesters
  babies respawn in orbit around you if offscreen
giant flying drones
  giant flying drones follow you around
  giant flying drones drain your energy when close enough

level complete transition
tutorial worlds

Visuals
  player
  Improve leg motion on planet

DUN -proximity to enemy rovers drains pollen from you.
  DUN draw red 'lasers' when you're close to an enemy rover

sound design:
  music is expanded upon, more melody

intelligent entity placement
  DUN -planets are placed in world with no overlap

*/


w = Math.floor(innerWidth/3.5);
h = Math.floor(innerHeight/3.5);
wwFactor = 35;
hhFactor = 35;
Ww = w * wwFactor;
Wh = h * hhFactor;
view = {
  x: 0,
  y: 0,
}
mw = w/2; mh = h/2;
gamestate=0;
paused = false;
started=false;


p = Player;
p.x = Ww/2; p.y = Wh/2;
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
  window.r = new RetroBuffer(w, h, atlas, 10);
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
Fuelrocks = [];
planetSectors = [];
harvesters = [];
stars = [];
collected = [];
babies = [];


artifacts = [];

sounds = {};
soundsReady = 0;
totalSounds = 8;
audioTxt = "";
debugText = "";
darkness = 0;
absorbSound = {};
harverterSuckSound = {};
sectorFillSound = {};
gameMusicSound = 0;
minimapToggle = false;

function initGameData(){

  let pl = new Planet();
  pl.x = p.x - 100;
  pl.y = p.y - 100;
  pl.radius = 25;
  planets.push(pl);

  pl = new Planet;
  pl.x = p.x + 200;
  pl.y = p.y - 100;
  pl.radius = 40;
  pl.harvesters = 2;

  planets.push(pl);


  for(let i = 0; i < 100; i++){
    Fuelrocks.push(new Fuel(Math.random()*Ww, Math.random()*Wh, Math.random()*10));
  }

  for(let i = 0; i < 1000; i++){
    let p = new Planet()
    p.x = Math.floor( Math.random()*(Ww-h*2)+h); //spawn planets not too close to edge of world
    p.y = Math.floor(Math.random()*(Ww-h*2)+h);
    p.radius = Math.min(Math.floor(Math.random()*h/2*.9+20), h/2); // radius of planet, no bigger than roughly 80% of screen height
    p.harvesters = 1 + Math.floor(Math.random()*5);
    let c = Math.floor(Math.random()*(55));
    p.color = c;
    collides = true;
    tries = 6000;
    while(collides && tries--){
      p.x = Math.floor(Math.random()*(Ww));
      p.y = Math.floor(Math.random()*(Wh));
      p.radius = Math.max(p.radius--, 15);  // radius of planet, no bigger than 2/3 of screen height
      p.field = p.radius + 45;
      collides = planets.some(planetInArray =>{return planetCollision(p, planetInArray)})
    }
    if(!collides){planets.push(p)}
  }

  for(let i = 0; i < 10000; i++){
    stars.push({
      x: Math.floor(Math.random()*(Ww)), 
      y: Math.floor(Math.random()*(Wh)),
      c: Math.floor(Math.random()*(5))+18
    });
  }
  for(let i = 0; i < 50000; i++){
    stars.push({
      x: Math.floor(Math.random()*(Ww)), 
      y: Math.floor(Math.random()*(Wh)),
      c: Math.floor(Math.random()*(3))
    });
  }


  // for(let i = 0; i < 100; i++){
  //   artifacts.push(new Artifact(
  //     Math.floor(Math.random()*(Ww)), 
  //     Math.floor(Math.random()*(Wh)),
  //     Math.floor(Math.random()*(20)),
  //     Math.floor(Math.random()*(63))
  //   ));
  // }
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
  
  let i = 50000;
  
  r.pat = r.dither[0];
  while(i--){
    r.renderTarget = r.PAGE_2;
    let x = Math.random()*(w);
    let y =  Math.random()*(h);
    let c = r.pget(x,y, r.PAGE_2);
    r.line(x, y, x+Math.random()*10, y+4, c);
  }
  r.pat = r.dither[0];
  r.renderTarget = r.SCREEN;

}

function initAudio(){
  audioCtx = new AudioContext;
  audioMaster = audioCtx.createGain();
  compressor = audioCtx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-60, audioCtx.currentTime);
    compressor.knee.setValueAtTime(40, audioCtx.currentTime); 
    compressor.ratio.setValueAtTime(12, audioCtx.currentTime);
    compressor.attack.setValueAtTime(0, audioCtx.currentTime);
    compressor.release.setValueAtTime(0.25, audioCtx.currentTime);

  audioMaster.connect(compressor);
  compressor.connect(audioCtx.destination);

  sndData = [
    {name:'song', data: song},
    {name:'cellComplete', data: cellComplete},
    {name:'tada', data: tada},
    {name:'boom1', data: boom1},
    {name:'jet', data: jet},
    {name:'absorbray', data: absorbray},
    {name:'sectorget', data: sectorget},
    {name:'bump', data: bump}

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

function drawMiniMap(){
  r.pal = r.palDefault
  r.fillRect(0,0,w,h,0);

  planets.forEach(function(p){
    r.fillCircle(p.x/wwFactor, p.y/hhFactor, (p.radius/wwFactor)+1, p.sectorsRemaining==0?p.color:40);
    if(p.sectorsRemaining==0){
      r.circle(p.x/wwFactor, p.y/hhFactor, (p.radius/wwFactor)+1, 19);
    }
  });

  // Fuelrocks.forEach(function(f){
  //   r.pset(f.x/wwFactor, f.y/hhFactor, 2);
  // });p.color

  if(t%2==0){ r.pset(p.x/wwFactor, p.y/wwFactor, 9);
  r.pset((p.x/wwFactor)+1, (p.y/wwFactor)+1, 22);
  r.pset((p.x/wwFactor)-1, (p.y/wwFactor)-1, 22);
  r.pset((p.x/wwFactor)-1, (p.y/wwFactor)+1, 22);
  r.pset((p.x/wwFactor)+1, (p.y/wwFactor)-1, 22);
  r.pset((p.x/wwFactor)+2, (p.y/wwFactor)+2, 22);
  r.pset((p.x/wwFactor)-2, (p.y/wwFactor)-2, 22);
  r.pset((p.x/wwFactor)-2, (p.y/wwFactor)+2, 22);
  r.pset((p.x/wwFactor)+2, (p.y/wwFactor)-2, 22);
}

}

function drawHUD(){
  fuelBarWidth = (p.fuel/p.maxFuel)*(w/2);
  
  r.fillRect(w/4 , 10, w/2, 3, 2);
  r.fillRect(w/4, 10, fuelBarWidth, 3, 12);
  
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
  try{
    absorbSound.volume.gain.value = 0;
    harverterSuckSound.volume.gain.value = 0;
    sectorFillSound.volume.gain.value = 0;
  } catch { }

  view.x = p.x - mw;
  view.y = p.y - mh;
  Fuelrocks.forEach(e=>e.update());
  splodes.forEach(e=>e.update());
  planets.forEach(e=>e.update());
  artifacts.forEach(e=>e.update());
  planetSectors.forEach(e=>e.update());
  harvesters.forEach(e=>e.update());
  babies.forEach(e=>e.update());
  p.update();
  pruneDead(splodes);
  pruneDead(artifacts);
  pruneDead(Fuelrocks);
  pruneDead(planetSectors);
  pruneDead(harvesters);
  pruneDead(babies);
  pruneScreen(p.enemiesInView);
  pruneDead(p.enemiesInView);

  if(Key.justReleased(Key.m)){
    minimapToggle = !minimapToggle;
  }
  if(Key.justReleased(Key.r)){
    resetGame();
  }
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
  Fuelrocks.forEach(e=>e.draw());
  planetSectors.forEach(e=>e.draw());
  planets.forEach(e=>e.draw());
  splodes.forEach(e=>e.draw());
  artifacts.forEach(e=>e.draw());
  harvesters.forEach(e=>e.draw());
  babies.forEach(e=>e.draw());
  
  p.draw();

  drawCollected();
  drawHUD();
  r.renderSource = r.PAGE_1;
  r.renderTarget = r.SCREEN;
  r.sspr(0,0,w,h,0,0,w,h,false,false);
  if(minimapToggle){ drawMiniMap() };
  r.render();

}

function resetGame(){
  window.t = 1;
  splodes = [];
  planets = [];
  sndData = [];
  Fuelrocks = [];
  planetSectors = [];
  harvesters = [];
  stars = [];
  collected = [];
  artifacts = [];
  babies = [];
  r.pat = r.dither[0];
  initGameData();
  p.reset();
  gamestate = 0;
}

function titlescreen(){
  r.clear(0, r.PAGE_1);
  r.renderTarget = r.PAGE_1;

  splodes.forEach(splode=>{splode.draw()})
  //[textstring, x, y, hspacing, vspacing, halign, valign, scale, color, offset, delay, frequency]
  r.text(["INTERSTELLAR\nPLANET POLLINATOR", w/2-2, 50, 3, 5, 'center', 'top', 3, 19]);
  r.text([audioTxt, w/2-2, 100, 1, 3, 'center', 'top', 1, 22]);
  if(Key.justReleased(Key.UP) || Key.justReleased(Key.w) || Key.justReleased(Key.z)){
    if(soundsReady == 0 && !started){
    initGameData();
    initAudio();
    started = true;
    }else {
      if(gameMusicSound){gameMusicSound.sound.stop()};
      gameMusicSound = playSound(sounds.song, 1,0,0.3, true);
      absorbSound = playSound(sounds.absorbray, 1, 0, 0.1, true);
      absorbSound.volume.gain.value = 0;
      harverterSuckSound = playSound(sounds.absorbray, 0.5, 0, 0.1, true);
      harverterSuckSound.volume.gain.value = 0;
      sectorFillSound = playSound(sounds.absorbray, 1.5, 0, 0.1, true);
      sectorFillSound.volume.gain.value = 0;
      gamestate = 1;
    }
  }; 
  audioTxt = "CLICK TO INITIALIZE\nGENERATION SEQUENCE";
  if(soundsReady == totalSounds){
    audioTxt="ALL SOUNDS RENDERED.\nPRESS UP/W/Z TO CONTINUE";
  } else if (started){
    audioTxt = "SOUNDS RENDERING... " + soundsReady;
  } else {
    audioTxt = "CLICK TO INITIALIZE\nGENERATION SEQUENCE";
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
        if(soundsReady == 0 && !started){
          initGameData();
          initAudio();
          started = true;
        }
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

function pruneScreen(entitiesArray){
  for(let i = 0; i < entitiesArray.length; i++){
    let e = entitiesArray[i];
    if(!inView(e)){
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
   // stats.end();
    requestAnimationFrame(gameloop);
  }
}


