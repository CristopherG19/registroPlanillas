# Registro de Planillas - Verificación Metrológica

Este proyecto es una aplicación web para el registro y cálculo de verificación metrológica de medidores. Permite ingresar datos de volumen patrón y lectura de medidores en diferentes caudales (Q1, Q2, Q3) para determinar errores y conformidad.

## Requisitos

- PHP 7.4 o superior
- Navegador web moderno

## Estructura del Proyecto

- `index.php`: Punto de entrada de la aplicación.
- `includes/logica_metrologica.php`: Contiene la lógica de negocio y cálculos metrológicos.
- `views/vista_principal.php`: Interfaz de usuario (HTML/PHP).
- `assets/`: Recursos estáticos (CSS, JS).

## Cómo Levantar el Proyecto

Para ejecutar este proyecto de forma local, sigue estos pasos:

1. **Clonar el repositorio o descargar los archivos**:
   Asegúrate de tener todos los archivos en un directorio local.

2. **Iniciar el servidor local de PHP**:
   Abre una terminal en la raíz del proyecto y ejecuta:
   ```bash
   php -S localhost:8000
   ```

3. **Acceder a la aplicación**:
   Abre tu navegador y entra a:
   [http://localhost:8000](http://localhost:8000)

## Características Principales

- Validación dinámica de entradas numéricas.
- Cálculo automático de errores porcentuales.
- Detección de tendencia de signos (No Conformidad si todos los signos son iguales y superan el 1/2 EMP).
- Interfaz responsiva con Bootstrap 5.
