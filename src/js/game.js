/*
TODO:  Prioritized


mini-map
show completed planets
  as percentage or ratio
show # of babies

Credits!
Herebefrogs for detailed feedback and game boilerplate
Yarume for Roadroller
Darthlupi for game design
Soundbox creator for music/sound synth

giant flying drones
  giant flying drones are damaged by complete planets

balance
  tighten up controls
  find goldilocks zone for planet spawn density

 

Visuals/polish

  babies
    alter orbit pattern to something more interesting than circle
    visual/audio feedback for adding a baby to the collection

  harvesters
  shorten hurt sound
  visual feedback for hurt
    change drawing to pointy triangle with tiny eye
    legs?

  player
    Improve leg motion on planet

  nebulae/star clusters
    -different colors put in behind planets after init
    -denser than existing special star groups
      drawn with dithered circles instead of points
  
  shooting stars

  improved/more varied planet drawiing
   -more stencil sheets with striations at different angles
   -simple lighting?

sound design:
  music is expanded upon, more melody

intelligent entity placement
  DUN -planets are placed in world with no overlap



*/

import RetroBuffer from './core/RetroBuffer.js';
import MusicPlayer from './musicplayer.js';


//sound assets
import song from './sounds/song.js';
import cellComplete from './sounds/cellComplete.js';
import tada from './sounds/tada.js';
import absorbray from './sounds/absorbray.js';
import boom1 from './sounds/boom1.js';
import jet from './sounds/jet.js';
import sectorget from './sounds/sectorget.js';
import bump from './sounds/bump.js';
import babyaction from './sounds/babyaction.js';
import babyaction2 from './sounds/babyaction2.js';


import dronemoan from './sounds/dronemoan.js';
import harvestermoan from './sounds/harvestermoan.js';

import { playSound, Key, choice, inView, doesPlanetHaveCollision, lerp } from './core/utils.js';
//import Stats from './Stats.js';
import Player from './player.js';
import Planet from './planet.js';
import Baby from './baby.js';
import Artifact from './artifact.js';
import Fuel from './fuel.js';
import Drone from './Drone.js';
import Splode from './splode.js';
import { reset } from 'browser-sync';
window.baby = Baby;
//stats = new Stats();
//stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.style="margin:0; background-color:black; overflow:hidden";
if(innerWidth < 800){
  w = innerWidth;
h = innerHeight;
}else if(innerWidth < 1300){
  w = Math.floor(innerWidth/2);
  h = Math.floor(innerHeight/2);
}else  {
  w = Math.floor(innerWidth/3.5);
h = Math.floor(innerHeight/3.5);
}


wwFactor = 40;
hhFactor = 40;
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
drones = [];

artifacts = [];

sounds = {};
soundsReady = 0;
totalSounds = 8;
audioTxt = "";
debugText = "";
darkness = 0;
planetsComplete = 0;
planetsDiscovered = 0;
absorbSound = {};
harverterSuckSound = {};
sectorFillSound = {};
gameMusicSound = 0;
minimapToggle = false;
procGenStart = 5;
helpToggle = false;

