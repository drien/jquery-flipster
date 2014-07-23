module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %>, built <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      dist: {
        files: {
          'dist/jquery.flipster.min.js': ['src/js/jquery.flipster.js']
        }
      }
    },
    cssmin: {
      add_banner: {
        options: {
            banner: '/*! <%= pkg.name %>, built <%= grunt.template.today("yyyy-mm-dd") %> */'
        },
        files: {
          'dist/jquery.flipster.min.css': ['src/css/jquery.flipster.css']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  grunt.registerTask('default', ['uglify', 'cssmin']);

};