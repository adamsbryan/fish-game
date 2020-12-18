//Canvas setup
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = 1000;
canvas.height = 650;

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
    mouse.x = event.x - canvasPosition.left;
    mouse.y = event.y - canvasPosition.top;
});

canvas.addEventListener('mouseup', function(event){
    mouse.click = false;
});

//Player
const playerLeft = new Image();
playerLeft.src = 'images/userModels/black_left.png';
const playerRight = new Image();
playerRight.src = 'images/userModels/black_right.png';

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
        if(gameFrame % 6 == 0){
            this.frame++;
            this.frameX = this.frame % 4;
            this.frameY = (this.frame % 12 / 4) | 0; 
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
        //ctx.closePath();
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
                handleScore();
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
const enemyImage1 = new Image();
enemyImage1.src = 'images/enemy1.png';
const enemyImage2 = new Image();
enemyImage2.src = 'images/enemy2.png';

class Enemy1{
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
        ctx.drawImage(enemyImage1, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.x - 60, this.y - 70, this.spriteWidth / 3, this.spriteHeight / 3)
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
            handleDamage();
            this.x = canvas.width + 500;
            this.y = Math.random() * (canvas.height - 90);
            this.speed = Math.random() * 2 + 2;
        }
    }
}

class Enemy2{
    constructor(){
        this.x = -200;
        this.y = Math.random() * (canvas.height - 90);
        this.radius = 60;
        this.speed = Math.random() * 2 + 2;
        this.frame = 0;
        this.frameX = 0;
        this.frameY = 0;
        this.spriteWidth = 256;
        this.spriteHeight = 256;
    }
    draw(){
        ctx.drawImage(enemyImage2, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.x - 60, this.y - 70, this.spriteWidth / 2, this.spriteHeight / 1.7)
    }
    update(){
        this.x += this.speed;
        if(this.x > canvas.width + this.radius * 2){
            this.x = -200;
            this.y = Math.random() * (canvas.height - 90);
            this.speed = Math.random() * 2 + 2;
        }
        if(gameFrame % 5 == 0){
            this.frame++;
            this.frameX = this.frame % 6;
            // "| 0" is the same as writing Math.floor(this.frame % 12 / 4)
            //this.frameY = (this.frame % 12 / 4) | 0; 
        }
        //collision with player
        const distanceX = this.x - player.x;
        const distanceY = this.y - player.y;
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
        if(distance < this.radius + player.radius){
            handleDamage();
            this.x = -500;
            this.y = Math.random() * (canvas.height - 90);
            this.speed = Math.random() * 2 + 2;
        }
    }
}

const enemy1 = new Enemy1();
const enemy2 = new Enemy2();
function handleEnemies(){
    enemy1.draw();
    enemy1.update();
    enemy2.draw();
    enemy2.update();
}

//Animation loop
function animate(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(staticBackground, 0, 0, 1000, 650);
    drawLives();
    handleBubbles();
    //handleBackground();
    instructions();
    ctx.fillStyle = 'white';
    ctx.fillText('BEST: ' + Math.max(...highScore), 10, 635);
    player.draw();
    player.update();
    handleEnemies();
    handlePlayerBlink();
    gameFrame++;
    if(!gameOver){
        requestAnimationFrame(animate);
    } else {
        handleGameOver();
        playAgainButton.style.zIndex = '2';
        settingsContainer.style.zIndex = '1';
        resetToDefault();
    }
    if(!player.lives){
        gameOver = true;
    }
}

window.addEventListener('resize', function (){
    canvasPosition = canvas.getBoundingClientRect();
});

/////////////////////////////////////////////////////////////////////
//tutorial completed above --- self added features below

let highScore = [0];
let startButton = document.getElementById("startButton");
let playAgainButton = document.getElementById("playAgain");

playAgainButton.style.zIndex = '-1';
startButton.addEventListener("click", handleButtons);
playAgainButton.addEventListener("click", handleButtons);

function handleButtons(e){
    startButton.style.zIndex = '-1';
    playAgainButton.style.zIndex = '-1';
    settingsContainer.style.zIndex = '-1';
    gameOver = false;
    animate();
}
let settingsButton = document.getElementById("settingsButton");
let settingsContainer = document.getElementsByClassName("settingsContainer")[0];
let settingsPage = document.getElementById("settings");
let closeSettings = document.getElementsByClassName("close")[0];

settingsButton.addEventListener("click", handleSettings);
closeSettings.addEventListener("click", handleClose);

function handleSettings(e){
    settingsPage.style.zIndex = "3";
}

function handleClose(e){
    settingsPage.style.zIndex = "-1";
}

