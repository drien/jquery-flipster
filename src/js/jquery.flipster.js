(function($) {
$.fn.flipster = function(options) {

    var defaults = {
        itemContainer:      'ul', // Container for the flippin' items.
        itemSelector:       'li', // Selector for children of itemContainer to flip
        start:              'center', // Starting item. Set to 0 to start at the first, 'center' to start in the middle or the index of the item you want to start with.

        enableKeyboard:     true, // Enable left/right arrow navigation
        enableTouch:        true, // Enable swipe navigation for touch devices

        activityIndicator:  null, // jQuery object used to indicate coverflow loading activity
        coverflowObserver:     null, // jQuery object that will receive events related to coverflow
        onItemSwitch:       function(){}, // Callback function when items are switches
        onCurrentItemClick:        function(){}, // Callback function when current item is clicked
        onCurrentItemMouseEnter:        function(){}, // Callback function when mouse enters current item area
        onCurrentItemMouseLeave:        function(){} // Callback function when mouse leaves current item area
    };
    var settings = $.extend({}, defaults, options);
    var win = $(window);

    return this.each(function(){

        var _flipster = $(this);
        var _flipItemsOuter;
        var _flipItems;
        var _current = 0;

        var _startTouchX = 0;
        var _itemsLoaded = 0;

        var compatibility;

        function resize() {
            _flipItemsOuter.css("height", calculateBiggestFlipItemHeight() + "px");
            _flipster.css("height","auto");
        }

        function calculateBiggestFlipItemHeight() {
            var biggestHeight = 0;
            _flipItems.each(function() {
                if ($(this).height() > biggestHeight) biggestHeight = $(this).height();
            });
            return biggestHeight;
        }

        function center() {
            var currentItem = $(_flipItems[_current]).addClass("flip-current");

            _flipItems.removeClass("flip-prev flip-next flip-current flip-past flip-future no-transition");

            var spacer = currentItem.outerWidth()/2;
            var totalLeft = 0;
            var totalWidth = _flipItemsOuter.width();
            var currentWidth = currentItem.outerWidth();
            var currentLeft = (_flipItems.index(currentItem)*currentWidth)/2 +spacer/2;
            
            _flipItems.removeClass("flip-hidden");

            for (i = 0; i < _flipItems.length; i++) {
                var thisItem = $(_flipItems[i]);
                var thisWidth = thisItem.outerWidth();
                
                if (i < _current) {
                    thisItem.addClass("flip-past")
                        .css({
                            "z-index" : _flipItems.length - Math.abs(_current - i),
                            "left" : ((i+0.5)*thisWidth/2)+"px",
                            "bottom" : "0",
                            "opacity": String(0.95 / (Math.pow(2, Math.abs(i - (_current - 1))))),
                            "filter": "alpha(opacity=" + 95 / (Math.pow(2, Math.abs(i - (_current - 1)))) + ")"
                        });
                }
                else if ( i > _current ) {
                    thisItem.addClass("flip-future")
                        .css({
                            "z-index" : _flipItems.length - Math.abs(_current - i),
                            "left" : ((i-0.5)*thisWidth/2)+spacer+"px",
                            "bottom" : "0",
                            "opacity": String(0.95 / (Math.pow(2, Math.abs(i - (_current + 1))))),
                            "filter": "alpha(opacity=" + 95 / (Math.pow(2, Math.abs(i - (_current + 1)))) + ")"
                        });
                }
            }

            currentItem.css({
                "z-index" : _flipItems.length,
                "left" : currentLeft +"px",
                "bottom" : "0"
            });

            totalLeft = (currentLeft + (currentWidth/2)) - (totalWidth/2);
            var newLeftPos = -1*(totalLeft)+"px";

            /* Untested Compatibility */
            if (compatibility) {
                var leftItems = $(".flip-past");
                var rightItems = $(".flip-future");
                $(".flip-current").css("zoom", "1.0");
                for (i = 0; i < leftItems.length; i++) {
                    $(leftItems[i]).css("zoom", (100-((leftItems.length-i)*5)+"%"));
                }
                for (i = 0; i < rightItems.length; i++) {
                    $(rightItems[i]).css("zoom", (100-((i+1)*5)+"%"));
                }

                _flipItemsOuter.animate({"left":newLeftPos}, 333);
            }
            else {
                _flipItemsOuter.css("left", newLeftPos);
            }

            currentItem
                .addClass("flip-current")
                .removeClass("flip-prev flip-next flip-past flip-future flip-hidden");

            resize();
            settings.onItemSwitch.call(this);
        }

        function jump(to) {
            if ( _flipItems.length > 1 ) {
                if ( to === "left" ) {
                    if ( _current > 0 ) { _current--; }
                    else { _current = _flipItems.length-1; }
                }
                else if ( to === "right" ) {
                    if ( _current < _flipItems.length-1 ) { _current++; }
                    else { _current = 0; }
                } else if ( typeof to === 'number' ) {
                    _current = to;
                } else {
                    // if object is sent, get its index
                    _current = _flipItems.index(to);
                }
                center();
            }
        }

        function isNotInLastElement() {
            return _current < (_flipItems.length - 1)
        }

        function isNotInFirstElement() {
            return _current > 0;
        }

        function init() {
            if (settings.activityIndicator) {
                settings.activityIndicator.activity();
                $('.coverflow-activity').hide(0);
                settings.activityIndicator.show(0);
            }
            // Basic setup
            _flipster.addClass("flipster flipster-active flipster-coverflow").hide(0);
            _flipster.css("padding-bottom", "5%");
            _flipItemsOuter = _flipster.find(settings.itemContainer).addClass("flip-items");
            _flipItems = _flipItemsOuter.find(settings.itemSelector).addClass("flip-item flip-hidden").wrapInner("<div class='flip-content' />");

            //Browsers that don't support CSS3 transforms get compatibility:
            var isIEmax8 = ('\v' === 'v'); //IE <= 8
            var checkIE = document.createElement("b");
            checkIE.innerHTML = "<!--[if IE 9]><i></i><![endif]-->"; //IE 9
            var isIE9 = checkIE.getElementsByTagName("i").length === 1;
            if (isIEmax8 || isIE9) {
                compatibility = true;
                _flipItemsOuter.addClass("compatibility");
            }

            // Set the starting item
            if ( settings.start && _flipItems.length > 1 ) {
                // Find the middle item if start = center
                if ( settings.start === 'center' ) {
                    if (!_flipItems.length % 2) {
                        _current = _flipItems.length/2 + 1;
                    }
                    else {
                        _current = Math.floor(_flipItems.length/2);
                    }
                } else {
                    _current = settings.start;
                }
            }

            // initialize containers
            resize();

            // Attach event bindings.
            win.resize(function(){ resize(); center(); });

            // Calls onCurrentItemClick when current item is clicked.
            _flipItems.on('click', function () {
                if ($(this).hasClass("flip-current"))
                    settings.onCurrentItemClick.call(this);
            });

            // Calls onCurrentItemMouseEnter and onCurrentItemMouseLeave on current item mouseenter and mouseleave events.
            _flipItems.hover(function () {
                if ($(this).hasClass("flip-current"))
                    settings.onCurrentItemMouseEnter.call(this);
            }, function () {
                if ($(this).hasClass("flip-current"))
                    settings.onCurrentItemMouseLeave.call(this);
            });

            // Navigate directly to an item by clicking
            _flipItems.on("click", function(e) {
                if ( !$(this).hasClass("flip-current") ) { e.preventDefault(); }
                jump(_flipItems.index(this));
            });

            // Keyboard Navigation
            if ( settings.enableKeyboard && _flipItems.length > 1 ) {
                win.on("keydown.flipster", function(e) {
                    var code = e.which;
                    if (code === 37 ) {
                        if (isNotInFirstElement()) {
                            e.preventDefault();
                            jump('left');
                        }
                    }
                    else if (code === 39 ) {
                        if (isNotInLastElement()) {
                            e.preventDefault();
                            jump('right');
                        }
                    }
                });
            }

            // Touch Navigation
            if ( settings.enableTouch && _flipItems.length > 1 ) {
                _flipster.on("touchstart.flipster", function(e) {
                    _startTouchX = e.originalEvent.targetTouches[0].screenX;
                });

                _flipster.on("touchmove.flipster", function(e) {
                    e.preventDefault();
                    var nowX = e.originalEvent.targetTouches[0].screenX;
                    var touchDiff = nowX-_startTouchX;
                    if (touchDiff > _flipItems[0].clientWidth/3.5){
                        if (isNotInFirstElement()) {
                            jump("left");
                            _startTouchX = nowX;
                        }
                    }else if (touchDiff < -1*(_flipItems[0].clientWidth/3.5)){
                        if (isNotInLastElement()) {
                            jump("right");
                            _startTouchX = nowX;
                        }
                    }
                });

                _flipster.on("touchend.flipster", function(e) {
                    _startTouchX = 0;
                });
            }

            // keeps track of loaded items.
            //   when every item finished loading, if there is an activityIndicator visible, hide it.
            //   regardless of an activityIndicator existence, shows coverflow.
            $(".coverflow-item").one('load', function() {
                _itemsLoaded++;
                if (_itemsLoaded === _flipItems.size()) {
                    if (settings.activityIndicator && settings.activityIndicator.is(":visible"))
                        settings.activityIndicator.hide(0, function() {
                            _flipster.css("visibility","visible").show(0, function(){ resize(); center(); });
                            settings.activityIndicator.activity(false);
                        });
                    else
                        _flipster.css("visibility","visible").show(0, function(){ resize(); center(); });
                    if (settings.coverflowObserver) {
                        settings.coverflowObserver.trigger('loadFinished');
                    }
                }
            }).each(function() {
                if (this.complete) $(this).load();
            });
        }

        // Initialize if flipster is not already active.
        if ( !_flipster.hasClass("flipster-active") ) { init(); }
    });
};
})( jQuery );
