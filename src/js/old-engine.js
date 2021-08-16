//--------------Engine.js-------------------
var w = window;

const WIDTH =     320;
const HEIGHT =    200;
const PAGES =     20;  //page = 1 screen HEIGHTxWIDTH worth of screenbuffer.
const PAGESIZE = WIDTH*HEIGHT;

const SCREEN = 0;
const EFFECTS = PAGESIZE;
const BUFFER = PAGESIZE*2;
const BACKGROUND = PAGESIZE*3;
const MIDGROUND = PAGESIZE*4;
const FOREGROUND = PAGESIZE*5;
const COLLISION = PAGESIZE*9;
const SPRITES = PAGESIZE*7;
const UI = PAGESIZE*8;

//make Math global
const m = Math;
Object.getOwnPropertyNames(m).forEach(n => w[n] = w[n] || m[n]);



// S=Math.sin;

// C=Math.cos;

function cos1(x) { // x = 0 - 1
  return cos(x*6.28318531);
};

function sin1(x) {
  return sin(-x*6.28318531);
}



//relative drawing position and pencolor, for drawing functions that require it.

viewX = 0;
viewY = 0;
viewW = WIDTH;
viewH = HEIGHT;
cursorX = 0;
cursorY = 0;
cursorColor = 22;
cursorColor2 = 0;

floodStack = [];

fontString = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890_!@#.'\"?/<()";

fontBitmap = "11111100011111110001100011111010001111101000111110111111000010000100000111111100100101000110001111101111110000111001000011111111111000"+
"0111001000010000111111000010111100011111110001100011111110001100011111100100001000010011111111110001000010100101111010001100101110010010100011000"+
"0100001000010000111111000111011101011000110001100011100110101100111000101110100011000110001011101111010001100101110010000011101000110001100100111"+
"1111101000111110100011000101111100000111000001111101111100100001000010000100100011000110001100010111010001100011000101010001001000110001101011010"+
"1011101000101010001000101010001100010101000100001000010011111000100010001000111110010001100001000010001110011101000100010001001111111110000010011"+
"0000011111010010100101111100010000101111110000111100000111110011111000011110100010111011111000010001000100001000111010001011101000101110011101000"+
"1011110000101110011101000110001100010111000000000000000000000111110010000100001000000000100111111000110111101011011101010111110101011111010100000"+
"000000000000000000100001100001000100000000000011011010011001000000000000111010001001100000000100000010001000100010001000000010001000100000100000100001000100001000010000010"

 dither = [
        0b1111111111111111,
        0b1111111111110111,
        0b1111110111110111,
        0b1111110111110101,
        0b1111010111110101,
        0b1111010110110101,
        0b1110010110110101,
        0b1110010110100101,
        0b1010010110100101,
        0b1010010110100001,
        0b1010010010100001,
        0b1010010010100000,
        0b1010000010100000,
        0b1010000000100000,
        0b1000000000100000,
        0b1000000000000000,
        0b0000000000000000,
        ];

pat = 0b1111111111111111;

//default palette index
palDefault = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,
                    32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63];

var
c =               document.getElementById('canvas'),
c2 =              document.createElement("canvas"),
ctx2 =            c2.getContext('2d'),
ctx =             c.getContext('2d'),
renderTarget =    0x00000,
renderSource =    BUFFER, //buffer is ahead one screen's worth of pixels

//Adigun Azikiwe Polack's AAP64 Palette.
//ofcourse you can change this to whatever you like, up to 256 colors.
//one GOTCHA: colors are stored 0xAABBGGRR, so you'll have to flop the values from your typical hex colors.

colors =
  [
  0xff080606,
  0xff131014,
  0xff25173B,
  0xff2D1773,
  0xff2A20B4,
  0xff233EDF,
  0xff0A6AFA,
  0xff1BA3F9,
  0xff41D5FF,
  0xff40FCFF,
  0xff64F2D6,
  0xff43DB9C,
  0xff35C159,
  0xff2EA014,
  0xff3E7A1A,
  0xff3B5224,

  0xff202012,
  0xff643414,
  0xffC45C28,
  0xffDE9F24,
  0xffC7D620,
  0xffDBFCA6,
  0xffFFFFFF,
  0xffC0F3FE,
  0xffB8D6FA,
  0xff97A0F5,
  0xff736AE8,
  0xff9B4ABC,
  0xff803A79,
  0xff533340,
  0xff342224,
  0xff1A1C22,

  0xff282b32,
  0xff3b4171,
  0xff4775bb,
  0xff63a4db,
  0xff9cd2f4,
  0xffeae0da,
  0xffd1b9b3,
  0xffaf938b,
  0xff8d756d,
  0xff62544a,
  0xff413933,
  0xff332442,
  0xff38315b,
  0xff52528e,
  0xff6a75ba,
  0xffa3b5e9,

  0xffffe6e3,
  0xfffbbfb9,
  0xffe49b84,
  0xffbe8d58,
  0xff857d47,
  0xff4e6723,
  0xff648432,
  0xff8daf5d,
  0xffbadc92,
  0xffe2f7cd,
  0xffaad2e4,
  0xff8bb0c7,
  0xff6286a0,
  0xff556779,
  0xff444e5a,
  0xff343942,
  0xff000000]

