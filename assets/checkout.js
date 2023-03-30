let altPayments = document.querySelector('[data-alternative-payments]');
if(altPayments) {
    let payPalInterval = setInterval(function() {
        if(document.querySelector('.dynamic-checkout__content ul')) {
            setTimeout(function() {
                let pp = document.querySelector('.dynamic-checkout__content iframe');
                let nw = document.createElement('div');
                nw.classList.add('paypal-overlay');
                if(pp) pp.parentNode.insertBefore(nw, pp);
            }, 100);
            clearInterval(payPalInterval);
        }
    }, 200);
}

var addressInput = document.querySelector('#checkout_shipping_address_address1');
if(addressInput) {
//   addressInput.placeholder = 'Address';
  
  function checkPOBox(that) {
    var vl = that.value;
    var prnt = that.parentNode.parentNode;

    if(vl.match(/p\.?o\.?\s?box/i)) {
      prnt.classList.add('field--error');
      prnt.classList.add('po-box--error');

      if(prnt.querySelector('.field__message') !== null) {
        prnt.querySelector('.field__message').innerHTML = 'Unable to ship to a PO Box, please enter a different address';
      } else {
        var node = document.createElement("p");
        node.classList.add("field__message");
        node.classList.add("field__message--error");
        node.setAttribute("id", "error-for-address1");
        node.innerHTML = "Unable to ship to a PO Box, please enter a different address";
        prnt.appendChild(node);
      }

      document.querySelector('.step__footer').classList.add('stopRightThere');
    } else {
      if(prnt.classList.contains('po-box--error')) {
        prnt.classList.remove('field--error');
        prnt.classList.remove('po-box--error');
      }
      document.querySelector('.step__footer').classList.remove('stopRightThere');
    }
  }
  checkPOBox(addressInput);
  
  addressInput.addEventListener('change', function(){
    checkPOBox(this);
  });
  
  var addressInput2 = document.querySelector('#checkout_shipping_address_address2');
  if(addressInput2) addressInput2.placeholder = 'Apt/Unit';
}

function handleize(str) {
    return str.toLowerCase().replace(/[^\w\u00C0-\u024f]+/g, "-").replace(/^-+|-+$/g, "");
}

const checkout_reduction_code = document.getElementById('checkout_reduction_code');
if(checkout_reduction_code) checkout_reduction_code.setAttribute('placeholder', 'Gift Card / Discount Code (1 per order)');
const checkout_reduction_code_mob = document.getElementById('checkout_reduction_code_mobile');
if(checkout_reduction_code_mob) checkout_reduction_code_mob.setAttribute('placeholder', 'Gift Card / Discount Code (1 per order)');

function formatPrice(x) {
    x = Number(x);// / 100;
    if(isNaN(x)) return x;
    return '$' + (x.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",").replace('.00', ''));
}

function isset(i) {
    return i != null && i != undefined;
}

function addProductInfo(item, i) {
    $.getJSON('/products/'+item.handle+'.js', function(data) {
        let prod = $('.order-summary__section__content .product-table .product').eq(i);
        let current_variant = false;
        
        for(let i = 0; i < data.variants.length; i++) {
            if(data.variants[i].id == item.variant_id) {
                current_variant = data.variants[i];
            }
        }
        if(!current_variant) current_variant = data.variants[0];

        let price = prod.find('.product__price');
        if(price.find('del').length == 0 && isset(current_variant.compare_at_price) && current_variant.compare_at_price > current_variant.price ) {
            price.prepend('<del>' + formatPrice(current_variant.compare_at_price * item.quantity / 100, false) + '</del>');
        }

        for(let j = 0; j < data.tags.length; j++) {
            if(data.tags[j].indexOf('preorder') > -1) {
                let pr = data.tags[j].split(':');
                if(pr[0] == 'preorder') {

                    if(prod.find('.preorder-sign').length == 0) {
                        if(pr.length == 1) {
                            let node = document.createElement("p");
                            node.classList.add("preorder-sign");
                            node.innerHTML = "Pre-order";
                            prod.find('.product__description')[0].appendChild(node);
                        } else if(pr.length == 2) {
                            let node = document.createElement("p");
                            node.classList.add("preorder-sign");
                            node.innerHTML = "Est. ship date: <strong>" + pr[1] + "</strong>";
                            prod.find('.product__description')[0].appendChild(node);
                        } else if(pr.length == 3) {
                            if(handleize(item.variant_options[0]) == pr[1]) {
                                let node = document.createElement("p");
                                node.classList.add("preorder-sign");
                                node.innerHTML = "Est. ship date: <strong>" + pr[2] + "</strong>";
                                prod.find('.product__description')[0].appendChild(node);
                            }
                        }
                        // document.body.classList.add('no-expedited');

                    }
                    
                    break;
                }
            }
        }
    });
}

