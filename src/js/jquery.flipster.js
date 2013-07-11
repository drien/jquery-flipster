(function ($) {
    $.fn.flipster = function () {
  
        this.addClass("flipster");
        this.hide();
    
        //DOM references that will be reused throughout
        var flipOuter = this;
        var flipInner = this.find("ul");
        var flipItems = this.find("li");
    
        //values important for keeping track of state 
        var _current = 0;
        var _startTouchX = 0;
        var _actionThrottle = 0;
        var _throttleTimeout;
        var isIE = false;
        var compatibility = false;
        
        var config = { //One small step for providing more configurability in the future.
            sideSpacing: 0.57 //Proportion of the middle item that we should leave on either side as padding.
        };
        
        function newHeight() {
            //Adjust the height of the container <ul> element to contain but not clip the contents.
            var centerHeight = parseInt($(".flipster-current")[0].clientHeight, 10);
            //Account for reflection
            var adjustedHeight = centerHeight + (centerHeight / 3);
            flipInner.height(adjustedHeight + "px");
        }
    
        function center() {
            //var start = new Date();
            var spacer = 0;
            var totalLeft = 0;

            for (var i = 0; i < flipItems.length; i++) {

                var thisItem = $(flipItems[i]);
                var thisWidth = thisItem[0].clientWidth*config.sideSpacing;

                thisItem.removeClass("flipster-left flipster-right flipster-current");

                if (i < _current) {
                    thisItem.addClass("flipster-left").css("z-index", i).css("left", i*thisWidth+"px");
                    continue;
                }
                else if (i === _current) {
                    spacer = thisWidth/1.2;
                    thisItem.addClass("flipster-current").css("z-index", 5000).css("left", i*thisWidth+spacer+"px");
                    totalLeft = ((i-1)*thisWidth)-spacer-$(".flipster-current")[0].clientWidth/2;
                    spacer = (thisWidth/1.2)*2;
                    continue;
                }
                thisItem.addClass("flipster-right").css("z-index", flipItems.length-i).css("left", i*thisWidth+spacer+"px");
            }
    
            var newLeftPos = -1*(totalLeft)+"px";
            if (compatibility) {
                var leftItems = $(".flipster-left");
                var rightItems = $(".flipster-right");
                $(".flipster-current").css("zoom", "1.0");
                for (var i = 0; i < leftItems.length; i++) {
                    $(leftItems[i]).css("zoom", (100-((leftItems.length-i)*5)+"%"));
                }
                for (var i = 0; i < rightItems.length; i++) {
                    $(rightItems[i]).css("zoom", (100-((i+1)*5)+"%"));
                }
    
                flipInner.animate({"left":newLeftPos}, 333);
            }
            else {
                flipInner.css("left", newLeftPos);
            }
            //var end = new Date();
            //console.log("Recalculated in: "+(end.valueOf()-start.valueOf())+"ms"); //keep track of performance.
    
        }
        
        function jump(to) {
            if (to === "left" && _current > 0) {
                _current--;
            } else if (to === "right" && _current < flipItems.length - 1) {
                _current++;
            }
            
            if (typeof to === 'number') {
                _current = to;
            }
    
            center();
        }
    
        function removeThrottle() {
            _actionThrottle = 0;
        }
        
        function init() {
    
            //Browsers that don't support CSS3 transforms get compatibility:
            var isIEmax8 = ('\v' == 'v'); //IE <= 8
            var checkIE = document.createElement("b");
            checkIE.innerHTML = "<!--[if IE 9]><i></i><![endif]-->"; //IE 9
            var isIE9 = checkIE.getElementsByTagName("i").length === 1;
            if (isIEmax8 || isIE9) {
                compatibility = true;
                flipOuter.addClass("compatibility");
            }
            //find the middle element of the slideshow
            if (!flipItems.length % 2) {
                _current = flipItems.length / 2 + 1;
            } else {
                _current = Math.floor(flipItems.length / 2);
            }
            
            //initialize containers
            flipInner.css("left", "0px");
            flipOuter.show();
            center();
            newHeight();
    
    
            // Attach event bindings.
            $(window).resize(function(){
                center();
                newHeight();
            });
    
            $(window).on("keydown.flipster", function(e) {
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
    
            $(window).on("keyup.flipster", function(e){
                _actionThrottle = 0; //reset action throttle on key lift to avoid throttling new interactions
            });
    
            flipInner.on("mousewheel.flipster", function(e){ //TODO test mousewheel functionality on click-wheel style mouse (not apple trackpad)
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
    
            flipInner.on("touchstart.flipster", function(e) {
                _startTouchX = e.originalEvent.targetTouches[0].screenX;
            });
    
            flipInner.on("touchmove.flipster", function(e) {
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
    
            flipInner.on("touchend.flipster", function(e) {
                _startTouchX = 0;
            });
    
            //bindings to jump the carousel to any image you click on the left or right.
            flipInner.on("click.flipster", ".flipster-left, .flipster-right", function(e){
                e.preventDefault();
                jump(flipItems.index(this));
            });
    
        }
        
        $(window).load(init);
    
        return this; //maintain chainability with other jQuery calls.
  };
})( jQuery );
