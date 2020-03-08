function debounce(func, wait) {
    let timeout;

    return function () {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);

        timeout = setTimeout(function () {
            timeout = null;
            func.apply(context, args);
        }, wait);
    };
}
function initSearch() {
    const INDEX = elasticlunr.Index.load(window.searchIndex);
    const MAX_ITEMS = 10;
    const OPTIONS = {
        bool: "AND",
        fields: {
            title: {boost: 2},
            body: {boost: 1},
        }
    };
    const $searchInput = document.getElementById("search");
    let currentTerm = "";

    if ('onsearch' in $searchInput) $searchInput.addEventListener("search", _ => {
        const term = $searchInput.value.trim();
        if (term === "" || !INDEX) {
            currentTerm = '';
            showAll();
            return;
        }
        if (term === currentTerm) return;

        const results = INDEX.search(term, OPTIONS);
        if (results.length === 0) {
            hideAll();
        } else {
            const res = results.map(r => r.ref);
            const posts = document.querySelectorAll('section.post');
            const show = Array.from(posts);
            show.filter(p => !res.includes(p.querySelector('h2.post-title a').href + '/'))
                .forEach(p => p.setAttribute('hidden', 'true'));
            show.filter(p => res.includes(p.querySelector('h2.post-title a').href + '/'))
                .forEach(p => p.removeAttribute('hidden'));
            toggleSubheadings();
        }

        currentTerm = term;
    });
    else $searchInput.addEventListener("input", debounce(function() {
        const term = $searchInput.value.trim();
        if (term === "" || !INDEX) {
            currentTerm = '';
            showAll();
            return;
        }
        if (term === currentTerm) return;

        const results = INDEX.search(term, OPTIONS);
        if (results.length === 0) {
            hideAll();
        } else {
            const res = results.map(r => r.ref);
            const posts = document.querySelectorAll('section.post');
            const show = Array.from(posts);
            show.filter(p => !res.includes(p.querySelector('h2.post-title a').href + '/'))
                .forEach(p => p.setAttribute('hidden', 'true'));
            show.filter(p => res.includes(p.querySelector('h2.post-title a').href + '/'))
                .forEach(p => p.removeAttribute('hidden'));
            toggleSubheadings();
        }

        currentTerm = term;
    }, 150));
}
function showAll() {
    document.querySelector('main.content').removeAttribute('hidden');
    document.querySelectorAll('section.post').forEach(p => p.removeAttribute('hidden'));
    toggleSubheadings();
}
function hideAll() {
    document.querySelectorAll('section.post').forEach(p => p.setAttribute('hidden', 'true'));
    toggleSubheadings();
}
function toggleSubheadings() {
    document.querySelectorAll('.content-subhead').forEach(csh => {
        let content = [];
        let pointer = csh;
        while (!!pointer.nextElementSibling && !pointer.nextElementSibling.matches('h1.content-subhead')) {
            content.push(pointer.nextElementSibling);
            pointer = pointer.nextElementSibling;
        }
        if (content.every(p => p.hasAttribute('hidden'))) csh.setAttribute('hidden', 'true');
        else csh.removeAttribute('hidden');
    })
}

if (
    document.readyState === "complete" ||
    (document.readyState !== "loading" && !document.documentElement.doScroll)
) initSearch();
else document.addEventListener("DOMContentLoaded", initSearch);