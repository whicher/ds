var _SITE_URL = 'http://derdinisikiyim.com';
var CURRENT_URL = _SITE_URL;
var _DEBUG = false;
var _DEFAULT_TITLE = "Kolektif dert aparatı - derdini sikiyim butonu şurda bi yerde olacaktı";

$.extend($.easing,
{
    def: 'easeOutQuad',
    easeInOutExpo: function (x, t, b, c, d) {
        if (t==0) return b;
        if (t==d) return b+c;
        if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
        return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
    }
});

(function( $ ) {

    var settings;
    var disableScrollFn = false;
    var navItems;
    var navs = {}, sections = {};

    $.fn.navScroller = function(options) {
        settings = $.extend({
            scrollToOffset: 170,
            scrollSpeed: 800,
            activateParentNode: true,
        }, options );
        navItems = this;

        //attatch click listeners
    	navItems.on('click', function(event){
    		event.preventDefault();
            var navID = $(this).attr("href").substring(1);
            disableScrollFn = true;
            activateNav(navID);
            populateDestinations(); //recalculate these!
        	$('html,body').animate({scrollTop: sections[navID] - settings.scrollToOffset},
                settings.scrollSpeed, "easeInOutExpo", function(){
                    disableScrollFn = false;
                }
            );
    	});

        //populate lookup of clicable elements and destination sections
        populateDestinations(); //should also be run on browser resize, btw

        // setup scroll listener
        $(document).scroll(function(){
            if (disableScrollFn) { return; }
            var page_height = $(window).height();
            var pos = $(this).scrollTop();
            for (i in sections) {
                if ((pos + settings.scrollToOffset >= sections[i]) && sections[i] < pos + page_height){
                    activateNav(i);
                }
            }
        });
    };

    function populateDestinations() {
        navItems.each(function(){
            var scrollID = $(this).attr('href').substring(1);
            navs[scrollID] = (settings.activateParentNode)? this.parentNode : this;
            sections[scrollID] = $(document.getElementById(scrollID)).offset().top;
        });
    }

    function activateNav(navID) {
        for (nav in navs) { $(navs[nav]).removeClass('active'); }
        $(navs[navID]).addClass('active');
    }
})( jQuery );


$(document).ready(function (){

    $('nav li a').navScroller();

    //section divider icon click gently scrolls to reveal the section
	$(".sectiondivider").on('click', function(event) {
    	$('html,body').animate({scrollTop: $(event.target.parentNode).offset().top - 50}, 400, "linear");
	});

    //links going to other sections nicely scroll
	// $(".container a").each(function(){
 //        if ($(this).attr("href").charAt(0) == '#'){
 //            $(this).on('click', function(event) {
 //        		event.preventDefault();
 //                var target = $(event.target).closest("a");
 //                var targetHight =  $(target.attr("href")).offset().top
 //            	$('html,body').animate({scrollTop: targetHight - 170}, 800, "easeInOutExpo");
 //            });
 //        }
	// });

	////////////
	$("#btn-dert")[0].addEventListener("click", function(){
	  var dert = $(".ta-dert")[0].value;
    if (_DEBUG) {
  	  console.log("Sevmeye basildi: " + dert);
    }
	  if (dert === '') {
	    $("#p-dert-message")[0].innerHTML = "Bir dert girmen lazim ama...";
	  } else {
      saveDert(dert);
    }
  });

  // Add default sharing option as root url.
  $(".ul-share-menu").html($(".ul-share-menu").html().replace(
      /URL_PLACEHOLDER/g, _SITE_URL));
  // Change title to default state.
  document.title = _DEFAULT_TITLE;

  var params = getJsonFromUrl(window.location.href);
  if (_DEBUG) {
    console.log(JSON.stringify(params));
  }
  if (params && params['q']) {
    getDertById(params['q']);
  }

  getLastDerts();

});

function saveDert(dert) {
  if (_DEBUG) {
    console.log('Saving dert: ' + dert);
  }

  jQuery.ajax({
      accept: "application/json",
      method: "POST",
      type: "POST",
      contentType: "application/json; charset=utf-8",
      // dataType: "jsonp",
      url: "https://glowing-heat-3755.firebaseio.com/dert.json",
      data: JSON.stringify({"dert": dert, "tarih": new Date()}),
      success: function successfulSaving(data) {
        if (_DEBUG) {
          console.log('Saved successfully...' + JSON.stringify(data));
        }
        $("#p-dert-message")[0].innerHTML = "Derdin başarıyla sevildi";
        $('.ul-last-derts').prepend($('<li><a href="/?q='+ data + '"> ' + dert['dert'] + '</a></li>'));
        $(".ta-dert")[0].value = '';
      },
      fail: function failSaving() {
        if (_DEBUG) {
          console.log('Smt wrong...');
        }
        $("#p-dert-message")[0].innerHTML = "Dert sevme hatası, bi ara tekrar dene ya da deneme.";
      }
  });
}

function getLastDerts() {
  jQuery.ajax({
      url: "https://glowing-heat-3755.firebaseio.com/dert.json?orderBy=%22tarih%22&limitToLast=40",
      success: function successfulSaving(data) {
        if (_DEBUG) {
          console.log('Got derts: ' + JSON.stringify(data));
        }
        appendDertsToPage(data);
      },
      fail: function failSaving() {
        if (_DEBUG) {
          console.log('Smt wrong...');
        }
      }
  })
}

function getDertById(id) {
  jQuery.ajax({
      url: "https://glowing-heat-3755.firebaseio.com/dert/" + id + ".json",
      success: function successfulSaving(data) {
        if (_DEBUG) {
          console.log('Got one dert: ' + JSON.stringify(data));
        }
        appendOneDertToPage(data);

        // Update the current url dynamically without reload.
        CURRENT_URL = _SITE_URL + '/?q=' + id + '&d=' + slugify(data['dert']);
        var shareUrlParam = '/url=' + escape(CURRENT_URL) + '&';
        $(".ul-share-menu").html($(".ul-share-menu").html().replace(
            /url=.*?&/g, shareUrlParam));
        $(".a-share-fb").html($("#a-share-fb").html().replace(
            /u=.*?/g, shareUrlParam));
        document.title = data['dert'] + ' | ' + _DEFAULT_TITLE;
      },
      fail: function failSaving() {
        if (_DEBUG) {
          console.log('Smt wrong...');
        }
      }
  })
}

function slugify(text) {
  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/&/g, '-and-')         // Replace & with 'and'
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-');        // Replace multiple - with single -
}

function appendDertsToPage(lastDerts) {
  for (var i in lastDerts) {
    $('.ul-last-derts').prepend($('<li><a href="/' + '?q='+ i + '&d=' + slugify(lastDerts[i]['dert']) + '">' + lastDerts[i]['dert'] + '</a></li>'));
  }
}

function appendOneDertToPage(dert) {
  $('#sizi-gck-eden-dnyann-en-nemli-derdini-girin')[0].innerHTML = dert['dert'];
}

function getJsonFromUrl() {
  var query = location.search.substr(1);
  var result = {};
  query.split("&").forEach(function(part) {
    var item = part.split("=");
    result[item[0]] = decodeURIComponent(item[1]);
  });
  return result;
}
