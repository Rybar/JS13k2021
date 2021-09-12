import { inView, playSound, lerp } from './core/utils.js';
import Fuel from './fuel.js';
import Splode from './splode.js';

function Drone(angle, planet){


    this.x = 0;
    this.y = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.radius = 8;
    this.hit = false;
    this.hitCount = 0;
    this.alive = true
    this.health = 600;
    this.reaching = false;
    this.angle = angle;
    this.planet = planet;
    this.harvesters = 3;
    this.apex = {x:0, y:0}
    this.browL = {x:0, y:0}
    this.browR = {x:0, y:0}
    this.armSpeedFactor = 60;
    this.armSpeedTarget = 0;
    this.underAttack = false;


    return this;
}

Drone.prototype.draw = function(){
    
    if(inView(this, 10)){
        r.pat = r.dither[0]

        for(let a = 0; a < 2 * Math.PI; a+= 0.7){
            for(let rad = this.radius; rad < this.radius + 30; rad += 4){
  
              let v = a + .4 * Math.sin(a*8-rad/20+(t/this.armSpeedTarget) );
              r.fillCircle(( this.x-view.x+rad*Math.cos(v)), this.y-view.y+rad*Math.sin(v), ( (this.radius/3)-rad/11)|0, 3 );
              r.circle(( this.x-view.x+rad*Math.cos(v)), this.y-view.y+rad*Math.sin(v), ( (this.radius/3)-rad/11)|0, 4 );
  
            }
          }

        r.fillCircle(this.x-view.x, this.y-view.y, this.radius, 3);
        r.fillCircle(this.x-view.x, this.y-view.y, 15, 22);
        r.fillCircle(this.x-view.x+Math.cos(this.angle+Math.PI)*7, this.y-view.y+Math.sin(this.angle+Math.PI)*7, 3, 1);
        //r.fillTriangle(this.browL, this.browR, this.apex, 3);
        r.circle(this.x-view.x, this.y-view.y, this.radius, 4);


        if(this.reaching){
            this.armSpeedTarget=10;
            let i = 10;
            while(i--){
                r.pat = r.dither[i];
            r.line(this.x - view.x + (Math.random()-0.5) * this.radius*2,
                    this.y - view.y + (Math.random()-0.5) * this.radius*2,
                        p.x - view.x,
                        p.y - view.y,
                        3+Math.random()*5);
            }
        }else{this.armSpeedTarget=60;}
    }

}
Drone.prototype.update = function(){
    


    if(inView(this, -20)){
        p.enemiesInView.push(this);
    }
    if(inView(this, 60)){
        this.targetX = p.x;
        this.targetY = p.y;
        this.x = lerp(this.x, this.targetX, 0.005);
        this.y = lerp(this.y, this.targetY, 0.005);
        this.armSpeedFactor = lerp(this.armSpeedFactor, this.armSpeedTarget, 0.2);

        this.apex.x = this.x - view.x;
        this.apex.y = this.y - view.y - 3;

        this.browL.x = this.x - view.x - 24;
        this.browL.y = this.y - view.y - 18;

        this.browR.x = this.x - view.x + 24;
        this.browR.y = this.y - view.y - 18;

        
        let distx = this.x - p.x;
        let disty = this.y - p.y;

        this.angle = Math.atan2(disty, distx);

        let dist = Math.sqrt(distx*distx + disty*disty);

        if( dist <= this.radius + p.radius + 100){
                p.fuel -= 0.6;
                this.reaching = true;
                p.draining = true;
                harverterSuckSound.volume.gain.value = 0.1;
                if(dist <= this.radius + p.radius){
                    p.fuel -= 150;
                    if(Math.abs(p.xVel + p.yVel)/2 < 2){
                        if(p.fuel > 100){

                            p.score += 1;
                            this.hit = true;
                            this.hitCount += 1;
                            splodes.push(new Splode(this.x, this.y, 40, 5));
                            playSound(sounds.boom1, 3, 0, 0.05, false);
                            
                            p.xVel = Math.cos(p.angle) * 3;
                            p.yVel = Math.sin(p.angle) * 3;
                        }else {
                            splodes.push(new Splode(this.x, this.y, 20, 22));
                            p.xVel = Math.cos(p.angle) * 5;
                            p.yVel = Math.sin(p.angle) * 5;
                            playSound(sounds.bump, 1, 0, 0.4, false);
                        }
                            
                        
                    }
                    
                    

                } 
        }else {this.reaching = false; p.draining = false;}
        if(this.health <= 0){
            this.alive = false;
            p.draining = false;
            drones.splice(drones.indexOf(this), 1);
            splodes.push(new Splode(this.x, this.y, 50, 6));
            splodes.push(new Splode(this.x+Math.random()*5, this.y+Math.random()*5, 60, 7));
            splodes.push(new Splode(this.x+Math.random()*5, this.y+Math.random()*5, 70, 5));
            for(let i = 0; i < 5; i++){
                let f = new Fuel(this.x, this.y, 2);
                f.targetX = this.x + (Math.random()-0.5)*150;
                f.targetY = this.y + (Math.random()-0.5)*150;
                Fuelrocks.push(f);
            }
            playSound(sounds.boom1, 1, 0, 0.1, false);
            
        }

       
        

    }
    // if(this.radius <= 0){
    //     this.alive = false;
    // }
        
    
}

export default Drone;