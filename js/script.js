// Sistema de Búsqueda Simplificado

document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const searchInput = document.getElementById('search-input');
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

    // Búsqueda en tiempo real
    searchInput.addEventListener('input', function() {
        const query = this.value.trim();
        
        if (query.length < 2) {
            resetUI();
            return;
        }
        
        buscarJurados(query);
    });

    // Función de búsqueda con debounce
    function buscarJurados(query) {
        loading.classList.add('active');
        noResults.classList.add('hidden');
        
        clearTimeout(debounceTimer);
        
        debounceTimer = setTimeout(async () => {
            try {
                const response = await fetch('buscar.php?q=' + encodeURIComponent(query));
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
                    resetUI();
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
                    <div class="jurado-name">${escapeHTML(jurado.Nombres)} ${escapeHTML(jurado.Apellidos)}</div>
                    <div class="jurado-doc">
                        <i class="fas fa-id-card"></i>
                        ${jurado.DocIdentidad} • ${jurado.TipoDoc || 'DNI'}
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
        if (jurado.notario) {
            notarioCount.textContent = '1';
            
            const notario = jurado.notario;
            const notarioHTML = `
                <div class="notario-info">
                    <div class="notario-name">
                        ${escapeHTML(notario.Nombre)} ${escapeHTML(notario.Ap_Paterno)} ${escapeHTML(notario.Ap_Materno)}
                    </div>
                    <div class="contact-info">
                        <div class="phone-item">
                            <div class="phone-icon">
                                <i class="fas fa-phone"></i>
                            </div>
                            <div class="phone-details">
                                <a href="tel:${notario.Celular}" class="phone-number">
                                    ${formatPhone(notario.Celular)}
                                </a>
                                <div class="phone-label">Número de contacto</div>
                            </div>
                        </div>
                        <div class="info-note">
                            <i class="fas fa-info-circle"></i>
                            Notario asignado a la mesa ${jurado.Mesa} (Código: ${jurado.CodigoMesa})
                        </div>
                    </div>
                </div>
            `;
            
            notarioInfo.innerHTML = notarioHTML;
        } else {
            notarioCount.textContent = '0';
            notarioInfo.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>No hay notario asignado</p>
                    <small>Esta mesa no tiene notario registrado</small>
                </div>
            `;
        }
    }

    // Mostrar error
    function mostrarError(mensaje) {
        juradosList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-circle"></i>
                <p>${mensaje}</p>
            </div>
        `;
        
        notarioInfo.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-times-circle"></i>
                <p>Error al cargar datos</p>
            </div>
        `;
    }

    // Función para formatear número de teléfono
    function formatPhone(phone) {
        if (!phone) return 'No disponible';
        const phoneStr = phone.toString();
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