function initGameData(){

  //hand placed items as tutorial area---------------------------------

  let pl = new Planet();
  pl.x = p.x - 100;
  pl.y = p.y - 100;
  pl.radius = 25;
  pl.harvesters = 0;
  planets.push(pl);

  pl = new Planet;
  pl.x = p.x + 200;
  pl.y = p.y - 100;
  pl.radius = 25;
  pl.color = 4;
  pl.harvesters = 0;
  planets.push(pl);

  pl = new Planet;
  pl.x = p.x ;
  pl.y = p.y+ 100;
  pl.radius = 25;
  pl.color = 22;
  pl.harvesters = 0;
  planets.push(pl);

  pl = new Fuel(p.x + 150, p.y, 20);
  Fuelrocks.push(pl);

//---------------------------------------------------------------------

  

  for(let i = 0; i < 1000; i++){
    let p = new Planet()
    p.x = Math.floor( Math.random()*(Ww-w*2)+h); //spawn planets not too close to edge of world
    p.y = Math.floor( Math.random()*(Wh-h*2)+h);

    let radius = Math.max(Math.floor(Math.random()*h*.45), 10);
    p.radius = radius;
    p.field = radius + 45;
    p.harvesters = Math.floor(p.radius/20) + Math.floor(Math.random()*5);
    let c = Math.floor(Math.random()*(55));
    p.color = c;
    collides = true;
    if(doesPlanetHaveCollision(p, 100)){
      continue;
    }
    else{planets.push(p)};
  }
  //a batch of super small planets
  for(let i = 0; i < 100; i++){
    let p = new Planet()
    p.x = Math.floor( Math.random()*(Ww-w*2)+h); //spawn planets not too close to edge of world
    p.y = Math.floor( Math.random()*(Wh-h*2)+h);

    p.radius = 15;
    p.field = p.radius + 45;
    p.harvesters = Math.round(Math.random());
    let c = Math.floor(Math.random()*(55));
    p.color = c;
    collides = true;
    if(doesPlanetHaveCollision(p, 100)){
      continue;
    }
    else{planets.push(p)};
  }
  for(let i = 0; i < 200; i++){  
    let replacePlanet = planets[procGenStart + Math.floor(Math.random()*(planets.length-procGenStart))]; 
    let d = new Fuel(0,0,1);
    d.x = replacePlanet.x;
    d.y = replacePlanet.y;
    d.radius = 10+Math.random()*10;
    planets.splice(planets.indexOf(replacePlanet), 1);
    
    Fuelrocks.push(d);
  }
  for(let i = 0; i < 125; i++){
    let replacePlanet = planets[procGenStart + Math.floor(Math.random()*(planets.length-procGenStart))];
    let d = new Drone();
    d.x = replacePlanet.x;
    d.y = replacePlanet.y;
    d.radius = Math.max(Math.random()*30, 10);
    planets.splice(planets.indexOf(replacePlanet), 1);
    drones.push(d);
  }

  for(let i = 0; i < 5000; i++){
    let star = [];
    let x = Math.floor(Math.random()*Ww);
    let y = Math.floor(Math.random()*Wh);
    for(let j = 0; j < 10; j++){ 
      let sx = x + (Math.random()-0.5)*100;
      let sy = y + (Math.random()-0.5)*100;
      star.push({x:sx, y:sy, c:Math.floor(Math.random()*(5))+18});
    }
    stars.push({x:x, y:y, star:star});
  }

  for(let i = 0; i < 30000; i++){
    let star = [];
    let x = Math.floor(Math.random()*Ww);
    let y = Math.floor(Math.random()*Wh);
    for(let j = 0; j < 10; j++){ 
      let sx = x + (Math.random()-0.5)*100;
      let sy = y + (Math.random()-0.5)*100;
      star.push({x:sx, y:sy, c:choice([30,31,43,1])});
    }
    stars.push({x:x, y:y, star:star});
  }

  //Green stardust behind fuel rocks
  Fuelrocks.forEach(function(f){
    let star = [];
    for(let j = 0; j < 300; j++){ 
      let sx = f.x + Math.cos(Math.random()*Math.PI*2)*Math.random()*100;
      let sy = f.y + Math.sin(Math.random()*Math.PI*2)*Math.random()*100;
      star.push({x:sx, y:sy, c:choice([14,15,16])});  
    }
    stars.push({x:f.x, y:f.y, star:star});
  });

 //red stardust behind drones
  drones.forEach(function(f){
    let star = [];
    for(let j = 0; j < 300; j++){ 
      let sx = f.x + Math.cos(Math.random()*Math.PI*2)*Math.random()*150;
      let sy = f.y + Math.sin(Math.random()*Math.PI*2)*Math.random()*150;
      star.push({x:sx, y:sy, c:choice([3,4,5])});  
    }
    stars.push({x:f.x, y:f.y, star:star});
  });

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
    {name:'bump', data: bump},
    {name:'dronemoan', data: dronemoan},
    {name:'harvestermoan', data: harvestermoan},
    {name:'babyaction', data: babyaction},
    {name:'babyaction2', data: babyaction2},

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
  if(mapTriggered){
    scale = wwFactor;
    mapTriggered = false;
  }
  
  scaleTarget = 3;
  scale = lerp(scale, scaleTarget, 0.5);
  r.pal = r.palDefault
  r.fillRect(0,0,w,h,0);
  let mapFactorW = wwFactor/scale;
  let mapFactorH = hhFactor/scale;
  view.x = p.x - mw*mapFactorW;
  view.y = p.y - mh*mapFactorH;
  let mapViewX = (view.x)/mapFactorW;
  let mapViewY = (view.y)/mapFactorH;

  r.pat = r.dither[8]
  stars.forEach(function(e, i){
    if(i%2 == 0){
      if(inView(e, mapFactorW*Ww)){
        if(i%5 ==0){
          e.star.forEach(function(s, i){
            r.pset(s.x/mapFactorW - mapViewX, s.y/mapFactorH-mapViewY, 1);
          })
        }
      }
    }
  });
  r.pat = r.dither[0];

  planets.forEach(function(p){
    r.fillCircle(
      p.x/mapFactorW - mapViewX,
      p.y/mapFactorH - mapViewY,
      Math.max( (p.radius/mapFactorW), 2),
      p.sectorsRemaining==0?p.color:2
      );
    if(p.sectorsRemaining==0){
      r.circle(p.x/mapFactorW - mapViewX, p.y/mapFactorH - mapViewY,  Math.max( (p.radius/mapFactorW), 2), 19);
    }
  });

  Fuelrocks.forEach(function(f){
    r.pset(f.x/mapFactorW - mapViewX, f.y/mapFactorH - mapViewY, 10);
    r.pset(f.x/mapFactorW - mapViewX+1, f.y/mapFactorH - mapViewY, 10);
    r.pset(f.x/mapFactorW - mapViewX-1, f.y/mapFactorH - mapViewY, 10);
    r.pset(f.x/mapFactorW - mapViewX, f.y/mapFactorH+1 - mapViewY, 10);
    r.pset(f.x/mapFactorW - mapViewX, f.y/mapFactorH-1 - mapViewY, 10);
  });
  harvesters.forEach(function(f){
    r.pset(f.x/mapFactorW - mapViewX, f.y/mapFactorH - mapViewY, 4)
  });
  drones.forEach(function(f){
    r.fillCircle(f.x/mapFactorW - mapViewX, f.y/mapFactorH - mapViewY,  1, 4);
  });

  if(t%2==0){ r.pset(p.x/mapFactorW, p.y/mapFactorH, 9);
  r.pset((p.x/mapFactorW)+1-mapViewX, (p.y/mapFactorH)+1-mapViewY, 22);
  r.pset((p.x/mapFactorW)-1-mapViewX, (p.y/mapFactorH)-1-mapViewY, 22);
  r.pset((p.x/mapFactorW)-1-mapViewX, (p.y/mapFactorH)+1-mapViewY, 22);
  r.pset((p.x/mapFactorW)+1-mapViewX, (p.y/mapFactorH)-1-mapViewY, 22);
  r.pset((p.x/mapFactorW)+2-mapViewX, (p.y/mapFactorH)+2-mapViewY, 22);
  r.pset((p.x/mapFactorW)-2-mapViewX, (p.y/mapFactorH)-2-mapViewY, 22);
  r.pset((p.x/mapFactorW)-2-mapViewX, (p.y/mapFactorH)+2-mapViewY, 22);
  r.pset((p.x/mapFactorW)+2-mapViewX, (p.y/mapFactorH)-2-mapViewY, 22);
  }

  r.text([`${planetsDiscovered}/${planets.length} PLANETS DISCOVERED  ${planetsComplete} PLANETS COMPLETE`, w/2, 15, 1, 3, 'center', 'top', 1, 7]);
}

