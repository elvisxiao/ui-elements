module.exports = function(grunt) {
    // 构建任务配置
    grunt.initConfig({
        pkg : grunt.file.readJSON('package.json'),
        
        //js 合并
        concat : {
            options : {
                separator : ';'
            },
            domop : {
                src  : ['public/js/**/**.js'],
                dest : 'public/dest/main.js'
            }
        },

        //browserify
        browserify: {
            js: {
                src: 'public/js/lib/index.js',
                dest: 'public/dest/oc.js'
            }
        },

        //js 压缩
        uglify : {
            options : {
                banner : '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build : {
                src : 'public/dest/oc.js',
                dest : 'public/dest/oc.min.js'
            }
        },

        //针对stylus
        stylus: {
            build : {
                options: {
                    linenos: true,
                    compress: false
                },
                files: [
                    {
                        expand: true,
                        cwd: 'public',
                        src: ['css/**/**.styl'],
                        dest: 'public/dest',
                        ext: '.css'
                    }
                ]
            }
        },

        //合并压缩css
        cssmin: {
            build: {
                files: {
                    'public/dest/oc.css': [ 'public/dest/**/*.css' ]
                }
            }
        },

        //针对jade
        jade: {
            compile: {
                options: {
                    data: {}
                },
                files: [{
                    expand: true,
                    cwd: 'views',
                    src: ['**/**.jade'],
                    dest: 'public/dest/html',
                    ext: '.html'
                }]
            }
        },

        //清理不需要的文件
        clean: {
            build: {
                src: [ 'public/dest' ]
            },
            stylesheets: {
                src: [ 'public/dest/**/*.css']
            },
            scripts: {

                src: [ 'public/dest/**/*.js', 'public/dest/doc/*']
            },
        },

        //自动处理
        watch: {
            css: {
                files: 'public/css/**/**.styl',
                tasks: ['clean:stylesheets', 'stylus', 'cssmin'],
                options: {
                    livereload: '<%= pkg.name %>1',
                }
            },
            js: {
                files: 'public/js/lib/**/**.js',
                tasks: ['clean:scripts', 'browserify', 'uglify', 'jsdoc'],
            }
        },

        //js文档
        jsdoc : {
            dist : {
                src: ['public/js/lib/**/**.js'], 
                options: {
                    destination: 'public/dest/doc'
                }
            }
        }
    })

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-stylus');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jade');
    grunt.loadNpmTasks('grunt-jsdoc');


    //定义任务
    // grunt.registerTask(
    //     'default', 
    //     'Watches the project for changes, automatically builds them and runs a server.', 
    //     ['clean:build', 'stylus', 'cssmin', 'concat', 'uglify']
    // );
    grunt.registerTask(
        'default', 
        'Watches the project for changes, automatically builds them and runs a server.', 
        ['watch']
    );

};