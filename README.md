    
- Project Website: [cafesanu.github.io/html5-minesweeper-cafesanu/][1]

## Technologies used
- [CSS][6]
- [HTML][7]
- [Javascript][2]


## About
* This game is completely done in JavaScript, HTML5, and CSS.
* Game tested on the Ubuntu 14.04 versions of Google Chrome, Firefox, and Opera.
* Game developed in two days on September 2014.
* Since I had not worked with HTML5 canvas before, I looked at two other games code at github. [2048][3], and another version of [minesweeper][4]
* I borrowed parts of the function roundRect from the other [minesweeper game github][4], since this does a nice job drawing a single square. Other than this function, all the logic implemented is done by me. Game logic, and game UI is completely different.
* If you would like to see an identical version of the original Windows Minesweeper n order to compare, [this page][5] has an identical version.
* Smiley gets sad if you lose! Just like in the original game.

##Instructions
* Want to play the game?! Go to [http://cafesanu.github.io][8]
* For a better experience, please play with a good old fashioned mouse!
* To start a game, left-click any cell,
* Left number on top means the number of mines left to discover (Exactly like the original version). 
  * Basically it is (total mines - number of flags). 
  * This does not mean that the flags are in the right  position.
* Right number displays the number of seconds passed since the first left-click on a cell (Exactly like the original version).
* To flag an uncovered cell, right click the cell
* To unflag an flagged cell, right click the cell
* If you believe you have flagged the correct mines around a number, right-click the number and a recursive process will start, uncovering possible neighbors.
  * This means that if the flags are in the wrong position, you will lose.
* If you want to highlight uncovered neighbors of a cell, right-click the cell.
* If you lose, the solution of the game instance will be displayed
* To re-start a game, click the smiley.

##Known bugs
* None

##To-do
* Right now, there is no logic that identifies if user wins.
  * I want to add this, so the user won't be able to unflag cells (once there is only cells left with mines, meaning user won)
  * For user to know she or he won, smiley should be wearing glasses (Like in the original version).



[1]: http://cafesanu.github.io/html5-minesweeper-cafesanu
[2]: http://www.w3schools.com/js/
[3]: https://github.com/gabrielecirulli/2048
[4]: https://github.com/Joeynoh/HTML5-Minesweeper/
[5]: http://minesweeperonline.com/
[6]: http://www.w3.org/Style/CSS/Overview.en.html
[7]: http://www.w3.org/
[8]: http://cafesanu.github.io/
