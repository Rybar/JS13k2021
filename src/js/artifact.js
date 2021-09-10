import { inView } from './core/utils.js';
import Splode from './splode.js';

function Artifact(x,y, radius, color){
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.alive = true;
    
    this.color = color;
    this.drawStack = [];

    //cache this in r.Spritesheet page
    for(let i = 0; i < 20; i++){
       this.drawStack.push({
           x: this.x + (Math.random()*2-1) * this.radius,
           y: this.y + (Math.random()*2-1) * this.radius,
           w: Math.random() * this.radius,
           h: Math.random() * this.radius,
           color: this.color + Math.random()*3
       })
    }

    return this;
}
Artifact.prototype.draw = function(){
    
    if(inView(this, 200)){
        r.pat = r.dither[0];
        this.drawStack.forEach(function(d){
            r.fillRect(d.x-view.x, d.y-view.y, d.w, d.h, d.color);
        })
    }
}
Artifact.prototype.update = function(){

    if(inView(this, 200)){

        let distx = this.x - p.x;
        let disty = this.y - p.y;

        let dist = Math.sqrt(distx*distx + disty*disty);
        if( dist <= this.radius + p.radius ){

            this.alive = false;
            for(let i = 10; i > 0; i--){
                splodes.push(new Splode(p.x+Math.random()*20-10, p.y+Math.random()*20-10, Math.random()*70, 20*Math.random()*5) );
            }
            playSound(sounds.cellComplete)
            collected.push(this);

        }
    }
        
    
}

export default Artifact;