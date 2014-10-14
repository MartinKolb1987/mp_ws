require.config({
	shim: {
		vue: {
			exports: 'Vue'
		}
	},
	paths: {
		vue: '../bower_components/vue/dist/vue',
		text: '../bower_components/requirejs-text/text',
		dataRouter: 'data-router',
		error: 'error-handler'
	}
});

require([
	'router/router',
	'dataRouter'
], function(Router, DataRouter) {
	DataRouter.init();
});