let blackFish = document.getElementById("black");
let yellowFish = document.getElementById("yellow");
let purpleFish = document.getElementById("purple");
let redFish = document.getElementById("red");
let greenFish = document.getElementById("green");
let blueFish = document.getElementById("blue");

blackFish.addEventListener("click", handleBlackChoice);
yellowFish.addEventListener("click", handleYellowChoice);
purpleFish.addEventListener("click", handlePurpleChoice);
redFish.addEventListener("click", handleRedChoice);
greenFish.addEventListener("click", handleGreenChoice);
blueFish.addEventListener("click", handleBlueChoice);

function handleBlackChoice(e){
    playerLeft.src = 'images/userModels/black_left.png';
    playerRight.src = 'images/userModels/black_right.png';
}
function handleYellowChoice(e){
    playerLeft.src = 'images/userModels/yellow_left.png';
    playerRight.src = 'images/userModels/yellow_right.png';
}
function handlePurpleChoice(e){
    playerLeft.src = 'images/userModels/purple_left.png';
    playerRight.src = 'images/userModels/purple_right.png';
}
function handleRedChoice(e){
    playerLeft.src = 'images/userModels/red_left.png';
    playerRight.src = 'images/userModels/red_right.png';
}
function handleGreenChoice(e){
    playerLeft.src = 'images/userModels/green_left.png';
    playerRight.src = 'images/userModels/green_right.png';
}
function handleBlueChoice(e){
    playerLeft.src = 'images/userModels/blue_left.png';
    playerRight.src = 'images/userModels/blue_right.png';
}

let staticBackground = new Image();
staticBackground.src = 'images/backgroundStatic.jpg';
let livesImage = new Image();
livesImage.src = 'images/Herz.svg';

function handleScore(){
    score++;
    if(score > Math.max(...highScore)){
        highScore[0] = score;
    }
}

function instructions(){
    if(gameFrame < 500){
        ctx.fillStyle = 'black';
        ctx.fillText("Collect as many bubbles as possible", 200, 300);
        ctx.fillText("(Careful of other fish!)", 315, 350);
    } else {
        ctx.fillText(score, 500, 175);
    }
}

function drawLives(){
    if(player.lives == 3){
        ctx.drawImage(livesImage, 775, 575, 75, 75);
        ctx.drawImage(livesImage, 850, 575, 75, 75);
        ctx.drawImage(livesImage, 925, 575, 75, 75);
    }
    if(player.lives == 2){
        ctx.drawImage(livesImage, 775, 575, 75, 75);
        ctx.drawImage(livesImage, 850, 575, 75, 75);
    }
    if(player.lives == 1){
        ctx.drawImage(livesImage, 775, 575, 75, 75);
    }
}

let playerBlink = 0;
let gameFrameCatch = 0;

function handleDamage(){
    player.lives--;
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, 1000, 650);
    gameFrameCatch = gameFrame;
    playerBlink = gameFrameCatch + 150;
}

function handlePlayerBlink(){
    if(gameFrame < playerBlink){
        if(gameFrame < gameFrameCatch){
            player.frameX = -1;
            player.frameY = -1;
        } else {
            player.frameX = 1;
            player.frameY = 1;
        }
        if(gameFrame > gameFrameCatch + 10){
            gameFrameCatch += 20;
        }
        //player invincibility
        enemy1.radius = -60;
        enemy2.radius = -60;
    } else {
        enemy1.radius = 60;
        enemy2.radius = 60;
    }
}

function handleGameOver(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '80px Georgia';
    ctx.fillText('GAME OVER', 275, 150);
    ctx.font = '40px Georgia';
    if(score >= Math.max(...highScore)){
        ctx.fillStyle = 'magenta';
        ctx.fillText('NEW HIGH SCORE: ' + score, 300, 225)
    } else {
        ctx.fillStyle = 'black';
        ctx.fillText('SCORE: ' + score, 415, 210);
    }
    highScore.push(score);
}

function resetToDefault(){
    score = 0;
    gameFrame = 0;
    gameFrameCatch = 0;
    playerBlink = 0;
    player.lives = 3;
    mouse.x = canvas.width/2;
    mouse.y = canvas.height/2;
    player.x = canvas.width/2;
    player.y = canvas.height/2;
    enemy1.x = canvas.width + 200;
    enemy1.y = Math.random() * (canvas.height - 90);
    enemy1.speed = Math.random() * 2 + 2;
    enemy2.x = -200;
    enemy2.y = Math.random() * (canvas.height - 90);
    enemy2.speed = Math.random() * 2 + 2;
    bubblesArray = [];
}