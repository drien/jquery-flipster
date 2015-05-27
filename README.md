jQuery.Flipster
===============
[![](http://api.libscore.com/badge/$.fn.flipster.svg)](http://libscore.com/#$.fn.flipster)

Flipster is a CSS3 3D transform-based jQuery plugin built to replicate the familiar 'cover flow' effect, but also supports a variety of styles. Not only is it gorgeous to look at, Flipster is also:

- **Responsive** Automatically centers and scales to fit the area provided.
- **Flexible** Flip an image gallery or any HTML content.
- **Touch Friendly** Swipe between items on touch devices without interrupting scroll.
- **Keyboard Friendly** Go ahead, use your arrow keys. I dare you.
- **Lightweight** Javascript and CSS are only 5kb gzipped (13kb uncompressed) combined. Only dependency is jQuery.
- **Customizable** Three built in styles (coverflow, carousel and flat) and plenty of options to configure Flipster the way you want

Live demo: http://brokensquare.com/Code/jquery-flipster/demo/

#Browser Support
- [x] Chrome (latest)
- [x] Safari & iOS Safari (latest)
- [x] Firefox (latest)
- [x] IE 10


Basic Usage
---------------

1. Include Flipster's CSS, typically in the `<head>`:
````html
<link rel="stylesheet" href="css/flipster.min.css">
````
*Tip: Use the un-minified `flipster.css` or the LESS files in the `src/less` folder to make your own Flipster styles!*

2. Set up your content:
````html
<div class="my-flipster">
  <ul>
    <li><img src="" /></li>
    <li><p>Plain ol' <abbr>HTML</abbr>!</p></li>
    ...
  </ul>
</div>
````

*Tip: Set the `itemContainer` and `itemSelector` options to fit your markup. Flipster only requires an outer container and inner container; you aren't restricted to `<div>`, `<ul>`, and `<li>`s. *

3. Include Flipster's Javascript after jQuery (ideally at the bottom of the page before the `</body>` tag) and initialize Flipster on your element:
````html
<script src="/js/jquery.min.js"></script>
<script src="/js/jquery.flipster.js"></script>
<script>
    $('.my-flipster').flipster();
</script>
````

4. Start flippin'!


Options
---------------

Set your options when first initializing Flipster. Default values and descriptions are shown below.
````javascript  
$('.my-flipster').flipster({
    itemContainer: 'ul',
    // [string|object]
    // Selector for the container of the flippin' items.

    itemSelector: 'li',
    // [string|object]
    // Selector for children of `itemContainer` to flip

    start: 'center',
    // ['center'|number]
    // Zero based index of the starting item, or use 'center' to start in the middle

    fadeIn: 400,
    // [milliseconds]
    // Speed of the fade in animation after items have been setup

    loop: true,
    // [true|false]
    // Loop around when the start or end is reached

    autoplay: false,
    // [false|milliseconds]
    // If a positive number, Flipster will automatically advance to next item after that number of milliseconds

    pauseOnHover: true,
    // [true|false]
    // If true, autoplay advancement will pause when Flipster is hovered

    style: 'coverflow',
    // [coverflow|carousel|flat|...]
    // Adds a class (e.g. flipster--coverflow) to the flipster element to switch between display styles
    // Create your own theme in CSS and use this setting to have Flipster add the custom class

    spacing: -0.6,
    // [number]
    // Space between items relative to each item's width. 0 for no spacing, negative values to overlap

    keyboard: true,
    // [true|false]
    // Enable left/right arrow navigation

    scrollwheel: true,
    // [true|false]
    // Enable mousewheel/trackpad navigation; up/left = previous, down/right = next

    touch: true,
    // [true|false]
    // Enable swipe navigation for touch devices

    nav: false,
    // [true|false|'before'|'after']
    // If not false, Flipster will build an unordered list of the items
    // Values true or 'before' will insert the navigation before the items, 'after' will append the navigation after the items

    navButtons: false,
    // [true|false]
    // If true, Flipster will insert Previous / Next buttons

    prevText: 'Previous',
    // [text|html]
    // Changes the text for the Previous button

    nextText: 'Next',
    // [text|html]
    // Changes the text for the Next button

    onItemSwitch: false
    // [function]
    // Callback function when items are switched
    // Arguments received: [currentItem, previousItem]
});
````

Methods
---------------

Once an element has been initialized with Flipster, you can call methods to control it:

````javascript
var myFlipster = $('.my-flipster').flipster(); // It's best to store the element as a variable for easy reference.

myFlipster.flipster('next'); // Next item
myFlipster.flipster('prev'); // Previous item
myFlipster.flipster('jump', 0); // Jump to a specific index
myFlipster.flipster('jump', $('.my-item')); // Jump to a specific item
myFlipster.flipster('play'); // Resume autoplay
myFlipster.flipster('pause'); // Pause the autoplay.
myFlipster.flipster('index'); // If items are added or removed, you can tell Flipster to reindex 
````

Navigation
---------------

Set `nav: true` in the options and Flipster can build an unordered list of links to each item to let users jump around. 

The navigation list will use each item's `data-flip-title` attribute as the text. If an item does not have a `data-flip-title`, Flipster will try to grab the `title` attribute, or will default to the item's index.

````html
<div class="my-flipster">
    <ul>
        <li data-flip-title="Item 1 Title">...</li>
        <li data-flip-title="Item 2 Title">...</li>
        ...
    </ul>
</div>
````

### Categories ###

Include `data-flip-category` attributes on your items, and the navigation list will group items into categories, allowing for basic filtering and quicker navigation.

````html
<div class="my-flipster">
    <ul>
        <li data-flip-title="Item 1 Title" data-flip-category="Category 1">...</li>
        <li data-flip-title="Item 2 Title" data-flip-category="Category 1">...</li>
        <li data-flip-title="Item 3 Title" data-flip-category="Category 2">...</li>
        <li data-flip-title="Item 4 Title" data-flip-category="Category 2">...</li>
        <li data-flip-title="Item 5 Title">...</li>
    </ul>
</div>
````


Contributing
---------------
If you run into a problem or have an idea, feel free to <a href="https://github.com/drien/jquery-flipster/issues">make an issue</a> on the Github project and I'll get on it when I can!

See room for improvement? Don't be shy! Fork this repo and I'll be happy to merge pull requests provided they keep Flipster lightweight, simple to set up and free of dependencies beyond jQuery.

Please run `grunt` to generate minified files for distribution before making a pull request!

Special thanks to <a href="http://twitter.com/shshaw">@shshaw</a> for major additions leading to version 1.0!


Version History
---------------
- 1.0.0 - May 2015
    - Massive rewrite for performance optimization and simplification
    - Better scrollwheel, keyboard and touch events
    - [BEM syntax](http://csswizardry.com/2013/01/mindbemding-getting-your-head-round-bem-syntax/) for all Flipster classes
    - Added `autoplay` option to automatically advance through items; `pauseOnHover` option will prevent items from switching automatically while hovered
    - Added `fadeIn` option for controlling duration of fade-in animation after Flipster has been setup
    - 
    - Option names have changed; be sure to check the documentation to update your code
    - ...
    
- 0.3.4 - July 23 2014
    - Some additional options available
    - Cleaned up code and normalized whitespace
    - Added Grunt support for minifying css and js for distribution

- 0.3.2 - February 4 2014
    - Added public access for `jump` method and functionality for exposing other methods. (Thanks @JoeWagner!)
    - A number of bug fixes.

- 0.3.1 - July 18 2013
    - Better demos ( See http://brokensquare.com/Code/jquery-Flipster/demo/ )

- 0.3.0 - July 17 2013
    - @shshaw forked from @drien's [jQuery.Flipster](https://github.com/drien/jquery-Flipster)
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

The MIT License (MIT)

Copyright (c) 2013-2015 Adrien Delessert

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
