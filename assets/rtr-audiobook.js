/* Root to Rise — audiobook chapter player (/book/). Without JS the chapter links open the MP3s directly. */
(function () {
  'use strict';
  var box = document.querySelector('[data-rtr-audiobook]');
  if (!box) return;
  var audio = box.querySelector('[data-rtr-ab-audio]');
  var titleEl = box.querySelector('[data-rtr-ab-title]');
  var subEl = box.querySelector('[data-rtr-ab-sub]');
  var tracks = Array.prototype.slice.call(box.querySelectorAll('[data-rtr-ab-track]'));
  if (!audio || !tracks.length) return;
  var current = 0;
  function select(i, play) {
    if (i < 0 || i >= tracks.length) return;
    current = i;
    tracks.forEach(function (t, j) {
      if (j === i) t.setAttribute('aria-current', 'true'); else t.removeAttribute('aria-current');
    });
    var t = tracks[i];
    if (audio.getAttribute('src') !== t.href) audio.setAttribute('src', t.href);
    titleEl.textContent = t.getAttribute('data-title');
    subEl.textContent = t.getAttribute('data-sub');
    if (play) { var p = audio.play(); if (p && p.catch) p.catch(function () {}); }
  }
  tracks.forEach(function (t, i) {
    t.addEventListener('click', function (e) { e.preventDefault(); select(i, true); });
  });
  audio.addEventListener('ended', function () { if (current < tracks.length - 1) select(current + 1, true); });
  select(0, false);
})();
