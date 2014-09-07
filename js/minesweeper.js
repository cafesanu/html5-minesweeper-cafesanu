$(function MinesweeperCAFESANU(){

    'use strict';

    /*
     * Global variables
     * Based on http://stackoverflow.com/questions/5786851/define-global-variable-in-a-javascript-function
     */
    var boardCanvas      = null;
    var boardContext     = null;
    var celSize          = 30;
    var cols             = '';
    var counterCanvas    = null;
    var counterContext   = null;
    var firstClick       = true;
    var flag             = '';
    var flagSource       = 'images/flag.jpg';
    var font             = '24px Lato';
    var gameover         = false;
    var happyButton      ='';
    var height           = 0;
    var instance         = '';
    var killerMine       = '';
    var killerMineSource = 'images/killerMine.jpg';
    var lastDownEvent    = '';
    var mine             = '';
    var mineRed          = '';
    var mineRedSource    = 'images/mineRed.jpg';
    var minesLeft        = numMines;
    var minesLeftArea    = '';
    var mineSource       = 'images/mine.jpg';
    var uncoveredCells   = 0
    var numMines         = 99;
    var rows             = '';
    var secondsPassed    = 0;
    var squareBorder     = '#EEEEEE';
    var timeArea         ='';
    var timeInterval     = 0;
    var coveredCells     = 0;
    var width            = 0;

    //Constants
    var COVERED          = 'covered';
    var FLAGGED          = 'flagged';
    var LEFT_CLICK       = 0;
    var ONE_SECOND       = 1000;
    var RIGHT_CLICK      = 2;
    var UNCOVERED        = 'uncovered';

    var MINE_BOMB        = '*';
    var MINE_ZERO        = '0';
    var MINE_ONE         = '1';
    var MINE_TWO         = '2';
    var MINE_THREE       = '3';
    var MINE_FOUR        = '4';
    var MINE_FIVE        = '5';
    var MINE_SIX         = '6';
    var MINE_SEVEN       = '7';
    var MINE_EIGHT       = '8';

    var COLOR_ZERO       = 'white';
    var COLOR_ONE        = 'blue';
    var COLOR_TWO        = 'green';
    var COLOR_THREE      = 'red';
    var COLOR_FOUR       = 'DarkBlue';
    var COLOR_FIVE       = 'DarkRed';
    var COLOR_SIX        = 'DarkCyan';
    var COLOR_SEVEN      = 'DarkMagenta';
    var COLOR_EIGHT      = 'rgb(81, 81, 81)';//Darkgrey
    var COLOR_BOMB       = 'black';

    /*
     * Class game
     */
    var game = {

        /**
         * Function called when page loads. It initializes all global variables, and presents the user with an initial board game
         */
        start: function(){
            //Get elements from page that we need to change
            boardCanvas  = $('#playarea');
            boardContext = boardCanvas[0].getContext('2d');

            //Button in charge or restart the board to an initial state
            happyButton   = $('#happyBtn');
            minesLeftArea =$('div#areaMinesLeft');
            timeArea      =$('div#areaTime');

            //Listeners on boardCanvas an face button. This is where the magic happens!
            boardCanvas.on({
                mouseup: function(e){
                    game.rightClickColorNeighbors(lastDownEvent, '#DADADA');
                    game.click(e);
                },
                mousedown: function(e){
                    lastDownEvent = e;
                    game.rightClickColorNeighbors(e, '#C1C1C1');
                }
            });

            happyButton.on({
                click: function(){
                    game.startInstance();
                }
            });

            //Set defaults that will never change
            boardContext.font = font;
            boardContext.strokeStyle = squareBorder;            
            width = boardCanvas.width();
            height = boardCanvas.height();

            //Calculate how many rows will fit in boardCanvas
            rows = Math.floor(height / celSize);
            cols = Math.floor(width / celSize);

            //Load images
            mine = new Image();
            mine.src = mineSource;
            mineRed = new Image();
            mineRed.src = mineRedSource;
            killerMine = new Image();
            killerMine.src = killerMineSource;
            flag = new Image();
            flag.src = flagSource;

            game.startInstance();
        },

        /*
         * Restart global variables that might have been changed previously and draws brand new board
         */
        startInstance:function(){
            game.restartInstanceElements();            
            game.drawNewBoard();
        },

        /*
         * Adds a second passed and displays it in page
         */
        oneMoreSecond:function(){
            timeArea.text(secondsPassed);  
            secondsPassed++; 
        },

        /*
         * Restart global variables that might have been changed previously
         */
        restartInstanceElements: function(){ 

            coveredCells = rows * cols;
            secondsPassed = 0;
            timeArea.text(secondsPassed);
            secondsPassed++;

            //Stop interval listener
            clearInterval(timeInterval);

            document.getElementById('happyBtn').style.backgroundImage="url('images/happyFace.png')";

            //Create matrix for instance game
            instance = new Array(rows);
            for(var row = 0; row < rows; row++){
                instance[row] = new Array(cols);
            }

            firstClick       = true;
            gameover         = false;
            minesLeft        = numMines;
            game.updateMinesLeftArea();
        },

        /*
         * Handle each click user makes in board
         */
        click: function(e){
            if(!gameover){
                var whichClick = e.button;         
                var row = Math.floor((e.pageY - boardCanvas[0].offsetTop - 1) / celSize);
                var col = Math.floor((e.pageX - boardCanvas[0].offsetLeft - 1) / celSize);

                if(whichClick == LEFT_CLICK){
                    if(firstClick){
                        timeInterval = setInterval(function () {game.oneMoreSecond()}, ONE_SECOND);
                        firstClick = false;
                        game.createInstance(row, col);
                    }
                    game.uncover(row, col);
                    game.checkIfWon();
                }
                else if(whichClick == RIGHT_CLICK && !firstClick){
                    game.handleRightClick(row,col);
                }
            }
        },

        /*
         * Chacke if user has won by chanking that the amount of cover cells is equal 
         * to the number of mines(Meaning there is nothing else but mines)
         */
        checkIfWon: function(){
            if(!gameover && coveredCells == numMines){
                game.win()
            }
        },

        /*
         * User won!
         */
        win: function(){
            clearInterval(timeInterval);
            gameover = true;
            document.getElementById('happyBtn').style.backgroundImage="url('images/winner.png')";
            game.drawSolution();
        },

        /*
         * If user clicks on a number, then, uncovered
         * neigbor cells are highlighted
         */
        rightClickColorNeighbors: function(e, color){

            var whichClick = e.button;  
            if(!gameover && whichClick == RIGHT_CLICK && !firstClick){       
                var row = Math.floor((e.pageY - boardCanvas[0].offsetTop - 1) / celSize);
                var col = Math.floor((e.pageX - boardCanvas[0].offsetLeft - 1) / celSize);
                var content = instance[row][col];
                if(content.status === UNCOVERED){
                    for(var shiftRow = -1; shiftRow <=1; shiftRow++){
                        for(var shiftCol = -1; shiftCol <= 1; shiftCol++){
                            var neighborRow = row + shiftRow;
                            var neighborCol = col + shiftCol;
                            if( game.withinBoundaries(neighborRow,neighborCol) &&  !(shiftRow == 0 && shiftCol == 0)){
                                if(instance[neighborRow][neighborCol].status == COVERED){
                                    game.drawColoredSquare(neighborRow, neighborCol, color);
                                }
                            }
                        }
                    }
                }
            }
        },

        /*
         * Uncovers a cell:
         *  if the cell is a flag or a uncovered number, do nothing.
         *  if the cell is a cover number, uncover it
         *  if the cell is a mine, gameover!
         *  if the cell un uncovered and has zero mines around, uncover it and
         *  recursevly do same process with neighbors.
         */
        uncover: function(row, col){
            content = instance[row][col];
            if(content.status == UNCOVERED || content.status == FLAGGED){
                return;
            }
            if(content.content == MINE_BOMB){
                game.lose(row, col);
                return;
            }
            coveredCells--;
            instance[row][col].status = UNCOVERED;
            game.drawUncoveredSquare(row,col);
            var content = instance[row][col].content;
            if(content === MINE_ZERO){
                for(var shiftRow = -1; shiftRow <=1; shiftRow++){
                    for(var shiftCol = -1; shiftCol <= 1; shiftCol++){
                        var neighborRow = row + shiftRow;
                        var neighborCol = col + shiftCol;
                        if( game.withinBoundaries(neighborRow,neighborCol) && !(shiftRow == 0 && shiftCol == 0) ){
                            game.uncover(neighborRow, neighborCol);
                        }
                    }
                }
            }
        },


        /*
         * Handles when user releases right click button
         */
        handleRightClick: function(row, col){
            var status = instance[row][col].status;
            //if cell is flag, delete it
            if(status == FLAGGED){
                game.increaseMinesLeft();
                instance[row][col].status = COVERED;
                var squareColor = '#DADADA';
                game.drawColoredSquare(row, col, squareColor);
            }
            //if cell is coveres, put a flag on it
            else if(status == COVERED){  
                game.decreaseMinesLeft();
                instance[row][col].status = FLAGGED;
                boardContext.drawImage(flag, col * celSize, row * celSize, celSize, celSize);
            }
            //if click is on an uncovered number begin discovery process or lose if flags are in the wrong place
            else if(status == UNCOVERED){
                game.openNeighborsOrLoseIfEnoughFlags(row,col);
            }
        },

        /*
         * Increase number of mines and upated web are displaying mines left
         */
        increaseMinesLeft: function(){
            minesLeft++;
            game.updateMinesLeftArea();  
        },

        /*
         * Decrease number of mines and upated web are displaying mines left
         */
        decreaseMinesLeft: function(){
            minesLeft--;
            game.updateMinesLeftArea();  
        },

        /*
         * update website showing number of mines left
         */
        updateMinesLeftArea: function(){
            minesLeftArea.text(minesLeft.toString());   
        },

        /*
         * 
         *  If the number of flags around number is equal to the number:
         *      - if flags are in the right position (where the mines are), then a discovery process 
         *        is triggered to uncover neigbors, instead of user clicking cell by cell.
         *      - if flags are in the wrong position, then user loses, and game solution is revealed
         * If the number of flags (including zero) doesn't match the number of mines, 
         */
        openNeighborsOrLoseIfEnoughFlags: function(row,col){
            var numFlags = 0;
            var flagInWrongSquare = false;
            var numMinesAround = 0;
            //Get to see if flags are in the right position 
            for(var shiftRow = -1; shiftRow <=1; shiftRow++){
                for(var shiftCol = -1; shiftCol <= 1; shiftCol++){
                    var neighborRow = row + shiftRow;
                    var neighborCol = col + shiftCol;
                    if( game.withinBoundaries(neighborRow, neighborCol)){
                        var cell = instance[neighborRow][neighborCol];
                        if(cell.content == MINE_BOMB){
                            numMinesAround++;
                        }
                        if(cell.status == FLAGGED){
                            numFlags++;
                            if(cell.content != MINE_BOMB){
                                flagInWrongSquare = true;
                            }
                        }
                    }
                }
            }
            //If the number of flags is equal to the number of mines
            //  If they are in the worng position, gameover!
            //  otherwise begin discovery process
            if(numFlags > 0 && numFlags == numMinesAround)
            {
                if(flagInWrongSquare){
                    game.lose();
                }
                else{
                    for(var shiftRow = -1; shiftRow <=1; shiftRow++){
                        for(var shiftCol = -1; shiftCol <= 1; shiftCol++){
                            var neighborRow = row + shiftRow;
                            var neighborCol = col + shiftCol;
                            if( game.withinBoundaries(neighborRow, neighborCol)){
                                game.uncover(neighborRow, neighborCol);
                            }
                        }
                    }
                }
            }
        },
        /*
         * verifies if row and col are within the matrix board
         */
        withinBoundaries: function(row, col){
            return (row >= 0 && row < rows && col >=0 && col < cols);
        },

        /*
         * Sets stats of the game to gamover, draws solution and user is now unable to click on anything
         */
        lose: function(row, col){
            clearInterval(timeInterval);
            gameover = true;
            document.getElementById('happyBtn').style.backgroundImage="url('images/sadFace.png')";
            game.drawSolution(row, col);

        },

        /*
         * draws solution including the the number of flags that were in the wrong 
         * position (By showing a bomb with a red cross), the cell that made the user lose (bomd with red backround)
         * and the correct flags put by the user
         */
        drawSolution: function(killerRow, killerCol){
            killerRow = typeof killerRow !== 'undefined' ?  killerRow : -1;
            killerCol = typeof killerCol !== 'undefined' ?  killerCol : -1;
            var userWon = false;
            if(!game.withinBoundaries(killerRow, killerCol))
                userWon = true;
            for(var row = 0; row < rows; row++){
                for(var col = 0; col < cols; col++){
                    var status = instance[row][col].status;
                    if(status == COVERED || status == FLAGGED){
                        game.drawUncoveredSquare(row, col, userWon);
                    }
                } 
            }
            if(game.withinBoundaries(killerRow, killerCol)){
                boardContext.drawImage(killerMine, killerCol * celSize, killerRow * celSize, celSize, celSize);
            }
            
        },

        /*
         * Creates a new instance of the games
         */
        createInstance: function(startRow, startCol){
            var minesCreated = 0;
            //Initialize board with empty characters
            for(var row = 0; row < rows; row++){ 
                for(var col = 0; col < cols; col++){             
                    instance[row][col] = {content:'', status:'covered'};
                } 
            }

            //Create mines in instance
            while(minesCreated < numMines){
                var randomRow = Math.floor(Math.random() * rows);
                var randomCol = Math.floor(Math.random() * cols);
                if(!(randomRow == startRow && randomCol == startCol)){
                    if(instance[randomRow][randomCol].content == ''){
                        instance[randomRow][randomCol].content = MINE_BOMB;
                        minesCreated++;
                    }
                }
            }
            //Create numbers around mines            
            for(var row = 0; row < rows; row++){ 
                for(var col = 0; col < cols; col++){             
                    instance[row][col].content = game.getCellInfo(row,col);
                } 
            }
        },

        /*
         * If cell is a bomb, return the character representing a bomb,
         * If cell is not a momb, get the number of mines around cell
         */
        getCellInfo: function(row, col){
            if(instance[row][col].content === MINE_BOMB){
                return MINE_BOMB;
            }
            var numMinesAround = 0;
            for(var shiftRow = -1; shiftRow <=1; shiftRow++){
                for(var shiftCol = -1; shiftCol <= 1; shiftCol++){
                    var neighborRow = row + shiftRow;
                    var neighborCol = col + shiftCol;
                    if( game.withinBoundaries(neighborRow , neighborCol) &&
                        !(shiftRow == 0 && shiftCol == 0) ){
                        if(instance[neighborRow][neighborCol].content === MINE_BOMB){
                            numMinesAround++;
                        }
                    }
                }
            }
            return numMinesAround.toString();
        },

        /*
         * Draws a new board with all cells covered
         */
        drawNewBoard: function(){
            var squareColor = '#DADADA';
            for(var row = 0; row < rows; row++){
              for(var col = 0; col < cols; col++){
                game.drawColoredSquare(row, col, squareColor);
              } 
            }
        },

        /*
         * if cell is a number, the draws that number
         * if cell is flagged and it has no bomb, then this means flag is in wrong 
         * position. Then display bomb representeg wrong flag
         * if cell is flagged and actualy is a bomb bomb, then this means flag is in right 
         * position. Then display flag
         * If cell is a bomd, draw a bomb
         */
        drawUncoveredSquare: function(row, col, userWon){
            var squareColor = 'white';
            game.drawColoredSquare(row, col, squareColor);
            var cell = instance[row][col];
            switch(cell.content) {
                case MINE_ZERO:       
                    squareColor = COLOR_ZERO;
                    break;
                case MINE_ONE:       
                    squareColor = COLOR_ONE;
                    break;
                case MINE_TWO:       
                    squareColor = COLOR_TWO;
                    break;
                case MINE_THREE:       
                    squareColor = COLOR_THREE;
                    break;
                case MINE_FOUR:       
                    squareColor = COLOR_FOUR ;
                    break;
                case MINE_FIVE:       
                    squareColor = COLOR_FIVE;
                    break;
                case MINE_SIX:       
                    squareColor = COLOR_SIX;
                    break;
                case MINE_SEVEN:       
                    squareColor = COLOR_SEVEN;
                    break;
                case MINE_EIGHT:       
                    squareColor = COLOR_EIGHT;
                    break;
                case MINE_BOMB:       
                    squareColor = COLOR_BOMB;
                    break;
            }
            if(cell.status == FLAGGED && cell.content == MINE_BOMB){
                boardContext.drawImage(flag, col * celSize, row * celSize, celSize, celSize);
            }
            else if(cell.status == FLAGGED && cell.content != MINE_BOMB){
                boardContext.drawImage(mineRed, col * celSize, row * celSize, celSize, celSize);
            }
            else if(cell.content === MINE_BOMB){
                if(userWon) {
                    boardContext.drawImage(flag, col * celSize, row * celSize, celSize, celSize);
                }
                else{
                    boardContext.drawImage(mine, col * celSize, row * celSize, celSize, celSize);
                }
            }
            else{
                boardContext.fillStyle = squareColor;   
                boardContext.fillText(cell.content, (col * celSize) + 8, (row * celSize) + 23);  
            }
        },

        /*
         * draws a cell in (row, col) position with the color passed
         */
        drawColoredSquare: function(row, col, squareColor){
            boardContext.fillStyle = squareColor;            
            var width = celSize - 1;
            var height = celSize - 1;
            var col = col * celSize;
            var row = row * celSize;
        
            boardContext.beginPath();
            boardContext.moveTo(col , row);
            boardContext.lineTo(col + width, row);
            boardContext.quadraticCurveTo(col + width, row, col + width, row);
            boardContext.lineTo(col + width, row + height );
            boardContext.quadraticCurveTo(col + width, row + height, col + width, row + height);
            boardContext.lineTo(col, row + height);
            boardContext.quadraticCurveTo(col, row + height, col, row + height);
            boardContext.lineTo(col, row);
            boardContext.quadraticCurveTo(col, row, col, row);
            boardContext.closePath();
            boardContext.stroke();
            boardContext.fill();    
        },

    };

    //Start game
    game.start();
});
