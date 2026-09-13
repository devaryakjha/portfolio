const calendar = document.querySelector('.bench-calendar');
const days = [...calendar.querySelectorAll('button')];
const tip = document.getElementById('bench-tooltip');
let selected = days.length - 1;
days[selected].tabIndex = 0;
function nextDay(index, key, length) {
 const delta = { ArrowLeft: -7, ArrowRight: 7, ArrowUp: -1, ArrowDown: 1 }[key];
 return key === 'Home' ? 0 : key === 'End' ? length - 1 : delta === undefined ? index : Math.max(0, Math.min(length - 1, index + delta));
}
// Small check for the calendar's column-major keyboard navigation.
console.assert(nextDay(7, 'ArrowLeft', 365) === 0 && nextDay(0, 'ArrowUp', 365) === 0 && nextDay(364, 'ArrowRight', 365) === 364 && nextDay(2, 'End', 365) === 364, 'Calendar navigation bounds');
function hideTip() { tip.hidden = true; }
function showTip(day) {
 if (!day || !calendar.contains(day)) return;
 const [date, count] = day.dataset.detail.split(' · ');
 tip.querySelector('strong').textContent = count;
 tip.querySelector('span').textContent = date;
 tip.hidden = false;
 const r = day.getBoundingClientRect(), box = tip.getBoundingClientRect();
 tip.style.left = Math.max(8, Math.min(innerWidth - box.width - 8, r.x + r.width / 2 - box.width / 2)) + 'px';
 tip.style.top = (r.top > box.height + 16 ? r.top - box.height - 8 : r.bottom + 8) + 'px';
}
calendar.addEventListener('pointerover', e => showTip(e.target.closest('button')));
calendar.addEventListener('pointerleave', hideTip);
calendar.addEventListener('focusin', e => showTip(e.target.closest('button')));
calendar.addEventListener('focusout', hideTip);
calendar.addEventListener('click', e => {
 const day = e.target.closest('button'); if (!day) return;
 days[selected].tabIndex = -1; selected = days.indexOf(day); day.tabIndex = 0; showTip(day);
});
calendar.addEventListener('keydown', e => {
 if (e.key === 'Escape') { hideTip(); return; }
 if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(e.key)) return;
 e.preventDefault();
 const index = days.indexOf(e.target); if (index < 0) return;
 days[selected].tabIndex = -1; selected = nextDay(index, e.key, days.length);
 days[selected].tabIndex = 0; days[selected].focus();
});
document.addEventListener('pointerdown', e => { if (!calendar.contains(e.target)) hideTip(); });
window.addEventListener('scroll', hideTip, true);
window.addEventListener('resize', hideTip);
