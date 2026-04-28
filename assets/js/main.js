
/* ── CANVAS ── */
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let W, H, nodes = [];
function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
window.addEventListener('resize', () => { resize(); initNodes(); });
function initNodes() {
nodes = [];
const count = Math.floor((W * H) / 18000);
for (let i = 0; i < count; i++) {
    nodes.push({ x: Math.random()*W, y: Math.random()*H, vx:(Math.random()-0.5)*0.35, vy:(Math.random()-0.5)*0.35, r:Math.random()*1.8+0.4, opacity:Math.random()*0.5+0.15 });
}
}
function draw() {
ctx.clearRect(0,0,W,H);
const bg = ctx.createLinearGradient(0,0,W,H);
bg.addColorStop(0,'#040f24'); bg.addColorStop(0.5,'#060d1e'); bg.addColorStop(1,'#03080f');
ctx.fillStyle = bg; ctx.fillRect(0,0,W,H);
for (let i=0;i<nodes.length;i++) for (let j=i+1;j<nodes.length;j++) {
    const dx=nodes[i].x-nodes[j].x, dy=nodes[i].y-nodes[j].y, d=Math.sqrt(dx*dx+dy*dy);
    if (d<140) { ctx.beginPath(); ctx.strokeStyle=`rgba(26,111,196,${0.12*(1-d/140)})`; ctx.lineWidth=0.6; ctx.moveTo(nodes[i].x,nodes[i].y); ctx.lineTo(nodes[j].x,nodes[j].y); ctx.stroke(); }
}
nodes.forEach(n => { ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2); ctx.fillStyle=`rgba(168,216,240,${n.opacity})`; ctx.fill(); n.x+=n.vx; n.y+=n.vy; if(n.x<0||n.x>W)n.vx*=-1; if(n.y<0||n.y>H)n.vy*=-1; });
requestAnimationFrame(draw);
}
resize(); initNodes(); draw();

/* ── SCROLL REVEALS ── */
const revealObs = new IntersectionObserver((entries) => {
entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); } });
}, { threshold: 0.1 });

document.querySelectorAll('[data-card]').forEach((c, i) => {
const obs2 = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { setTimeout(() => e.target.classList.add('visible'), i*150); obs2.unobserve(e.target); } });
}, { threshold: 0.15 });
obs2.observe(c);
});
document.querySelectorAll('[data-reveal], [data-reveal-side]').forEach(el => revealObs.observe(el));

/* ── CARD NUMBER FORMAT ── */
document.getElementById('card-num-input').addEventListener('input', function() {
let v = this.value.replace(/\D/g,'').substring(0,16);
this.value = v.replace(/(.{4})/g,'$1  ').trim();
const net = document.getElementById('card-network');
if (v.startsWith('4')) net.textContent = 'VISA';
else if (v.startsWith('5')) net.textContent = 'MC';
else if (v.startsWith('3')) net.textContent = 'AMEX';
else net.textContent = 'VISA / MC';
});

/* ── EXPIRY FORMAT ── */
document.getElementById('expiry-input').addEventListener('input', function() {
let v = this.value.replace(/\D/g,'').substring(0,4);
if (v.length >= 3) v = v.substring(0,2) + ' / ' + v.substring(2);
this.value = v;
});

/* ── PACKAGE SELECTOR ── */
const pkgData = {
'1': { sub: '$55.99',  disc: '−$90.47',   ship: 'FREE', total: '$55.99'  },
'6': { sub: '$275.94', disc: '−$220.47',  ship: 'FREE', total: '$275.94' },
'3': { sub: '$149.97', disc: '−$136.47',  ship: 'FREE', total: '$149.97' },
};
document.querySelectorAll('#pkg-options .pkg-opt').forEach(opt => {
opt.addEventListener('click', () => {
    document.querySelectorAll('#pkg-options .pkg-opt').forEach(o => o.classList.remove('active'));
    opt.classList.add('active');
    opt.querySelector('input').checked = true;
    const qty = opt.dataset.qty;
    document.getElementById('s-sub').textContent   = pkgData[qty].sub;
    document.getElementById('s-disc').textContent  = pkgData[qty].disc;
    document.getElementById('s-ship').textContent  = pkgData[qty].ship;
    document.getElementById('s-total').textContent = pkgData[qty].total;
});
});

