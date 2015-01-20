module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watchify: {
      options: {
        // defaults options used in b.bundle(opts)
        detectGlobals: true,
        insertGlobals: false,
        ignoreMissing: false,
        debug: false,
        standalone: false,

        keepalive: false,
        callback: function(b) {
          // configure the browserify instance here
          b.plugin('factor-bundle', {outputs: [
            'public/javascripts/bundle/edit.js',
            'public/javascripts/bundle/publication.js'
          ]});

          // return it
          return b;
        },
        src: './views/**/*.js',
        dest: 'public/javascripts/bundle.js'
      }
    },
    browserify: {
      options: {
        preBundleCB: function(b) {
          // configure the browserify instance here
          b.plugin('factor-bundle', {outputs: [
            'build/bundle/edit.js',
            'build/bundle/publication.js',
            ]});
        },
      },
      all: {
        src: './views/**/*.js',
        dest: 'build/bundle.js'
      }
    },
    uglify: {
      all: {
        files: [{
          expand: true,
          cwd: 'build',
          src: '**/*.js',
          dest: 'public/javascripts'
        }]
      }
    },
    mkdir: {
      all: {
        options: {
          mode: 0777,
          create: ['build/bundle', 'public/javscripts/bundle']
        },
      },
    },
    clean: ['build', 'public/javascripts/bundle', 'public/javascripts/bundle.js']
  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-watchify');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-mkdir');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.registerTask('default', ['mkdir', 'browserify']);
};
