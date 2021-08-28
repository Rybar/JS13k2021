import Splode from './splode.js';
import { inView } from './utils.js';
import Sector from './sector.js';
import Fuel from './fuel.js';

function Planet(){
    this.x = 0;
    this.y = 0;
    this.radius = 5;
    this.field = this.radius + 30;
    this.color = 22;
    this.palette = [0,1,2,3,4,5,6]
    this.gravity = 0.1;
    this.sectors = Math.floor( (this.radius*2*Math.PI)/3 );
    this.sectorsRemaining = this.sectors;
    this.populated = false;
    this.drawColor = 37;
    this.disease = [];
    
    return this;
}
Planet.prototype.draw = function(){
   r.renderSource = r.PAGE_2;

    if(inView(this, 200)){
        //only draw the pretty stuff if the planet is fully pollinated
        if(this.sectorsRemaining == 0){
            //oooh its pretty atmosphere halo time
            //outer haze
            r.pat = r.dither[15];
            r.fillCircle(this.x - view.x, this.y - view.y, this.radius+30, 17);
            //a bit thicker now
            r.pat = r.dither[13];
            r.fillCircle(this.x - view.x, this.y - view.y, this.radius+20, 17);
            r.pat = r.dither[11];
            //moar thick
            r.fillCircle(this.x - view.x, this.y - view.y, this.radius+8, 17);
            r.pat = r.dither[8];
            //that neat bright blue bit near the horizon
            r.fillCircle(this.x - view.x, this.y - view.y, this.radius+3, 17);
            r.fillCircle(this.x - view.x, this.y - view.y, this.radius+2, 18);
        }
        
        r.pat = r.dither[0];
        //the planet itself
        r.tfillCircle(this.x - view.x, this.y - view.y, this.radius, this.drawColor);

        //icky gray stuff
        r.pat = r.dither[7];
        this.disease.forEach(function(d){
            r.fillCircle(d.x - view.x, d.y - view.y, d.radius, 42);
        });

        //a bright cyan line to finish it off --dark red if its not pollinated
        r.circle(this.x - view.x, this.y - view.y, this.radius, this.sectorsRemaining == 0 ? 19 : 4);
        
        //the planet gravity field
        r.circle(this.x - view.x, this.y - view.y, this.field, 1);

        
    }
    
}
Planet.prototype.update = function(){

    if(inView(this, 200)){

        if(!this.populated){

            for(let i = 0; i < this.sectors; i++){
                let x = this.x + this.radius * Math.cos(i*(2*Math.PI)/this.sectors);
                let y = this.y + this.radius * Math.sin(i*(2*Math.PI)/this.sectors);
                r.circle(x - view.x, y - view.y, 2, 22);
                planetSectors.push(new Sector(x, y, this) );
            }
            for(let i = 0; i < 300; i++){
                this.disease.push(
                    {
                    x: this.x + Math.cos(Math.random()*3.14159*2) * Math.random()*this.radius,
                    y: this.y + Math.sin(Math.random()*3.14159*2) * Math.random()*this.radius,
                    radius: Math.random()*12,
                    });
            }    
            this.populated = true;
        }
        if(this.sectorsRemaining == 0){
            this.drawColor = this.color;
        }

        let distx = this.x - p.x;
        let disty = this.y - p.y;

        let dist = Math.sqrt(distx*distx + disty*disty);
        if( dist <= this.field + p.radius ){

            if(!p.withinPlanetGravity){
                p.onPlanet(this);
            }   

        }
    }
        
    
}

export default Planet;