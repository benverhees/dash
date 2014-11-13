'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// If you want to recursively match all subfolders, use:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Configurable paths
    var config = {
        app: 'source',
        dist: 'public',
        core: 'core'
    };

    // Define the configuration for all the tasks
    grunt.initConfig({

        // Project settings
        config: config,

        // Watches files for changes and runs tasks based on the changed files
        watch: {
            patternlab: {
                files: ['<%= config.app %>/_patterns/**/*', '<%= config.app %>/_data/**/*'],
                tasks: ['exec:patternlab'],
                options: {
                    spawn: false,
                    livereload: true
                }
            },
            bower: {
                files: ['bower.json'],
                tasks: ['exec:bowerInstall', 'exec:patternlab'],
                options: {
                    spawn: false,
                    livereload: true
                }
            },
            js: {
                files: ['<%= config.app %>/scripts/{,*/}*.js'],
                tasks: ['jshint', 'exec:patternlab'],
                options: {
                    spawn: false,
                    livereload: true
                }
            },
            gruntfile: {
                files: ['Gruntfile.js', 'exec:patternlab']
            },
            sass: {
                files: ['<%= config.app %>/scss/{,*/}*.{scss,sass}'],
                tasks: ['sass:server', 'autoprefixer', 'exec:patternlab'],
                options: {
                    spawn: false,
                    livereload: true
                }
            }
        },

        connect: {
            server: {
                options: {
                    port: 9000,
                    livereload: 35729,
                    // Change this to '0.0.0.0' to access the server from outside
                    hostname: 'localhost',
                    open: {
                        target: 'http://localhost:9000/'
                    },
                    base: '<%= config.dist %>',
                }
            }
        },

        // Empties folders to start fresh
        clean: {
            server: ["<%= config.dist %>/styleguide"]
        },

        copy: {
            server: {
                expand: true,
                cwd: '<%= config.core %>/styleguide/',
                src: '**',
                dest: '<%= config.dist %>/styleguide/',
                flatten: false,
                filter: 'isFile'
            }
        },

        // Make sure code styles are up to par and there are no obvious mistakes
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: [
                'Gruntfile.js',
                '<%= config.app %>/js/{,*/}*.js',
                '!<%= config.app %>/js/vendor/*',
                'test/spec/{,*/}*.js'
            ]
        },

        // Compiles Sass to CSS and generates necessary files if requested
        sass: {
            options: {
                sourcemap: true,
                loadPath: '<%= config.app %>/bower_components'
            },
            server: {
                files: [{
                    expand: true,
                    cwd: '<%= config.app %>/scss',
                    src: ['*.{scss,sass}'],
                    dest: '<%= config.app %>/css',
                    ext: '.css'
                }]
            }
        },

        // Add vendor prefixed styles
        autoprefixer: {
            options: {
                browsers: [
                    '> 1%',
                    'last 2 versions',
                    'Firefox ESR',
                    'Opera 12.1'
                ]
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= config.app %>/css/',
                    src: '{,*/}*.css',
                    dest: '<%= config.app %>/css/'
                }]
            }
        },

        // Automatically inject Bower components into the HTML file
        wiredep: {
            app: {
                ignorePath: /^\/|\.\.\//,
                src: ['<%= config.app %>/index.html']
            },
            sass: {
                src: ['<%= config.app %>/styles/{,*/}*.{scss,sass}'],
                ignorePath: /(\.\.\/){1,2}bower_components\//
            }
        },

        // The following *-min tasks produce minified files in the dist folder
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= config.app %>/images',
                    src: '{,*/}*.{gif,jpeg,jpg,png}',
                    dest: '<%= config.dist %>/images'
                }]
            }
        },

        svgmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= config.app %>/images',
                    src: '{,*/}*.svg',
                    dest: '<%= config.dist %>/images'
                }]
            }
        },

        // Generates a custom Modernizr build that includes only the tests you
        // reference in your app
        modernizr: {
            dist: {
                devFile: 'bower_components/modernizr/modernizr.js',
                outputFile: '<%= config.dist %>/scripts/vendor/modernizr.js',
                files: {
                    src: [
                        '<%= config.dist %>/scripts/{,*/}*.js',
                        '<%= config.dist %>/styles/{,*/}*.css',
                        '!<%= config.dist %>/scripts/vendor/*'
                    ]
                },
                uglify: true
            }
        },

        exec: {
            bowerInstall: 'bower install',
            patternlab: 'php core/builder.php -g'
        }
    });


    grunt.registerTask('serve', 'start the server and preview your app, --allow-remote for remote access', function (target) {
        if (grunt.option('allow-remote')) {
            grunt.config.set('connect.options.hostname', '0.0.0.0');
        }
        if (target === 'dist') {
            return grunt.task.run(['build', 'connect:dist:keepalive']);
        }

        grunt.task.run([
            'clean:server',
            'copy:server',
            'exec:bowerInstall',
            'sass:server',
            'autoprefixer',
            'exec:patternlab',
            'connect:server',
            'watch'
        ]);
    });

    grunt.registerTask('server', function (target) {
        grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
        grunt.task.run([target ? ('serve:' + target) : 'serve']);
    });
};
