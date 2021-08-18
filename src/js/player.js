import Splode from "./splode";
import { Key } from "./utils";

/*
TODO: implement double jump or thrust after jump to escape from gravity
*/
Player = {
    x: 0,
    y: 0,
    radius: 8,
    color: 4,
    colliding: false,
    withinPlanetGravity: false,
    hitPlanet: false,
    inAir: false,
    chargingJump: false,
    canJump: false,
    canDoubleJump: false,
    planet: null,
    py: 0,
    px: 0,
    angle: 0,
    planetAngle: 0,
    runSpeed: 0.9,
    turnSpeed: 0.1,
    baseJumpSpeed: 2,
    jumpSpeed: 2,
    thrust: 0.02,
    yVel: 0,
    xVel: 0,
    


    draw: function(){
        r.fillCircle(this.x, this.y, this.radius, this.color);
        r.pset(
            this.x + Math.cos(this.angle) * (this.radius + 2),
            this.y + Math.sin(this.angle) * (this.radius + 2),
            22);
        debugTxt = `${this.withinPlanetGravity}\nXV ${this.xVel}\nYV ${this.yVel}\nJS ${this.jumpSpeed}`.toUpperCase();
        r.text([debugTxt, 5, 5, 1, 3, 'left', 'top', 1, 22]);
    },

    update: function(){
        this.y += this.yVel;
        this.x += this.xVel;

        if(this.hitPlanet){
            splodes.push(new Splode(this.x, this.y, 40, 7));
            this.hitPlanet = false;
        }

        if(this.planet){
            let distx = this.planet.x - p.x;
            let disty = this.planet.y - p.y;
            let dist = Math.sqrt(distx*distx + disty*disty);
            if( dist >= this.planet.radius + this.radius ){
                this.colliding = false;
            }
            if( dist >= this.planet.field + this.radius ){
                this.withinPlanetGravity = false;
            }
            if(dist <= this.planet.radius){
                this.colliding=true;
                
            }
            if(this.withinPlanetGravity){
                //gravity towards planet
                this.py = this.y - this.planet.y;
                this.px = this.x - this.planet.x;
                this.planetAngle = Math.atan2(this.py, this.px);   
                this.xVel -= Math.cos(this.planetAngle) * this.planet.gravity;
                this.yVel -= Math.sin(this.planetAngle) * this.planet.gravity;
            }
        }
        
        if(this.colliding){
            this.color = 7;
            this.yVel = 0;
            this.xVel = 0;
        }
        else{
            this.color = 4;
        };

        if( Key.isDown(Key.LEFT) || Key.isDown(Key.q) || Key.isDown(Key.a) ){ this.moveLeft() }
        else if(Key.isDown(Key.RIGHT) || Key.isDown(Key.d) ){ this.moveRight() }

        if(Key.isDown(Key.UP) || Key.isDown(Key.z) || Key.isDown(Key.w) ){ this.moveUp() }
        else if(Key.isDown(Key.DOWN) || Key.isDown(Key.w) ){ this.moveDown() }

        if(Key.justReleased(Key.SPACE)){
            for(let i = 10; i > 0; i--){
            splodes.push(new Splode(p.x+Math.random()*20-10, p.y+Math.random()*20-10, Math.random()*70, 20*Math.random()*5) );
            }
            playSound(sounds.cellComplete)
        }
        

    },

    moveLeft: function(){
        if(this.colliding){
            this.xVel -= Math.cos(this.planetAngle + Math.PI/2) * this.runSpeed;
            this.yVel -= Math.sin(this.planetAngle + Math.PI/2) * this.runSpeed;
        }else{
            this.angle -= this.turnSpeed;
        }
    },

    moveRight: function(){
        if(this.colliding){
            this.xVel -= Math.cos(this.planetAngle - Math.PI/2) * this.runSpeed;
            this.yVel -= Math.sin(this.planetAngle - Math.PI/2) * this.runSpeed;
        }else{
            this.angle += this.turnSpeed;
        }
    },

    moveUp: function(){
        if(this.colliding){
            this.xVel += Math.cos(this.planetAngle) * this.jumpSpeed;
            this.yVel += Math.sin(this.planetAngle) * this.jumpSpeed;
        
        }else{
            this.xVel += Math.cos(this.angle) * this.thrust;
            this.yVel += Math.sin(this.angle) * this.thrust;
        }
    },

    moveDown: function(){
        if(this.colliding){
            //this.chargingJump = true
            this.jumpSpeed += 0.01;
        }else{
            this.xVel -= Math.cos(this.angle) * this.thrust;
            this.yVel -= Math.sin(this.angle) * this.thrust;
        }
    },

    onPlanet: function(planet){;
        this.planet = planet;
        this.py = this.y - this.planet.y;
        this.px = this.x - this.planet.x;
        this.angle = Math.atan2(this.py, this.px);
        this.withinPlanetGravity = true;
        
    }

}

export default Player;