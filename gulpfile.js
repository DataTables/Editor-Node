var gulp = require('gulp');
var ts = require('gulp-typescript');
var sourcemaps = require('gulp-sourcemaps');


gulp.task( 'typescript', function () {
    var proj = ts.createProject( './tsconfig.json', {
        typescript: require('typescript')
    } );

    return gulp
        .src( './src/**/*.ts' )
        .pipe( sourcemaps.init() )
        .pipe( proj() )
        .pipe( sourcemaps.write('.') )
        .pipe( gulp.dest('./dist') );
} );


gulp.task( 'default', gulp.series('typescript') );
