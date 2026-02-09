// Назначение файла: вычисляет силу пароля в диапазоне 0-100 с учетом бонусов и штрафов.

window.PasswordLab = window.PasswordLab || {};

(function initStrengthModule(ns) {
  const SEQUENCES = [
    "0123456789",
    "1234567890",
    "abcdefghijklmnopqrstuvwxyz",
    "qwertyuiop",
    "asdfghjkl",
    "zxcvbnm"
  ];

  const BAD_WORDS = ["password", "admin", "qwerty"];

  function countUniqueChars(password) {
    return new Set(password).size;
  }

  function hasSequence(passwordLower) {
    for (const sequence of SEQUENCES) {
      for (let i = 0; i <= sequence.length - 3; i += 1) {
        const part = sequence.slice(i, i + 3);
        if (passwordLower.includes(part)) {
          return true;
        }
      }
    }

    return false;
  }

  function countRepeats(password) {
    const counts = new Map();
    for (const char of password) {
      counts.set(char, (counts.get(char) || 0) + 1);
    }

    let repeated = 0;
    for (const amount of counts.values()) {
      if (amount > 1) {
        repeated += amount - 1;
      }
    }

    return repeated;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function calculateStrength(password) {
    if (!password) {
      return {
        score: 0,
        label: "Слабый",
        details: ["Пароль не введен."]
      };
    }

    let score = 0;
    const details = [];

    const length = password.length;
    if (length >= 8) {
      score += 22;
      details.push("Длина не менее 8 символов.");
    } else {
      score += length * 2;
      details.push("Пароль короче 8 символов.");
    }

    if (length >= 12) {
      score += 14;
      details.push("Бонус за длину 12+.");
    }

    if (length >= 16) {
      score += 10;
      details.push("Дополнительный бонус за длину 16+.");
    }

    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);

    const varietyCount = [hasLower, hasUpper, hasDigit, hasSymbol].filter(Boolean).length;
    score += varietyCount * 12;
    details.push(`Бонус за разнообразие символов: ${varietyCount}/4.`);

    const uniqueRatio = countUniqueChars(password) / length;
    score += Math.round(uniqueRatio * 10);

    const repeatedChars = countRepeats(password);
    if (repeatedChars > 0) {
      const penalty = Math.min(18, repeatedChars * 2);
      score -= penalty;
      details.push(`Штраф за повторы: -${penalty}.`);
    }

    const lower = password.toLowerCase();
    if (hasSequence(lower)) {
      score -= 16;
      details.push("Штраф за простые последовательности: -16.");
    }

    for (const word of BAD_WORDS) {
      if (lower.includes(word)) {
        score -= 20;
        details.push(`Штраф за слабое слово '${word}': -20.`);
        break;
      }
    }

    score = clamp(score, 0, 100);

    let label = "Слабый";
    if (score >= 70) {
      label = "Надёжный";
    } else if (score >= 40) {
      label = "Средний";
    }

    return {
      score,
      label,
      details
    };
  }

  ns.calculateStrength = calculateStrength;
})(window.PasswordLab);
