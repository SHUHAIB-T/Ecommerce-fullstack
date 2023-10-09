$(document).ready(() => {

    $('.Showcategory').on('click', () => {
        $('.category').slideToggle();
    })

    $('.Showbrand').on('click', () => {
        $('.brand').slideToggle();
    })

    $('.Showcolor').on('click', () => {
        $('.color').slideToggle();
    })

    //assigning initial filtered catgories
    let urlString = window.location.href;
    const url = new URL(urlString);
    const queryParameters = url.searchParams;
    const params = [];
    queryParameters.forEach((value, key) => {
        params.push(key + '=' + value)
        if (key == 'category') {
            let filter = document.getElementById(key + '=' + value).checked = true;
        } else if (key == 'brand') {
            let filter = document.getElementById(key + '=' + value).checked = true;
        } else if (key == 'color') {
            let filter = document.getElementById(key + '=' + value).checked = true;
        }
    });

    if (params.length === 0) {
        $('.brand').hide()
        $('.category').hide();
        $('.color').hide();
    } else {
        $('.brand').show()
        $('.category').show();
        $('.color').show();
    }

    // filtering by category
    $('.filter-button').on('click', (e) => {
        let link = window.location.href;
        link = decodeURIComponent(link);
        if (link.includes(e.target.value)) {
            link = link.replace('&' + e.target.value, '').replace(e.target.value, '')

        } else {
            if (link.includes('?', '=')) {
                link = link + '&' + e.target.value
            } else {
                link = link + '?' + e.target.value
            }
        }
        location.assign(link)
    })

    // filtering by brand
    $('.filter-brand').on('click', (e) => {
        let link = window.location.href;
        link = decodeURIComponent(link);
        if (link.includes(e.target.value)) {
            link = link.replace('&' + e.target.value, '').replace(e.target.value, '')

        } else {
            if (link.includes('?', '=')) {
                link = link + '&' + e.target.value
            } else {
                link = link + '?' + e.target.value
            }
        }
        location.assign(link)
    })

    // filtering by color
    $('.filter-color').on('click', (e) => {
        let link = window.location.href;
        link = decodeURIComponent(link);
        if (link.includes(e.target.value)) {
            link = link.replace('&' + e.target.value, '').replace(e.target.value, '')

        } else {
            if (link.includes('?', '=')) {
                link = link + '&' + e.target.value
            } else {
                link = link + '?' + e.target.value
            }
        }
        location.assign(link)
    })

    // filtering by price
    sorting = (sortQuery) => {
        let link = window.location.href;
        link = decodeURIComponent(link);
        if (link.includes("sort")) {
            link = link.replace(/sort=[^&]+/, sortQuery);
        } else {
            if (link.includes('?')) {
                link = link + '&' + sortQuery;
            } else {
                link = link + '?' + sortQuery;
            }
        }
        location.assign(link);
    }
})