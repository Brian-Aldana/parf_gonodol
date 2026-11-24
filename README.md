# Parf Gonodol

Calculadora cientifica de alta precision y suite de resolucion de ecuaciones con arquitectura desacoplada, display dual de precision tecnica, graficador 2D interactivo y soporte de metodos iterativos cerrados y abiertos.

**Version**: 2.0.0 &nbsp;|&nbsp; **Licencia**: MIT &nbsp;|&nbsp; **Python**: 3.10+ (gestor: `uv`) &nbsp;|&nbsp; **Frontend**: Vanilla ES Modules (Vite) &nbsp;|&nbsp; **Desktop**: PyQt6 WebEngine

---

## Indice de Contenidos

- [Acerca del Proyecto](#acerca-del-proyecto)
- [Modulos y Caracteristicas Principales](#modulos-y-caracteristicas-principales)
  - [1. Calculadora Cientifica Estandar](#1-calculadora-cientifica-estandar)
  - [2. Graficador 2D y Resolucion de Ecuaciones](#2-graficador-2d-y-resolucion-de-ecuaciones)
- [Documentacion Tecnica](#documentacion-tecnica)
- [Descargas y Distribucion](#descargas-y-distribucion)
- [Puesta en Marcha en Desarrollo](#puesta-en-marcha-en-desarrollo)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Licencia](#licencia)

---

## Acerca del Proyecto

Parf Gonodol combina la inmediatez y ergonomia de una calculadora cientifica de escritorio con la potencia del computo simbolico (SymPy) y metodos numericos para la busqueda iterativa de raices. Su diseno desacoplado conecta una interfaz web reactiva sin dependencias pesadas con un nucleo backend blindado contra ejecucion de codigo arbitrario mediante analisis sintactico de AST.

---

## Modulos y Caracteristicas Principales

### 1. Calculadora Cientifica Estandar
- **Display Dual**: Linea superior para la expresion algebraica en edicion y linea inferior para resultados con cifras monoespaciadas tabulares (`font-variant-numeric: tabular-nums`).
- **Teclado Ergonomico**: Matriz con operaciones aritmeticas basicas, funciones trigonometricas con alternancia DEG/RAD, potencias, raices, logaritmos, constantes ($\pi$, $e$) y funciones secundarias (`2nd`).
- **Gestion de Memoria**: Controles completos de memoria interna (`M+`, `M-`, `MR`, `MC`, `MS`) con popover flotante en tiempo real.
- **Historial Persistente**: Registro de calculos con reincorporacion directa mediante la tecla `Ans`.
- **Motor Seguro (AST + SymPy/Decimal)**: Resolucion exacta que previene errores de redondeo binario y bloquea codigo malicioso.

### 2. Graficador 2D y Resolucion de Ecuaciones
- **Barra Superior de Plantillas y Trigonometria**: Insercion asistida de funciones trigonometricas directas e inversas (`sen`, `cos`, `tan`, `sen⁻¹`, `cos⁻¹`, `tan⁻¹`), fracciones ($\frac{\square}{\square}$), potencias ($\square^\square$), raices ($\sqrt{\square}$, $\sqrt[3]{\square}$, $\sqrt[\square]{\square}$), valor absoluto ($|\square|$), derivadas ($\frac{d}{dx}$, $\frac{d^2}{dx^2}$), integrales ($\int$, $\int_a^b$), sumatorias ($\sum$) y limites ($\lim$) con navegacion por cajas mediante `Tab`.
- **Lienzo 2D Interactivo con Escalas**: Paneo por arrastre, zoom dinamico con rueda de raton y controles en pantalla (`+`, `−`, `↺`), cuadricula adaptativa con rotulado numerico en ejes $X$ e $Y$, indicador de coordenadas bajo el cursor y marcado de raices sobre la curva.
- **Diseno Responsivo con Autolayout**: Adaptacion automatica de la interfaz segun el espacio disponible (disposicion lado a lado en pantallas amplias y apilamiento vertical fluido en ventanas compactas $\le 820\text{px}$), con scrollbars oscuros estilizados.
- **Metodos de Resolucion de Raices**:
  - **Metodos Cerrados**: Biseccion y Regla Falsa (Regula Falsi) con verificacion automatica de cambio de signo en $[x_l, x_u]$.
  - **Metodos Abiertos**: Newton-Raphson (con derivada automatica simbolica por SymPy o derivada manual opcional) y Metodo de la Secante.
  - Criterio de convergencia por error relativo porcentual ($|\epsilon_a| \le tol\%$).
  - Tabla de iteraciones paso a paso con opcion de copiado instantaneo a formato CSV.
- **Analisis de Calculo Formateado**: Evaluacion de primera y segunda derivada analitica con formato matematico estilizado ($3x^2 - 2$), integral definida $\int_a^b f(x)\,dx$ y localizacion de maximos y minimos relativos con insignias visuales.
- **Tabulacion de Valores**: Generacion de tablas $(x, f(x))$ con rango y paso $\Delta x$ personalizables y exportacion a CSV.

---

## Documentacion Tecnica

Para consultar los detalles de diseno, formulaciones y contratos de la API, revisa los documentos dedicados:

- [Arquitectura del Sistema](docs/ARCHITECTURE.md): Diagrama de componentes, comunicacion frontend-backend, sincronizacion de sockets en escritorio y manejo de empaquetado con PyInstaller y PyQt6.
- [Metodos Numericos y Analisis de Calculo](docs/NUMERICAL_METHODS.md): Formulación matematica, ecuaciones iterativas, teoremas de parada y derivacion de cada algoritmo.
- [Referencia de la API REST](docs/API_REFERENCE.md): Contratos de endpoints, schemas de peticion y respuesta JSON, codigos de estado y ejemplos.

---

## Descargas y Distribucion

Parf Gonodol se empaqueta y publica automaticamente mediante GitHub Actions en cada etiqueta de version:

1. **Instalador para Windows** (`Parf-Gonodol-Setup.exe`): Asistente clasico de Inno Setup que anade accesos directos al menu Inicio, Escritorio y desinstalador.
2. **Version Portable para Windows** (`Parf-Gonodol-Portable-Windows.zip`): Carpeta comprimida autocontenida que se ejecuta de inmediato sin instalacion ni privilegios de administrador.
3. **Paquete Autonomo para Linux** (`Parf-Gonodol-Linux.tar.gz`): Distribucion independiente con binario ejecutable y dependencias nativas empaquetadas.

---

## Puesta en Marcha en Desarrollo

### Requisitos Previos
- Python 3.10 o superior con el gestor `uv`.
- Node.js 18 o superior (o Deno).

### 1. Iniciar el Backend
```bash
cd backend
uv venv
source .venv/bin/activate       # En Windows: .venv\Scripts\activate
uv pip install -r requirements.txt
uv run uvicorn app.main:app --reload --port 8000
```
La documentacion Swagger interactiva estara disponible en `http://127.0.0.1:8000/docs`.

### 2. Iniciar el Frontend
```bash
cd frontend
npm install
npm run dev
```
La interfaz web se cargara en `http://localhost:5173`.

### 3. Ejecutar Pruebas Automatizadas
```bash
./backend/.venv/bin/pytest
```

---

## Estructura del Proyecto

```
parf_gonodol/
├── backend/
│   ├── app/
│   │   ├── main.py                 # Servidor FastAPI y montaje de estaticos
│   │   ├── config.py               # Limites y configuracion de precision
│   │   ├── routers/                # Endpoints REST (calculator, plotter, history)
│   │   ├── schemas/                # Modelos Pydantic V2
│   │   └── services/               # Motores de calculo (AST, root_finding, curve_service)
│   ├── requirements.txt            # Dependencias Python
│   └── tests/                      # Suite de pruebas unitarias con pytest
│
├── frontend/
│   ├── index.html                  # Plantilla HTML principal
│   ├── src/
│   │   ├── components/             # Display.js, Keypad.js, MenuDrawer.js
│   │   ├── modules/
│   │   │   ├── moduleRegistry.js   # Registro de herramientas modulares
│   │   │   └── plotter/            # PlotterView, Canvas, Solver, Plantillas
│   │   ├── services/               # api.js y state.js
│   │   └── styles/                 # Hojas de estilo modulares
│   └── package.json                # Configuracion de Vite y dependencias
│
├── desktop/
│   ├── entrypoint.py               # Contenedor PyQt6 QWebEngineView con socket polling
│   └── installer.iss               # Script de empaquetado para Inno Setup
│
├── docs/                           # Documentacion tecnica de referencia
│   ├── ARCHITECTURE.md             # Arquitectura del sistema y empaquetado
│   ├── NUMERICAL_METHODS.md        # Algoritmos y fundamentos matematicos
│   └── API_REFERENCE.md            # Especificacion de endpoints REST
│
├── .github/workflows/
│   └── release.yml                 # Compilacion y publicacion automatizada en CI/CD
└── README.md
```

---

## Licencia

Distribuido bajo la licencia **MIT**. Consulta el archivo [LICENSE](LICENSE) para mas informacion.
