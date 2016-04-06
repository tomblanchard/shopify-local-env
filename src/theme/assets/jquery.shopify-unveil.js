/**
 * jQuery Unveil
 * A very lightweight jQuery plugin to lazy load images
 * http://luis-almeida.github.com/unveil
 *
 * Licensed under the MIT license.
 * Copyright 2013 Luís Almeida
 * https://github.com/luis-almeida
 */

// Added auto image resolution switching using Shopify's built-in sizes

;(function($) {

  $.fn.unveil = function(options) {

    var defaults = {
      threshold: 1000
    };

    var options = $.extend({}, defaults, options);

    var $w = $(window),
        images = this,
        loaded;

    this.on("unveil", function() {
      var source = getImageSource(this);
      this.setAttribute("src", source);
      if (typeof options.callback === "function") options.callback.call(this);
    });

    function getImageSource(img) {
      // TODO: clean this up, offer more flexibility
      var data_src = img.getAttribute("data-src");

      var retina = "(-webkit-min-device-pixel-ratio: 2) and (min-resolution: 192dpi)";
      var small = "(max-width: 480px)";
      var small_retina = small + " and " + retina;
      var medium = "(max-width: 768px)";
      var large = "(min-width: 769px)";

      if ( matchMedia(medium).matches && $(img).is("[data-src-mobile]") ) {
        return img.getAttribute("data-src-mobile");
      } else if ( matchMedia(small_retina).matches ) {
        return getShopifyUrl(data_src, "grande");
      } else if ( matchMedia(small).matches ) {
        // return getShopifyUrl(data_src, "medium");
        return getShopifyUrl(data_src, "grande");
      } else if ( matchMedia(retina).matches ) {
        if ( img.getAttribute("data-src-hero") ) {
          return getShopifyUrl(data_src, "2048x2048");
        } else {
          return getShopifyUrl(data_src, "1024x1024");
        }
      } else {
        return data_src;
      }
    }

    function getShopifyUrl(src, size) {
      var shopify_image_sizes = /_(pico|icon|thumb|small|compact|medium|large|grande|1024x1024|2048x2048|master)\.(jpg|jpeg|gif|png)/;

      if ( !shopify_image_sizes.test(src) ) {
        //
        // There are 2 cases where an image URL may not contain a Shopify size:
        //
        //    1. If it just doesn't, which would be the original file URL
        //    2. There is no image in which case Shopify returns a "No image"
        //       which has a size, but it doesn't follow the same pattern.
        //
        // To handle the first case, we simply add a size to the URL.
        //
        // To handle the second case, we only look for jpg and png when adding a size,
        // not gif. NOTE: This may be a problem if the actual image is a gif.
        //
        return src.replace(/((\.jpg|\.png).+)$/, "_" + size + "$1");
      } else {
        return src.replace(shopify_image_sizes, "_" + size + ".$2");
      }
    }

    function unveil() {
      var inview = images.filter(function() {
        var $e = $(this);
        // if ($e.is(":hidden")) return;

        var wt = $w.scrollTop(),
            wb = wt + $w.height(),
            et = $e.offset().top,
            eb = et + $e.height();

        return eb >= wt - options.threshold && et <= wb + options.threshold;
      });

      loaded = inview.trigger("unveil");
      images = images.not(loaded);
    }

    $w.on("scroll.unveil resize.unveil lookup.unveil", throttle(unveil, 100));

    unveil();

    return this;

  };

  // TODO: attach this to either Theme or jQuery, also see: https://github.com/mekwall/jquery-throttle
  // ht: https://remysharp.com/2010/07/21/throttling-function-calls
  function throttle(fn, threshhold, scope) {
    threshhold || (threshhold = 250);
    var last,
        deferTimer;
    return function () {
      var context = scope || this;

      var now = +new Date,
          args = arguments;
      if (last && now < last + threshhold) {
        clearTimeout(deferTimer);
        deferTimer = setTimeout(function () {
          last = now;
          fn.apply(context, args);
        }, threshhold);
      } else {
        last = now;
        fn.apply(context, args);
      }
    };
  }

})(window.jQuery);
