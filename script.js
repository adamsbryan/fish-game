//Canvas setup
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 500;

let score = 0;
let gameFrame = 0;
ctx.font = '40px Georgia';
let gameSpeed = 1;
let gameOver = false;

//Mouse interactivity
let canvasPosition = canvas.getBoundingClientRect();

const mouse = {
    x: canvas.width/2,
    y: canvas.height/2,
    click: false
}

canvas.addEventListener('mousedown', function(event){
    mouse.click = true;
    mouse.x = event.x - canvasPosition.left;;
    mouse.y = event.y - canvasPosition.top;
});

canvas.addEventListener('mouseup', function(event){
    mouse.click = false;
});

//Player
const playerLeft = new Image();
playerLeft.src = 'images/player_swim_left.png';
const playerRight = new Image();
playerRight.src = 'images/player_swim_right.png';

class Player {
    constructor(){
        this.lives = 3;
        this.x = canvas.width/2;
        this.y = canvas.height/2;
        this.radius = 50;
        this.angle = 0;
        this.frameX = 0;
        this.frameY = 0;
        this.frame = 0;
        this.spriteWidth = 498;
        this.spriteHeight = 327;
    }
    update(){
        const distanceX = this.x - mouse.x;
        const distanceY = this.y - mouse.y;
        let theta = Math.atan2(distanceY, distanceX);
        this.angle = theta;
        if(mouse.x != this.x) {
            this.x -= distanceX/30;
        }
        if(mouse.y != this.y) {
            this.y -= distanceY/30;
        }
    }
    draw(){
        if(mouse.click){
            ctx.lineWidth = 0.2;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
        }
        ctx.closePath();
        ctx.fillRect(this.x, this.y, this.radius, 10);

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle)

        //adds player image 
        if(this.x >= mouse.x){
            ctx.drawImage(playerLeft, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, 0 - 60, 0 - 45, this.spriteWidth/4, this.spriteHeight/4);
        } else {
            ctx.drawImage(playerRight, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, 0 - 60, 0 - 45, this.spriteWidth/4, this.spriteHeight/4);
        }
        ctx.restore();
    }
}

const player = new Player();

//Bubbles
let bubblesArray = [];
const bubbleImage = new Image();
bubbleImage.src = 'images/bubble_pop_frame_01.png';

class Bubble{
    constructor(){
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + 100;
        this.radius = 50;
        this.speed = Math.random() * 5 + 1;
        this.distance;
        this.counted = false;
        this.sound = Math.random() <= 0.5 ? 'sound1' : 'sound2';
    }
    update(){
        this.y -= this.speed;
        const distanceX = this.x - player.x;
        const distanceY = this.y - player.y;
        this.distance = Math.sqrt(distanceX*distanceX + distanceY*distanceY);
    }
    draw(){
        ctx.drawImage(bubbleImage, this.x - 65, this.y -65, this.radius * 2.6, this.radius * 2.6);
    }
}

const bubblePop1 = document.createElement('audio');
bubblePop1.src = 'sounds/Plop.ogg';
const bubblePop2 = document.createElement('audio');
bubblePop2.src = 'sounds/bubbles-single2.wav';

function handleBubbles(){
    if(gameFrame % 50 == 0){
        bubblesArray.push(new Bubble());
        console.log(bubblesArray.length);
    }
    for(let i = 0; i < bubblesArray.length; i++){
        bubblesArray[i].update();
        bubblesArray[i].draw();
        if(bubblesArray[i] < 0 - bubblesArray[i].radius * 2) {
            bubblesArray.splice(i, 1);
            i--;
        } else if(bubblesArray[i].distance < bubblesArray[i].radius + player.radius){
            if(!bubblesArray[i].counted){
                if(bubblesArray[i].sound == 'sound1'){
                    bubblePop1.play();
                } else {
                    bubblePop2.play();
                }
                score++;
                bubblesArray[i].counted = true;
                bubblesArray.splice(i, 1);
                i--;
            }         
        }      
    }
}

//Repeating backgrounds
const background = new Image();
background.src = 'images/background1.png';

