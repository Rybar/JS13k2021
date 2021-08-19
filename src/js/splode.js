function Splode(x,y,life, color){
    this.x = x;
    this.y = y;
    this.lifeMax = life;
    this.life = life;
    this.alive = true;
    this.color = color;
}
Splode.prototype.draw = function(){
   
    r.pat = r.dither[15- Math.floor( (this.life/this.lifeMax) * 15)]
    for(let i = Math.floor(this.life/10); i > 0; i--){
        r.circle(this.x-view.x, this.y-view.y, this.lifeMax-this.life-i, this.color);
    }r.circle(this.x-view.x, this.y-view.y, this.lifeMax-this.life, this.color);
    r.pat = r.dither[0];
}
Splode.prototype.update = function(){
    if(!this.alive){
        return
    }
    if(this.life > 0){
        this.life-=1;
    }
    else {
        this.alive = false;
    }
}

export default Splode;