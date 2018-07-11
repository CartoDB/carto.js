window.cartotmp = {};
['require', 'define', 'module'].map(function (name) {
    window.cartotmp[name] = window[name];
    delete window[name];
});
