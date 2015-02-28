module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-html2js');

  var userConfig = require('./build.config.js');

  var taskConfig = {
    pkg: grunt.file.readJSON('package.json'),

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
    clean: [
      '<%= build_dir %>'
    ],

    index: {
      build: {
        dir: '<%= build_dir %>',
        src: [
          '<%= vendor_files.js %>',
          '<%= build_dir %>/src/**/*.js'
        ]
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
    } }
  };

  grunt.initConfig(grunt.util._.extend(taskConfig, userConfig));

  // Setup default grunt tasks generally
  grunt.registerTask('default', ['build', 'concurrent']);

  // Setup grunt tasks to handle all the copying and building
  grunt.registerTask('build', [
    'clean', 'copy', 'index', 'html2js'
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