let cart_cache = false;
if(typeof Shopify.Checkout.step != 'undefined') {
    jQuery.getJSON('/cart.js?d', function(data) {
        let cartIcon = document.querySelector('.checkout-cart-icon');
        if(cartIcon) {
            cartIcon.innerHTML += '<span>' + data.item_count + '</span>';
        }

        let items = false;
        if(typeof data.items == 'undefined' || !data.items.length) {
            if(window.sessionStorage.getItem('cart-cache')) items = JSON.parse(window.sessionStorage.getItem('cart-cache'));
        } else {
            window.sessionStorage.setItem('cart-cache', JSON.stringify(data.items));
            items = data.items;
        }

        if(!items) return;

        cart_cache = items;
        updateCartProducts(items);
    });
} else {
    let loadingProducts = document.querySelectorAll('.product:not(.product--loaded)');
    for(let i = 0; i < loadingProducts.length; i++) loadingProducts[i].classList.add('product--loaded');
}

function updateCartProducts(items) {
    let gwpNote = '';
    let gwpFound = false;
    for(var i = 0; i < items.length; i++) {
        var item = items[i];

        if(typeof gwpConfig != 'undefined' && typeof gwpConfig.products != 'undefined') {
            for(let i = 0; i < gwpConfig.products.length; i++) {
                let product = gwpConfig.products[i];
                if(item.handle == product.handle) {
                    if(gwpFound) {
                        $.ajax({
                            type: "POST",
                            dataType: "json",
                            url: `${routes.cart_change_url}.js`,
                            data: {
                                id: item.key,
                                quantity: 0
                            }
                        });
                        continue;
                    }
                    let itemEl = document.querySelector('.product[data-variant-id="' + item.variant_id + '"]');
                    gwpNote = 'GWP - ' + item.title;
                    if(product.title) itemEl.querySelector('.product__description__name').innerHTML = product.title;
                    if(product.image) itemEl.querySelector('.product-thumbnail__image').setAttribute('src', product.image);
                    gwpFound = true;
                }
            }
        }


        if(item.properties != null && typeof item.properties != 'undefined' && item.properties['_final-sale'] != 'undefined' && (item.properties['_final-sale'] === true || item.properties['_final-sale'] === "true")) {

            if($('.order-summary__section__content .product-table .product').eq(i).find('.final-sale-sign').length == 0) {
                var node = document.createElement("p");
                node.classList.add("final-sale-sign");
                node.innerHTML = "Final sale";

                $('.order-summary__section__content .product-table .product').eq(i).find('.product__description')[0].appendChild(node);
            }
        }

        addProductInfo(item, i, items.length);
    }

    jQuery.ajax({
        url: `${routes.cart_update_url}.js`,
        type: 'POST',
        data: {note: gwpNote}
    });

    let loadingProducts = document.querySelectorAll('.product:not(.product--loaded)');
    for(let i = 0; i < loadingProducts.length; i++) loadingProducts[i].classList.add('product--loaded');
}

setInterval(function() {
    let loadingProducts = document.querySelectorAll('.product:not(.product--loaded)');
    if(loadingProducts.length > 0) updateCartProducts(cart_cache);
}, 1000);

function addGiftNoteField() {
    // if($('#attentiveOptIn').length > 0 && $('.step__sections #attentiveOptIn').length == 0) {
    //     $('.step__sections').append($('#attentiveOptIn'));
    // }

    if($('.gift-note-field-container').length > 0 && $('.step__sections .gift-note-field-container').length == 0) {
        $('.gift-note-field-container').eq(0).appendTo('.step__sections').addClass('active');
    }

    // if($('.section--contact-information').length > 0 && $('.section--contact-information .section__content .gift-note-field-container').length == 0) {
    //     $('.gift-note-field-container').eq(0).clone().appendTo('.section--contact-information .section__content:eq(0)').css({'margin-top': '20px'}).addClass('active');
    // }
    
    if($('.add-review-block').length && $('.review-block:not(.add-review-block)').length) {
        $('.review-block:not(.add-review-block)').last().after($('.add-review-block').eq(0));
    }
}

