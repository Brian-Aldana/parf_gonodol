const registry = [];

export function registerModule(moduleDefinition) {
  if (!moduleDefinition.id || !moduleDefinition.name) {
    throw new Error("Invalid module definition: missing id or name");
  }
  const exists = registry.some((m) => m.id === moduleDefinition.id);
  if (!exists) {
    registry.push(moduleDefinition);
  }
}

export function getModules() {
  return [...registry];
}

export function clearRegistry() {
  registry.length = 0;
}
