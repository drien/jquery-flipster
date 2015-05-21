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
        var args = Array.prototype.slice.call(arguments, 1);
        return this.each(function(){
            var methods = $(this).data('methods');
            if ( methods[options] ) { return methods[options].apply(this, args); }
            else { return this; }
        });
    }

    var defaults = {
        itemContainer: 'ul', // [selector]
        // Selector for the container of the flippin' items.

        itemSelector: 'li', // [selector]
        // Selector for children of `itemContainer` to flip

        start: 'center', // ['center'|number]
        // Zero based index of the starting item, or use 'center' to start in the middle

        loop: true, // [true|false]
        // Loop around when the start or end is reached.

        autoplay: false, // [false|milliseconds]
        // If a positive number, Flipster will automatically advance to next item after that number of milliseconds

        pauseOnHover: true, // [true|false]
        // If true, autoplay advancement will pause when Flipster is hovered

        style: 'coverflow', //[coverflow|carousel|flat|...]
        // Adds a class (e.g. flipster--coverflow) to the flipster element to switch between display styles
        // Create your own theme in CSS and use this setting to have Flipster add the custom class.

        spacing: 0, // [number]
        // Space between items relative to each item's width. 0 for no spacing, negative values to overlap

        rotation: true,

        enableKeyboard: true, // [true|false]
        // Enable left/right arrow navigation

        enableWheel: true, // [true|false]
        // Enable mousewheel/trackpad navigation; up/left = previous, down/right = next

        enableTouch: true, // [true|false]
        // Enable swipe navigation for touch devices

        nav: false,  // [false|'before'true|false]
        // If true, flipster will insert an unordered list of the slides

        navPosition: 'before', // [before|after]
        //Changes the position of the navigation before or after the flipsterified items - case-insensitive

        navButtons: false, // [true|false]
        // If true, Flipster will insert Previous / Next buttons

        prevText: 'Previous', // [text|html]
        // Changes the text for the Previous button

        nextText: 'Next', // [text|html]
        // Changes the text for the Next button

        onItemSwitch: false  // [function]
        // Callback function when items are switched.
        // Arguments received: [currentItem, previousItem]
    };

    var settings = $.extend({}, defaults, options);

    var $window = $(window);

    var classes = {
        main: 'flipster',
        active: 'flipster--active',
        container: 'flipster__container',

        nav: 'flipster__nav',
        navChild: 'flipster__nav__child',
        navItem: 'flipster__nav__item',
        navLink: 'flipster__nav__link',
        navCurrent: 'flipster__nav__item--current',
        navCategory: 'flipster__nav__item--category',
        navCategoryLink: 'flipster__nav__link--category',

        navPrev: 'flipto-prev',
        navNext: 'flipto-next',

        item: 'flipster__item',
        itemCurrent: 'flipster__item--current',
        itemPast: 'flipster__item--past',
        itemFuture: 'flipster__item--future',
        itemContent: 'flipster__item__content'
    };

    var classRemover = new RegExp('\\b(' + classes.itemCurrent + '|' + classes.itemPast + '|' + classes.itemFuture + ')(.*?)(\\s|$)','g');

    return this.each(function() {

        var self = $(this);
        var methods;

        var _container;
        var _containerWidth;
        var _items;
        var _itemOffsets = [];
        var _nav;
        var _navItems;
        var _navLinks;
        var _currentIndex = 0;
        var _currentItem;

        var _playing = false;
        var _startDrag = false;

        function buildNavButtons() {
            if ( settings.navButtons && _items.length > 1 ) {
                self.find('.' + classes.navPrev + ', .' + classes.navNext).remove();

                $('<button class="' + classes.navPrev + '" role="button">'+settings.prevText+'</button>')
                    .on('click', function(e) {
                        jump('prev');
                        e.preventDefault();
                    })
                    .appendTo(self);

                $('<button class="' + classes.navNext + '" role="button">'+settings.nextText+'</button>')
                    .on('click', function(e) {
                        jump('next');
                        e.preventDefault();
                    })
                    .appendTo(self);
            }
        }

        function buildNav() {
            if ( !settings.nav || _items.length <= 1 ) { return; }

            self.find('.' + classes.nav).remove();

            var navCategories = {};
            var navLinks = {};
            var navList = {};
            var category;
            var navDisplay;
            var navIndex;

            _items.each(function(){
                var item = $(this);
                var category = item.data('flip-category');
                var itemId = item.attr('id');
                var itemTitle = item.data('flip-title') || item.attr('title');
                var listItem;

                if ( !navLinks[itemId] ) {
                    navLinks[itemId] = '<a href="#'+itemId+'" class="' + classes.navLink + '">'+itemTitle+'</a>';

                    listItem = '<li class="' + classes.navItem + '">' + navLinks[itemId] + '</li>';

                    if ( category !== undefined ) {
                        navCategories[category] = category;
                        if ( !navList[category] ) { navList[category] = ''; }
                        navList[category] += listItem;
                    } else {
                        navList[itemId] = listItem;
                    }
                }
            });

            for ( category in navCategories ) {
                navList[category] = '<li class="' + classes.navItem + ' ' + classes.navCategory + '"><a href="#" class="' + classes.navLink + ' ' +  classes.navCategoryLink + '" data-flip-category="'+category+'">'+category+'</a><ul class="' + classes.navChild + '">' + navList[category] + '</ul></li>';
            }

            navDisplay = '<ul class="' + classes.nav + '" role="navigation">';
            for ( navIndex in navList ) { navDisplay += navList[navIndex]; }
            navDisplay += '</ul>';

            _nav = $(navDisplay);

            if ( settings.navPosition.toLowerCase() === 'after' ) { self.append(_nav); }
            else { self.prepend(_nav); }

            _navItems = _nav.find('.' + classes.navItem);

            _navLinks = _nav.find('a').on('click',function(e){
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
            if ( settings.nav ) {

                _navItems.removeClass(classes.navCurrent);

                _navLinks
                    .removeClass(classes.navCurrent)
                    .filter('[href="#' + _currentItem.attr('id') + '"], [data-flip-category="' + _currentItem.data('flip-category') + '"]')
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

            _items.each(function(i){
                var item = $(this);

                item.attr('class',function(i, c){
                    return c && c.replace(classRemover, '').trim();
                });

                var width = item.outerWidth();
                var left;

                if ( settings.spacing !== 0 ) {
                  item.css('margin-right', ( width * settings.spacing) + 'px');
                }

                left = item.position().left;
                _itemOffsets[i] = -1 * ((left + (width / 2)) - (_containerWidth / 2));

                if ( i === _items.length - 1 ) {
                    center();
                    if ( skipTransition ) { resetTransition(); }
                }
            });
        }

        function center() {
            var total = _items.length;
            var item;
            var newClass;
            var zIndex;

            _items.each(function(i){
                item = $(this);
                newClass = ' ';

                if ( i === _currentIndex ) {
                    newClass += classes.itemCurrent;
                    zIndex = (total + 1);
                } else if ( i < _currentIndex ) {
                    newClass += classes.itemPast + ' ' +
                        classes.itemPast + '-' + (_currentIndex - i);
                    zIndex = i;
                } else {
                    newClass += classes.itemFuture + ' ' +
                        classes.itemFuture + '-' + ( i - _currentIndex );
                    zIndex = (total - i);
                }

                item.css('z-index', zIndex )
                  .attr('class',function(i, c){
                    return c && c.replace(classRemover, '').trim() + newClass;
                  });
            });

            if ( _currentIndex >= 0 ) {
                if ( !_containerWidth || _itemOffsets[_currentIndex] === undefined ) { resize(true); }

                if ( transformSupport ) {
                    _container.css('transform', 'translateX(' + _itemOffsets[_currentIndex] + 'px)');
                } else {
                    _container.css({ 'left': _itemOffsets[_currentIndex] + 'px' });
                }
            }

            updateNav();
        }

        function jump(to) {
            var _previous = _currentIndex;

            if ( _items.length <= 1 ) { return; }

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

            _currentItem = _items.eq(_currentIndex);

            if ( _currentIndex !== _previous && settings.onItemSwitch ) { settings.onItemSwitch.call(self, _items[_currentIndex], _items[_previous]); }

            center();

            return self;
        }

        function play(interval) {
            settings.autoplay = interval || settings.autoplay;

            clearInterval(_playing);

            _playing = setInterval(function(){
                var prev = _currentIndex;
                jump('next');
                if ( prev === _currentIndex && !settings.loop ) { clearInterval(_playing); }
            }, settings.autoplay);

            return self;
        }

        function pause() {
            clearInterval(_playing);
            if ( settings.autoplay ) { _playing = -1; }

            return self;
        }

        function show() {
            resize(true);
            self.hide()
                .css('visibility','')
                .addClass(classes.active)
                .fadeIn(400);
        }

        function index() {
            _items = _container.find(settings.itemSelector);

            if ( _items.length <= 1 ) { return; }

            _items
                .addClass(classes.item)
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

            return self;
        }


        function keyboardEvents(elem) {
            if ( settings.enableKeyboard ) {
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
            }
        }

        function wheelEvents(elem) {
            if ( settings.enableWheel ) {
                var _wheelInside = false;
                var _actionThrottle = 0;
                var _throttleTimeout = 0;
                var _delta = 0;
                var _dir;
                var _lastDir;

                elem
                    .on('mousewheel.flipster wheel.flipster', function(){ _wheelInside = true; })
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
                  if ( _wheelInside ) {
                    e.preventDefault();
                    _wheelInside = false;
                  }
                });
            }
        }

        function touchEvents(elem) {
            if ( settings.enableTouch ) {
                var _startDragY = false;
                var _touchJump = throttle(jump,300);
                var x, y, offsetY, offsetX;

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
            }
        }

        function init() {

            _container = self.find(settings.itemContainer);

            index();

            if ( _items.length <= 1 ) { return; }

            self
                .css('visibility','hidden')
                .addClass([
                    classes.main,
                    ( transformSupport ? 'flipster--transform' : ' flipster--no-transform' ),
                    ( settings.style ? 'flipster--'+settings.style : '' ),
                    ( settings.disableRotation ? 'no-rotate' : '' )
                ].join(' '));

            _container.addClass(classes.container);

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

                setTimeout(show,750);
            } else {
              show();
            }

            // Attach event bindings.
            $window.on('resize.flipster', throttle(resize,400));

            if ( settings.autoplay ) { play(); }

            if ( settings.pauseOnHover ) {
              _container
                  .on('mouseenter', pause)
                  .on('mouseleave', function(){
                      if ( _playing === -1 ) { play(); }
                  });
            }

            keyboardEvents(self);
            wheelEvents(_container);
            touchEvents(_container);
        }

        // public methods
        methods = {
            jump: jump,
            next: function(){ return jump('next'); },
            prev: function(){ return jump('prev'); },
            play: play,
            pause: pause,
            index: index
        };
        self.data('methods', methods);

        // Initialize if flipster is not already active.
        if ( !self.hasClass(classes.active) ) { init(); }
    });
};
})(jQuery, window);
