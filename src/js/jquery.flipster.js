/* global window, jQuery */
(function($, window, undefined) {

    function throttle(func, delay) {
      var timer = null;

      return function() {
        var context = this, args = arguments;

        if (timer === null) {
          timer = setTimeout(function () {
            func.apply(context, args);
            timer = null;
          }, delay);
        }
      };
    }

    function checkStyleSupport( prop ) {

        var div = document.createElement('div'),
            style = div.style,
            ucProp = prop.charAt(0).toUpperCase() + prop.slice(1),
            prefixes = ["webkit", "moz", "ms", "o"],
            props = (prop + ' ' + (prefixes).join(ucProp + ' ') + ucProp).split(' ');

        for ( var i in props ) {
          if ( props[i] in style ) { return props[i]; }
        }
        return false;
    }

    var transformSupport = checkStyleSupport('transform');

$.fn.flipster = function(options) {
    'use strict';

    var isMethodCall = (typeof options === 'string' ? true : false);

    if ( isMethodCall ) {
        var method = options;
        var args = Array.prototype.slice.call(arguments, 1);
        return this.each(function(){
            var methods = $(this).data('methods');
            if ( methods[method] ) {
              return methods[method].apply(this, args);
            } else {
              return this;
            }
        });
    }

    var defaults = {
        itemContainer:    'ul',        // Container for the flippin' items.
        itemSelector:     'li',        // Selector for children of itemContainer to flip

        start:            'center',    // Starting item. Set to 0 to start at the first, 'center' to start in the middle or the index of the item you want to start with.
        loop:             true,        // Loop around when the start or end is reached.

        style:            'coverflow', // [coverflow|carousel] Switch between 'coverflow' or 'carousel' display styles
        spacing:          -0.5,        // Space between items relative to each item's width, 0 for no spacing, negative values to  overlap
        disableRotation:  false,

        enableKeyboard:   true,        // Enable left/right arrow navigation
        enableMousewheel: true,        // Enable scrollwheel navigation (up = left, down = right)
        enableTouch:      true,        // Enable swipe navigation for touch devices

        onItemSwitch:     $.noop,      // Callback function when items are switched. Current and previous items passed in as arguments

        enableNav:        false,    // If true, flipster will insert an unordered list of the slides
        navPosition:      'before', // [before|after] Changes the position of the navigation before or after the flipsterified items - case-insensitive

        enableNavButtons: false,      // If true, flipster will insert Previous / Next buttons
        prevText:         'Previous', // Changes the text for the Previous button
        nextText:         'Next',     // Changes the text for the Next button

        autoplay:         false,
        autoplayInterval: 5000
    };

    var settings = $.extend({}, defaults, options);

    var $window = $(window);

    return this.each(function() {

        var self = $(this);
        var methods;

        var _container;
        var _containerWidth;
        var _items;
        var _nav;
        var _navItems;
        var _currentIndex = 0;
        var _currentItem;

        var _playing = false;
        var _startDrag = false;

        function buildNavButtons() {
            if ( settings.enableNavButtons && _items.length > 1 ) {
                self.find('.flipto-prev, .flipto-next').remove();

                $('<a href="#" class="flipto-prev">'+settings.prevText+'</a>')
                    .on('click', function(e) {
                        jump('prev');
                        e.preventDefault();
                    })
                    .appendTo(self);

                $('<a href="#" class="flipto-next">'+settings.nextText+'</a>')
                    .on('click', function(e) {
                        jump('next');
                        e.preventDefault();
                    })
                    .appendTo(self);
            }
        }

        function buildNav() {
            if ( !settings.enableNav || _items.length <= 1 ) { return; }

            self.find('.flipster-nav').remove();

            var navCategories = {},
                navItems = {},
                navList = {};

            _items.each(function(){
                var item = $(this),
                    category = item.data('flip-category'),
                    itemId = item.attr('id'),
                    itemTitle = item.data('flip-title') || item.attr('title');

                if ( !navItems[itemId] ) {
                    navItems[itemId] = '<a href="#'+itemId+'" class="flip-nav-item-link">'+itemTitle+'</a>';
                    if ( category !== undefined ) {
                        navCategories[category] = category;
                        if ( !navList[category] ) {
                            navList[category] = '';
                        }
                        navList[category] += '<li class="flip-nav-item">' + navItems[itemId] + '</li>';
                    } else {
                        navList[itemId] = '<li class="flip-nav-item no-category">' + navItems[itemId] + '</li>';
                    }
                }
            });

            for ( var category in navCategories ) {
                navList[category] = '<li class="flip-nav-category"><a href="#" class="flip-nav-category-link" data-flip-category="'+category+'">'+category+'</a><ul class="flip-nav-items">' + navList[category] + '</ul></li>';
            }

            var navDisplay = '<ul class="flipster-nav">';
            for ( var navIndex in navList ) {
                navDisplay += navList[navIndex];
            }
            navDisplay += '</ul>';

            _nav = $(navDisplay);

            if ( settings.navPosition.toLowerCase() === 'after' ) {
                self.append(_nav);
            } else {
                self.prepend(_nav);
            }

            _navItems = _nav.find('a').on('click',function(e){
                var target;
                if ( $(this).hasClass('flip-nav-category-link') ) {
                    target = _items.filter('[data-flip-category="'+$(this).data('flip-category')+'"]').first();
                } else {
                    target = $(this.hash);
                }

                if ( target.length ) {
                    jump(target);
                    e.preventDefault();
                }
            });
        }

        function updateNav() {
            if ( settings.enableNav ) {
                _navItems
                  .removeClass('flip-nav-current')
                  .filter('[href="#'+_currentItem.attr('id')+'"]')
                    .addClass('flip-nav-current')
                  .end()
                  .filter('[data-flip-category="'+_currentItem.data('flip-category')+'"]')
                    .parent()
                    .addClass('flip-nav-current');
            }
        }

        function noTransition() {
            self.css('transition','none');
            _container.css('transition','none');
            _items.css('transition','none');
        }

        function resetTransition() {
            self.css('transition','');
            _container.css('transition','');
            _items.css('transition','');
        }

        function resize(skipTransition) {

            if ( skipTransition ) { noTransition(); }

            _containerWidth = _container.width();

            _items.each(function(i){
                var item = $(this),
                    spacing = (item.outerWidth() * settings.spacing);

                item.css('margin-right', spacing + 'px');

                if ( i === _items.length - 1 ) {
                    center();

                    if ( skipTransition ) { resetTransition(); }
                }
            });
        }

        var classRemover = new RegExp('\\b(flip-current|flip-past|flip-future)(.*?)(\\s|$)','g');

        function center() {
            if ( _currentItem ) {
                if ( !_containerWidth ) { resize(true); }

                var currentWidth = _currentItem.outerWidth(),
                    currentLeft = _currentItem.position().left,
                    containerOffset = -1 * ((currentLeft + (currentWidth / 2)) - (_containerWidth / 2));

                if ( transformSupport ) {
                    _container.css('transform', 'translateX(' + containerOffset + 'px)');
                } else {
                    _container.css({
                      //'position' : 'absolute',
                      'left': containerOffset + 'px'
                    });
                }
            }

            var total = _items.length;

            _items.each(function(i){
                var item = $(this);

                item.attr('class',function(i, c){
                  return c && c.replace(classRemover, '').trim();
                });

                if ( i === _currentIndex ) {
                    item.addClass('flip-current')
                        .css('z-index', (total + 1) );
                } else if ( i < _currentIndex ) {
                    item.addClass('flip-past flip-past--' + (_currentIndex - i) )
                        .css('z-index', i);
                } else if ( i > _currentIndex ) {
                    item.addClass('flip-future flip-future--' + ( i - _currentIndex ) )
                        .css('z-index', (total - i) );
                }
            });

            updateNav();
        }

        function jump(to) {
            var _previous = _currentIndex;

            if ( _items.length <= 1 ) {
                return;
            }

            if ( to === 'prev' ) {
                if ( _currentIndex > 0 ) { _currentIndex--; }
                else if ( settings.loop ) { _currentIndex = _items.length - 1; }
            } else if ( to === 'next' ) {
                if ( _currentIndex < _items.length - 1 ) { _currentIndex++; }
                else if ( settings.loop ) { _currentIndex = 0; }
            } else if ( typeof to === 'number' ) {
                _currentIndex = to;
            } else if ( to !== undefined ) {
                // if object is sent, get its index
                _currentIndex = _items.index(to);
            }

            if ( _currentIndex !== _previous ) {
              settings.onItemSwitch.call(self, _items[_currentIndex], _items[_previous]);
            }

            _currentItem = _items.eq(_currentIndex);
            center();
        }

        function play(interval) {
            var time = interval || settings.autoplayInterval;
            settings.autoplayInterval = time;
            _playing = setInterval(function(){
                 jump('next');
            }, time);
        }

        function pause() {
            clearInterval(_playing);
            _playing = _playing ? -1 : false;
        }

        function show() {
            resize(true);
            self.hide().css('visibility','').fadeIn(400);
        }

        function index() {

            _items = _container.find(settings.itemSelector).addClass('flip-item');

            if ( _items.length <= 1 ) { return; }

            _items
                // Wrap inner content
                .each(function(){
                    var item = $(this);
                    if ( !item.children('.flip-content').length ) { item.wrapInner('<div class="flip-content" />'); }
                })
                // Navigate directly to an item by clicking
                .on('click touchend', function(e) {
                    if ( !_startDrag ) {
                        if ( !$(this).hasClass('flip-current') ) { e.preventDefault(); }
                        jump(this);
                    }
                });

            // Insert navigation if enabled.
            buildNavButtons();
            buildNav();

            if ( _currentIndex >= 0 ) {
                jump(_currentIndex);
            }
        }

        function init() {

            self.addClass(
                    'flipster flipster-active' +
                    ( settings.style ? ' flipster-'+settings.style : '' ) +
                    ( settings.disableRotation ? ' no-rotate' : '' ) +
                    ( $.support.transform ? ' flipster-transform' : ' flipster-no-transform' )
                )
                .css('visibility','hidden');

            _container = self.find(settings.itemContainer).addClass('flip-items');

            index();

            if ( _items.length <= 1 ) { return; }

            noTransition();

            // Set the starting item
            if ( settings.start ) {
                // Find the middle item if start = center
                if ( settings.start === 'center' ) {
                    if (!_items.length % 2) {
                        _currentIndex = _items.length/2 + 1;
                    } else {
                        _currentIndex = Math.floor(_items.length/2);
                    }
                } else {
                    _currentIndex = settings.start;
                }
            }

            jump(_currentIndex);

            var images = self.find('img');

            if ( images.length ) {
                var imagesLoaded = 0;

                // Resize after all images have loaded.
                images.on('load',function(){
                  imagesLoaded++;
                  if ( imagesLoaded >= images.length ) { show(); }
                });
            } else {
              show();
            }

            // Attach event bindings.
            $window.on('resize.flipster', throttle(function() {
                resize();
            },400));

            if ( settings.autoplay ) { play(); }

            _container
                .on('mouseenter', pause)
                .on('mouseleave', function(){
                  if ( _playing === -1 ) { play(); }
                });

            if ( settings.enableKeyboard ) { new interactor.Keyboard().init(self); }
            if ( settings.enableMousewheel ) { new interactor.Mousewheel().init(_container); }
            if ( settings.enableTouch ) { new interactor.Touch().init(self); }
        }

        var interactor = {
            Keyboard: function() {
                this.init = function(elem) {
                    elem[0].tabIndex = 0;
                    elem.on('keydown.flipster', throttle(function(e){
                      console.log(e.which);
                        var code = e.which;
                        if ( code === 37 ) {
                            jump('prev');
                            e.preventDefault();
                        } else if ( code === 39 ) {
                            jump('next');
                            e.preventDefault();
                        }
                    },250,true));
                };
            },

            Mousewheel: function() {
                this.init = function(elem) {

                    elem.on('mousewheel.flipster', throttle(function(e){
                        jump((e.originalEvent.wheelDelta > 0 ? 'prev' : 'next'));
                        e.preventDefault();
                    },350,true));
                };
            },

            Touch: function() {

                this.init = function(elem) {

                    elem.on({
                      'touchstart.flipster mousedown.flipster' : function(e){
                              e = e.originalEvent;
                              _startDrag = ( e.touches ? e.touches[0].clientX : e.clientX );
                              e.preventDefault();
                          },

                      'touchmove.flipster mousemove.flipster' : throttle(function(e){
                              if ( _startDrag !== false ) {
                                  e = e.originalEvent;

                                  var x = ( e.touches ? e.touches[0].clientX : e.clientX ),
                                      offset = x - _startDrag;

                                  if ( offset >= 30 || offset <= -30 ) {
                                      jump((offset < 0 ? 'next' : 'prev'));
                                      _startDrag = x;
                                  }

                                  e.preventDefault();
                              }
                          },250),

                      'touchend.flipster touchcancel.flipster mouseup.flipster mouseleave.flipster' : function(){ _startDrag = false; }
                    });

                };
            }
        };

        // public methods
        methods = {
            jump: jump,
            next: function(){ jump('next'); },
            prev: function(){ jump('prev'); },
            play: function(){
              settings.autoplay = true;
              play();
            },
            pause: function(){
              settings.autoplay = false;
              pause();
            },
            index: index
        };
        self.data('methods', methods);

        // Initialize if flipster is not already active.
        if ( !self.hasClass('flipster-active') ) { init(); }
    });
};
})(jQuery, window);
