// Назначение файла: генерирует пароли с настраиваемыми параметрами с использованием crypto.getRandomValues.

window.PasswordLab = window.PasswordLab || {};

(function initGeneratorModule(ns) {
  const CHARSETS = {
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    digits: "0123456789",
    symbols: "!@#$%^&*"
  };

  const SIMILAR_CHARS = /[O0Il1]/g;

  function getSecureRandomInt(maxExclusive) {
    if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
      throw new Error("Некорректный диапазон случайного числа.");
    }

    const maxUint = 0xffffffff;
    const limit = maxUint - ((maxUint + 1) % maxExclusive);
    const randomBuffer = new Uint32Array(1);

    while (true) {
      crypto.getRandomValues(randomBuffer);
      const randomValue = randomBuffer[0];
      if (randomValue <= limit) {
        return randomValue % maxExclusive;
      }
    }
  }

  function filterSimilar(value, excludeSimilar) {
    if (!excludeSimilar) {
      return value;
    }

    return value.replace(SIMILAR_CHARS, "");
  }

  function buildAlphabet(options) {
    const selected = [];

    if (options.lowercase) {
      selected.push(filterSimilar(CHARSETS.lowercase, options.excludeSimilar));
    }
    if (options.uppercase) {
      selected.push(filterSimilar(CHARSETS.uppercase, options.excludeSimilar));
    }
    if (options.digits) {
      selected.push(filterSimilar(CHARSETS.digits, options.excludeSimilar));
    }
    if (options.symbols) {
      selected.push(CHARSETS.symbols);
    }

    const alphabet = selected.join("");
    return Array.from(new Set(alphabet.split(""))).join("");
  }

  function generatePassword(length, options) {
    if (!Number.isInteger(length) || length < 6 || length > 64) {
      throw new Error("Длина пароля должна быть от 6 до 64 символов.");
    }

    const alphabet = buildAlphabet(options);
    if (!alphabet) {
      throw new Error("Выберите хотя бы один набор символов.");
    }

    if (options.noRepeats && length > alphabet.length) {
      throw new Error(
        `Режим «без повторов» включен, но длина (${length}) больше числа уникальных символов (${alphabet.length}).`
      );
    }

    const chars = alphabet.split("");
    let generated = "";

    if (options.noRepeats) {
      const available = [...chars];

      for (let i = 0; i < length; i += 1) {
        const index = getSecureRandomInt(available.length);
        generated += available[index];
        available.splice(index, 1);
      }

      return generated;
    }

    for (let i = 0; i < length; i += 1) {
      const index = getSecureRandomInt(chars.length);
      generated += chars[index];
    }

    return generated;
  }

  ns.buildAlphabet = buildAlphabet;
  ns.generatePassword = generatePassword;
})(window.PasswordLab);
