# Arquitectura Tecnica de Parf Gonodol

## 1. Vision General del Sistema

Parf Gonodol es una suite cientifica modular construida bajo un patron de arquitectura desacoplada en tres capas:

1. **Frontend Web Modular**: Interfaz de usuario reactiva escrita en JavaScript ES Modules estandar, empaquetada con Vite, disenada con CSS ergonomico sin dependencias pesadas de frameworks UI.
2. **Backend de Computo Simbolico y Numerico**: Servidor local de alto rendimiento basado en FastAPI, alimentado por SymPy, mpmath y un evaluador seguro basado en el Arbol de Sintaxis Abstracta (AST) de Python.
3. **Contenedor de Escritorio Hibrido Nativo**: Aplicacion de escritorio multiplataforma (Linux y Windows) impulsada por PyQt6 WebEngine (`QWebEngineView`), coordinada mediante un hilo de servidor en segundo plano con sondeo de sockets activo.

```
+--------------------------------------------------------------------------+
|                       Ventana Nativa (PyQt6)                             |
|                                                                          |
|  +--------------------------------------------------------------------+  |
|  |                 Frontend Web (QWebEngineView)                      |  |
|  |                                                                    |  |
|  |  +-------------------------+     +-------------------------------+ |  |
|  |  |  Calculadora Cientifica |     |  Graficador 2D & Ecuaciones   | |  |
|  |  |  (Display dual, Keypad) |     |  (Canvas, Plantillas, Solver) | |  |
|  |  +-------------------------+     +-------------------------------+ |  |
|  |               ^                                 ^                  |  |
|  |               |            REST (Fetch)         |                  |  |
|  +---------------|---------------------------------|------------------+  |
|                  v                                 v                     |
|  +--------------------------------------------------------------------+  |
|  |                 Backend FastAPI (Hilo Daemon Local)                |  |
|  |                                                                    |  |
|  |  [Routers]   /api/calculator   /api/plot/*       /api/history      |  |
|  |  [Servicios] AST Parser        SymPy Engine      Root Finding      |  |
|  |  [Persist.]  SQLite / JSON Storage en AppData                      |  |
|  +--------------------------------------------------------------------+  |
+--------------------------------------------------------------------------+
```

---

## 2. Componentes del Frontend

### 2.1 Vista de Calculadora Cientifica
- **Display Dual (`Display.js`)**: Renderiza dos lineas independientes; la superior muestra la expresion algebraica en curso y la inferior los resultados formateados con cifras monoespaciadas tabulares (`font-variant-numeric: tabular-nums`).
- **Teclado Dinamico (`Keypad.js`)**: Gestiona la matriz de 5 columnas con alternancia de funciones secundarias (`2nd`) y modos angulares (`DEG`/`RAD`).
- **Gestor de Estado Reactivo (`state.js`)**: Maquina de estados sincrona que procesa la entrada, posicion del cursor, recuperacion de memoria (`M+`, `M-`, `MR`, `MC`, `MS`) y atajos de teclado fisicos.

### 2.2 Modulo de Graficador 2D y Resolucion (`PlotterView.js`)
- **Barra Superior de Plantillas y Trigonometria (`MathTemplateToolbar.js`)**: Insercion de estructuras algebraicas, calculo y funciones trigonometricas completas (`sen`, `cos`, `tan`, `sen⁻¹`, `cos⁻¹`, `tan⁻¹`, fracciones, potencias, raices, derivadas, integrales, sumatorias).
- **Entrada Estructurada (`TemplateInput.js`)**: Gestion de navegacion por marcadores `□` con `Tab` y `Shift+Tab`, sanitizando la expresion a sintaxis simbolica estandar al evaluar.
- **Lienzo Interactivo (`CanvasPlotter.js`)**: Graficador en tiempo real sobre HTML5 Canvas con soporte para paneo por arrastre, zoom proporcional con rueda de raton o controles en pantalla (`+`, `−`, `↺`), cuadricula adaptativa con rotulado numerico en ejes, indicador de coordenadas bajo el cursor y marcadores de raices sobre el eje horizontal.
- **Paneles Laterales Especializados**:
  - `EquationSolverPanel.js`: Configuracion y ejecucion de metodos de busqueda de raices con tabla de iteraciones y copia en formato CSV.
  - `CalculusPanel.js`: Calculo analitico de derivadas con formateo matematico estilizado (`3x² - 2`), integrales definidas y clasificacion visual de maximos/minimos relativos.
  - `TableValuesPanel.js`: Generacion y exportacion tabular de pares $(x, f(x))$ para cualquier rango y tamano de paso.

