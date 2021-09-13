import { inView, playSound, lerp } from './core/utils.js';
import Splode from './splode.js';
import Fuel from './fuel';

function Harvester(angle, planet){
    this.x = 0;
    this.y = 0;
    this.radius = 10;
    this.hit = false;
    this.hitCount = 0;
    this.alive = true
    this.health = 100;
    this.reaching = false;
    this.angle = angle;
    this.planet = planet;
    this.attacked = false;

    return this;
}

Harvester.prototype.draw = function(){
    
    if(inView(this, 10)){
        r.fillCircle(this.x-view.x, this.y-view.y, this.radius, 4);
        if(this.reaching){
            let i = 10;
            while(i--){
                r.pat = r.dither[i];
            r.line(this.x - view.x + (Math.random()-0.5) * this.radius*2,
                    this.y - view.y + (Math.random()-0.5) * this.radius*2,
                        p.x - view.x,
                        p.y - view.y,
                        3+Math.random()*5);
            }
        }
    }

}
Harvester.prototype.update = function(){
    this.x = this.planet.x + Math.cos(this.angle) * (this.planet.radius + Math.sin(t/5)*5);
    this.y = this.planet.y + Math.sin(this.angle) * (this.planet.radius + Math.sin(t/5)*5);
    this.angle += 0.01;
    if(inView(this, -20)){
        p.enemiesInView.push(this);
    }
    if(inView(this, 10)){
        
        let distx = this.x - p.x;
        let disty = this.y - p.y;

        let dist = Math.sqrt(distx*distx + disty*disty);

        if( dist <= this.radius + p.radius + 20){
                p.fuel -= 0.6;
                p.draining = true;
                this.reaching = true;
                harverterSuckSound.volume.gain.value = 0.1;
                if(dist <= this.radius + p.radius){
                    
                    if(Math.abs(p.xVel + p.yVel)/2 < 2){
                        splodes.push(new Splode(this.x, this.y, 20, 22));
                        p.xVel = Math.cos(p.angle) * 4;
                        p.yVel = Math.sin(p.angle) * 4;
                        playSound(sounds.bump, 1, 0, 0.4, false);
                    }
                } 
        }else {this.reaching = false; p.draining = false;}
        if(this.health < 100 && !this.attacked){
            playSound(sounds.harvestermoan, 2, 0, 0.2, false);
            this.attacked = true;
        }
        if(this.health <= 0){
            this.alive = false;
            p.draining = false;
            this.planet.harvesters--;
            harvesters.splice(harvesters.indexOf(this), 1);
            splodes.push(new Splode(this.x, this.y, 50, 6));
            splodes.push(new Splode(this.x+Math.random()*5, this.y+Math.random()*5, 60, 7));
            splodes.push(new Splode(this.x+Math.random()*5, this.y+Math.random()*5, 70, 5));
            playSound(sounds.boom1, 1, 0, 0.1, false);
            for(let i = 0; i < 2; i++){
                let f = new Fuel(this.x, this.y, 2);
                f.targetX = this.x + Math.random()*90;
                f.targetY = this.y + Math.random()*90;
                Fuelrocks.push(f);
            }
            
        }

       
        

    }
    // if(this.radius <= 0){
    //     this.alive = false;
    // }
        
    
}

export default Harvester;