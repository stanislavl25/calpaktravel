"use strict";

const filterGroupList = document.querySelector('.slider--filt-col');
const filteredContainer = document.querySelector('.shopify-section--product-grid');
const currentFilters = document.querySelector('.current-filters-list');

function renderColorGroups() {
    if(!filteredContainer) {
        console.log("ERROR", "Nothing to filter!");
        return false;
    }

    for(let color in color_groups) {
        let el = document.createElement('button');
        el.classList.add('slide');
        el.classList.add('filt-col-group');
        el.setAttribute('data-value', color);
        el.setAttribute('title', color);
        el.innerHTML = `<span class="color-group color-group-${color}"></span>${color}`;
        filterGroupList.appendChild(el);
    }

    checkSlider(filterGroupList);

    let colGroupButtons = document.querySelectorAll('.filt-col-group');
    if(colGroupButtons.length) colGroupButtons.forEach(colGroupButton => colGroupButton.addEventListener('click', (e) => {
        e.preventDefault();
        const target = e.target;

        target.classList.toggle('filt-col-group--active');
        applyFilter();
    }));
}

function initFilter() {
    const products = filteredContainer.querySelectorAll('.product-unit:not(.product-unit--loaded)');
    let promises = [];
    products.forEach(product => promises.push(activateProductUnit(product)));

    Promise.all(promises).then(renderColorGroups);
}

if(filterGroupList) initFilter();

function filterUnitByColor(product, colors) {
    const unitColors = product.querySelectorAll('.color-swatch');
    let unitColorValues = [];

    unitColors.forEach(unitColor => {
        if(unitColor.classList.contains('color-swatch--na')) unitColorValues.push(unitColor.getAttribute('data-value'));
        else unitColorValues.unshift(unitColor.getAttribute('data-value'));
    });

    let found = false;

    for(let j = 0; j < colors.length; j++) {
        const activeColorValue = colors[j];

        for(let k = 0; k < unitColorValues.length; k++) {
            const unitColorValue = unitColorValues[k];

            if(color_groups[activeColorValue].indexOf(unitColorValue) > -1) {
                const selectedSwatch = product.querySelector('.color-swatch[data-value="' + unitColorValue + '"]');

                selectedSwatch.classList.add('color-swatch--filter');

                if(!found) {
                    found = true;
                    selectedSwatch.click();
                }
                // break;
            }
        }

        // if(found === 0) break;
    }

    if(found == false) product.classList.add('product-unit--filtered-out');
}

function updateCurrentFilters(colors = []) {
    currentFilters.innerHTML = '';

    if(colors.length > 0) {
        colors.forEach(color => {
            let colorEl = `<button title="Remove" class="current-filter" data-value="${color}">
                <div class="color-group color-group-${color}"></div>
                <div class="current-filter__remove"></div>
            </button>`;

            currentFilters.innerHTML += colorEl;
        });
    }
}

function applyFilter() {
    const productUnits = filteredContainer.querySelectorAll('.product-unit');
    let activeColorValues = [];
    const activeColors = document.querySelectorAll('.collection-filters .filt-col-group--active');
    const colorNumbers = document.querySelectorAll('.filter__activator--color i');
    let filtered = false;

    if(activeColors.length > 0) activeColors.forEach(activeColor => {
        activeColorValues.push(activeColor.getAttribute('data-value'));

        colorNumbers.forEach(colorNumber => colorNumber.innerHTML = activeColors.length);

        filtered = true;
    }); else colorNumbers.forEach(colorNumber => colorNumber.innerHTML = '');

    for(let i = 0; i < productUnits.length; i++) {
        const product = productUnits[i];
        product.classList.remove('product-unit--filtered-out');
        const filteredColors = product.querySelectorAll('.color-swatch--filter');
        if(filteredColors.length > 0) filteredColors.forEach(filteredColor => filteredColor.classList.remove('color-swatch--filter'));

        if(activeColorValues.length > 0) filterUnitByColor(product, activeColorValues);
    }

    updateCurrentFilters(activeColorValues);

    if(filtered) filteredContainer.classList.add('section-filtered');
    else filteredContainer.classList.remove('section-filtered');
}

function resetFilter() {
    const activeColors = document.querySelectorAll('.filt-col-group--active');
    if(activeColors.length > 0) activeColors.forEach(activeColor => activeColor.classList.remove('filt-col-group--active'));

    applyFilter();
}

const closeFilters = document.querySelectorAll('.filters__close');
if(closeFilters.length > 0) closeFilters.forEach(closeFilter => closeFilter.addEventListener('click', () => {
    closeFilter.closest('.collection-filters').removeAttribute('data-active');
}));

const resetFilterButtons = document.querySelectorAll('.filter__reset');
if(resetFilterButtons.length > 0) resetFilterButtons.forEach(resetFilterButton => resetFilterButton.addEventListener('click', resetFilter));

currentFilters.addEventListener('click', function(e) {
    if(e.target.classList.contains('current-filter')) {
        const value = e.target.getAttribute('data-value');
        let target = document.querySelector(`.filt-col-group--active[data-value="${value}"]`);
        if(target) target.classList.remove('filt-col-group--active');

        applyFilter();
    }
});