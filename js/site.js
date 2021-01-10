var _SITE_URL = 'http://derdinisikiyim.com';
var CURRENT_URL = _SITE_URL;
var _DEBUG = true;
var _DEFAULT_TITLE = "Kolektif dert aparatı - derdini sikiyim butonu şurda bi yerde olacaktı";
var _DEFAULT_SHARE_MENU_HTML = '<li><a id="a-share-fb" class="a-share-option" tabindex="-1" target="_blank" href="https://www.facebook.com/sharer/sharer.php?u=URL_PLACEHOLDER"><i class="fa fa-facebook"></i></a></li>'+
    '<li><a class="a-share-option" tabindex="-1"  target="_blank" href="https://twitter.com/intent/tweet?text=TEXT_PLACEHOLDER&url=URL_PLACEHOLDER&via=derdinisikiyim"><i class="fa fa-twitter"></i></a></li>' +
    '<li><a class="a-share-option" tabindex="-1"  target="_blank" href="https://plus.google.com/share?url=URL_PLACEHOLDER"><i class="fa fa-google-plus"></i></a></li>' +
    '<li><a class="a-share-option" tabindex="-1"  target="_blank" href="https://www.linkedin.com/shareArticle?summary=Dertler derya&mini=true&url=URL_PLACEHOLDER"><i class="fa fa-linkedin"></i></a></li>' +
    '<li><a class="a-share-option" tabindex="-1" onclick="window.prompt(\'Link aşağıda seçili ve kopyalamaya hazır\', \'URL_PLACEHOLDER\');"><i class="fa fa-clipboard"></i></a></li>';

$(document).ready(function (){
	$("#btn-dert")[0].addEventListener("click", function(){
	  var dert = $(".ta-dert")[0].value;
    if (_DEBUG) {
  	  console.log("Sevmeye basildi: " + dert);
    }
	  if (dert === '') {
	    $("#p-dert-message")[0].innerHTML = "Bir dert girmen lazim ama...";
	  } else {
      if (_DEBUG) {
        console.log('Dert lenght: ' + dert.lenth);
      }
      if (dert.length > 500) {
        $("#p-dert-message")[0].innerHTML = "Derdin çok uzun dostum, durumumuz yoktu okuyamadık...";     
      } else {
        saveDert(dert);
      }
    }
  });

  // Change title to default state.
  document.title = _DEFAULT_TITLE;

  var params = getJsonFromUrl(window.location.href);
  if (_DEBUG) {
    console.log('params: ', JSON.stringify(params));
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
	dert = dert.trim()

  if (dert.length < 1) {
		$("#p-dert-message")[0].innerHTML = "<b>Dert cok kisa olmadi bu sefer.</b>";
		return;
	}

	jQuery.ajax({
		accept: "application/json",
		method: "POST",
		type: "POST",
		contentType: "application/json; charset=utf-8",
		url: "https://glowing-heat-3755.firebaseio.com/dert.json",
		data: JSON.stringify({"dert": dert, "tarih": new Date()}),
		success: function successfulSaving(data) {
			if (_DEBUG) {
				console.log('Saved successfully...' + JSON.stringify(data));
			}
			$("#p-dert-message")[0].innerHTML = "<b>Derdin başarıyla sikildi</b>";
			$('.ul-last-derts').prepend($('<li><a href="/?q='+ data['name'] + '"> ' + htmlEncode(dert.slice(0, 120)) + '</a></li>'));
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
 	jQuery.get(
      "https://glowing-heat-3755.firebaseio.com/dert.json?orderBy=%22tarih%22&limitToLast=200",
      function(data) {
        if (_DEBUG) {
          //console.log('Got derts: ' + JSON.stringify(data));
        }
        appendDertsToPage(data);
      })
		.fail(function(){
			if (_DEBUG) {
				console.log('Smt wrong...');
			}
		});
}

function getDertById(id) {
  jQuery.get(
      "https://glowing-heat-3755.firebaseio.com/dert/" + id + ".json",
      function(data) {
        if (_DEBUG) {
          console.log('Got one dert: ' + JSON.stringify(data));
        }
        appendOneDertToPage(data);

        // Update the current url dynamically without reload.
        CURRENT_URL = _SITE_URL + '/?q=' + id;
        $(".ul-share-menu").html(_DEFAULT_SHARE_MENU_HTML.replace(
            /URL_PLACEHOLDER/g, escape(CURRENT_URL)).replace(
                'TEXT_PLACEHOLDER', data['dert']));
        document.title = data['dert'] + ' | ' + _DEFAULT_TITLE;
      }
	);
}

function slugify(text) {
  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/&/g, '-and-')         // Replace & with 'and'
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-');        // Replace multiple - with single -
}

function htmlEncode(value){ 
  return $('<div/>').text(value).html(); 
}

function appendDertsToPage(lastDerts) {
  for (var i in lastDerts) {
		var dertText = htmlEncode(lastDerts[i]['dert'].trim());
    if (dertText.length < 1) {
			continue;
		}
    $('.ul-last-derts').prepend($('<li><a href="/' + '?q='+ i + '&d=' + slugify(dertText) + '">' + dertText + '</a></li>'));
  }
}

function appendOneDertToPage(dert) {
  $('#h1-title').text(dert['dert']);
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
