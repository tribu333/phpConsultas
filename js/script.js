// Sistema de Búsqueda Simplificado

document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn'); // Nuevo botón
    const clearBtn = document.getElementById('clear-btn');
    const loading = document.getElementById('loading');
    const noResults = document.getElementById('no-results');
    const juradosList = document.getElementById('jurados-list');
    const notarioInfo = document.getElementById('notario-info');
    const juradoCount = document.getElementById('jurado-count');
    const notarioCount = document.getElementById('notario-count');
    
    // Variables
    let debounceTimer;
    let currentJurados = [];

    // Función principal de búsqueda
    function performSearch() {
        const query = searchInput.value.trim();
        
        if (query.length < 2) {
            resetUI();
            return;
        }
        
        buscarJurados(query);
    }

    // Evento para el botón de búsqueda
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }

    // Evento para la tecla Enter
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch();
        }
    });

    // Limpiar búsqueda
    clearBtn.addEventListener('click', function() {
        searchInput.value = '';
        searchInput.focus();
        resetUI();
    });

    // Resetear interfaz
    function resetUI() {
        juradosList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-user-clock"></i>
                <p>Los jurados aparecerán aquí</p>
                <small>Comienza a escribir para buscar</small>
            </div>
        `;
        
        notarioInfo.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-handshake"></i>
                <p>Información del notario</p>
                <small>Selecciona un jurado para ver su notario</small>
            </div>
        `;
        
        juradoCount.textContent = '0';
        notarioCount.textContent = '0';
        loading.classList.remove('active');
        noResults.classList.add('hidden');
        currentJurados = [];
    }

    // Búsqueda en tiempo real (opcional, comentado para usar solo botón/Enter)
    // searchInput.addEventListener('input', function() {
    //     const query = this.value.trim();
    //     
    //     if (query.length < 2) {
    //         resetUI();
    //         return;
    //     }
    //     
    //     buscarJurados(query);
    // });

    // Función de búsqueda con debounce
    function buscarJurados(query) {
        loading.classList.add('active');
        noResults.classList.add('hidden');
        
        clearTimeout(debounceTimer);
        
        debounceTimer = setTimeout(async () => {
            try {
                const response = await fetch('buscar_jurados.php?q=' + encodeURIComponent(query));
                const data = await response.json();
                
                loading.classList.remove('active');
                
                if (data.error) {
                    mostrarError(data.error);
                    return;
                }
                
                if (data.jurados && data.jurados.length > 0) {
                    mostrarJurados(data.jurados);
                } else {
                    noResults.classList.remove('hidden');
                    juradosList.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-search-minus"></i>
                            <p>No se encontraron jurados</p>
                            <small>Intenta con otro nombre</small>
                        </div>
                    `;
                }
            } catch (error) {
                console.error('Error:', error);
                loading.classList.remove('active');
                mostrarError('Error de conexión');
            }
        }, 300);
    }

    // Mostrar lista de jurados
    function mostrarJurados(jurados) {
        currentJurados = jurados;
        juradoCount.textContent = jurados.length;
        
        if (jurados.length === 0) {
            juradosList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search-minus"></i>
                    <p>No se encontraron jurados</p>
                    <small>Intenta con otro nombre</small>
                </div>
            `;
            return;
        }
        
        let juradosHTML = '';
        
        jurados.forEach((jurado, index) => {
            juradosHTML += `
                <div class="jurado-item" data-index="${index}">
                    <div class="jurado-info">
                        <div class="jurado-name">
                            <i class="fas fa-user"></i>
                            ${escapeHTML(jurado.Nombres)} ${escapeHTML(jurado.Apellidos)}
                        </div>
                        <div class="jurado-details">
                            <span class="jurado-doc">
                                <i class="fas fa-id-card"></i> ${jurado.DocIdentidad || 'Sin documento'}
                            </span>
                            <span class="jurado-mesa">
                                <i class="fas fa-chair"></i> Mesa: ${jurado.CodigoMesa || 'No asignada'}
                            </span>
                        </div>
                    </div>
                    <div class="jurado-arrow">
                        <i class="fas fa-chevron-right"></i>
                    </div>
                </div>
            `;
        });
        
        juradosList.innerHTML = juradosHTML;
        
        // Agregar event listeners a los jurados
        document.querySelectorAll('.jurado-item').forEach(item => {
            item.addEventListener('click', function() {
                // Remover clase active de todos
                document.querySelectorAll('.jurado-item').forEach(j => {
                    j.classList.remove('active');
                });
                
                // Agregar clase active al seleccionado
                this.classList.add('active');
                
                // Mostrar información del notario
                const index = parseInt(this.dataset.index);
                mostrarNotario(currentJurados[index]);
            });
            
            // Efecto hover
            item.addEventListener('mouseenter', function() {
                this.style.cursor = 'pointer';
            });
        });
        
        // Seleccionar el primer jurado automáticamente
        if (jurados.length > 0) {
            const firstJurado = document.querySelector('.jurado-item');
            if (firstJurado) {
                firstJurado.click();
            }
        }
    }

    // Mostrar información del notario
    function mostrarNotario(jurado) {
        if (jurado.notario && jurado.notario.Nombres) {
            notarioCount.textContent = '1';
            
            const notario = jurado.notario;
            const notarioHTML = `
                <div class="notario-card">
                    <div class="notario-header">
                        <i class="fas fa-user-tie"></i>
                        <h3>Notario Asignado</h3>
                    </div>
                    <div class="notario-body">
                        <div class="notario-name">
                            ${escapeHTML(notario.Nombres)} ${escapeHTML(notario.Apellidos || '')}
                        </div>
                        <div class="notario-contacto">
                            <div class="contact-item">
                                <div class="contact-icon">
                                    <i class="fas fa-phone-alt"></i>
                                </div>
                                <div class="contact-details">
                                    <a href="tel:${notario.Celular}" class="contact-number">
                                        ${formatPhone(notario.Celular)}
                                    </a>
                                    <span class="contact-label">Celular</span>
                                </div>
                            </div>
                        </div>
                        <div class="notario-mesa-info">
                            <i class="fas fa-info-circle"></i>
                            <span>Asignado a la mesa <strong>${jurado.CodigoMesa}</strong></span>
                        </div>
                    </div>
                </div>
            `;
            
            notarioInfo.innerHTML = notarioHTML;
        } else {
            notarioCount.textContent = '0';
            notarioInfo.innerHTML = `
                <div class="empty-state error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>No hay notario asignado</p>
                    <small>Esta mesa no tiene notario registrado</small>
                    <div class="mesa-info">
                        <i class="fas fa-chair"></i> Mesa: ${jurado.CodigoMesa || 'No asignada'}
                    </div>
                </div>
            `;
        }
    }

    // Mostrar error
    function mostrarError(mensaje) {
        juradosList.innerHTML = `
            <div class="empty-state error">
                <i class="fas fa-exclamation-circle"></i>
                <p>${mensaje}</p>
                <small>Por favor, intenta de nuevo</small>
            </div>
        `;
        
        notarioInfo.innerHTML = `
            <div class="empty-state error">
                <i class="fas fa-times-circle"></i>
                <p>Error al cargar datos</p>
            </div>
        `;
    }

    // Función para formatear número de teléfono
    function formatPhone(phone) {
        if (!phone) return 'No disponible';
        const phoneStr = phone.toString().trim();
        if (phoneStr.length === 8) {
            return phoneStr.replace(/(\d{4})(\d{4})/, '$1 $2');
        }
        if (phoneStr.length === 9) {
            return phoneStr.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
        }
        return phoneStr;
    }

    // Función para escapar HTML
    function escapeHTML(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Evento para limpiar con ESC
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            this.value = '';
            resetUI();
        }
    });

    // Enfocar automáticamente en el campo de búsqueda
    searchInput.focus();
});