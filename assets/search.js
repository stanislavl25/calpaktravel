"use strict";
console.log("search.js loaded");

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
let searchForm = document.querySelectorAll('.search-form');
let searchOverlay = document.querySelector('.search-popup__overlay');
let searchThrottle = false;
let lastSearch = false;
let all_products_cache = false;
let ga_send_timeout = false;

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

function updateSearchItemVariant(variant, handle, item, backup_image) {
    let option1 = handleize(variant.option1);

    let item_links = item.querySelectorAll('a');
    for(let j = 0; j < item_links.length; j++) {
        let href = item_links[j].getAttribute('href').split('?');
        if(href.length == 1) href[1] = '_pos='+ (j + 1) + '&_psq=&_ss=e';
        item_links[j].setAttribute('href', '/products/' + handle + '/' + option1 + '?' + href[1]);
    }

    let sizes = '(max-width: 900px) 50vw, (max-width: 1080px) 150px, (max-width: 1300px) calc((90vw - 310px) / 4), calc((90vw - 310px) / 5)';

    if(variant.featured_image) item.querySelector('.simple-prod-cell__image').innerHTML = get_image(variant.featured_image.src, sizes, true);
    else item.querySelector('.simple-prod-cell__image').innerHTML = get_image(backup_image, sizes, true);
    
    // let price = formatPrice(variant.price);
    // if(variant.compare_at_price > variant.price) price = '<s>' + formatPrice(variant.compare_at_price) + '</s> ' + price;
    // item.querySelector('.simple-prod-cell__price').innerHTML = price;
}

function getOneVariant(variants, sale) {
    if(!sale) return variants[0];
    else for(let i = 0; i < variants.length; i++) if(variants[i].compare_at_price * 1 > variants[i].price * 1) return variants[i];
    return false;
}