//active palette index. maps to indices in colors[]. can alter this whenever for palette effects.
pal =            [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,
                  32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64];


//paldrk =          [0,0,1,2,3,4,5,6,6,10,11,12,13,14,2,2,15,16,17,18,22,20,23,24,25,26,2,2,27,28,31,13,0]

ctx.imageSmoothingEnabled = false;
//ctx.mozImageSmoothingEnabled = false;

c.width = WIDTH;
c.height = HEIGHT;
var imageData =   ctx.getImageData(0, 0, WIDTH, HEIGHT),
buf =             new ArrayBuffer(imageData.data.length),
buf8 =            new Uint8Array(buf),
data =            new Uint32Array(buf),
ram =             new Uint8Array(WIDTH * HEIGHT * PAGES);

audioCtx = new AudioContext;

//--------------graphics functions----------------
  function inView(x,y, viewpad = 64){
    return(x >= 0-viewpad && x <= WIDTH+viewpad && y >=0-viewpad && y <= HEIGHT+viewpad);
  }

  function clear(color = 0, page=renderTarget){
    ram.fill(color, page, page + PAGESIZE);
  }

  function setColors(color1 = cursorColor, color2 = cursorColor2){
    cursorColor = color1;
    cursorColor2 = color2;
  }

  function pset(x,y, color1=cursorColor, color2=cursorColor2) { //an index from colors[], 0-64
    //o[0] x
    //o[1] y
    x = x|0;
    y = y|0;
    let px = (y % 4) * 4 + (x% 4);
    let mask = pat & Math.pow(2, px);
    let pcolor = mask ? cursorColor : cursorColor2;
    if(pcolor == 64)return;
    if(pcolor > 64)pcolor = 0;
    if(x < 0 | x > WIDTH-1) return;
    if(y < 0 | y > HEIGHT-1) return;

    ram[renderTarget + y * WIDTH + x] = mask ? cursorColor : cursorColor2;
  }

  function pget(x=cursorX, y=cursorY, page=renderTarget){
    return ram[page + x + y * WIDTH];
  }

  function fillPixel (pixel, prevC){
    //pixel = y * WIDTH + x
    let x = pixel%WIDTH
    let y = Math.floor(pixel/WIDTH)
    let px = (y % 4) * 4 + (x% 4);
    let mask = pat & Math.pow(2, px);
    let pcolor = mask ? cursorColor : cursorColor2;
    ram[pixel] = pcolor; 
    
    //pset(x,y); //honors dither pattern
    let up = pixel + WIDTH, down = pixel - WIDTH, left = pixel -1, right = pixel+1
    if(ram[up] == prevC)floodStack.push(up)
    if(ram[down] == prevC)floodStack.push(down)
    if(ram[left] == prevC)floodStack.push(left)
    if(ram[right] == prevC)floodStack.push(right)
  }

  function floodFill(x=cursorX,y=cursorY, page=renderTarget){
    let prevC = pget(x,y,page);
    if(prevC == cursorColor || prevC == cursorColor2) return;
    floodStack = [];
    fillPixel(page + x + y * WIDTH, prevC);
      while(floodStack.length > 0){
        let fill = floodStack.pop();
        fillPixel(fill, prevC);
      }
  }

function moveTo(x,y){
  cursorX = x;
  cursorY = y;
}

