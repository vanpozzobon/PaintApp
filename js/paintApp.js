

class paintApp {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.herramientaActual = new Lapiz(this.ctx, 0, 0, 'blue', 5); // Herramienta predeterminada
        this.initUI();  
        this.initCanvasEvents();  // Inicializar los eventos del canvas
        this.mouseDown = false;  // Asegurarte de inicializar el estado del ratón
        this.filtros = new Filtros(this.ctx, this); 
        this.history = []; // Pila para guardar los estados del canvas

    }
    // setea la herramienta
    setHerramientaActual(tool) {
        this.herramientaActual = tool;
    }

    // Método para guardar el estado actual del canvas en la pila
    saveState() {
        // Guardamos la imagen actual del canvas en formato Data URL
        const canvasData = this.canvas.toDataURL();
        this.history.push(canvasData);
    }

    //Metodo para deshacer un cambio, limpiar el canvas y volver a dibujar
    undo() {
        if (this.history.length > 0) {
            const lastState = this.history.pop(); // Quitar el último estado de la pila
            const img = new Image();
            img.src = lastState;

            img.onload = () => {
                this.limpiarCanvas();
                this.ctx.drawImage(img, 0, 0); 
            };
        }
    }

    // Inicializar los botones y la interfaz
    initUI() {

         // Botón de deshacer
         const undoBtn = document.getElementById('deshacer');
         undoBtn.addEventListener('click', () => this.undo());
 

        // Inicializa el input para subir imágenes
        const uploadImage = document.getElementById('uploadImage');
        uploadImage.addEventListener('change', this.cargarImagen.bind(this));

        //maneja el grosor de las herramientas
        let grosorHerramienta = document.getElementById('grosor').value;
        document.getElementById('grosor').addEventListener('input', () => {
            grosorHerramienta = document.getElementById('grosor').value;
            document.getElementById('valorGrosor').textContent = grosorHerramienta;
        });

        // Obtener el color del lápiz desde la paleta de colores
        colorPicker.addEventListener('input', () => {
            if (this.herramientaActual instanceof Lapiz) {
                // Crea una nueva instancia del lápiz con el nuevo color
                this.setHerramientaActual(new Lapiz(this.ctx, 0, 0, colorPicker.value, grosorHerramienta));
            }
            console.log('color actualizado ' + colorPicker)
        });

        // Botón para seleccionar la herramienta Lápiz
        const lapizBtn = document.getElementById('lapiz');
        lapizBtn.addEventListener('click', () => {
            this.setHerramientaActual(new Lapiz(this.ctx, 0, 0, colorPicker.value, grosorHerramienta));
            colorPicker.disabled = false; // Habilitar el selector de color
            colorPicker.style.opacity = '1'; // Hacerlo visible
        });

        // Botón para seleccionar la herramienta Goma
        document.getElementById('goma').addEventListener('click', () => {
            this.setHerramientaActual(new Goma(this.ctx, 0, 0, 'white', grosorHerramienta));
            console.log(this.herramientaActual);
            colorPicker.disabled = true; // Deshabilitar el selector de color
            colorPicker.style.opacity = '0.3'; // Hacerlo parecer inactivo
        });

        // Botón para limpiar el canvas
        const limpiarBtn = document.getElementById('limpiar');
        limpiarBtn.addEventListener('click', () => this.limpiarCanvas());

        //inicializa boton subir imagen
        document.getElementById('uploadBtn').addEventListener('click', function () {
            document.getElementById('uploadImage').click();  // Simular clic en el input de tipo file
        });

        //inicializa los botones de guardado, confirmacion y cancelar guardado.
        const guardarBtn = document.getElementById('guardar');
        const guardarOpciones = document.getElementById('guardarOpciones');
        const confirmarGuardarBtn = document.getElementById('confirmarGuardar');
        const cancelarGuardarBtn = document.getElementById('cancelarGuardar'); // Botón de cancelar

        // Cuando se presiona "Cancelar", se ocultan las opciones y se resetea el input
        cancelarGuardarBtn.addEventListener('click', () => {
            guardarOpciones.style.display = 'none'; // Ocultar las opciones de guardado
            document.getElementById('nombreArchivo').value = ''; // Vaciar el campo de texto
        });

        // Cuando se presiona el botón "Guardar Imagen", se muestra el input para el nombre
        guardarBtn.addEventListener('click', () => {
            guardarOpciones.style.display = 'block'; // Mostrar el campo de texto
        });

        // Cuando se presiona "Confirmar", se guarda la imagen con el nombre proporcionado
        confirmarGuardarBtn.addEventListener('click', () => this.guardarImagen());

        // Inicializa el botón de filtros
        const filtroBtn = document.getElementById('filtro');
        const menuFiltros = document.getElementById('menuFiltros');

        // Mostrar u ocultar el menú de filtros
        filtroBtn.addEventListener('click', () => {
            if (menuFiltros.style.display === 'none') {
                menuFiltros.style.display = 'block';
            } else {
                menuFiltros.style.display = 'none';
            }
        });

        //Inicializa botones de filtros
        document.getElementById('negativo').addEventListener('click', () => this.filtros.aplicarNegativo(this.canvas));
        document.getElementById('binarizacion').addEventListener('click', () => this.filtros.aplicarBinarizacion(this.canvas));
        document.getElementById('brillo').addEventListener('click', () => this.filtros.aplicarBrillo(this.canvas));
        document.getElementById('sepia').addEventListener('click', () => this.filtros.aplicarSepia(this.canvas));
        document.getElementById('blur').addEventListener('click', () => this.filtros.aplicarBlur(this.canvas));
        document.getElementById('deteccionBordes').addEventListener('click', () => this.filtros.aplicarDeteccionBordes(this.canvas));     
        document.getElementById('saturacion').addEventListener('click', () => this.filtros.aplicarSaturacion(this.canvas));
    }

    //Pone el canvas en blanco
    limpiarCanvas() {
     
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); 

    }

    //Inicializalos eventos del canvas del raton
    initCanvasEvents() {
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));


    }

    //Metodo para cargar imagen
    cargarImagen(event) {
        const file = event.target.files[0]; // Obtiene el archivo seleccionado

        if (file && file.type.startsWith('image/')) {
            const img = new Image();
            img.src = URL.createObjectURL(file); // Crea una URL temporal para la imagen

            // Espera a que la imagen se cargue
            img.onload = () => {
                // Dibuja la imagen en el canvas, ajustada a su tamaño
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // Limpia el canvas antes
                // Obtener las dimensiones originales de la imagen
                const imgWidth = img.width;
                const imgHeight = img.height;

                // Calcular el ratio de aspecto de la imagen
                const imgAspectRatio = imgWidth / imgHeight;
                const canvasAspectRatio = this.canvas.width / this.canvas.height;

                let drawWidth, drawHeight;

                // Si la imagen es más ancha (mayor ratio de aspecto que el canvas)
                if (imgAspectRatio > canvasAspectRatio) {
                    drawWidth = this.canvas.width;
                    drawHeight = this.canvas.width / imgAspectRatio; // Ajusta el alto en función del ancho
                } else {
                    // Si la imagen es más alta (menor ratio de aspecto que el canvas)
                    drawHeight = this.canvas.height;
                    drawWidth = this.canvas.height * imgAspectRatio; // Ajusta el ancho en función del alto
                }

                // Centrar la imagen en el canvas
                const offsetX = (this.canvas.width - drawWidth) / 2;
                const offsetY = (this.canvas.height - drawHeight) / 2;

                // Dibuja la imagen ajustada en el canvas
                this.ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

                // Restablece el valor del input de archivo para poder cargar imagen una sobre otra o desp de limpiar el canvas
                document.getElementById('uploadImage').value = '';
            };
        }
    }

    //Metodo para guardar la imagen
    guardarImagen() {
        // Obtener el nombre del archivo ingresado por el usuario
        const nombreArchivo = document.getElementById('nombreArchivo').value || 'mi_dibujo';

        // Asegurarse de que tenga la extensión ".png"
        const nombreConExtension = nombreArchivo.endsWith('.png') ? nombreArchivo : `${nombreArchivo}.png`;

        // Convierte el contenido del canvas en una URL de imagen
        const imageUrl = this.canvas.toDataURL('image/png');

        // Crea un enlace temporal para descargar la imagen
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = nombreConExtension; // Usa el nombre proporcionado por el usuario
        link.click(); // Simula un clic para iniciar la descarga

        // Ocultar el input de nuevo después de guardar la imagen
        document.getElementById('guardarOpciones').style.display = 'none';


        // Resetear el valor del input del nombre del archivo
        document.getElementById('nombreArchivo').value = ''; // Vaciar el campo de texto
    }

    
    onMouseDown(e) {
        this.saveState(); // Guardar el estado antes de comenzar a dibujar
        let pos = this.getMousePos(e);
        if (this.herramientaActual) {
            this.herramientaActual.setPosition(pos.x, pos.y);
        }
        this.mouseDown = true;
    }


    onMouseMove(e) {
        if (this.mouseDown && this.herramientaActual) {
            let pos = this.getMousePos(e);

            // Solo actualizamos el color si la herramienta actual es un lápiz
            if (this.herramientaActual instanceof Lapiz && !(this.herramientaActual instanceof Goma)) {
                this.herramientaActual.color = document.getElementById('colorPicker').value;
            }

            // Dibujar con la herramienta actual (sea lápiz o goma)
            this.herramientaActual.draw(pos.x, pos.y, document.getElementById('grosor').value);
        }
    }

    onMouseUp() {
        this.mouseDown = false;
    }

    getMousePos(e) {
        let x = e.offsetX;
        let y = e.offsetY;
        return { x, y };
    }
}


