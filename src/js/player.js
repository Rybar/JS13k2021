Player = {
    x: 0,
    y: 0, 
    radius: 5,
    color: 5,
    colliding: false,
    onPlanetSurface: false,
    planet: null,
    py: 0,
    px: 0,
    angle: 0,
    planetAngle: 0,
    runSpeed: 0.9,
    turnSpeed: 0.1,
    jumpSpeed: 2,
    thrust: 0.02,
    yVel: 0,
    xVel: 0,
    


    draw: function(){
        r.circle(this.x, this.y, this.radius, this.color);
        r.pset(
            this.x + Math.cos(this.angle) * (this.radius + 2),
            this.y + Math.sin(this.angle) * (this.radius + 2),
            22);
        debugTxt = `${this.onPlanetSurface}`.toUpperCase();
        r.text([debugTxt, 5, 5, 1, 3, 'left', 'top', 1, 22]);
    },

    update: function(){
        this.y += this.yVel;
        this.x += this.xVel;

        if(this.planet){
            let distx = this.planet.x - p.x;
            let disty = this.planet.y - p.y;
            let dist = Math.sqrt(distx*distx + disty*disty);
            if( dist >= this.planet.radius + this.radius ){
                this.colliding = false;
            }
            if( dist >= this.planet.field + this.radius ){
                this.onPlanetSurface = false;
            }
        }
        

        if(this.onPlanetSurface){
            //gravity towards planet
            this.py = this.y - this.planet.y;
            this.px = this.x - this.planet.x;
            this.planetAngle = Math.atan2(this.py, this.px);   
            this.xVel -= Math.cos(this.planetAngle) * this.planet.gravity;
            this.yVel -= Math.sin(this.planetAngle) * this.planet.gravity;
        }

        

        if(this.colliding){
            this.color = 15;
            this.yVel = 0;
            this.xVel = 0;
        }
        else{
            this.color = 5;
        };

        

        

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
        if(this.onPlanetSurface){
            //drill verb?  dunno yet. 
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
        
        this.onPlanetSurface = true;
        
    }

}

export default Player;