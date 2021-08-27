import Splode from './splode.js';
import { inView } from './utils.js';

function Planet(){
    this.x = 0;
    this.y = 0;
    this.radius = 5;
    this.field = this.radius + 30;
    this.color = 22;
    this.palette = [0,1,2,3,4,5,6]
    this.gravity = 0.1;
    return this;
}
Planet.prototype.draw = function(){
   r.renderSource = r.PAGE_2;
    if(inView(this, 200)){
        r.pat = r.dither[15];
        r.fillCircle(this.x - view.x, this.y - view.y, this.radius+30, 17);
        r.pat = r.dither[13];
        r.fillCircle(this.x - view.x, this.y - view.y, this.radius+20, 17);
        r.pat = r.dither[11];
        r.fillCircle(this.x - view.x, this.y - view.y, this.radius+8, 17);
        r.pat = r.dither[8];
        r.fillCircle(this.x - view.x, this.y - view.y, this.radius+3, 17);
        r.fillCircle(this.x - view.x, this.y - view.y, this.radius+2, 18);
        r.pat = r.dither[0];
        r.tfillCircle(this.x - view.x, this.y - view.y, this.radius, this.color);
        r.circle(this.x - view.x, this.y - view.y, this.radius, 19);
        r.circle(this.x - view.x, this.y - view.y, this.field, 1);
    }
    
}
Planet.prototype.update = function(){

    if(inView(this, 200)){

        let distx = this.x - p.x;
        let disty = this.y - p.y;

        let dist = Math.sqrt(distx*distx + disty*disty);
        if( dist <= this.field + p.radius ){

            if(!p.withinPlanetGravity){
                p.onPlanet(this);
            }   

        }
    }
        
    
}

export default Planet;