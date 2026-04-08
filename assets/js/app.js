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
        
        // Estructura 2D para mantener el estado aislado por medidor en este barrido
        let matriz = {};
        for (let i = 1; i <= window.numMedidores; i++) {
            matriz[i] = {};
        }

        // --- PASO 1: Calcular valores nominales e inyectar en matriz ---
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

                resetFila(viSpan, errSpan, bSpan);

                if (liInput && lfInput && !isNaN(vp) && vp !== 0) {
                    const li = parseFloat(liInput.value.replace(',', '.'));
                    const lf = parseFloat(lfInput.value.replace(',', '.'));

                    if (!isNaN(li) && !isNaN(lf)) {
                        const vi = lf - li;
                        const err = parseFloat((((vi - vp) / vp) * 100).toFixed(1));
                        const isConforme = Math.abs(err) <= emp;

                        matriz[i][q] = {
                            calculado: true,
                            vi: vi, err: err, emp: emp, isConforme: isConforme,
                            viSpan: viSpan, errSpan: errSpan, bSpan: bSpan
                        };
                    } else {
                        matriz[i][q] = { calculado: false, viSpan, errSpan, bSpan };
                    }
                } else {
                    matriz[i][q] = { calculado: false, viSpan, errSpan, bSpan };
                }
            }
        });

        // --- PASO 2: Renderizar UI y aplicar filtrado cruzado de signos ---
        for (let i = 1; i <= window.numMedidores; i++) {
            const medidor = matriz[i];
            let allCalculado = true;

            // Render base
            caudales.forEach(q => {
                const dto = medidor[q];
                if (dto && dto.calculado) {
                    dto.viSpan.textContent = dto.vi.toFixed(2);
                    dto.errSpan.textContent = dto.err.toFixed(1) + '%';
                    
                    // VALIDACIÓN DE PRUEBA MAL EJECUTADA O ERROR DE DIGITACIÓN (Físicamente imposible)
                    if (dto.err < -100.0) {
                        dto.errSpan.className = 'fw-bold fs-6 text-warning';
                        dto.bSpan.className = 'badge w-100 py-2 bg-warning text-dark border border-warning';
                        dto.bSpan.textContent = 'PRUEBA INVÁLIDA';
                        return; // Omitimos evaluación estándar para este caudal
                    }

                    if (tipo === 'inicial') {
                        if (dto.isConforme) {
                            dto.errSpan.className = 'fw-bold fs-6 text-success';
                            dto.bSpan.className = 'badge w-100 py-2 bg-success';
                            dto.bSpan.textContent = 'CONFORME';
                        } else {
                            dto.errSpan.className = 'fw-bold fs-6 text-danger';
                            dto.bSpan.className = 'badge w-100 py-2 bg-danger';
                            dto.bSpan.textContent = 'NO CONFORME';
                        }
                    } else { // tipo === 'posterior'
                        if (dto.isConforme) {
                            dto.errSpan.className = 'fw-bold fs-6 text-success';
                            dto.bSpan.className = 'badge w-100 py-2 bg-success';
                            dto.bSpan.textContent = 'OPERATIVO';
                        } else {
                            dto.errSpan.className = 'fw-bold fs-6 text-danger';
                            dto.bSpan.className = 'badge w-100 py-2 bg-danger';
                            if (dto.err > 0) {
                                dto.bSpan.textContent = 'SOBRE-REGISTRA';
                            } else {
                                dto.bSpan.textContent = 'SUB-REGISTRA';
                            }
                        }
                    }
                } else {
                    allCalculado = false;
                }
            });

            // REGLA INTELIGENTE DE SIGNOS Y MITAD DEL EMP (Solo Iniciales que tengan los 3 caudales procesados)
            if (tipo === 'inicial' && allCalculado) {
                const eq1 = medidor['q1'].err;
                const eq2 = medidor['q2'].err;
                const eq3 = medidor['q3'].err;

                // Extraemos signo. (El 0 no lo cuenta como direccional)
                const sq1 = Math.sign(eq1);
                const sq2 = Math.sign(eq2);
                const sq3 = Math.sign(eq3);

                if (sq1 === sq2 && sq2 === sq3 && sq1 !== 0) {
                    // Tendencia detectada. Validamos restricción: 1/2 del EMP
                    const chkQ1 = Math.abs(eq1) <= (medidor['q1'].emp / 2);
                    const chkQ2 = Math.abs(eq2) <= (medidor['q2'].emp / 2);
                    const chkQ3 = Math.abs(eq3) <= (medidor['q3'].emp / 2);

                    // Si NINGUNO cumple con ser <= a la mitad de su EMP, invalida todo el medidor
                    if (!chkQ1 && !chkQ2 && !chkQ3) {
                        caudales.forEach(q => {
                            medidor[q].bSpan.className = 'badge w-100 py-2 bg-danger border border-2 border-danger';
                            medidor[q].errSpan.className = 'fw-bold fs-6 text-danger';
                            medidor[q].bSpan.textContent = 'NO CONF. (SIGNOS)';
                        });
                    }
                }
            }
        }
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
