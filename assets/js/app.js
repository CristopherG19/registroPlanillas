document.addEventListener("DOMContentLoaded", function() {
    const tipoVerifSelect = document.getElementById('tipo_verificacion');
    const caudales = ['q3', 'q2', 'q1'];
    // NOTA IMPORTANTE: window.numMedidores es definido globalmente en la vista antes de cargar este script

    // Bloquear caracteres no deseados en campos numéricos (e, E, -, +)
    document.querySelectorAll('input[type="number"]').forEach(el => {
        el.addEventListener('keydown', function(e) {
            if (['e', 'E', '-', '+'].includes(e.key)) {
                e.preventDefault();
            }
        });
        
        el.addEventListener('input', function(e) {
            let val = this.value;
            
            if (val !== '') {
                // Validar min 0 y max 9999.99
                let num = parseFloat(val);
                if (!isNaN(num)) {
                    if (num < 0) {
                        this.value = 0;
                        val = "0";
                    } else if (num > 9999.99) {
                        this.value = 9999.99;
                        val = "9999.99";
                    }
                }

                // Validar maximo 4 digitos enteros y 2 decimales
                if (val.includes('.')) {
                    let parts = val.split('.');
                    let intPart = parts[0];
                    let decPart = parts[1];
                    let changed = false;

                    if (intPart.length > 4) {
                        intPart = intPart.slice(0, 4);
                        changed = true;
                    }
                    if (decPart && decPart.length > 2) {
                        decPart = decPart.slice(0, 2);
                        changed = true;
                    }

                    if (changed) {
                        this.value = `${intPart}.${decPart}`;
                    }
                } else {
                    if (val.length > 4) {
                        this.value = val.slice(0, 4);
                    }
                }
            }

            calcularBancoCompleto();
        });
    });

    // Formato decimal fijo (ej: 0.00) al salir de foco para todos los inputs numéricos (VP, Li, Lf)
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value.trim() !== '') {
                const val = parseFloat(this.value.replace(',', '.'));
                if (!isNaN(val)) this.value = val.toFixed(2);
            }
        });
    });

    function calcularBancoCompleto() {
        const tipo = tipoVerifSelect.value;
        
        caudales.forEach(q => {
            const vpInput = document.querySelector(`.vp-input[data-q="${q}"]`);
            if (!vpInput) return;

            const vp = parseFloat(vpInput.value.replace(',', '.'));
            
            // Determinar Tolerancia de la Norma
            let emp = 0;
            if (tipo === 'inicial') emp = (q === 'q1') ? 5.0 : 2.0;
            else emp = (q === 'q1') ? 10.0 : 4.0;

            // Escanear las filas configuradas
            for (let i = 1; i <= window.numMedidores; i++) {
                const liInput = document.querySelector(`.li-input[data-m="${i}"][data-q="${q}"]`);
                const lfInput = document.querySelector(`.lf-input[data-m="${i}"][data-q="${q}"]`);
                const viSpan  = document.getElementById(`vi_${i}_${q}`);
                const errSpan = document.getElementById(`err_${i}_${q}`);
                const bSpan   = document.getElementById(`badge_${i}_${q}`);

                if (liInput && lfInput && !isNaN(vp) && vp !== 0) {
                    const li = parseFloat(liInput.value.replace(',', '.'));
                    const lf = parseFloat(lfInput.value.replace(',', '.'));

                    if (!isNaN(li) && !isNaN(lf)) {
                        // Matemáticas
                        const vi = lf - li;
                        const err = ((vi - vp) / vp) * 100;
                        const isConforme = Math.abs(err) <= emp;

                        // Reflejo en UI
                        viSpan.textContent = vi.toFixed(2);
                        errSpan.textContent = err.toFixed(1) + '%';
                        
                        if (isConforme) {
                            errSpan.className = 'fw-bold fs-6 text-success';
                            bSpan.className = 'badge w-100 py-2 bg-success';
                            bSpan.textContent = 'CONFORME';
                        } else {
                            errSpan.className = 'fw-bold fs-6 text-danger';
                            bSpan.className = 'badge w-100 py-2 bg-danger';
                            bSpan.textContent = 'NO CONFORME';
                        }
                    } else {
                        resetFila(viSpan, errSpan, bSpan);
                    }
                } else {
                    resetFila(viSpan, errSpan, bSpan);
                }
            }
        });
    }

    // Función Limpiadora UI
    function resetFila(vi, err, b) {
        vi.textContent = '-';
        err.textContent = '-';
        err.className = 'fw-bold fs-6 text-secondary';
        b.className = 'badge w-100 py-2 bg-secondary bg-opacity-25 text-dark';
        b.textContent = 'Pendiente';
    }

    // Ejecutar primer barrido lógico tras el render
    calcularBancoCompleto();
});
