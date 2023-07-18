function startCountdown() {
    var pst12pm = moment().tz('America/Los_Angeles').startOf('day').hour(12);
    var now = moment();

    if (now.isAfter(pst12pm)) {
        pst12pm.add(1, 'day');
    }

    // Skip weekends
    if (pst12pm.day() === 6) {
        // Saturday, add two days
        pst12pm.add(2, 'day');
    } else if (pst12pm.day() === 0) {
        // Sunday, add one day
        pst12pm.add(1, 'day');
    }

    document.querySelector('.order-by-date').textContent = 'Want it shipped ' + pst12pm.format('dddd, MMMM Do') + '?';

    var interval = setInterval(function () {
        now = moment();
        var duration = moment.duration(pst12pm.diff(now));

        var hours = Math.floor(duration.asHours());
        var minutes = Math.floor(duration.minutes());

        document.querySelector('.order-by-timer').textContent = `${hours} hr ${minutes} mins`;

        if (hours === 0 && minutes === 0) {
            pst12pm.add(1, 'day');
            
            // Skip weekends
            if (pst12pm.day() === 6) {
                // Saturday, add two days
                pst12pm.add(2, 'day');
            } else if (pst12pm.day() === 0) {
                // Sunday, add one day
                pst12pm.add(1, 'day');
            }

            document.querySelector('.order-by-date').textContent = 'Want it shipped ' + pst12pm.format('dddd, MMMM Do') + '?';
        }
    }, 1000);
}

startCountdown();