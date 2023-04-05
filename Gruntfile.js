module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);

    var jsFiles = 'src/app/**/*.js';
    var otherFiles = [
        'src/app/**/*.html',
        'src/app/**/*.css',
        'src/index.html',
        'src/ChangeLog.html'
    ];
    var gruntFile = 'Gruntfile.js';
    var buildFiles = 'profiles/*.js';
    var jshintFiles = [jsFiles, gruntFile, buildFiles];
    var bumpFiles = [
        'package.json',
        'bower.json',
        'src/app/package.json',
        'src/app/config.js'
    ];
    var processhtmlOptions = {
        files: {
            'dist/index.html': ['src/index.html']
        }
    };

    grunt.initConfig({
        bump: {
            options: {
                files: bumpFiles,
                commitFiles: bumpFiles.concat(['src/ChangeLog.html']),
                push: false
            }
        },
        clean: {
            build: ['dist']
        },
        connect: {
            use_defaults: {}
        },
        copy: {
            main: {
                files: [{
                    expand: true,
                    cwd: 'src/',
                    src: ['*.html', 'secrets.json'],
                    dest: 'dist/'
                }]
            }
        },
        dojo: {
            prod: {
                options: {
                    profiles: ['profiles/prod.build.profile.js', 'profiles/build.profile.js']
                }
            },
            stage: {
                options: {
                    profiles: ['profiles/stage.build.profile.js', 'profiles/build.profile.js']
                }
            },
            options: {
                dojo: 'src/dojo/dojo.js',
                releaseDir: '../dist',
                requires: ['src/app/packages.js', 'src/app/run.js'],
                basePath: './src'
            }
        },
        eslint: {
            options: {
                overrideConfigFile: '.eslintrc'
            },
            main: {
                src: jsFiles
            }
        },
        imagemin: { // Task
            dynamic: { // Another target
                options: { // Target options
                    optimizationLevel: 3
                },
                files: [{
                    expand: true, // Enable dynamic expansion
                    cwd: 'src/', // Src matches are relative to this path
                    src: '**/*.{png,jpg,gif}', // Actual patterns to match
                    dest: 'src/'
                }]
            }
        },
        jasmine: {
            main: {
                options: {
                    specs: ['src/app/**/Spec*.js'],
                    vendor: [
                        'src/jasmine-favicon-reporter/vendor/favico.js',
                        'src/jasmine-favicon-reporter/jasmine-favicon-reporter.js',
                        'src/jasmine-jsreporter/jasmine-jsreporter.js',
                        'src/app/tests/jasmineTestBootstrap.js',
                        'src/dojo/dojo.js',
                        'src/app/packages.js',
                        'src/app/tests/jsReporterSanitizer.js',
                        'src/app/tests/jasmineAMDErrorChecking.js'
                    ],
                    host: 'http://localhost:8000',
                    keepRunner: true
                }
            }
        },
        pkg: grunt.file.readJSON('package.json'),
        processhtml: {
            stage: processhtmlOptions,
            prod: processhtmlOptions
        },
        uglify: {
            options: {
                preserveComments: false,
                sourceMap: true,
                compress: {
                    drop_console: true,
                    passes: 2,
                    dead_code: true
                }
            },
            stage: {
                options: {
                    compress: {
                        drop_console: false
                    }
                },
                src: ['dist/dojo/dojo.js'],
                dest: 'dist/dojo/dojo.js'
            },
            prod: {
                files: [{
                    expand: true,
                    cwd: 'dist',
                    src: ['**/*.js', '!proj4/**/*.js'],
                    dest: 'dist'
                }]
            }
        },
        watch: {
            src: {
                files: jshintFiles.concat(otherFiles),
                options: {
                    livereload: true
                }
            },
            eslint: {
                files: jshintFiles,
                tasks: ['eslint:main', 'jasmine:main:build']
            }
        }
    });

    // Default task.
    grunt.registerTask('default', [
        'jasmine:main:build',
        'eslint:main',
        'connect',
        'watch'
    ]);

    grunt.registerTask('test', [
        'eslint:main',
        'connect',
        'jasmine:main'
    ]);

    // PROD
    grunt.registerTask('build-prod', [
        'eslint:main',
        'newer:imagemin:dynamic',
        'clean:build',
        'dojo:prod',
        'uglify:prod',
        'copy',
        'processhtml:prod'
    ]);

    // STAGE
    grunt.registerTask('build-stage', [
        'eslint:main',
        'newer:imagemin:dynamic',
        'clean:build',
        'dojo:stage',
        'uglify:stage',
        'copy',
        'processhtml:stage'
    ]);
};
