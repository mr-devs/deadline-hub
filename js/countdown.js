/**
 * @file js/countdown.js
 * @description Countdown timer functions for the Deadline Hub application.
 */

/**
 * Updates the countdown every second with a full verbose breakdown
 * (months, days, hours, minutes, seconds). Used inside modals.
 *
 * @param {Date} deadlineDate
 * @param {string} elementId
 */
export function updateCountdownSecond(deadlineDate, elementId) {
    function update() {
        const el = document.getElementById(elementId);
        if (!el) return;

        const timeDiff = deadlineDate - new Date();
        if (timeDiff <= 0) {
            el.innerHTML = "<span class='text-danger'><i class='bi bi-alarm'></i> Deadline Passed</span>";
            return;
        }

        const totalSeconds = Math.floor(timeDiff / 1000);
        const months  = Math.floor(totalSeconds / (30 * 24 * 60 * 60));
        const days    = Math.floor((totalSeconds % (30 * 24 * 60 * 60)) / (24 * 60 * 60));
        const hours   = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
        const seconds = totalSeconds % 60;

        const label = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

        let colorClass = 'text-danger';
        if (months > 0)     colorClass = 'text-success';
        else if (days > 0)  colorClass = 'text-warning';

        const parts = [];
        if (months > 0)  parts.push(label(months, 'month'));
        if (days > 0)    parts.push(label(days, 'day'));
        parts.push(label(hours, 'hour'));
        if (minutes > 0) parts.push(label(minutes, 'minute'));
        parts.push(label(seconds, 'second'));

        el.innerHTML = `<span class='${colorClass}'><i class="bi bi-alarm"></i> in ${parts.join(' ')}</span>`;
        setTimeout(update, 1000);
    }
    update();
}


/**
 * Updates the countdown with a compact single-unit display. Used on cards and list rows.
 *
 * @param {Date} deadlineDate
 * @param {string} elementId
 */
export function updateCountdown(deadlineDate, elementId) {
    function update() {
        const el = document.getElementById(elementId);
        if (!el) return;

        const timeDiff = deadlineDate - new Date();

        if (timeDiff <= 0) {
            el.innerHTML = `<span class='text-danger'><i class="bi bi-alarm" data-bs-toggle="tooltip" data-bs-placement="left" title="Deadline Passed"></i> Deadline Passed</span>`;
            const icon = el.querySelector('[data-bs-toggle="tooltip"]');
            if (icon) new bootstrap.Tooltip(icon);
            return;
        }

        let html, delay;

        if (timeDiff >= 1000 * 60 * 60 * 24 * 30) {
            const months = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 30));
            html = `<span class='text-success'><i class="bi bi-alarm" data-bs-toggle="tooltip" data-bs-placement="left" title="Time Remaining"></i> in ${months} ${months === 1 ? 'month' : 'months'}</span>`;
            delay = 1000 * 60 * 60 * 24;
        } else if (timeDiff >= 1000 * 60 * 60 * 24) {
            const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            html = `<span class='text-warning'><i class="bi bi-alarm" data-bs-toggle="tooltip" data-bs-placement="left" title="Time Remaining"></i> in ${days} ${days === 1 ? 'day' : 'days'}</span>`;
            delay = 1000 * 60 * 60;
        } else if (timeDiff >= 1000 * 60 * 60) {
            const hours = Math.floor(timeDiff / (1000 * 60 * 60));
            html = `<span class='text-danger'><i class="bi bi-alarm" data-bs-toggle="tooltip" data-bs-placement="left" title="Time Remaining"></i> in ${hours} ${hours === 1 ? 'hour' : 'hours'}</span>`;
            delay = 1000 * 60;
        } else {
            const minutes = Math.floor(timeDiff / (1000 * 60));
            const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
            html = `<span class='text-danger'><i class="bi bi-alarm" data-bs-toggle="tooltip" data-bs-placement="left" title="Time Remaining"></i> in ${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ${seconds} ${seconds === 1 ? 'second' : 'seconds'}</span>`;
            delay = 1000;
        }

        el.innerHTML = html;
        const icon = el.querySelector('[data-bs-toggle="tooltip"]');
        if (icon) new bootstrap.Tooltip(icon);
        setTimeout(update, delay);
    }
    update();
}