function lineTo(x,y, color=cursorColor, color2 = cursorColor2){
  cursorColor2 = color2;
  cursorColor = color;
  line(cursorX, cursorY, x, y, color, color2);
  cursorX = x;
  cursorY = y;
}

  function line(x1, y1, x2, y2, color=cursorColor, color2 = cursorColor2) {
    cursorX = x2;
    cursorY = y2;
    cursorColor2 = color2;
    cursorColor = color;

    x1 = x1|0;
    x2 = x2|0;
    y1 = y1|0;
    y2 = y2|0;

    var dy = (y2 - y1);
    var dx = (x2 - x1);
    var stepx, stepy;

    if (dy < 0) {
      dy = -dy;
      stepy = -1;
    } else {
      stepy = 1;
    }
    if (dx < 0) {
      dx = -dx;
      stepx = -1;
    } else {
      stepx = 1;
    }
    dy <<= 1;        // dy is now 2*dy
    dx <<= 1;        // dx is now 2*dx

    pset(x1, y1);
    if (dx > dy) {
      var fraction = dy - (dx >> 1);  // same as 2*dy - dx
      while (x1 != x2) {
        if (fraction >= 0) {
          y1 += stepy;
          fraction -= dx;          // same as fraction -= 2*dx
        }
        x1 += stepx;
        fraction += dy;              // same as fraction -= 2*dy
        pset(x1, y1);
      }
      ;
    } else {
      fraction = dx - (dy >> 1);
      while (y1 != y2) {
        if (fraction >= 0) {
          x1 += stepx;
          fraction -= dy;
        }
        y1 += stepy;
        fraction += dx;
        pset(x1, y1);
      }
    }

  }

  function circle(xm=cursorX, ym=cursorY, r=5, color=cursorColor, color2 = cursorColor2) {
    cursorColor2 = color2;
    cursorColor = color;
    xm = xm|0;
    ym = ym|0;
    //cursorX = ym;
    //cursorY = ym;
    r = r|0;
    color = color|0;
    var x = -r, y = 0, err = 2 - 2 * r;
    /* II. Quadrant */
    do {
      pset(xm - x, ym + y);
      /*   I. Quadrant */
      pset(xm - y, ym - x);
      /*  II. Quadrant */
      pset(xm + x, ym - y);
      /* III. Quadrant */
      pset(xm + y, ym + x);
      /*  IV. Quadrant */
      r = err;
      if (r <= y) err += ++y * 2 + 1;
      /* e_xy+e_y < 0 */
      if (r > x || err > y) err += ++x * 2 + 1;
      /* e_xy+e_x > 0 or no 2nd y-step */

    } while (x < 0);
  }

  function fillCircle(xm, ym, r=5, color=cursorColor, color2 = cursorColor2) {
    cursorColor2 = color2;
    cursorColor = color;
    xm = xm|0;
    ym = ym|0;
    r = r|0;
    color = color|0;

    if(r < 0) return;
    xm = xm|0; ym = ym|0, r = r|0; color = color|0;
    var x = -r, y = 0, err = 2 - 2 * r;
    /* II. Quadrant */
    do {
      line(xm-x, ym-y, xm+x, ym-y, color);
      line(xm-x, ym+y, xm+x, ym+y, color);
      r = err;
      if (r <= y) err += ++y * 2 + 1;
      if (r > x || err > y) err += ++x * 2 + 1;
    } while (x < 0);
  }

  function ellipse(x0=cursorX, y0=cursorY, width, height, color=cursorColor, color2 = cursorColor2){
    cursorColor2 = color2;
    cursorColor = color;
    x0 = x0|0;
    let x1 = x0+width|0;
    y0 = y0|0;
    let y1 = y0+height|0;
     let a = Math.abs(x1-x0), b = Math.abs(y1-y0), b1 = b&1; /* values of diameter */
     let dx = 4*(1-a)*b*b, dy = 4*(b1+1)*a*a; /* error increment */
     let err = dx+dy+b1*a*a, e2; /* error of 1.step */

     if (x0 > x1) { x0 = x1; x1 += a; } /* if called with swapped points */
     if (y0 > y1) y0 = y1; /* .. exchange them */
     y0 += (b+1)/2; y1 = y0-b1;   /* starting pixel */
     a *= 8*a; b1 = 8*b*b;

     do {
         pset(x1, y0); /*   I. Quadrant */
         pset(x0, y0); /*  II. Quadrant */
         pset(x0, y1); /* III. Quadrant */
         pset(x1, y1); /*  IV. Quadrant */
         e2 = 2*err;
         if (e2 <= dy) { y0++; y1--; err += dy += a; }  /* y step */
         if (e2 >= dx || 2*err > dy) { x0++; x1--; err += dx += b1; } /* x step */
     } while (x0 <= x1);

     while (y0-y1 < b) {  /* too early stop of flat ellipses a=1 */
         pset(x0-1, y0); /* -> finish tip of ellipse */
         pset(x1+1, y0++);
         pset(x0-1, y1);
         pset(x1+1, y1--);
     }
  }

  function fillEllipse(x0=cursorX, y0=cursorY, width, height, color=cursorColor, color2 = cursorColor2){
    cursorColor2 = color2;
    cursorColor = color;
    x0 = x0|0;
    let x1 = x0+width|0;
    y0 = y0|0;
    let y1 = y0+height|0;
     let a = Math.abs(x1-x0), b = Math.abs(y1-y0), b1 = b&1; /* values of diameter */
     let dx = 4*(1-a)*b*b, dy = 4*(b1+1)*a*a; /* error increment */
     let err = dx+dy+b1*a*a, e2; /* error of 1.step */

     if (x0 > x1) { x0 = x1; x1 += a; } /* if called with swapped points */
     if (y0 > y1) y0 = y1; /* .. exchange them */
     y0 += (b+1)/2; y1 = y0-b1;   /* starting pixel */
     a *= 8*a; b1 = 8*b*b;

     do {
         //pset(x1, y0); /*   I. Quadrant */
         //pset(x0, y0); /*  II. Quadrant */
         //pset(x0, y1); /* III. Quadrant */
         //pset(x1, y1); /*  IV. Quadrant */
         line(x1, y0, x0, y0);
         line(x0, y1, x1, y1);
         e2 = 2*err;
         if (e2 <= dy) { y0++; y1--; err += dy += a; }  /* y step */
         if (e2 >= dx || 2*err > dy) { x0++; x1--; err += dx += b1; } /* x step */
     } while (x0 <= x1);

     while (y0-y1 < b) {  /* too early stop of flat ellipses a=1 */
         pset(x0-1, y0); /* -> finish tip of ellipse */
         pset(x1+1, y0++);
         pset(x0-1, y1);
         pset(x1+1, y1--);
     }
  }


  function rect(x, y, x2=16, y2=16, color=cursorColor, color2 = cursorColor2) {
    cursorColor2 = color2;
    cursorColor = color;
    x1 = x|0;
    y1 = y|0;
    x2 = x2|0;
    y2 = y2|0;


    line(x1,y1, x2, y1, color);
    line(x2, y1, x2, y2, color);
    line(x1, y2, x2, y2, color);
    line(x1, y1, x1, y2, color);
  }

  function fillRect(x, y, x2=16, y2=16, color=cursorColor, color2 = cursorColor2) {
    cursorColor2 = color2;
    cursorColor = color;
    x1 = x|0;
    y1 = y|0;
    x2 = x2|0;
    y2 = y2|0;
    color = color|0;

    var i = y2 - y1;
    line(x1, y1, x2, y1, color);

    if(i > 0){
      while (--i) {
        line(x1, y1+i, x2, y1+i, color);
      }
    }
    else if(i < 0) {
      while(++i){
        line(x1, y1+i, x2, y1+i, color);
      }
    }
    line(x1,y2, x2, y2, color);
  }

  function rectTo(width,height,color=cursorColor, color2 = cursorColor2, filled=false){
    cursorColor2 = color2;
    cursorColor = color;
    filled ? fillRect(cursorX, cursorY, cursorX+width, cursorY+height, color, color2): rect(cursorX, cursorY, cursorX+width, cursorY+height, color, color2);
    cursorX += width;
    cursorY += height;

  }

  function cRect(x,y,w,h,c,color=cursorColor, color2 = cursorColor2){
    x = x|0;
    y = y|0;
    w = w|0;
    h = h|0;
    c = c|0;
    color = color|0;
    for(let i = 0; i <= c; i++){
      fillRect(x+i,y-i,w-i*2,h+i*2,color);
    }
  }

  function outline(renderSource, renderTarget, color=cursorColor, color2=cursorColor2, color3=color, color4=color){
    cursorColor2 = color2;
    cursorColor = color;
    for(let i = 0; i <= WIDTH; i++ ){
      for(let j = 0; j <= HEIGHT; j++){
        let left = i-1 + j * WIDTH;
        let right = i+1 + j * WIDTH;
        let bottom = i + (j+1) * WIDTH;
        let top = i + (j-1) * WIDTH;
        let current = i + j * WIDTH;

        if(ram[renderSource + current]){
          if(!ram[renderSource + left]){
            ram[renderTarget + left] = color;
          };
          if(!ram[renderSource + right]){
            ram[renderTarget + right] = color3;
          };
          if(!ram[renderSource + top]){
            ram[renderTarget + top] = color2;
          };
          if(!ram[renderSource + bottom]){
            ram[renderTarget + bottom] = color4;
          };
        }
      }
    }
  }

  function triangle(x1, y1, x2, y2, x3, y3, color=cursorColor, color2 = cursorColor2) {
    cursorColor2 = color2;
    cursorColor = color;
    line(x1,y1, x2,y2, color);
    line(x2,y2, x3,y3, color);
    line(x3,y3, x1,y1, color);
  }

  /* function fillTriangle( x1, y1, x2, y2, x3, y3, color=cursorColor , color2 = cursorColor2) {
    cursorColor2 = color2;
    cursorColor = color;
    //I don't pretend to know how this works exactly; I know it uses barycentric coordinates.
    //Might replace with simpler line-sweep; haven't perf tested yet.
    var canvasWidth = WIDTH;
    // http://devmaster.net/forums/topic/1145-advanced-rasterization/
    // 28.4 fixed-point coordinates
    var x1 = Math.round( 16 * x1 );
    var x2 = Math.round( 16 * x2 );
    var x3 = Math.round( 16 * x3 );
    var y1 = Math.round( 16 * y1 );
    var y2 = Math.round( 16 * y2 );
    var y3 = Math.round( 16 * y3 );
    // Deltas
    var dx12 = x1 - x2, dy12 = y2 - y1;
    var dx23 = x2 - x3, dy23 = y3 - y2;
    var dx31 = x3 - x1, dy31 = y1 - y3;
    // Bounding rectangle
    var minx = Math.max( ( Math.min( x1, x2, x3 ) + 0xf ) >> 4, 0 );
    var maxx = Math.min( ( Math.max( x1, x2, x3 ) + 0xf ) >> 4, WIDTH );
    var miny = Math.max( ( Math.min( y1, y2, y3 ) + 0xf ) >> 4, 0 );
    var maxy = Math.min( ( Math.max( y1, y2, y3 ) + 0xf ) >> 4, HEIGHT );
    // Block size, standard 8x8 (must be power of two)
    var q = 8;
    // Start in corner of 8x8 block
    minx &= ~(q - 1);
    miny &= ~(q - 1);
    // Constant part of half-edge functions
    var c1 = -dy12 * x1 - dx12 * y1;
    var c2 = -dy23 * x2 - dx23 * y2;
    var c3 = -dy31 * x3 - dx31 * y3;
    // Correct for fill convention
    if ( dy12 > 0 || ( dy12 == 0 && dx12 > 0 ) ) c1 ++;
    if ( dy23 > 0 || ( dy23 == 0 && dx23 > 0 ) ) c2 ++;
    if ( dy31 > 0 || ( dy31 == 0 && dx31 > 0 ) ) c3 ++;

    c1 = (c1 - 1) >> 4;
    c2 = (c2 - 1) >> 4;
    c3 = (c3 - 1) >> 4;
    // Set up min/max corners
    var qm1 = q - 1; // for convenience
    var nmin1 = 0, nmax1 = 0;
    var nmin2 = 0, nmax2 = 0;
    var nmin3 = 0, nmax3 = 0;
    if (dx12 >= 0) nmax1 -= qm1*dx12; else nmin1 -= qm1*dx12;
    if (dy12 >= 0) nmax1 -= qm1*dy12; else nmin1 -= qm1*dy12;
    if (dx23 >= 0) nmax2 -= qm1*dx23; else nmin2 -= qm1*dx23;
    if (dy23 >= 0) nmax2 -= qm1*dy23; else nmin2 -= qm1*dy23;
    if (dx31 >= 0) nmax3 -= qm1*dx31; else nmin3 -= qm1*dx31;
    if (dy31 >= 0) nmax3 -= qm1*dy31; else nmin3 -= qm1*dy31;
    // Loop through blocks
    var linestep = (canvasWidth-q);
    for ( var y0 = miny; y0 < maxy; y0 += q ) {
      for ( var x0 = minx; x0 < maxx; x0 += q ) {
        // Edge functions at top-left corner
        var cy1 = c1 + dx12 * y0 + dy12 * x0;
        var cy2 = c2 + dx23 * y0 + dy23 * x0;
        var cy3 = c3 + dx31 * y0 + dy31 * x0;
        // Skip block when at least one edge completely out
        if (cy1 < nmax1 || cy2 < nmax2 || cy3 < nmax3) continue;
        // Offset at top-left corner
        var offset = (x0 + y0 * canvasWidth);
        // Accept whole block when fully covered
        if (cy1 >= nmin1 && cy2 >= nmin2 && cy3 >= nmin3) {
          for ( var iy = 0; iy < q; iy ++ ) {
            for ( var ix = 0; ix < q; ix ++, offset ++ ) {
              ram[renderTarget + offset] = color;
            }
            offset += linestep;
          }
        } else { // Partially covered block
          for ( var iy = 0; iy < q; iy ++ ) {
            var cx1 = cy1;
            var cx2 = cy2;
            var cx3 = cy3;
            for ( var ix = 0; ix < q; ix ++ ) {
              if ( (cx1 | cx2 | cx3) >= 0 ) {
                ram[renderTarget + offset] = color;
              }
              cx1 += dy12;
              cx2 += dy23;
              cx3 += dy31;
              offset ++;
            }
            cy1 += dx12;
            cy2 += dx23;
            cy3 += dx31;
            offset += linestep;
          }
        }
      }
    }
  }*/

  function spr(sx = 0, sy = 0, sw = WIDTH, sh = HEIGHT, x=0, y=0, flipx = false, flipy = false, palette=pal){

    sx = sx|0
    sy = sy|0
    sw = sw|0
    sh = sh|0
    x = x|0
    y = y|0

    for(var i = 0; i < sh; i++){

      for(var j = 0; j < sw; j++){

        if(y+i < HEIGHT && x+j < WIDTH && y+i > -1 && x+j > -1){
          if(flipx & flipy){

            if(ram[(renderSource + ( ( sy + (sh-i) )*WIDTH+sx+(sw-j)))] >= 0) {

              ram[ (renderTarget + ((y+i)*WIDTH+x+j)) ] = palette[ ram[(renderSource + ((sy+(sh-i-1))*WIDTH+sx+(sw-j-1)))] ];

            }

          }
          else if(flipy && !flipx){

            if(ram[(renderSource + ( ( sy + (sh-i) )*WIDTH+sx+j))] >= 0) {

              ram[ (renderTarget + ((y+i)*WIDTH+x+j)) ] = palette[ ram[(renderSource + ((sy+(sh-i-1))*WIDTH+sx+j))] ];

            }

          }
          else if(flipx && !flipy){

            if(ram[(renderSource + ((sy+i)*WIDTH+sx+(sw-j-1)))] >= 0) {

              ram[ (renderTarget + ((y+i)*WIDTH+x+j)) ] = palette[ ram[(renderSource + ((sy+i)*WIDTH+sx+(sw-j-1)))] ];

            }

          }
          else if(!flipx && !flipy){

            if(ram[(renderSource + ((sy+i)*WIDTH+sx+j))] >= 0) {

              ram[ (renderTarget + ((y+i)*WIDTH+x+j)) ] = palette [ ram[(renderSource + ((sy+i)*WIDTH+sx+j))] ] ;

            }

          }
        }
      }
    }
  }

  function sspr(sx = 0, sy = 0, sw = 16, sh = 16, x=0, y=0, dw=16, dh=16, palette=pal){

    sx = sx|0
    sy = sy|0
    sw = sw|0
    sh = sh|0
    x = x|0
    y = y|0
    dw = dw|0
    dh = dh|0

    var xratio = sw / dw;
    var yratio = sh / dh;

    for(var i = 0; i < dh; i++){
      for(var j = 0; j < dw; j++){

        px = (j*xratio)|0;
        py = (i*yratio)|0;

        if(y+i < HEIGHT && x+j < WIDTH && y+i > -1 && x+j > -1) {
          if (ram[(renderSource + ((sy + py) * WIDTH + sx + px))] > 0) {
            ram[(renderTarget + ((y + i) * WIDTH + x + j))] = palette[ ram[(renderSource + ((sy + py) * WIDTH + sx + px))] ]
          }
        }

      }
    }


  }

  function rspr( sx, sy, sw, sh, destCenterX, destCenterY, scale, angle, palette=pal ){

    let sourceCenterX = (sw / 2)|0;
    let sourceCenterY = (sh / 2)|0;

   let destWidth = sw * scale;
    let destHeight = sh * scale;

   let halfWidth = (destWidth / 2 * 1.41421356237)|0 + 5;  //area will always be square, hypotenuse trick
    let halfHeight = (destHeight / 2 * 1.41421356237)|0 + 5;

   let startX = -halfWidth;
    let endX = halfWidth;

   let startY = -halfHeight;
    let endY = halfHeight;

   let scaleFactor = 1.0 / scale;

   let cos = Math.cos(-angle) * scaleFactor;
   let sin = Math.sin(-angle) * scaleFactor;

   for(let y = startY; y < endY; y++){
      for(let x = startX; x < endX; x++){

       let u = sourceCenterX + Math.round(cos * x + sin * y);
        let v = sourceCenterY + Math.round(-sin * x + cos * y);

       let drawX = (x + destCenterX)|0;
        let drawY = (y + destCenterY)|0;

       //screen check. otherwise drawn pix will wrap to next line due to 1D nature of buffer array
       if(drawX > 0 && drawX < WIDTH && drawY > 0 && drawY < HEIGHT){

          if(u >= 0 && v >= 0 && u < sw && v < sh){
          if( ram[renderSource + (u+sx) + (v+sy) * WIDTH] > 0) {
            ram[renderTarget + drawX + drawY * WIDTH] = palette[ ram[renderSource + (u+sx) + (v+sy) * WIDTH] ]
          }

        }

       }


     } //end x loop

   } //end outer y loop
  }

  function checker(x, y, w, h, nRow=8, nCol=8, color=cursorColor, color2 = cursorColor2) {
    cursorColor2 = color2;
    cursorColor = color;

    w /= nCol;            // width of a block
    h /= nRow;            // height of a block

    for (var i = 0; i < nRow; ++i) {
      for (var j = 0, col = nCol / 2; j < col; ++j) {
        let bx = x + (2 * j * w + (i % 2 ? 0 : w) );
        let by = i * h;
        fillRect(bx, by, w-1, h-1, color);
      }
    }
  }

  function imageToRam(image, address) {

          let tempCanvas = document.createElement('canvas');
         tempCanvas.width = WIDTH;
         tempCanvas.height = HEIGHT;
         let context = tempCanvas.getContext('2d');

         //draw image to canvas
         context.drawImage(image, 0, 0);

         //get image data
         var imageData = context.getImageData(0,0, WIDTH, HEIGHT);

         //set up 32bit view of buffer
         let data = new Uint32Array(imageData.data.buffer);

         //compare buffer to palette (loop)
         for(var i = 0; i < data.length; i++) {

             ram[address + i] = colors.indexOf(data[i]);
         }
  }

