# Metodos Numericos y Analisis de Calculo en Parf Gonodol

Este documento detalla los fundamentos matematicos, algoritmos y criterios de convergencia implementados en el modulo de busqueda de raices y calculo 2D de Parf Gonodol.

---

## 1. Criterios Generales de Parada y Estimacion de Error

Para todos los metodos iterativos de busqueda de raices, el criterio de parada principal se basa en el **error relativo porcentual aproximado** ($|\epsilon_a|$):

$$|\epsilon_a| = \left| \frac{x_r^{\text{actual}} - x_r^{\text{anterior}}}{x_r^{\text{actual}}} \right| \times 100\%$$

El algoritmo finaliza cuando se satisface una de las siguientes dos condiciones:
1. $|\epsilon_a| \le \text{tolerancia}\%$ (convergencia exitosa).
2. El numero de iteraciones alcanza el valor de `max_iter` sin satisfacer la tolerancia (limite de seguridad).

---

## 2. Metodos Cerrados (Intervalo Acotado)

Los metodos cerrados requieren dos valores iniciales $x_l$ (limite inferior) y $x_u$ (limite superior) tales que encierren al menos una raiz real. Antes de iterar, se valida el cumplimiento del Teorema de Bolzano:

$$f(x_l) \cdot f(x_u) \le 0$$

Si $f(x_l) \cdot f(x_u) > 0$, el motor rechaza el calculo e informa que no se garantiza un cambio de signo en el intervalo.

### 2.1 Metodo de Biseccion

El metodo de biseccion divide el intervalo repetidamente a la mitad.

1. **Aproximacion de la raiz**:
   $$x_r = \frac{x_l + x_u}{2}$$

2. **Evaluacion del subintervalo**:
   - Si $f(x_l) \cdot f(x_r) < 0$: la raiz reside en el subintervalo inferior. Se asigna $x_u = x_r$.
   - Si $f(x_l) \cdot f(x_r) > 0$: la raiz reside en el subintervalo superior. Se asigna $x_l = x_r$.
   - Si $f(x_l) \cdot f(x_r) = 0$: $x_r$ es la raiz exacta.

3. **Propiedad de convergencia**:
   Garantiza convergencia lineal con factor de reduccion del error de $\frac{1}{2}$ en cada paso.

### 2.2 Metodo de Regla Falsa (Regula Falsi)

Aprovecha la magnitud de $f(x_l)$ y $f(x_u)$ trazando una linea recta entre $(x_l, f(x_l))$ y $(x_u, f(x_u))$:

1. **Aproximacion de la raiz**:
   $$x_r = x_u - \frac{f(x_u)(x_l - x_u)}{f(x_l) - f(x_u)}$$

2. **Evaluacion y actualizacion**:
   Identica a la del metodo de biseccion segun el signo del producto $f(x_l) \cdot f(x_r)$.
   
3. **Comportamiento**:
   Suele converger mas rapidamente que la biseccion cuando la funcion se aproxima a un comportamiento lineal, aunque puede ralentizarse si uno de los extremos permanece fijo durante muchas iteraciones.

---

## 3. Metodos Abiertos

Los metodos abiertos no requieren acotar la raiz entre dos valores de signo opuesto. Son computacionalmente eficientes y presentan convergencia superlineal o cuadratica cuando el punto inicial es adecuado.

### 3.1 Metodo de Newton-Raphson

Basado en la expansion en serie de Taylor de primer orden alrededor de la estimacion actual $x_i$:

1. **Formula iterativa**:
   $$x_{i+1} = x_i - \frac{f(x_i)}{f'(x_i)}$$

2. **Calculo de la derivada**:
   - **Modo Automatico (por defecto)**: El motor backend computa la derivada analitica exacta $f'(x)$ de manera simbolica utilizando SymPy antes de iniciar las iteraciones.
   - **Modo Manual**: El usuario puede proporcionar una expresion explicita para $f'(x)$ en la interfaz grafica.

3. **Control de Singularidades**:
   Si $|f'(x_i)| < 10^{-14}$, el calculo se interrumpe para prevenir divisiones por cero o desbordamientos numericos, reportando la singularidad de la pendiente.

4. **Propiedad de convergencia**:
   Convergencia cuadratica en las proximidades de raices simples.

### 3.2 Metodo de la Secante

Aproxima la derivada de la funcion mediante diferencias finitas a partir de dos puntos iniciales $x_{i-1}$ y $x_i$:

1. **Formula iterativa**:
   $$x_{i+1} = x_i - \frac{f(x_i)(x_{i-1} - x_i)}{f(x_{i-1}) - f(x_i)}$$

2. **Ventaja**:
   No requiere el calculo ni la evaluacion de la derivada $f'(x)$, manteniendo un orden de convergencia superlineal aproximado a $\alpha \approx 1.618$ (razon aurea).

---

## 4. Analisis de Calculo en Dos Dimensiones

El servicio de calculo analitico (`curve_service.py`) procesa funciones continuas $f(x)$ sobre un dominio acotado $[a, b]$:

### 4.1 Derivacion Simbolica
- **Primera Derivada**: Calcula analiticamente $f'(x) = \frac{d}{dx}f(x)$.
- **Segunda Derivada**: Calcula analiticamente $f''(x) = \frac{d^2}{dx^2}f(x)$.

### 4.2 Integracion Definida
- Evala la integral en el intervalo dado:
  $$I = \int_{a}^{b} f(x) \, dx$$
- Emplea evaluacion simbolica exacta con SymPy y redondeo controlado a precision de punto flotante de 64 bits.

### 4.3 Deteccion y Clasificacion de Extremos Locales
1. Obtencion de puntos criticos resolviendo la ecuacion simbolica:
   $$f'(x) = 0, \quad x \in [a, b]$$
2. Clasificacion por el criterio de la segunda derivada:
   - Si $f''(x_c) > 0$: **Minimo local** en $(x_c, f(x_c))$.
   - Si $f''(x_c) < 0$: **Maximo local** en $(x_c, f(x_c))$.
   - Si $f''(x_c) = 0$: Punto de inflexion o prueba no concluyente.

### 4.4 Formateo Matematico de Resultados
Las derivadas y expresiones algebraicas devueltas por SymPy son formateadas antes de su presentacion al usuario:
- **Potencias a Superindices**: Conversion de `**2` a `²`, `**3` a `³`, etc. (ejemplo: `3*x**2 - 2` $\rightarrow$ `3x² - 2`).
- **Multiplicacion Implicita**: Supresion de asteriscos innecesarios entre coeficientes y variables (`6*x` $\rightarrow$ `6x`).
- **Insignias de Extremos**: Presentacion de maximos y minimos locales con etiquetas de color y coordenadas claras.

---

## 5. Tabulacion y Muestreo de Curvas

Para la generacion de tablas de valores y el renderizado en el lienzo:
- Se evalua la expresion sobre una particion uniforme de $N$ muestras en $[x_{\min}, x_{\max}]$ ($N \ge 2$):
  $$x_k = x_{\min} + k \cdot \Delta x, \quad \Delta x = \frac{x_{\max} - x_{\min}}{N - 1}$$
- Deteccion de discontinuidades: los saltos abruptos generados por asintotas verticales (como en $1/x$ o $\tan(x)$) son detectados y desacoplados para evitar el trazado de lineas verticales no deseadas en el lienzo.
- Los valores indefinidos o indeterminados (divisiones por cero, logaritmos de numeros no positivos) se devuelven como nulos (`None` / `Indefinido`), garantizando continuidad visual sin errores.
