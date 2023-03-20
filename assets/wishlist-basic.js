"use strict";

let wishlist = [];
const heart = document.querySelector('.header__wishlist-link');
const wishlistContainer = document.querySelector('.wishlist__container');
const wishlistCounters = document.querySelectorAll('.wishlist-count');

if(!window.SwymCallbacks){
    window.SwymCallbacks = [];
}
if(heart) window.SwymCallbacks.push(updateWishlist);

function checkWishlistButton(button, variant_id = false) {
    let found = false;
    for(let i = 0; i < wishlist.length; i++) {
        if(variant_id == wishlist[i].epi) {
            found = true; break;
        }
    }

    if(found) {
        button.setAttribute('title', 'Remove from Wishlist');
        button.classList.add('wishlist__button--added');
    } else {
        button.setAttribute('title', 'Add to Wishlist');
        button.classList.remove('wishlist__button--added');
    }
}

function updateWishlist() {
    _swat.fetchWrtEventTypeET(async function(products){
        wishlist = products;
        wishlistCounters.forEach(wishlistCounter => wishlistCounter.innerHTML = wishlist.length);

        if(wishlist.length > 0) {
            heart.classList.add('header__wishlist-link--full');
        } else heart.classList.remove('header__wishlist-link--full');

        if(wishlistContainer) {
            if(typeof populateWishlist == 'undefined') await Promise.all([
                loadScript(scripts.wishlist),
                loadStyle(styles.wishlist),
                loadStyle(styles.wishlistPopup)
            ]);

            populateWishlist();
        }

        let buttons = document.querySelectorAll('.wishlist__button');
        buttons.forEach(button => {
            for(let i = 0; i < wishlist.length; i++) {
                if(button.getAttribute('data-vid') == wishlist[i].epi) {
                    button.setAttribute('title', 'Remove from Wishlist');
                    button.classList.add('wishlist__button--added');
                    break;
                }
            }
        })
    }, _swat.EventTypes.addToWishlist);
}

document.addEventListener('click', async e => {
    if(e.target && e.target.classList.contains('wishlist__button')) {
        e.preventDefault();
        
        e.target.classList.add('wishlist__button--loading');

        if(typeof processWishlistClick == 'undefined') await Promise.all([
            loadScript(scripts.wishlist),
            loadStyle(styles.wishlist),
            loadStyle(styles.wishlistPopup)
        ]);

        if(window._swat != undefined) processWishlistClick(e.target);
        else setTimeout(function() {
            if(window._swat != undefined) processWishlistClick(e.target);
            else e.target.classList.remove('wishlist__button--loading');
        }, 3000);
    }
});