(function () {
  var bar = document.getElementById('bar');
  var close = document.getElementById('bar-close');
  if (bar && close) close.addEventListener('click', function () { bar.remove(); });

  var today = new Date().toISOString().slice(0, 10);
  document.querySelectorAll('input[type=date]').forEach(function (i) { i.min = today; });

  // "Book a Free Call" and "Book Free Taster Session" preselect the booking type
  var type = document.getElementById('btype');
  document.querySelectorAll('[data-type]').forEach(function (a) {
    a.addEventListener('click', function () { if (type) type.value = a.dataset.type; });
  });

  // Submit the Netlify forms without leaving the page
  document.querySelectorAll('form[data-netlify]').forEach(function (f) {
    f.addEventListener('submit', async function (e) {
      e.preventDefault();
      var msg = f.querySelector('.msg');
      var btn = f.querySelector('button');
      btn.disabled = true;
      msg.className = 'msg';
      msg.textContent = 'Sending…';
      try {
        var res = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(new FormData(f)).toString()
        });
        if (!res.ok) throw new Error(res.status);
        f.reset();
        msg.className = 'msg ok';
        msg.textContent = f.dataset.ok;
      } catch (err) {
        msg.className = 'msg err';
        msg.textContent = 'That didn’t send. Check your connection and try again.';
      }
      btn.disabled = false;
    });
  });
})();
