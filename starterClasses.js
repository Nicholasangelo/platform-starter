    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 1024;
    canvas.height = 620;
    let enemies = [];

    class InputHandler {
        constructor() {
            this.keys = [];
            const actionKeys = ['Space', 'ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown']
            window.addEventListener('keydown', (e) => {
                if ((actionKeys.includes(e.key)) && this.keys.indexOf(e.key) == -1) {
                    this.keys.push(e.key);
                }
            });

            window.addEventListener('keyup', (e) => {
                if (actionKeys.includes(e.key)){
                    this.keys.splice(this.keys.indexOf(e.key), 1);
                };
            });
        };
    };

    class Player {
        constructor(gameWidth, gameHeight, groundHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight - groundHeight;
            this.width = 60;
            this.height = 60;
            this.x = 0;
            this.y = this.gameHeight - this.height;
            this.image = document.getElementById('playerImage');
            this.frameX = 0;
            this.frameY = this.movingRight() ? 5 : 8;
            this.maxFrame = 2 //sprite sheet row
            this.fps = 20;
            this.frameTimer = 0;
            this.frameInterval = 1000/this.fps;
            this.speed = 0;
            this.vy = 0; //velocity
            this.weight = 1;
            this.friction = 0.8;
            this.flowerStomping = false;
        }

        draw(context) {
            context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height);
        }
        update(input, deltaTime) {
            //animation
            if (this.frameTimer > this.frameInterval) {
                if (this.frameX >= this.maxFrame) this.frameX = 0;
                else this.frameX++;
                this.frameTimer = 0;
            } else {
                this.frameTimer += deltaTime;
            }
            //input
            if (input.keys.indexOf('ArrowRight') > -1) {
                this.speed = 5;
            } else if (input.keys.indexOf('ArrowLeft') > -1) {
                this.speed = -5;
            //} else if (input.keys.indexOf('ArrowDown') > -1 && this.onGround()) {
            //    this.flowerStomping = true;
            } else {
                this.speed *= this.friction;
            }

            if (input.keys.indexOf('ArrowUp') > -1 && this.onGround()) {
                this.vy -= 15;
            }
            
            

            this.x += this.speed;
            //this.x *= this.friction;

            if (this.x < 0) { 
                this.x = 0;
            } else if (this.x > this.gameWidth - this.width) this.x = this.gameWidth - this.width; {
                this.y += this.vy;
            };

            //verticle
            if (!this.onGround()) {
                this.maxFrame = 0;
                this.vy += this.weight;
                if (this.vy < 0) {
                    this.movingRight() ? this.frameY = 6 : this.frameY = 10;
                } else {
                    this.movingRight() ? this.frameY = 7 : this.frameY = 11;
                }
            } else {
                this.vy = 0;
                this.frameY = 5;
                this.maxFrame = 2;
            };

            if (this.y > this.gameHeight - this.height) this.y = this.gameHeight - this.height; //vert bounds
            if (this.flowerStomping) {
                this.frameY = 12;
                this.maxFrame = 4;
                createFlower(this.x);
                this.flowerStomping = false;
            }
        }

        onGround() {
            return this.y >= this.gameHeight - this.height;
        }

        movingRight() {
            return this.speed >= -1; 
        }

    }

    class Background {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.image = document.getElementById('backgroundImage');
            this.x = 0;
            this.y = 0;
            this.width = 2056;
            this.height = 620;
            this.speed = 3;
        } 
        draw(context) {
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
            context.drawImage(this.image, this.x + this.width - this.speed, this.y, this.width, this.height);
        }
        update() {
            this.x -= this.speed;
            if (this.x < 0 - this.width) this.x = 0;
        }
    }

    class Enemy {
        constructor(gameWidth, gameHeight, groundHeight){
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight - groundHeight;
            this.width = 40;
            this.height = 40;
            this.image = document.getElementById('enemy');
            this.x = this.gameWidth;
            this.y = this.gameHeight - this.height;
            this.maxFrame = 1;
            this.frameX = 0;
            this.frameY = 0;
            this.fps = 20;
            this.frameTimer = 0;
            this.frameInterval = 1000/this.fps;
            this.speed = Math.random() * 5;
            this.markedForDeletion = false;
        } 
        draw(context, x) {
            context.drawImage(this.image, this.frameX * this.width, this.frameY, this.width, this.height, x, this.y, this.width, this.height);
        }
        update(deltaTime){
            if (this.frameTimer > this.frameInterval) {
                if (this.frameX >= this.maxFrame) this.frameX = 0;
                else this.frameX++;
                this.frameTimer = 0;
            } else {
                this.frameTimer += deltaTime;
            };
            this.x -= this.speed;
        if (this.x < 0 - this.width) this.markedForDeletion = true;
        }
    }

//    const handleEnemy = (deltaTime) => {
//        if (enemyTimer > enemyInterval + randomEnemyInterval) {
//            enemies.push(new Enemy(canvas.width, canvas.height, 42))
//            randonEnemyInterval = Math.random() * 1000 + 500;
//            enemyTimer = 0;
//            } else {
//            enemyTimer += deltaTime;
//            }
//
//            enemies.forEach(enemy => {
//                enemy.draw(ctx);
//                enemy.update(deltaTime);
//        });
//        enemies = enemies.filter(enemy => !enemy.markedForDeletion);
//    };
//
//    const displayStatusText = () => {
//    
//    }
//
    const input = new InputHandler();
    const player = new Player(canvas.width, canvas.height, 42);
    const background = new Background(canvas.width, canvas.height);
    
    let lastTime = 0;
    let enemyTimer = 0;
    let enemyInterval = 1000;
    let randomEnemyInterval = Math.random() * 100 + 500;
    
    const animate = (timeStamp) => {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
//        background.draw(ctx);
        background.update();
        player.draw(ctx);
        player.update(input, deltaTime);
        //handleEnemy(deltaTime);
        requestAnimationFrame(animate);
    }
    
    animate(0);
});
