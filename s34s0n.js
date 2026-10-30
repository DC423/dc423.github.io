(function (global) {
  'use strict';

  const TIME_ZONE = 'America/New_York';
  const SEASON_CLASSES = ['holiday-halloween', 'holiday-christmas'];
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    month: '2-digit',
    day: '2-digit'
  });

  const seasonalConfig = Object.freeze({
    halloween: {
      className: 'holiday-halloween',
      icon: '🎃',
      message: 'HAPPY HALLOWEEN // STAY SPOOKY, HACK ETHICALLY',
      particles: ['🦇', '🕸️', '👻', '🦇', '🕷️', '🦇', '👻', '🕸️'],
      edgeDecorations: ['🎃', '🎃']
    },
    christmas: {
      className: 'holiday-christmas',
      icon: '🎄',
      message: 'MERRY CHRISTMAS // MAY YOUR PATCHES BE MERRY AND BRIGHT',
      particles: ['❄', '•', '❅', '•', '❆', '❄', '•', '❅', '•', '❆', '❄', '❅'],
      edgeDecorations: ['🎁', '🎄']
    }
  });

  let activeSeason = null;
  let seasonalLayer = null;

  function getChattanoogaMonthDay(date = new Date()) {
    return Object.fromEntries(
      formatter
        .formatToParts(date)
        .filter(part => part.type === 'month' || part.type === 'day')
        .map(part => [part.type, Number(part.value)])
    );
  }

  function getSeason(date = new Date()) {
    const { month, day } = getChattanoogaMonthDay(date);
    if (month === 10 && day >= 24 && day <= 31) return 'halloween';
    if (month === 12 && day >= 18 && day <= 25) return 'christmas';
    return null;
  }

  function clearSeason() {
    document.body.classList.remove(...SEASON_CLASSES);
    if (seasonalLayer) seasonalLayer.remove();
    seasonalLayer = null;
    activeSeason = null;
  }

  function createParticle(symbol, index, total) {
    const particle = document.createElement('span');
    particle.className = 'seasonal-particle';
    particle.textContent = symbol;
    particle.style.setProperty('--season-x', `${((index + 0.5) / total) * 100}%`);
    particle.style.setProperty('--season-delay', `${-(index * 1.7)}s`);
    particle.style.setProperty('--season-duration', `${8 + (index % 5) * 2}s`);
    particle.style.setProperty('--season-drift-mid', `${index % 2 === 0 ? 22 : -22}px`);
    particle.style.setProperty('--season-drift-end', `${index % 2 === 0 ? -16 : 16}px`);
    return particle;
  }

  function renderSeason(season) {
    const config = seasonalConfig[season];
    if (!config) return;

    clearSeason();
    activeSeason = season;
    document.body.classList.add(config.className);

    seasonalLayer = document.createElement('div');
    seasonalLayer.className = `seasonal-layer seasonal-${season}`;
    seasonalLayer.dataset.season = season;

    const banner = document.createElement('div');
    banner.className = 'seasonal-banner';
    banner.setAttribute('role', 'status');
    banner.setAttribute('aria-label', config.message.replace(' // ', '. '));
    banner.innerHTML = `<span aria-hidden="true">${config.icon}</span><span>${config.message}</span><span aria-hidden="true">${config.icon}</span>`;

    const particles = document.createElement('div');
    particles.className = 'seasonal-particles';
    particles.setAttribute('aria-hidden', 'true');
    config.particles.forEach((symbol, index) => {
      particles.appendChild(createParticle(symbol, index, config.particles.length));
    });

    const leftDecoration = document.createElement('div');
    leftDecoration.className = 'seasonal-edge seasonal-edge-left';
    leftDecoration.setAttribute('aria-hidden', 'true');
    leftDecoration.textContent = config.edgeDecorations[0];

    const rightDecoration = document.createElement('div');
    rightDecoration.className = 'seasonal-edge seasonal-edge-right';
    rightDecoration.setAttribute('aria-hidden', 'true');
    rightDecoration.textContent = config.edgeDecorations[1];

    seasonalLayer.append(banner, particles, leftDecoration, rightDecoration);
    document.body.appendChild(seasonalLayer);
  }

  function refresh(date = new Date()) {
    const season = getSeason(date);
    if (season === activeSeason) return season;
    if (!season) clearSeason();
    else renderSeason(season);
    return season;
  }

  function initialize() {
    refresh();
    global.setInterval(refresh, 60000);
  }

  global.ChaSeasonal = Object.freeze({
    TIME_ZONE,
    getSeason,
    refresh
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})(window);