function render() {

  let i = PAGESIZE;  // display is first page of ram

  while (i--) {
    /*
    data is 32bit view of final screen buffer
    for each pixel on screen, we look up it's color and assign it
    */
    data[i] = colors[pal[ram[i]]];

  }
  imageData.data.set(buf8);

  ctx.putImageData(imageData, 0, 0);

  //renderEffects();
  //ctx.globalCompositeOperation = 'overlay';
  //ctx.drawImage(c2, 0, 0);
}

/*function renderEffects() {
  let i = PAGESIZE;
  while(i--){
    data2[i] = colors[pal[ram[i+PAGESIZE]]];
  }
  imageData2.data.set(buf82);
  ctx2.putImageData(imageData2, 0, 0);
}*/

//-----------txt.js----------------
//forked from Jack Rugile's text renderer in Radius Raid: https://github.com/jackrugile/radius-raid-js13k/blob/master/js/text.js

//o is an array of options with the following structure:
/*
0: text
1: x
2: y
3: hspacing
4: vspacing
5: halign
6: valign
7: scale
8: color
//options 9-11 are for animating the text per-character. just sin motion
9: per character offset
10: delay, higher is slower
11: frequency
*/
function textLine(o) {

	//o 9,10,11 are 6,7,8 here

	if(!o[7])o[7]=1
	if(!o[8])o[8]=1

	var textLength = o[0].length,
		size = 5;

	for (var i = 0; i < textLength; i++) {

		var letter = [];
		letter = getCharacter( o[0].charAt(i) );

		for (var y = 0; y < size; y++) {
			for (var x = 0; x < size; x++) {
				if (letter[y*size+x] == 1){
					if(o[4] == 1){
            let cx = 0;
            let cy = 0;
						pset(
							o[1] + ( x * o[4] ) + ( ( size * o[4] ) + o[3] ) * i,
              ( o[2] + ( o[6] ? Math.sin((t+i*o[8])*1/o[7])*o[6] : 0 ) + (y * o[4]) )|0
              );
					}

					else {
            let cx = o[1] + ( x * o[4] ) + ( ( size * o[4] ) + o[3] ) * i;
            let cy = ( o[2] + ( o[6] ? Math.sin((t+i*o[8])*1/o[7])*o[6] : 0 ) + (y * o[4]) )|0
            //pat = 0b1111111111111111;
						fillRect( cx, cy, cx+o[4], cy+o[4], o[5]);
					}

				} //end draw routine
			}  //end x loop
		}  //end y loop
	}  //end text loop
}  //end textLine()

