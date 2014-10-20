require.config({
	shim: {
		vue: {
			exports: 'Vue'
		},
		translation: {
			deps: ['componentCollection']
		}
	},
	paths: {
		vue: '../bower_components/vue/dist/vue',
		text: '../bower_components/requirejs-text/text',
		dataHandler: 'data-handler',
		debug: 'debug-handler',
		error: 'error-handler',
		translation: 'translation-handler',
		componentCollection: 'component-collection'
	}
});

require([
	'router/router',
	'dataHandler',
	'componentCollection'
], function(Router, DataHandler, ComponentCollection) {
	ComponentCollection.init();
	DataHandler.init();
});
