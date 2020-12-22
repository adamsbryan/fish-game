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
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(mouse.x, mouse.y);
        }
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
            if(player.lives > 0){
                this.x = canvas.width + 500;
                this.y = Math.random() * (canvas.height - 90);
                this.speed = Math.random() * 2 + 2;
            }
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
            if(player.lives > 0){
                this.x = -500;
                this.y = Math.random() * (canvas.height - 90);
                this.speed = Math.random() * 2 + 2;    
            }
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
    if(!player.lives){ gameOver = true; }
    if(!gameOver){
        requestAnimationFrame(animate);
    } else {
        handleGameOver();
        handleEnemies();
        drawEnemy3();
        player.draw();
        player.update();
        //TODO
        //add player drowning animation during gameOver sound frames
        return;
    }
    instructions();
    ctx.fillStyle = 'white';
    ctx.font = '40px Georgia';
    ctx.fillText('BEST: ' + Math.max(...highScore), 10, 635);
    handleDifficulty();
    player.draw();
    player.update();
    handleEnemies();
    handlePlayerBlink();
    gameFrame++;
}

window.addEventListener('resize', function (){
    canvasPosition = canvas.getBoundingClientRect();
});

/////////////////////////////////////////////////////////////////////
//tutorial completed above --- self added features below

let highScore = [0];

//Buttons
let startButton = document.getElementById("startButton");
let playAgainButton = document.getElementById("playAgain");

playAgainButton.style.zIndex = '-1';
startButton.addEventListener("click", startGame);
playAgainButton.addEventListener("click", startGame);

function startGame(e){
    startButton.style.zIndex = '-1';
    playAgainButton.style.zIndex = '-1';
    settingsContainer.style.zIndex = '-1';
    gameOver = false;
    handleMusic();
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
let colorArray = [blackFish, yellowFish, purpleFish, redFish, greenFish, blueFish];

for(let i=0; i<colorArray.length; i++){
    colorArray[i].addEventListener("click", handleColorChoice);
}

function handleColorChoice(e){
    for(let i=0; i<colorArray.length; i++){
        if(colorArray[i].id == e.path[0].id){
            playerLeft.src = `images/userModels/${e.path[0].id}_left.png`;
            playerRight.src = `images/userModels/${e.path[0].id}_right.png`;
            colorArray[i].style.border = '3px solid red';
            removeBorder(colorArray, i);
        }
    }
}

function removeBorder(colorArray, color){
    for(let i=0; i<colorArray.length; i++){
        if(i != color){
            colorArray[i].style.border = "";
        }
    }
}

//Music
const calmMusic = document.createElement("audio");
calmMusic.src = "sounds/calmMusic.wav";
const hardMusic = document.createElement("audio");
hardMusic.src = "sounds/hardMode.wav";
const loseMusic = document.createElement("audio");
loseMusic.src = "sounds/loseGame.wav";

function handleMusic(){
    calmMusic.play();
    calmMusic.loop = true;
}

//UI/UX
let staticBackground = new Image();
staticBackground.src = 'images/backgroundStatic.jpg';
let livesImage = new Image();
livesImage.src = 'images/Herz.svg';
let message = 0;
let difficultyIncrease = false;

function handleScore(){
    score++;
    if(score > Math.max(...highScore)){
        highScore[0] = score;
    }
    if(score == 20){
        difficultyIncrease = true;
        message = gameFrame + 150;
        calmMusic.muted = true;
        hardMusic.play();
        hardMusic.loop = true;
        hardMusic.muted = false;
    }
}

const enemy3 = new Enemy1();
const enemyImage3 = new Image();
enemyImage3.src = 'images/enemy3.png';

function handleDifficulty(){
    if(message > gameFrame){
        ctx.fillStyle = 'red';
        ctx.font = '60px Georgia';
        ctx.fillText("DIFFICULTY INCREASED", 155, 325);
    }
    if(difficultyIncrease){
        enemy3.speed = Math.random() * 5 + 2;
        enemy3.update();
        drawEnemy3();
    }
}

function drawEnemy3(){
    ctx.drawImage(enemyImage3, enemy3.frameX * enemy3.spriteWidth, enemy3.frameY * enemy3.spriteHeight, enemy3.spriteWidth, enemy3.spriteHeight, enemy3.x - 60, enemy3.y - 70, enemy3.spriteWidth / 3, enemy3.spriteHeight / 3);
}

function instructions(){
    if(gameFrame < 300){
        ctx.fillStyle = 'white';
        ctx.fillText("Collect as many bubbles as possible", 200, 300);
        ctx.fillText("(Careful of other fish!)", 315, 350);
    } else if(difficultyIncrease){
        ctx.fillStyle = 'red';
        ctx.font = '80px Georgia';
        ctx.fillText(score, 485, 175);
    } else{
        ctx.fillStyle = 'white';
        ctx.font = '60px Georgia';
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
let damage = document.createElement("audio");
damage.src = 'sounds/damage.flac';

function handleDamage(){
    player.lives--;
    if(player.lives > 0){
        damage.play();
        ctx.fillStyle = 'red';
        ctx.fillRect(0, 0, 1000, 650);   
    }
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
        enemy3.radius = -60;
    } else {
        enemy1.radius = 60;
        enemy2.radius = 60;
        enemy3.radius = 60;
    }
}

//End game features
function handleGameOver(){
    hardMusic.muted = true;
    loseMusic.play();
    setTimeout(function(){ 
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        calmMusic.muted = false;
        ctx.fillStyle = 'white';
        ctx.font = '80px Georgia';
        ctx.fillText('GAME OVER', 275, 150);
        ctx.font = '40px Georgia';
        if(score >= Math.max(...highScore)){
            ctx.fillStyle = 'magenta';
            ctx.fillText('NEW HIGH SCORE: ' + score, 300, 225)
        } else {
            ctx.fillStyle = 'black';
            ctx.fillText('SCORE: ' + score, 405, 210);
        }
        highScore.push(score);
        playAgainButton.style.zIndex = '2';
        settingsContainer.style.zIndex = '1';
        resetToDefault(); 
    }, 4300)  
    
}

function resetToDefault(){
    score = 0;
    gameFrame = 0;
    gameFrameCatch = 0;
    message = 0;
    playerBlink = 0;
    player.lives = 3;
    difficultyIncrease = false;
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
    enemy3.x = canvas.width + 200;
    enemy3.y = Math.random() * (canvas.height - 90);
    bubblesArray = [];
}