function drawHUD(){
  fuelBarWidth = (p.fuel/p.maxFuel)*(w/2);
  
  r.fillRect(w/4 , 10, w/2, 3, 2);
  r.fillRect(w/4, 10, fuelBarWidth, 3, 12);
  
}

function drawHelp(){

  playerHelpText = "W/Z/UP TO THRUST\nAD/QD TO TURN"
 
  if(t%300<150 && p.fuel < 5){
    playerHelpText = "FIND ENERGY MASS TO ABSORB\nOR TRAVEL NEAR COMPLETE PLANETS\nTO RECHARGE"
  }
  
  if(p.withinPlanetGravity){

    if(p.planet.sectorsRemaining>0){

      if(p.planet.harvesters > 0){
        playerHelpText = "THE RED CAN ONLY\nBE KILLED BY PLANET SPRITES"
        
      }else{
        if(t%300<150){
          playerHelpText =  "CHARGE UP PLANET NODES\nTO COMPLETE PLANETS"
        } else {
          playerHelpText="COMPLETING A PLANET GIVES\nYOU A PLANET SPRITE"
        }
      }
    }else{
      playerHelpText = "COMPLETED PLANETS RECHARGE\nYOUR ENERGY WHEN CLOSE"
      if(t%300<150){
        playerHelpText = "PLANET SPRITES FOLLOW YOU\nFOREVER AND ATTACK THE RED"
      }
    }
  }

  if(p.draining){
    playerHelpText = "THE RED DRAIN YOUR ENERGIES\nKEEP YOUR DISTANCE"
  }

  r.text([playerHelpText, p.x-view.x, p.y-view.y+20, 1, 3, 'center', 'top', 1, 7]);
  r.text(["ENERGY REMAINING", w/2, 15, 1, 3, 'center', 'top', 1, 7]);

  r.pat = r.dither[12];
  r.circle(mw, mh, mh-10, 7);
  r.pat = r.dither[0];
  r.text(["HUD INDICATES\nNEARBY PLANETS", mw+(mh), mh+mh/2, 1, 3, 'right', 'top', 1, 7]);
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
  drones.forEach(e=>e.update());
  p.update();
  pruneDead(splodes);
  pruneDead(artifacts);
  pruneDead(Fuelrocks);
  pruneDead(planetSectors);
  pruneDead(harvesters);
  pruneDead(babies);
  pruneDead(drones);
  pruneScreen(p.enemiesInView);
  pruneDead(p.enemiesInView);

  if(Key.justReleased(Key.m)){
    minimapToggle = !minimapToggle;
    mapTriggered = true;
  }
  if(Key.justReleased(Key.h)){
    helpToggle = !helpToggle;
    
  }
  if(Key.justReleased(Key.r)){
    resetGame();
  }
}

