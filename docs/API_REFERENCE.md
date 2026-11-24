# Especificacion de la API REST de Parf Gonodol

La API de Parf Gonodol es servida localmente por FastAPI en el puerto asignado (por defecto `http://127.0.0.1:8000`). La documentacion interactiva OpenAPI / Swagger UI se encuentra disponible en `/docs`.

---

## 1. Modulo de Calculadora Principal

### 1.1 Evaluar Expresion
Evalua una expresion algebraica de manera segura mediante AST y SymPy.

- **Ruta**: `POST /api/evaluate`
- **Cabeceras**: `Content-Type: application/json`

#### Cuerpo de la Solicitud
```json
{
  "expression": "sin(45) + 2^3",
  "angle_mode": "DEG",
  "precision": 10
}
```

| Campo | Tipo | Requerido | Descripcion |
|-------|------|-----------|-------------|
| `expression` | string | Si | Cadena algebraica a evaluar |
| `angle_mode` | string | No | `"DEG"` (grados) o `"RAD"` (radianes). Por defecto `"DEG"`. |
| `precision` | integer | No | Cantidad de cifras decimales significativas (6, 10 o 16). Por defecto `10`. |

#### Respuesta Exitosa (`200 OK`)
```json
{
  "success": true,
  "result": "8.7071067812",
  "error": null
}
```

#### Respuesta de Error (`422 Unprocessable Entity` o `400 Bad Request`)
```json
{
  "detail": "Division por cero no permitida"
}
```

---

### 1.2 Consultar Historial
Retorna la lista de operaciones evaluadas recientemente.

- **Ruta**: `GET /api/history`
- **Respuesta Exitosa (`200 OK`)**:
```json
[
  {
    "id": "c1f7a28e-8921-4f10-b9df-d8f99e821104",
    "timestamp": "2026-11-24T05:15:00.000Z",
    "expression": "25 * 4",
    "result": "100",
    "angle_mode": "DEG"
  }
]
```

### 1.3 Vaciar Historial
Elimina todos los registros de operaciones almacenados.

- **Ruta**: `DELETE /api/history`
- **Respuesta Exitosa (`200 OK`)**:
```json
{
  "success": true
}
```

---

## 2. Modulo de Graficador 2D y Resolucion de Ecuaciones

### 2.1 Generar Puntos de Curva
Computa un muestreo discreto de pares $(x, y)$ para una funcion en un rango determinado.

- **Ruta**: `POST /api/plot/points`
- **Cabeceras**: `Content-Type: application/json`

#### Cuerpo de la Solicitud
```json
{
  "expression": "sen(x) + e^x",
  "x_min": -5.0,
  "x_max": 5.0,
  "samples": 300
}
```

| Campo | Tipo | Requerido | Descripcion |
|-------|------|-----------|-------------|
| `expression` | string | Si | Funcion f(x) a evaluar. Admite sintaxis internacional (`sin`, `asin`) y en espanol (`sen`, `sen⁻¹`, `arcsen`), potencias (`^` o `**`), raices, e, pi. |
| `x_min` | float | No | Limite inferior del dominio (por defecto `-10.0`). |
| `x_max` | float | No | Limite superior del dominio (por defecto `10.0`). |
| `samples` | integer | No | Cantidad de puntos a muestrear (entre `2` y `2000`, por defecto `400`). |

#### Respuesta Exitosa (`200 OK`)
```json
{
  "points": [
    { "x": -5.0, "y": -120.0 },
    { "x": -4.966555, "y": -117.4521 },
    { "x": 2.094551, "y": 0.0 }
  ]
}
```

---

### 2.2 Resolver Raices de Ecuaciones
Ejecuta algoritmos iterativos cerrados o abiertos para hallar la raiz $f(x) = 0$.

- **Ruta**: `POST /api/plot/solve-roots`
- **Cabeceras**: `Content-Type: application/json`

#### Solicitud con Metodo Cerrado (Biseccion o Regla Falsa)
```json
{
  "expression": "x^3 - 2*x - 5",
  "method": "bisection",
  "xl": 2.0,
  "xu": 3.0,
  "tolerance": 0.01,
  "max_iter": 100
}
```

#### Solicitud con Metodo Abierto (Newton-Raphson o Secante)
```json
{
  "expression": "x^3 - 2*x - 5",
  "method": "newton_raphson",
  "x0": 2.0,
  "manual_df": null,
  "tolerance": 0.01,
  "max_iter": 100
}
```

#### Respuesta Exitosa (`200 OK`)
```json
{
  "root": 2.09455148,
  "iterations": 14,
  "final_error": 0.007421,
  "converged": true,
  "table": [
    {
      "iter": 1,
      "xl": 2.0,
      "xu": 3.0,
      "xr": 2.5,
      "ea": null
    },
    {
      "iter": 2,
      "xl": 2.0,
      "xu": 2.5,
      "xr": 2.25,
      "ea": 11.111111
    }
  ]
}
```

---

### 2.3 Analisis de Calculo 2D
Computa analiticamente primera y segunda derivada, integral definida en un intervalo y extremos locales.

- **Ruta**: `POST /api/plot/calculus`
- **Cabeceras**: `Content-Type: application/json`

#### Cuerpo de la Solicitud
```json
{
  "expression": "x^3 - 3*x",
  "a": -2.0,
  "b": 2.0
}
```

#### Respuesta Exitosa (`200 OK`)
```json
{
  "derivative": "3*x**2 - 3",
  "second_derivative": "6*x",
  "definite_integral": 0.0,
  "extrema": [
    {
      "x": -1.0,
      "y": 2.0,
      "kind": "Maximo local"
    },
    {
      "x": 1.0,
      "y": -2.0,
      "kind": "Minimo local"
    }
  ]
}
```
