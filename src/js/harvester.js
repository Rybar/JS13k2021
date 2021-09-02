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
        }else {this.reaching = false;}

    }
    // if(this.radius <= 0){
    //     this.alive = false;
    // }
        
    
}

export default Harvester;