function text(o) {
 var size = 5,
 letterSize = size * o[7],
 lines = o[0].split('\n'),
 linesCopy = lines.slice(0),
 lineCount = lines.length,
 longestLine = linesCopy.sort(function (a, b) {
   return b.length - a.length;
 })[0],
 textWidth = ( longestLine.length * letterSize ) + ( ( longestLine.length - 1 ) * o[3] ),
 textHeight = ( lineCount * letterSize ) + ( ( lineCount - 1 ) * o[4] );

 if(!o[5])o[5] = 'left';
 if(!o[6])o[6] = 'bottom';

 var sx = o[1],
   sy = o[2],
   ex = o[1] + textWidth,
   ey = o[2] + textHeight;

 if (o[5] == 'center') {
   sx = o[1] - textWidth / 2;
   ex = o[1] + textWidth / 2;
 } else if (o[5] == 'right') {
   sx = o[1] - textWidth;
   ex = o[1];
 }

 if (o[6] == 'center') {
   sy = o[2] - textHeight / 2;
   ey = o[2] + textHeight / 2;
 } else if (o[6] == 'bottom') {
   sy = o[2] - textHeight;
   ey = o[2];
 }

 var cx = sx + textWidth / 2,
   cy = sy + textHeight / 2;

   for (var i = 0; i < lineCount; i++) {
     var line = lines[i],
       lineWidth = ( line.length * letterSize ) + ( ( line.length - 1 ) * o[3] ),
       x = o[1],
       y = o[2] + ( letterSize + o[4] ) * i;

     if (o[5] == 'center') {
       x = o[1] - lineWidth / 2;
     } else if (o[5] == 'right') {
       x = o[1] - lineWidth;
     }

     if (o[6] == 'center') {
       y = y - textHeight / 2;
     } else if (o[6] == 'bottom') {
       y = y - textHeight;
     }

     textLine([
       line,
       x,
       y,
       o[3] || 0,
       o[7] || 1,
       o[8],
       o[9],
       o[10],
       o[11]
     ]);
   }

 return {
   sx: sx,
   sy: sy,
   cx: cx,
   cy: cy,
   ex: ex,
   ey: ey,
   width: textWidth,
   height: textHeight
 }
}

