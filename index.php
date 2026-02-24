<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Búsqueda de Jurados y Notarios</title>
    
    <!-- Fuente Inter -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Nuestro archivo CSS -->
    <link rel="stylesheet" href="css/style.css">
    <style>
        .logos-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 40px;
            background-color: #fff;
            border-bottom: 3px solid #dc3545;
        }
        
        .logo-left, .logo-right {
            max-width: 150px;
            height: auto;
        }
        
        .logo-left img, .logo-right img {
            width: 100%;
            max-width: 150px;
            height: auto;
            object-fit: contain;
        }
        
        @media (max-width: 768px) {
            .logos-container {
                padding: 15px 20px;
                flex:1;
                min-width: 250px;
                margin: 0  ;
                padding: 20px 0;
            }
            
            .logo-left, .logo-right {
                max-width: 100px;
            }
        }
    </style>
</head>
<body>
    <div class="logos-container">
        <div class="logo-left">
            <img src="img/logoSubnacionales.png" alt="Logo Izquierda" onerror="this.src='https://via.placeholder.com/150x80?text=Logo+Izquierdo'">
        </div>
        <!-- Encabezado -->
        <header class="header">
            <h1><i class="fas fa-search"></i> Búsqueda de Jurados</h1>
            <p class="subtitle">Descubre quien es tu notario</p>
        </header>
        <div class="logo-right">
            <img src="img/logoted.png" alt="Logo Derecha" onerror="this.src='https://via.placeholder.com/150x80?text=Logo+Derecho'">
        </div>
    </div>
    <div class="container">
        

        <!-- Barra de búsqueda -->
        <div class="search-section">
            <div class="search-box">
                <div class="input-group">
                    <input 
                        type="text" 
                        id="search-input" 
                        placeholder="Buscar por nombre o apellido del jurado..."
                        autocomplete="off"
                    >
                    <button id="clear-btn" class="clear-btn" title="Limpiar">
                        <i class="fas fa-times"></i>
                    </button>
                    
                </div>
                <button id="search-btn" class="search-btn">
                        <i class="fas fa-search"></i> Buscar
                    </button>
                <p class="search-hint">
                    <i class="fas fa-info-circle"></i> Escribe al menos 2 caracteres para comenzar la búsqueda
                </p>
            </div>

            <!-- Indicador de carga -->
            <div id="loading" class="loading-indicator">
                <div class="spinner"></div>
                <span>Buscando...</span>
            </div>

            <!-- Mensaje sin resultados -->
            <div id="no-results" class="no-results-message">
                <i class="fas fa-search-minus"></i>
                <h3>No se encontraron resultados</h3>
                <p>Intenta con otro nombre o verifica la ortografía</p>
            </div>
        </div>

        <!-- Resultados -->
        <div class="results-section">
                <!-- Columna de Jurados -->
                <!-- <div class="column">
                    <div class="column-header">
                        <h2><i class="fas fa-users"></i> Jurados Encontrados</h2>
                        <span id="jurado-count" class="counter">0</span>
                    </div>
                    <div id="jurados-list" class="list-container">
                        <div class="empty-state">
                            <i class="fas fa-user-clock"></i>
                            <p>Los jurados aparecerán aquí</p>
                            <small>Comienza a escribir para buscar</small>
                        </div>
                    </div>
                </div> -->

                <!-- Columna de Notarios -->
                <div class="column">
                    <div class="column-header">
                        <h2><i class="fas fa-user-tie"></i> Notario Correspondiente</h2>
                        <span id="notario-count" class="counter">0</span>
                    </div>
                    <div id="notario-info" class="list-container">
                        <div class="empty-state">
                            <i class="fas fa-handshake"></i>
                            <p>Información del notario</p>
                            <small>Selecciona un jurado para ver su notario</small>
                        </div>
                    </div>
                </div>
        </div>

        <!-- Instrucciones -->
        <div class="instructions">
            <h3><i class="fas fa-lightbulb"></i> ¿Cómo funciona?</h3>
            <ol>
                <li><strong>Busca</strong> un jurado por nombre o apellido</li>
                <li><strong>Selecciona</strong> un jurado de la lista</li>
                <li><strong>Obtén</strong> el nombre y celular del notario asignado a esa mesa</li>
            </ol>
            <p class="note">
                <i class="fas fa-link"></i> 
                <strong>Relación:</strong> Jurados y Notarios se vinculan mediante el <strong>Código de Mesa</strong>
            </p>
        </div>
    </div>
    <!-- ENLACE PDF - Simple y visible -->
    <div style="background-color: #f0f0f0; padding: 8px 0; text-align: center; border-bottom: 2px solid #dc3545;">
        <a href="Cronograma Final de actividades Subnacional 2026.pdf" target="_blank" style="color: #333; text-decoration: none; font-weight: 500;">
            <i class="fas fa-file-pdf" style="color: #dc3545; margin-right: 5px;"></i> 
            📄 Ver Listado de Jurados (PDF)
        </a>
    </div>
    <!-- Font Awesome para iconos -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js"></script>
    
    <!-- Nuestro archivo JavaScript -->
    <script src="js/script.js"></script>
</body>
</html>