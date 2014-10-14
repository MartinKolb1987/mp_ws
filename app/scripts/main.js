require.config({
	shim: {
		vue: {
			exports: 'Vue'
		}
	},
	paths: {
		vue: '../bower_components/vue/dist/vue',
		text: '../bower_components/requirejs-text/text',
		dataHandler: 'data-handler',
		error: 'error-handler'
	}
});

require([
	'router/router',
	'dataHandler'
], function(Router, DataHandler) {
	DataHandler.init();
});
