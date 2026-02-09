// Назначение файла: связывает интерфейс с модулями генерации, проверки, оценки силы и хранения истории.

window.PasswordLab = window.PasswordLab || {};

(function initApp(ns) {
  const els = {
    matrixCanvas: document.querySelector("#matrix-bg"),
    matrixCanvasDepth: document.querySelector("#matrix-bg2"),
    lengthInput: document.querySelector("#password-length"),
    lengthValue: document.querySelector("#length-value"),
    generatedInput: document.querySelector("#generated-password"),
    generatorMessage: document.querySelector("#generator-message"),
    copyToast: document.querySelector("#copy-toast"),

    optLowercase: document.querySelector("#opt-lowercase"),
    optUppercase: document.querySelector("#opt-uppercase"),
    optDigits: document.querySelector("#opt-digits"),
    optSymbols: document.querySelector("#opt-symbols"),
    optExcludeSimilar: document.querySelector("#opt-exclude-similar"),
    optNoRepeats: document.querySelector("#opt-no-repeats"),

    btnGenerate: document.querySelector("#btn-generate"),
    btnCopy: document.querySelector("#btn-copy"),

    checkInput: document.querySelector("#check-password"),
    btnCheck: document.querySelector("#btn-check"),
    requirementsList: document.querySelector("#requirements-list"),
    suggestionsList: document.querySelector("#suggestions-list"),
    strengthLabel: document.querySelector("#strength-label"),
    strengthScore: document.querySelector("#strength-score"),
    strengthBar: document.querySelector("#strength-bar"),

    historyList: document.querySelector("#history-list"),
    btnClearHistory: document.querySelector("#btn-clear-history")
  };

  function getGeneratorOptions() {
    return {
      lowercase: els.optLowercase.checked,
      uppercase: els.optUppercase.checked,
      digits: els.optDigits.checked,
      symbols: els.optSymbols.checked,
      excludeSimilar: els.optExcludeSimilar.checked,
      noRepeats: els.optNoRepeats.checked
    };
  }

  function setGeneratorMessage(text, type) {
    els.generatorMessage.textContent = text;
    els.generatorMessage.className = `message ${type || ""}`.trim();
  }

  function renderHistory() {
    const history = ns.getHistory();
    els.historyList.innerHTML = "";

    if (history.length === 0) {
      const item = document.createElement("li");
      item.className = "empty-state";
      item.textContent = "История пуста. Сгенерируйте пароль, чтобы добавить запись.";
      els.historyList.append(item);
      return;
    }

    for (const entry of history) {
      const item = document.createElement("li");
      item.className = "history-item";
      item.setAttribute("role", "button");
      item.tabIndex = 0;
      item.title = "Нажмите, чтобы скопировать пароль";
      item.dataset.password = entry.password;

      const pass = document.createElement("span");
      pass.className = "history-password";
      pass.textContent = ns.maskPassword(entry.password);

      const date = document.createElement("time");
      date.className = "history-date";
      date.dateTime = entry.timestamp;
      date.textContent = new Date(entry.timestamp).toLocaleString("ru-RU");

      item.append(pass, date);
      els.historyList.append(item);
    }
  }

  function showCopyToast() {
    els.copyToast.classList.add("show");
    window.setTimeout(() => {
      els.copyToast.classList.remove("show");
    }, 1100);
  }

  function renderChecks(validation) {
    els.requirementsList.innerHTML = "";
    for (const check of validation.checks) {
      const item = document.createElement("li");
      item.className = check.ok ? "ok" : "fail";
      item.textContent = `${check.ok ? "[OK]" : "[НЕТ]"} ${check.label}`;
      els.requirementsList.append(item);
    }
  }

  function renderSuggestions(validation) {
    els.suggestionsList.innerHTML = "";

    if (validation.suggestions.length === 0) {
      const item = document.createElement("li");
      item.className = "ok";
      item.textContent = "Критичных проблем не найдено. Не передавайте пароль другим людям.";
      els.suggestionsList.append(item);
      return;
    }

    for (const tip of validation.suggestions) {
      const item = document.createElement("li");
      item.textContent = `Совет: ${tip}`;
      els.suggestionsList.append(item);
    }
  }

  function renderStrength(strength) {
    els.strengthLabel.textContent = strength.label;
    els.strengthScore.textContent = `${strength.score}/100`;
    els.strengthBar.style.width = `${strength.score}%`;
  }

  function fallbackCopyText(value) {
    const helper = document.createElement("textarea");
    helper.value = value;
    helper.setAttribute("readonly", "");
    helper.style.position = "absolute";
    helper.style.left = "-9999px";
    document.body.append(helper);
    helper.select();
    helper.setSelectionRange(0, helper.value.length);
    const ok = document.execCommand("copy");
    helper.remove();
    return ok;
  }

  async function copyPassword(value) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return true;
    }

    return fallbackCopyText(value);
  }

  function handleGenerate() {
    const length = Number.parseInt(els.lengthInput.value, 10);

    try {
      const password = ns.generatePassword(length, getGeneratorOptions());
      els.generatedInput.value = password;
      ns.saveToHistory(password);
      renderHistory();
      setGeneratorMessage("Пароль успешно сгенерирован.", "success");
    } catch (error) {
      setGeneratorMessage(error.message || "Не удалось сгенерировать пароль.", "error");
    }
  }

  async function handleCopy() {
    const value = els.generatedInput.value;
    if (!value) {
      setGeneratorMessage("Сначала сгенерируйте пароль.", "error");
      return;
    }

    try {
      const copied = await copyPassword(value);
      if (copied) {
        showCopyToast();
        setGeneratorMessage("Пароль скопирован в буфер обмена.", "success");
      } else {
        setGeneratorMessage("Браузер запретил копирование. Скопируйте пароль вручную.", "error");
      }
    } catch {
      setGeneratorMessage("Браузер запретил копирование. Скопируйте пароль вручную.", "error");
    }
  }

  async function handleHistoryCopy(password) {
    if (!password) return;

    try {
      const copied = await copyPassword(password);
      if (copied) {
        showCopyToast();
        setGeneratorMessage("Пароль из истории скопирован в буфер обмена.", "success");
      } else {
        setGeneratorMessage("Браузер запретил копирование. Скопируйте пароль вручную.", "error");
      }
    } catch {
      setGeneratorMessage("Браузер запретил копирование. Скопируйте пароль вручную.", "error");
    }
  }

  function handleCheck() {
    const password = els.checkInput.value;
    const validation = ns.validatePassword(password);
    const strength = ns.calculateStrength(password);

    renderChecks(validation);
    renderSuggestions(validation);
    renderStrength(strength);
  }

  function initEvents() {
    els.lengthInput.addEventListener("input", () => {
      els.lengthValue.textContent = els.lengthInput.value;
    });

    els.btnGenerate.addEventListener("click", handleGenerate);
    els.btnCopy.addEventListener("click", handleCopy);
    els.btnCheck.addEventListener("click", handleCheck);

    els.checkInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        handleCheck();
      }
    });

    els.btnClearHistory.addEventListener("click", () => {
      ns.clearHistory();
      renderHistory();
      setGeneratorMessage("История очищена.", "success");
    });

    els.historyList.addEventListener("click", (event) => {
      const item = event.target.closest(".history-item");
      if (!item || !els.historyList.contains(item)) return;
      handleHistoryCopy(item.dataset.password);
    });

    els.historyList.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const item = event.target.closest(".history-item");
      if (!item || !els.historyList.contains(item)) return;
      event.preventDefault();
      handleHistoryCopy(item.dataset.password);
    });
  }

  function init() {
    ns.startMatrixRain(els.matrixCanvas, els.matrixCanvasDepth);
    initEvents();
    renderHistory();
    handleCheck();
  }

  init();
})(window.PasswordLab);
