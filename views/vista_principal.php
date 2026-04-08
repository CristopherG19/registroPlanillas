<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Planilla de Ensayo Metrológico Dinámico</title>
    <!-- Fuentes y Tipografía -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap" rel="stylesheet">
    <!-- Bootstrap CSS y Bootstrap Icons -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <!-- Estilos Personalizados -->
    <link href="assets/css/styles.css" rel="stylesheet">
</head>

<body>

    <div class="container pb-4">
        <div class="header-box text-center">
            <h3 class="mb-1 fw-bold">Registro de Verificación Metrológica</h3>
            <p class="mb-0 opacity-75 small">Lote de Banco Dinámico</p>
        </div>

        <!-- Se establece ID para auto-submit con JS -->
        <form method="POST" action="" id="formLote">

            <!-- Configuración Inicial Dinámica del Lote -->
            <div class="card shadow-sm border-0 mb-4 rounded-3">
                <div class="card-body">
                    <div class="row align-items-start">

                        <div class="col-md-6 mb-3 mb-md-0">
                            <label for="tipo_verificacion" class="form-label fw-bold text-secondary mb-1">
                                <i class="bi bi-gear-fill me-1"></i> Parámetro NMP 005
                            </label>
                            <!-- El onchange someterá el formulario para recalcular los límites instantáneamente en backend -->
                            <select name="tipo_verificacion" id="tipo_verificacion"
                                class="form-select fw-bold border-2 text-primary"
                                onchange="document.getElementById('formLote').submit();">
                                <option value="inicial" <?php echo ($tipo_verificacion == 'inicial') ? 'selected' : ''; ?>>Verificación Inicial (Estricta)</option>
                                <option value="posterior" <?php echo ($tipo_verificacion == 'posterior') ? 'selected' : ''; ?>>Verificación Posterior (Formatos en Servicio)</option>
                            </select>
                        </div>

                        <div class="col-md-6">
                            <label for="num_medidores" class="form-label fw-bold text-secondary mb-1">
                                <i class="bi bi-list-ol me-1 text-primary"></i> Capacidad del Banco (Nº Medidores)
                            </label>
                            <!-- El input permitirá digitar libremente hasta un máximo de 20 -->
                            <div class="input-group">
                                <input type="number" name="num_medidores" id="num_medidores"
                                    class="form-control fw-bold border-2 text-dark"
                                    value="<?php echo $num_medidores; ?>" min="1" max="20"
                                    onchange="
                                        let v = parseInt(this.value);
                                        if (isNaN(v) || v < 1) this.value = 1;
                                        if (v > 20) this.value = 20;
                                        document.getElementById('formLote').submit();
                                    ">
                                <span class="input-group-text fw-bold bg-light text-secondary border-2">
                                    Medidores en prueba
                                </span>
                            </div>
                            <div class="form-text small mt-1"><i class="bi bi-info-circle-fill text-primary"></i> <em>Puedes cambiar esta
                                    cantidad en cualquier momento, los datos ingresados no se perderán.</em></div>
                        </div>

                    </div>
                </div>
            </div>

            <!-- Acordeón para los 3 Caudales -->
            <div class="accordion shadow-sm" id="acordeonEnsayos">

                <?php
                $isOpen = true; // Solo el primer tab abierto (Q3)
                foreach ($caudales as $q => $label):
                    ?>
                    <div class="accordion-item border-0 mb-2 rounded-3 overflow-hidden">
                        <h2 class="accordion-header" id="heading_<?php echo $q; ?>">
                            <button class="accordion-button <?php echo $isOpen ? '' : 'collapsed'; ?> border-bottom"
                                type="button" data-bs-toggle="collapse" data-bs-target="#collapse_<?php echo $q; ?>">
                                <?php echo $label; ?>
                            </button>
                        </h2>
                        <div id="collapse_<?php echo $q; ?>"
                            class="accordion-collapse collapse <?php echo $isOpen ? 'show' : ''; ?>"
                            data-bs-parent="#acordeonEnsayos">
                            <div class="accordion-body bg-white p-2 p-md-4">

                                <!-- 1. VOLUMEN PATRÓN GLOBAL -->
                                <div class="vp-box text-center mb-4 mx-auto" style="max-width: 400px;">
                                    <label class="form-label fw-bold text-uppercase d-block text-secondary mb-2">Volumen
                                        Patrón (Litros) dictado para <?php echo strtoupper($q); ?></label>
                                    <input type="number" name="vol_patron[<?php echo $q; ?>]"
                                        class="form-control text-center vp-input mx-auto" data-q="<?php echo $q; ?>"
                                        value="<?php echo $vol_patrones[$q]; ?>" step="0.01" min="0" max="9999.99" inputmode="decimal"
                                        placeholder="0.00">
                                </div>

                                <!-- 2. REJILLA DINÁMICA DE N MEDIDORES -->
                                <div class="table-responsive">
                                    <table class="table table-bordered table-hover align-middle table-custom mb-0">
                                        <thead>
                                            <tr>
                                                <th class="text-center" style="width: 50px;">Nº</th>
                                                <th class="text-center" style="min-width: 120px;">Li (L)</th>
                                                <th class="text-center" style="min-width: 120px;">Lf (L)</th>
                                                <th class="text-center" style="min-width: 90px;">V.Ind</th>
                                                <th class="text-center" style="min-width: 90px;">Error %</th>
                                                <th class="text-center" style="min-width: 100px;">Resultado</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <?php for ($i = 1; $i <= $num_medidores; $i++):
                                                $vi = '-';
                                                $err = '-';
                                                $badgeClass = 'bg-secondary bg-opacity-25 text-dark';
                                                $badgeText = 'Pendiente';
                                                $textColor = 'text-secondary';

                                                if (isset($results[$i][$q])) {
                                                    $res = $results[$i][$q];
                                                    $vi = number_format($res['volInd'], 2, '.', '');
                                                    $err = number_format($res['errInd'], 1, '.', '') . '%';
                                                    $textColor = $res['conforme'] ? 'text-success' : 'text-danger';
                                                    $badgeClass = $res['conforme'] ? 'bg-success' : 'bg-danger';
                                                    $badgeText = $res['conforme'] ? 'CONFORME' : 'NO CONFORME';
                                                }
                                                ?>
                                                <tr>
                                                    <td class="text-center fw-bold text-muted bg-light"><?php echo $i; ?></td>
                                                    <td>
                                                        <input type="number"
                                                            name="medidores[<?php echo $i; ?>][<?php echo $q; ?>][li]"
                                                            class="form-control li-input" data-m="<?php echo $i; ?>"
                                                            data-q="<?php echo $q; ?>"
                                                            value="<?php echo $medidores[$i][$q]['li']; ?>" step="0.01" min="0" max="9999.99"
                                                            inputmode="decimal">
                                                    </td>
                                                    <td>
                                                        <input type="number"
                                                            name="medidores[<?php echo $i; ?>][<?php echo $q; ?>][lf]"
                                                            class="form-control lf-input" data-m="<?php echo $i; ?>"
                                                            data-q="<?php echo $q; ?>"
                                                            value="<?php echo $medidores[$i][$q]['lf']; ?>" step="0.01" min="0" max="9999.99"
                                                            inputmode="decimal">
                                                    </td>
                                                    <td class="text-center">
                                                        <span id="vi_<?php echo $i; ?>_<?php echo $q; ?>"
                                                            class="fw-bold fs-6 text-dark"><?php echo $vi; ?></span>
                                                    </td>
                                                    <td class="text-center">
                                                        <span id="err_<?php echo $i; ?>_<?php echo $q; ?>"
                                                            class="fw-bold fs-6 <?php echo $textColor; ?>"><?php echo $err; ?></span>
                                                    </td>
                                                    <td class="text-center">
                                                        <span id="badge_<?php echo $i; ?>_<?php echo $q; ?>"
                                                            class="badge w-100 py-2 <?php echo $badgeClass; ?>"><?php echo $badgeText; ?></span>
                                                    </td>
                                                </tr>
                                            <?php endfor; ?>
                                        </tbody>
                                    </table>
                                </div>

                            </div>
                        </div>
                    </div>
                    <?php
                    $isOpen = false;
                endforeach;
                ?>
            </div>

            <div
                class="sticky-submit p-3 bg-white border-top shadow-lg d-md-none text-center d-flex justify-content-center gap-2">
                <button type="button" class="btn btn-primary btn-lg fw-bold w-100 shadow-sm">
                    Guardar Reporte del Lote
                </button>
            </div>

            <div class="text-end mt-4 d-none d-md-block">
                <button type="button" class="btn btn-primary btn-lg px-5 fw-bold shadow">
                    Guardar Lote de Medidores
                </button>
            </div>

        </form>
    </div>

    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // Variables dinámicas necesarias para js (inyectadas por PHP)
        window.numMedidores = <?php echo json_encode($num_medidores); ?>;
    </script>
    <script src="assets/js/app.js"></script>

</body>

</html>