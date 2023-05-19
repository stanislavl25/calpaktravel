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

        const targetElement = document.querySelector('div.radio-wrapper[data-shipping-method="shopify-Express-0.00"]');
        if (targetElement) {
          label2 = label2.closest('.content-box__row');
          label2.innerHTML += `<div style="color:#666">Enjoy Free 2-day Shipping</div><div style="margin-top: 8px;">${expeditedString}</div>`;
        }

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
//  function displayShippingMessage() {
//   setTimeout(() => {
//     const expressLabelElement = document.querySelector('span.radio__label__primary[data-shipping-method-label-title="Express"]');
//     expressLabelElement.textContent = "Free Express Shipping for $300+ Orders";

//     const now = new Date();
//     const estimatedArrival = new Date(now.getTime() + (2 * 24 * 60 * 60 * 1000));
//     const dayOfWeek = estimatedArrival.getDay();

//     if (dayOfWeek === 0) {
//       // Sunday, add one day
//       estimatedArrival.setDate(estimatedArrival.getDate() + 1);
//     } else if (dayOfWeek === 6) {
//       // Saturday, add two days
//       estimatedArrival.setDate(estimatedArrival.getDate() + 2);
//     }

//     const formattedEstimatedArrival = `${estimatedArrival.getMonth() + 1}/${estimatedArrival.getDate()}`;
//     const isAfter12pmPT = now.getHours() >= 19; // 19 is 12 PM PT in 24-hour format

//     let message;
//     if (isAfter12pmPT) {
//       message = `Order submitted after 12 PM PT on ${now.getMonth() + 1}/${now.getDate()} estimated arrival by ${formattedEstimatedArrival}`;
//     } else {
//       message = `Order submitted before 12 PM PT on ${now.getMonth() + 1}/${now.getDate()} estimated arrival by ${formattedEstimatedArrival}`;
//     }

//     const shippingMessageElement = document.createElement("span");
//     shippingMessageElement.innerText = message;
//     shippingMessageElement.classList.add("shipping-custom-msg");

//     const shippingInfoElement = document.createElement("span");
//     shippingInfoElement.innerText = "Enjoy free 2-day shipping";
//     shippingInfoElement.classList.add("shipping-info");

//     const targetElement = document.querySelector('div.radio-wrapper[data-shipping-method="shopify-Express-0.00"]');
    
//     targetElement.insertAdjacentElement("afterend", shippingMessageElement);
//     targetElement.insertAdjacentElement("afterend", shippingInfoElement);
//   }, 50); // to display after loading circle element
// }


document.addEventListener('page:load', function() {
  // displayShippingMessage();
  setCheckoutDates();
});

document.addEventListener('page:change', function() {
  // displayShippingMessage();
  setCheckoutDates();
});
}