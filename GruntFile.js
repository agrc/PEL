/* jshint camelcase:false */
module.exports = function(grunt) {
    var jsFiles = 'src/app/**/*.js',
        gruntFile = 'GruntFile.js',
        otherFiles = [
            'src/app/**/*.html',
            'src/app/**/*.css',
            'src/index.html',
            'src/ChangeLog.html'
        ],
        jsHintFiles = [jsFiles, gruntFile];

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        connect: {
            uses_defaults: {}
        },
        jasmine: {
            app: {
                src: ['src/app/run.js'],
                options: {
                    specs: ['src/app/tests/spec/*.js'],
                    vendor: [
                        'src/jasmine-favicon-reporter/vendor/favico.js',
                        'src/jasmine-favicon-reporter/jasmine-favicon-reporter.js',
                        'src/app/tests/jasmineTestBootstrap.js',
                        'src/dojo/dojo.js'
                    ],
                    host: 'http://localhost:8000'
                }
            }
        },
        watch: {
            jshint: {
                files: jsHintFiles,
                tasks: ['jshint', 'jasmine:default:build']
            },
            src: {
                files: jsHintFiles.concat(otherFiles),
                options: {
                    livereload: true
                }
            }
        },
        jshint: {
            files: jsHintFiles,
            options: {
                jshintrc: '.jshintrc'
            }
        },
        clean: ['dist'],
        esri_slurp: {
            options: {
                version: '3.9'
            }
        },
        dojo: {
            prod: {
                options: {
                    profiles: ['profiles/prod.build.profile.js', 'profiles/build.profile.js'] // Profile for build
                }
            },
            stage: {
                options: {
                    profiles: ['profiles/stage.build.profile.js', 'profiles/build.profile.js'] // Profile for build
                }
            },
            options: {
                dojo: 'src/dojo/dojo.js', // Path to dojo.js file in dojo source
                releaseDir: '../dist',
                require: 'src/app/run.js', // Optional: Module to require for the build (Default: nothing)
                basePath: './src'
            }
        },
        processhtml: {
            options: {},
            dist: {
                files: {
                    'dist/index.html': ['src/index.html']
                }
            }
        },
        copy: {
            main: {
                src: 'src/ChangeLog.html',
                dest: 'dist/ChangeLog.html'
            }
        },
        bump: {
            options: {
                files: ['package.json', 'src/app/package.json', 'src/app/main.js'],
                commit: true,
                commitFiles: ['-a'], // '-a' for all files
                createTag: true,
                tagName: 'v%VERSION%',
                tagMessage: 'Version %VERSION%',
                push: true,
                pushTo: 'origin'
            }
        }
    });

    // Register tasks.
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-esri-slurp');
    grunt.loadNpmTasks('grunt-processhtml');
    grunt.loadNpmTasks('grunt-dojo');
    grunt.loadNpmTasks('grunt-bump');


    // Default task.
    grunt.registerTask('default', ['jasmine:app:build', 'jshint', 'connect', 'watch']);
    grunt.registerTask('travis', ['jshint', 'esri_slurp', 'connect', 'jasmine:app']);

    grunt.registerTask('build',
        ['clean', 'dojo:prod', 'newer:imagemin:dynamic', 'copy', 'processhtml:dist']);
    grunt.registerTask('stage-build',
        ['clean', 'dojo:stage', 'newer:imagemin:dynamic', 'copy', 'processhtml:dist']);
};