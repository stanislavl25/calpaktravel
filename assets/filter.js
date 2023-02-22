"use strict";

const filterGroupList = document.querySelector('.collection-filter__color-list');
const filteredContainer = document.querySelector('.shopify-section--product-grid');
const currentFilters = document.querySelector('.current-filters-list');

function renderColorGroups(productVariantSelects) {
    if(!filteredContainer) {
        console.log("ERROR", "Nothing to filter!");
        return false;
    }

    // filterGroupList.innerHTML = '';
    // filterGroupList.classList.remove('loading-animation');
    for(let color in color_groups) {
        let found = false;
        let count = 0;
        for(let i = 0; i < productVariantSelects.length; i++) {
            const options = productVariantSelects[i].querySelectorAll('option');
            let foundInProduct = false;

            for(let j = 0; j < options.length; j++) {
                if(color_groups[color].indexOf(options[j].getAttribute('data-option1')) > -1) {
                    found = true;
                    foundInProduct = true;
                    break;
                }
            }
            if(foundInProduct) count++;
            // if(found) break;
        }

        if(found) {
            let el = document.createElement('button');
            el.classList.add('filt-col-group');
            el.setAttribute('data-value', color);
            el.style.setProperty('--filt-order', 200 - count);
            el.setAttribute('title', color);
            el.innerHTML = `<span class="color-group color-group-${color}"></span>${color}`;
            filterGroupList.appendChild(el);
        }
    }

    let colGroupButtons = document.querySelectorAll('.filt-col-group');
    colGroupButtons.forEach(colGroupButton => colGroupButton.addEventListener('click', (e) => {
        e.preventDefault();
        const target = e.target;

        target.classList.toggle('filt-col-group--active');
        applyFilter();
    }));
}

function filterSetBestSellersOrder() {
    fetch(`/collections/${settings.bestSellers}/products.json?limit=250`)
    .then(response => response.json())
    .then(data => {
        for(let i = 0; i < data.products.length; i++) {
            let product = data.products[i];

            let matchingProds = filteredContainer.querySelectorAll(`.product-unit[data-handle="${product.handle}"]`);
            matchingProds.forEach(matchingProd => matchingProd.style.setProperty('--ord-best', i));
        }
    });
}

function filterSetDateOrder(unitVariants) {
    let unitVariantsOrdered = unitVariants.sort( (a, b) => {
        let aCreated = a.getAttribute('data-created') * 1,
            bCreated = b.getAttribute('data-created') * 1;
        if(aCreated > bCreated) return 1;
        if (aCreated < bCreated) return -1;
        return 0;
    });

    for(let i = 0; i < unitVariantsOrdered.length; i++) unitVariantsOrdered[i].closest('.product-unit').style.setProperty('--ord-date', i);
}

function filterSetPriceOrder(unitVariants) {
    let unitVariantsAsc = unitVariants.sort( (a, b) => {
        let aPrice = 999,
            bPrice = 999;

        if(a.hasAttribute('data-min-price')) aPrice = a.getAttribute('data-min-price') * 1;
        if(b.hasAttribute('data-min-price')) bPrice = b.getAttribute('data-min-price') * 1;

        if(aPrice > bPrice) return 1;
        if (aPrice < bPrice) return -1;
        return 0;
    });

    for(let i = 0; i < unitVariantsAsc.length; i++) {
        let unit = unitVariantsAsc[i].closest('.product-unit');
        unit.style.setProperty('--ord-pra', i);
        unit.style.setProperty('--ord-prd', unitVariantsAsc.length - i);
    }
}

function initCollectionSort(productVariantSelects) {
    let unitVariants = Array.prototype.slice.call(productVariantSelects, 0);

    filterSetBestSellersOrder();
    filterSetDateOrder(unitVariants);
    filterSetPriceOrder(unitVariants);

    const sortInputs = document.querySelectorAll('.collection-filter__sort input[name="sort"]');
    sortInputs.forEach(sortInput => sortInput.addEventListener('click', () => {
        const selectedSort = document.querySelector('.collection-filter__sort input[name="sort"]:checked');
        if(selectedSort) {
            const sortValues = document.querySelectorAll('.filter__activator--sort i, .collection-filter__sort .collection-filter__title i');
            sortValues.forEach(sortValue => sortValue.innerHTML = selectedSort.getAttribute('data-title'));
        }

        applyFilter();
    }));
}

function initFilter() {
    const products = filteredContainer.querySelectorAll('.product-unit');
    let promises = [];
    products.forEach(product => promises.push(activateProductUnit(product)));

    const filters = document.querySelector('.collection-filters');
    if(filters) filters.classList.add('collection-filters--loaded');
    
    Promise.all(promises).then(() => {
        const productVariantSelects = filteredContainer.querySelectorAll('.product-unit .variant-select');
        renderColorGroups(productVariantSelects);
        initCollectionSort(productVariantSelects);
    });

}

function filterUnitByColor(product, colors) {
    const unitColors = product.querySelectorAll('.color-swatch');
    let unitColorValues = [];

    unitColors.forEach(unitColor => {
        if(unitColor.classList.contains('product-option--na')) unitColorValues.push(unitColor.getAttribute('data-value'));
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
            let colorEl = `<button title="Remove" aria-label="Remove ${color} from active filters" class="current-filter" data-value="${color}">
                <div class="color-group color-group-${color}"></div>
                <div class="current-filter__remove"></div>
            </button>`;

            currentFilters.innerHTML += colorEl;
        });
    }
}

