"use strict";

window.addEventListener('load', async (e) => {

    endrockExperiment('yhiK_GY6RE2CH3HINFUxYw').then(variant => {
        if(variant === '1'){
            document.querySelector('.pdp-bundle').classList.remove('hidden');
        }
    });
    
    if(!scriptLoaded){
        await activateCart();
    }

    //Controller swatches
    const swatches = document.querySelectorAll('.pdp__swatches-groups .pdp__swatches .color-swatch:not(.product-option--na)');
    swatches.forEach(swatch => {
        swatch.addEventListener('click', (e) => {
            const bundleSwatch = document.querySelector(`.pdp-bundle .main-product .product-unit__swatches .color-${e.target.dataset.value}`);
            bundleSwatch.click();
        });
    });

    const loadQuickAdd = () => {
        document.querySelectorAll('.pdp-bundle .quick-view__link').forEach(link => link.classList.add('hide'));
        document.querySelector('.pdp-bundle').classList.add('product-grid--gap');
        document.querySelectorAll('.pdp-bundle .product-unit').forEach(product => product.classList.add('product-unit--quickadd'));
        document.querySelectorAll('.pdp-bundle .product-unit__colors').forEach(colors => {
            colors.classList.add('product-unit__colors--all', 'slide');
            colors.parentNode.parentNode.querySelector('.product-unit__colors--quickadd').append(colors)
        });
        document.querySelectorAll('.pdp-bundle .product-unit__button').forEach(product => product.classList.add('product-unit__button--active'));
        document.querySelectorAll('.pdp-bundle .product-unit__swatches').forEach(swatches => {
            swatches.classList.add('slider');
            const sliderWrapper = swatches.parentNode;
            sliderWrapper.innerHTML += `<button class="round-icon slider__control slider__control--prev round-icon--prev" title="Previous"></button><button class="round-icon slider__control slider__control--next round-icon--next" title="Next"></button>`;
            sliderWrapper.classList.add('slider__wrapper', 'slider__wrapper--start');
                        
            checkSlider(sliderWrapper.querySelector('.slider'));
            const checkMutations = (mutations) => {
                mutations.forEach(mutation => {
                    if(mutation.target.className.indexOf('slider__wrapper--loaded') > -1){
                        sliderWrapper.setAttribute('data-slide', 1);
                        sliderWrapper.setAttribute('data-slide-mob', 1);
                        observer.disconnect();
                    }
                });
            }
        
            const options = {
                attributes : true,
                attributeFilter : ['style', 'class']
            }

            let observer = new MutationObserver(checkMutations);
            observer.observe(sliderWrapper, options);

            
        });
    }
    loadQuickAdd();

    const bundleAdd = document.querySelectorAll('.button--bundle');
    bundleAdd.forEach(button => {
        button.addEventListener('click', (e) => {
            console.log('Set Bundle: Adding to cart')
            const form = e.target.closest('form');
            let data = [...new FormData(form)]; //Transformig the data into an array
            
            const formData = {
                cb: Date.now(),
                items: [],
                sections: 'cart-items,cart-json' 
            }
    
            for(let i in data){
                if(data[i][0] === 'id'){
                    let obj = {
                        id: data[i][1],
                        quantity: 1
                    }
                    formData.items.push(obj);
                }
            }
            
            
            fetch(`${routes.cart_add_url}.js`, {
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData),
                method: 'post'
            }).then(response => {
                if(!response.ok) {
                    if(response.status == 422) {
                        alert("Product not avalable!");
                    } else {
                        alert("Error adding product!");
                    }
        
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json()
            }).then(data => {
                updateCart(data);
                openCart();
            });
        });
    });
});


const endrockExperiment = (experimentId) => {
    return new Promise((resolve) => {
      (async () => {
        if (window.dataLayer) {
          await window.dataLayer.push({ event: "optimize.activate" });
        }
  
        // Set a timeout to stop checking for the variant after 10 seconds
        const timeoutId = setTimeout(() => {
          clearInterval(intervalId);
          resolve('0');
        }, 10000);
  
        // Use setInterval to check for the variant every 100ms
        const intervalId = setInterval(() => {
          if (window.google_optimize !== undefined) {
            clearInterval(intervalId);
            clearTimeout(timeoutId);
            resolve(window.google_optimize.get(experimentId) ?? '0');
          }
        }, 100);
      })();
    });
};