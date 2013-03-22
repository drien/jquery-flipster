(function( $ ) {
  $.fn.flipster = function() {
  
    this.addClass("flipster");
    this.hide();

    //DOM references that will be reused throughout
    var flipInner = this.find("ul");
    var flipOuter = $(".flipster");
    var flipItems = this.find("li");

    //values important for keeping track of state 
    var _current = 0;
    var _startTouchX = 0;
    var compatibility = false;
    var isIE = false;
    var _actionThrottle = 0;
    var _throttleTimeout;

    $(window).load(init);

    function init() {

        //Browsers that don't support CSS3 transforms get compatibility:
            var isIE = '\v'=='v'; //IE <= 8
            var checkIE = document.createElement("b");
            checkIE.innerHTML = "<!--[if IE 9]><i></i><![endif]-->"; //IE 9
            var isIE = checkIE.getElementsByTagName("i").length == 1;
            if (isIE) {
                flipOuter.addClass("compatibility");
            }

        //find the middle element of the slideshow
        if (!flipItems.length % 2) { 
            _current = flipItems.length/2 + 1;
        }
        else {
            _current = Math.floor(flipItems.length/2);
        }
        
        //initialize containers
        flipInner.css("left", "0px");
        flipOuter.show();
        center();


        // Attach event bindings.
        $(window).resize(center);

        $(window).on("keydown", function(e) {
            e.preventDefault();
            _actionThrottle++;
            if (_actionThrottle % 7 !== 0 && _actionThrottle !== 1) return; //if holding the key down, ignore most events
            
            var code = e.which;
            if (code == 37 && _current > 0) {
                jump('left');
            }
            else if (code == 39 && _current < flipItems.length-1) {
                jump('right');
            }
        });

        $(window).on("keyup", function(e){
            _actionThrottle = 0; //reset action throttle on key lift to avoid throttling new interactions
        });

        flipInner.on("mousewheel", function(e){ //TODO test mousewheel functionality on click-wheel style mouse (not apple trackpad)
            _throttleTimeout = window.setTimeout(removeThrottle, 500); //throttling should expire if scrolling pauses for a moment.
            _actionThrottle++;
            if (_actionThrottle % 4 !==0 && _actionThrottle !== 1) return; //throttling like with held-down keys
            window.clearTimeout(_throttleTimeout);
            if (e.originalEvent.wheelDeltaX > flipItems[0].clientWidth/1.75) {
                jump("left");
            }
            else if (e.originalEvent.wheelDeltaX < -1*flipItems[0].clientWidth/1.75) {
                jump("right");
            }
        });

        flipInner.on("touchstart", function(e) {
            _startTouchX = e.originalEvent.targetTouches[0].screenX;
        });

        flipInner.on("touchmove", function(e) {
            e.preventDefault();
            var nowX = e.originalEvent.targetTouches[0].screenX;
            var touchDiff = nowX-_startTouchX;
            if (touchDiff > flipItems[0].clientWidth/1.75){
                jump("left");
                _startTouchX = nowX;
            }else if (touchDiff < -1*(flipItems[0].clientWidth/1.75)){
                jump("right");
                _startTouchX = nowX;
            }
        });

        flipInner.on("touchend", function(e) {
            _startTouchX = 0;
        });

        //bindings to jump the carousel to any image you click on the left or right.
        flipInner.on("click", ".flipster-left", function(e){
            e.preventDefault();
            jump(flipItems.index(this));
        });
        flipInner.on("click", ".flipster-right", function(e){
            e.preventDefault();
            jump(flipItems.index(this));
        });

    }

    function jump(to) {
        if (to === "left" && _current > 0) {
            _current--;
        }
        else if (to === "right" && _current < flipItems.length-1) {
            _current++;
        }
        
        if (typeof to === 'number') {
            _current = to;
        }

        center();
    }

    function center() {
            var start = new Date();
            var spacer = 0;
            var totalLeft = 0;

            for (var i = 0; i < flipItems.length; i++) {

                var thisItem = $(flipItems[i]);
                var thisWidth = thisItem[0].clientWidth/1.75;

                thisItem.removeClass("flipster-left flipster-right flipster-current");

                if (i < _current) {
                    thisItem.addClass("flipster-left").css("z-index", i).css("left", i*thisWidth+"px");
                    totalLeft = i*thisWidth;
                }
                else if (i === _current) {
                    spacer = thisWidth/1.2;
                    thisItem.addClass("flipster-current").css("z-index", 500).css("left", i*thisWidth+spacer+"px");
                    totalLeft = totalLeft-spacer-$(".flipster-current")[0].clientWidth/2;

                    spacer = (thisWidth/1.2)*2;
                }
                else {
                    thisItem.addClass("flipster-right").css("z-index", flipItems.length-i).css("left", i*thisWidth+spacer+"px");
                }
            }

        flipInner.css("left", -1*(totalLeft)+"px");

        var end = new Date();
        //console.log("Recalculated in: "+(end.valueOf()-start.valueOf())+"ms"); //keep track of performance.

    }

    function removeThrottle() {
        _actionThrottle = 0;
    }

  };
})( jQuery );