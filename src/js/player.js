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
    runSpeed: 0.1,


    draw: function(){
        r.circle(this.x, this.y, this.radius, this.color);
        debugTxt = `${this.onPlanetSurface}`.toUpperCase();
        r.text([debugTxt, 5, 5, 1, 3, 'left', 'top', 1, 22]);
    },

    update: function(){
        if(this.colliding){
            this.color = 15;
        }
        else{
            this.color = 5;
        };
        if(this.onPlanetSurface){
            
            // this.py = this.y - this.planet.y;
            // this.px = this.x - this.planet.x;
            
            this.x = Math.cos(this.angle) * this.planet.radius + (this.planet.x);
            this.y = Math.sin(this.angle) * this.planet.radius + (this.planet.y);
        }
    },

    moveLeft: function(){
        /*
        p'x = cos(theta) * (px-ox) - sin(theta) * (py-oy) + ox
        p'y = sin(theta) * (px-ox) + cos(theta) * (py-oy) + oy
        todo: get angle of player relative to planet center Math.atan2(py,px)
        */
        if(this.onPlanetSurface){
            this.angle-=this.runSpeed;
           
            
        }else{
            this.x--
        }
    },

    moveRight: function(){
        if(this.onPlanetSurface){
            this.angle+=this.runSpeed;
            
        }else{
            this.x++
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