"use strict";
const expandedverify = () => {
    let textDropdowns = document.querySelectorAll('.text-dropdown');
    const listTextDropdown = document.getElementById('text-dropdown__list');
    const listItems = listTextDropdown.querySelectorAll('li');

    if(textDropdowns.length > 0) textDropdowns.forEach(textDropdown => {
        if(textDropdown.classList.contains('text-dropdown--active')) {
            textDropdown.querySelector('#showcase_dropdown').setAttribute("aria-expanded", "true");
        } else {
            textDropdown.querySelector('#showcase_dropdown').setAttribute("aria-expanded", "false");
        }
        let selectedIndex = 1;
        listItems.forEach((li, index) => {
            if (li.classList.contains('text-dropdown__option--selected')) {
                selectedIndex = index;
                return;
            }
            textDropdown.querySelector('#showcase_dropdown').setAttribute("aria-labelledby", `text-dropdown__option__${selectedIndex}`);
          });
    });
}



const textDropdowns = document.querySelectorAll('.text-dropdown:not(.text-dropdown--loaded)');
if(textDropdowns.length > 0) textDropdowns.forEach(textDropdown => {
    textDropdown.classList.add('text-dropdown--loaded');
    let tdValue = textDropdown.querySelector('.text-dropdown__value');
    tdValue.addEventListener('click', function(e) {
        e.preventDefault();
        this.closest('.text-dropdown').classList.toggle('text-dropdown--active');
        this.toggleAttribute("aria-expanded", true);
        expandedverify();
    });
    // Trigger the dropdown on "Enter" key press
    tdValue.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            this.click();
        }
        
        if (e.key === ' ') {
            e.preventDefault();
        }
    });
    let tdOptions = textDropdown.querySelectorAll('.text-dropdown__option');
    if(tdOptions.length > 0) tdOptions.forEach(tdOption => tdOption.addEventListener('click', function(e) {
        e.preventDefault();
        const td = this.closest('.text-dropdown');

        let actives = this.parentElement.querySelector('.text-dropdown__option--selected');
        if(actives) {
        actives.classList.remove('text-dropdown__option--selected');
        
        actives.setAttribute('aria-selected', 'false');
        }
        
        this.classList.add('text-dropdown__option--selected');
        
        this.setAttribute('aria-selected', 'true');
        
        td.querySelector('.text-dropdown__value').innerHTML = this.innerHTML;
        td.querySelector('.text-dropdown__value').setAttribute('aria-activedescendant', this.getAttribute('id'));
        td.classList.toggle('text-dropdown--active');

        td.querySelector('.text-dropdown__value').setAttribute("aria-expanded", "false");
        expandedverify();

        let target = td.getAttribute('data-target');
        if(target) {
            let index = getIndex(this);
            let targetEl = document.querySelector(target);
            if(targetEl) {
                let targetEls = targetEl.querySelectorAll('.collection-showcase');
                for(let i = 0; i < targetEls.length; i++) {
                    if(targetEls[i].classList.contains('collection-showcase--active')) targetEls[i].classList.remove('collection-showcase--active');
                    if(i == index) targetEls[i].classList.add('collection-showcase--active');
                }
            }
            
        }
    }));
});
// keyboard navigation for dropdowns
  
// Get the <ul> element
const dropdownList = document.querySelector('.text-dropdown__inner');

// Get all the <button> elements inside the <ul>
const buttons = dropdownList.querySelectorAll('button');

// Initialize the index of the currently focused button
let focusedIndex = 0;

// Add event listener for keydown event
document.querySelector('.text-dropdown').addEventListener('keydown', function (event) {
    console.log(event.key);
    
  // Check if the key pressed is an arrow key
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    // Prevent the default behavior of scrolling the page
    event.preventDefault();

    // Move the focus to the previous or next button based on the arrow key pressed
    if (event.key === 'ArrowUp' && focusedIndex > 0) {
      focusedIndex--;
    } else if (event.key === 'ArrowDown' && focusedIndex < buttons.length - 1) {
      focusedIndex++;
    }

    // Remove the focus from the previously focused button
    buttons.forEach((button) => {
      button.setAttribute('aria-selected', 'false');
    });

    // Set the focus on the newly focused button
    buttons[focusedIndex].setAttribute('aria-selected', 'true');
    buttons[focusedIndex].focus();
    console.log(document.activeElement);
  } else if(event.key == 'Enter' || event.key == ' ') {
    document.activeElement.click();
    document.querySelector('#showcase_dropdown').focus();
}
 
  
});


// keyboard navigation ends