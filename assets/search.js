"use strict";
if(window.debug) console.log("search.js loaded");

const headerSearchPlaceholders = document.querySelector('.site-header__menu-item .search-placeholders__inner');
if(headerSearchPlaceholders) {
    let searchPlaceholders = document.querySelector('.search-input__container .search-placeholders');
    searchPlaceholders.setAttribute('data-num', headerSearchPlaceholders.parentNode.getAttribute('data-num'));
    searchPlaceholders.querySelector('.search-placeholders__inner').innerHTML = headerSearchPlaceholders.innerHTML;
}

const seachSynonymsTerms = [
    'purple',
    'wandr',
    'cyprus',
    'computer',
    'animal',
    'round',
    'suitcase',
    'usb',
    'floral',
    'malden',
    'tustin',
    'indio',
    'diaper',
    'baby',
    'hatbox',
    'passport',
    'toiletries'
];
const seachSynonymsValues = [
    'lavender',
    'hue',
    'hue',
    'laptop',
    'cheetah',
    'baye',
    'luggage',
    'power',
    'bloom',
    'hue',
    'hue',
    'hue',
    'luka duffel',
    'luka duffel',
    'baye',
    'kaya wallet',
    'toiletry'
];

let searchInput = document.querySelectorAll('.search-input');
let searchForms = document.querySelectorAll('.search-form');
let searchOverlay = document.querySelector('.search-popup__overlay');
let searchThrottle = false;
let lastSearch = false;
let all_products_cache = false;
let ga_send_timeout = false;

fetch(`/collections/${settings.bestSellers}/products.json?limit=250`).then(response => response.json()).then(data => all_products_cache = data);

searchForms.forEach(searchForm => searchForm.addEventListener('submit', function(e) {
    e.preventDefault();
    this.querySelector('.search-input').blur();
}));