### 2.3 Sistema de Autolayout y Diseno Responsivo
- **Modo Pantalla Completa / Escritorio**: Distribucion horizontal de dos columnas: lienzo a la izquierda (`flex: 1`) y barra lateral fija a la derecha (`400px`).
- **Modo Compacto / Ventana Reducida ($\le 820\text{px}$)**: Reordenamiento vertical automatico donde el lienzo conserva prioridad visual superior y los paneles de herramientas fluyen hacia la parte inferior sin superposicion.
- **Scrollbars Estilizados**: Supresion total de desbordamiento horizontal (`overflow-x: hidden`) y reglas CSS de navegacion vertical sutil (`::-webkit-scrollbar` de 6px con contrastes neutros).

---

## 3. Componentes del Backend

### 3.1 Motor de Evaluacion Segura (AST & SymPy)
Para garantizar precision matematica absoluta sin vulnerabilidades de inyeccion de codigo (`eval()` arbitrario):
1. **Analizador AST (`math_engine.py`)**: Valida que cada nodo del arbol sintactico pertenezca exclusivamente a operadores matematicos o funciones matematicas registradas en una lista blanca estricta.
2. **Multiplicacion Implicita**: Un preprocesador con expresiones regulares y lookbehinds negativos detecta patrones como `2x`, `2(3)` o `2sin(x)` e inserta el operador de multiplicacion explicito sin alterar identificadores reservados (`log10`, `asin`).
3. **Normalizacion de Notacion Trigonometrica**: Mapeo transparente para expresiones en espanol y notacion de potencias inversas (`sen` -> `sin`, `arcsen` -> `asin`, `sen⁻¹` -> `asin`, `cos⁻¹` -> `acos`, `tan⁻¹` -> `atan`).
4. **Precision Arbitraria**: Conmutacion transparente entre evaluacion simbolica exacta con SymPy y precision decimal arbitraria con la biblioteca estandar `decimal`.

### 3.2 Modulo de Metodos Numericos (`root_finding.py`)
Implementa algoritmos desacoplados con contratos de entrada y salida consistentes:
- Retorna un diccionario estructurado que incluye la raiz aproximada, el error relativo final $|\epsilon_a|$, el numero de iteraciones ejecutadas, el estado de convergencia y la tabla completa de iteraciones.
- Los metodos cerrados verifican formalmente el teorema del valor intermedio ($f(x_l) \cdot f(x_u) \le 0$) antes de iniciar las iteraciones.

---

## 4. Ciclo de Vida y Empaquetado de Escritorio

El punto de entrada `desktop/entrypoint.py` administra la sincronizacion entre el frontend y el backend en modo standalone:

```
Inicio de Aplicacion
        |
        v
Buscar Puerto TCP Libre (ej. 8000..8100)
        |
        v
Asignar os.devnull a sys.stdout / sys.stderr (si None en --windowed)
        |
        v
Iniciar Hilo Daemon de Uvicorn (FastAPI)
        |
        v
Sondeo Activo de Socket (wait_for_server)
   -> Comprueba conexion TCP real hasta responder
        |
        v
Instanciar QApplication & QWebEngineView (1024x700 por defecto)
   -> Banderas de aislamiento de GPU (--disable-gpu --no-sandbox)
        |
        v
Cargar URL Local (http://127.0.0.1:<puerto>)
        |
        v
Mostrar Ventana Principal
```

### Prevencion de Fallas Conocidas en Empaquetado
1. **Error de Conexion Rechazada (`ERR_CONNECTION_REFUSED`)**: Se evita mediante `wait_for_server`, garantizando que la ventana no navegue antes de que Uvicorn haya completado el bind del socket TCP.
2. **Falla por Bloqueo de GPU en Maquinas Virtuales**: Se resuelve aplicando `QTWEBENGINE_CHROMIUM_FLAGS="--disable-gpu --no-sandbox"` antes de inicializar `QApplication`.
3. **Cierre Inesperado de Uvicorn en Modo Sin Consola**: PyInstaller en modo `--windowed` establece `sys.stdout = None`, provocando un fallo en los manejadores de registro de Uvicorn. Se neutraliza redirigiendo flujos nulos a `os.devnull`.
4. **Permisos de Escritura en Directorio de Instalacion**: El historial se guarda en las carpetas de datos del usuario (`%APPDATA%/Parf Gonodol` en Windows y `~/.local/share/parf_gonodol` en Linux) en lugar del directorio de ejecucion del programa.