/* ── INLINE VALIDATION ── */
function validate(fieldId, inputEl, type) {
const wrap = document.getElementById(fieldId);
if (!wrap) return;
const msg = wrap.querySelector('.field-msg');
let valid = false, message = '';
const v = inputEl.value.trim();
if (type === 'text')  { valid = v.length >= 2; message = valid ? '✓ Looks good' : 'Required (min 2 chars)'; }
if (type === 'email') { valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); message = valid ? '✓ Valid email' : 'Enter a valid email address'; }
if (type === 'tel')   { valid = v.replace(/\D/g,'').length >= 10; message = valid ? '✓ Valid number' : 'Enter at least 10 digits'; }
if (type === 'zip')   { valid = /^\d{5}(-\d{4})?$/.test(v); message = valid ? '✓ Valid ZIP' : 'Enter a valid ZIP code'; }
if (type === 'select'){ valid = v !== ''; message = valid ? '✓ Selected' : 'Please select a state'; }
wrap.classList.toggle('valid', valid);
wrap.classList.toggle('invalid', !valid && v.length > 0);
if (msg) msg.textContent = message;
}

const validationMap = [
['f-fname',['input','text']], ['f-lname',['input','text']], ['f-email',['input','email']],
['f-phone',['input','tel']], ['f-addr1',['input','text']], ['f-city',['input','text']],
['f-state',['select','select']], ['f-zip',['input','zip']], ['f-cname',['input','text']],
];
validationMap.forEach(([id,[tag,type]]) => {
const wrap = document.getElementById(id);
if (!wrap) return;
const el = wrap.querySelector(tag);
if (el) el.addEventListener('blur', () => validate(id, el, type));
});

/* ── SUBMIT ── */
document.getElementById('submit-btn').addEventListener('click', () => {
const consent = document.getElementById('consent-check');
if (!consent.checked) {
    consent.closest('label').style.outline = '1px solid var(--error)';
    setTimeout(() => consent.closest('label').style.outline = '', 2000);
    return;
}
const btn = document.getElementById('submit-btn');
btn.textContent = 'Processing…';
btn.style.opacity = '0.7';
btn.style.cursor = 'not-allowed';
setTimeout(() => {
    btn.textContent = '✓ Order Placed — Check Your Email';
    btn.style.background = 'linear-gradient(90deg, #0d6e4e, #1ab87c)';
    btn.style.opacity = '1';
}, 2200);
});

/* FAQ + Testimonial init deferred — HTML not yet parsed at this point */
/* See the final <script> block at the bottom of the file */








/* ══════════════════════════════════════════
    ALL DEFERRED INIT — runs after full DOM
══════════════════════════════════════════ */

/* ── CHART BAR ANIMATION ── */
const chartObs = new IntersectionObserver((entries) => {
entries.forEach(e => {
    if (e.isIntersecting) {
    e.target.querySelectorAll('.chart-bar-fill').forEach((bar, i) => {
        setTimeout(() => bar.classList.add('animate'), i * 200);
    });
    chartObs.unobserve(e.target);
    }
});
}, { threshold: 0.4 });
const chartPanel = document.getElementById('chart-panel');
if (chartPanel) chartObs.observe(chartPanel);

/* ── NEWSLETTER SUBMIT ── */
document.getElementById('nl-btn').addEventListener('click', () => {
const inp = document.getElementById('nl-email');
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value)) {
    inp.style.borderColor = 'var(--error)';
    setTimeout(() => inp.style.borderColor = '', 2000);
    return;
}
const btn = document.getElementById('nl-btn');
btn.textContent = '✓ Subscribed!';
btn.style.background = 'linear-gradient(90deg,#0d6e4e,#1ab87c)';
inp.value = ''; inp.disabled = true; btn.disabled = true;
});

/* ── GENERIC SCROLL REVEAL ── */
const genObs = new IntersectionObserver((entries) => {
entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); genObs.unobserve(e.target); }
});
}, { threshold: 0.08 });
document.querySelectorAll('.reveal, .reveal-l, .reveal-r').forEach(el => genObs.observe(el));

/* ── COUNTER ANIMATION ── */
function animateCounter(el) {
const target = parseFloat(el.dataset.target);
const suffix = el.dataset.suffix || '';
const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
const duration = 2000;
const start = performance.now();
function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = (target * eased).toFixed(decimals) + suffix;
    if (progress < 1) requestAnimationFrame(step);
}
requestAnimationFrame(step);
}
const counterObs = new IntersectionObserver((entries) => {
entries.forEach(e => {
    if (e.isIntersecting) {
    e.target.querySelectorAll('[data-target]').forEach(animateCounter);
    counterObs.unobserve(e.target);
    }
});
}, { threshold: 0.4 });
document.querySelectorAll('.about-stats').forEach(el => counterObs.observe(el));

