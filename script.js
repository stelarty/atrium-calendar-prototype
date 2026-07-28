const ROW_HEIGHT = 85;
const HEAD_HEIGHT = 20;
const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

// Demo events: weekday (0 = Пн), start hour, kind
const EVENTS = [
  { day: 0, hour: 8, type: 'Занятие', title: 'Комбинаторика: сумма и произведение', time: '8:00 - 9:00', kind: 'additional' },
  { day: 0, hour: 10, type: 'Занятие', title: 'Механизмы нуклеофильного замещения – II. Их применение в химии спиртов, галогеналканов, аминов, простых эфиров', time: '10:00 - 11:00', kind: 'additional' },
  { day: 2, hour: 10, split: true, kind: 'additional', cards: [
    { type: 'Дедлайн', title: 'Комбинаторика: сумма и произведение', time: '10:00' },
    { type: 'Дедлайн', title: 'Комбинаторика: сумма и произведение', time: '10:00' },
  ] },
  { day: 2, hour: 12, type: 'Отслушка', title: 'Комбинаторика: сумма и произведение', time: '12:00 - 13:00', kind: 'warning', tall: true },
];

const grid = document.getElementById('grid');
const gridScroll = document.getElementById('grid-scroll');
const weekTitle = document.getElementById('week-title');

let weekStart = mondayOf(new Date());

function mondayOf(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function formatTitle(start) {
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  if (start.getMonth() === end.getMonth()) {
    return `${pad(start.getDate())} - ${pad(end.getDate())} ${MONTHS[start.getMonth()]}`;
  }
  return `${pad(start.getDate())} ${MONTHS[start.getMonth()]} - ${pad(end.getDate())} ${MONTHS[end.getMonth()]}`;
}

function utcLabel() {
  const offset = -new Date().getTimezoneOffset() / 60;
  return `UTC${offset >= 0 ? '+' : '−'}${Math.abs(offset)}`;
}

function cardHtml(card, kind, extra) {
  return `<div class="lesson-card card-${kind}${extra || ''}">
    <p class="card-type">${card.type}</p>
    <p class="card-title">${card.title}</p>
    <p class="card-time">${card.time}</p>
  </div>`;
}

function render() {
  const now = new Date();
  const todayIndex = [0, 1, 2, 3, 4, 5, 6].findIndex((i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return isSameDay(d, now);
  });

  weekTitle.textContent = formatTitle(weekStart);

  let html = `<div class="grid-head"><div class="head-utc">${utcLabel()}</div>`;
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    const dot = i === todayIndex ? '<span class="today-dot"></span>' : '';
    html += `<div class="head-cell"><span class="head-day">${WEEKDAYS[i]}, ${pad(d.getDate())}</span>${dot}</div>`;
  }
  html += '</div>';

  for (let hour = 0; hour < 24; hour++) {
    html += `<div class="row"><div class="time-cell">${hour}:00</div>`;
    for (let day = 0; day < 7; day++) {
      const today = day === todayIndex ? ' today' : '';
      const event = EVENTS.find((e) => e.day === day && e.hour === hour);
      if (!event) {
        html += `<div class="cell${today}"></div>`;
      } else if (event.split) {
        html += `<div class="cell cell-split${today}">${event.cards.map((c) => cardHtml(c, event.kind)).join('')}</div>`;
      } else if (event.tall) {
        html += `<div class="cell cell-tall${today}">${cardHtml(event, event.kind)}</div>`;
      } else {
        html += `<div class="cell${today}">${cardHtml(event, event.kind)}</div>`;
      }
    }
    html += '</div>';
  }

  html += '<div class="now-line" id="now-line"></div><div class="now-badge" id="now-badge"></div>';
  grid.innerHTML = html;
  updateNow();
}

function updateNow() {
  const now = new Date();
  const line = document.getElementById('now-line');
  const badge = document.getElementById('now-badge');
  const currentWeek = isSameDay(mondayOf(now), weekStart);
  line.style.display = currentWeek ? '' : 'none';
  badge.style.display = currentWeek ? '' : 'none';
  if (!currentWeek) return;
  const top = HEAD_HEIGHT + (now.getHours() + now.getMinutes() / 60) * ROW_HEIGHT;
  line.style.top = `${Math.round(top)}px`;
  badge.style.top = `${Math.round(top) - 10}px`;
  badge.textContent = `${now.getHours()}:${pad(now.getMinutes())}`;
}

function scrollToNow() {
  const now = new Date();
  const top = HEAD_HEIGHT + (now.getHours() + now.getMinutes() / 60) * ROW_HEIGHT;
  gridScroll.scrollTop = Math.max(0, top - gridScroll.clientHeight / 2);
}

document.getElementById('prev-week').addEventListener('click', () => {
  weekStart.setDate(weekStart.getDate() - 7);
  render();
});

document.getElementById('next-week').addEventListener('click', () => {
  weekStart.setDate(weekStart.getDate() + 7);
  render();
});

document.getElementById('segment').addEventListener('click', (e) => {
  const btn = e.target.closest('.seg-item');
  if (!btn) return;
  document.querySelectorAll('.seg-item').forEach((b) => b.classList.toggle('active', b === btn));
});

setInterval(() => {
  updateNow();
}, 30000);

render();
scrollToNow();
