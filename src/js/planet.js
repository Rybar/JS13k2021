function Planet(x,y, radius, color){
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    return this;
}
Planet.prototype.draw = function(){
    r.fillCircle(this.x, this.y, this.radius, this.color);
}
Planet.prototype.update = function(){
    let distx = this.x - p.x;
    let disty = this.y - p.y;
    let dist = Math.sqrt(distx*distx + disty*disty);
    if( dist <= this.radius + p.radius ){
        p.colliding = true;
        p.onPlanet(this);
    }else {
        p.colliding = false;
    }
}

export default Planet;