import Splode from './splode.js';

function Planet(x,y, radius, color){
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.field = this.radius + 30;
    this.color = color;
    this.gravity = 0.1;
    return this;
}
Planet.prototype.draw = function(){
    r.fillCircle(this.x, this.y, this.radius, this.color);
    r.circle(this.x, this.y, this.field, 1);
}
Planet.prototype.update = function(){
    let distx = this.x - p.x;
    let disty = this.y - p.y;

    let dist = Math.sqrt(distx*distx + disty*disty);
    if( dist <= this.field + p.radius ){

        if(!p.withinPlanetGravity){
            p.onPlanet(this);
        }   

    }
    
    
}

export default Planet;