class Body{
    static width = 30;
    constructor(canvas, x, y){
        if(canvas.getContext){
            this.ctx = canvas.getContext("2d");
            this.x = x;
            this.y = y;
        }
    }

    draw = () =>{
        this.ctx.fillStyle = this.getGradient();
        this.ctx.fillRect(this.x,this.y,Body.width,Body.width);
        
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = 'grey';
        this.ctx.strokeRect(this.x, this.y, Body.width, Body.width);
        
        /*this.ctx.beginPath();
        this.ctx.fillStyle = 'white';
        this.ctx.arc(this.x+Body.width/2, this.y+Body.width/2, Body.width/6, 0, Math.PI*2);
        this.ctx.fill();*/
    }

    
    remove = () =>{
        var lineWdth = this.ctx.lineWidth;
        this.ctx.clearRect(this.x - lineWdth, this.y - lineWdth, Body.width + 2*lineWdth, Body.width + 2*lineWdth);
    }

    move = (x, y) =>{
       this.x = x;
       this.y = y;
    }

    getGradient = () => {
        var 
            gradient = this.ctx.createRadialGradient(this.x+Body.width/2, this.y+Body.width/2, Body.width/6,this.x+Body.width/2, this.y+Body.width/2, Body.width/2);
        gradient.addColorStop(0.2, 'blue');
        gradient.addColorStop(0.6, 'magenta');
        gradient.addColorStop(0.9, 'black')
        return gradient;
        
    }

    getLinGrad = () => {
        var grad = this.ctx.createLinearGradient(this.x, this.y, this.x + Body.width, this.y + Body.width);
        grad.addColorStop(0.1, 'blue');
        grad.addColorStop(0.5, 'magenta');
        grad.addColorStop(0.8, 'violet');
        return grad;
        
    }
}

class Head extends Body{
    draw = () =>{
        this.head = new Path2D();
        this.head.rect(this.x,this.y,Body.width,Body.width);
        this.ctx.fillStyle = "orange";
        this.ctx.fill(this.head);
    }
}


class Snake{
    static START_SIZE  = 2;
    constructor(canvas){
        this.body = new Array(50);
        this.canvas = canvas;
        this.size = Snake.START_SIZE;
        this.xspeed = - 1 * Body.width;
        this.yspeed = 0 * Body.width;
        
        this.headx = 300;
        this.heady = 300;
        this.body[0] = new Head(canvas, this.headx, this.heady);
        
        for(var i=1; i<=this.size; i++){
            this.body[i] = new Body(canvas, this.headx + i*Body.width, this.heady);
        }
        
        this.step();
    };
    
    draw = () => {
        for(var i=this.size - 1; i>= 0; i--){
            this.body[i].draw();
        }
    };

    step = () => {
        window.setTimeout(() => {
            if(this.checkFood()){
                window.requestAnimationFrame(this.eat);
            }
            var flagEat  = this.checkCross();
            if(flagEat){
                return window.requestAnimationFrame(this.deleteTail(flagEat));
            }
            window.requestAnimationFrame(this.move);
            return this.step();
        },150);
    };

    deleteTail(start){
        var k=0;
        for(var i=0; i<1; i++){
            window.setTimeout(() => {
                for(var j=start + 1; j<this.size; j++){
                    this.body[j].remove();
                }
            }, ++k * 100);
            window.setTimeout(() => {
                for(var j=start + 1; j<this.size; j++){
                    this.body[j].draw();
                }
            }, ++k * 100);
        }
        window.setTimeout(()=>{
            
            for(var j=start + 1; j<this.size; j++){
                this.body[j].remove();
            }
            this.size = start;
        }, ++k * 100);
        window.setTimeout(this.step(), ++k*100);
    }

    move = () =>{
        this.remove();
        
        for(var i=this.size; i>0; i--){
            this.body[i].move(this.body[i-1].x, this.body[i-1].y);
        }
        
        this.headx+=this.xspeed;
        this.heady+=this.yspeed;
        
        if(this.headx < 0){
            this.headx = this.canvas.width - Body.width;
        }
        if(this.headx >= this.canvas.width){
            this.headx = 0;
        }
        if(this.heady < 0){
            this.heady = this.canvas.height - Body.width;
        }
        if(this.heady >=this.canvas.height){
            this.heady = 0;
        }
        this.body[0].move(this.headx, this.heady);
        
        this.draw();
      
    };
   