jQuery(document).ready(function($){
    if(Shopify.Checkout.step == 'contact_information') {
        $('.gift-checkbox').click(function() {
            if($(this).is(':checked')) {
                $(this).closest('.gift-note-field-container').addClass('gift-note-field-container--active');
            } else $(this).closest('.gift-note-field-container').removeClass('gift-note-field-container--active');
        });
    
        $('.gift-textarea-container .field__input--textarea').keyup(function() {
            let length = $(this).val().length;
            $(this).parent().find('.textarea-character-count span').text(length);
        });
    
        $('.gift-textarea-container .field__input--textarea').blur(function() {
            let length = $(this).val().length;
            $(this).parent().find('.textarea-character-count span').text(length);
        });
    
        if($('.gift-note-field-container').length) {
            setInterval(addGiftNoteField, 1000);
            addGiftNoteField();
            
            $('.gift-note-field-container input').trigger('focus').trigger('blur');
        
            // $('.gift-note-input').blur(function(){
            // var vl = $(this).val();
            
            // $.ajax({
            //     url: '/cart/update.js',
            //     type: 'POST',
            //     data: {note: vl}
            // });
            // });
        }
    }

    let companyField = document.querySelector('[data-address-field="company"]');
    if(companyField) {
        companyField.innerHTML += '<a href="#" title="Hide" class="hide-field">Hide</a>';

        companyField.querySelector('.hide-field').addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.parentNode.classList.remove('field--optional-active');
        })

        if(companyField.querySelector('input').value.length > 0) companyField.classList.add('field--optional-active');
        companyField.addEventListener('click', function() {
            this.classList.add('field--optional-active');
        });
    }

    let products = document.querySelectorAll('.sidebar__content .product');
    if(products.length > 2) {
        jQuery('.sidebar__content').prepend('<a href="#" class="show-all-products"><span>See Full Product List</span><span>Hide Full Product List</span></a>');
        jQuery('.show-all-products').click(function(e) {
            e.preventDefault();
            jQuery('.sidebar__content').toggleClass('sidebar__content--all-products');
        });
    }

    setTimeout(function() {
        if(window.sessionStorage.getItem('returning-to-edit')) {
            let value = window.sessionStorage.getItem('returning-to-edit');
            
            let input = false;
            if(value == 'address') {
                input = document.querySelector('#checkout_shipping_address_address1');
            } else if(value == 'email') {
                input = document.querySelector('#checkout_email');
            }
        
            if(input) {
                input.focus();
                input.scrollIntoView({behavior: 'smooth'});
            }
            
            window.sessionStorage.setItem('returning-to-edit', false);
        }
    }, 100);

    // Checkout countdown
    if( countdown_enabled) {

        const countdown_time  = 10; // Value in minutes
        const countdown_now = new Date();

        // let countdown_default = '';
        // if (sessionStorage.getItem('countdown_timer') != null) {
        //     countdown_default = new Date(sessionStorage.getItem('countdown_timer'));
        // } else {
        //     countdown_default = new Date(countdown_now.getTime() + countdown_time * 60000);
        //     sessionStorage.setItem("countdown_timer", countdown_default.toString());
        // }

        const countdown_default = new Date(countdown_now.getTime() + countdown_time * 60000);

        const
            countdown       = countdown_default,
            second          = 1000,
            minute          = second * 60,
            hour            = minute * 60,
            day             = hour * 24;

        $(".main__header").append('<div class="countdown__checkout">The items in your cart are in high demand: <b>Cart reserved for </b><span></span></div>');
        const countdown__display = setInterval(() => {
            const distance = countdown - new Date();
            const distanceFormat = {
                'days': Math.floor(distance / (day)),
                'hours': Math.floor((distance % (day)) / (hour)),
                'minutes': Math.floor((distance % (hour)) / (minute)),
                'seconds': Math.floor((distance % (minute)) / second)
            }
            const countdown_minutes = String(distanceFormat.minutes).length > 1 ? distanceFormat.minutes : `0${distanceFormat.minutes}`;
            const countdown_seconds = String(distanceFormat.seconds).length > 1 ? distanceFormat.seconds : `0${distanceFormat.seconds}`;
            const countdown_time_string = `${countdown_minutes}:${countdown_seconds}`;
            $(".countdown__checkout span").html(countdown_time_string);

            if( distance < 0) {
                clearInterval(countdown__display);
                $(".countdown__checkout span").html('00:00');
            }
        }, 1000);
    }
});

