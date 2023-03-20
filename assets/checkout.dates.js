"use strict";

if(Shopify.Checkout.step == "shipping_method") {
    function calcTime(offset) {
        var d = new Date();
        var utc = d.getTime() + (d.getTimezoneOffset() * 60000);
        return utc + (3600000 * (offset / 100));

        // var nd = new Date(utc + (3600000 * (offset / 100)));

        // return nd.toLocaleString();
    }

    function setCheckoutDates() {
        let serverTime = calcTime(timezone);
        let nowDate = new Date(serverTime);
        let updatedTime = serverTime;

        let beforeAfter = 'before';

        if(nowDate.getHours() >= 12) {
            beforeAfter = 'after';
            updatedTime += 14 * 60 * 60 * 1000;
        }

        let updatedDate = new Date(updatedTime);
        
        let updDay = updatedDate.getDay();
        if(updDay == 6) updatedTime += 48 * 60 * 60 * 1000;
        else if(updDay == 0) updatedTime += 24 * 60 * 60 * 1000;
        
        updatedDate = new Date(updatedTime);

        let groundDays = 8;
        let expeditedDays = 2;
        let overnightDays = 1;

        let week = [0, 1, 1, 1, 1, 1, 0];
        let iter = updatedDate.getDay();
        let iter2 = updatedDate.getDay();
        let iter3 = updatedDate.getDay();

        let groundTotal = 0;
        let expeditedTotal = 0;
        let overnightTotal = 0;

        while(groundDays > 0) {
            iter++;
            if(week[iter % 7] == 1) {
                groundDays--;
            }
            groundTotal++;
        }

        while(expeditedDays > 0) {
            iter2++;
            expeditedTotal++;
            if(week[iter2 % 7] == 1) {
                expeditedDays--;
            }
        }

        while(overnightDays > 0) {
            iter3++;
            overnightTotal++;
            if(week[iter3 % 7] == 1) {
                overnightDays--;
            }
        }

        let groundDate = new Date(updatedTime + groundTotal * 1000 * 60 * 60 * 24);
        let expeditedDate = new Date(updatedTime + expeditedTotal * 1000 * 60 * 60 * 24);
        let overnightDate = new Date(updatedTime + overnightTotal * 1000 * 60 * 60 * 24);

        let groundString = `Order submitted ${beforeAfter} 12PM PT on ${nowDate.getMonth() + 1}/${nowDate.getDate()} estimated arrival by ${groundDate.getMonth() + 1}/${groundDate.getDate()}`;
        let expeditedString = `Order submitted ${beforeAfter} 12PM PT on ${nowDate.getMonth() + 1}/${nowDate.getDate()} estimated arrival by ${expeditedDate.getMonth() + 1}/${expeditedDate.getDate()}`;
        let overnightString = `Order submitted ${beforeAfter} 12PM PT on ${nowDate.getMonth() + 1}/${nowDate.getDate()} estimated arrival by ${overnightDate.getMonth() + 1}/${overnightDate.getDate()}`;

        let label1 = document.querySelector("[data-shipping-methods] [data-shipping-method-label-title~='Ground']");
        
        if(label1) {
            label1 = label1.closest('.content-box__row');
            label1.innerHTML += `<div style="color:#666">Estimated 3-8 business days</div><div style="margin-top: 8px;">${groundString}</div>`;
        }
        
        let label2 = document.querySelector("[data-shipping-methods] [data-shipping-method-label-title~='Day']");
        
        if(label2) {
            label2 = label2.closest('.content-box__row');
            label2.innerHTML += `<div style="color:#666">Estimated 2 business days</div><div style="margin-top: 8px;">${expeditedString}</div>`;
        }

        let label3 = document.querySelector("[data-shipping-methods] [data-shipping-method-label-title~='Overnight']");

        if(label3) {
            label3 = label3.closest('.content-box__row');
            label3.innerHTML += `<div style="color:#666">Estimated 1 business day</div><div style="margin-top: 8px;">${overnightString}</div>`;
        }
    }

    document.addEventListener('page:load', setCheckoutDates);
    document.addEventListener('page:change', setCheckoutDates);
}