require.config({
	shim: {
		vue: {
			exports: 'Vue'
		}
	},
	paths: {
		vue: 'bower_components/vue/dist/vue',
		text: 'bower_components/requirejs-text/text'
	}
});

require([
	'scripts/router/router'
], function(Router) {

});
