(function ($) {
  'use strict';
  console.log('hello');
  /**
   * All of the code for your public-facing JavaScript source
   * should reside in this file.
   *
   * Note: It has been assumed you will write jQuery code here, so the
   * $ function reference has been prepared for usage within the scope
   * of this function.
   *
   * This enables you to define handlers, for when the DOM is ready:
   *
   * $(function() {
   *
   * });
   *
   * When the window is loaded:
   *
   * $( window ).load(function() {
   *
   * });
   *
   * ...and/or other possibilities.
   *
   * Ideally, it is not considered best practise to attach more than a
   * single DOM-ready or window-load handler for a particular page.
   * Although scripts in the WordPress core, Plugins and Themes may be
   * practising this, we should strive to set a better example in our own work.
   */
  jQuery(document).ready(function ($) {
    $(window).load(function () {
      var nextSelector = selector['nextSelector'];
      var navigationSelector = selector['navigationSelector'];
      var contentSelector = selector['contentSelector'];
      var itemSelector = selector['itemSelector'];

      console.log({
        nextSelector,
        navigationSelector,
        contentSelector,
        itemSelector,
      });

      /** Support for TwentyTwenty theme */
      if ('' !== contentSelector) {
        itemSelector =
          selector['contentSelector'] + ' ' + selector['itemSelector'];
      } else {
        itemSelector = selector['itemSelector'];
      }

      var destUrl = $(nextSelector).attr('href');
      var finished = false;
      var flag = false;

      if (
        $(nextSelector).length &&
        $(navigationSelector).length &&
        // $(contentSelector).length &&
        $(itemSelector).length
      ) {
        $(navigationSelector).css('display', 'none');
        $('body').addClass('infinite-scroll');

        var trigger = selector['event'];
        $(itemSelector)
          .last()
          .after(
            '<div id="ctis-loading" class="infinite-loader"><span class="spinner"><img src="' +
              selector['image'] +
              '" alt="catch-infinite-scroll-loader"></div></span>'
          );
        if ('click' == trigger) {
          $(itemSelector)
            .last()
            .after(
              '<div id="infinite-handle" class="ctis-load-more-container"><span class="ctis-load-more"><button>' +
                selector['load_more_text'] +
                '</button></span></div>'
            );
          load_on_click();
        } else {
          load_on_scroll();
        }

        $(window).scroll(function () {
          var t = $(this),
            elem = $(itemSelector).last();

          if (typeof elem == 'undefined') {
            return;
          }

          if (
            finished &&
            t.scrollTop() + t.height() >= elem.offset().top + elem.height()
          ) {
            setTimeout(function () {
              $('.ctis-finished-notice').fadeOut('slow');
            }, 3000);
          }
        });
      }

      function ctis_load_more() {
        $.ajax({
          url: destUrl,
          beforeSend: show_loader(),
          success: function (results) {
            if (selector['jetpack_enabled']) {
              $('.infinite-loader').css('text-indent', '0');
              $('.infinite-loader').css('height', 'auto');
            }
            hide_loader();
            var obj = $(results);

            var elem = obj.find(itemSelector);
            var next = obj.find(nextSelector);

            if (next.length !== 0) {
              $(nextSelector).attr('href', next.attr('href'));
            }

            var itemClass = selector['itemSelector'].split('.');

            elem = elem.each(function (index, value) {
              var el;
              if (
                $(value).find('img').hasClass('lazy') &&
                $(value).find('img').attr('data-src') !== undefined
              ) {
                var src = $(value).find('img').attr('data-src');
                $(value)
                  .find('img')
                  .attr('src', src)
                  .removeClass('lazy')
                  .removeAttr('data-src');
              }

              /** Support: Logic for prepending separator in TwentyTwenty theme */
              var separator = obj.find(itemSelector).siblings()[2 * index + 1];

              if (
                separator === undefined ||
                true === $(separator).hasClass(itemClass[1])
              ) {
                el = $(value);
              } else if (
                separator !== undefined &&
                false === $(separator).hasClass(itemClass[1])
              ) {
                $(separator).hasClass('publish-status');
                el = $(value).prepend(separator);
              }
              return value;
            });

            elem.each(function (i, v) {
              $(itemSelector).last().after($(this));
            });

            $(itemSelector).trigger('post-load');

            if (next.length !== 0 && next.attr('href') != '#') {
              destUrl = $(nextSelector).attr('href');
            } else {
              finished = true;
              $('body').addClass('infinity-end');
              $('.ctis-load-more-container').hide();
              $(itemSelector)
                .last()
                .after(
                  '<div class="ctis-finished-notice infinite-loader"><span class="finish-text spinner">' +
                    selector['finish_text'] +
                    '</span></div>'
                );
            }
          },
          error: function (results) {
            hide_loader();
            //$(".ctis-finished-notice").html('Error retrieving posts...');
          },
        });
      }

      function show_loader() {
        flag = true;
        $('#ctis-loading').show();
        // $('.infinite-loader').show();
        $('.ctis-load-more-container').hide();
      }

      function hide_loader() {
        $('#ctis-loading').hide();
        // $('.infinite-loader').hide();
        $('.ctis-load-more-container').show();
        setTimeout(function () {
          flag = false;
        }, 500);
      }

      function load_on_scroll() {
        $(window).on('scroll', function () {
          var t = $(this),
            elem = $(itemSelector).last();

          if (typeof elem == 'undefined') {
            return;
          }

          if (
            flag === false &&
            !finished &&
            t.scrollTop() + t.height() >= elem.offset().top + elem.height()
          ) {
            ctis_load_more();
          }
        });
      }

      function load_on_click() {
        $('body').on('click', '.ctis-load-more', function () {
          ctis_load_more();
        });
      }
    });
  });
})(jQuery);
