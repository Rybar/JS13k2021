import { inView } from './utils.js';
import Splode from './splode.js';

function Fuel(x,y, radius){
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.alive = true
    this.reaching = false;
    

    return this;
}
Fuel.prototype.draw = function(){
    
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
Fuel.prototype.update = function(){
    
    if(inView(this, 10)){

        let distx = this.x - p.x;
        let disty = this.y - p.y;

        this.dist = Math.sqrt(distx*distx + disty*disty);
        if( this.dist <= this.radius + p.radius + 40 ){

            this.radius -= 0.1;
            p.fuel += 0.1;
            this.reaching = true;
            
        }else {this.reaching = false;}

    }
    
    if(this.radius <= 0){
        this.alive = false;
    }
        
    
}

export default Fuel;