function getMatchedVariants(product, search, colors, available_variants, ambiguity, or, sale) {
    let best_match = [];

    // The amount Sim affects the order
    let orderAffectedBySim = 1;

    // If the search is empty
    if(search.length == 0 && colors.length == 0) {
        let one_variant = getOneVariant(available_variants, sale);
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
                    getOneVariant(available_variants, sale),
                    orderAffectedBySim * 1.5,
                    i
                ];
            }
        }
        
        if(best_match.length == 0) {
            if (check_body_laptop) {
                for(let i = 0; i < search.length; i++) {
                    if(product.body_html.indexOf('laptop') > -1) {
                        best_match = [0.67, getOneVariant(available_variants, sale), orderAffectedBySim* 1.5, i];
                        break;
                    }
                }
            } else if (check_body_fanny) {
                for(let i = 0; i < search.length; i++) {
                    if(product.body_html.indexOf('fanny') > -1) {
                        best_match = [0.67, getOneVariant(available_variants, sale), orderAffectedBySim* 1.5, i];
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
            for(let i = 0; i < available_variants.length; i++) {
                let variant = available_variants[i];
                let option1 = handleize(variant.option1);

                let sim = similarity2(search_word, option1) - j * 0.02;
                if( (!sale || (variant.compare_at_price * 1) > (variant.price * 1)) && sim > 0.9 && (color_match.length == 0 || color_match[0] < sim) ) {

                    // console.log(product.title, search_word, option1, sim);
                    color_match[0] = sim;
                    color_match[1] = variant;
                    color_match[2] = orderAffectedBySim;

                    if(sim == 1) break;
                }
            }

            // Backup related color search
            if(color_match.length == 0) for(let i = 0; i < available_variants.length; i++) {
                let variant = available_variants[i];
                let option1 = handleize(variant.option1);
                
                for( var key in color_groups ) {
                    sim = similarity2(search_word, key.replace('-', ' ')) - j * 0.02;
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

function getMoreSearchInfo(handle, item) {
    $.ajax({
        'url': '/products/' + handle,
        'method': 'get',
        'data': {view: 'search', cb: Date.now() }
    }).done(function(data){
        data = JSON.parse(data);
        let stars = parseFloat(data.reviews) * 0.2;

        item.querySelector('.search-form__item-stars').style.maxWidth = (64 * stars) + 'px';
    });
}

function createSearchItem(product, available, matchedVariant, products_target, products_found, variantIsPreorder) {
    let newItem = document.createElement('div');
    newItem.classList.add('simple-prod-cell');
    products_target.appendChild(newItem);

    let order = 500;

    if(typeof matchedVariant[2] != 'undefined') order -= Math.round(matchedVariant[2] * matchedVariant[0] * 200);
    if(typeof matchedVariant[3] != 'undefined') order += matchedVariant[3] * 50;
    if(!available) order += 100;
    if(product.title.indexOf('Luggage Cover') > -1) order = 200;
    // console.log(matchedVariant, order);
    newItem.style.order = order;

    if(variantIsPreorder) newItem.classList.add('simple-prod-cell--preorder');

    let html = '';
    let url = '';
    if(typeof product.url != 'undefined') url = product.url;
    else url = '/products/' + product.handle;

    url += '?_pos=' + products_found + '&_psq=' + encodeURIComponent(lastSearch) + '&_ss=e&_v=1.0';

    html += '<a class="search-result--product simple-prod-cell__link" href="'+ url +'"><div class="simple-prod-cell__image simple-prod-cell__image--loading"></div></a>';
    html += '<div class="simple-prod-cell__info">';
        html += '<div class="simple-prod-cell__title"><a class="search-result--product simple-prod-cell__link" href="' + url + '">' + product.title.replace(' - Jade', '').replace(' - Final', '').replace(' - FW', '') + '</a></div>';

        let price_min = false, price_max = false, price_compare_min = false, price_compare_max = false;
        for(let i = 0; i < product.variants.length; i++) {
            let variant = product.variants[i];
            if(variant.price && !isNaN(variant.price) && variant.price > 0) {
                if(price_min === false || price_min > Number(variant.price)) price_min = Number(variant.price);
                if(price_max === false || price_max < Number(variant.price)) price_max = Number(variant.price);
            }
            if(variant.compare_at_price && !isNaN(variant.compare_at_price)) {
                if(price_compare_min === false || price_compare_min > Number(variant.compare_at_price)) price_compare_min = Number(variant.compare_at_price);
                if(price_compare_max === false || price_compare_max < Number(variant.compare_at_price)) price_compare_max = Number(variant.compare_at_price);
            }
        }

        html += '<div class="simple-prod-cell__price">';
            if(price_compare_min !== false && price_compare_min > 0 && (price_compare_min > price_min || price_compare_max > price_max)) {
                html += '<s>';
                    html += formatPrice(Math.round(price_compare_min * 100));
                    if(price_compare_max > price_compare_min) html += ' - ' + formatPrice(Math.round(price_compare_max * 100));
                html += '</s> ';
            }
            html += formatPrice(Math.round(price_min * 100));
            if(price_max > price_min) html += ' - ' + formatPrice(Math.round(price_max * 100));
            if(!available) {
                if(product.product_type.toLowerCase().indexOf('wear') > -1 || product.vendor.indexOf('Taco Bell') > -1)
                    html += '<a class="variant-sold-out-message" href="' + url + '">Sold Out</a>';
                else html += '<a class="variant-sold-out-message" href="' + url + '">Join Waitlist</a>';
            }
        html += '</div>';

        html += '<div class="search-form__item-stars"></div>';
    html += '</div>';

    newItem.innerHTML = html;

    let img = '';
    if(product.images && product.images.length > 0) img = product.images[0].src;
    updateSearchItemVariant(matchedVariant[1], product.handle, newItem, img);

    if(product.handle != 'gift-card') getMoreSearchInfo(product.handle, newItem);
}

function searchProductsForMatches(products, search, color_search, ambiguity, or, sale, products_target) {
    let found = 0;
    for(let i = 0; i < products.length; i++) {
        let product = products[i];
        let hide = [];
        if(product.price == 0 || product.tags.indexOf('do not display') > -1) continue;

        let tags = product.tags;
        let preorder = false;
        for(let i = 0; i < tags.length; i++) {
            if(tags[i].substring(0, 5) == 'hide:') hide.push(handleize(tags[i].substring(5)));
            else if(tags[i].substring(0, 13) == 'early-access:') hide.push(handleize(tags[i].substring(13)));
            else if(tags[i] == 'preorder' || tags[i].substring(0, 9) == 'preorder:') {
                let explode = tags[i].split(':');
                if(explode.length < 3) preorder = true;
                else preorder = explode[2].split(';');
            }
        }

        let visible_variants = [];
        let count_available = 0;
        // Getting all variants
        for(let i = 0; i < product.variants.length; i++) {
            let variant = product.variants[i];
            let option1 = handleize(variant.option1);
    
            if(hide.indexOf(option1) === -1) {
                visible_variants.push(variant);
                if(variant.available) count_available++;
            }
        }

        let matchedVariant = getMatchedVariants(product, search, color_search, visible_variants, ambiguity, or, sale);
        if(!matchedVariant && similarity2('Compakt shoe bag', product.title) > 0.9 && similarity2(search.join(' '), 'packing cubes') > 0.8) {
            matchedVariant = getMatchedVariants(product, [], color_search, visible_variants, true, false, sale);
        }
        
        if(!matchedVariant) continue;
        
        found++;
        let variantIsPreorder = false;
        if(preorder !== false && (preorder === true || preorder.indexOf(handleize(matchedVariant.option1)) > -1)) variantIsPreorder = true;
        createSearchItem(product, count_available > 0, matchedVariant, products_target, found, variantIsPreorder);
    }

    return found;
}

function fillSearchProducts(results, form, search, color_search, ambiguity, or, sale) {
    let expanded_sections = document.querySelectorAll('.search-form__result-section--expanded');
    if(expanded_sections.length) for(let i = 0; i < expanded_sections.length; i++) expanded_sections[i].classList.remove('search-form__result-section--expanded');
    let products_target = form.querySelector('.search-form__result--products .search-results__contents');
    products_target.closest('.search-form__result').classList.remove('search-form__result--loading');

    if(products_target && typeof results.products != 'undefined') {
        let products = results.products;

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

        form.querySelector('.search-form__result--products').setAttribute('data-found', products_found);

        if(products_found <= 4) {
            let section = products_target.closest('.search-form__result-section');
            if(section) section.classList.add('search-form__result-section--expanded');
        }

        if(products_found == 0) products_target.closest('.search-form__result').classList.remove('search-form__result--active');
        else products_target.closest('.search-form__result').classList.add('search-form__result--active');
    }

    form.setAttribute('data-status', 'success');
}

function fillSearchResults(results, form) {
    let articles_target = form.querySelector('.search-form__result--articles .search-results__contents');
    if(articles_target && typeof results.articles != 'undefined') {
        let articles = results.articles;

        articles_target.innerHTML = '';

        if(articles.length == 0) articles_target.parentNode.classList.remove('search-form__result--active');
        else {
            articles_target.parentNode.classList.add('search-form__result--active');

            let articles_found = 0;
            let sizes = '(max-width: 900px) 65vw, (max-width: 1080px) 200px, calc((90vw - 310px) / 3)';
            for(let i = 0; i < articles.length && i < 6; i++) {
                let article = articles[i];
                
                let newItem = document.createElement('div');
                newItem.classList.add('search-article-cell');

                articles_found++;

                let html = '';

                html += '<a href="' + article.url + '" class="search-result--blog search-article__image"><div class="image-ratio-container" style="padding-top: 75%">' + get_image(article.image, sizes, true) + '</div></a>';
                html += '<div class="search-article__info">';
                    let tag = false;
                    for(let i = 0; i < article.tags.length; i++) {
                        let _tg = article.tags[i].toLowerCase();
                        if( _tg.indexOf('subcategory:') === -1 && _tg.indexOf('tag:') === -1 ) {
                            tag = article.tags[i].replaceAll('-', ' ');
                        }
                    }

                    if(tag !== false) {
                        html += '<div class="search-article__category">' + tag + '</div>';
                    }

                    html += '<div class="search-article__title"><a class="search-result--blog" href="' + article.url + '">' + article.title + '</a></div>';
                    html += '<a href="' + article.url + '" class="search-result--blog search-article__more">Read more</div>';
                html += '</div>';

                newItem.innerHTML = html;

                articles_target.closest('.search-form__result--articles').classList.remove('search-form__result--scroll', 'search-form__result--mob-scroll');
                if(articles_found > 3) articles_target.closest('.search-form__result--articles').classList.add('search-form__result--scroll');
                else if(articles_found > 1) articles_target.closest('.search-form__result--articles').classList.add('search-form__result--mob-scroll');

                articles_target.appendChild(newItem);
            }
        }
    }

    let pages_target = form.querySelector('.search-form__result--pages .search-results__contents');
    if(pages_target && typeof results.pages != 'undefined') {
        let pages = results.pages;

        pages_target.innerHTML = '';
        let pages_found = 0;
        
        for(let i = 0; i < pages.length; i++) {
            let page = pages[i];
            if(typeof page.body != 'undefined' && (page.body.indexOf('<!-- hide in search -->') > -1 || page.body.indexOf('<!--hide in search-->') > -1)) continue;
                            
            let newItem = document.createElement('div');
            newItem.classList.add('search-res-cell');
            newItem.innerHTML = '<a class="search-result--page" href="' + page.url + '">' + page.title + '</a>';
            pages_target.appendChild(newItem);
            pages_found++;
            if(pages_found >= 5) break;
        }

        if(pages_found == 0) pages_target.parentNode.classList.remove('search-form__result--active');
        else pages_target.parentNode.classList.add('search-form__result--active');
    }

    let collections_target = form.querySelector('.search-form__result--collections .search-results__contents');
    let collection_cells = form.querySelector('.search-form__result--collection-cells .search-results__contents');
    if(collections_target && typeof results.collections != 'undefined') {
        let collections = results.collections;

        collections_target.innerHTML = '';
        collection_cells.innerHTML = '';

        let collections_found = 0;
        for(let i = 0; i < collections.length && i < 5; i++) {
            let collection = collections[i];

            if(collection.body.indexOf('hide in search') > -1 || collection.title.toLowerCase().indexOf('early access') > -1) continue;

            collections_found++;

            let newItem = document.createElement('div');
            newItem.classList.add('search-res-cell');
            newItem.innerHTML = '<a class="search-result--collection" href="' + collection.url + '">' + collection.title + '</a>';
            
            collections_target.appendChild(newItem);

            let newColCell = document.createElement('div');
            newColCell.classList.add('simple-prod-cell');
            newColCell.innerHTML = '<a href="' + collection.url + '" class="search-result--collection-cell"><div class="simple-prod-cell__image"></div></a>';
            newColCell.innerHTML += '<div class="simple-prod-cell__info"><div class="simple-prod-cell__title"><a class="search-result--collection-cell" href="' + collection.url + '">' + collection.title + '</a></div></div>';

            setSearchCollectionImage(collection, newColCell);

            collection_cells.appendChild(newColCell);
        }

        if(collections_found > 0) {
            collection_cells.parentNode.classList.add('search-form__result--active');
            collections_target.parentNode.classList.add('search-form__result--active');
        } else {
            collection_cells.parentNode.classList.remove('search-form__result--active');
            collections_target.parentNode.classList.remove('search-form__result--active');
        }
    }

    form.setAttribute('data-status', 'success');
}

function setSearchCollectionImage(collection, newColCell) {
    jQuery.getJSON(
        '/collections/' + collection.handle + '/collection.json'
    ).done(function(response) {
        let sizes = '(max-width: 900px) 50vw, (max-width: 1080px) 150px, (max-width: 1300px) calc((90vw - 310px) / 4), calc((90vw - 310px) / 5)';
        newColCell.querySelector('.simple-prod-cell__image').innerHTML = get_image(response.collection.image.src, sizes, false);
    });
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

function performSearch(el) {
    let s = el.value.trim();
    let form = el.closest('.search-form');

    if(lastSearch === s) return;
    lastSearch = s;

    sessionStorage.setItem('search', lastSearch);

    if(s.length == 0) {
        // form.setAttribute('data-status', 'init');
        document.querySelector('.menu-popup--search').setAttribute('data-status', 'init');
        return;
    }

    let search = [];
    let color_search = [];
    let generated_words = 0;
    let ambiguity = false;
    let or = false;

    let split = s.toLowerCase().replace("'s", 's').match(/\b(\w+)\b/g);
    if(!split) return;

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


    // Generating word combinations
    if(split.length == 2) {
        split.unshift(unsplited);
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

    // if(ga_send_timeout) clearTimeout(ga_send_timeout);
    // ga_send_timeout = setTimeout(function() {
    //     if(lastSearch.length) {
    //         // console.log('ga send', lastSearch);
    //         ga('send', 'pageview', 'https://www.calpaktravel.com/pages/search-results-page?q=' + encodeURIComponent(lastSearch));

    //         gtag('event', 'page_view', {
    //             page_title: 'Search',
    //             page_location: window.location.href,
    //             page_path: 'https://www.calpaktravel.com/pages/search-results-page?q=' + encodeURIComponent(lastSearch)
    //         });
    //     }
    // }, 2000);

    if(color_search.indexOf('wavy') > -1) {
        search.push('wavy');
        ambiguity = true;
    }

    if(search.length == 1 && search[0] == 'no')
        document.querySelector('.menu-popup--search').setAttribute('data-status', 'empty');
    else if(search.length == 0 && color_search.length == 0) {
        document.querySelector('.menu-popup--search').setAttribute('data-status', 'init');
    } else document.querySelector('.menu-popup--search').setAttribute('data-status', 'results');

    console.log(search, color_search, ambiguity, or, sale);

    // form.classList.add('search-form--loading');

    // let products_target = form.querySelector('.search-form__result--products .search-results__contents');
    // if(products_target) products_target.closest('.search-form__result').classList.add('search-form__result--loading');
    // if(all_products_cache !== false) {
    //     form.classList.remove('search-form--loading');
    //     fillSearchProducts(all_products_cache, form, search, color_search, ambiguity, or, sale);
    // } else jQuery.getJSON(
    //     '/collections/best-sellers/products.json?limit=250'
    // ).done(function(response) {
    //     form.classList.remove('search-form--loading');
    //     all_products_cache = response;

    //     fillSearchProducts(all_products_cache, form, search, color_search, ambiguity, or, sale);
    // });
    return;

    let alt_search = [];
    if(search.length == 0 && color_search.length > 0) alt_search = Array.from(color_search);
    else if(search.length > 0) alt_search = Array.from(search);

    // console.log(alt_search);
    if(alt_search.length > 0) {
        let joined_search = alt_search.join(' ');
        // if(joined_search.indexOf('carry on') > -1) joined_search = joined_search.replace('carry on', 'trip');

        jQuery.getJSON(
            '/search/suggest.json?q=' + encodeURIComponent(joined_search) + '&resources[options][unavailable_products]=last&resources[type]=article,page,collection&resources[limit]=10'
        ).done(function(response) {
            form.classList.remove('search-form--loading');
            
            if(alt_search.indexOf('warra') > -1 || alt_search.indexOf('warran') > -1 || alt_search.indexOf('warrant') > -1 || alt_search.indexOf('warranty') > -1) {
                if(typeof response.resources.results.pages == 'undefined' ) response.resources.results.pages = [];
                response.resources.results.pages.push({
                    url: 'https://www.calpaktravel.com/pages/faq#page-faq-category-8',
                    title: 'Warranty'
                });
            }

            fillSearchResults(response.resources.results, form);
        });
    }
}

function openHeaderSearch() {
    document.body.classList.add('search-active');
    document.querySelector('.header-container .search-form').classList.add('search-form--displayed');
    setTimeout(function() {
        document.querySelector('.header-container .search-form').classList.add('search-form--active');
    }, 0);

    let input = document.querySelector('.header-container .search-form .search-form__input');
    if(sessionStorage.getItem('search') !== null && typeof sessionStorage.getItem('search') != 'undefined' && sessionStorage.getItem('search').length && input.value.length == 0) {
        input.value = sessionStorage.getItem('search');
        document.querySelector('.header-container .search-form__result--products').classList.add('search-form__result--loading');
        let form = document.querySelector('.header-container .search-form');
        form.setAttribute('data-status', 'loading');
        performSearch(input);
    } else if(all_products_cache === false) jQuery.getJSON('/collections/best-sellers/products.json?limit=250').done((response) => all_products_cache = response);

    input.focus();
}

// if(sessionStorage.getItem('search') !== null && typeof sessionStorage.getItem('search') != 'undefined' && sessionStorage.getItem('search').length && all_products_cache === false) jQuery.getJSON('/collections/best-sellers/products.json?limit=250').done((response) => all_products_cache = response);

function closeHeaderSearch() {
    document.querySelector('.search-popup__content .menu-close').click();
    return;
    let form = document.querySelector('.header-container .search-form');
    document.body.classList.remove('search-active');
    form.classList.remove('search-form--active');
    lastSearch = false;
    
    setTimeout(function() {
        // form.setAttribute('data-status', 'init');
        form.classList.remove('search-form--displayed');
    }, 500);
}

if(searchInput.length) {
    // let searchViewAll = document.querySelectorAll('.search-view-all');
    // if(searchViewAll.length > 0) for(let i = 0; i < searchViewAll.length; i++) searchViewAll[i].addEventListener('click', function(e) {
    //     e.preventDefault();
    //     let section = this.closest('.search-form__result-section');
    //     if(section) section.classList.add('search-form__result-section--expanded');
    // });

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
                performSearch(el);
            }, 300);
        });
    }
}

let searchActivate = document.querySelectorAll('.header-controls-icon--search');
if(searchActivate.length) for(let i = 0; i < searchActivate.length; i++) searchActivate[i].addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    openHeaderSearch();
});

let searchDeactivate = document.querySelector('.search-form__hide');
if(searchDeactivate) searchDeactivate.addEventListener('click', function(e) {
    e.preventDefault();
    closeHeaderSearch();
});

let searchFooterIcon = document.querySelector('.search__footer-icon');
if(searchFooterIcon) searchFooterIcon.addEventListener('click', function(e) {
    e.preventDefault();

    if(document.body.classList.contains('search-active')) closeHeaderSearch();
    else openHeaderSearch();
});