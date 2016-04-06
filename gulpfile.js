// Dependencies
var gulp = require('gulp');
var util = require('util');
var tap = require('gulp-tap');
var fs = require('fs');
var browser_sync = require('browser-sync');
var del = require('del');
var sass = require('gulp-sass');
var rename = require("gulp-rename");
var child_process = require('child_process');
var path = require('path');
var responsive = require('gulp-responsive');
var newy = require('gulp-newy');
var gulp_if = require('gulp-if');
var image_size = require('image-size');


// Global
var shopify_image_sizes = {
  'pico':      16,
  'icon':      32,
  'thumb':     50,
  'small':     100,
  'compact':   160,
  'medium':    240,
  'large':     480,
  'grande':    600,
  '1024x1024': 1024,
  'original':  1024,
  '2048x2048': 2048,
  'master':    2048
};

var shopify_image_extensions = ["jpg", "jpeg", "gif", "png"];

function escape_shell (cmd) {
  return '\'' + cmd.replace(/\'/g, "'\\''") + '\'';
};

function capitalize (s) {
  return s.toLowerCase().replace( /\b./g, function(a){ return a.toUpperCase(); } );
};

function is_liquid_file (string) {
  return string.indexOf('.liquid') > -1;
};

function build_liquid (file) {
  var template = file.contents.toString();
  var data = {};

  var is_no_layout = template.indexOf('{% layout none %}') > -1;

  var is_asset = file.path.indexOf('.css') > -1 || file.path.indexOf('.scss') > -1 || file.path.indexOf('.js') > -1;

  var is_alt_layout = template.indexOf('{% layout') > -1 && !is_no_layout;

  var use_layout = ( is_no_layout || is_asset ? false : true );

  if( use_layout ) {
    var layout_dir = 'src/theme/layout/';
    var layout_path = layout_dir + 'theme.liquid';

    if( is_alt_layout ) {
      layout_path = template.match(/\{% layout ["|']((?:\\.|[^"\\])*)["|'] \%}/)[0];
      layout_path = layout_path.match(/["|'](.*?)["|']/)[1];
      layout_path = layout_dir + layout_path + '.liquid';
    }

    var layout = fs.readFileSync(layout_path, 'utf8');
    var layout_top = layout.split('{{ content_for_layout }}', 2)[0];
    var layout_bottom = layout.split('{{ content_for_layout }}', 2)[1];

    template = layout_top + template + layout_bottom;
  }

  var page_title = path.basename(file.path, '.liquid'),
      page_title = page_title.replace('-', ' '),
      page_title = capitalize(page_title);

  (function hydrate_data () {
    fs.readdirSync('src/data').forEach(function(file) {
      delete require.cache[require.resolve('./src/data/' + file)];
      data[path.basename(file, '.js')] = require('./src/data/' + file);
    });
    data.template = path.basename(file.path, '.liquid');
    data.page_title = page_title;
    data.page.title = page_title;
    data.canonical_url = path.basename(file.path);

    // Non-Shopify so prefixed with a `_`
    data._pages = fs.readdirSync('src/theme/templates');
  })();

  (function fix_circular_deps () {
    data = JSON.stringify(data);

    var regex = /"{{ [a-z]*.js }}"/g;

    data.replace(regex, function(match) {
      var file_name = match
        .replace('"{{ ', '')
        .replace(' }}"', '')
        .replace('.js', '');

      try {
        var file = require('./src/data/' + file_name + '.js');

        data = data
          .replace( /"{{ [a-z]*.js }}"/g, JSON.stringify(file) )
          .replace( /"{{ [a-z]*.js }}"/g, JSON.stringify(file) )
          .replace( new RegExp( '"' + file_name + '":"{{ ' + file_name + '.js }}"', 'g' ), '' );
      } catch (ex) {
        return;
      }
    });
  })();

  (function fix_double_commas () {
    data = data.replace(/",,"/g, '","').replace(/,,"/g, ',"').replace(/",,/g, '",');
  })();

  (function write_compiled_data () {
    var dir = 'site/temp';

    if ( !fs.existsSync(dir) ) {
      fs.mkdirSync(dir);
    }

    fs.writeFileSync( 'site/temp/' + path.basename(file.path) + '.json', data );
  })();

  (function run_ruby_liquid_command () {
    template = escape_shell(template);
    dataFileName = escape_shell(path.basename(file.path));

    var command = 'ruby liquid.rb ' + template + ' ' + dataFileName;

    template = child_process.execSync(command, { encoding: 'utf8' });
  })();

  (function replace_common_urls () {
    template = template
      .replace(/href=["|']\/["|']/g, 'href="index.html"')
      .replace(/href=["|']\/cart["|']/g, 'href="cart.html"')
      .replace(/action=["|']\/search["|']/g, 'action="search.html"');
  })();

  (function size_asset_images () {
    var regex = new RegExp( "..\/src\/theme\/assets\/([A-Za-z0-9\-\_]+)_(" + Object.keys(shopify_image_sizes).join("|") + ")(_cropped)?\.(" + shopify_image_extensions.join("|") + ")", "g" );

    template = template.replace( regex, "assets/$1_$2$3.$4" );
  })();

  file.contents = new Buffer( String(template) );
}


// Server
gulp.task('browser-sync', function() {
  browser_sync({
    server: {
      baseDir: '.'
    },
    notify: false,
    startPath: '/site/templates.html'
  });
});


// HTML
function pre_html ( files, newy_enabled ) {
  return gulp.src(files)
    .pipe(gulp_if(newy_enabled, newy(function (projectDir, srcFile, absSrcFile) {
      return projectDir + '/site/' + srcFile.replace('.liquid', '.html');
    })))
    .pipe(tap(function(file) {
      build_liquid(file);
    }))
    .pipe(rename(function (path) {
      path.extname = '.html'
    }))
    .pipe(gulp.dest('site'));
}

gulp.task('pre-html', function() {
  return pre_html( ['src/templates.liquid', 'src/theme/templates/*.liquid'], false );
});

gulp.task('pre-html:newy', function() {
  return pre_html( ['src/templates.liquid', 'src/theme/templates/*.liquid'], true );
});

gulp.task('html', ['pre-html'], browser_sync.reload);

gulp.task('html:newy', ['pre-html:newy'], browser_sync.reload);


// CSS
gulp.task('styles:css', function() {
  return gulp.src(['src/theme/assets/*.css', 'src/theme/assets/*.css.liquid'])
    .pipe(tap(function (file) {
      if( is_liquid_file(file.path) ) {
        build_liquid(file);
      }
    }))
    .pipe(tap(function(file) {
      file.path = file.path
        .replace('.css.liquid', '.css')
        .replace('.css.css', '.css');
    }))
    .pipe(gulp.dest('site/assets'))
    .pipe(browser_sync.reload({
      stream: true
    }));
});


// Sass
gulp.task('styles:sass', function() {
  return gulp.src(['src/theme/assets/*.scss', 'src/theme/assets/*.scss.liquid'])
    .pipe(tap(function (file) {
      if( is_liquid_file(file.path) ) {
        build_liquid(file);
      }
    }))
    .pipe(sass())
    .pipe(tap(function(file) {
      file.path = file.path
        .replace('.scss.liquid', '.css')
        .replace('.scss.css', '.css');
    }))
    .pipe(gulp.dest('site/assets'))
    .pipe(browser_sync.reload({
      stream: true
    }));
});


// JS
gulp.task('javascript', function() {
  return gulp.src(['src/theme/assets/*.js', 'src/theme/assets/*.js.liquid'])
    .pipe(tap(function (file) {
      if( is_liquid_file(file.path) ) {
        build_liquid(file);
      }
    }))
    .pipe(tap(function(file) {
      file.path = file.path.replace('.js.liquid', '.js');
    }))
    .pipe(gulp.dest('site/assets'))
    .pipe(browser_sync.reload({
      stream: true
    }));
});


// Generate asset images with all Shopify sizes
gulp.task('pre-resize-assets', function () {
  var config = {};

  fs.readdirSync('src/theme/assets').forEach(function(file) {
    var basename = path.basename(file);
    var extname = path.extname(file);

    if( ! shopify_image_extensions.some(function(v) { return extname.indexOf(v) >= 0; }) ) {
      return;
    }

    var dimensions = image_size( 'src/theme/assets/' + basename );

    config[basename] = [];

    for( var size in shopify_image_sizes ) {
      ['', '_cropped'].forEach(function (value) {
        config[basename].push({
          rename: basename.replace('.', '_' + size + value + '.'),
          max:    ( value ? false : true ),
          crop:   ( value ? 'center' : false ),
          withoutEnlargement: ( value ? false : true ),
          width:  ( dimensions.width  >= shopify_image_sizes[size] || value ? shopify_image_sizes[size] : null ),
          height: ( dimensions.height >= shopify_image_sizes[size] || value ? shopify_image_sizes[size] : null )
        });
      });
    }
  });

  return gulp.src('src/theme/assets/*.{' + shopify_image_extensions.join(',') + '}')
    .pipe(responsive( config ))
    .pipe(gulp.dest('site/assets'));
});

gulp.task('resize-assets', ['pre-resize-assets'], browser_sync.reload);


// Build
gulp.task('build', ['html', 'styles:css', 'styles:sass', 'javascript', 'resize-assets']);


// Build and serve
gulp.task('build:serve', ['build'], function() {
  gulp.start('browser-sync');
});


// Default task
gulp.task('default', ['build:serve'], function() {
  gulp.watch(['src/theme/layout/*.liquid', 'src/theme/snippets/*.liquid'], ['html']);
  gulp.watch(['src/templates.liquid', 'src/theme/templates/*.liquid'], ['html:newy']);

  gulp.watch(['src/theme/assets/*.css', 'src/theme/assets/*.css.liquid'], ['styles:css']);
  gulp.watch(['src/theme/assets/*.scss', 'src/theme/assets/*.scss.liquid'], ['styles:sass']);

  gulp.watch(['src/theme/assets/*.js', 'src/theme/assets/*.js.liquid'], ['javascript']);

  gulp.watch(['src/theme/assets/*.{' + shopify_image_extensions.join(',') + '}'], ['resize-assets']);

  gulp.watch(['src/data/**/*'], ['html', 'styles:css', 'styles:sass', 'javascript']);
});