if(Shopify.Checkout.step == 'contact_information') addGiftNoteField();

var prodProps = document.querySelectorAll('.product__description__property');
for(var i = 0; i < prodProps.length; i++) {
  var prop = prodProps[i];
  if(prop.innerHTML.indexOf('key: ') > -1) {
    prop.style.display = 'none';
  }
}

var pltPresent = false;
var otherProductsPresent = false;
if(document.body.classList.contains('excludeSome2d')) {
    pltPresent = true;
    otherProductsPresent = true;
} else if(document.body.classList.contains('exclude2d')) {
    pltPresent = true;
}

if(pltPresent) {
    $(".section--shipping-method").on("click", ".radio-wrapper input", function() {
        var title = this.parentNode.parentNode.querySelector(".radio__label .radio__label__primary").getAttribute("data-shipping-method-label-title");
        if(title == "UPS 2nd Day Air") {
        var pr = this.parentNode.parentNode.parentNode;
        pr.classList.add('plt-disclaimer');
        if($(pr).find('.plt-disclaimer-text').length == 0) {
            $(pr).append('<div class="plt-disclaimer-text"></div>');
        }
        if(!otherProductsPresent) {
            document.querySelector(".step__footer__continue-btn").classList.add('disabled');
            $(pr).find(".plt-disclaimer-text").html("Your purchase is not eligible for expedited shipping. To proceed to checkout, please update shipping to Standard Ground Shipping. For questions, contact <a href='mailto:info@calpaks.com'>info@calpaks.com</a>");
        } else {
            document.querySelector(".step__footer__continue-btn").classList.remove('disabled');
            $(pr).find(".plt-disclaimer-text").html("Some of the items in your cart are not eligible for expedited shipping and will be shipped ground. All other items in your order will be shipped via expedited 2-day. For questions, contact <a href='mailto:info@calpaks.com'>info@calpaks.com</a>");
        }
        } else {
        if(document.querySelector('.plt-disclaimer'))
            document.querySelector('.plt-disclaimer').classList.remove('plt-disclaimer');
        document.querySelector(".step__footer__continue-btn").classList.remove('disabled');
        }
    });

    $(".section--shipping-method .radio-wrapper input:checked").click();
}

var productVariants = document.querySelectorAll('.product__description__variant');
for(var i = 0; i < productVariants.length; i++) {
  if(productVariants[i].innerHTML.toLowerCase() == 'kaya-bronze' || productVariants[i].innerHTML.toLowerCase() == 'kaya bronze') productVariants[i].innerHTML = 'BRONZE';
}

// var shipping_section = document.querySelector('.section.section--shipping-address .section__content');
// if(shipping_section) {
//   shipping_section.innerHTML = '<div class="covid-info"><p>Due to the current health orders in California, we have temporarily closed our distribution and fulfillment centers. While our website remains available to accept your orders, <strong>shipping will be delayed until April 30, 2020, pending further updates</strong>.</p><p>Once we re-open for business, we will work to get your order out as soon as possible. To accommodate your needs, all unshipped orders can be cancelled at any time for a full refund.  Please reach out to our customer care team at <a href="mailto:help@calpaks.com">help@calpaks.com</a> and they can assist you with your request.</p></div>' + shipping_section.innerHTML;
// }

if($('.direct-relief').length) $('.section--contact-information').append($('.direct-relief'));