/* ── FAQ ACCORDION ── */
document.querySelectorAll('.faq-item').forEach(item => {
item.querySelector('.faq-q').addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    // close all
    document.querySelectorAll('.faq-item').forEach(i => {
    i.classList.remove('open');
    const a = i.querySelector('.faq-a');
    if (a) a.style.maxHeight = '0px';
    });
    // open clicked if it was closed
    if (!isOpen) {
    item.classList.add('open');
    const a = item.querySelector('.faq-a');
    if (a) a.style.maxHeight = a.scrollHeight + 'px';
    }
});
});
// Init: open the first FAQ item on load
const firstFaq = document.querySelector('.faq-item.open');
if (firstFaq) {
const a = firstFaq.querySelector('.faq-a');
if (a) a.style.maxHeight = a.scrollHeight + 'px';
}

/* ── TESTIMONIAL SLIDER ── */
const tCards = document.querySelectorAll('.tcard');
const tDots  = document.querySelectorAll('.t-dot');
let tIdx = 0;
let tAutoplay;

function showTestimonial(n) {
const prev = tIdx;
tIdx = (n + tCards.length) % tCards.length;

tCards.forEach((c, i) => {
    c.classList.remove('t-active', 't-prev');
    if (i === tIdx) c.classList.add('t-active');
    else if (i === prev) c.classList.add('t-prev');
});

tDots.forEach((d, i) => {
    d.classList.toggle('active', i === tIdx);
});
}

function startAutoplay() {
clearInterval(tAutoplay);
tAutoplay = setInterval(() => showTestimonial(tIdx + 1), 6000);
}

const prevBtn = document.getElementById('t-prev');
const nextBtn = document.getElementById('t-next');

if (prevBtn) {
prevBtn.addEventListener('click', () => {
    showTestimonial(tIdx - 1);
    startAutoplay();
});
}
if (nextBtn) {
nextBtn.addEventListener('click', () => {
    showTestimonial(tIdx + 1);
    startAutoplay();
});
}

tDots.forEach((d, i) => {
d.addEventListener('click', () => {
    showTestimonial(i);
    startAutoplay();
});
});

// Init first card
if (tCards.length) {
tCards[0].classList.add('t-active');
startAutoplay();
}











/* ══════════════════════════════════════════
     LAB REPORT MODAL
══════════════════════════════════════════ */





(function () {
  /* ════════════════════════════════
     LAB REPORT MODAL
  ════════════════════════════════ */
  const overlay   = document.getElementById('lab-modal-overlay');
  const closeBtn  = document.getElementById('lab-modal-close');
  const closeText = document.getElementById('lab-action-close');

  // The hero button — update your button to have this id
  const labBtn    = document.getElementById('lab-report-btn');

  function openModal() {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    // Reset modal scroll
    const body = overlay.querySelector('.lab-modal-body');
    if (body) body.scrollTop = 0;
  }

  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (labBtn)    labBtn.addEventListener('click',    openModal);
  if (closeBtn)  closeBtn.addEventListener('click',  closeModal);
  if (closeText) closeText.addEventListener('click', closeModal);

  // Click backdrop to close
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // ESC key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
  });

  /* ════════════════════════════════
     URGENCY BAR — ANIMATED COUNTERS
     + LIVE FLUCTUATION
  ════════════════════════════════ */
  // Animate progress bar on scroll into view
  const urgencyObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        setTimeout(() => {
          document.getElementById('urgency-fill')?.classList.add('animate');
        }, 300);
        urgencyObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  const urgencyBar = document.querySelector('[data-urgency]');
  if (urgencyBar) urgencyObs.observe(urgencyBar);

  // Live fluctuating viewer count
  const viewerEl = document.getElementById('viewer-count');
  const soldEl   = document.getElementById('sold-count');
  let   viewers  = 47;
  let   sold     = 12;

  if (viewerEl) {
    setInterval(() => {
      // Random ±1–3 drift, clamped to realistic range
      const delta = Math.floor(Math.random() * 5) - 2;
      viewers = Math.max(38, Math.min(72, viewers + delta));
      // Animate the number change
      viewerEl.style.transform = 'translateY(-4px)';
      viewerEl.style.opacity   = '0.4';
      viewerEl.style.transition = 'transform 0.2s, opacity 0.2s';
      setTimeout(() => {
        viewerEl.textContent = viewers;
        viewerEl.style.transform = 'translateY(0)';
        viewerEl.style.opacity   = '1';
      }, 200);
    }, 5000);
  }

  // Slowly tick up sold count
  if (soldEl) {
    setInterval(() => {
      if (Math.random() > 0.6) {
        sold++;
        soldEl.style.transform = 'scale(1.3)';
        soldEl.style.transition = 'transform 0.25s';
        soldEl.textContent = sold;
        setTimeout(() => {
          soldEl.style.transform = 'scale(1)';
        }, 250);
      }
    }, 18000);
  }
})();







