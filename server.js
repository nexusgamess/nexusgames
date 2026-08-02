const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'juegos/imagenes/'); 
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-')); 
    }
});
const upload = multer({ storage: storage });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname));

const DB_FILE = path.join(__dirname, 'juegos.json');

function leerJuegosDB() {
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify([]));
        return [];
    }
    try {
        return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch (e) {
        return [];
    }
}

function guardarJuegosDB(juegos) {
    fs.writeFileSync(DB_FILE, JSON.stringify(juegos, null, 2));
}

function generarHTMLJuego(datos, nombreImagen, fechaActualFallback) {
    const listaInstruccionesBase = datos.instrucciones
        ? datos.instrucciones.split('\n').filter(l => l.trim() !== '').map(l => `<li>${l.trim()}</li>`).join('\n')
        : '';
    
    let bloqueUpdatesHTML = '';
    if (datos.instrucciones_update && datos.instrucciones_update.trim() !== '') {
        const listaInstruccionesUpdate = datos.instrucciones_update.split('\n').filter(l => l.trim() !== '').map(l => `<li>${l.trim()}</li>`).join('\n');
        bloqueUpdatesHTML = `
        <div class="text-center">
            <h3 class="seccion-titulo">UPDATES</h3>
        </div>
        <ol class="lista-instrucciones ms-3 mb-5">
            ${listaInstruccionesUpdate}
        </ol>`;
    }

    let bloqueDescargaPrincipal = '';
    if (datos.link_caido === 'true' || datos.link_caido === true) {
        bloqueDescargaPrincipal = `
        <div class="alert alert-danger text-center p-4 m-0 border-2" role="alert" style="border-style: dashed;">
            <h5 class="fw-bold text-danger mb-2"><i class="fa-solid fa-triangle-exclamation fa-lg"></i> ENLACE EN MANTENIMIENTO</h5>
            <p class="m-0 small text-dark fw-semibold">Disculpa las molestias. Este enlace de descarga no se encuentra disponible momentáneamente. Estamos trabajando activamente en solucionarlo.</p>
        </div>`;
    } else {
        bloqueDescargaPrincipal = `
        <h4 class="fw-bold mb-4">DESCARGAR JUEGO</h4>
        <a href="${datos.link}" target="_blank" class="btn btn-utorrent-verde btn-lg fw-bold px-5 py-3 mb-2">
            <i class="fa-solid fa-magnet me-2"></i> DESCARGAR POR UTORRENT
        </a>`;
    }

    const fechaFinal = datos.fecha_actualizacion || fechaActualFallback;
    
    // Array de categorías a string para mostrar en la ficha técnica
    const categoriasTexto = Array.isArray(datos.categorias) ? datos.categorias.join(', ') : (datos.categorias || '');

    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${datos.titulo} | NexusGames</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="../css/style.css">
    <link rel="icon" type="image/png" href="imagenes/IDENTIDAD.png">
    <style>
        .seccion-titulo { color: #ff5722; text-transform: uppercase; border-bottom: 2px solid #ff5722; display: inline-block; padding-bottom: 5px; margin-bottom: 25px; }
        .lista-cuadrada { list-style-type: square; }
        .lista-cuadrada li, .lista-requisitos li { margin-bottom: 10px; }
        .lista-instrucciones li { margin-bottom: 12px; font-size: 1.1rem; }
        .btn-utorrent-verde { background-color: #0b7a38 !important; border-color: #0b7a38 !important; color: white !important; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .btn-utorrent-verde:hover { background-color: #09632d !important; }
        .btn-mega-verde { background-color: #109e4a !important; border-color: #109e4a !important; color: white !important; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .btn-mega-verde:hover { background-color: #0d833d !important; }
    </style>
</head>
<body class="bg-light">

    <nav class="navbar navbar-expand-lg custom-navbar py-2">
        <div class="container">
            <a class="navbar-brand text-white fw-bold fs-4 d-flex align-items-center" href="../index.html">
                <img src="imagenes/IDENTIDAD.png" alt="Logo" style="height: 35px;" class="me-2">
                NEXUSGAMES
            </a>
            <button class="navbar-toggler border-white text-white" type="button" data-bs-toggle="collapse" data-bs-target="#menuNavegacion">
                <i class="fa-solid fa-bars"></i>
            </button>
            <div class="collapse navbar-collapse" id="menuNavegacion">
                <ul class="navbar-nav mx-auto mb-2 mb-lg-0 text-uppercase fw-semibold" style="font-size: 0.85rem;">
                    <li class="nav-item"><a class="nav-link text-white px-3" href="../index.html">Inicio</a></li>
                    
                    <li class="nav-item dropdown">
                        <a class="nav-link text-white px-3 dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">Categorías</a>
                        <ul class="dropdown-menu dropdown-menu-dark" style="min-width: 250px; max-height: 400px; overflow-y: auto;">
                            <li><a class="dropdown-item d-flex align-items-center" href="../index.html?cat=2d"><i class="fa-solid fa-gamepad me-2 text-muted"></i> 2D</a></li>
                            <li><a class="dropdown-item d-flex align-items-center" href="../index.html?cat=accion"><i class="fa-solid fa-crosshairs me-2 text-danger"></i> Acción</a></li>
                            <li><a class="dropdown-item d-flex align-items-center" href="../index.html?cat=anime"><i class="fa-solid fa-khanda me-2 text-warning"></i> Anime</a></li>
                            <li><a class="dropdown-item d-flex align-items-center" href="../index.html?cat=carreras"><i class="fa-solid fa-car-side me-2 text-primary"></i> Carreras</a></li>
                            <li><a class="dropdown-item d-flex align-items-center" href="../index.html?cat=construccion"><i class="fa-solid fa-hammer me-2 text-info"></i> Construcción</a></li>
                            <li><a class="dropdown-item d-flex align-items-center" href="../index.html?cat=deportes"><i class="fa-solid fa-futbol me-2 text-success"></i> Deportes</a></li>
                            <li><a class="dropdown-item d-flex align-items-center" href="../index.html?cat=estrategia"><i class="fa-solid fa-chess-knight me-2 text-success"></i> Estrategia</a></li>
                            <li><a class="dropdown-item d-flex align-items-center" href="../index.html?cat=shooter"><i class="fa-solid fa-gun me-2 text-secondary"></i> Shooter</a></li>
                            <li><a class="dropdown-item d-flex align-items-center" href="../index.html?cat=guerra"><i class="fa-solid fa-jet-fighter me-2 text-danger"></i> Guerra</a></li>
                            <li><a class="dropdown-item d-flex align-items-center" href="../index.html?cat=lucha"><i class="fa-solid fa-hand-fist me-2 text-warning"></i> Lucha</a></li>
                            <li><a class="dropdown-item d-flex align-items-center" href="../index.html?cat=rol"><i class="fa-solid fa-wand-magic-sparkles me-2 text-info"></i> Rol</a></li>
                            <li><a class="dropdown-item d-flex align-items-center" href="../index.html?cat=simulacion"><i class="fa-solid fa-tractor me-2 text-light"></i> Simulación</a></li>
                            <li><a class="dropdown-item d-flex align-items-center" href="../index.html?cat=supervivencia"><i class="fa-solid fa-mask-ventilator me-2 text-light"></i> Supervivencia</a></li>
                            <li><a class="dropdown-item d-flex align-items-center" href="../index.html?cat=terror"><i class="fa-solid fa-ghost me-2 text-secondary"></i> Terror</a></li>
                            <li><a class="dropdown-item d-flex align-items-center" href="../index.html?cat=zombies"><i class="fa-solid fa-biohazard me-2 text-success"></i> Zombies</a></li>
                            <li><a class="dropdown-item d-flex align-items-center" href="../index.html?cat=mundo-abierto"><i class="fa-solid fa-earth-americas me-2 text-primary"></i> Mundo Abierto</a></li>
                            <li><a class="dropdown-item d-flex align-items-center" href="../index.html?cat=multiplayer-online"><i class="fa-solid fa-globe me-2 text-warning"></i> Multiplayer Online</a></li>
                            <li><a class="dropdown-item d-flex align-items-center" href="../index.html?cat=pantalla-dividida"><i class="fa-solid fa-users me-2 text-info"></i> Pantalla Dividida</a></li>
                            <li><a class="dropdown-item d-flex align-items-center" href="../index.html?cat=pixelados"><i class="fa-solid fa-border-all me-2 text-muted"></i> Pixelados</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item fw-bold text-center text-info" href="../index.html">VER TODO EL CATÁLOGO</a></li>
                        </ul>
                    </li>
                    <li class="nav-item dropdown">
                        <a class="nav-link text-white px-3 dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">Requisitos</a>
                        <ul class="dropdown-menu dropdown-menu-dark">
                            <li><a class="dropdown-item d-flex align-items-center" href="../index.html?req=bajos"><i class="fa-solid fa-battery-quarter me-2 text-success"></i> Bajos Requisitos</a></li>
                            <li><a class="dropdown-item d-flex align-items-center" href="../index.html?req=medios"><i class="fa-solid fa-battery-half me-2 text-warning"></i> Medios Requisitos</a></li>
                            <li><a class="dropdown-item d-flex align-items-center" href="../index.html?req=altos"><i class="fa-solid fa-battery-full me-2 text-danger"></i> Altos Requisitos</a></li>
                        </ul>
                    </li>
                    <li class="nav-item"><a class="nav-link text-white px-3" href="../ayuda.html">Ayuda</a></li>
                </ul>
                <div class="d-flex align-items-center gap-3 ms-lg-3 mt-3 mt-lg-0">
                    <a href="https://www.youtube.com/@nexus-games-everyone" target="_blank" class="text-white fs-5 hover-rojo"><i class="fa-brands fa-youtube"></i></a>
                    <a href="https://discord.gg/K5xKACqWQ" target="_blank" class="text-white fs-5 hover-rojo"><i class="fa-brands fa-discord"></i></a>
                    <form action="../index.html" method="GET" class="d-flex align-items-center m-0 ms-auto">
                        <input class="form-control me-2 border-0 rounded-pill px-3 shadow-sm" type="search" name="buscar" placeholder="Buscar juego..." aria-label="Search" required>
                        <button class="btn btn-dark rounded-pill px-3 shadow-sm" type="submit"><i class="fa-solid fa-magnifying-glass"></i></button>
                    </form>
                </div>
            </div>
        </div>
    </nav>

    <div class="container mt-4 mb-5">
        <nav aria-label="breadcrumb" class="mb-3">
            <ol class="breadcrumb" style="font-size: 0.85rem;">
                <li class="breadcrumb-item"><a href="../index.html" class="text-decoration-none text-muted">Inicio</a></li>
                <li class="breadcrumb-item active fw-bold text-dark" aria-current="page">${datos.titulo}</li>
            </ol>
        </nav>

        <div class="row">
            <div class="col-lg-9 bg-white p-4 shadow-sm rounded-1 border">
                <h1 class="h3 fw-bold mb-4 text-uppercase text-center">${datos.titulo}</h1>
                <img src="imagenes/${nombreImagen}" class="rounded-1 mb-4 shadow-sm portada-juego" alt="Portada del Juego">

                <div class="px-2 mb-5"><p class="text-muted" style="font-size: 1.05rem; line-height: 1.7;">${datos.descripcion}</p></div>

                <div class="text-center"><h3 class="seccion-titulo">Ficha Técnica</h3></div>
                <ul class="lista-cuadrada fs-6 ms-3 mb-5">
                    <li><strong>PLATAFORMA:</strong> ${datos.plataforma || 'PC'}</li>
                    <li><strong>PESO TOTAL:</strong> ${datos.peso}</li>
                    <li><strong>FORMATO:</strong> ${datos.formato || 'ISO ELAMIGOS'}</li>
                    <li><strong>FECHA DE ACTUALIZACIÓN:</strong> <span class="text-danger">${fechaFinal}</span></li>
                    <li><strong>CATEGORÍAS:</strong> ${categoriasTexto}</li>
                    ${datos.textos ? `<li><strong>TEXTOS:</strong> ${datos.textos}</li>` : ''}
                    ${datos.audio ? `<li><strong>AUDIO:</strong> ${datos.audio}</li>` : ''}
                </ul>

                <div class="text-center"><h3 class="seccion-titulo">Gameplay Trailer</h3></div>
                <div class="ratio ratio-16x9 mb-5"><iframe src="https://www.youtube.com/embed/${datos.video}" allowfullscreen></iframe></div>

                <div class="text-center"><h3 class="seccion-titulo">Requisitos del Sistema</h3></div>
                <div class="mb-5">
                    <p class="fs-5 mb-3">MÍNIMOS:</p>
                    <ul class="lista-cuadrada lista-requisitos ms-3 mb-4">
                        <li><strong>SO:</strong> ${datos.min_so}</li><li><strong>Procesador:</strong> ${datos.min_cpu}</li><li><strong>Memoria:</strong> ${datos.min_ram}</li><li><strong>Gráficos:</strong> ${datos.min_gpu}</li><li><strong>DirectX:</strong> ${datos.min_dx}</li><li><strong>Almacenamiento:</strong> ${datos.min_disco}</li>
                    </ul>
                    <p class="fs-5 mb-3">RECOMENDADOS:</p>
                    <ul class="lista-cuadrada lista-requisitos ms-3 mb-4">
                        <li><strong>SO:</strong> ${datos.rec_so}</li><li><strong>Procesador:</strong> ${datos.rec_cpu}</li><li><strong>Memoria:</strong> ${datos.rec_ram}</li><li><strong>Gráficos:</strong> ${datos.rec_gpu}</li><li><strong>DirectX:</strong> ${datos.rec_dx}</li><li><strong>Almacenamiento:</strong> ${datos.rec_disco}</li>
                    </ul>
                </div>

                <div class="text-center"><h3 class="seccion-titulo">Instrucciones</h3></div>
                <ol class="lista-instrucciones ms-3 mb-5">${listaInstruccionesBase}</ol>

                ${bloqueUpdatesHTML}

                <div class="text-center p-4 bg-light border rounded-1">
                    ${bloqueDescargaPrincipal}
                    ${datos.link_update ? `<hr class="my-4 border-secondary"><h4 class="fw-bold mb-4">DESCARGAR UPDATE</h4><a href="${datos.link_update}" target="_blank" class="btn btn-mega-verde btn-lg fw-bold px-5 py-3"><i class="fa-solid fa-magnet me-2"></i> DESCARGAR POR MEGA</a>` : ''}
                </div>
            </div>
            <div class="col-lg-3 mt-4 mt-lg-0"><div class="bg-dark text-white text-center p-4 rounded-1 h-100 d-flex flex-column justify-content-center align-items-center"><p class="text-uppercase fw-bold text-muted mb-2">Espacio Publicitario</p><h4 class="fw-bold">BANNER AQUI</h4></div></div>
        </div>
    </div>

    <footer class="bg-dark text-white mt-5 border-top border-danger border-3 mi-footer">
        <div class="container py-4">
            <div class="row">
                <div class="col-md-4 mb-3">
                    <h5 class="fw-bold mb-2 text-uppercase fs-6">
                        <i class="fa-solid fa-gamepad text-warning me-2"></i>NEXUSGAMES
                    </h5>
                    <p class="text-light opacity-75 small mb-0">Tu directorio definitivo de videojuegos. Las mejores descargas por uTorrent, actualizaciones constantes y una comunidad en crecimiento.</p>
                </div>
                
                <div class="col-md-4 mb-3">
                    <h5 class="fw-bold mb-2 text-uppercase fs-6">Enlaces Útiles</h5>
                    <ul class="list-unstyled text-light opacity-75 small mb-0">
                        <li class="mb-1"><a href="../index.html" class="text-decoration-none text-light link-hover">Inicio</a></li>
                        <li class="mb-1"><a href="https://discord.gg/K5xKACqWQ" target="_blank" class="text-decoration-none text-light link-hover">Pedir un juego</a></li>
                        <li class="mb-1"><a href="https://www.youtube.com/@nexus-games-everyone" target="_blank" class="text-decoration-none text-light link-hover">Cómo descargar (Tutorial)</a></li>
                        <li><a href="../ayuda.html" class="text-decoration-none text-light link-hover">DMCA / Reclamaciones</a></li>
                    </ul>
                </div>
                
                <div class="col-md-4 mb-3">
                    <h5 class="fw-bold mb-2 text-uppercase fs-6">Únete a la comunidad</h5>
                    <div class="d-flex gap-3 mt-2">
                        <a href="https://www.youtube.com/@nexus-games-everyone" target="_blank" class="text-white fs-5 hover-rojo"><i class="fa-brands fa-youtube"></i></a>
                        <a href="https://discord.gg/K5xKACqWQ" target="_blank" class="text-white fs-5 hover-rojo"><i class="fa-brands fa-discord"></i></a>
                    </div>
                </div>
            </div>
            
            <hr class="border-secondary mt-1 mb-2">
            
            <div class="text-center text-light opacity-75" style="font-size: 0.75rem;">
                &copy; 2026 NexusGames. Todos los derechos reservados.
            </div>
        </div>
    </footer>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;
}

function generarTarjetaIndexHTML(idJuego, datos, nombreImagen) {
    const catsArr = Array.isArray(datos.categorias) ? datos.categorias : [datos.categorias || ''];
    
    // Convertir para el data-categoria: quitar acentos y espacios por guiones (para que coincida con ?cat=mundo-abierto)
    const dataCats = catsArr.map(cat => cat.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
    ).join(',');

    const textoCatsPantalla = catsArr.join(', ');

    return `<div class="col-md-4 col-sm-6 juego-tarjeta" data-categoria="${dataCats}" data-requisitos="${(datos.requisitos || '').toLowerCase()}">
        <a href="juegos/${idJuego}.html" class="text-decoration-none text-dark game-post">
            <div class="position-relative">
                <img src="juegos/imagenes/${nombreImagen}" class="img-fluid rounded-1 w-100 portada-tarjeta" alt="Juego">
                <span class="badge bg-warning text-dark position-absolute top-0 start-0 m-2">NUEVO</span>
            </div>
            <h6 class="mt-2 mb-1 fw-bold text-uppercase">${datos.titulo}</h6>
            <p class="text-muted" style="font-size: 0.75rem;">${textoCatsPantalla}, ${datos.requisitos} Requisitos</p>
        </a>
    </div>
    `;
}

function eliminarTarjetaIndex(idJuego) {
    const rutaIndex = path.join(__dirname, 'index.html');
    if (!fs.existsSync(rutaIndex)) return;
    
    let indexHtml = fs.readFileSync(rutaIndex, 'utf8');
    const marcaInicio = ``;
    const marcaFin = ``;
    
    if (indexHtml.includes(marcaInicio) && indexHtml.includes(marcaFin)) {
        const inicioIdx = indexHtml.indexOf(marcaInicio);
        const finIdx = indexHtml.indexOf(marcaFin) + marcaFin.length;
        indexHtml = indexHtml.substring(0, inicioIdx) + indexHtml.substring(finIdx);
    } 
    
    const enlaceObjetivo = `href="juegos/${idJuego}.html"`;
    let posHref = indexHtml.indexOf(enlaceObjetivo);
    
    while (posHref !== -1) {
        const posClase = indexHtml.lastIndexOf('juego-tarjeta', posHref);
        const posInicioDiv = indexHtml.lastIndexOf('<div', posClase);

        if (posInicioDiv !== -1) {
            let openDivs = 0;
            let i = posInicioDiv;
            let finDivExacto = -1;

            while (i < indexHtml.length) {
                if (indexHtml.startsWith('<div', i) && !indexHtml.startsWith('</div', i)) {
                    openDivs++;
                } else if (indexHtml.startsWith('</div', i)) {
                    openDivs--;
                    if (openDivs === 0) {
                        finDivExacto = indexHtml.indexOf('>', i) + 1;
                        break;
                    }
                }
                i++;
            }

            if (finDivExacto !== -1) {
                indexHtml = indexHtml.substring(0, posInicioDiv) + indexHtml.substring(finDivExacto);
            } else {
                break;
            }
        } else {
            break;
        }
        posHref = indexHtml.indexOf(enlaceObjetivo);
    }
    fs.writeFileSync(rutaIndex, indexHtml);
}

app.get('/api/juegos', (req, res) => { res.json(leerJuegosDB()); });

app.get('/api/juegos/:id', (req, res) => {
    const juegos = leerJuegosDB();
    const juego = juegos.find(j => j.id === req.params.id);
    if (juego) res.json(juego);
    else res.status(404).json({ error: 'Juego no encontrado' });
});

app.post('/api/crear', upload.single('imagen'), (req, res) => {
    const datos = req.body;
    const nombreImagen = req.file.filename;
    const idJuego = datos.titulo.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const hoy = new Date();
    const fechaActual = ("0" + hoy.getDate()).slice(-2) + '/' + ("0" + (hoy.getMonth() + 1)).slice(-2) + '/' + hoy.getFullYear().toString().substr(-2);
    
    datos.link_caido = datos.link_caido === 'true' || datos.link_caido === 'on';
    
    // Asegurar que 'categorias' siempre sea un Array
    if (datos.categorias && !Array.isArray(datos.categorias)) {
        datos.categorias = [datos.categorias];
    }

    eliminarTarjetaIndex(idJuego);

    const rutaNuevoJuego = path.join(__dirname, 'juegos', idJuego + '.html');
    fs.writeFileSync(rutaNuevoJuego, generarHTMLJuego(datos, nombreImagen, fechaActual));

    const rutaIndex = path.join(__dirname, 'index.html');
    let indexHtml = fs.readFileSync(rutaIndex, 'utf8');
    const anclaExacta = '<div class="row g-4">';
    const nuevaTarjetaHTML = generarTarjetaIndexHTML(idJuego, datos, nombreImagen);

    if (indexHtml.includes(anclaExacta)) {
        indexHtml = indexHtml.replace(anclaExacta, anclaExacta + '\n' + nuevaTarjetaHTML);
        fs.writeFileSync(rutaIndex, indexHtml);
    }

    const juegos = leerJuegosDB();
    const fechaFinal = datos.fecha_actualizacion || fechaActual;
    const nuevoRegistro = { id: idJuego, imagen: nombreImagen, fecha: fechaFinal, fecha_actualizacion: fechaFinal, categoria: datos.categorias, ...datos };
    juegos.unshift(nuevoRegistro);
    guardarJuegosDB(juegos);

    res.redirect('/admin.html?msg=creado');
});

app.post('/api/editar', upload.single('imagen'), (req, res) => {
    const datos = req.body;
    const idJuego = datos.id_juego;
    const juegos = leerJuegosDB();
    const idx = juegos.findIndex(j => j.id === idJuego);

    if (idx === -1) return res.status(404).send('Juego no encontrado');

    const nombreImagen = req.file ? req.file.filename : juegos[idx].imagen;
    const fechaActualFallback = juegos[idx].fecha;
    
    datos.link_caido = datos.link_caido === 'true' || datos.link_caido === 'on' || datos.link_caido === true;

    if (datos.categorias && !Array.isArray(datos.categorias)) {
        datos.categorias = [datos.categorias];
    }

    const rutaJuego = path.join(__dirname, 'juegos', idJuego + '.html');
    fs.writeFileSync(rutaJuego, generarHTMLJuego(datos, nombreImagen, fechaActualFallback));

    eliminarTarjetaIndex(idJuego);
    
    const rutaIndex = path.join(__dirname, 'index.html');
    let indexHtml = fs.readFileSync(rutaIndex, 'utf8');
    const anclaExacta = '<div class="row g-4">';
    const nuevaTarjetaHTML = generarTarjetaIndexHTML(idJuego, datos, nombreImagen);

    if (indexHtml.includes(anclaExacta)) {
        indexHtml = indexHtml.replace(anclaExacta, anclaExacta + '\n' + nuevaTarjetaHTML);
        fs.writeFileSync(rutaIndex, indexHtml);
    }

    juegos[idx] = { ...juegos[idx], ...datos, imagen: nombreImagen, fecha: datos.fecha_actualizacion || fechaActualFallback, categoria: datos.categorias };
    guardarJuegosDB(juegos);

    res.redirect('/admin.html?msg=editado');
});

app.listen(PORT, () => {
    console.log(`✅ Servidor CMS NexusGames con Multi-Categorías activo en el puerto: ${PORT}`);
});