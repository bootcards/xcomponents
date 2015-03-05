module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    banner: '/* <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd h:MM") %> */\n',
    
    /*clean the output folder*/
    clean:{
      build : {
        src : ["dist"]
      },
      tmp : {
        src : ["dist/xcomponents-tmp.js", "dist/templates.js"]
      }

    },

    /*concat xc js source files*/
    concat: {
      js1 : {
        options: { banner: '<%= banner %>' },
        src: [
          'src/*.js',
          '!src/xc-main.js'
        ],
        dest: 'dist/xcomponents-tmp.js'
      }, 
      js2 : {
        src: [
          'src/xc-main.js',
          'dist/xcomponents-tmp.js',
          'dist/templates.js'
        ],
        dest: 'dist/xcomponents.js'
      },
      'js-libs' : {
        src : [
          'bower_components/angular/angular.min.js',
          'bower_components/angular-resource/angular-resource.min.js',
          'bower_components/angular-animate/angular-animate.min.js',
          'bower_components/angular-sanitize/angular-sanitize.min.js',
          'bower_components/angular-touch/angular-touch.min.js',
          'bower_components/angular-bootstrap/ui-bootstrap.min.js',
          'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js'

        ],
        dest : 'dist/libs-angular.js'

      }

    },

    /*create Angular JS files from the partials (html files)*/
    html2js : {
      options: {
      },
      main: {
        src: ['src/*.html'],
        dest: 'dist/templates.js'
      }
    },

    copy: {
      css: {
        files: [
          {expand: true, src: ['src/css/*'], dest: 'dist/css/', filter: 'isFile', flatten: true},
          {expand: true, src: ['src/includes/*'], dest: 'dist/includes/', filter: 'isFile', flatten: true},
        ]
      }
    },

    watch : {

      scripts: {
        files: ['**/*.js', '**/*.html'],
        tasks: ['default'],
        options: {
          spawn: false,
        }
      }
    },

    uglify: {
      build: {
        files: {
          'dist/xcomponents.min.js': ['dist/xcomponents.js']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-html2js');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  
  // Default task(s).
  grunt.registerTask('default', [
    'clean:build',
    'html2js',
    'concat:js1',
    'concat:js2',
    'concat:js-libs',
    'copy:css',
    'uglify:build',
    'clean:tmp',
   ]);

};