    remove = () =>{
        for(var i=0; i<this.size; i++){
            this.body[i].remove();
        }
    }
    
    rotate = (e) =>{
        switch(e.key){
            case "ArrowDown": {
                if(this.xspeed){
                    this.xspeed = 0;
                    this.yspeed = 1 * Body.width;
                }
                break;
            }
            case "ArrowUp":{
                if(this.xspeed){
                    this.xspeed = 0;
                    this.yspeed = -1 * Body.width;
                }
                break;
            }
            case "ArrowLeft": {
                if(this.yspeed){
                    this.yspeed = 0;
                    this.xspeed = -1 * Body.width;
                }
                break;
            }
            case "ArrowRight": {
                if(this.yspeed){
                    this.yspeed = 0;
                    this.xspeed = 1 * Body.width;
                }
                break;
            } 
        }           
    }
    
    setMap(map){
        this.Map = map; 
    }

    checkFood = () => this.body[0].x === map.foodX && this.body[0].y  === map.foodY;

    eat = () =>{
        this.body[++this.size] = new Body(this.canvas, 0, 0);
        map.generateFood_(this);
    }

    checkCross(){
        for(var i=1; i<this.size; i++){
            if(this.body[0].x === this.body[i].x && this.body[0].y === this.body[i].y)
                return i;
        }
        return 0;
    }
};

class Map{
    
    static fRadius = Body.width/4;

    constructor(canvas){
        if(canvas.getContext){
            this.ctx = canvas.getContext('2d');
            this.canvas = canvas;
            this.img = new Image(Body.width);
            this.img.src = './img/apple.png';
            this.img.width = Body.width;
            this.img.height = Body.width;
        }

    }

    generateFood(Snake){
        this.foodX = Math.floor(((Math.random()*this.canvas.width/(Body.width)))) * Body.width + Body.width/2;
        this.foodY = Math.floor(((Math.random()*this.canvas.width/(Body.width)))) * Body.width + Body.width/2;
        for(var i=0; i<Snake.size; i++){
            var 
                dst = Math.sqrt((this.foodX - (Snake.body[i].x + Body.width))**2 + (this.foodY -  (Snake.body[i].y + Body.width))**2);
            if(dst < Body.width/2 + Map.fRadius){
                console.log("colisium");
                return this.generateFood(Snake);
            }
        }
        console.log("f  " + this.foodX + "\t" + this.foodY)
        this.draw();
    }

    generateFood_ = (Snake) =>{
        this.foodX = Math.floor(((Math.random()*this.canvas.width/(Body.width)))) * Body.width;
        this.foodY = Math.floor(((Math.random()*this.canvas.width/(Body.width)))) * Body.width;
        
        for(var i=0; i<Snake.size; i++){
            var 
                dst = Math.sqrt((this.foodX - Snake.body[i].x)**2 + (this.foodY -  Snake.body[i].y)**2);
            if(dst < Body.width){
                console.log("colisium");
                return this.generateFood_(Snake);
            }
        }
        window.requestAnimationFrame(this.draw);
    }

    /*draw(){
        this.ctx.beginPath();
        this.ctx.fillStyle = 'Black';
        this.ctx.arc(this.foodX, this.foodY, Map.fRadius, 0, Math.PI*2);
        this.ctx.fill();
    }*/

    draw = () =>{
        this.ctx.drawImage(this.img, this.foodX,this.foodY,Body.width, Body.width);
        console.log(this.foodX + "\t" + this.foodY);
        
    }
    remove(){
        this.ctx.clearRect(this.foodX - Map.fradius, this.foodY - Map.fradius, Map.fradius*2, Map.fradius*2);
    }

    setBackground(){

    };

}

map = new Map(document.getElementsByTagName('canvas')[0]);
snake = new Snake(document.getElementsByTagName("canvas")[0]);

map.generateFood_(snake);
snake.setMap(map);

window.addEventListener("keydown", (e) => snake.rotate(e));
