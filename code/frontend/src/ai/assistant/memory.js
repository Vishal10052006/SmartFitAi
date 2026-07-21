export function saveMemory(key, value) {

  const memory =
    JSON.parse(
      localStorage.getItem(
        "smartfit-memory"
      )
    ) || {};

  memory[key] = value;

  localStorage.setItem(
    "smartfit-memory",
    JSON.stringify(memory)
  );
}

export function getMemory(key) {

  const memory =
    JSON.parse(
      localStorage.getItem(
        "smartfit-memory"
      )
    ) || {};

  return memory[key];
}

export function getAllMemory() {

  return JSON.parse(
    localStorage.getItem(
      "smartfit-memory"
    )
  ) || {};
}