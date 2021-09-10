import { inView, playSound, lerp, choice } from './core/utils.js';
import Splode from './splode.js';
const HOME = 0;
const SEEKING = 1;
const ATTACKING = 2;

function Baby(x,y){

    

    this.state = 0;
    this.angle = 0;
    this.targetAngle = 0;

    this.x = x;
    this.y = y;
    this.targetX = 0;
    this.targetY = 0;

    this.alive = true;

    this.updateOrbits();

    return this;
}

Baby.prototype.draw = function(){
    
    if(inView(this, 10)){
        r.fillCircle(this.x-view.x, this.y-view.y, 2, 22);
    }

}
Baby.prototype.update = function(){

    if(!inView(this, 20)){
        this.state = HOME;
    }

    this.targetAngle += 0.015;
    //this.state = HOME;
    if(p.enemiesInView.length > 0 && this.state != ATTACKING){
        this.enemyTarget = choice(p.enemiesInView);
        this.state = ATTACKING;
    }else if(p.enemiesInView.length == 0) {
        this.state = HOME;
    }

    switch(this.state){

        case HOME:
            this.targetX = p.x + Math.cos(this.angle) * (p.radius + 7+babies.length-p.xVel); 
            this.targetY = p.y + Math.sin(this.angle) * (p.radius + 7+babies.length-p.yVel); 
            
        break;

        case ATTACKING:
            this.targetX = this.enemyTarget.x + Math.cos(this.angle) * 15;
            this.targetY = this.enemyTarget.y + Math.sin(this.angle) * 15;
            this.enemyTarget.health -= 0.2;
            if(!this.enemyTarget.alive){
                this.enemyTarget = choice(p.enemiesInView);
            }
        break;
    }
    

    this.x = lerp(this.x, this.targetX, 0.15);
    this.y = lerp(this.y, this.targetY, 0.15);
    this.angle = lerp(this.angle, this.targetAngle, 0.15);
    
    if(inView(this, 10)){

        // let distx = this.x - p.x;
        // let disty = this.y - p.y;

        // let dist = Math.sqrt(distx*distx + disty*disty);

    }
        
}

Baby.prototype.updateOrbits = function(){
    babies.forEach(function(e,i, a){
        e.targetAngle = Math.PI*2/(a.length+1) * (i+1);
    })
}

export default Baby;