function getCharacter(char){
 index = fontString.indexOf(char);
 return fontBitmap.substring(index * 25, index*25+25).split('') ;
}

//-----------END txt.js----------------



Number.prototype.clamp = function(min, max) {
  return Math.min(Math.max(this, min), max);
};

Number.prototype.map = function(old_bottom, old_top, new_bottom, new_top) {
  return (this - old_bottom) / (old_top - old_bottom) * (new_top - new_bottom) + new_bottom;
};

Number.prototype.pad = function(size, char="0") {
  var s = String(this);
  while (s.length < (size || 2)) {s = char + s;}
  return s;
};
//---audio handling-----------------

function playSound(buffer, playbackRate = 1, pan = 0, volume = .5, loop = false) {

  var source = audioCtx.createBufferSource();
  var gainNode = audioCtx.createGain();
  var panNode = audioCtx.createStereoPanner();

  source.buffer = buffer;
  source.connect(panNode);
  panNode.connect(gainNode);
  gainNode.connect(audioMaster);

  source.playbackRate.value = playbackRate;
  source.loop = loop;
  gainNode.gain.value = volume;
  panNode.pan.value = pan;
  source.start();
  return {volume: gainNode, sound: source};
}

//--------keyboard input--------------
Key = {

    _pressed: {},
    _released: {},

    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    SPACE: 32,
    ONE: 49,
    TWO: 50,
    THREE: 51,
    FOUR: 52,
    a: 65,
    c: 67,
    w: 87,
    s: 83,
    d: 68,
    z: 90,
    x: 88,
    f: 70,
    p: 80,
    r: 82,

    isDown(keyCode) {
        return this._pressed[keyCode];
    },

    justReleased(keyCode) {
        return this._released[keyCode];
    },

    onKeydown(event) {
        this._pressed[event.keyCode] = true;
    },

    onKeyup(event) {
        this._released[event.keyCode] = true;
        delete this._pressed[event.keyCode];
    },

    update() {
        this._released = {};
    }
};

