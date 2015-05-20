/* jshint browser: true, jquery: true, devel: true */
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

        enableNav:        false,       // If true, flipster will insert an unordered list of the slides
        navPosition:      'before',    // [before|after] Changes the position of the navigation before or after the flipsterified items - case-insensitive

        enableNavButtons: false,       // If true, flipster will insert Previous / Next buttons
        prevText:         'Previous',  // Changes the text for the Previous button
        nextText:         'Next',      // Changes the text for the Next button

        autoplay:         false,       // Switch to next item after autoplayInterval unless hovered.
        autoplayInterval: 5000         // Interval in milliseconds
    };

    var settings = $.extend({}, defaults, options);

    var $window = $(window);

    var classes = {
        main: 'flipster',
        active: 'flipster-active',
        container: 'flip-items',

        nav: 'flipster-nav',
        navItem: 'flip-nav-item',
        navCategory: 'flip-nav-category',
        navCategoryLink: 'flip-nav-category-link',
        navLink: 'flip-nav-item-link',
        navCurrent: 'flip-nav-current',

        navPrev: 'flipto-prev',
        navNext: 'flipto-next',

        item: 'flip-item',
        itemCurrent: 'flip-current',
        itemPast: 'flip-past',
        itemFuture: 'flip-future',
        itemContent: 'flip-content'
    };

    var classRemover = new RegExp('\\b(' + classes.itemCurrent + '|' + classes.itemPast + '|' + classes.itemFuture + ')(.*?)(\\s|$)','g');

    return this.each(function() {

        var self = $(this);
        var methods;

        var _container;
        var _containerWidth;
        var _items;
        var _nav;
        var _navItems;
        var _navCategories;
        var _currentIndex = 0;
        var _currentItem;

        var _playing = false;
        var _startDrag = false;

        function buildNavButtons() {
            if ( settings.enableNavButtons && _items.length > 1 ) {
                self.find('.' + classes.navPrev + ', .' + classes.navNext).remove();

                $('<a href="#" class="' + classes.navPrev + '" role="button">'+settings.prevText+'</a>')
                    .on('click', function(e) {
                        jump('prev');
                        e.preventDefault();
                    })
                    .appendTo(self);

                $('<a href="#" class="' + classes.navNext + '" role="button">'+settings.nextText+'</a>')
                    .on('click', function(e) {
                        jump('next');
                        e.preventDefault();
                    })
                    .appendTo(self);
            }
        }

        function buildNav() {
            if ( !settings.enableNav || _items.length <= 1 ) { return; }

            self.find('.' + classes.nav).remove();

            var navCategories = {};
            var navItems = {};
            var navList = {};

            _items.each(function(){
                var item = $(this);
                var category = item.data('flip-category');
                var itemId = item.attr('id');
                var itemTitle = item.data('flip-title') || item.attr('title');

                if ( !navItems[itemId] ) {
                    navItems[itemId] = '<a href="#'+itemId+'" class="' + classes.navLink + '">'+itemTitle+'</a>';
                    if ( category !== undefined ) {
                        navCategories[category] = category;
                        if ( !navList[category] ) {
                            navList[category] = '';
                        }
                        navList[category] += '<li class="' + classes.navItem + '">' + navItems[itemId] + '</li>';
                    } else {
                        navList[itemId] = '<li class="' + classes.navItem + ' no-category">' + navItems[itemId] + '</li>';
                    }
                }
            });

            for ( var category in navCategories ) {
                navList[category] = '<li class="' + classes.navCategory + '"><a href="#" class="' + classes.navCategoryLink + '" data-flip-category="'+category+'">'+category+'</a><ul class="flip-nav-items">' + navList[category] + '</ul></li>';
            }

            var navDisplay = '<ul class="' + classes.nav + '" role="navigation">';
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

            _navCategories = _nav.find('.' + classes.navCategory);

            _navItems = _nav.find('a').on('click',function(e){
                var target;
                if ( $(this).hasClass(classes.navCategoryLink) ) {
                    target = _items.filter('[data-flip-category="' + $(this).data('flip-category') + '"]').first();
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
                _navCategories
                    .removeClass(classes.navCurrent);

                _navItems
                    .removeClass(classes.navCurrent)
                    .filter('[href="#' + _currentItem.attr('id') + '"]')
                        .addClass(classes.navCurrent)
                    .end()
                    .filter('[data-flip-category="'+_currentItem.data('flip-category')+'"]')
                        .parent()
                        .addClass(classes.navCurrent);
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

        function calculateBiggestItemHeight() {
            var biggestHeight = 0;
            var itemHeight;
            _items.each(function() {
                itemHeight = $(this).height();
                if ( itemHeight > biggestHeight ) { biggestHeight = itemHeight; }
            });
            return biggestHeight;
        }

        function resize(skipTransition) {

            if ( skipTransition ) { noTransition(); }

            _containerWidth = _container.width();
            _container.height(calculateBiggestItemHeight());

            if ( settings.spacing !== 0 ) {
                _items.each(function(i){
                    var item = $(this);
                    var spacing = (item.outerWidth() * settings.spacing);

                    item.css('margin-right', spacing + 'px');

                    if ( i === _items.length - 1 ) {
                        center();

                        if ( skipTransition ) { resetTransition(); }
                    }
                });
            } else {
                center();
                if ( skipTransition ) { resetTransition(); }
            }
        }

        function center() {

            var total = _items.length;

            _items.each(function(i){
                var item = $(this);

                item.attr('class',function(i, c){
                    return c && c.replace(classRemover, '').trim();
                });

                if ( i === _currentIndex ) {
                    item.addClass(classes.itemCurrent)
                        .css('z-index', (total + 1) );
                } else if ( i < _currentIndex ) {
                    item.addClass( classes.itemPast + ' ' +
                        classes.itemPast + '--' + (_currentIndex - i) )
                        .css('z-index', i);
                } else if ( i > _currentIndex ) {
                    item.addClass( classes.itemFuture + ' ' +
                        classes.itemFuture + '--' + ( i - _currentIndex ) )
                        .css('z-index', (total - i) );
                }
            });

            if ( _currentItem ) {
                if ( !_containerWidth ) { resize(true); }

                var currentWidth = _currentItem.outerWidth();
                var currentLeft = _currentItem.position().left;
                var containerOffset = -1 * ((currentLeft + (currentWidth / 2)) - (_containerWidth / 2));

                if ( transformSupport ) {
                    _container.css('transform', 'translateX(' + containerOffset + 'px)');
                } else {
                    _container.css({ 'left': containerOffset + 'px' });
                }
            }

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
                _currentIndex = _items.index(to); // if object is sent, get its index
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

            clearInterval(_playing);

            _playing = setInterval(function(){
                var prev = _currentIndex;
                jump('next');
                if ( prev === _currentIndex && !settings.loop ) { clearInterval(_playing); }
            }, time);
        }

        function pause() {
            clearInterval(_playing);
            if ( settings.autoplay ) { _playing = -1; }
        }

        function show() {
            resize(true);
            self.hide()
                .css('visibility','')
                .addClass(classes.active)
                .fadeIn(400);
        }

        function index() {

            _items = _container.find(settings.itemSelector).addClass(classes.item);

            if ( _items.length <= 1 ) { return; }

            _items
                // Wrap inner content
                .each(function(){
                    var item = $(this);
                    if ( !item.children('.' + classes.itemContent).length ) { item.wrapInner('<div class="' + classes.itemContent + '" />'); }
                })
                // Navigate directly to an item by clicking
                .on('click touchend', function(e) {
                    if ( !_startDrag ) {
                        if ( !$(this).hasClass(classes.itemCurrent) ) { e.preventDefault(); }
                        jump(this);
                    }
                });

            // Insert navigation if enabled.
            buildNavButtons();
            buildNav();

            if ( _currentIndex >= 0 ) { jump(_currentIndex); }
        }

        function init() {

            self.addClass([
                    classes.main,
                    ( settings.style ? 'flipster-'+settings.style : '' ),
                    ( settings.disableRotation ? 'no-rotate' : '' ),
                    ( transformSupport ? 'flipster-transform' : ' flipster-no-transform' )
                ].join(' '))
                .css('visibility','hidden');

            _container = self.find(settings.itemContainer).addClass(classes.container);

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

                setTimeout(show,500);
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
            if ( settings.enableTouch ) { new interactor.Touch().init(_container); }
        }

        var interactor = {
            Keyboard: function() {
                this.init = function(elem) {
                    elem[0].tabIndex = 0;
                    elem.on('keydown.flipster', throttle(function(e){
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
                var _wheel = false;
                var _actionThrottle = 0;
                var _throttleTimeout = 0;
                var _delta = 0;
                var _dir;
                var _lastDir;

                this.init = function(elem) {

                    elem
                        .on('mousewheel.flipster wheel.flipster', function(){ _wheel = true; })
                        .on('mousewheel.flipster wheel.flipster', throttle(function(e){

                            // Reset after a period without scrolling.
                            clearTimeout(_throttleTimeout);
                            _throttleTimeout = setTimeout(function(){
                                _actionThrottle = 0;
                                _delta = 0;
                            }, 300);

                            e = e.originalEvent;

                            // Add to delta (+=) so that continuous small events can still get past the speed limit, and quick direction reversals get cancelled out
                            _delta += ( e.wheelDelta || ( e.deltaY + e.deltaX ) * -1 ); // Invert numbers for Firefox

                            // Don't trigger unless the scroll is decent speed.
                            if ( Math.abs(_delta) < 25 ) { return; }

                            _actionThrottle++;

                            _dir = ( _delta > 0 ? 'prev' : 'next' );

                            // Reset throttle if direction changed.
                            if ( _lastDir !== _dir ) { _actionThrottle = 0; }
                            _lastDir = _dir;

                            // Regular scroll wheels trigger less events, so they don't need to be throttled. Trackpads trigger many events (inertia), so only trigger jump every three times to slow things down.
                            if ( _actionThrottle < 6 || _actionThrottle % 3 === 0 ) { jump(_dir); }

                            _delta = 0;

                        },50));

                    // Disable mousewheel on window if event began in elem.
                    $window.on('mousewheel.flipster wheel.flipster',function(e){
                      if ( _wheel ) {
                        e.preventDefault();
                        _wheel = false;
                      }
                    });
                };
            },

            Touch: function() {
                var _startDragY = false;
                var _touchJump = throttle(jump,300);
                var x, y, offsetY, offsetX;

                this.init = function(elem) {

                    elem.on({
                      'touchstart.flipster' : function(e){
                              e = e.originalEvent;
                              _startDrag = ( e.touches ? e.touches[0].clientX : e.clientX );
                              _startDragY = ( e.touches ? e.touches[0].clientY : e.clientY );
                              //e.preventDefault();
                          },

                      'touchmove.flipster' : throttle(function(e){
                              if ( _startDrag !== false ) {
                                  e = e.originalEvent;

                                  x = ( e.touches ? e.touches[0].clientX : e.clientX );
                                  y = ( e.touches ? e.touches[0].clientY : e.clientY );
                                  offsetY = y - _startDragY;
                                  offsetX = x - _startDrag;

                                  if ( Math.abs(offsetY) < 100 && Math.abs(offsetX) >= 30 ) {
                                      _touchJump((offsetX < 0 ? 'next' : 'prev'));
                                      _startDrag = x;
                                      e.preventDefault();
                                  }

                              }
                          },100),

                      'touchend.flipster touchcancel.flipster ' : function(){ _startDrag = false; }
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
        if ( !self.hasClass(classes.active) ) { init(); }
    });
};
})(jQuery, window);
