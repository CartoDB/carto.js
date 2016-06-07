window.cartotmp = {};
['require', 'define', 'module'].map(function (name) {
    window.cartotmp[name] = window[name];
    delete window[name];
});

if(cartodb){
	// Keep the global version of jQuery, if there is any
	if(window.$){
		window._prev = {jQuery: window.$, $: window.$} 
	}
	window.$ = window.jQuery = cartodb.$;
} 