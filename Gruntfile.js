module.exports = function(grunt) {

  var globalConfig = {
        today: grunt.template.today("yyyy-mm-dd"),
        banner: '/*! <%= pkg.name %>, built <%= globalConfig.today %> */\n',
        autoprefix: new (require('less-plugin-autoprefix'))({browsers: ["last 3 versions", 'ie >= 9']}),
      };

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    globalConfig: globalConfig,

    uglify: {
      options: {
        banner: globalConfig.banner,
      },
      dist: {
        files: {
          'dist/jquery.flipster.min.js': ['src/jquery.flipster.js']
        }
      }
    },
    less: {
      full: {
        options: {
          banner: globalConfig.banner,
          plugins: globalConfig.autoprefix
        },
        files: {
          'dist/jquery.flipster.css': ['src/less/jquery.flipster.less', 'src/less/*/*.less']
        }
      },
      minified: {
        options: {
          banner: globalConfig.banner,
          plugins: globalConfig.autoprefix,
          compress: true
        },
        files: {
          'dist/jquery.flipster.min.css': ['src/less/jquery.flipster.less', 'src/less/*/*.less']
        }
      }
    },
    watch: {
      scripts: {
        files: 'src/jquery.flipster.js',
        tasks: ['uglify'],
        options: { debounceDelay: 250 },
      },
      less: {
        files: ['src/less/**/*.less'],
        tasks: ['less'],
        options: { debounceDelay: 250 },
      },
    },
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['uglify', 'less']);

};
