// GOULDBOURNE.CO.UK | SHARED SITE BEHAVIOUR

function toggleMenu() {
  const btn = document.querySelector('.menu-toggle');
  const menu = document.getElementById('mainMenu');
  if (btn && menu) {
    const isOpen = menu.classList.toggle('active');
    btn.classList.toggle('active', isOpen);
    btn.setAttribute('aria-expanded', String(isOpen));
  }
}

window.addEventListener('scroll', () => {
  document.body.classList.toggle('scrolled', window.scrollY > 200);
});

let scrollPos = 0;
const autoSpeed = 0.55;
let isDragging = false;
let startX, startPos;
let contentWidth = 0;
let animationFrame;

function assetPrefix() {
  const path = window.location.pathname.replace(/\/+$/, '');
  const depth = path.split('/').filter(Boolean).length - 1;
  return depth > 0 ? '../'.repeat(depth) : '';
}

function waitForCarouselImages(container) {
  const images = Array.from(container.querySelectorAll('img'));
  return Promise.all(images.map(image => {
    if (image.complete && image.naturalWidth > 0) {
      return image.decode ? image.decode().catch(() => {}) : Promise.resolve();
    }

    return new Promise(resolve => {
      image.addEventListener('load', resolve, { once: true });
      image.addEventListener('error', resolve, { once: true });
    });
  }));
}

async function loadClients() {
  try {
    const prefix = assetPrefix();
    const res = await fetch(`${prefix}registry/clients.json`);
    if (!res.ok) throw new Error(`Client registry returned ${res.status}`);
    const data = await res.json();
    const clients = data.clients || [];
    const container = document.getElementById('clientScroll');
    if (!container || clients.length === 0) return;

    let html = '';
    for (let loop = 0; loop < 3; loop++) {
      clients.forEach(client => {
        const content = client.logo
          ? `<img src="${prefix}assets/images/clients/${client.logo}" alt="${client.name}" class="client-logo">`
          : `${client.name}`;
        html += `<div class="client-item"><a href="${client.url}" target="_blank" rel="noopener noreferrer">${content}</a></div>`;
      });
    }

    container.innerHTML = html;
    await waitForCarouselImages(container);

    contentWidth = container.scrollWidth / 3;
    scrollPos = 0;
    container.style.transform = 'translateX(0)';
    initCarousel();
  } catch (err) {
    console.error('Error loading clients:', err);
  }
}

function initCarousel() {
  const banner = document.querySelector('.logo-banner');
  const scroll = document.querySelector('.logo-scroll');
  if (!banner || !scroll || !contentWidth) return;

  banner.addEventListener('mouseenter', () => cancelAnimationFrame(animationFrame));
  banner.addEventListener('mouseleave', () => {
    if (!isDragging) startAutoScroll();
  });

  banner.addEventListener('mousedown', e => {
    isDragging = true;
    banner.classList.add('dragging');
    startX = e.clientX;
    startPos = scrollPos;
    cancelAnimationFrame(animationFrame);
    e.preventDefault();
  });

  banner.addEventListener('mousemove', e => {
    if (!isDragging) return;
    scrollPos = startPos + (e.clientX - startX) * 1.3;
    wrapPosition();
    updateTransform();
  });

  banner.addEventListener('mouseup', endDrag);
  banner.addEventListener('mouseleave', endDrag);

  banner.addEventListener('touchstart', e => {
    isDragging = true;
    banner.classList.add('dragging');
    startX = e.touches[0].clientX;
    startPos = scrollPos;
    cancelAnimationFrame(animationFrame);
  }, { passive: true });

  banner.addEventListener('touchmove', e => {
    if (!isDragging) return;
    scrollPos = startPos + (e.touches[0].clientX - startX) * 1.3;
    wrapPosition();
    updateTransform();
  }, { passive: true });

  banner.addEventListener('touchend', endDrag);
  banner.addEventListener('touchcancel', endDrag);

  function endDrag() {
    if (!isDragging) return;
    isDragging = false;
    banner.classList.remove('dragging');
    startAutoScroll();
  }

  function wrapPosition() {
    while (scrollPos > 0) scrollPos -= contentWidth;
    while (scrollPos <= -contentWidth) scrollPos += contentWidth;
  }

  function updateTransform() {
    scroll.style.transform = `translate3d(${scrollPos}px, 0, 0)`;
  }

  function startAutoScroll() {
    cancelAnimationFrame(animationFrame);
    function animate() {
      if (!isDragging) {
        scrollPos -= autoSpeed;
        wrapPosition();
        updateTransform();
      }
      animationFrame = requestAnimationFrame(animate);
    }
    animate();
  }

  startAutoScroll();
}

