jQuery.Flipster
===============

jQuery Flipster is a CSS3 3D transform-based jQuery plugin that replicates the familiar 'cover flow' effect. It's responsive, so it will automatically center itself and scale down to fit the area provided. It likes to be playfully touched on mobile browsers. It degrades (vaguely) gracefully, falling back to being just as flat and boring as the browsers that don't support 3D transforms. It's pretty rad.

At this point you're probably saying 'ZOMG JQUERY FLIPSTER WHERE HAVE U BEEN ALL LIFE???'. I would be if I were you. So your project needs some sweet, sweet coverflow loving. You've come to the right place.

Browsers tested in:
- Fully Functional:
    - Chrome (latest)
    - Safari & Mobile Safari (latest)
- Mostly Functional (no box reflections):
    - Firefox (latest)
    - IE 10
- Limited Functionality:
    - IE 7, 8 & 9 - no 3D transforms, 'compatibility mode'

Untested in:
- Android browsers
- Opera
- IE <= 6


Usage
---------------
Include the JS after jQuery, and the CSS wherever you like, then:
````javascript
$('.sweet-ass-coverflow-slider').flipster();
````
````html
<div class="sweet-ass-coverflow-slider">
    <ul>
    
      <li>
        <img src="">
      </li>
      
      <li>
        <img src="">
      </li>
      
    </ul>
</div>
````
There are no parameters for now.

The slider can be operated with arrow keys, clicks, side to side scrolling or by touch on mobile devices.

Anchor elements wrapped around the image elements can also be used.

Version History
---------------

0.1.0 - March 25 2013 - Improvements in fallbacks for old version of IE and basic fixes to make it actually work.

0.0.0 - March 22 2013 - LIFE ON THE BLEEDING EDGE BABY


License
---------------

&copy; 2013 Adrien Delessert

Licensed for use under the WTFPL. http://www.wtfpl.net/
