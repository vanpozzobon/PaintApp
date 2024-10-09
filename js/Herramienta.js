
class Herramienta {
    constructor(ctx, x, y, color, width) {
        if (new.target === Herramienta) {
            throw new Error("No se puede inicializar esta clase por ser abstracta");
        }
        this.ctx = ctx;
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    draw(x, y, width) {
        throw new Error("draw() debe ser implementada en una subclase");
    }
}


// Inicializa la aplicación Paint
document.addEventListener('DOMContentLoaded', () => {
    new paintApp();
});
