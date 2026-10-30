/* ==========================================================================
   MCOM — 站点动效
   原则：所有滚动计算合并进一个 rAF 循环；尊重 prefers-reduced-motion。
   ========================================================================== */

(() => {
  "use strict";

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const clamp = (v, min = 0, max = 1) => Math.min(Math.max(v, min), max);

  /* ------------------------------------------------------------ 进入视口渐显 */

  const revealTargets = $$("[data-reveal]");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("in"));
  }

  /* ------------------------------------------------------------ 数字滚动 */

  function animateNumber(el) {
    const target = parseFloat(el.dataset.target || "0");
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const duration = 1500;
    const start = performance.now();

    const tick = (now) => {
      const t = clamp((now - start) / duration);
      // easeOutExpo
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      el.textContent = (target * eased).toFixed(decimals);
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = target.toFixed(decimals);
    };
    requestAnimationFrame(tick);
  }

  const counterObserver = "IntersectionObserver" in window
    ? new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            animateNumber(entry.target);
            counterObserver.unobserve(entry.target);
          }
        },
        { threshold: 0.6 }
      )
    : null;

  const numberNodes = $$("[data-target]");
  if (counterObserver) {
    // 逐个观察数字本身：卡片容器可能比视口高，按容器比例判定会漏掉
    numberNodes.forEach((el) => counterObserver.observe(el));
  } else {
    numberNodes.forEach((el) => {
      el.textContent = parseFloat(el.dataset.target || "0").toFixed(
        parseInt(el.dataset.decimals || "0", 10)
      );
    });
  }

  /* ------------------------------------------------------------ 滚动驱动的位移 */

  const nav = $(".nav");
  const heroInner = $(".hero-inner");
  const heroStage = $(".hero-stage");
  const watermark = $(".cta-watermark");
  const techSection = $(".tech");
  const techBar = $(".tech-progress i");
  const techItems = $$(".tech-item");

  let ticking = false;

  function measure() {
    ticking = false;
    const y = window.scrollY;

    // 导航栏：滚动后加深
    if (nav) nav.classList.toggle("scrolled", y > 24);

    if (reduce) return;

    // 首屏：文字淡出上移，产品窗口放大并轻微上浮（苹果式的「推近镜头」）
    if (heroInner) {
      const p = clamp(y / 640);
      heroInner.style.transform = `translate3d(0, ${p * -80}px, 0)`;
      heroInner.style.opacity = String(clamp(1 - p * 1.25));
    }
    if (heroStage) {
      const p = clamp((y - 40) / 720);
      heroStage.style.transform = `translate3d(0, ${p * -26}px, 0) scale(${1 + p * 0.055})`;
    }

    // 技术段：左侧进度条 + 当前条目高亮
    if (techSection && techBar && techItems.length) {
      const rect = techSection.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const progress = clamp(-rect.top / Math.max(total, 1));
      techBar.style.width = `${progress * 100}%`;

      const mid = window.innerHeight * 0.45;
      let closest = null;
      let best = Infinity;
      for (const item of techItems) {
        const r = item.getBoundingClientRect();
        const center = r.top + r.height / 2;
        const dist = Math.abs(center - mid);
        if (dist < best) {
          best = dist;
          closest = item;
        }
      }
      techItems.forEach((item) => item.classList.toggle("active", item === closest));
    }

    // CTA 水印：随滚动缓慢上移
    if (watermark) {
      const rect = watermark.parentElement.getBoundingClientRect();
      const p = clamp(1 - rect.top / window.innerHeight);
      watermark.style.transform = `translate3d(-50%, ${-40 + p * 40}px, 0)`;
    }
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(measure);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  measure();

  /* ------------------------------------------------------------ 首屏光晕跟随鼠标 */

  const glow = $(".hero-glow");
  if (glow && !reduce && matchMedia("(hover: hover)").matches) {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let raf = null;

    const loop = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      glow.style.transform = `translate3d(calc(-50% + ${currentX}px), ${currentY}px, 0)`;
      if (Math.abs(targetX - currentX) > 0.5 || Math.abs(targetY - currentY) > 0.5) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = null;
      }
    };

    window.addEventListener(
      "pointermove",
      (event) => {
        targetX = (event.clientX / window.innerWidth - 0.5) * 90;
        targetY = (event.clientY / window.innerHeight - 0.5) * 50;
        if (!raf) raf = requestAnimationFrame(loop);
      },
      { passive: true }
    );
  }

  /* ------------------------------------------------------------ 复制命令 */

  $$("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const text = btn.dataset.copy || "";
      try {
        await navigator.clipboard.writeText(text);
        const original = btn.textContent;
        btn.textContent = "已复制";
        setTimeout(() => (btn.textContent = original), 1600);
      } catch {
        // 剪贴板不可用时选中文本，让用户自己复制
        const range = document.createRange();
        range.selectNodeContents(btn.parentElement);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
    });
  });
})();