function drawGame(){
  r.pal = r.brightness;
  r.clear(64, r.PAGE_1);
  r.renderTarget = r.PAGE_1;
  
  stars.forEach(function(e){
    if(inView(e, 100)){
      e.star.forEach(function(s){
        r.pset(s.x-view.x, s.y-view.y, s.c);
      })
    }
  });
  Fuelrocks.forEach(e=>e.draw());
  planetSectors.forEach(e=>e.draw());
  planets.forEach(e=>e.draw());
  artifacts.forEach(e=>e.draw());
  harvesters.forEach(e=>e.draw());
  drones.forEach(e=>e.draw());
  splodes.forEach(e=>e.draw());
  babies.forEach(e=>e.draw());



  
  p.draw();

  drawCollected();
  drawHUD();
  if(helpToggle){ drawHelp(); }

  r.text(["M MAP/STATS  H TOGGLE HELP", w-8, h-8, 1, 3, 'right', 'top', 1, 19]);
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
  drones = [];
  r.pat = r.dither[0];
  initGameData();
  p.reset();
  this.triggered = false;
  this.titleInit = false;
  gameState = 2;
}

function preload(){
  r.clear(64, r.PAGE_1);
  r.renderTarget = r.PAGE_1;
  if(soundsReady == totalSounds){
    view.x += 1;
    stars.forEach(function(e){
      if(inView(e, 100)){
        e.star.forEach(function(s){
          r.pset(s.x-view.x, s.y-view.y, s.c);
        })
      }
    });
  }
  
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
      gamestate = 2;
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

function titlescreen(){
  view.x = 0; view.y = 0;
  if(!this.titleInit){
    p.x = w/2-135;
    p.y = 70;
    p.bodyAngle = -Math.PI/3;
  
    for(let i = 0; i < 5; i++){ 
      babies.push(new Baby(p.x, p.y));
    }
    this.titleInit = true;
  }
  //source for letter innards
  r.renderTarget = r.PAGE_3;
  r.fillRect(0,0,w,h, 14);
  r.pat = r.dither[8];
  r.fillRect(0,60,w,80, 15);
  r.pat = r.dither[4];
  r.fillRect(0,65,w,70, 15);
  r.pat = r.dither[2];
  r.fillRect(0,75,w,50, 15);
  r.pat = r.dither[8];
  r.fillRect(0,80,w,40, 16);
  r.pat = r.dither[4];
  r.fillRect(0,85,w,30, 16);
  if(!this.triggered){
    let i = 20;
    while(i--){
      let x = Math.random()*w;
      let y = Math.random()*h;
      splodes.push(new Splode(x, y, 20, 11));
    }
    splodes.forEach(e=>e.draw());
    splodes.forEach(e=>e.update());
  }
  

  r.clear(64, r.PAGE_1);
  r.renderTarget = r.PAGE_1;

  stars.forEach(function(e){
    if(inView(e, 1000)){
      e.star.forEach(function(s){
        r.pset((s.x-view.x)/2, (s.y-view.y)/2, s.c);
      })
    }
  });


  //purple planet horizon, using texture on page_2 made for planets in-game
  r.stencil = true;
  r.stencilSource = r.PAGE_2;
  r.stencilOffset = 27;
  r.fillRect(0,h-(h/10),w,h/10, 0);
  r.stencil = false;
  r.line(0,h-(h/10),w,h-(h/10), 20);
  
  //draw player with orbiting babies next to SPACE
  p.draw();
  babies.forEach(e=>e.draw());
  babies.forEach(e=>e.update());

  //[textstring, x, y, hspacing, vspacing, halign, valign, scale, color, offset, delay, frequency]
  //hacky bevel around text by 1px offset in all directions
  r.text([" SPACE\nGARDEN", w/2-1, 50, 8, 10, 'center', 'top', 9, 12]);
  r.text([" SPACE\nGARDEN", w/2-3, 50, 8, 10, 'center', 'top', 9, 12]);
  r.text([" SPACE\nGARDEN", w/2-2, 51, 8, 10, 'center', 'top', 9, 15]);
  r.text([" SPACE\nGARDEN", w/2-2, 49, 8, 10, 'center', 'top', 9, 11]);

  //draw the animated innards of the title letters
  r.stencil = true;
  r.stencilSource = r.PAGE_3;
  r.stencilOffset = 0;
  r.text([" SPACE\nGARDEN", w/2-2, 50, 8, 10, 'center', 'top', 9, 19]);
  r.stencil = false;
  r.text(["PRESS UP / W / Z TO PLAY", w/2-2, 170, 1, 1, 'center', 'top', 1, 22]);
  
  //we're outside of the gameloop, so gotta clean up
  pruneDead(splodes);

  if(Key.justReleased(Key.UP) || Key.justReleased(Key.w) || Key.justReleased(Key.z)){
    p.reset();
    gamestate = 1;
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
        preload();
        break;
      case 1: //game
        updateGame();
        drawGame();
        break;
      case 2: //game over
        titlescreen();
        break;
    }
    Key.update();
   // stats.end();
    requestAnimationFrame(gameloop);
  }
}


