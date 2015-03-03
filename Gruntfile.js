module.exports = function(grunt) {

  //-- NPM Tasks
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-html2js');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-ng-annotate');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-traceur-simple');

  //-- Defines the variables to be used for file structures
  var userConfig = require('./build.config.js');


  //-- Begins giant task runner config
  var taskConfig = {
    pkg: grunt.file.readJSON('package.json'),
    dist_target: '<%= dist_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>',


    //-- Turns code into unreadable variable aliases
    //   in order to reduce bytes to bites
    uglify: {
      dist: {
        files: {
          '<%=  dist_target %>.js': '<%= dist_target %>.js',
          '<%=  dist_target %>.css': '<%= dist_target %>.css'
        }
      }
    },

    //-- Cleans the build directory in order to relplace with new
    clean: [
      '<%= build_dir %>'
    ],

    //-- Copies all source files into build directory
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

    //-- Builds the index page for the app
    index: {
      build: {
        dir: '<%= build_dir %>',
        src: [
          '<%= vendor_files.js %>',
          '<%= build_dir %>/src/app/**/*.js',
          '<%= html2js.app.dest %>',
          '<%= build_dir %>/bundle.js',
          '<%= build_dir %>/assets/**/*.css'
        ]
      },
      dist: {
        dir: '<%= dist_dir %>',
        src: [
          '<%= dist_dir %>/**/*.js',
          '<%= dist_dir %>/**/*.css'
        ]
      }
    },


    //-- Responsible for watching all changes in all files
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
      },
      sass: {
        files: ['src/scss/**/*.scss'],
        tasks: ['sass:build']
      }
    },


    // -- Watches for any changes on the node server and
    //    restarts it when it detects a change
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

    //-- Cache all html templates into JS objects
    //   for faster load times
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
    },

    // -- Build out all sass files into one single file
    sass: {
      build: {
         files: {
           '<%= build_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.css': 'src/scss/main.scss'
          }
       },                            // Task
      dist: {                            // Target
        options: {                       // Target options
          style: 'expanded'
        },
        files: {                         // Dictionary of files
          '<%= dist_target %>.css' : 'src/scss/main.scss'       // 'destination': 'source'
        }
      }
    },

    //-- Take contents of all files and shove them into one
    concat: {
      dist_js: {
        src: [
          '<%= vendor_files.js %>',
          'module.prefix',
          '<%= build_dir %>/src/app/**/*.js',
          '<%= build_dir %>/templates-app.js',
          'module.suffix',
          '<%= build_dir %>/bundle.js'
        ],
        dest: '<%= dist_dir %>/assets/<%= pkg.name %>-<%=pkg.version %>.js'
      }
    },

    //-- Ensure that controllers have reserved names to refer to with variables
    //   if code gets uglified...and something like $stateProvider turns into a
    ngAnnotate: {
      compile: {
        files: [
          {
            src: [ '<%= dist_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.js' ],
           dest: '<%= dist_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.js'
          }
        ]
      }
    },

    //-- IN PROGRESS: Need to get this to run effectively
    traceur: {
        options: {
            includeRuntime: true,
            traceurOptions: "--experimental --source-maps"
        },
        "app": {
            files: {
                "src/es6/app.js": [ "src/es6/test.js" ]
            }
        }
    }

  };

  grunt.initConfig(grunt.util._.extend(taskConfig, userConfig));

  // Setup default grunt tasks generally
  grunt.registerTask('default', ['build', 'concurrent']);

  // Setup grunt tasks to handle all the copying and building
  grunt.registerTask('build', [
    'clean', 'copy', 'html2js', 'browserify', 'sass:build', 'index:build'
  ]);

  // Setup task for doing distribution version on prod
  grunt.registerTask('dist', [
    'build', 'concat', 'ngAnnotate', 'uglify', 'sass:dist', 'index:dist'
  ]);
  function filterForExtension(extension, files) {
    var regex = new RegExp('\\.' + extension + '$'),
      dirRE = new RegExp('^(' + grunt.config('build_dir') + ')\/', 'g');
    return files.filter(function (file) {
      return file.match(regex);
    }).map(function (file) {
      return file.replace(dirRE, '');
    });
  }
  grunt.registerMultiTask('index', 'Process index.html template', function() {
      var jsFiles = filterForExtension('js', this.filesSrc),
cssFiles = filterForExtension('css', this.filesSrc);

      grunt.file.copy('src/index.html', this.data.dir + '/index.html', {
        process: function(contents, path) {
          return grunt.template.process(contents, {
              data: {
                scripts: jsFiles,
                styles: cssFiles,
                version: grunt.config('pkg.version')
              }
          });
        }
      });
  });
};