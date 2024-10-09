class Lapiz extends Herramienta {
    constructor(ctx, x, y, color, width) {
        super(ctx, x, y, color, width);  // Llama al constructor de la clase base
        this.ctx.strokeStyle = color;  // Ahora `this.ctx` está definido
        this.ctx.lineWidth = width;
        this.ctx.lineCap = 'round';
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    draw(x, y, width) {
        this.ctx.lineWidth = width;  // Actualiza el grosor dinámicamente
        this.ctx.strokeStyle = this.color; // Establecer el color de la línea
        this.ctx.beginPath();
        this.ctx.moveTo(this.x, this.y);
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
        this.setPosition(x, y);  // Actualiza la posición para el siguiente trazo
    }
}