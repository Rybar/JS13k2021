import { inView } from './utils.js';
import Splode from './splode.js';

function Sector(x,y, planet){
    this.x = x;
    this.y = y;
    this.radius = 0.1;
    this.maxRadius = 15;
    this.alive = true
    this.reaching = false;
    this.angle = 0;
    this.planet = planet;

    return this;
}
Sector.prototype.draw = function(){
    
    if(inView(this, 10)){
        r.pat = r.dither[Math.random() < -0.5 ? 8 : 9];
        r.fillCircle(this.x- view.x, this.y-view.y, this.radius+5, 14);
        r.pat = r.dither[0];
        r.fillCircle(this.x-view.x, this.y-view.y, this.radius, 11);
        if(this.reaching){
            let i = 10;
            while(i--){
                r.pat = r.dither[i];
            r.line(this.x - view.x + (Math.random()-0.5) * this.radius*2,
                    this.y - view.y + (Math.random()-0.5) * this.radius*2,
                        p.x - view.x,
                        p.y - view.y,
                        10+Math.random()*5);
            }
        }
    }
}
Sector.prototype.update = function(){
    
    if(inView(this, 10)){

        let distx = this.x - p.x;
        let disty = this.y - p.y;

        let dist = Math.sqrt(distx*distx + disty*disty);

        if( dist <= this.radius + p.radius + 40 ){
            if(this.radius <= this.maxRadius){
                this.radius += 0.6;
                p.fuel -= 0.6;
                this.planet.disease.splice(0,1);
                this.reaching = true;
            }else{this.reaching = false;}
            
        }else {this.reaching = false;}

        if(this.radius > this.maxRadius){
            this.radius = this.maxRadius;
            if(!this.complete){
                this.complete = true;
                this.planet.sectorsRemaining--;
                splodes.push(new Splode(this.x, this.y, 20, 14));
            }
        }

    }
    

    // if(this.radius <= 0){
    //     this.alive = false;
    // }
        
    
}

export default Sector;