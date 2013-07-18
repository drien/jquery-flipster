jQuery.Flipster
===============
_Originally forked from [jQuery.Flipster](https://github.com/drien/jquery-flipster) by @drien_

jQuery Flipster is a CSS3 3D transform-based jQuery plugin that replicates the familiar 'cover flow' effect and now features a 'carousel' effect! It's responsive, so it will automatically center itself and scale down to fit the area provided. It likes to be playfully touched on mobile browsers. It degrades (vaguely) gracefully, falling back to being just as flat and boring as the browsers that don't support 3D transforms. Its only dependency is jQuery and it sets up in seconds. It's pretty rad.

At this point you're probably saying 'ZOMG JQUERY FLIPSTER WHERE HAVE U BEEN ALL MY LIFE???'. I would be if I were you. So your project needs some sweet, sweet coverflow loving. You've come to the right place.

The slider can be operated with arrow keys, clicks, side to side scrolling or by touch on mobile devices. Wrapping the image elements in anchor tags also works to enable linking out from the current element.

Live demo: http://brokensquare.com/Code/jquery-flipster/demo/

**Tested in:**
- [x] Chrome (latest)
- [x] Safari & Mobile Safari (latest)
- [x] Firefox (latest) _(no mousewheel)_
- [x] IE 10

**Latest Version Untested in:**
- [ ] IE 8 & 9 _(no 3D transforms, 'compatibility mode')_
- [ ] Android browsers
- [ ] Opera
- [ ] IE <= 7


Basic Usage
---------------
Include the CSS (ideally in the header)
````html
<link rel="stylesheet" href="css/flipper.css">
````

Set up your image list like so:
````html
<div class="flipster">
	<ul>
		<li><img src="" alt="" /></li>
		...
	</ul>
</div>
````

Include the Javascript after jQuery (ideally at the bottom of the page before the `</body>` tag
````html
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
<script>window.jQuery || document.write('<script src="/js/jquery-1.10.2.min.js"><\/script>')</script>
<script src="/js/jquery.flipper.js"></script>
````

Initialize the script:
````javascript
$(function(){ $('.flipster').flipster(); });
````


Options
---------------
- `itemContainer` Container for the items to flipsterfy. _Default is 'ul'_
- `itemSelector` Children of itemContainer to flipsterfy. _Default is 'li'_
- `style` Switch between 'coverflow' or 'carousel' display styles _Default is 'coverflow'_
- `start` Set to a number to have Flipster start centered on that item, or set to _'center'_ to start in the middle
- `enableKeyboard` If true, the left and right arrow keys will navigate through the list. _Default is 'true'_
- `enableMousewheel` If true, the mousewheel will scroll through the list. _Default is 'true'_
- `enableTouch` If true, touch swipes will scroll through the list. _Default is 'true'_
- `enableNav` If true, Flipster will insert an unordered list of the items' categories and titles to allow for direct navigation and give you a visual walk through of the items. _Default is 'false'_
- `enableNavButtons` If true, Flipster will insert "Previous" and "Next" links to go left or right in the list. _Default is 'false'_


Callbacks
---------------
- `onItemSwitch` Called whenever an item is switched


Advanced Usage
---------------

### Parameters

If you want to change options, add the parameters when initializing the script. Default values are shown below
````javascript
$(function(){ 
	$('.flipster').flipster({
		itemContainer:			'ul', // Container for the flippin' items.
		itemSelector:				'li', // Selector for children of itemContainer to flip
		style:							'coverflow', // Switch between 'coverflow' or 'carousel' display styles
		start:							'center', // Starting item. Set to 0 to start at the first, 'center' to start in the middle or the index of the item you want to start with.
		
		enableKeyboard:			true, // Enable left/right arrow navigation
		enableMousewheel:		true, // Enable scrollwheel navigation (up = left, down = right)
		enableTouch:				true, // Enable swipe navigation for touch devices
		
		enableNav:					false, // If true, flipster will insert an unordered list of the slides
		enableNavButtons:		false, // If true, flipster will insert Previous / Next buttons
		
		onItemSwitch:				function(){}, // Callback function when items are switches
	}
});
````

### Navigation ###

Flipster can build an unordered list of links to the slides, which can come in handy for some implementations. Include the `id` and `title` attribute on each item and set `enableNav: true` in the Javascript parameters.

An item list like:
````html
<div class="flipster">
	<ul class="flip-items">
		<li id="Item-1" title="Item 1 Title">
			<img src="" alt="" />
		</li>
		<li id="Item-2" title="Item 2 Title">
			<img src="" />
		</li>
		...
  </ul>
</div>
````

will output:
````html
<ul class="flipster-nav">
<li class="flip-nav-item no-category"><a href="#Item-1" class="flip-nav-item-link">Item 1 Title</a></li>
<li class="flip-nav-item no-category"><a href="#Item-2" class="flip-nav-item-link">Item 2 Title</a></li>...
</ul>
````
in the container.

#### Categories ####

The navigation list can also group items into categories. Include the `data-flip-category` along with the `id` and `title` attributes with `enableNav: true` in the Javascript parameters.

An item list like:
````html
<div class="flipster">
	<ul class="flip-items">
		<li id="Item-1" title="Item 1 Title" data-flip-category="Category 1">
			<img src="" alt="" />
		</li>
		<li id="Item-2" title="Item 2 Title" data-flip-category="Category 1">
			<img src="" />
		</li>
		<li id="Item-3" title="Item 3 Title" data-flip-category="Category 2">
			<img src="" />
		</li>
		<li id="Item-4" title="Item 4 Title" data-flip-category="Category 2">
			<img src="" />
		</li>
		<li id="Item-5" title="Item 5 Title">
			<img src="" />
		</li>
  </ul>
</div>
````
will output:
````html
<ul class="flipster-nav">
	<li class="flip-nav-category">
		<a href="#" class="flip-nav-category-link" data-flip-category="Category 1">Category 1</a>
		<ul class="flip-nav-items">
			<li class="flip-nav-item"><a href="#Item-1" class="flip-nav-item-link">Item 1</a></li>
			<li class="flip-nav-item"><a href="#Item-2" class="flip-nav-item-link">Item 2</a></li>
		</ul>
	</li>
	<li class="flip-nav-category">
		<a href="#" class="flip-nav-category-link" data-flip-category="Category 2">Category 2</a>
		<ul class="flip-nav-items">
			<li class="flip-nav-item"><a href="#Item-3" class="flip-nav-item-link">Item 3</a></li>
			<li class="flip-nav-item"><a href="#Item-4" class="flip-nav-item-link">Item 4</a></li>
		</ul>
	</li>
	<li class="flip-nav-item no-category">
		<a href="#Item-5" class="flip-nav-item-link">Item 5 Title</a>
	</li>
</ul>
````
in the container.


To Do
---------------
- [x] Coverflow Style
- [x] Carousel Style
- [x] Better Demos
- [ ] Compatibility Testing (IE8/9...)
- [ ] Flat style
- [ ] Option for number of items to display while in Carousel view


Contributing
---------------
If you can make this better, don't be shy! I'll be happy to merge pull requests as long as they keep the project lightweight, simple to set up and free of dependencies beyond jQuery.

Also, if you run into a problem or have an idea, feel free to make an issue on the github project and I'll get on it when I can!


Version History
---------------
- 0.3.1 - July 18 2013
		- Better demos ( See http://brokensquare.com/Code/jquery-flipster/demo/ )

- 0.3.0 - July 17 2013
    - @shshaw forked from @drien's [jQuery.Flipster](https://github.com/drien/jquery-flipster)
    - Added new Carousel style! Shows 5 items at a time in a looping carousel
    - Added `itemContainer`, `itemSelector`, `style`, and `start` options for basic configuration
    - Added `enableKeyboard`, `enableMousewheel`, and `enableTouch` options to enable/disable features
    - Added `enableNav` and `enableNavButtons` options to insert controls into the container
    - Added `onItemSwitch` callback

- 0.2.1 - July 11 2013
    - Fixed bug where all keyboard input was being suppressed.

- 0.2.0 - June 27 2013
    - Added automatic height adjustment for the container element, which used to just overflow.
    - A few minor code improvements.
    - Added minified versions of the js and css files.

- 0.1.3 - March 25 2013 
    - Strong men also cry, strong men also cry.

- 0.1.0 - March 25 2013
    - Improvements in fallbacks for old version of IE and basic fixes to make it actually work.

- 0.0.0 - March 22 2013
    - LIFE ON THE BLEEDING EDGE BABY


License
---------------

&copy; 2013 Adrien Delessert

Licensed for use under the WTFPL. http://www.wtfpl.net/
