/*!
 * 爱发电 · 全站共用小浮窗（B 站风格）
 * 唯一数据源：https://apple-pc.github.io/macl/afd-float.js
 * 接入方式：在页面 </body> 前加一行
 *   <script defer src="https://apple-pc.github.io/macl/afd-float.js"></script>
 * 本脚本加载时会自动移除旧的 .afd-bar / .afd-modal 旧挂件。
 */
(function () {
  'use strict';

  var AFD_URL = 'https://afdian.com/a/apple-pc';

  // 移除旧的「爱发电」橙色模板挂件（固定底栏 + 弹窗 + 驱动脚本）
  // 注意：只精确匹配旧挂件的类名/id，切勿用 [id^="afd"] 这类通配，
  // 否则会误伤本浮窗的根节点 #afdf-root（同样以 afd 开头）。
  function removeOld() {
    try {
      var nodes = document.querySelectorAll(
        '.afd-bar, .afd-modal, .afd-card, .afd-go, .afd-link, #afdModal, #afdClose, #afdBtn'
      );
      for (var i = 0; i < nodes.length; i++) {
        if (nodes[i] && nodes[i].parentNode) nodes[i].parentNode.removeChild(nodes[i]);
      }
    } catch (e) {}
    try {
      var scripts = document.querySelectorAll('script');
      for (var j = 0; j < scripts.length; j++) {
        var t = scripts[j].textContent || '';
        if (t.indexOf('afdModal') > -1 || t.indexOf('afd_dismissed') > -1 || t.indexOf('afd-show') > -1) {
          if (scripts[j].parentNode) scripts[j].parentNode.removeChild(scripts[j]);
        }
      }
    } catch (e) {}
  }

  // 依据系统/页面背景判断深色还是浅色，默认深色（多数站点为暗色）
  function isDark() {
    try {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return true;
      var bg = (getComputedStyle(document.body).backgroundColor) || '';
      var m = bg.match(/\d+/g);
      if (m && m.length >= 3) {
        var lum = 0.299 * (+m[0]) + 0.587 * (+m[1]) + 0.114 * (+m[2]);
        return lum < 140;
      }
    } catch (e) {}
    return true;
  }

  var HEART = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M12 21s-7.5-4.6-10-9.2C.4 8.3 1.7 4.8 5 4.1c2-.4 3.8.6 4.9 2.1.5.7.9 1.3 1.1 1.6.2-.3.6-.9 1.1-1.6C13.2 4.7 15 3.7 17 4.1c3.3.7 4.6 4.2 3 7.7C19.5 16.4 12 21 12 21z"/></svg>';

  function build() {
    removeOld();
    if (document.getElementById('afdf-root')) return;

    var dark = isDark();

    var style = document.createElement('style');
    style.textContent = [
      '#afdf-root{position:fixed;right:22px;bottom:22px;z-index:2147483640;font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",system-ui,sans-serif;}',
      '#afdf-root *{box-sizing:border-box;}',
      '.afdf-fab{width:54px;height:54px;border:none;border-radius:50%;background:#FB7299;color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 8px 22px rgba(251,114,153,.42);transition:transform .18s ease, box-shadow .18s ease;margin-left:auto;}',
      '.afdf-fab:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(251,114,153,.5);}',
      '.afdf-fab:active{transform:translateY(0);}',
      '.afdf-card{position:absolute;right:0;bottom:66px;width:284px;max-width:calc(100vw - 32px);padding:18px 18px 16px;border-radius:18px;text-align:left;opacity:0;transform:translateY(8px) scale(.96);transform-origin:bottom right;pointer-events:none;transition:opacity .18s ease, transform .18s ease;}',
      '#afdf-root.afdf-open .afdf-card{opacity:1;transform:translateY(0) scale(1);pointer-events:auto;}',
      '.afdf-card-head{display:flex;align-items:center;gap:8px;margin-bottom:10px;}',
      '.afdf-heart{width:24px;height:24px;color:#FB7299;display:flex;align-items:center;justify-content:center;}',
      '.afdf-title{font-size:15px;font-weight:700;}',
      '.afdf-text{font-size:13px;line-height:1.6;margin:0 0 14px;}',
      '.afdf-btn{display:block;text-align:center;text-decoration:none;font-size:14px;font-weight:600;padding:10px 14px;border-radius:12px;background:#FB7299;color:#fff;transition:filter .15s ease;}',
      '.afdf-btn:hover{filter:brightness(1.06);}',
      '#afdf-root.afdf-dark .afdf-card{background:#1f2233;color:#e9e9f2;border:1px solid rgba(255,255,255,.08);box-shadow:0 16px 44px rgba(0,0,0,.42);}',
      '#afdf-root.afdf-dark .afdf-title{color:#fff;}',
      '#afdf-root.afdf-dark .afdf-text{color:rgba(233,233,242,.7);}',
      '#afdf-root.afdf-light .afdf-card{background:#fff;color:#2b2b33;border:1px solid rgba(0,0,0,.08);box-shadow:0 16px 44px rgba(0,0,0,.16);}',
      '#afdf-root.afdf-light .afdf-title{color:#1c1c22;}',
      '#afdf-root.afdf-light .afdf-text{color:#5d5d68;}',
      '@media (max-width:520px){#afdf-root{right:14px;bottom:14px;}}'
    ].join('');
    (document.head || document.documentElement).appendChild(style);

    var root = document.createElement('div');
    root.id = 'afdf-root';
    root.className = 'afdf-' + (dark ? 'dark' : 'light');
    root.innerHTML =
      '<div class="afdf-card" role="dialog" aria-label="爱发电支持">' +
        '<div class="afdf-card-head"><span class="afdf-heart">' + HEART + '</span><span class="afdf-title">爱发电</span></div>' +
        '<p class="afdf-text">如果这个项目对你有帮助，欢迎来爱发电支持我，让创作继续下去。</p>' +
        '<a class="afdf-btn" href="' + AFD_URL + '" target="_blank" rel="noopener">前往爱发电</a>' +
      '</div>' +
      '<button class="afdf-fab" type="button" aria-label="爱发电支持" aria-expanded="false">' + HEART + '</button>';

    document.body.appendChild(root);

    var fab = root.querySelector('.afdf-fab');
    fab.addEventListener('click', function () {
      var open = root.classList.toggle('afdf-open');
      fab.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', function (e) {
      if (root.classList.contains('afdf-open') && !root.contains(e.target)) {
        root.classList.remove('afdf-open');
        fab.setAttribute('aria-expanded', 'false');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
