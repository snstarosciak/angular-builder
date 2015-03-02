module.exports = {
	build_dir: 'build',
	dist_dir: 'dist',
	app_files: {
		js: ['src/app/**/*.js', '!src/**/*.spec.js'],
		atpl: [ 'src/app/**/*.tpl.html'],
		html: ['src/index.html']
	},

	vendor_files: {
		js: [
			'src/vendor/angular/angular.js',
			'src/vendor/angular-ui-router/release/angular-ui-router.js'
		]
	}
};
