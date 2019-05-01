module.exports = function(grunt) {

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        today: grunt.template.today("yyyy-mm-dd"),

        banner: '/*! jQuery.Flipster, v<%= pkg.version %> (built <%= today %>) */\n',

        autoprefix: new (require('less-plugin-autoprefix'))({browsers: ["last 3 versions", 'ie >= 9']}),

        src: {
            dir: 'src',
            js: '<%= src.dir %>/jquery.flipster.js',
            less: '<%= src.dir %>/**/*.less'
        },

        dist: {
            dir: 'dist',
            js: '<%= dist.dir %>/jquery.flipster.min.js',
            css: '<%= dist.dir %>/jquery.flipster.css',
            cssmin: '<%= dist.dir %>/jquery.flipster.min.css'
        }

    });


    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.config('uglify',{
        options: {
            banner: '<%= banner %>',
        },
        dist: {
            files: {
                '<%= dist.js %>': ['<%= src.js %>']
            }
        }
    });


    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.config('less',{
        full: {
            options: {
                banner: '<%= banner %>',
                plugins: ['<%= autoprefix %>']
            },
            files: {
                '<%= dist.css %>': ['<%= src.less %>']
            }
        },
        minified: {
            options: {
                banner: '<%= banner %>',
                plugins: ['<%= autoprefix %>'],
                compress: true
            },
            files: {
                '<%= dist.cssmin %>': ['<%= src.less %>']
            }
        }
    });


    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.config('watch',{
        options: { debounceDelay: 250 },
        scripts: {
            files: '<%= src.js %>',
            tasks: ['uglify']
        },
        less: {
            files: '<%= src.less %>',
            tasks: ['less']
        },
    });


    grunt.registerTask('default', ['uglify', 'less']);

};
