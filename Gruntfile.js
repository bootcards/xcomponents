module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    banner: '/* <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd h:MM") %> */\n',
    pouch : '<script type="text/javascript" src="../../../pouchdb/dist/pouchdb.min.js"></script>\n',
    lowla : '<script type="text/javascript" src="../../../lowladb/dist/lowladb.min.js"></script>\n',
    
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
          'bower_components/angular-route/angular-route.min.js',
          'bower_components/angular-cookies/angular-cookies.min.js',
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
      all: {
        files: [
          {expand: true, src: ['src/css/*'], dest: 'dist/css/', filter: 'isFile', flatten: true},
          {expand: true, src: ['src/includes/*'], dest: 'dist/includes/', filter: 'isFile', flatten: true},
          {expand: true, src: ['src/js/*'], dest: 'dist/js/', filter: 'isFile', flatten: true},
        ]
      }
    },

   replace: {
      pouch: {
        src: ['dist/includes/includes.html'],         
        dest: 'dist/includes/includes-pouch.html',     
        replacements: [{
          from: '<!-- include:pouch -->',                  
          to: grunt.config('pouch')
        }]
      },
      lowla: {
        src: ['dist/includes/includes.html'],           
        dest: 'dist/includes/includes-lowla.html',    
        replacements: [{
          from: '<!-- include:lowla -->',                   
          to: grunt.config('lowla')
        }]
      }
    },

    watch : {

      scripts: {
        files: ['Gruntfile.js', 'src/**/*.js', 'src/**/*.html', 'src/**/*.css'],
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
  grunt.loadNpmTasks('grunt-text-replace');
  
  // Default task(s).
  grunt.registerTask('default', [
    'clean:build',
    'html2js',
    'concat:js1',
    'concat:js2',
    'concat:js-libs',
    'copy:all',
    'replace:pouch',
    'replace:lowla',
    'uglify:build',
    'clean:tmp',
   ]);

};