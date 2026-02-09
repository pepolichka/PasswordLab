// Назначение файла: рисует двухслойный фон Matrix rain через canvas и requestAnimationFrame.

window.PasswordLab = window.PasswordLab || {};

(function initMatrixModule(ns) {
  function getSecureRandomInt(maxExclusive) {
    if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
      throw new Error("Некорректный диапазон случайного числа.");
    }

    const maxUint = 0xffffffff;
    const limit = maxUint - ((maxUint + 1) % maxExclusive);
    const randomBuffer = new Uint32Array(1);

    while (true) {
      crypto.getRandomValues(randomBuffer);
      const value = randomBuffer[0];
      if (value <= limit) {
        return value % maxExclusive;
      }
    }
  }

  function createLayer(canvas, config) {
    const ctx = canvas.getContext("2d");
    const state = {
      columns: [],
      lastFrameTime: 0
    };

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const columnCount = Math.ceil(canvas.width / config.fontSize);
      state.columns = Array.from({ length: columnCount }, () => getSecureRandomInt(40));
    }

    function pickChar() {
      return config.chars[getSecureRandomInt(config.chars.length)];
    }

    function drawFrame(timestamp) {
      if (!ctx) return;

      if (timestamp - state.lastFrameTime < config.frameInterval) {
        requestAnimationFrame(drawFrame);
        return;
      }

      state.lastFrameTime = timestamp;

      ctx.fillStyle = config.fadeFill;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = config.color;
      ctx.font = `${config.fontSize}px monospace`;

      for (let i = 0; i < state.columns.length; i += 1) {
        const x = i * config.fontSize;
        const y = state.columns[i] * config.fontSize;

        ctx.fillText(pickChar(), x, y);

        if (y > canvas.height && getSecureRandomInt(100) > config.resetThreshold) {
          state.columns[i] = 0;
        } else {
          state.columns[i] += config.speed;
        }
      }

      requestAnimationFrame(drawFrame);
    }

    resize();
    requestAnimationFrame(drawFrame);

    return {
      resize
    };
  }

  function startMatrixRain(mainCanvas, depthCanvas) {
    const chars = "01ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&*+-<>[]{}";

    const mainLayer = createLayer(mainCanvas, {
      chars,
      fontSize: 14,
      speed: 0.9,
      frameInterval: 34,
      color: "rgba(90, 255, 167, 0.95)",
      fadeFill: "rgba(0, 0, 0, 0.10)",
      resetThreshold: 96
    });

    const depthLayer = createLayer(depthCanvas, {
      chars,
      fontSize: 22,
      speed: 0.45,
      frameInterval: 55,
      color: "rgba(73, 205, 136, 0.65)",
      fadeFill: "rgba(0, 0, 0, 0.13)",
      resetThreshold: 98
    });

    function onResize() {
      mainLayer.resize();
      depthLayer.resize();
    }

    window.addEventListener("resize", onResize);
  }

  ns.startMatrixRain = startMatrixRain;
})(window.PasswordLab);
