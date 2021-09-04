import Splode from "./splode";
import { Key, choice } from "./utils";

/*
TODO: implement double jump or thrust after jump to escape from gravity
*/
Player = {
    x: 0,
    y: 0,
    radius: 10,
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
    bodyAngle: 0,
    armThrust: 0,
    legThrust: 0,
    planetAngle: 0,
    runSpeed: 2.5,
    turnSpeed: 0.1,
    baseJumpSpeed: 2.7,
    jumpSpeed: 2.7,
    jumpSpeedIncrement: 0.4,
    thrust: 0.1,
    yVel: 0,
    xVel: 0,
    maxXVel: 4,
    maxYVel: 4,
    fuel: 100,
    maxFuel: 300,
    div12: Math.PI/6,
    forwardX: 0,
    forwardy: 0,
    forwardXend: 0,
    forwardyend: 0,
    headx: 0,
    heady: 0,
    neckx: 0,
    necky: 0,
    foot1x: 0,
    foot1y: 0,
    foot2x: 0,
    foot2y: 0,
    arm1x: 0,
    arm1y: 0,
    arm2x: 0,
    arm2y: 0,



    draw: function(){
        r.pat = r.dither[0];
        

        let sx = this.x - view.x,
            sy = this.y - view.y,
            div12 = this.div12,
        
            forwardX = sx + Math.cos(this.angle) * (this.radius + 5),
            forwardy = sy + Math.sin(this.angle) * (this.radius + 5),
            forwardXend = sx + Math.cos(this.angle) * (this.radius + 7),
            forwardyend = sy + Math.sin(this.angle) * (this.radius + 7),

            headx = sx + Math.cos(this.bodyAngle) * (this.radius),
            heady = sy + Math.sin(this.bodyAngle) * (this.radius),
            neckx = sx + Math.cos(this.bodyAngle) * (this.radius/2),
            necky = sy + Math.sin(this.bodyAngle) * (this.radius/2);
            
            
            this.arm1x = arm1x = neckx + Math.cos(this.bodyAngle + div12*3.5+this.armThrust ) * (this.radius);
            this.arm1y = arm1y = necky + Math.sin(this.bodyAngle + div12*3.5+this.armThrust ) * (this.radius);
            this.arm2x = arm2x = neckx + Math.cos(this.bodyAngle - div12*3.5-this.armThrust ) * (this.radius);
            this.arm2y = arm2y = necky + Math.sin(this.bodyAngle - div12*3.5-this.armThrust ) * (this.radius);

            this.foot1x = foot1x = sx + Math.cos(this.bodyAngle + div12*5+this.legThrust ) * (this.radius);
            this.foot1y = foot1y = sy + Math.sin(this.bodyAngle + div12*5+this.legThrust ) * (this.radius);
            this.foot2x = foot2x = sx + Math.cos(this.bodyAngle - div12*5-this.legThrust ) * (this.radius);
            this.foot2y = foot2y = sy + Math.sin(this.bodyAngle - div12*5-this.legThrust ) * (this.radius);

        r.circle(sx, sy, this.radius, 1); //collide circle
        r.line(forwardX, forwardy, forwardXend, forwardyend, 7); //forward line

        r.fillCircle(headx, heady, 2, 22); //head
        r.circle(foot1x, foot1y, 1, 22); //foot1
        r.circle(foot2x, foot2y, 1, 22); //foot2
        r.line(sx, sy, headx, heady, 22); //torso/neck line
        r.line(sx, sy, foot1x, foot1y, 22); //leg1
        r.line(sx, sy, foot2x, foot2y, 22); //leg2
        r.line(sx, sy, foot1x, foot1y, 22); //leg1
        r.line(sx, sy, foot2x, foot2y, 22); //leg2r.line(sx, sy, headx, heady, 22); //torso/neck line
        r.line(neckx, necky, arm1x, arm1y, 22); //arm1
        r.line(neckx, necky, arm2x, arm2y, 22); //arm2

        if(this.fuel > 100){
            
            for(let i = 0; i < this.fuel-100; i++){
                let ra = Math.random()*2*Math.PI;
                r.pset( sx + Math.cos(ra) * (this.radius + 5 + Math.random()*5),
                        sy + Math.sin(ra) * (this.radius + 5 + Math.random()*5),
                        9)
            }
        }



// debugTxt = 
// // `${this.withinPlanetGravity}\n
// // XV ${this.xVel}\n
// // YV ${this.yVel}\n
// `JS ${this.jumpSpeed}\n
// FUEL: ${this.fuel}\n
// ARM: ${this.armThrust}\nYV: ${this.yVel}\nXV: ${this.xVel}\n`
// //VX ${view.x} VY ${view.y}\n
// .toUpperCase();

//         r.text([debugTxt, 5, 5, 1, 1, 'left', 'top', 1, 22]);
     },

    update: function(){
        this.yVel = this.yVel > this.maxYVel ? this.maxYVel : this.yVel;
        this.xVel = this.xVel > this.maxXVel ? this.maxXVel : this.xVel;
        this.yVel = this.yVel < -this.maxYVel ? -this.maxYVel : this.yVel;
        this.xVel = this.xVel < -this.maxXVel ? -this.maxXVel : this.xVel;
        this.y += this.yVel;
        this.x += this.xVel;
        if(this.x > Ww){this.x = 0;}else if(this.x < 0){this.x = Ww;}
        if(this.y > Wh){this.y = 0;}else if(this.y < 0){this.y = Wh;}
        
        this.bodyAngle = this.angle// - Math.PI/2;

        if(!this.colliding){
        
            let velAngle = Math.atan2(this.yVel, this.xVel);

            this.armThrust = this.legThrust =  Math.cos(this.bodyAngle - velAngle);
        }

        if(this.withinPlanetGravity){
            this.angle = this.planetAngle;
            this.legThrust = Math.cos(t/10);
        }


        

        if(this.fuel <= 0){
            this.fuel = 0;
        }   

        if(this.fuel >  this.maxFuel){
            this.fuel = this.maxFuel;
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
                this.bodyAngle = this.planetAngle;   
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
            this.angle = this.angle % (Math.PI*2);
            if(!this.withinPlanetGravity){
                splodes.push( new Splode(this.arm1x+view.x, this.arm1y+view.y, 5, choice([19,20,22]) ) );
                //splodes.push( new Splode(this.arm2x+view.x, this.arm2y+view.y, 5, choice([19,20,22]) ) );
             }
        }
    },

    moveRight: function(){
        if(this.colliding){
            this.xVel -= Math.cos(this.planetAngle - Math.PI/2) * this.runSpeed;
            this.yVel -= Math.sin(this.planetAngle - Math.PI/2) * this.runSpeed;
        }else{
            this.angle += this.turnSpeed;
            this.angle = this.angle % (Math.PI*2);
            if(!this.withinPlanetGravity){
                //splodes.push( new Splode(this.arm1x+view.x, this.arm1y+view.y, 5, choice([19,20,22]) ) );
                splodes.push( new Splode(this.arm2x+view.x, this.arm2y+view.y, 5, choice([19,20,22]) ) );
             }
        }
    },

    moveUp: function(){
        if(this.colliding){
            this.xVel += Math.cos(this.planetAngle) * this.jumpSpeed;
            this.yVel += Math.sin(this.planetAngle) * this.jumpSpeed;
            
        
        }else{
            this.xVel += Math.cos(this.angle) * this.thrust;
            this.yVel += Math.sin(this.angle) * this.thrust;
            
        
            if(!this.withinPlanetGravity){
                splodes.push( new Splode(this.foot1x+view.x, this.foot1y+view.y, 5, choice([7,8,22]) ) );
                splodes.push( new Splode(this.foot2x+view.x, this.foot2y+view.y, 5, choice([7,8,22]) ) );
             }
        }
    },

    moveDown: function(){
        if(this.colliding){
            //this.chargingJump = true
            //this.jumpSpeed += 0.01;
        }else{
            this.xVel -= Math.cos(this.angle) * this.thrust;
            this.yVel -= Math.sin(this.angle) * this.thrust;

            if(!this.withinPlanetGravity){
                splodes.push( new Splode(this.arm1x+view.x, this.arm1y+view.y, 5, choice([19,20,22]) ) );
                splodes.push( new Splode(this.arm2x+view.x, this.arm2y+view.y, 5, choice([19,20,22]) ) );
             }
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