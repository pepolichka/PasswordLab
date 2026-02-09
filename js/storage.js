// Назначение файла: работает с localStorage для сохранения и отображения истории генерации.

window.PasswordLab = window.PasswordLab || {};

(function initStorageModule(ns) {
  const STORAGE_KEY = "password-lab-history-v1";
  const LIMIT = 10;

  function parseHistory(raw) {
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(
        (item) => item && typeof item.password === "string" && typeof item.timestamp === "string"
      );
    } catch {
      return [];
    }
  }

  function getHistory() {
    return parseHistory(localStorage.getItem(STORAGE_KEY));
  }

  function saveToHistory(password) {
    const history = getHistory();
    const entry = {
      password,
      timestamp: new Date().toISOString()
    };

    const next = [entry, ...history].slice(0, LIMIT);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

    return next;
  }

  function clearHistory() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function maskPassword(password) {
    if (password.length <= 2) {
      return "*".repeat(password.length);
    }

    if (password.length <= 4) {
      return `${password[0]}${"*".repeat(password.length - 2)}${password[password.length - 1]}`;
    }

    const start = password.slice(0, 2);
    const end = password.slice(-2);
    const middle = "*".repeat(Math.max(4, password.length - 4));
    return `${start}${middle}${end}`;
  }

  ns.getHistory = getHistory;
  ns.saveToHistory = saveToHistory;
  ns.clearHistory = clearHistory;
  ns.maskPassword = maskPassword;
})(window.PasswordLab);
