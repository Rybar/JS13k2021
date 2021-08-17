Player = {
    x: 0,
    y: 0, 
    radius: 5,
    color: 5,
    colliding: false,
    planet: null,
    py: 0,
    px: 0,
    angle: 0,
    runSpeed: 0.0025,


    draw: function(){
        r.circle(this.x, this.y, this.radius, this.color);
    },

    update: function(){
        if(this.colliding){
            this.py = this.y - this.planet.y;;
            this.px = this.x - this.planet.x;
            this.angle = Math.atan2(this.py, this.px);
            this.color = 15;
        }
        else{
            this.color = 5;
        };
    },

    moveLeft: function(){
        /*
        p'x = cos(theta) * (px-ox) - sin(theta) * (py-oy) + ox
        p'y = sin(theta) * (px-ox) + cos(theta) * (py-oy) + oy
        todo: get angle of player relative to planet center Math.atan2(py,px)
        */
        if(this.colliding){
            this.angle-=this.runSpeed;
            this.x -= Math.cos(this.angle) * this.planet.radius;
            this.y -= Math.sin(this.angle) * this.planet.radius;
        }else{
            this.x--
        }
    },

    moveRight: function(){
        if(this.colliding){
            this.angle+=this.runSpeed;
            this.x -= Math.cos(this.angle) * this.planet.radius;
            this.y -= Math.sin(this.angle) * this.planet.radius;
        }else{
            this.x++
        }

    },

    onPlanet: function(planet){;
        this.planet = planet;
        this.colliding = true;
    }

}

export default Player;