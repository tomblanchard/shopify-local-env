(function ($) {
  $(".js-sort-by")
    .on("change", function () {
      var params = $.getQueryParams();
      params.sort_by = $(this).val();
      location.search = $.param(params);
    });
})(jQuery);

(function ($) {
  $(".js-tag-dropdown")
    .on("change", function () {
      location.href = location.origin + $(this).val();
    });
})(jQuery);
