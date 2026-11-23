# Parf Gonodol

Calculadora científica modular de alta precisión con arquitectura desacoplada en frontend y backend, interfaz ergonómica de precisión técnica y sistema de menú extensible para herramientas matemáticas.

**Licencia**: MIT &nbsp;|&nbsp; **Python**: 3.10+ (gestor: `uv`) &nbsp;|&nbsp; **Frontend**: Web modular &nbsp;|&nbsp; **Plataformas**: Linux y Windows

---

## Acerca del Proyecto

Parf Gonodol surge de la necesidad de contar con una calculadora científica que no sacrifique la precisión matemática ni la ergonomía visual. A diferencia de las utilidades genéricas de calculadora con redondeos imprecisos de punto flotante o interfaces rígidas, Parf Gonodol combina un motor de evaluación simbólica exacta (SymPy y Decimal) blindado contra inyecciones de código mediante AST, con una interfaz web moderna de dos líneas y un menú lateral plug-and-play diseñado para extenderse con nuevas herramientas especializadas.

---

## Características Principales

* **Display Dual de Precisión**: Línea superior para la expresión activa editable y línea inferior para resultados con cifras tabulares monoespaciadas (`font-variant-numeric: tabular-nums`).
* **Teclado Científico Ergonómico**: Matriz de 5 columnas con operaciones aritméticas, funciones trigonométricas con conmutador DEG/RAD, potencias, raíces, logaritmos, factoriales y constantes ($\pi$, $e$).
* **Menú Modular Extensible (Drawer)**: Botón de menú en cabecera con arquitectura desacoplada para conectar futuras herramientas (conversor de unidades, álgebra de matrices, graficador 2D y estadística).
* **Motor Seguro (AST + SymPy/Decimal)**: Análisis sintáctico abstracto que descarta código arbitrario y resuelve expresiones matemáticas complejas sin errores de redondeo binario.
* **Historial Persistente**: Almacenamiento local de operaciones con fecha, fórmula, resultado y modo angular, reutilizable mediante la tecla `Ans`.
* **Experiencia de Escritorio Nativa**: Ejecución portable y sin barras de navegador mediante Webview, compatible con Linux y Windows.

---

## Instalación y Descargas

Para los usuarios finales, Parf Gonodol se distribuye a través de GitHub Releases en 3 formatos independientes:

1. **Instalador de Windows** (`Parf-Gonodol-Setup.exe`): Asistente de instalación tradicional que crea accesos directos en el menú Inicio, Escritorio y añade desinstalador.
2. **Instalador de Linux** (`Parf-Gonodol.AppImage`): Paquete autónomo e integrado al menú de aplicaciones de cualquier distribución Linux moderna.
3. **Versión Portable** (`Parf-Gonodol-Portable.zip`): Carpeta autocontenida que se ejecuta de inmediato sin instalación ni privilegios de administrador (ideal para unidades USB).

### Requisitos del Sistema (Para Desarrollo)

* Python 3.10 o superior con `uv`.
* Node.js 18 o superior.

---

## Uso y Puesta en Marcha en Desarrollo

### 1. Iniciar el Backend con `uv`

```bash
cd backend
uv venv
source .venv/bin/activate       # En Windows: .venv\Scripts\activate
uv pip install -r requirements.txt
uv run uvicorn app.main:app --reload --port 8000
```

La documentación interactiva de la API estará disponible en `http://localhost:8000/docs`.

### 2. Iniciar el Frontend

```bash
cd ../frontend
npm install
npm run dev
```

La interfaz se abrirá en `http://localhost:5173`.

---

## Automatización de Releases (GitHub Actions)

Los 3 instaladores finales se generan y publican automáticamente en la pestaña **Releases** de GitHub mediante un flujo de trabajo de integración continua (`.github/workflows/release.yml`):

* Cada vez que se crea y sube una etiqueta de versión (por ejemplo, `v1.0.0`), GitHub Actions:
  1. En una máquina virtual **Windows**: compila el ejecutable nativo y empaqueta el instalador `Parf-Gonodol-Setup.exe` y la versión portable `.zip`.
  2. En una máquina virtual **Linux**: compila el paquete `Parf-Gonodol.AppImage`.
  3. Adjunta los 3 archivos a la Release oficial de GitHub lista para descargar.

---

## Arquitectura del Proyecto

```
parf_gonodol/
├── backend/                  # API FastAPI, motor matemático AST y persistencia
│   ├── app/
│   │   ├── main.py           # Servidor FastAPI y montaje de estáticos
│   │   ├── config.py         # Configuración y límites de precisión
│   │   ├── services/         # math_engine.py y history_service.py
│   │   ├── routers/          # calculator.py, history.py, modules.py
│   │   └── schemas/          # Modelos Pydantic V2
│   ├── requirements.txt      # Dependencias gestionadas con uv
│   └── tests/                # Pruebas unitarias
│
├── frontend/                 # Interfaz gráfica moderna
│   ├── index.html            # Documento base
│   ├── src/
│   │   ├── components/       # Display.js, Keypad.js, MenuDrawer.js
│   │   ├── styles/           # tokens.css, buttons.css, calculator.css
│   │   ├── services/         # api.js y state.js
│   │   └── modules/          # moduleRegistry.js y extensiones
│   └── package.json          # Configuración del frontend
│
├── desktop/                  # Lanzador nativo de escritorio
│   └── entrypoint.py         # Integración Webview multiplataforma
│
├── .github/workflows/        # Automatización de compilación y releases
│   └── release.yml
└── README.md
```

---

## Extensión del Menú con Nuevos Módulos

Agregar una nueva herramienta al menú lateral no requiere modificar el núcleo de la calculadora:

1. **Definir el módulo en `frontend/src/modules/`**:
   ```javascript
   export const UnitConverterModule = {
     id: "unit-converter",
     name: "Conversor de Unidades",
     description: "Conversión de magnitudes físicas y constantes",
     render: (container) => {
       container.innerHTML = `<div class="tool-content">Vista del conversor</div>`;
     }
   };
   ```

2. **Registrarlo en `frontend/src/modules/moduleRegistry.js`**:
   Importa el objeto y agrégalo a la lista de módulos activos. La tarjeta aparecerá inmediatamente en el drawer del menú.

---

## Hoja de Ruta

- [ ] Soporte para cálculo de derivadas e integrales simbólicas en el motor backend.
- [ ] Módulo oficial de Conversor de Unidades en el menú lateral.
- [ ] Módulo de Álgebra Matricial (inversas, determinantes, producto punto).
- [ ] Exportación avanzada de historial de cálculos a formatos CSV y JSON.
- [ ] Pipeline automatizado en GitHub Actions para generar y firmar los 3 instaladores en cada tag.

---

## Licencia

Parf Gonodol es un proyecto open source distribuido bajo la licencia **MIT**. Consulta el archivo [`LICENSE`](LICENSE) para más detalles.