let bannerWrap = document.querySelector('.banner .wrap');
if(bannerWrap) bannerWrap.innerHTML += '<a class="checkout-cart-icon" href="//calpaktravel.com/cart" title="Cart"><svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 22.6 39.1" style="enable-background:new 0 0 22.6 39.1;" xml:space="preserve"><style type="text/css">.st0{fill:none;stroke:#1C1B1A;stroke-width:0.75;stroke-miterlimit:10;}.st1{fill:#FFFFFF;stroke:#1C1B1A;stroke-width:0.75;stroke-miterlimit:10;}</style><path class="st0" d="M14.6,0.4H8.1c-0.2,0-0.4,0.2-0.4,0.4v6.6H15V0.8C15,0.6,14.8,0.4,14.6,0.4z"/><path class="st1" d="M1.8,38.8h19c0.8,0,1.5-0.7,1.5-1.5V8.8c0-0.8-0.7-1.5-1.5-1.5h-19C1,7.4,0.4,8,0.4,8.8v28.5C0.4,38.1,1,38.8,1.8,38.8z"/></svg><span></span></a>';

let dynCheckTitle = document.querySelector('.dynamic-checkout__title');
if(dynCheckTitle) {
    let dynCheckDesc = document.createElement('p');
    dynCheckDesc.classList.add('section__text');
    dynCheckDesc.innerHTML = 'When choosing express checkout, you cannot use CALPAK rewards points.';
    dynCheckTitle.after(dynCheckDesc);
}

let orderSummaryProducts = document.querySelector('.order-summary__sections .order-summary__section .order-summary__section__content');
if(orderSummaryProducts) {
    let smp = new SimpleBar(orderSummaryProducts, { autoHide: false });

    SimpleBar.instances.get(orderSummaryProducts).getScrollElement().addEventListener('scroll', function() {
        let ind = document.querySelector('#order-summary__scroll-indicator');
        if(ind) ind.style.opacity = 0;
    });
}

document.addEventListener('submit', function(e) {
    if(e.target && e.target.classList.contains('edit_checkout') && document.getElementById('checkout_shipping_address_phone')) {
        let val = document.getElementById('checkout_shipping_address_phone').value;
        if(val.toLowerCase().indexOf('test') > -1) return;

        let re = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/;
        if(!re.test(val)) document.getElementById('checkout_shipping_address_phone').value = '';
    }
});

let mobile = false;
if(jQuery(window).width() <= 999) {
    mobile = true;
    jQuery('.main__header').insertAfter('.banner');
    // if(Shopify.Checkout.step == 'payment_method') jQuery('.order-summary__section--discount').insertBefore('.step');
}

window.addEventListener('resize', function() {
    if(jQuery(window).width() <= 999 && mobile === false) {
        mobile = true;
        jQuery('.main__header').insertAfter('.banner');
    } else if(jQuery(window).width() > 999 && mobile === true) {
        mobile = false;
        jQuery('.main__header').insertBefore('.main__content');
    }
});

let scrollIndicator = document.querySelector('#order-summary__scroll-indicator');
if(scrollIndicator) {
    $(scrollIndicator).appendTo('.order-summary__section__content');
}

let sections = document.querySelector('.step__sections');
let recommendations = document.querySelector('.checkout-product-recommendations');
if(recommendations ) {
    // && typeof cart_items != 'undefined'
    sections.appendChild(recommendations);
    // getRecommendedProducts(cart_items);
}

let thankYouContinue = document.querySelector('.page--thank-you .step__footer__continue-btn');
if(thankYouContinue) {
    thankYouContinue.querySelector('.btn__content').innerHTML = 'Shop Best Sellers';
    thankYouContinue.setAttribute('href', 'https://www.calpaktravel.com/collections/best-sellers');
}

let addressLink = document.querySelector('.review-block .address');
if(addressLink) {
    addressLink = addressLink.closest('.review-block').querySelector('.review-block__link a');

    addressLink.addEventListener('click', function() {
        window.sessionStorage.setItem('returning-to-edit', 'address');
    });
}

let emailLink = document.querySelector('.review-block .review-block__content > *:not(.address)');
if(emailLink) {
    emailLink = emailLink.closest('.review-block').querySelector('.review-block__link a');

    emailLink.addEventListener('click', function() {
        window.sessionStorage.setItem('returning-to-edit', 'email');
    });
}

window.addEventListener("load", () => {
    let sbm = document.querySelector('#checkout_submit');
    if(sbm && sbm.classList.contains('btn--disabled')) {
        document.body.classList.add('enable-notice');
    }
});