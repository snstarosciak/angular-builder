module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-html2js');
  grunt.loadNpmTasks('grunt-browserify');

  var userConfig = require('./build.config.js');

  var taskConfig = {
    pkg: grunt.file.readJSON('package.json'),


    clean: [
      '<%= build_dir %>'
    ],
    copy: {
      appjs: {
        files: [
          {
            src: ['<%= app_files.js %>'],
            dest: '<%= build_dir %>/',
            cwd: '.',
            expand: true
          }
        ]
      },
      vendorjs: {
        files: [
          {
            src: ['<%= vendor_files.js %>'],
            dest: '<%= build_dir %>/',
            cwd: '.',
            expand: true
          }
        ]
      },
    },
    index: {
      build: {
        dir: '<%= build_dir %>',
        src: [
          '<%= vendor_files.js %>',
          '<%= build_dir %>/src/app/**/*.js',
          '<%= html2js.app.dest %>',
          '<%= build_dir %>/bundle.js'
        ]
      }
    },

    watch: {
      jssrc: {
        files: [
          '<%= app_files.js %>'
    ],
        tasks: ['copy', 'index']
      },
      html: {
        files: [ '<%= app_files.html %>'],
        tasks: ['index:build']
      },
      gruntfile: {
        files: 'Gruntfile.js',
        tasks: [],
        options: {
          livereload: false
        }
      },
      modules: {
        files: 'src/modules/**/*.js',
        tasks: ['browserify']
      }
    },

    nodemon: {
      dev: {
        script: 'server/server.js',
        options: {
          watchedFolders: ['server']
        }
      }
    },
    concurrent: {
      dev: {
        tasks: ['nodemon', 'watch'],
        options: {
          logConcurrentOutput: true
        }
      }
    },
    html2js: {
        app: {
            options: {
                base: 'src/app'
            },
            src: [ '<%= app_files.atpl %>' ],
            dest: '<%= build_dir %>/templates-app.js'
      }
    },
    browserify: {
      build: {
        src: ['src/modules/modules.js'],
        dest: '<%= build_dir %>/bundle.js',
        options: {
          debug: true
        }
      }
    }
  };

  grunt.initConfig(grunt.util._.extend(taskConfig, userConfig));

  // Setup default grunt tasks generally
  grunt.registerTask('default', ['build', 'concurrent']);

  // Setup grunt tasks to handle all the copying and building
  grunt.registerTask('build', [
    'clean', 'copy', 'html2js', 'browserify', 'index'
  ]);


  function filterForJS(files) {
    return files.filter(function (file) {
      return file.match(/\.js$/);
    });
  }
  grunt.registerMultiTask('index', 'Process index.html template', function() {
    var dirRE = new RegExp('^(' + grunt.config('build_dir') + ')\/', 'g');
      var jsFiles = filterForJS(this.filesSrc).map(function (file) {
        return file.replace(dirRE, '');
      });

      grunt.file.copy('src/index.html', this.data.dir + '/index.html', {
        process: function(contents, path) {
          return grunt.template.process(contents, {
              data: {
                scripts: jsFiles
              }
          });
        }
      });
  });
};