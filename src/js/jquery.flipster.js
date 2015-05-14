/* global window, jQuery */
(function($, window, undefined) {
$.fn.flipster = function(options) {
    "use strict";

    var isMethodCall = typeof options === 'string' ? true : false;

    if (isMethodCall) {
        var method = options;
        var args = Array.prototype.slice.call(arguments, 1);
    } else {
        var defaults = {
            itemContainer:    'ul',        // Container for the flippin' items.
            itemSelector:     'li',        // Selector for children of itemContainer to flip
            style:            'coverflow', // Switch between 'coverflow' or 'carousel' display styles
            start:            'center',    // Starting item. Set to 0 to start at the first, 'center' to start in the middle or the index of the item you want to start with.

            enableKeyboard:   true, // Enable left/right arrow navigation
            enableMousewheel: true, // Enable scrollwheel navigation (up = left, down = right)
            enableTouch:      true, // Enable swipe navigation for touch devices

            onItemSwitch:     $.noop, // Callback function when items are switched. Current and previous items passed in as arguments
            disableRotation:  false,

            enableNav:        false,    // If true, flipster will insert an unordered list of the slides
            navPosition:      'before', // [before|after] Changes the position of the navigation before or after the flipsterified items - case-insensitive

            enableNavButtons: false,      // If true, flipster will insert Previous / Next buttons
            prevText:         'Previous', // Changes the text for the Previous button
            nextText:         'Next',     // Changes the text for the Next button

            autoplay:         false,
            autoplayInterval: 5000
        };
        var settings = $.extend({}, defaults, options);

    }

    return this.each(function() {

        var self = $(this);
        var methods;

        if ( isMethodCall ) {
            methods = self.data('methods');
            return methods[method].apply(this, args);
        }

        var _container;
        var _items;
        var _nav;
        var _navItems;
        var _currentIndex = 0;

        var _playing = false;

        function resize() {
            _container.height(calculateBiggestItemHeight());
            self.css("height","auto");
            if ( settings.style === 'carousel' ) { _container.width(_items.width()); }
        }

        function calculateBiggestItemHeight() {
            var biggestHeight = 0;
            _items.each(function() {
                if ( $(this).height() > biggestHeight ) { biggestHeight = $(this).height(); }
            });
            return biggestHeight;
        }

        function buildNav() {
            if ( !settings.enableNav || _items.length <= 1 ) {
                return;
            }
            var navCategories = {},
                navItems = {},
                navList = {};

            _items.each(function(){
                var item = $(this),
                    category = item.data("flip-category"),
                    itemId = item.attr("id"),
                    itemTitle = item.attr("title");

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
                navList[category] = '<li class="flip-nav-category"><a href="#" class="flip-nav-category-link" data-flip-category="'+category+'">'+category+'</a><ul class="flip-nav-items">' + navList[category] + "</ul></li>";
            }

            var navDisplay = '<ul class="flipster-nav">';
            for ( var navIndex in navList ) {
                navDisplay += navList[navIndex];
            }
            navDisplay += '</ul>';

            _nav = $(navDisplay);

            if ( settings.navPosition.toLowerCase() === "after" ) {
                self.append(_nav);
            } else {
                self.prepend(_nav);
            }

            _navItems = _nav.find("a").on("click",function(e){
                var target;
                if ( $(this).hasClass("flip-nav-category-link") ) {
                    target = _items.filter("[data-flip-category='"+$(this).data("flip-category")+"']");
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
            if ( settings.enableNav && _items.length > 1 ) {
                var currentItem = $(_items[_currentIndex]);
                _nav.find(".flip-nav-current").removeClass("flip-nav-current");
                _navItems.filter("[href='#"+currentItem.attr("id")+"']").addClass("flip-nav-current");
                _navItems.filter("[data-flip-category='"+currentItem.data("flip-category")+"']").parent().addClass("flip-nav-current");
            }
        }

        function buildNavButtons() {
            if ( settings.enableNavButtons && _items.length > 1 ) {
                self.find(".flipto-prev, .flipto-next").remove();
                self.append("<a href='#' class='flipto-prev'>"+settings.prevText+"</a> <a href='#' class='flipto-next'>"+settings.nextText+"</a>");

                self.children('.flipto-prev').on("click", function(e) {
                    jump("left");
                    e.preventDefault();
                });

                self.children('.flipto-next').on("click", function(e) {
                    jump("right");
                    e.preventDefault();
                });
            }
        }

        function center() {
            var currentItem = $(_items[_currentIndex]);

            _items.removeClass("flip-prev flip-next flip-current flip-past flip-future no-transition");

            if ( settings.style === 'carousel' ) {

                _items.addClass("flip-hidden");

                var nextItem = $(_items[_currentIndex+1]),
                    futureItem = $(_items[_currentIndex+2]),
                    prevItem = $(_items[_currentIndex-1]),
                    pastItem = $(_items[_currentIndex-2]);

                if ( _currentIndex === 0 ) {
                    prevItem = _items.last();
                    pastItem = prevItem.prev();
                } else if ( _currentIndex === 1 ) {
                    pastItem = _items.last();
                } else if ( _currentIndex === _items.length-2 ) {
                    futureItem = _items.first();
                } else if ( _currentIndex === _items.length-1 ) {
                    nextItem = _items.first();
                    futureItem = $(_items[1]);
                }

                futureItem.removeClass("flip-hidden").addClass("flip-future");
                pastItem.removeClass("flip-hidden").addClass("flip-past");
                nextItem.removeClass("flip-hidden").addClass("flip-next");
                prevItem.removeClass("flip-hidden").addClass("flip-prev");

            } else {
                var spacer = currentItem.outerWidth()/2;
                var totalLeft = 0;
                var totalWidth = _container.width();
                var currentWidth = currentItem.outerWidth();
                var currentLeft = (_items.index(currentItem)*currentWidth)/2 + spacer/2;

                _items.removeClass("flip-hidden");

                for ( var i = 0; i < _items.length; i++ ) {
                    var thisItem = $(_items[i]);
                    var thisWidth = thisItem.outerWidth();

                    if ( i < _currentIndex ) {
                        thisItem.addClass("flip-past")
                            .css({
                                "z-index" : i,
                                "left" : (i*thisWidth/2)+"px"
                            });
                    } else if ( i > _currentIndex ) {
                        thisItem.addClass("flip-future")
                            .css({
                                "z-index" : _items.length-i,
                                "left" : (i * thisWidth / 2) + spacer + "px"
                            });
                    }
                }

                currentItem.css({
                    "z-index" : _items.length + 1,
                    "left" : currentLeft +"px"
                });

                totalLeft = (currentLeft + (currentWidth / 2)) - (totalWidth / 2);
                var newLeftPos = -1 * (totalLeft) + "px";

                _container.css("left", newLeftPos);
            }

            currentItem
                .addClass("flip-current")
                .removeClass("flip-prev flip-next flip-past flip-future flip-hidden");

            resize();
            updateNav();
        }

        function jump(to) {
            var _previous = _currentIndex;
            if ( _items.length <= 1 ) {
                return;
            }
            if ( to === "left" ) {
                if ( _currentIndex > 0 ) { _currentIndex--; }
                else { _currentIndex = _items.length - 1; }
            } else if ( to === "right" ) {
                if ( _currentIndex < _items.length - 1 ) { _currentIndex++; }
                else { _currentIndex = 0; }
            } else if ( typeof to === 'number' ) {
                _currentIndex = to;
            } else {
                // if object is sent, get its index
                _currentIndex = _items.index(to);
            }
            settings.onItemSwitch.call(self, _items[_currentIndex], _items[_previous]);
            center();
        }

        function play(interval) {
            var time = interval || settings.autoplayInterval;
            settings.autoplayInterval = time;
            _playing = setInterval(function(){
                 jump('right');
            }, time);
        }

        function pause() {
            clearInterval(_playing);
            _playing = _playing ? -1 : false;
        }

        function init() {
            self.addClass("flipster flipster-active flipster-"+settings.style).css("visibility","hidden");
            if ( settings.disableRotation ) {
                self.addClass('no-rotate');
            }
            _container = self.find(settings.itemContainer).addClass("flip-items");
            _items = _container.find(settings.itemSelector).addClass("flip-item flip-hidden").wrapInner("<div class='flip-content' />");

            // Insert navigation if enabled.
            buildNav();
            buildNavButtons();

            // Set the starting item
            if ( settings.start && _items.length > 1 ) {
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

            // initialize containers
            resize();

            // Necessary to start flipster invisible and then fadeIn so height/width can be set accurately after page load
            self.hide().css("visibility","visible").fadeIn(400,function(){ center(); });

            // Attach event bindings.
            $(window).on("resize.flipster", function() {
                resize();
                center();
            });

            // Navigate directly to an item by clicking
            _items.on("click", function(e) {
                if ( !$(this).hasClass("flip-current") ) { e.preventDefault(); }
                jump(_items.index(this));
            });

            _container.on("mouseenter", pause);

            _container.on("mouseleave", function() {
                if (_playing === -1) {
                    play();
                }
            });

            if ( _items.length <= 1 ) {
                return;
            }
            if ( settings.enableKeyboard ) {
                new interactor.Keyboard().init();
            }
            if ( settings.enableMousewheel ) {
                new interactor.Mousewheel().init(self);
            }
            if ( settings.enableTouch ) {
                new interactor.Touch().init(self);
            }
        }

        var interactor = {
            Keyboard: function() {
                var _actionThrottle;

                this.init = function() {
                    $(window).on("keydown.flipster", function(e) {
                        _actionThrottle++;
                        if ( _actionThrottle % 7 !== 0 && _actionThrottle !== 1 ) { return; } //if holding the key down, ignore most events

                        var code = e.which;
                        if ( code === 37 ) {
                            e.preventDefault();
                            jump('left');
                        } else if ( code === 39 ) {
                            e.preventDefault();
                            jump('right');
                        }
                    });

                    $(window).on("keyup.flipster", function(){
                        _actionThrottle = 0; //reset action throttle on key lift to avoid throttling new interactions
                    });
                };
            },

            Mousewheel: function() {
                var _actionThrottle;
                var _throttleTimeout;

                this.init = function(elem) {
                    elem.on("mousewheel.flipster", function(e){
                        _throttleTimeout = window.setTimeout(function(){
                            _actionThrottle = 0;
                        }, 500); //throttling should expire if scrolling pauses for a moment.
                        _actionThrottle++;
                        if ( _actionThrottle % 4 !==0 && _actionThrottle !== 1 ) { return; } //throttling like with held-down keys
                        window.clearTimeout(_throttleTimeout);

                        var direction = (e.originalEvent.wheelDelta / 120 > 0) ? "left" : "right";
                        jump(direction);

                        e.preventDefault();
                    });
                };
            },

            Touch: function() {
                var _startTouchX;

                this.init = function(elem) {
                    elem.on("touchstart.flipster", function(e) {
                        _startTouchX = e.originalEvent.targetTouches[0].screenX;
                    });

                    elem.on("touchmove.flipster", function(e) {
                        var nowX = e.originalEvent.targetTouches[0].screenX;
                        var touchDiff = nowX-_startTouchX;
                        if ( touchDiff > _items[0].clientWidth/1.75 ){
                            e.preventDefault();
                            jump("left");
                            _startTouchX = nowX;
                        } else if ( touchDiff < -1*(_items[0].clientWidth/1.75) ){
                            e.preventDefault();
                            jump("right");
                            _startTouchX = nowX;
                        }
                    });

                    elem.on("touchend.flipster", function() {
                        _startTouchX = 0;
                    });
                };
            }
        };

        // public methods
        methods = {
            jump: jump,
            play: play,
            pause: pause
        };
        self.data('methods', methods);

        // Initialize if flipster is not already active.
        if ( !self.hasClass("flipster-active") ) { init(); }
    });
};
})(jQuery, window);
