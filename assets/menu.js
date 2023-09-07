"use strict";

if(window.debug) console.log('menu.js loaded');

function openMenu(menu) {
    document.body.classList.add('modal-open');

    const header = document.querySelector('.shopify-section--header');
    document.querySelector(`.menu-popup--${menu}`).classList.add('menu-popup--visible');
    header.setAttribute('data-menu', menu);
    if(document.body.classList.contains('modal-open')){
     document.body.setAttribute('role', 'dialog');
     document.body.setAttribute('aria-modal', 'true');
    }
    
}
if (!document.body.classList.contains('modal-open')) {
  document.body.removeAttribute('role');
  document.body.removeAttribute('aria-modal');
}
const slideMenuLinks = document.querySelectorAll('.slide-menu-item > .slide-menu__sub-button');
if(slideMenuLinks.length > 0) slideMenuLinks.forEach(slideMenuLink => slideMenuLink.addEventListener('click', function(e) {
    e.preventDefault();
    const menu = this.closest('.slide-menu');
    if(!menu) return;
    const submenu = menu.querySelector('.slide-menu');
    
    if(submenu) {
        const menuItem = this.closest('.slide-menu-item');
        const currentLevel = Number(menu.getAttribute('data-level'));

        menuItem.classList.add('slide-menu-item--active');
        menuItem.querySelector('a').setAttribute('aria-selected', 'true');
        menuItem.querySelector('.slide-menu__sub-button').setAttribute('aria-expanded', 'true');
     
        menu.closest('.slide-menu__container').style.setProperty('--depth', currentLevel + 1);
    }
}));

// Find the tab panel element
const tabPanel = document.querySelector('[role="tabpanel"]');

// Get the ID of the associated tab element
const tabId = tabPanel.getAttribute('aria-controls');

// Set the aria-labelledby attribute to the ID of the associated tab
tabPanel.setAttribute('aria-labelledby', tabId);

const mobileMenuBackLinks = document.querySelectorAll('.slide-menu-item--back');
if(mobileMenuBackLinks.length > 0) mobileMenuBackLinks.forEach(mobileMenuBackLink => mobileMenuBackLink.addEventListener('click', function(e) {
    e.preventDefault();
    let menu = this.closest('.slide-menu');
    let currentLevel = Number(menu.getAttribute('data-level'));
    if(currentLevel > 0) {
        menu.closest('.slide-menu__container').style.setProperty('--depth', currentLevel - 1);
        menu.closest('.slide-menu-item').setAttribute('aria-expanded', 'false');
        menu.closest('.slide-menu-item').classList.remove('slide-menu-item--active');
        //menu.closest('.slide-menu-item a').setAttribute('aria-selected', 'false');
        menu.parentNode.querySelector('.slide-menu__sub-button').setAttribute('aria-expanded', 'false');
    }
}));

