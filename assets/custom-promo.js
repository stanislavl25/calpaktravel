
let promoBarCells = document.querySelectorAll('.promo-bar-text-cell');
let index = 0;
if(promoBarCells.length > 1) {
    let cont = document.querySelector('.promo-bar-text-container');
    let cells = cont.querySelector('.promo-bar__cells');
    let timeout = Number(cont.getAttribute('data-timeout')) * 1000;
    setInterval(() => {
        index++;
        cells.style.setProperty('--page', index);

        if(index + 1 >= promoBarCells.length) {
            index = 0;
            setTimeout(() => {
                cells.classList.add('promo-bar__cells--back');

                setTimeout(() => {
                    cells.style.setProperty('--page', index);
                }, 10);

                setTimeout(() => {
                    cells.classList.remove('promo-bar__cells--back');
                }, 100);
            }, 100);
        }
    }, timeout);
}
if (document.querySelector('.promo-holiday-banner')) {
    document.querySelectorAll('.promo-holiday-banner a').forEach(function(element) {
    element.addEventListener('click', function(event) {
    event.stopPropagation();
    });
    });
    
    document.querySelector('.promo-holiday-banner').addEventListener('click', function(event) {
    event.preventDefault();
    if (this.classList.contains('promo-expanded')) {
        document.body.classList.remove('shipping-banner-on');
        this.classList.remove('promo-expanded');
        document.querySelector('.holiday-banner-dates').slideUp(300);
      } else {
        document.body.classList.add('shipping-banner-on');
        this.classList.add('promo-expanded');
        document.querySelector('.holiday-banner-dates').slideDown(300);
      }
    });

    let dates = ['Dec 13, 2022 12:00:00', 'Dec 20, 2022 12:00:00'];
    var now = new Date().getTime();
    for (let i = 0; i < dates.length; i++) {
    var countDownDate = new Date(dates[i]);
    var offset = countDownDate.getTimezoneOffset() * 60 * 1000 - 8 * 3600 * 1000;
    var countDownDate = countDownDate.getTime();
    var distance = countDownDate - now - offset;
    if (distance < 0) {
    document.querySelectorAll('.holiday-banner-date')[i].classList.add('inactive');
    }
    }
}

let countdown_ticks = document.querySelectorAll('.countdown-timer, .flash-sale__timer');
if(countdown_ticks.length) {
    setInterval(function(){
        countdown_ticks = document.querySelectorAll('.countdown-timer, .flash-sale__timer');
        for(let i = 0; i < countdown_ticks.length; i++) {
            let time_left = countdown_ticks[i].getAttribute('data-time-left');
            let flash_sale = countdown_ticks[i].classList.contains('flash-sale__timer');

            time_left--;
            countdown_ticks[i].setAttribute('data-time-left', time_left);
            if(time_left < 0) {
                if(flash_sale) {
                    let activeStuff = document.querySelectorAll('.flash-sale-active');
                    if(activeStuff.length) for( let i = 0; i < activeStuff.length; i++ ) {
                        activeStuff[i].classList.remove('flash-sale-active');
                        activeStuff[i].classList.add('flash-sale-ended');
                    }
                } else countdown_ticks[i].classList.add('countdown-timer--done');
                return;
            }

            let d = 0;//Math.floor(time_left / 86400);
            let h = Math.floor(time_left / 3600);
            let m = Math.floor((time_left - h * 3600) / 60);
            let s = time_left % 3600 % 60;

            if(m < 10) m = '0' + m;
            if(s < 10) s = '0' + s;

            let timeLeftHtml = '';
            if(d > 0) {
                h -= 24 * d;
                if(h < 10) h = '0' + h;
                timeLeftHtml = '<span>' + d + 'D</span> : <span>' + h + 'H</span> : <span>' + m + 'M</span>';
            } else {
                if(h < 10) h = '0' + h;
                timeLeftHtml = '<span>' + h + '</span> : <span>' + m + '</span> : <span>' + s + '</span>';
            }

            if(flash_sale) {
                if(d > 0) countdown_ticks[i].classList.add('flash-sale__timer--days');
                else countdown_ticks[i].classList.remove('flash-sale__timer--days');
            }
            countdown_ticks[i].innerHTML = timeLeftHtml;
        }
    }, 1000);
}