const movingBG = {
    x1: 0,
    x2: canvas.width,
    y: 0,
    width: canvas.width,
    height: canvas.height

} 

function handleBackground(){
    movingBG.x1 -= gameSpeed;
    if(movingBG.x1 < -movingBG.width) movingBG.x1 = movingBG.width;
    movingBG.x2 -= gameSpeed;
    if(movingBG.x2 < -movingBG.width) movingBG.x2 = movingBG.width;
    ctx.drawImage(background, movingBG.x1, movingBG.y, movingBG.width, movingBG.height);
    ctx.drawImage(background, movingBG.x2, movingBG.y, movingBG.width, movingBG.height);

}

//Enemies
const enemyImage = new Image();
enemyImage.src = 'images/enemy1.png';

class Enemy{
    constructor(){
        this.x = canvas.width + 200;
        this.y = Math.random() * (canvas.height - 90);
        this.radius = 60;
        this.speed = Math.random() * 2 + 2;
        this.frame = 0;
        this.frameX = 0;
        this.frameY = 0;
        this.spriteWidth = 418;
        this.spriteHeight = 397;
    }
    draw(){
        ctx.drawImage(enemyImage, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.x - 60, this.y - 70, this.spriteWidth / 3, this.spriteHeight / 3)
    }
    update(){
        this.x -= this.speed;
        if(this.x < 0 - this.radius * 2){
            this.x = canvas.width + 200;
            this.y = Math.random() * (canvas.height - 90);
            this.speed = Math.random() * 2 + 2;
        }
        if(gameFrame % 5 == 0){
            this.frame++;
            this.frameX = this.frame % 4;
            // "| 0" is the same as writing Math.floor(this.frame % 12 / 4)
            this.frameY = (this.frame % 12 / 4) | 0; 
        }
        //collision with player
        const distanceX = this.x - player.x;
        const distanceY = this.y - player.y;
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
        if(distance < this.radius + player.radius){
            player.lives--;
            this.x = canvas.width + 500;
            this.y = Math.random() * (canvas.height - 90);
            this.speed = Math.random() * 2 + 2;
        }
    }
}
const enemy1 = new Enemy();
function handleEnemies(){
    enemy1.draw();
    enemy1.update();
}

//Animation loop
function animate(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    handleBubbles();
    handleBackground();
    player.draw();
    player.update();
    handleEnemies();
    ctx.fillStyle = 'black';
    ctx.fillText('lives: ' + player.lives, 10, 50);
    ctx.fillText('score: ' + score, 10, 100);
    gameFrame++;
    if(!gameOver){
        requestAnimationFrame(animate);
    } else {
        //play again button
        //reset to defaults
        playAgainButton.style.zIndex = '1';
        resetToDefault();
    }
    if(!player.lives){
        handleGameOver();
    }
}

window.addEventListener('resize', function (){
    canvasPosition = canvas.getBoundingClientRect();
});


/////////////////////////////////////////////////////////////////////
//tutorial completed above --- self added features below

let highScore = [];
let startButton = document.getElementById("startButton");
let playAgainButton = document.getElementById("playAgain");

playAgainButton.style.zIndex = '-1';
startButton.addEventListener("click", handleButtons);
playAgainButton.addEventListener("click", handleButtons);

function handleButtons(e){
    startButton.style.zIndex = '-1';
    playAgainButton.style.zIndex = '-1';
    gameOver = false;
    animate();
}

function handleGameOver(){
    highScore.push(score);
    ctx.fillStyle = 'white';
    ctx.fillText('GAME OVER, you reached score ' + score, 120, 250);
    ctx.fillText('High Score: ' + Math.max(...highScore), 120, 300);
    gameOver = true;
}

function resetToDefault(){
    score = 0;
    player.lives = 3;
    mouse.x = canvas.width/2;
    mouse.y = canvas.height/2;
    player.x = canvas.width/2;
    player.y = canvas.height/2;
    enemy1.x = canvas.width + 200;
    enemy1.y = Math.random() * (canvas.height - 90);
    enemy1.speed = Math.random() * 2 + 2;
    bubblesArray = [];
}
