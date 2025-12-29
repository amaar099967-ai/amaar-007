// Matrix Background Effect
class MatrixBackground {
    constructor() {
        this.canvas = document.getElementById('matrixCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.characters = '01';
        this.fontSize = 14;
        this.columns = 0;
        this.drops = [];
        
        this.init();
    }
    
    init() {
        this.resizeCanvas();
        this.setupColumns();
        this.startAnimation();
        
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.setupColumns();
        });
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    setupColumns() {
        this.columns = Math.floor(this.canvas.width / this.fontSize);
        this.drops = [];
        
        for (let i = 0; i < this.columns; i++) {
            this.drops[i] = Math.floor(Math.random() * this.canvas.height / this.fontSize);
        }
    }
    
    draw() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#0f0';
        this.ctx.font = `${this.fontSize}px 'Courier New', monospace`;
        
        for (let i = 0; i < this.drops.length; i++) {
            const char = this.characters[Math.floor(Math.random() * this.characters.length)];
            const x = i * this.fontSize;
            const y = this.drops[i] * this.fontSize;
            
            this.ctx.fillText(char, x, y);
            
            if (y > this.canvas.height && Math.random() > 0.975) {
                this.drops[i] = 0;
            }
            
            this.drops[i]++;
        }
    }
    
    startAnimation() {
        const animate = () => {
            this.draw();
            requestAnimationFrame(animate);
        };
        
        animate();
    }
}

// Initialize Matrix
document.addEventListener('DOMContentLoaded', () => {
    new MatrixBackground();
});