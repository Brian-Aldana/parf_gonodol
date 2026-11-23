export const INITIAL_MODULES = [
  {
    id: "unit-converter",
    name: "Conversor de Unidades",
    description: "Longitud, masa, temperatura, presion y velocidad con precision cientifica.",
    status: "Slot preparado",
    onSelect: () => alert("Modulo Conversor de Unidades preparado para implementacion.")
  },
  {
    id: "matrix-algebra",
    name: "Algebra Matricial",
    description: "Determinantes, matrices inversas, multiplicacion y sistemas de ecuaciones.",
    status: "Slot preparado",
    onSelect: () => alert("Modulo de Matrices preparado para implementacion.")
  },
  {
    id: "function-plotter",
    name: "Graficador de Funciones 2D",
    description: "Visualizacion grafica de f(x), analisis de raices y maximos locales.",
    status: "Slot preparado",
    onSelect: () => alert("Modulo Graficador 2D preparado para implementacion.")
  },
  {
    id: "statistics",
    name: "Estadistica Descriptiva",
    description: "Calculo de media, mediana, varianza, desviacion estandar y regresion.",
    status: "Slot preparado",
    onSelect: () => alert("Modulo de Estadistica preparado para implementacion.")
  }
];
