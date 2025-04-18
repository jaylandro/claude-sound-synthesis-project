const canvas = document.getElementById('synthesizer-canvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('start-button');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const stones = [];
const gems = [];
let audioContext;
let lastMouseX = 0;
let lastMouseY = 0;

class BouncingObject {
    constructor(x, y, radius, emoji, isGem) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.emoji = emoji;
        this.isGem = isGem;
        this.dx = Math.random() * 2 + 2;
        this.dy = Math.random() * 2 + 2;
    }

    draw() {
        ctx.font = `${this.radius * 2}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.emoji, this.x, this.y);
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;

        if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
            this.dx = -this.dx;
            this.playSound();
        }
        if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
            this.dy = -this.dy;
            this.playSound();
        }
    }

    playSound() {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(this.isGem ? 523.25 : 440, audioContext.currentTime); // C5 for gems, A4 for stones
        gainNode.gain.setValueAtTime(1, audioContext.currentTime);

        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1); // Play sound for 100ms
    }

    isMouseOver(mouseX, mouseY) {
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        return Math.sqrt(dx * dx + dy * dy) < this.radius;
    }
}


function createObjects() {
    for (let i = 0; i < 3; i++) {
        stones.push(new BouncingObject(Math.random() * canvas.width, Math.random() * canvas.height, 20, '🪨', false));
        gems.push(new BouncingObject(Math.random() * canvas.width, Math.random() * canvas.height, 15, '💎', true));
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stones.forEach(stone => {
        stone.draw();
        stone.update();
    });
    gems.forEach(gem => {
        gem.draw();
        gem.update();
    });
    requestAnimationFrame(animate);
}


startButton.addEventListener('click', () => {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    startButton.style.display = 'none';
    createObjects();
    animate();
});