function filterUnitByProductList(product, productList = []) {
    if(productList.length == 0) {
        product.classList.add('product-unit--filtered-out');
        return false;
    }

    const id = product.getAttribute('data-id');
    if(productList.indexOf(id) === -1) {
        product.classList.add('product-unit--filtered-out');
        return false;
    }

    return true;
}

async function getProductsFilteredByCategory(activeParentCollection) {
    return new Promise(async resolve => {
        let filteredProducts = false;

        const allSubcollections = document.querySelectorAll('.filter__collection');

        if(activeParentCollection) {
            let index = activeParentCollection.getAttribute('data-index');

            activeParentCollection.querySelector('i').innerHTML = '';
            
            allSubcollections.forEach(allSubcollection => {
                allSubcollection.classList.remove('filter__collection--active', 'slide');
                if(allSubcollection.getAttribute('data-group') != index) allSubcollection.classList.remove('filter__collection--selected');
            });

            const filterSubCollections = document.querySelectorAll(`.filter__collections .filter__collection[data-group="${index}"]`);
            if(filterSubCollections.length > 0) {
                document.querySelector('.filter__collections').classList.add('filter__collections--active');
                filterSubCollections.forEach(filterSubCollection => filterSubCollection.classList.add('filter__collection--active', 'slide'));
            } else document.querySelector('.filter__collections').classList.remove('filter__collections--active');
            
            if(activeParentCollection.hasAttribute('data-products')) {
                filteredProducts = activeParentCollection.getAttribute('data-products').split(',');
            } else if(activeParentCollection.hasAttribute('data-collection')) {
                const collectionList = await fetch(`/collections/${activeParentCollection.getAttribute('data-collection')}/products.json?limit=250`).then(response => response.json());
    
                filteredProducts = [];
                collectionList.products.forEach(product => filteredProducts.push(product.id + ''));
                activeParentCollection.setAttribute('data-products', filteredProducts.join(','));
            }
    
        } else {
            document.querySelector('.filter__collections').classList.remove('filter__collections--active');
            allSubcollections.forEach(allSubcollection => allSubcollection.classList.remove('filter__collection--selected'));
        }
        
        const activeCollection = document.querySelector('.filter__collection--selected');
        if(activeCollection) {
            let subCol = activeCollection.classList.contains('filter__collection--sub');
    
            let productList = [];

            if(activeCollection.hasAttribute('data-products')) {
                productList = activeCollection.getAttribute('data-products').split(',');
            } else if(activeCollection.hasAttribute('data-collection')) {
                const collectionList = await fetch(`/collections/${activeCollection.getAttribute('data-collection')}/products.json?limit=250`).then(response => response.json());
    
                collectionList.products.forEach(product => productList.push(product.id + ''));
                activeCollection.setAttribute('data-products', productList.join(','));
            }
    
            if(subCol) {
                let updatedList = [];
                productList.forEach(product => {
                    if(filteredProducts.indexOf(product) > -1) updatedList.push(product);
                });
                filteredProducts = updatedList;
            } else filteredProducts = productList;
        }

        resolve(filteredProducts);
    });
}

async function applyFilter() {
    const productUnits = filteredContainer.querySelectorAll('.product-unit');

    //// COLOR ////
    let activeColorValues = [];
    const activeColors = document.querySelectorAll('.collection-filters .filt-col-group--active');
    const colorNumbers = document.querySelectorAll('.filter__activator--color i, .collection-filter__color .collection-filter__title i');
    let filtered = false;

    if(activeColors.length > 0) {
        filtered = true;

        activeColors.forEach(activeColor => {
            activeColorValues.push(activeColor.getAttribute('data-value'));
            colorNumbers.forEach(colorNumber => colorNumber.innerHTML = activeColors.length);
        });
    } else colorNumbers.forEach(colorNumber => colorNumber.innerHTML = '');

    //// COLLECTIONS ////
    const activeCategory = document.querySelector('.collections-category--active');
    let filteredProducts = await getProductsFilteredByCategory(activeCategory);

    if(filteredProducts !== false) filtered = true;

    //// APPLY FILTERS TO PRODUCTS ////
    let categoryProductCount = 0;
    for(let i = 0; i < productUnits.length; i++) {
        const product = productUnits[i];
        product.classList.remove('product-unit--filtered-out');
        const filteredColors = product.querySelectorAll('.color-swatch--filter');
        if(filteredColors.length > 0) filteredColors.forEach(filteredColor => filteredColor.classList.remove('color-swatch--filter'));

        if(activeColorValues.length > 0) filterUnitByColor(product, activeColorValues);
        if(filteredProducts !== false && filterUnitByProductList(product, filteredProducts)) categoryProductCount++;
    }

    if(activeCategory) {
        if(filteredProducts === false) activeCategory.querySelector('i').innerHTML = productUnits.length;
        else activeCategory.querySelector('i').innerHTML = categoryProductCount;
    }

    //// SORT ////
    const selectedSort = document.querySelector('.collection-filter__sort input[name="sort"]:checked');
    if(selectedSort) {
        filteredContainer.setAttribute('data-sort', selectedSort.value);
    } else filteredContainer.removeAttribute('data-sort');

    //// ////
    updateCurrentFilters(activeColorValues);

    const activeProductsLeft = filteredContainer.querySelectorAll('.product-unit:not(.product-unit--filtered-out)');
    if(activeProductsLeft.length == 0) filteredContainer.classList.add('section-filtered--empty');
    else filteredContainer.classList.remove('section-filtered--empty');

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
    const filters = closeFilter.closest('.collection-filters');
    filters.setAttribute('aria-expanded', false);
    filters.classList.remove('collection-filters--active');
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