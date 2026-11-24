export const INITIAL_MODULES = [
  {
    id: "scientific-calculator",
    name: "Calculadora Cientifica",
    description: "Modo estandar con precision arbitraria, historial y funciones avanzadas.",
    status: "Activo",
    onSelect: null
  },
  {
    id: "function-plotter",
    name: "Graficador de Funciones 2D",
    description: "Visualizacion de curvas, resolucion de raices y analisis de calculo.",
    status: "Activo",
    onSelect: null
  },
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
    id: "statistics",
    name: "Estadistica Descriptiva",
    description: "Calculo de media, mediana, varianza, desviacion estandar y regresion.",
    status: "Slot preparado",
    onSelect: () => alert("Modulo de Estadistica preparado para implementacion.")
  }
];
