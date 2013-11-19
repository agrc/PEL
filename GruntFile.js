module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jasmine: {
            // for embedded map projects...
            // app: {
            //   src: ['src/EmbeddedMapLoader.js'],
            //   options: {
            //     specs: ['src/app/tests/spec/*.js']
            //   }
            // }

            // for regular apps...
            app: {
                src: ['src/app/run.js'],
                options: {
                    specs: ['src/app/tests/spec/*.js'],
                    vendor: [
                        'src/app/tests/jasmineTestBootstrap.js',
                        // 'http://js.arcgis.com/3.6/',
                        'src/dojo/dojo.js'
                    ]
                }
            }
        },
        jshint: {
            files: ['src/app/**/*.js'],
            options: {
                jshintrc: '.jshintrc'
            }
        },
        watch: {
            files: [
                'src/app/**/*.js',
                'src/app/tests/*.html',
                'src/index.html',
                'src/user_admin.html'
            ],
            tasks: ['jasmine:app:build', 'jshint'],
            options: {
                livereload: true
            }
        },
        connect: {
            uses_defaults: {}
        }
    });

    // Register tasks.
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');

    // Default task.
    grunt.registerTask('default', ['jasmine:app:build', 'jshint', 'connect', 'watch']);
};