(function () {
  /* animate bar on scroll */
  const fill = document.getElementById('uv4-fill');
  const wrap = document.querySelector('[data-uv4]');
  if (wrap && fill) {
    new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          setTimeout(() => fill.classList.add('animate'), 250);
        }
      });
    }, { threshold: 0.6 }).observe(wrap);
  }

  /* live viewer drift */
  let v = 47;
  const vEl = document.getElementById('uv4-viewers');
  function tickV() {
    v = Math.max(33, Math.min(74, v + (Math.random() > 0.5 ? 1 : -1)));
    if (vEl) {
      vEl.style.transition = 'opacity .18s';
      vEl.style.opacity = '0.3';
      setTimeout(() => { vEl.textContent = v; vEl.style.opacity = '1'; }, 180);
    }
    setTimeout(tickV, 4000 + Math.random() * 2500);
  }
  setTimeout(tickV, 5000);

  /* sold slow tick */
  let s = 12;
  const sEl = document.getElementById('uv4-sold');
  function tickS() {
    if (Math.random() > 0.5 && sEl) {
      s++;
      sEl.style.transition = 'opacity .18s';
      sEl.style.opacity = '0.3';
      setTimeout(() => { sEl.textContent = s; sEl.style.opacity = '1'; }, 180);
    }
    setTimeout(tickS, 16000 + Math.random() * 12000);
  }
  setTimeout(tickS, 16000);
})();







/* ══════════════════════════════════════════
     DYNAMIC PRICING IN PRICING SECTION
══════════════════════════════════════════ */


// document.querySelectorAll('[data-card]').forEach(card => {
//   const radios = card.querySelectorAll('input[type="radio"]');
//   const priceEl = card.querySelector('.card-price-num');
//   const totalEl = card.querySelector('.card-total');

//   const oncePrice = parseFloat(card.dataset.oncePrice);
//   const subPrice = parseFloat(card.dataset.subPrice);
//   const onceTotal = parseFloat(card.dataset.totalOnce);
//   const subTotal = parseFloat(card.dataset.totalSub);

//   radios.forEach(radio => {
//     radio.addEventListener('change', () => {
//       if (radio.value === 'once') {
//         priceEl.textContent = oncePrice.toFixed(2);
//         totalEl.textContent = `Total: $${onceTotal.toFixed(2)} USD`;
//       } else {
//         priceEl.textContent = subPrice.toFixed(2);
//         totalEl.textContent = `Total: $${subTotal.toFixed(2)} USD`;
//       }
//     });
//   });
// });



document.querySelectorAll('[data-card]').forEach(card => {
  const radios = card.querySelectorAll('input[type="radio"]');
  const priceEl = card.querySelector('.card-price-num');
  const totalEl = card.querySelector('.card-total');
  const savingsEl = card.querySelector('.card-savings span');

  const oncePrice = parseFloat(card.dataset.oncePrice);
  const subPrice = parseFloat(card.dataset.subPrice);
  const onceTotal = parseFloat(card.dataset.totalOnce);
  const subTotal = parseFloat(card.dataset.totalSub);

  const saveOnce = card.dataset.saveOnce;
  const saveSub = card.dataset.saveSub;

  radios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.value === 'once') {
        priceEl.textContent = oncePrice.toFixed(2);
        totalEl.textContent = `Total: $${onceTotal.toFixed(2)} USD`;
        savingsEl.textContent = `$${saveOnce}`;
      } else {
        priceEl.textContent = subPrice.toFixed(2);
        totalEl.textContent = `Total: $${subTotal.toFixed(2)} USD`;
        savingsEl.textContent = `$${saveSub}`;
      }
    });
  });
});