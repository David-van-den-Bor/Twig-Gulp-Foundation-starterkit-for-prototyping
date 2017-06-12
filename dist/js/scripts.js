
//import third party libraries

// include others/scrollreveal.js


$( document ).ready(function() {

    /** ---------------------------------------------------------------------- //
     *  @group smooth anchor scrolling links
     *  @author @david
     */
    $(function() {
        // $('a[href*="#"]:not([href="#"])').click(function() {
        $('.menu li a, .hero-text a').click(function() {
            if (location.pathname.replace(/^\//,'') === this.pathname.replace(/^\//,'') && location.hostname === this.hostname) {
                var target = $(this.hash);
                target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
                if (target.length) {
                    $('html, body').animate({
                        scrollTop: target.offset().top-130
                    }, 1000);
                    return false;
                }
            }
        });
    });

    /* @end smooth anchor scrolling links  */


    /** ---------------------------------------------------------------------- //
     *  @group viewport trigger script
     * for adding or removing classes from elements in view within viewport
     *  @author @david
     *  use like this: add following to css stylesheets:
        .foobar.inview {
           @extend .fadeInUpBig;
           transform:rotate(90deg)}
     */

    // which HTML elements need to be animated?
    $('.waarom').addClass('inview');
    $('.splash').addClass('inview');
    $('.prijs').addClass('inview');
    $('.formulier .button').addClass('inview');

    var $animationElements = $('.inview');
    var $window = $(window);

    function checkIfInView() {
        // ps: Let's FIRST disable animation triggering on mobile!
        var isMobile = window.matchMedia("only screen and (max-width: 768px)");
        // OK, Let's roll..
        var windowHeight = $window.height();
        var windowTopPosition = $window.scrollTop();
        var windowBottomPosition = (windowTopPosition + windowHeight);

        $.each($animationElements, function () {
            var $element = $(this);
            var elementHeight = $element.outerHeight();
            var elementTopPosition = $element.offset().top;
            var elementBottomPosition = (elementTopPosition + elementHeight);

            if (!isMobile.matches) {
            //check to see if this current container is within viewport
                if ((elementBottomPosition >= windowTopPosition) &&
                    (elementTopPosition <= windowBottomPosition)) {
                    $element.addClass('inview');
                } else {
                    $element.removeClass('inview');
                }
            }
            else {
                     $animationElements.removeClass('inview');
                 }
        });
    }
    $window.on('scroll resize', checkIfInView);
    $window.trigger('scroll');

});

/* @end smooth anchor scrolling links  */


// menu openen en sluiten
$( ".logo" ).click(function() {
    $( ".menu" ).toggleClass( "sluiten" );
});