function LCG(seed = Date.now(), a = 1664525, c = 1013904223, m = Math.pow(2,32) ){
  this.seed = seed;
  this.a= a;
  this.c = c;
  this.m = m;
}


  LCG.prototype.setSeed =  function(seed) {
    this.seed = seed;
  },

  LCG.prototype.nextInt = function() {
    // range [0, 2^32)
    this.seed = (this.seed * this.a + this.c) % this.m;
    return this.seed;
  },

  LCG.prototype.nextFloat = function() {
    // range [0, 1)
    return this.nextInt() / this.m;
  },

  LCG.prototype.nextBool = function(percent) {
    // percent is chance of getting true
    if(percent == null) {
      percent = 0.5;
    }
    return this.nextFloat() < percent;
  },

  LCG.prototype.nextFloatRange = function(min, max) {
    // range [min, max)
    return min + this.nextFloat() * (max - min);
  },

  LCG.prototype.nextIntRange = function(min, max) {
    // range [min, max)
    return Math.floor(this.nextFloatRange(min, max));
  },

  LCG.prototype.nextColor = function() {
    // range [#000000, #ffffff]
    var c = this.nextIntRange(0, Math.pow(2, 24)).toString(16).toUpperCase();
    while(c.length < 6) {
      c = "0" + c;
    }
    return "#" + c;
  }



//--------END Engine.js-------------------
