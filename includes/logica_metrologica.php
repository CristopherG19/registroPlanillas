<?php
/**
 * Lógica de Verificación Metrológica de Medidores de Agua
 * VERSIÓN POR LOTES (BANCO DE PRUEBAS) - Dinámico (N Medidores)
 */

// 1. Captura de la Configuración del Banco (Dinámico)
$num_medidores = isset($_POST['num_medidores']) ? intval($_POST['num_medidores']) : 9; // 9 por defecto basado en formato físico
if ($num_medidores < 1) $num_medidores = 1; // Mínimo 1 medidor
if ($num_medidores > 50) $num_medidores = 50; // Límite razonable por interfaz

$caudales = [
    'q3' => 'Paso 1: Ensayo en Q3 (Caudal Permanente)',
    'q2' => 'Paso 2: Ensayo en Q2 (Caudal de Transición)',
    'q1' => 'Paso 3: Ensayo en Q1 (Caudal Mínimo)'
];

// Captura del Tipo de Verificación (Afecta el EMP globalmente)
$tipo_verificacion = isset($_POST['tipo_verificacion']) ? $_POST['tipo_verificacion'] : 'posterior';

// Inicializar estado (Volúmenes Patrón Globales)
$vol_patrones = ['q3' => '', 'q2' => '', 'q1' => ''];

// Inicializar estado de los N medidores
$medidores = [];
$results = [];
for ($i = 1; $i <= $num_medidores; $i++) {
    foreach ($caudales as $q => $label) {
        $medidores[$i][$q] = ['li' => '', 'lf' => ''];
        $results[$i][$q] = null;
    }
}

// 2. Procesamiento Backend POST (Guarda el estado y calcula)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    foreach ($caudales as $q => $label) {
        
        // Volumen Patrón para este caudal
        $vp_raw = isset($_POST['vol_patron'][$q]) ? trim($_POST['vol_patron'][$q]) : '';
        $vol_patrones[$q] = htmlspecialchars($vp_raw);
        $vp = floatval($vp_raw);

        // Procesar hasta $num_medidores enviados
        for ($i = 1; $i <= $num_medidores; $i++) {
            $li_raw = isset($_POST['medidores'][$i][$q]['li']) ? trim($_POST['medidores'][$i][$q]['li']) : '';
            $lf_raw = isset($_POST['medidores'][$i][$q]['lf']) ? trim($_POST['medidores'][$i][$q]['lf']) : '';
            
            $medidores[$i][$q]['li'] = htmlspecialchars($li_raw);
            $medidores[$i][$q]['lf'] = htmlspecialchars($lf_raw);

            if ($li_raw !== '' && $lf_raw !== '' && $vp > 0) {
                $li = floatval($li_raw);
                $lf = floatval($lf_raw);
                
                $volInd = $lf - $li;
                $errInd = (($volInd - $vp) / $vp) * 100;

                // EMP NMP 005
                if ($tipo_verificacion === 'inicial') {
                    $emp = ($q === 'q1') ? 5.0 : 2.0;
                } else {
                    $emp = ($q === 'q1') ? 10.0 : 4.0;
                }
                
                $conforme = abs($errInd) <= $emp;

                $results[$i][$q] = [
                    'volInd' => $volInd,
                    'errInd' => $errInd,
                    'conforme' => $conforme,
                    'emp' => $emp
                ];
            }
        }
    }
}
?>
