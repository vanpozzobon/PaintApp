class Filtros{
    constructor(ctx,app){
        this.ctx=ctx;
        this.app = app;  // Guardamos la referencia a la instancia de paintApp
    }
    

    //Filtro que aplica el negativo a todo lo que este en el canvas
    aplicarNegativo(canvas) {
        this.app.saveState();  // Llamamos a saveState() de paintApp antes de aplicar el filtro
    const ctx = canvas.getContext('2d'); 
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            data[i] = 255 - data[i];     // Rojo
            data[i + 1] = 255 - data[i + 1]; // Verde
            data[i + 2] = 255 - data[i + 2]; // Azul
        }
        this.ctx.putImageData(imageData, 0, 0);
    }
 
    //filtro de binarización convierte una imagen en escala de grises en una imagen en blanco y negro, basándose en un umbral (threshold). 
    aplicarBinarizacion(canvas, threshold = 128) {
        this.app.saveState();  // Llamamos a saveState() de paintApp antes de aplicar el filtro
        const imageData = this.ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            const color = avg >= threshold ? 255 : 0; // Binarización
            data[i] = data[i + 1] = data[i + 2] = color;
        }
        this.ctx.putImageData(imageData, 0, 0);
    }

    //Filtro que aplica brillo a todos los pixeles del canvas
    aplicarBrillo(canvas, value = 50) {
        this.app.saveState();  // Llamamos a saveState() de paintApp antes de aplicar el filtro
        const imageData = this.ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, data[i] + value);     // Rojo
            data[i + 1] = Math.min(255, data[i + 1] + value); // Verde
            data[i + 2] = Math.min(255, data[i + 2] + value); // Azul
        }
        this.ctx.putImageData(imageData, 0, 0);
    }

    //Filtro sepia se utiliza para dar a las imágenes un tono marrón cálido y suave
    aplicarSepia(canvas){
        this.app.saveState();  // Llamamos a saveState() de paintApp antes de aplicar el filtro
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const red = data[i];
            const green = data[i + 1];
            const blue = data[i + 2];

            // Aplicar el filtro sepia
            data[i] = Math.min(255, (red * 0.393) + (green * 0.769) + (blue * 0.189));     // Rojo
            data[i + 1] = Math.min(255, (red * 0.349) + (green * 0.686) + (blue * 0.168)); // Verde
            data[i + 2] = Math.min(255, (red * 0.272) + (green * 0.534) + (blue * 0.131)); // Azul
        }

        ctx.putImageData(imageData, 0, 0);
    
    }

    //El filtro de desenfoque (blur) suaviza una imagen al promediar los colores de los píxeles cercanos
    aplicarBlur(canvas) {
        this.app.saveState();  // Llamamos a saveState() de paintApp antes de aplicar el filtro
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
    
        const blurredData = new Uint8ClampedArray(data.length);
        const radius = 3; // Radio del desenfoque
        const weightSum = (radius * 2 + 1) ** 2; // Número total de píxeles que promediar
    
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let r = 0, g = 0, b = 0, count = 0;
    
                // Promediar los colores de los píxeles en el área del desenfoque
                for (let dy = -radius; dy <= radius; dy++) {
                    for (let dx = -radius; dx <= radius; dx++) {
                        const xNeighbor = x + dx;
                        const yNeighbor = y + dy;
    
                        if (xNeighbor >= 0 && xNeighbor < width && yNeighbor >= 0 && yNeighbor < height) {
                            const idx = (yNeighbor * width + xNeighbor) * 4; // Obtener índice del pixel
                            const alpha = data[idx + 3]; // Alpha
    
                            // Si el píxel es transparente, usar el color del fondo (blanco)
                            if (alpha === 0) {
                                r += 255; // Rojo del fondo
                                g += 255; // Verde del fondo
                                b += 255; // Azul del fondo
                            } else {
                                r += data[idx];     // Rojo
                                g += data[idx + 1]; // Verde
                                b += data[idx + 2]; // Azul
                            }
                            count++;
                        }
                    }
                }
    
                // Normalizar y asignar a los datos desenfocados
                const idx = (y * width + x) * 4;
                blurredData[idx] = r / count;     // Rojo
                blurredData[idx + 1] = g / count; // Verde
                blurredData[idx + 2] = b / count; // Azul
                blurredData[idx + 3] = data[idx + 3]; // Alpha
            }
        }
    
        const blurredImageData = new ImageData(blurredData, width, height);
        ctx.putImageData(blurredImageData, 0, 0);
    }


    //filtro de detección de bordes identifica las áreas de alto contraste en una imagen, lo que permite resaltar los contornos 
    aplicarDeteccionBordes(canvas) {
        this.app.saveState();  // Llamamos a saveState() de paintApp antes de aplicar el filtro
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;

        // Crear un nuevo array para los datos de la imagen con detección de bordes
        const edgeData = new Uint8ClampedArray(data.length);

        // Matrices de convolución de Sobel
        const gx = [
            [-1, 0, 1],
            [-2, 0, 2],
            [-1, 0, 1]
        ];

        const gy = [
            [1, 2, 1],
            [0, 0, 0],
            [-1, -2, -1]
        ];

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                let sumX = 0;
                let sumY = 0;

                // Aplicar convolución
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const idx = ((y + ky) * width + (x + kx)) * 4; // Obtener índice del pixel
                        const pixelValue = (data[idx] + data[idx + 1] + data[idx + 2]) / 3; // Promediar RGB
                        sumX += gx[ky + 1][kx + 1] * pixelValue;
                        sumY += gy[ky + 1][kx + 1] * pixelValue;
                    }
                }

                // Calcular magnitud
                const magnitude = Math.sqrt(sumX * sumX + sumY * sumY);
                const normalizedMagnitude = Math.min(255, magnitude); // Asegurar que no sobrepase 255

                // Asignar el valor de borde a la nueva imagen
                const idx = (y * width + x) * 4;
                edgeData[idx] = normalizedMagnitude;     // Rojo
                edgeData[idx + 1] = normalizedMagnitude; // Verde
                edgeData[idx + 2] = normalizedMagnitude; // Azul
                edgeData[idx + 3] = 255;                 // Alpha
            }
        }

        // Colocar los datos de detección de bordes de vuelta en el contexto
        const edgeImageData = new ImageData(edgeData, width, height);
        ctx.putImageData(edgeImageData, 0, 0);
    }

    //Filtro saturacion uumenta la saturación y hace que los colores sean más vibrantes y vivos
    aplicarSaturacion(canvas) {
        this.app.saveState();  // Llamamos a saveState() de paintApp antes de aplicar el filtro
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const factor = 1.5; // aumenta o disminuye para saturacion

        for (let i = 0; i < data.length; i += 4) {
            // Extraer los valores RGB
            const r = data[i];     // Rojo
            const g = data[i + 1]; // Verde
            const b = data[i + 2]; // Azul

            // Convertir RGB a HSL
            let [h, s, l] = this.rgbToHsl(r, g, b);

            // Ajustar la saturación
            s *= factor;

            // Limitar saturación entre 0 y 1
            s = Math.max(0, Math.min(1, s));

            // Convertir de nuevo a RGB
            const [newR, newG, newB] = this.hslToRgb(h, s, l);

            // Asignar los nuevos valores RGB al array de datos
            data[i] = newR;
            data[i + 1] = newG;
            data[i + 2] = newB;
        }

        // Colocar los datos modificados de vuelta en el contexto
        ctx.putImageData(imageData, 0, 0);
    }

    // Método para convertir RGB a HSL
    rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0; // achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return [h, s, l];
    }

    // Método para convertir HSL a RGB
    hslToRgb(h, s, l) {
        let r, g, b;

        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            }

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }


}