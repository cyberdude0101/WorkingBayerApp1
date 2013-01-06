// Start with the map page
window.location.replace(window.location.href.split("#")[0] + "#mappage");

var selectedFeature = null;

// fix height of content
function fixContentHeight() {
    var footer = $j("div[data-role='footer']:visible"),
        content = $j("div[data-role='content']:visible:visible"),
        viewHeight = $j(window).height(),
        contentHeight = viewHeight - footer.outerHeight();

    if ((content.outerHeight() + footer.outerHeight()) !== viewHeight) {
        contentHeight -= (content.outerHeight() - content.height() + 1);
        content.height(contentHeight);
    }

    if (window.map && window.map instanceof OpenLayers.Map) {
        map.updateSize();
    } else {
        // initialize map
        init(function(feature) { 
            selectedFeature = feature; 
            $j.mobile.changePage("#popup", "pop"); 
        });
        initLayerList();
    }
}

// one-time initialisation of button handlers 

$j("#plus").live('click', function(){
    map.zoomIn();
});

$j("#minus").live('click', function(){
    map.zoomOut();
});

$j("#locate").live('click',function(){

$j.mobile.showPageLoadingMsg();
    var control = map.getControlsBy("id", "locate-control")[0];
    if (control.active) {
        control.getCurrentLocation();
    
    } else {
        control.activate();

    }
});

//fix the content height AFTER jQuery Mobile has rendered the map page
$j('#mappage').live('pageshow',function (){
    fixContentHeight();
});
    
$j(window).bind("orientationchange resize pageshow", fixContentHeight);



$j('#popup').live('pageshow',function(event, ui){
    
});

$j('#searchpage').live('pageshow',function(event, ui){
    $j('#query').bind('change', function(e){
        $j('#search_results').empty();
        if ($j('#query')[0].value === '') {
            return;
        }
        $j.mobile.showPageLoadingMsg();

        // Prevent form send
        e.preventDefault();

        var searchUrl = 'http://ws.geonames.org/searchJSON?featureClass=P&maxRows=10';
        searchUrl += '&name_startsWith=' + $j('#query')[0].value;
        $j.getJSON(searchUrl, function(data) {
            $j.each(data.geonames, function() {
                var place = this;
                $j('<li>')
                    .hide()
                    .append($j('<h2 />', {
                        text: place.name
                    }))
                    .append($j('<p />', {
                        html: '<b>' + place.countryName + '</b> ' + place.adminCode1
                    }))
                    .appendTo('#search_results')
                    .click(function() {
                        $j.mobile.changePage('#mappage');
                        var lonlat = new OpenLayers.LonLat(place.lng, place.lat);
                        map.setCenter(lonlat.transform(gg, sm), 15);
                    })
                    .show();
            });
            $j('#search_results').listview('refresh');
            $j.mobile.hidePageLoadingMsg();
            });
    });
    // only listen to the first event triggered
    $j('#searchpage').die('pageshow', arguments.callee);
});


function initLayerList() {
    $j('#layerspage').page();

    $j('<li>', {
            "data-role": "list-divider",
            text: "Base Layers"
        })
        .appendTo('#layerslist');
    var baseLayers = map.getLayersBy("isBaseLayer", true);
    $j.each(baseLayers, function() {
        addLayerToList(this);
    });

    $j('<li>', {
            "data-role": "list-divider",
            text: "Overlay Layers"
        })
        .appendTo('#layerslist');
    var overlayLayers = map.getLayersBy("isBaseLayer", false);
    $j.each(overlayLayers, function() {
        addLayerToList(this);
    });
    $j('#layerslist').listview('refresh');
    $j('#layerlist' ).dialog({ height: 100, width: 100 });
    map.events.register("addlayer", this, function(e) {
        addLayerToList(e.layer);
    });
}

function addLayerToList(layer) {
    var item = $j('<li>', {
            "data-icon": "check",
            "class": layer.visibility ? "checked" : ""
        })
        .append($j('<a />', {
            text: layer.name
        })
            .click(function() {
                $j.mobile.changePage('#mappage');
                if (layer.isBaseLayer) {
                    layer.map.setBaseLayer(layer);
                } else {
                    layer.setVisibility(!layer.getVisibility());
                }
            })
        )
        .appendTo('#layerslist');
    layer.events.on({
        'visibilitychanged': function() {
            $j(item).toggleClass('checked');
        }
    });
}