let menuItems = document.querySelectorAll('.menu-item > a');
for(let i = 0; i < menuItems.length; i++) menuItems[i].addEventListener('click', e => {  
    if(e.target.classList.contains('has-menu')){
        e.preventDefault();
    } else {
        return;
    }
    const closestMenu = e.target.closest('.menu-popup');
    const menuItem = e.target.closest('.menu-item');
    const id = menuItem.getAttribute('data-id');
    let parentMenu = e.target.closest('.menu');
    if(parentMenu) {
        let actives = parentMenu.querySelectorAll('.menu-item--active');
        for(let i = 0; i < actives.length; i++){
            actives[i].classList.remove('menu-item--active');
            actives[i].querySelector('a').setAttribute('aria-selected', 'false');
            actives[i].querySelector('a').setAttribute('aria-current', 'false');
            actives[i].querySelector('a').setAttribute('tabindex', '-1');
        }
    }

    const activeDyn = closestMenu.querySelectorAll('.menu__dynamic-element--active');
    for(let i = 0; i < activeDyn.length; i++) activeDyn[i].classList.remove('menu__dynamic-element--active');
    const eligibleDyn = closestMenu.querySelectorAll('.menu__dynamic-element[data-id~="' + id + '"]');
    for(let i = 0; i < eligibleDyn.length; i++) eligibleDyn[i].classList.add('menu__dynamic-element--active');

    const mediaGrid = closestMenu.querySelector('.media-grid');
    const activeMediaCells = mediaGrid.querySelectorAll('.menu__dynamic-element--active');
    mediaGrid.setAttribute('data-num', activeMediaCells.length);

    menuItem.classList.add('menu-item--active');
    menuItem.querySelector('a').setAttribute('aria-selected', 'true');
    menuItem.querySelector('a').setAttribute('aria-current', 'true');
    menuItem.querySelector('a').setAttribute('tabindex', '0');
});

    // ADA custom radio JS solution - Parent menu links
    
    function customTabsMenu(){
        const swatchesKeyContainerUnit = document.querySelectorAll('.menu-popup__main .menu.tablist'); 
      [].map.call(swatchesKeyContainerUnit, (container => {
        let colorButtons = container.querySelectorAll('.menu-item > a');
        [].map.call(colorButtons, (colorButton) => {
            colorButton.addEventListener('click', function(e) {
                selectColorButton(e.target);
              });
          });
          container.addEventListener('keyup', function(e) {
              switch(e.key) {
                case 'ArrowUp':
                case 'ArrowLeft':
                  selectPreviousColorButton(e.target);
                  break;
                  
                case 'ArrowDown':
                case 'ArrowRight':
                  selectNextColorButton(e.target);
                  break;
                  
                case ' ':
                  selectColorButton(e.target);
                  break;
              }
            });
            // secondary functions
            function selectPreviousColorButton(colorButton) {
                let index = Array.prototype.slice.call(colorButtons).indexOf(colorButton);
                
                if(index > 0) {
                  selectColorButton(colorButtons[index - 1]);
                } else {
                  selectColorButton(colorButtons[colorButtons.length - 1]);
                }
              }
              
              function selectNextColorButton(colorButton) {
                let index = Array.prototype.slice.call(colorButtons).indexOf(colorButton);
                
                if(index < colorButtons.length - 1) {
                  selectColorButton(colorButtons[index + 1]);
                } else {
                  selectColorButton(colorButtons[0]);
                }
              }
              
              function selectColorButton(colorButton) {
                // Deselect all other color buttons 
                colorButtons.forEach(function(otherColorButton) {
                  otherColorButton.setAttribute('tabindex', -1);
                  
                });
                
                // Select the provided color button
                colorButton.setAttribute('tabindex', 0);
                
                colorButton.focus();
              }
      }));
            
    }
    
    setTimeout(() => {
        customTabsMenu();
    }, 500);

// End ADA custom radio JS solution - Parent menu links



// ADA swatches keyboard navigation
function customRadioButtonsMenuSide(){
  const swatchesKeyContainerUnit = document.querySelectorAll('.shop-menu-slider .product-unit .product-unit__swatches'); 
  [].map.call(swatchesKeyContainerUnit, (container => {
    customRadioKeyboardNavMenu(container);
  }));     
}
  setTimeout(()=>{
      customRadioButtonsMenuSide();
  }, 500)

/* GENERAL RADIO BUTTONS KAYBOARD NAVIGATION */
function customRadioKeyboardNavMenu(container) {
    
        
  container.addEventListener('keyup', function(e) {
      console.log(e.target);
      let colorButtons = container.querySelectorAll('.color-swatch');
      [].map.call(colorButtons, (colorButton) => {
          colorButton.addEventListener('click', function(e) {
              selectColorButton(e.target);
          });
      });


      
        switch(e.key) {
          case 'ArrowUp':
          case 'ArrowLeft':
            e.preventDefault();
            selectPreviousColorButton(e.target);
            break;
            
          case 'ArrowDown':
          case 'ArrowRight':
            e.preventDefault();
            selectNextColorButton(e.target);
            break;
            
          case ' ':
            selectColorButton(e.target);
            break;
        }
        // secondary functions
      function selectPreviousColorButton(colorButton) {
          let index = Array.prototype.slice.call(colorButtons).indexOf(colorButton);
          
          if(index > 0) {
            selectColorButton(colorButtons[index - 1]);
          } else {
            selectColorButton(colorButtons[colorButtons.length - 1]);
          }
        }
        
        function selectNextColorButton(colorButton) {
          let index = Array.prototype.slice.call(colorButtons).indexOf(colorButton);
          
          if(index < colorButtons.length - 1) {
            selectColorButton(colorButtons[index + 1]);
          } else {
            selectColorButton(colorButtons[0]);
          }
        }
        
        function selectColorButton(colorButton) {
          // Deselect all other color buttons 
          colorButtons.forEach(function(otherColorButton) {
            otherColorButton.setAttribute('tabindex', '-1');
            otherColorButton.setAttribute('aria-checked', false);
          });
          
          // Select the provided color button
          colorButton.setAttribute('tabindex', '0');
          colorButton.setAttribute('aria-checked', true);
          colorButton.focus();
        }
      });
}