function applySharedFixes() {
  const style = document.createElement('style');
  style.textContent = `
    footer p { color: var(--gold-main) !important; }
    footer a {
      color: var(--emerald-bright) !important;
      font-weight: 600;
      text-decoration: none !important;
      border-bottom: 0 !important;
    }
    footer a:hover, footer a:focus, footer a:active {
      color: var(--gold-bright) !important;
      text-decoration: none !important;
      border-bottom: 0 !important;
      outline: none;
    }
    .video-link-card {
      display: block;
      position: relative;
      margin: 1.5rem 0;
      overflow: hidden;
      border: 1px solid var(--border-gold);
      border-radius: 6px;
      background: #202226;
      color: #fff;
    }
    .video-link-card img { display:block; width:100%; height:auto; aspect-ratio:16/9; object-fit:cover; }
    .video-link-card span {
      position:absolute;
      top:50%;
      left:50%;
      transform:translate(-50%,-50%);
      display:inline-flex;
      align-items:center;
      justify-content:center;
      width:max-content;
      max-width:calc(100% - 2rem);
      padding:.75rem 1.3rem;
      border:1px solid rgba(255,255,255,.8);
      border-radius:999px;
      background:rgba(18,20,23,.82);
      color:#fff;
      letter-spacing:.04em;
      font-weight:700;
      line-height:1;
      white-space:nowrap;
    }
    @media (max-width: 768px) {
      header { overflow: visible; }
      .menu-toggle { color: var(--emerald-bright) !important; }
      .menu-toggle:hover, .menu-toggle:focus, .menu-toggle.active {
        color: var(--gold-bright) !important;
        border-color: var(--gold-main) !important;
        box-shadow: 0 0 0 1px var(--gold-main) !important;
      }
      nav ul {
        width: min(246px, calc(100vw - 3rem)) !important;
        background: rgba(35, 35, 33, .97) !important;
        border-color: var(--gold-main) !important;
        padding: .9rem 1rem !important;
      }
      nav ul a {
        color: var(--emerald-bright) !important;
        display:block;
        padding:.35rem .15rem;
        text-decoration:none !important;
        border-bottom:0 !important;
      }
      nav ul a:hover, nav ul a:focus, nav ul a.active {
        color: var(--gold-bright) !important;
        text-decoration:none !important;
        border-bottom:0 !important;
      }
      .video-link-card span {
        padding:.72rem 1.2rem;
        font-size:1rem;
      }
    }
  `;
  document.head.appendChild(style);

  document.querySelectorAll('.car-light').forEach(el => el.classList.replace('car-light', 'card-light'));

  const headers = document.querySelectorAll('body > header');
  if (headers.length > 1) {
    for (let i = 1; i < headers.length; i++) headers[i].remove();
  }

  const menu = document.getElementById('mainMenu');
  const button = document.querySelector('.menu-toggle');
  if (button) {
    button.setAttribute('aria-controls', 'mainMenu');
    button.setAttribute('aria-expanded', 'false');
  }
  document.addEventListener('click', event => {
    if (!menu || !button || !menu.classList.contains('active')) return;
    if (!menu.contains(event.target) && !button.contains(event.target)) {
      menu.classList.remove('active');
      button.classList.remove('active');
      button.setAttribute('aria-expanded', 'false');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  applySharedFixes();
  loadClients();
});