function similarity(s1, s2) {
    var longer = s1;
    var shorter = s2;
    if (s1.length < s2.length) {
        longer = s2;
        shorter = s1;
    }
    var longerLength = longer.length;
    if (longerLength == 0) {
        return 1.0;
    }

    return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

function similarity2(s1, s2) {
    let split1 = s1.split(' ');
    let split2 = s2.split(' ');
    let sum = 0, max = 0, temp = 0;
    
    for(var i = 0; i < split1.length; i++) {
        max = 0;
        for(var j = 0; j < split2.length; j++) {
            temp = similarity(split1[i], split2[j]);
            if(max < temp) max = temp;
        }
        sum += max / split1.length; 
    } 
    
    if(sum == 1 && s1.length != s2.length) sum = 0.95;
    return sum; 
}

function editDistance(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    var costs = [];
    for (var i = 0; i <= s1.length; i++) {
        var lastValue = i;
        for (var j = 0; j <= s2.length; j++) {
            if (i == 0) costs[j] = j;
            else {
                if (j > 0) {
                    var newValue = costs[j - 1];
                    if (s1.charAt(i - 1) != s2.charAt(j - 1)) {
                        if(
                            (i > 1 && j > 1 &&
                            s1.charAt(i - 2) == s2.charAt(j - 1) &&
                            s1.charAt(i - 1) == s2.charAt(j - 2))
                            ||
                            (s1.length > i && s2.length > j &&
                            s1.charAt(i) == s2.charAt(j - 1) &&
                            s1.charAt(i - 1) == s2.charAt(j))
                        );// newValue += 0.5;
                        else newValue = Math.min(newValue, lastValue, costs[j]) + 1;
                    }

                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
        }
        if (i > 0) costs[s2.length] = lastValue;
    }

    return costs[s2.length];
}

function getOneVariant(variants, sale) {
    if(!sale) return variants[0];
    else for(let i = 0; i < variants.length; i++) if(variants[i].compare_at_price * 1 > variants[i].price * 1) return variants[i];
    return false;
}

function getMatchedVariants(product, search, colors, visible_variants, ambiguity, or, sale) {
    let best_match = [];

    // The amount Sim affects the order
    let orderAffectedBySim = 1;

    // If the search is empty
    if(search.length == 0 && colors.length == 0) {
        let one_variant = getOneVariant(visible_variants, sale);
        if(!one_variant) return false;
        return [
            0.66,
            one_variant,
            orderAffectedBySim
        ];
    }

    // Searching for words in text
    if(search.length > 0) {
        let search_strings = search;

        // Searching for strings separately
        if(!or) search_strings = [search.join(' ')];

        let prod_title = product.title.toLowerCase().replace(' and ', ' ').replace('-', ' ');
        let prod_type = product.product_type.toLowerCase().replace('-', ' ');
        let prod_vendor = product.vendor.toLowerCase().replace('-', ' ');
        let check_body_laptop = false;
        let check_body_fanny = false;
        
        for(let i = 0; i < search_strings.length; i++) {
            let search_str = search_strings[i];

            let title_sim = 0;
            if(!or) {
                let title_explode = prod_title.split(' ');
                for(let j = 0; j < title_explode.length; j++) {
                    if(search.indexOf(title_explode[j]) > -1) title_sim = 0.93;
                    break;
                }
            }

            if(title_sim == 0) {
                if(prod_title.indexOf(search_str) > -1) title_sim = (0.9 - 0.004 * prod_title.indexOf(search_str));
                else title_sim = similarity2(search_str, prod_title);
            }

            let type_sim = similarity2(search_str, prod_type) * 0.85;
            let vendor_sim = similarity2(search_str, prod_vendor) * 0.85;

            let max_val = Math.max(type_sim, title_sim, vendor_sim);
            if(!check_body_laptop) {
                check_body_laptop = similarity2('laptop', search_str) > 0.8;
                if(check_body_laptop) max_val = Math.max( max_val, similarity2(search_str, product.body_html.toLowerCase()) );
            }
            if(!check_body_fanny) {
                check_body_fanny = similarity2('fanny', search_str) > 0.8;
                if(check_body_fanny) max_val = Math.max( max_val, similarity2(search_str, product.body_html.toLowerCase()) );
            }

            if(max_val > 0.67) {
                if(max_val > title_sim && title_sim > 0.66) max_val *= 1.1;

                if(best_match.length == 0 || best_match[0] < max_val) best_match = [
                    max_val,
                    getOneVariant(visible_variants, sale),
                    orderAffectedBySim * 1.5,
                    i
                ];
            }
        }
        
        if(best_match.length == 0) {
            if (check_body_laptop) {
                for(let i = 0; i < search.length; i++) {
                    if(product.body_html.indexOf('laptop') > -1) {
                        best_match = [0.67, getOneVariant(visible_variants, sale), orderAffectedBySim* 1.5, i];
                        break;
                    }
                }
            } else if (check_body_fanny) {
                for(let i = 0; i < search.length; i++) {
                    if(product.body_html.indexOf('fanny') > -1) {
                        best_match = [0.67, getOneVariant(visible_variants, sale), orderAffectedBySim* 1.5, i];
                        break;
                    }
                }
            }
        }

        // If nothing found, and the search is not ambiguous -- return false
        if(!ambiguity && best_match.length == 0 || best_match[1] === false) return false;
    }
    
    if(colors.length > 0) {
        let color_match = [];
        for(let j = 0; j < colors.length; j++) {
            let search_word = colors[j];

            // Main color search
            for(let i = 0; i < visible_variants.length; i++) {
                let variant = visible_variants[i];
                let option1 = handleize(variant.option1);

                const sim = similarity2(search_word, option1) - j * 0.02;
                if( (!sale || (variant.compare_at_price * 1) > (variant.price * 1)) && sim > 0.9 && (color_match.length == 0 || color_match[0] < sim) ) {

                    // console.log(product.title, search_word, option1, sim);
                    color_match[0] = sim;
                    color_match[1] = variant;
                    color_match[2] = orderAffectedBySim;

                    if(sim == 1) break;
                }
            }

            // Backup related color search
            if(color_match.length == 0) for(let i = 0; i < visible_variants.length; i++) {
                let variant = visible_variants[i];
                let option1 = handleize(variant.option1);
                
                for( var key in color_groups ) {
                    const sim = similarity2(search_word, key.replace('-', ' ')) - j * 0.02;
                    if((!sale || (variant.compare_at_price * 1) > (variant.price * 1)) && sim > 0.9 && (color_match.length == 0 || color_match[0] < sim) ) {
                        for( let k = 0; k < color_groups[key].length; k++ ) {
                            if(color_groups[key][k] == option1) {
                                color_match[0] = sim * 0.9;
                                color_match[1] = variant;
                                color_match[2] = orderAffectedBySim;
                            }
                        }
                    }
                }

            }
        }

        if(!ambiguity && best_match.length > 0 && color_match.length == 0) return false;
        else if(color_match.length > 0) {
            if(best_match.length == 0) {
                best_match = color_match;
                best_match[3] = 0;
            } else best_match[1] = color_match[1];
        }
    }

    if(best_match.length == 0 || best_match[0] <= 0.66 || best_match[1] === false) return false;
    return best_match;
}

function createSearchItem(product, available, matchedVariant, products_target) {
    let newItem = document.createElement('div');
    newItem.classList.add('search-result__product');
    let variant = '';
    if(matchedVariant[1]) variant = handleize(matchedVariant[1].option1);

    products_target.appendChild(newItem);

    fetch(`/products/${product.handle}/${variant}?view=unit`).then(response => response.text()).then(data => {
        newItem.innerHTML = data;
        const productUnit = newItem.querySelector('.product-unit');
        if(productUnitsObserver && productUnit) productUnitsObserver.observe(productUnit);

        const qv = productUnit.querySelector('.quick-view__link');
        if(qv) qv.addEventListener('click', quickViewClick);

        let countdown_ticks = productUnit.querySelectorAll('.countdown-timer');

        if(countdown_ticks.length) {
            updateTimeouts(countdown_ticks);
            setInterval(() => updateTimeouts(countdown_ticks), 1000);
        }
    });

    let order = 500;
    if(typeof matchedVariant[2] != 'undefined') order -= Math.round(matchedVariant[2] * matchedVariant[0] * 200);
    if(typeof matchedVariant[3] != 'undefined') order += matchedVariant[3] * 50;
    if(!available) order += 100;
    if(product.title.indexOf('Luggage Cover') > -1) order = 200;
    newItem.style.order = order;
}

function searchProductsForMatches(products, search, color_search, ambiguity, or, sale, products_target) {
    let found = 0;
    for(let i = 0; i < products.length; i++) {
        let product = products[i];

        if(product.price == 0 || product.tags.indexOf('do not display') > -1) continue;
        
        let hide = [];
        let preorder = false;
        product.tags.forEach(tag => {
            if(tag.substring(0, 5) == 'hide:') hide.push(...tag.substring(5).toLowerCase().split(';'));
            else if(tag.substring(0, 13) == 'early-access:') hide.push(...tag.substring(5).toLowerCase().split(';'));
            else if(tag == 'preorder' || tag.substring(0, 9) == 'preorder:') {
                let explode = tag.split(':');
                if(explode.length < 3) preorder = true;
                else preorder = explode[2].split(';');
            }
        });

        let visible_variants = [];
        let count_available = 0;
        // Getting all variants
        product.variants.forEach(variant => {
            let option1 = handleize(variant.option1);

            if(hide.indexOf(option1) === -1) {
                visible_variants.push(variant);
                if(variant.available) count_available++;
            }
        });


        let matchedVariant = getMatchedVariants(product, search, color_search, visible_variants, ambiguity, or, sale);
        
        // if(!matchedVariant && similarity2('Compakt shoe bag', product.title) > 0.9 && similarity2(search.join(' '), 'packing cubes') > 0.8) {
        //     matchedVariant = getMatchedVariants(product, [], color_search, visible_variants, true, false, sale);
        // }
        
        if(!matchedVariant) continue;
        
        found++;

        createSearchItem(product, count_available > 0, matchedVariant, products_target);
    }

    return found;
}

function fillSearchProducts(results, container, search, color_search, ambiguity, or, sale) {
    const products_target = container.querySelector('.search-section[data-id="results"] .products__grid');

    if(products_target && typeof results.products != 'undefined') {
        const products = results.products;
        products_target.innerHTML = '';

        let products_found = 0;

        // Looking for both SEARCH and COLOR terms
        products_found = searchProductsForMatches(products, search, color_search, ambiguity, or, sale, products_target);

        if(search.length > 0 && color_search.length > 0) {
            // If nothing found -- ignore colors and look for SEARCH terms only
            if(products_found == 0) products_found = searchProductsForMatches(products, search, [], ambiguity, or, sale, products_target);

            // If nothing found -- ignore search and look for COLOR terms only
            if(products_found == 0) products_found = searchProductsForMatches(products, [], color_search, ambiguity, or, sale, products_target);
        }

        if(products_found == 0) container.setAttribute('data-status', 'empty');
        else {
            const searchNums = container.querySelectorAll('.search-num');
            searchNums.forEach(searchNum => searchNum.innerHTML = products_found);
            container.setAttribute('data-status', 'results');
        }
    }
}

function fillSearchResults(results, container) {
    const collectionsTarget = container.querySelector('.content-section--collections');
    let collectionsFound = 0;
    if(collectionsTarget && typeof results.collections != 'undefined') {
        const collections = results.collections;
        const collectionsTargetGrid = collectionsTarget.querySelector('.search__cards');

        collectionsTargetGrid.innerHTML = '';

        for(let i = 0; i < collections.length; i++) {
            let collection = collections[i];
            if(collection.body.indexOf('hide in search') > -1 || collection.title.toLowerCase().indexOf('early access') > -1) continue;

            collectionsFound++;

            let newItem = document.createElement('a');
            newItem.classList.add('search__card');
            newItem.setAttribute('href', collection.url);

            let img = '';
            if(collection.featured_image != null && typeof collection.featured_image != 'undefined' && collection.featured_image.url != null) {
                img = getImage(collection.featured_image.url, '300px', collection.title);
            }

            newItem.innerHTML = `<div class="search__card-image">${img}</div>
            <div class="search__card-title">${collection.title}</div>`;

            collectionsTargetGrid.appendChild(newItem);
        }

        const searchNums = container.querySelectorAll('.search-col-num');
        if(collectionsFound > 0) searchNums.forEach(searchNum => searchNum.innerHTML = collectionsFound);
    }

    if(collectionsFound == 0) container.classList.add('menu-popup--no-side');
}

function colorMatch(word) {
    let limit = 0.75;
    let results = [];

    if(word == 'on' || word == 'silk' || word == 'hand' || word == 'robe') return false;

    for( var key in color_groups ) {
        let sim = similarity2(word, key.replace('-', ' '));

        if(sim >= limit) {
            results.push([key, sim]);
        }

        for( let j = 0; j < color_groups[key].length; j++ ) {
            if(color_groups[key][j].indexOf('luka-') === 0 || color_groups[key][j].indexOf('hue-') === 0 || color_groups[key][j].indexOf('jen-') === 0 || color_groups[key][j].indexOf('ambeur-') === 0 || color_groups[key][j].indexOf('kaya-') === 0 || color_groups[key][j].indexOf('trnk-') === 0) continue;

            let sim = similarity2(word, color_groups[key][j].replace('-', ' '));

            if(sim >= limit) {
                results.push([color_groups[key][j], sim]);
            }
        }
    }

    if(results.length == 0) return false;
    return results;
}

function searchProcessQuery(split) {
    let or = false;

    if(split.indexOf('print') > -1) {
        if(split.indexOf('animal') > -1) split.splice(split.indexOf('print'), 1);
    }

    if(split.indexOf('bag') > -1) {
        if(split.indexOf('diaper') > -1 || split.indexOf('daiper') > -1 || split.indexOf('makeup') > -1) split.splice(split.indexOf('bag'), 1);
    }
    let unsplited = split.join(' ');

    if(similarity2('weekender bag', unsplited) >= 0.95) {
        split = ['duffel', 'vanity', 'small hat'];
        or = true;
    } else if(similarity2('weekender', unsplited) >= 0.9) {
        split = ['duffel', 'vanity', 'hue carry-on', 'ambeur carry-on', 'kaya lapt backpack', 'luka lapt backpack', 'neck pillow'];
        or = true;
    }

    if(similarity2('cross', unsplited) > 0.9 || similarity2('crossbody', unsplited) > 0.9) {
        split = ['wallet', 'belt'];
        or = true;
    }

    if(similarity2('car organizer', unsplited) >= 0.9) {
        split = ['car organizer', 'tech organizer', 'compakt zipper'];
        or = true;
    } else if(similarity2('organizer', unsplited) >= 0.9) {
        split = ['cubes', 'organizer', 'case', 'toiletry'];
        or = true;
    }

    if(similarity2('purse', unsplited) > 0.9) {
        split = ['tote', 'kaya wallet'];
        or = true;
    }

    if(similarity2('lunch', unsplited) > 0.9 || similarity2('lunchbox', unsplited) > 0.9) {
        split = ['lunch'];
    }

    if(similarity2('cover', unsplited) >= 0.95) {
        split = ['clear luggage cover', 'atkin'];
        or = true;
    }

    if(similarity2('vanity case', unsplited) >= 0.9) {
        split = ['vanity case', 'clear cosmetics'];
        or = true;
    }

    if(similarity2('cosmetics case', unsplited) >= 0.9) {
        split = ['cosmetics', 'hat', 'hue toiletry', 'luka toiletry'];
        or = true;
    }

    if(similarity2('makeup', unsplited) >= 0.95) {
        split = ['cosmetics', 'hat', 'toiletry'];
        or = true;
    }

    return [split, or];
}

function getAllProducts() {
    return fetch(`/collections/${settings.bestSellers}/products.json?limit=250`).then(response => response.json());
}

function fillCollectionSearch(handle, container) {
    fetch(`/collections/${handle}/products.json`).then(response => response.json()).then(data => {
        if(data.products != null && typeof data.products != 'undefined') {
            if(data.products.length > 0) {
                const products_target = container.querySelector('.search-section[data-id="results"] .products__grid');
                products_target.innerHTML = '';
                container.setAttribute('data-status', 'results');
                for(let i = 0; i < data.products.length; i++) {
                    createSearchItem(data.products[i], data.products[i].available, [0, false], products_target);
                }
            }
        }
    });
}

async function performSearch(el) {
    let s = el.value.trim();
    const form = el.closest('.search-form');
    const container = form.closest('.menu-popup--search');

    if(lastSearch === s) return;
    lastSearch = s;

    sessionStorage.setItem('search', lastSearch);

    if(s.length == 0) return container.setAttribute('data-status', 'init');

    container.querySelector('.menu-popup__mobile-nav').setAttribute('data-page', 0);

    let search = [];
    let color_search = [];
    let generated_words = 0;
    let ambiguity = false;
    let searchType = 'normal';

    let searchTextLC = s.toLowerCase().replace("'s", 's');

    if(searchTextLC.indexOf(':')) {
        const searchExpl = searchTextLC.split(':');
        if(searchExpl[0] == 'collection') {
            searchType = 'collection';
            s = searchExpl[1];
            fillCollectionSearch(searchExpl[1], container);
        }
    }

    let splitInit = searchTextLC.match(/\b(\w+)\b/g);
    if(!splitInit) return;
    
    const [split, or] = searchProcessQuery(splitInit);

    // Generating word combinations
    if(split.length == 2) {
        split.unshift(searchTextLC);
        generated_words = 1;
    } else if(split.length > 2) {
        let _split = Array.from(split);
        for(let i = 0; i < _split.length - 1; i++) {
            for(let j = i + 1; j < _split.length; j++) {
                generated_words++;
                split.unshift(_split[i] + ' ' + _split[j]);
            }
        }
    }

    // Synonym replace
    let split_length = split.length;
    for(let i = 0; i < split_length; i++) {
        let word = split[i];
        let escape = false;

        for(let j = 0; j < seachSynonymsTerms.length; j++) {
            if(seachSynonymsTerms[j] == word) {
                if(i < generated_words) {
                    split = [seachSynonymsValues[j]];
                    generated_words = 0;
                    escape = true;
                } else if(split.indexOf(seachSynonymsValues[j]) === -1) {
                    split[i] = seachSynonymsValues[j];
                }
                break;
            }
        }
        if(escape) break;
    }

    for(let i = 0; i < split_length; i++) {
        let word = split[i];
        for(let j = 0; j < seachSynonymsTerms.length; j++) {
            if(seachSynonymsTerms[j] != word && similarity2(seachSynonymsTerms[j], word) > 0.8) {
                if(split.indexOf(seachSynonymsValues[j]) === -1) {
                    split.push(seachSynonymsValues[j]);
                    break;
                }
            }
        }
    }

    let gen_color_match = false;
    let sale = false;
    let exclude_from_color = ['mini'];
    for(let i = 0; i < split.length; i++) {
        let word = split[i];
        let color_found = false;

        // Ignore "collection" keyword
        if(similarity2(word, 'collection') > 0.8) continue;

        // Search for items on sale only
        if(word == 'sale') {
            sale = true;
            continue;
        }

        if(exclude_from_color.indexOf(word) === -1) {
            // Look for color names
            let color_match = colorMatch(word);
            if(color_match !== false && !gen_color_match) {
                color_match.sort(function(a, b) {
                    if(a[1] < b[1]) return 1;
                    if(a[1] > b[1]) return -1;
                    return 0;
                });
                
                for(let k = 0; k < color_match.length; k++) {
                    let matched_color = color_match[k];

                    color_search.push(matched_color[0]);
                    
                    if(i < generated_words) { // Analyzing generated words
                        if(matched_color[1] > 0.98) {
                            gen_color_match = true;
                            break;
                        }
                    } else if(color_match[1] < 0.85) {
                        search.push(word);
                        ambiguity = true;
                    }
                }

                continue;
            }
        }

        if(!color_found && i >= generated_words) search.push(word);
    }

    if(color_search.length > 1) color_search = color_search.filter((x, i, a) => a.indexOf(x) == i);
    if(search.length > 1) search = search.filter((x, i, a) => a.indexOf(x) == i);

    if(search.indexOf('pack') > -1) {
        if(search.indexOf('fanny') > -1 || search.indexOf('fany') > -1) search.splice(search.indexOf('pack'), 1);
    }

    if(search.indexOf('bag') > -1) {
        if(search.indexOf('laptop') > -1) search.splice(search.indexOf('bag'), 1);
        if(search.indexOf('duffle') > -1 || search.indexOf('duffel') > -1) search.splice(search.indexOf('bag'), 1);
    }

    if(ga_send_timeout) clearTimeout(ga_send_timeout);
    ga_send_timeout = setTimeout(function() {
        if(lastSearch.length && ga) {
            // console.log('ga send', lastSearch);
            ga('send', 'pageview', 'https://www.calpaktravel.com/pages/search-results-page?q=' + encodeURIComponent(lastSearch));

            gtag('event', 'page_view', {
                page_title: 'Search',
                page_location: window.location.href,
                page_path: 'https://www.calpaktravel.com/pages/search-results-page?q=' + encodeURIComponent(lastSearch)
            });
        }
    }, 2000);

    if(color_search.indexOf('wavy') > -1) {
        search.push('wavy');
        ambiguity = true;
    }

    if(search.length == 0 && color_search.length == 0 && sale == false) {
        container.setAttribute('data-status', 'init');
        return;
    }

    console.log(search, color_search, ambiguity, or, sale);

    let terms = container.querySelectorAll('.search-term');
    terms.forEach(term => term.innerHTML = stripHTML(s));
        
    if(all_products_cache === false) {
        form.classList.add('search-form--loading');
        all_products_cache = await getAllProducts();
        form.classList.remove('search-form--loading');
    }

    if(searchType == 'normal') fillSearchProducts(all_products_cache, container, search, color_search, ambiguity, or, sale);

    //// COLLECTIONS AND ARTICLES ////    
    container.classList.remove('menu-popup--no-side');
    fetch(`/search/suggest.json?q=${encodeURIComponent(s)}&resources[limit_scope]=each&resources[type]=page,collection&resources[limit]=10`).then(response => response.json()).then(response => fillSearchResults(response.resources.results, container));
}

// function openHeaderSearch() {
//     document.body.classList.add('search-active');
//     document.querySelector('.header-container .search-form').classList.add('search-form--displayed');
//     setTimeout(function() {
//         document.querySelector('.header-container .search-form').classList.add('search-form--active');
//     }, 0);

//     let input = document.querySelector('.header-container .search-form .search-form__input');
//     if(sessionStorage.getItem('search') !== null && typeof sessionStorage.getItem('search') != 'undefined' && sessionStorage.getItem('search').length && input.value.length == 0) {
//         input.value = sessionStorage.getItem('search');
//         document.querySelector('.header-container .search-form__result--products').classList.add('search-form__result--loading');
//         let form = document.querySelector('.header-container .search-form');

//         performSearch(input);
//     } else if(all_products_cache === false) jQuery.getJSON('/collections/best-sellers/products.json?limit=250').done((response) => all_products_cache = response);

//     input.focus();
// }

// if(sessionStorage.getItem('search') !== null && typeof sessionStorage.getItem('search') != 'undefined' && sessionStorage.getItem('search').length && all_products_cache === false) jQuery.getJSON('/collections/best-sellers/products.json?limit=250').done((response) => all_products_cache = response);

function closeHeaderSearch() {
    lastSearch = false;
    document.querySelector('.search-popup__content .menu-close').click();
}

if(searchInput.length) {
    if(searchOverlay) searchOverlay.addEventListener('click', closeHeaderSearch);

    for(let i = 0; i < searchInput.length; i++) {
        searchInput[i].addEventListener('keyup', function(event) {
            if(searchThrottle !== false) clearTimeout(searchThrottle);

            if((typeof event.key != 'undefined' && event.key === "Escape") || event.keyCode === 27) {
                closeHeaderSearch();
                return;
            }

            let el = this;
            searchThrottle = setTimeout(function() {

                if(el.classList.contains('search-input__404')) {
                    document.querySelector('.menu-popup--search').classList.add('menu-popup--visible');
                    document.body.classList.add('modal-open');
                    let mainSearchInput = document.querySelector('.menu-popup--search .search-input');
                    mainSearchInput.value = el.value;
                    el.value = "";
                    document.querySelector('.menu-popup--search .search-input').focus();
                    el = mainSearchInput;
                }

                performSearch(el);
            }, 300);
        });
    }
}

const searchCategoriesButtons = document.querySelectorAll('.search__collections-buttons .button');
searchCategoriesButtons.forEach(searchCategoriesButton => searchCategoriesButton.addEventListener('click', function(e) {
    e.preventDefault();

    const container = this.closest('.search-popup__content');
    if(!container) return;
    
    const input = container.querySelector('.search-input');
    if(!input) return;

    const handle = searchCategoriesButton.getAttribute('data-handle');
    input.value = `collection:${handle}`;

    performSearch(input);
}));

const mobileNavButtons = document.querySelectorAll('.menu-popup__mobile-nav button');
mobileNavButtons.forEach(mobileNavButton => mobileNavButton.addEventListener('click', function(e) {
    const target = this.getAttribute('data-target');
    this.closest('.menu-popup__mobile-nav').setAttribute('data-page', target);
}));