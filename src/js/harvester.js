import { inView } from './utils.js';
import Splode from './splode.js';

function Harvester(angle, planet){
    this.x = 0;
    this.y = 0;
    this.radius = 10;
    this.hit = false;
    this.hitCount = 0;
    this.alive = true
    this.reaching = false;
    this.angle = angle;
    this.planet = planet;

    return this;
}

Harvester.prototype.draw = function(){
    
    if(inView(this, 10)){
        r.fillCircle(this.x-view.x, this.y-view.y, this.radius, 4);
    }

}
Harvester.prototype.update = function(){
    this.x = this.planet.x + Math.cos(this.angle) * this.planet.radius;
    this.y = this.planet.y + Math.sin(this.angle) * this.planet.radius;
    this.angle += 0.01;
    
    if(inView(this, 10)){

        let distx = this.x - p.x;
        let disty = this.y - p.y;

        let dist = Math.sqrt(distx*distx + disty*disty);

        if( dist <= this.radius + p.radius + 10){
                p.fuel -= 0.6;
                this.reaching = true;
                if(dist <= this.radius + p.radius){
                    //this hit logic doesn't work yet....
                    console.log(this.angle - p.angle-Math.PI);
                    if(Math.abs(this.angle - p.angle-Math.PI) < 2){
                        p.score += 1;
                        this.hit = true;
                        this.hitCount += 1;
                        if(this.hitCount > 3){
                            this.alive = false;
                            this.planet.harvesters.splice(this.planet.harvesters.indexOf(this), 1);
                            splode = new Splode(this.x, this.y, 20, 6);
                            splode.draw();
                        }
                    }
                    p.xVel = Math.cos(p.angle) * 5;
                    p.yVel = Math.sin(p.angle) * 5;
                    

                } 
        }else {this.reaching = false;}
        
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
    // if(this.radius <= 0){
    //     this.alive = false;
    // }
        
    
}

export default Harvester;