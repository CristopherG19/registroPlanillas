document.addEventListener("DOMContentLoaded", function() {
    const tipoVerifSelect = document.getElementById('tipo_verificacion');
    const caudales = ['q3', 'q2', 'q1'];
    // NOTA IMPORTANTE: window.numMedidores es definido globalmente en la vista antes de cargar este script

    // Listener en tiempo real a los inputs de números (sin hacer form submit)
    document.querySelectorAll('input[type="number"]').forEach(el => {
        el.addEventListener('input', calcularBancoCompleto);
    });

    // Formato decimal fijo (ej: 0.000) al salir de foco para Volúmenes Patrón
    document.querySelectorAll('.vp-input').forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value.trim() !== '') {
                const val = parseFloat(this.value.replace(',', '.'));
                if (!isNaN(val)) this.value = val.toFixed(3);
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
