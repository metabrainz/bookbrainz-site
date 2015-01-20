module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    browserify: {
      options: {
        preBundleCB: function(b) {
          // configure the browserify instance here
          b.plugin('factor-bundle', {outputs: [
            'public/javascripts/bundle/edit.js',
            'public/javascripts/bundle/publication.js',
            ]});
        },
      },
      all: {
        src: './views/**/*.js',
        dest: 'public/javascripts/bundle.js'
      },
      watch: {
        src: './views/**/*.js',
        dest: 'public/javascripts/bundle.js',
        options: {
          watch: true,
          keepAlive: true
        }
      }
    },
    uglify: {
      all: {
        files: [{
          expand: true,
          cwd: 'public/javascripts',
          src: '**/*.js',
          dest: 'public/javascripts'
        }]
      }
    },
    mkdir: {
      all: {
        options: {
          mode: 0777,
          create: ['build/bundle', 'public/javascripts/bundle']
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
