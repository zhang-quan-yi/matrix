module.exports = function(grunt){
	var cwd = process.cwd();
	var config = {
		pkg: grunt.file.readJSON("package.json"),
		jshint: {
			options: {
				ignores: ['common/js/*.min.js']
			},
			check: {
				files: {
					src: ['source/js/*.js','common/js/*.js']
				}
			}
		},
		//CSS相关
		sass:{
				options:{
					//compressed|nested|compact|expanded
					style: 'compressed',
					//if only compile changed files
					update: false,
					//no cache to the sass files
					noCache: true
				},
				files:{
					//expand Set to true will enable the 
					//following properties
					expand: true,
					cwd: 'source/sass/final-sass/',
					src: ['*.sass'],
					//this dir is base gruntfile.js
					//not the cwd dir...
					//what a fuck
					dest: 'web/css/',
					ext: '.css'
				}
			
		},
		requirejs:{
			debug: grunt.file.readJSON('require.json'),
			release: grunt.file.readJSON('require.json')
		}
	};
	config.requirejs.debug.options.uglify2 = {
		"output": {
			"beautify": true,
			"comments": true,
			"ascii_only": false		
		},
		"compress": false,
		"mangle": false

	};
	grunt.initConfig(config);
	//process.chdir('../');
	
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	
	grunt.registerTask('default',['sass']);
}; 