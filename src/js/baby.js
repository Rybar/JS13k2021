import { inView, playSound, lerp, choice } from './core/utils.js';
import Splode from './splode.js';
const HOME = 0;
const SEEKING = 1;
const ORBITING = 3;
const ATTACKING = 2;

function Baby(x,y){

    

    this.state = 0;
    this.previousState = 0;
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
        
        switch(this.state){
            case HOME:
            case ORBITING:
                r.fillCircle(this.x-view.x, this.y-view.y, 2, 0);
                r.circle(this.x-view.x, this.y-view.y, 2, choice([19,20,22]) );
                splodes.push( new Splode(this.x, this.y, 5, choice([19,20,22]) ) ); 
                break;
            case ATTACKING:
                r.fillCircle(this.x-view.x, this.y-view.y, 2, 0);
                r.circle(this.x-view.x, this.y-view.y, 2, choice([5,6,7]) );
                splodes.push( new Splode(this.x, this.y, 5, choice([5,6,7]) ) );
                splodes.push( new Splode(this.enemyTarget.x+(Math.random()*2-1)*this.enemyTarget.radius,
                                         this.enemyTarget.y+(Math.random()*2-1)*this.enemyTarget.radius, 5, choice([5,6,7]) ) );
                break;
        }
    }
    

}
Baby.prototype.update = function(){

    if(this.state != this.previousState){
        //playSound(sounds.babyaction2, 1, 0, 0.1, false);
        this.previousState = this.state;
    }
   
    if(!inView(this, 20)){
        this.state = HOME; 
    }

    this.targetAngle += 0.015;
    if(p.enemiesInView.length > 0 && this.state != ATTACKING){
        this.enemyTarget = choice(p.enemiesInView);
        this.state = ATTACKING;
    }else if(p.enemiesInView.length == 0) {
        this.state = HOME;
        if(p.withinPlanetGravity){
            this.state = ORBITING;
        }
    }

    switch(this.state){

        case HOME:
            this.targetX = p.x + Math.cos(this.angle) * (p.radius +babies.length-p.xVel*2)+Math.cos(this.angle*7)*20; 
            this.targetY = p.y + Math.sin(this.angle) * (p.radius +babies.length-p.yVel*2)+Math.sin(this.angle*7.1)*20; 
            if(this.enemyTarget){
                this.enemyTarget.attacked = false;
            }
            
        break;

        case ORBITING:
            this.targetX = p.planet.x + Math.cos(this.angle) * (p.planet.radius + 7+babies.length-p.xVel*2); 
            this.targetY = p.planet.y + Math.sin(this.angle) * (p.planet.radius + 7+babies.length-p.yVel*2);
        break;

        case ATTACKING:
            this.targetX = this.enemyTarget.x + Math.cos(this.angle) * (this.enemyTarget.radius + 5);
            this.targetY = this.enemyTarget.y + Math.sin(this.angle) * (this.enemyTarget.radius + 5);
            this.enemyTarget.health -= 0.2;
            //this.enemyTarget.underAttack = true;
            if(!this.enemyTarget.alive){
                //playSound(sounds.babyaction1, 1, 0, 0.1, false);
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