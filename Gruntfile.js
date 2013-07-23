module.exports = function( grunt ) {
  "use strict";
  grunt.initConfig({
    pkg: grunt.file.readJSON( "package.json" ),
    jshint: {
      options: {
        browser: true,
        globals: {
          window: true,
          document: true
        },
        "-W079": true // http://jslinterrors.com/redefinition-of-a/
      },
      files: [
        "./*.js",
        "./lib/**/*.js",
        "./public/**/*.js"
      ]
    }
  });
  grunt.loadNpmTasks( "grunt-contrib-jshint" );
  grunt.registerTask( "default", [ "jshint" ]);
};
