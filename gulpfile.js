import gulp from 'gulp';
import gulpTs from 'gulp-typescript';
import ts from 'typescript';

gulp.task('typescript-cjs', function () {
	var proj = gulpTs.createProject('./tsconfig.json', {
		typescript: ts,
		module: 'commonjs'
	});

	return gulp.src('./src/**/*.ts').pipe(proj()).pipe(gulp.dest('./dist/cjs'));
});

gulp.task('typescript-esm', function () {
	var proj = gulpTs.createProject('./tsconfig.json', {
		typescript: ts
	});

	return gulp.src('./src/**/*.ts').pipe(proj()).pipe(gulp.dest('./dist/esm'));
});

gulp.task('default', gulp.parallel('typescript-cjs', 'typescript-esm'));
