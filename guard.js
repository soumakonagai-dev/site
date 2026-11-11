// 学校の端末をはじく（Chromebook など、学校でよく使われる端末のとき、サイトの中身を出さない）
// ※ 端末が「学校のものか」を正確に知る方法はないため、見分けられるものだけ止める
(function () {
  // 以前の「ランダムID」は使わなくなったので、端末に残っていたら消す
  try { localStorage.removeItem('sgl-id'); } catch (e) {}

  var ua = navigator.userAgent || '';
  var uad = navigator.userAgentData;
  var isChromebook = /\bCrOS\b/.test(ua) || (uad && /chrome\s?os|chromium os/i.test(uad.platform || ''));
  if (!isChromebook) return;

  try { window.stop(); } catch (e) {}
  document.title = 'このサイトは使えません';
  var html = '<div style="position:fixed;inset:0;z-index:2147483647;background:#0b1020;color:#e8ecff;display:flex;align-items:center;justify-content:center;padding:16px;font-family:\'Hiragino Kaku Gothic ProN\',\'Yu Gothic UI\',\'Meiryo\',sans-serif">' +
    '<div style="max-width:30em;border:3px solid #ff6b6b;background:#151d3a;box-shadow:6px 6px 0 #000;padding:26px 22px;line-height:1.8;text-align:center">' +
    '<p style="margin:0 0 10px;font-size:22px;font-weight:bold;color:#ff6b6b">学校の端末では遊べません</p>' +
    '<p style="margin:0;font-size:16px">この端末（Chromebook）では、このサイトは使えないようにしています。<br>おうちの端末で遊んでね。</p></div></div>';
  document.documentElement.style.background = '#0b1020';
  // <head> の中で動いたときは <body> がまだ無いので、自分で作る
  if (!document.body) document.documentElement.appendChild(document.createElement('body'));
  document.body.style.cssText = 'margin:0;overflow:hidden';
  document.body.innerHTML = html;
})();
