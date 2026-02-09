// Назначение файла: проверяет пароль по правилам безопасности и формирует рекомендации.

window.PasswordLab = window.PasswordLab || {};

(function initValidatorModule(ns) {
  function normalize(password) {
    return String(password || "").trim();
  }

  function validatePassword(password) {
    const value = normalize(password);

    const checks = [
      { id: "length", label: "Длина не менее 8 символов", ok: value.length >= 8 },
      { id: "lowercase", label: "Есть строчные буквы", ok: /[a-z]/.test(value) },
      { id: "uppercase", label: "Есть заглавные буквы", ok: /[A-Z]/.test(value) },
      { id: "digit", label: "Есть цифры", ok: /\d/.test(value) },
      { id: "symbol", label: "Есть спецсимволы (рекомендуется)", ok: /[^A-Za-z0-9]/.test(value) }
    ];

    const lowercase = value.toLowerCase();
    const isCommon = ns.COMMON_PASSWORDS_SET.has(lowercase);

    const suggestions = [];
    if (!checks[0].ok) suggestions.push("Увеличьте длину хотя бы до 8 символов (лучше 12+).");
    if (!checks[1].ok) suggestions.push("Добавьте строчные буквы (a-z).");
    if (!checks[2].ok) suggestions.push("Добавьте заглавные буквы (A-Z).");
    if (!checks[3].ok) suggestions.push("Добавьте минимум одну цифру (0-9).");
    if (!checks[4].ok) suggestions.push("Добавьте символы, например !@#$%^&*.");

    if (isCommon) {
      suggestions.push("Этот пароль есть в списке популярных. Используйте полностью другой пароль.");
    }

    if (value.length > 0 && new Set(value).size <= Math.max(2, value.length / 3)) {
      suggestions.push("Используйте больше уникальных символов и меньше повторов.");
    }

    return {
      checks,
      isCommon,
      suggestions
    };
  }

  ns.validatePassword = validatePassword;
})(window.PasswordLab);
