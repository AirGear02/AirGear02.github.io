class Cell{
    colors = ["blue", "green", "red", "#6957ec", "#7b2525", "#38c0c8", "#7b18d6"];
    constructor(srcMine = "./img/mine.png", srcFlag = "./img/flag.png", srcBoom = "./img/boom.png"){
        this.isMine = false;
        this.mineNear = 0;
        this.isOpen = false;
        this.isMarked = false;
        this.MINE_TEXTURE = srcMine;
        this.FLAG_TEXTURE = srcFlag;
        this.BOOM_TEXTURE = srcBoom;
        
    };
    
    createCell = (width = 30, height = width) =>{
        this.div = document.createElement("div");
        this.div.className = "cell-close";
        this.div.style.width = width + "px";
        this.div.style.height = height + "px";
        if(this.isMine){
            var img = document.createElement("img");
            img.alt = "mine";
            img.className = "mine";
            img.setAttribute("src",this.MINE_TEXTURE);
            this.div.appendChild(img);
            return;
        }
       
        if(!this.mineNear)
            return;
        this.div.innerHTML = "<p>" + this.mineNear + "</p>";
        this.div.style.color = this.colors[this.mineNear-1];
    };
    
    render = (parentElem) =>{
        this.createCell();
        parentElem.appendChild(this.div);    
    };
    
    open = () =>{
        if(this.isOpen)
            return;
        this.div.className = "cell-open"
        this.isOpen = true;
    };
    
    bang = () =>{
        if(!this.isMine){
            return;
        }
        
        this.div.className = "cell-open"
        this.isOpen = true;

        var boom  = document.createElement("img");
        boom.alt="boom";
        boom.className = "boom";
        boom.setAttribute("src", this.BOOM_TEXTURE);
        this.div.removeChild(this.div.firstChild);
        this.div.appendChild(boom);
    }
    makeMark = () =>{
        if(this.isMarked){
            this.mark.remove();
            this.isMarked = false;
            return;
        }
        if(this.mark===undefined){
            this.mark = document.createElement("img");
            this.mark.alt= "mark"
            this.mark.className = "mark"
            this.mark.setAttribute("src", this.FLAG_TEXTURE);
        }
        this.div.appendChild(this.mark);
        this.isMarked = true;
    }
    isEmpty = () =>{
        return !(this.isMine && this.mineNear);
    }
};


class MineField {

    rightBtn = false;
    leftBtn = false;
    constructor(size, minesCount){
        this.field = new Array(size);
        for(var  i=0; i<size;i++){
            this.field[i] = new Array(size);
            for(var j=0; j<size; j++)
                this.field[i][j] = new Cell;
        }
        this.size = size;
        this.createMines(minesCount);
        this.minesCount = minesCount;
        this.openedCells = 0;
        this.wrap  = document.createElement("div");
        this.wrap.className  = "wrap";
        this.wrap.id = "wrap";
        this.wrap.style.width = 30*size + "px";
        this.wrap.style.height = 30*size + "px";
        this.wrap.addEventListener("click", (e)=>{
            const [row, column] = this.getPosition(e.clientX, e.clientY);
            if(this.field[row][column].isOpen || this.field[row][column].isMarked){
                return;
            }
            if(this.field[row][column].isEmpty()){
                this.openEmpty(row,column);
                return;
            }
            if(this.field[row][column].isMine){
                window.setInterval(this.field[row][column].bang,480);
                window.setInterval(this.bangAll, 480);
            }
            this.field[row][column].open();
            if(++this.openedCells == this.size**2 - this.minesCount){
                alert("OMFG Win is yours!");
            }
           
                
        });
        this.wrap.addEventListener("mousedown",(e)=>{
            /* 4 - middle button  */
            if(e.buttons!==4){
                return
            }    
            const[row, column] = this.getPosition(e.clientX, e.clientY);    
            if(!this.field[row][column].isOpen || !this.field[row][column].mineNear){
                return;
            }
            this.openObvious(row, column);
        });
        
        this.wrap.addEventListener("contextmenu",(e)=>{
            e.preventDefault();
            const[row, column] = this.getPosition(e.clientX, e.clientY);  
            if(!this.field[row][column].isOpen){
                this.field[row][column].makeMark();
            }
        });
    };
    
    isExists = (row, column) => {
        return row>=0 && row<this.size && column>=0 && column<this.size;
    }

    openObvious = (row, column) =>{
        var flagCount = 0;
        for(var i=row-1; i<row+2; i++){
            for(var j=column-1; j<column+2; j++){
                if(this.isExists(i,j) && this.field[i][j].isMarked){
                    flagCount++;
                    }
            }
        }
        if(flagCount!==this.field[row][column].mineNear){
                return;
        }

        for(i=row-1; i<row+2; i++){
            for(j=column-1; j<column+2; j++){
                if(this.isExists(i,j) && !this.field[i][j].isOpen && !this.field[i][j].isMarked){
                    if(!this.field[i][j].mineNear){
                        this.openEmpty(i,j);
                        return;
                    }
                    if(this.field[i][j].isMine){
                        this.field[i][j].bang();
                        this.bangAll();
                        return;
                    }
                    this.field[i][j].open();
                    if(++this.openedCells == this.size**2 - this.minesCount){
                        alert("OMFG Win is yours!");
                    }
                    
                    this.openObvious(i,j);
                }
            }
        }
    }

    openEmpty = (i,j) =>{
        if( !this.isExists(i,j) || this.field[i][j].isMarked || this.field[i][j].isOpen || this.field[i][j].isMine)
            return;
        
        this.field[i][j].open();
        if(++this.openedCells == this.size**2 - this.minesCount){
            alert("OMFG Win is yours!");
        }
        if(this.field[i][j].mineNear){
            return;
        }
        for(var x=i-1; x<i+2;x++)
            for(var y = j-1; y<j+2; y++)
                this.openEmpty(x,y);
    }

    getPosition = (clientX, clientY) =>{
        var column = clientX - this.wrap.offsetLeft, row = clientY - this.wrap.offsetTop;
        const cellWidth = this.field[0][0].div.offsetWidth;
        column = Math.floor(column/cellWidth);
        row = Math.floor(row/cellWidth);
        return [row, column];
    };

    createMines = (minesCount) => {
        var x,y;
        for(var i=0; i<minesCount; i++){
            x=Math.floor(Math.random()*this.size);
            y=Math.floor(Math.random()*this.size);
            if(this.field[x][y].isMine) 
                --i;
            else{
                this.field[x][y].isMine = true; 
                this.countMinesNear(x,y);
            }
        }
    };
    
   getCell(element){
    for(var i=0; i<this.size;i++)
        for(var j=0; j<this.size; j++)
            if(element.isSameNode(this.field[i][j].div))
                return this.field[i][j];
   }

    countMinesNear(x,y){
        for(var i=x-1;i<x+2;i++){
            for(var j=y-1; j<y+2; j++){
                if(i<0 || i>=this.size || j<0 || j>=this.size)
                    continue;
                this.field[i][j].mineNear++;
            }
        }
    }
    
    render = () => {
        for(var i=0; i<this.size;i++)
            for(var j=0; j<this.size; j++)
                this.field[i][j].render(this.wrap);
    }

    bangAll = () =>{
        var k=0;
        for(var i=0; i<this.size; i++){
            for(var j=0; j<this.size; j++){
                if(this.field[i][j].isMine){
                    window.setInterval(this.field[i][j].open, 0*++k);
                }
            }
        }
    }

};

field = new MineField(10, 10);
field.render();
document.body.appendChild(field.wrap);




