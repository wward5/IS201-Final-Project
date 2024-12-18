// gamescript.js

// Initialize game variables
let health = 100;
let shield = 0;
let wave = 1;
let zombies = [];
let gameInterval;
let zombieSpeed = 1;
let zombieHealth = 100;
let player = document.getElementById('player');
let playerSpeed = 5;
let bullets = [];
let bulletSpeed = 10;

// Event listeners for movement and shooting
window.addEventListener('keydown', (e) => handleKeyDown(e));
window.addEventListener('keyup', (e) => handleKeyUp(e));

// Player movement state
let keys = {};

// Start game function
function startGame() {
    if (confirm('Do you want to start the game?')) {
        document.getElementById('game-container').style.display = 'block';
        spawnZombies();
        gameInterval = setInterval(gameLoop, 1000 / 60); // 60 frames per second
    }
}

// Handle key down events
function handleKeyDown(e) {
    keys[e.key] = true;
    if (e.key === ' ') {
        shoot();
    }
}

// Handle key up events
function handleKeyUp(e) {
    keys[e.key] = false;
}

// Move player
function movePlayer() {
    if (keys['w'] && player.offsetTop > 0) player.style.top = `${player.offsetTop - playerSpeed}px`;
    if (keys['a'] && player.offsetLeft > 0) player.style.left = `${player.offsetLeft - playerSpeed}px`;
    if (keys['s'] && player.offsetTop < window.innerHeight - player.clientHeight) player.style.top = `${player.offsetTop + playerSpeed}px`;
    if (keys['d'] && player.offsetLeft < window.innerWidth - player.clientWidth) player.style.left = `${player.offsetLeft + playerSpeed}px`;
}

// Shoot bullets
function shoot() {
    let bullet = document.createElement('div');
    bullet.classList.add('bullet');
    bullet.style.left = `${player.offsetLeft + player.clientWidth / 2}px`;
    bullet.style.top = `${player.offsetTop}px`;
    document.getElementById('game-container').appendChild(bullet);
    bullets.push(bullet);
}

// Move bullets
function moveBullets() {
    bullets.forEach((bullet, index) => {
        bullet.style.top = `${bullet.offsetTop - bulletSpeed}px`;
        if (bullet.offsetTop < 0) {
            bullet.remove();
            bullets.splice(index, 1);
        }
    });
}

// Check if bullets hit zombies
function checkBulletHits() {
    bullets.forEach((bullet, bulletIndex) => {
        let bulletRect = bullet.getBoundingClientRect();
        zombies.forEach((zombie, zombieIndex) => {
            let zombieRect = zombie.element.getBoundingClientRect();
            if (bulletRect.x < zombieRect.x + zombieRect.width &&
                bulletRect.x + bulletRect.width > zombieRect.x &&
                bulletRect.y < zombieRect.y + zombieRect.height &&
                bulletRect.y + bulletRect.height > zombieRect.y) {
                zombie.health -= zombieHealth * 0.2; // Bullet does 20% damage
                if (zombie.health <= 0) {
                    zombie.element.remove();
                    zombies.splice(zombieIndex, 1);
                }
                bullet.remove();
                bullets.splice(bulletIndex, 1);
            }
        });
    });
}

// Spawn zombies for the wave
function spawnZombies() {
    zombies = [];
    for (let i = 0; i < 10 + (wave - 1) * 2; i++) {
        let zombie = document.createElement('div');
        zombie.classList.add('zombie');
        zombie.style.left = Math.random() * window.innerWidth + 'px';
        zombie.style.top = Math.random() * window.innerHeight + 'px';
        document.getElementById('game-container').appendChild(zombie);
        zombies.push({ element: zombie, health: zombieHealth });
    }
}

// Move zombies towards the player
function moveZombies() {
    zombies.forEach(zombie => {
        let zombieRect = zombie.element.getBoundingClientRect();
        let playerRect = document.getElementById('player').getBoundingClientRect();

        let dx = playerRect.x - zombieRect.x;
        let dy = playerRect.y - zombieRect.y;

        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > 50) {
            zombie.element.style.left = zombie.element.offsetLeft + dx / distance * zombieSpeed + 'px';
            zombie.element.style.top = zombie.element.offsetTop + dy / distance * zombieSpeed + 'px';
        }
    });
}

// Check if zombies collide with the player
function checkCollisions() {
    zombies.forEach((zombie, index) => {
        const zombieRect = zombie.element.getBoundingClientRect();
        const playerRect = document.getElementById('player').getBoundingClientRect();

        if (zombieRect.x < playerRect.x + playerRect.width &&
            zombieRect.x + zombieRect.width > playerRect.x &&
            zombieRect.y < playerRect.y + playerRect.height &&
            zombieRect.y + zombieRect.height > playerRect.y) {
            damagePlayer(50);
            zombie.element.remove();
            zombies.splice(index, 1);
        }
    });
}

// Damage the player
function damagePlayer(amount) {
    if (shield > 0) {
        shield -= amount;
        if (shield < 0) {
            health += shield;
            shield = 0;
        }
    } else {
        health -= amount;
    }
}

// Check if the game is over
function checkGameOver() {
    if (health <= 0) {
        clearInterval(gameInterval);
        alert('Game Over!');
    }
}

// When the zombies are killed, spawn the next wave
function killZombies() {
    zombies = [];
    wave++;
    if (wave % 5 === 0) {
        zombieHealth *= 1.5;
    }
    spawnZombies();
}

// Update health, shield, and wave counter
function updateUI() {
    document.getElementById('health-bar').style.width = `${health}%`;
    document.getElementById('shield-bar').style.width = `${shield}%`;
    document.getElementById('shield-bar').style.opacity = shield > 0 ? 1 : 0;
    document.getElementById('wave-counter').innerText = `Wave: ${wave}`;
}

// Game loop
function gameLoop() {
    movePlayer();
    moveZombies();
    moveBullets();
    checkCollisions();
    checkBulletHits();
    updateUI();
    checkGameOver();
}

// Event listeners to start the game
window.onload = () => {
    startGame();
};
