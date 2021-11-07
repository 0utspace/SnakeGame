let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let width = canvas.width;
let height = canvas.height;

let blockSize = 10;
let widthInBlocks = width/blockSize;
let heightInBlocks = height/blockSize;

let score = 0;

function drawBorder() {
    ctx.fillStyle = "grey"
    ctx.fillRect(0,0, width, blockSize)//перша сторона - верхня по вісі Х
    ctx.fillRect(0,height - blockSize, width, blockSize) //нижня сторона
    ctx.fillRect(0,0, blockSize, height) //ліва сторона по вісі У
    ctx.fillRect(width - blockSize,0, blockSize, height) //права сторона по вісі У
}

function drawScore() {
    ctx.font = "20px Courier" //задали розмір та тип шрифта
    ctx.fillStyle = "black" //задали колір
    ctx.textAlign = "left" //опорна точка від якої буде друкуватись текст. Тобто з правого боку від координат.
    ctx.textBaseline = "top" //опорна лінія - текст буде друкуватись під заданими координатами
    ctx.fillText("Score: " + score, blockSize, blockSize)// "рахунок: 0", координати х10 у10
}

function gameOver () {
    // clearInterval(intervalId) //зупиняємо інтервал по його id(змінна, в якому ми помістим на інтервал)
    playing = false
    ctx.font = "60px Courier"
    ctx.fillStyle = "black"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText("Game Over", width/2, height/2)//координати - середина полотна по х та у
}

function circle(x, y, radius, fillCircle) {
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2, false)
    if (fillCircle){
        ctx.fill()
    }
    else {
        ctx.stroke()
    }
}

function Block(col, row) {
    this.col = col
    this.row = row
}

Block.prototype.drawSquare = function (color) {
    let x = this.col * blockSize
    let y = this.row * blockSize
    ctx.fillStyle = color
    ctx.fillRect(x, y, blockSize, blockSize)
}

Block.prototype.drawCircle = function (color) {
    let centerX = this.col * blockSize + blockSize/2 //координата середини квадратика по вісі Х
    let centerY = this.row * blockSize + blockSize/2 //координата середини квадратика по вісі У. Тобто середина квадрата
    ctx.fillStyle = color
    circle(centerX, centerY, blockSize/2, true)
}

Block.prototype.equal = function (otherBlock) {
    return this.col === otherBlock.col && this.row === otherBlock.row
}

function Snake() {
    this.segments =[
        new Block(17,5),
        new Block(16,5),
        new Block(15,5)
    ]
    this.direction = "right"
    this.nextDirection = "right"
}

Snake.prototype.draw = function () {
    for (let i = 0; i < this.segments.length; i++){
        if (i < 1){
            this.segments[i].drawSquare("brown")
        }
        else if ((i % 2) !== 0) {
            this.segments[i].drawSquare("chocolate")
        }
        else {
            this.segments[i].drawSquare("orange")
        }
    }
}

Snake.prototype.move = function () {
    let head = this.segments[0]
    let newHead
    this.direction = this.nextDirection
    if (this.direction === "right"){
        newHead = new Block(head.col + 1, head.row)
    }
    else if (this.direction === "left"){
        newHead = new Block(head.col - 1, head.row)
    }
    else if (this.direction === "down"){
        newHead = new Block(head.col, head.row + 1)
    }
    else if (this.direction === "up"){
        newHead = new Block(head.col, head.row - 1)
    }
    if (this.checkCollision(newHead)){
        gameOver()
        return
    }
    this.segments.unshift(newHead); //додаємо новий квадратик-голову на початок масива-тіла змії
    if (newHead.equal(apple.position)){//якшо позиція голови зайшла на позицію яблука, то яблуко змінить місце, а
        score++ // рахунок збілшиться на один
        apple.move(this.segments)
        animationTime -= 5
        if (animationTime < 0){
            animationTime = 0
        }
    }
    else { //а якшо нічого не сталось, то просто видаляємо останній квадратик з масиву (бо попередньо намалювали
        this.segments.pop() // квадратик з переду. Тобто це анімація руху змійки)
    }
}

Snake.prototype.checkCollision = function (head) {
    let leftCollision = (head.col === 0)
    let rightCollision = (head.col === widthInBlocks - 1) //мінус 1 тому що рамка займає один блок
    let topCollision = (head.row === 0)
    let bottomCollision = (head.row === heightInBlocks - 1)
    let wallCollision = leftCollision || rightCollision || topCollision || bottomCollision
    let selfCollision = false
    for (let i = 0; i < this.segments.length; i++){
        if (head.equal(this.segments[i])){
            selfCollision = true
        }
    }
    return wallCollision || selfCollision
}

Snake.prototype.setDirection = function (newDirection) {
    if (this.direction === "up" && newDirection === "down"){
        return
    }else if (this.direction === "down" && newDirection === "up"){
        return;
    }else if (this.direction === "left" && newDirection === "right"){
        return;
    }else if (this.direction === "right" && newDirection === "left"){
        return;
    }
    this.nextDirection = newDirection
}

function Apple() {
    this.position = new Block(20, 20) //це початкові координати яблука на старті гри
}

Apple.prototype.draw = function () {
    this.position.drawCircle("LimeGreen")
}

Apple.prototype.move = function (snakeBlocks) {
    let randomCol = Math.floor(Math.random() * (widthInBlocks - 2)) + 1
    let randomRow = Math.floor(Math.random() * (heightInBlocks - 2)) + 1
    this.position = new Block(randomCol, randomRow)
    for (let i = 0; i < snakeBlocks.length; i++){
        if (this.position.equal(snakeBlocks[i])){
            this.move(snakeBlocks)
        }
    }
}

let snake = new Snake();
let apple = new Apple();

// let intervalId = setInterval(function () {
//     ctx.clearRect(0,0,width, height)
//     drawScore()
//     snake.move()
//     snake.draw()
//     apple.draw()
//     drawBorder()
// }, 100)

let animationTime = 100
let playing = true

function gameLoop () {
    ctx.clearRect(0,0,width, height)
    drawScore()
    snake.move()
    snake.draw()
    apple.draw()
    drawBorder()
    if (playing) {
        setTimeout(gameLoop, animationTime)
    }
}
gameLoop();

let directions = {
    37: "left",
    38: "up",
    39: "right",
    40: "down"
}

$("body").keydown(function (event) {
    let newDirection = directions[event.keyCode] //присвоюємо змінній значення-стрічку з об'єкту directions
    if (newDirection !== undefined){ //якшо натиснута клавіша із списку directions, тобто не undefined, то
        snake.setDirection(newDirection) //змінна newDirection буде використана в методі snake.setDirection
    } //сам метод snake.setDirection створимо нижче
});
