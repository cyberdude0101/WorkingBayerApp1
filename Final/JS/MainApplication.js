

// initialize map when page ready
var map;
var gg = new OpenLayers.Projection("EPSG:4326");
var sm = new OpenLayers.Projection("EPSG:900913");
 var WeatherStyleMap = new OpenLayers.StyleMap(
		new OpenLayers.Style({
			fontColor: "Yellow",
			fontSize: "20px",
			fontFamily: "Arial",
			graphicXOffset: 0,
			graphicYOffset: 0,
			labelAlign: "lt",
			labelXOffset: "40",
			labelYOffset: "-15",
			labelOutlineColor: "Green",
			labelOutlineWidth: 3,
			externalGraphic: "${icon}",
			graphicWidth: 50,
                	label : "${myCustomLabel}"
		},
		{
		context: 
		{
			icon:  function(feature) {
				return feature.layer.options.getIcon(feature.attributes.station);
			},
			myCustomLabel:  function(feature) {
			    var Farenheit = ((feature.attributes.station.main.temp-273.15)*1.8)+32;
				return  Math.round(Farenheit) + '°F';
			}

		}
	}
	));

 
 //------------gauje.js-----------------------------------------------------------
 
 var $j = jQuery.noConflict();
 if(typeof $=='undefined') {function $(v) {return(document.getElementById(v));}}
window.onload = function () { 
var NWSGauge = gauge.add(document.getElementById('NWSGaugeDiv'));
var MesoGauge = gauge.add(document.getElementById('MesoGaugeDiv'));
var DD60Gauge = gauge.add(document.getElementById('DD60GaugeDiv'));
var MesoTemp;
var canvascheck = document.createElement('canvas');
gauge.add($("NWSGaugeDiv"), {width:30, height:230, name: 'NWSGauge', vertical: true, limit: true, gradient: true, scale: 10, colors:['#E31A1C','#FC4E2A','#FEB24C','#D9F0A3','#C8F60F','#83F60F'], values:[35,10,5,10,10,30,5]});
gauge.add($("MesoGaugeDiv"), {width:30, height:230, name: 'MesoGauge', vertical: true, limit: true, gradient: true, scale: 10, colors:['#E31A1C','#FC4E2A','#E67451','#ADDD8E','#F7FCB9','#C8F60F','#83F60F'], values:[20,20,20,2,5,18,14]});
gauge.add($("DD60GaugeDiv"), {width:30, height:230, name: 'DD60Gauge', vertical: true, limit: true, gradient: true, scale: 10, colors:['#C11B17','#F66F0F','#F6BD0F','#C8F60F','#83F60F'], values:[10,10,10,10,10,10]});

}

        var NWSMinTemp;
        var MesoTemp;
        var DD605DayV;
        var FinalRank;
        var AirCondition;
        var DispDate;
 var style = {
        fillOpacity: 0.1,
        fillColor: '#000',
        strokeColor: '#f00',
        strokeOpacity: 0.6
    };

 //----------------------------------------------------------------------------------------------
var init = function (onSelectFeatureFunction) {

    
    var geolocategraphic = new OpenLayers.Layer.Vector("My Location", {});

    var nwsgrid =  new OpenLayers.Layer.WMS(
                "Bayer Temp Grid",
                "http://129.118.152.27/geoserver/ows",
                {layers: 'Bayer:NWSGridwTemps',  transparent: true},
                {isBaseLayer: false, opacity: 0.5});
 var gsat = new OpenLayers.Layer.Google(
        "Google Satellite",
        {type: google.maps.MapTypeId.SATELLITE, numZoomLevels: 22}
    );
    var gphy = new OpenLayers.Layer.Google(
        "Google Physical",
        {type: google.maps.MapTypeId.TERRAIN, visibility: false}
    );
    var gmap = new OpenLayers.Layer.Google(
        "Google Streets", // the default
        {numZoomLevels: 20, visibility: false}
    );
    var ghyb = new OpenLayers.Layer.Google(
        "Google Hybrid",
        {type: google.maps.MapTypeId.HYBRID, numZoomLevels: 22, visibility: true}
    );
// Make weather layer. Server clastering of markers is using.
	var city = new OpenLayers.Layer.Vector.OWMWeather("Current Weather", {styleMap: WeatherStyleMap});

         
var styleMap = new OpenLayers.StyleMap(OpenLayers.Util.applyDefaults(
        {fillColor: "green", stroke: "true", fillOpacity: 0, strokeColor:'#66FFFF', strokeDashstyle: "solid",strokeWidth:5},
        OpenLayers.Feature.Vector.style["default"]));
var select = new OpenLayers.Layer.Vector("Selected Grid",{styleMap: styleMap});    
 var geolocate = new OpenLayers.Control.Geolocate({
        id: 'locate-control',
        geolocationOptions: {
            enableHighAccuracy: false,
            maximumAge: 0,
            timeout: 7000
        }
    });

    var firstGeolocation = true;

    geolocate.events.register("locationupdated", this, function(e) {
        geolocategraphic.removeAllFeatures();
         var circle =  new OpenLayers.Feature.Vector(
                OpenLayers.Geometry.Polygon.createRegularPolygon(
                    new OpenLayers.Geometry.Point(e.point.x, e.point.y),
                    e.position.coords.accuracy / 2,
                    50,
                    0
                ),
                {},
                style
            );
        geolocategraphic.addFeatures([
            new OpenLayers.Feature.Vector(
                e.point,
                {},
                {
                    graphicName: 'cross',
                    strokeColor: '#f00',
                    strokeWidth: 2,
                    fillOpacity: 0,
                    pointRadius: 10
                }
            ),
            circle
         
        ]);
        if (firstGeolocation) {
    	 $j.mobile.hidePageLoadingMsg();
        map.zoomToExtent(geolocategraphic.getDataExtent());
       
        firstGeolocation = true;
        this.bind = true;
    }    });
    // create map
    map = new OpenLayers.Map({
        div: "map",
        theme: null,
        projection: sm,
        numZoomLevels: 18,
        controls: [
            new OpenLayers.Control.Attribution(),
             new OpenLayers.Control.Navigation(),
                         geolocate
          
        ],
        layers: [
           
			 select,
			 city,
        	 nwsgrid,        	 
             geolocategraphic,
             ghyb, 
             gphy,
             gmap,
             gsat,
              new OpenLayers.Layer.OSM("OpenStreetMap", null, {
                transitionEffect: 'resize'
            }),
            
        ],
        center: new OpenLayers.LonLat(-10071739, 2978953),
        zoom: 4
    });
    
 var control = new OpenLayers.Control.GetFeature({
                protocol: OpenLayers.Protocol.WFS.fromWMSLayer(nwsgrid),
   });
   control.events.register("featureselected", this, function(e) {
                select.addFeatures([e.feature]);
$j.mobile.showPageLoadingMsg();  
});
control.events.register("featureunselected", this, function(e) {
                select.removeFeatures([e.feature]);
});

 info = new OpenLayers.Control.WMSGetFeatureInfo({
            url: 'http://129.118.152.27/geoserver/ows', 
            title: 'Identify features by clicking',
            queryVisible: true,
           
        });
		info.infoFormat = 'application/vnd.ogc.gml';
	    info.events.register("getfeatureinfo", this, 
	    
	    function pickPropInfo(e){
	     if (e.features && e.features.length) 
        {
       NWSMinTemp = e.features[0].attributes.NWSMinTemp;
       MesoTemp = e.features[0].attributes.MesoTemp;
       DD605DayV = e.features[0].attributes.DD605DayV;
       FinalRank = e.features[0].attributes.FinalRank;
       AirCondition = e.features[0].attributes.AirCond;
       DispDate = e.features[0].attributes.DateDisp;
//-----------------Gauje Update---------------------------------------------------

   if (NWSMinTemp <= 35 )  
              {
               gauge.modify($('NWSGauge'), {values:[0.33,1]});
               document.getElementById('NWSMinTempLabel').style.color = "#FF0000";
              document.getElementById('NWSMinTempLabel').style.fontWeight= "bolder";
              }
              else if (NWSMinTemp > 35 && NWSMinTemp <= 45 )  
              {
               gauge.modify($('NWSGauge'), {values:[0.35,0.10,1]});
                document.getElementById('NWSMinTempLabel').style.color = "#FF0000";
                document.getElementById('NWSMinTempLabel').style.fontWeight= "bolder";
              }
              else if (NWSMinTemp > 45 && NWSMinTemp <= 50 )  
              {
               gauge.modify($('NWSGauge'), {values:[0.35,0.10,0.10,1]});
                document.getElementById('NWSMinTempLabel').style.color = "#FF0000";
                document.getElementById('NWSMinTempLabel').style.fontWeight= "bolder";
              }
              else if (NWSMinTemp > 50  && NWSMinTemp <60 )  
              {
               gauge.modify($('NWSGauge'), {values:[0.35,0.10,0.05,0.10,1]});
                document.getElementById('NWSMinTempLabel').style.color = "#003300";
                document.getElementById('NWSMinTempLabel').style.fontWeight= "bolder";
              }
              else if (NWSMinTemp >= 60  && NWSMinTemp <70 )  
              {
               gauge.modify($('NWSGauge'), {values:[0.35,0.10,0.05,0.10,0.10,1]});
                document.getElementById('NWSMinTempLabel').style.color = "#003300";
                document.getElementById('NWSMinTempLabel').style.fontWeight= "bolder";
              }
              else if (NWSMinTemp >= 70 )  
              {
               gauge.modify($('NWSGauge'), {values:[0.35,0.10,0.05,0.10,0.10,0.3,1]});
                document.getElementById('NWSMinTempLabel').style.color = "#003300";
                document.getElementById('NWSMinTempLabel').style.fontWeight= "bolder";
              }
             else
             gauge.modify($('NWSGauge'), {values:[0,122.5]});
             
             if (MesoTemp > 1 && MesoTemp <= 20 )  
              {
                $j("#MesoTempLabel").text(MesoTemp + "°F");
               gauge.modify($('MesoGauge'), {values:[0.20,1]});
                document.getElementById('MesoTempLabel').style.color = "#FF0000";
              document.getElementById('MesoTempLabel').style.fontWeight= "bolder";

              }
               else if (MesoTemp == 1 )  
              {
               gauge.modify($('MesoGauge'), {values:[0.10,1]});
                $j("#MesoTempLabel").text("N/A");
               document.getElementById('MesoTempLabel').style.color = "#FF0000";
               document.getElementById('MesoTempLabel').style.fontWeight= "bolder";

              }
              else if (MesoTemp > 20 && MesoTemp <= 40 )  
              {
                $j("#MesoTempLabel").text(MesoTemp + "°F");
               gauge.modify($('MesoGauge'), {values:[0.20,0.20,1]});
                document.getElementById('MesoTempLabel').style.color = "#FF0000";
                document.getElementById('MesoTempLabel').style.fontWeight= "bolder";

              }
              else if (MesoTemp > 40 && MesoTemp <= 60 )  
              {
                $j("#MesoTempLabel").text(MesoTemp + "°F");
               gauge.modify($('MesoGauge'), {values:[0.20,0.20,0.20,1]});
                document.getElementById('MesoTempLabel').style.color = "#FF0000";
                document.getElementById('MesoTempLabel').style.fontWeight= "bolder";

              }
              else if (MesoTemp > 60  && MesoTemp < 65 )  
              {
                $j("#MesoTempLabel").text(MesoTemp + "°F");
               gauge.modify($('MesoGauge'), {values:[0.20,0.20,0.20,0.10,1]});
               document.getElementById('MesoTempLabel').style.color = "#FF0000";
               document.getElementById('MesoTempLabel').style.fontWeight= "bolder";

              }
              else if (MesoTemp >= 65  && MesoTemp < 68 )  
              {
                $j("#MesoTempLabel").text(MesoTemp + "°F");
               gauge.modify($('MesoGauge'), {values:[0.20,0.20,0.20,0.10,0.10,1]});
               document.getElementById('MesoTempLabel').style.color = "#999900";
               document.getElementById('MesoTempLabel').style.fontWeight= "bolder";

              }
              else if (MesoTemp >= 68 )  
              {
               $j("#MesoTempLabel").text(MesoTemp + "°F");
               gauge.modify($('MesoGauge'), {values:[0.20,0.20,0.20,0.10,0.10,0.18,0.141]});
               document.getElementById('MesoTempLabel').style.color = "#003300";
               document.getElementById('MesoTempLabel').style.fontWeight= "bolder";

              }
             else
             gauge.modify($('MesoGauge'), {values:[0,122.5]});

             if (DD605DayV <= 10 )  
              {
              gauge.modify($('DD60Gauge'), {values:[0.10,1]});
              document.getElementById('DD605DayVLabel').style.color = "#FF0000";
              document.getElementById('DD605DayVLabel').style.fontWeight= "bolder";

              }
              else if (DD605DayV > 10 && DD605DayV <= 15 )  
              {
               gauge.modify($('DD60Gauge'), {values:[0.20,0.20,1]});
               document.getElementById('DD605DayVLabel').style.color = "#FF3300";
               document.getElementById('DD605DayVLabel').style.fontWeight= "bolder";

              }
              else if (DD605DayV > 15 && DD605DayV <= 25 )  
              {
               gauge.modify($('DD60Gauge'), {values:[0.20,0.20,0.20,1]});
               document.getElementById('DD605DayVLabel').style.color = "#FF6633";
               document.getElementById('DD605DayVLabel').style.fontWeight= "bolder";

              }
              else if (DD605DayV > 25  && DD605DayV <= 50 )  
              {
               gauge.modify($('DD60Gauge'), {values:[0.20,0.20,0.20,0.20,1]});
               document.getElementById('DD605DayVLabel').style.color = "#33CC33";
               document.getElementById('DD605DayVLabel').style.fontWeight= "bolder";

              }
              else if (DD605DayV > 50 )  
              {
               gauge.modify($('DD60Gauge'), {values:[0.20,0.20,0.20,0.20,0.20,0.20]});
               document.getElementById('DD605DayVLabel').style.color = "#003300";
               document.getElementById('DD605DayVLabel').style.fontWeight= "bolder";

              }
             else
             gauge.modify($('DD60Gauge'), {values:[0,122.5]});

 if (FinalRank = "Planting Not Recommended due to Soil Temp at 2in depth below 68F at mid morning")
          	{
          		$j("#FinalRankLabel").text("Planting Not Recommended due to Soil Temp at 2in depth below 68°F at mid morning.");
          	}
          else if (FinalRank = "Planting Not Recommended due to Min air temp forecast for next 5 days is 50F or below")
          	{
          		$j("#FinalRankLabel").text("Planting Not Recommended due to Min air temp forecast for next 5 days is 50°F or below.");
          	}
          else		
				 $j("#FinalRankLabel").text(FinalRank);
          
     	
             
            
     $j("#NWSMinTempLabel").text(NWSMinTemp + "°F") ;

     $j("#DD605DayVLabel").text(DD605DayV + "HU");
  
     $j("#DispDateLabel").text(DispDate);


        $j.mobile.changePage("#popup");
       
$j.mobile.hidePageLoadingMsg();  
        }
}
	    );
    map.addControl(info);
      
        info.activate();
          map.addControl(control);
         

           control.activate();
        

    

  

};
    
    //------------------USER SOIL TEMP----------------------------------------------------
function Calculate() {
var SoilTemp =  document.getElementById('soiltemp').value
$j("#MesoTempLabel").text(SoilTemp + "°F");


if (SoilTemp <= 20 )  
              {
               gauge.modify($('MesoGauge'), {values:[0.20,1]});
               document.getElementById('MesoTempLabel').style.color = "#FF0000";
               document.getElementById('MesoTempLabel').style.fontWeight= "bolder";

              }
              else if (SoilTemp > 20 && SoilTemp <= 40 )  
              {
               gauge.modify($('MesoGauge'), {values:[0.20,0.20,1]});
                document.getElementById('MesoTempLabel').style.color = "#FF0000";
                document.getElementById('MesoTempLabel').style.fontWeight= "bolder";

              }
              else if (SoilTemp > 40 && SoilTemp <= 60 )  
              {
               gauge.modify($('MesoGauge'), {values:[0.20,0.20,0.20,1]});
               document.getElementById('MesoTempLabel').style.color = "#FF0000";
                document.getElementById('MesoTempLabel').style.fontWeight= "bolder";

              }
              else if (SoilTemp > 60  && SoilTemp < 65 )  
              {
               gauge.modify($('MesoGauge'), {values:[0.20,0.20,0.20,0.10,1]});
               document.getElementById('MesoTempLabel').style.color = "#FF0000";
               document.getElementById('MesoTempLabel').style.fontWeight= "bolder";

              }
              else if (SoilTemp >= 65  && SoilTemp < 68 )  
              {
               gauge.modify($('MesoGauge'), {values:[0.20,0.20,0.20,0.10,0.10,1]});
                 document.getElementById('MesoTempLabel').style.color = "#999900";
               document.getElementById('MesoTempLabel').style.fontWeight= "bolder";

              }
              else if (SoilTemp >= 68 )  
              {
               gauge.modify($('MesoGauge'), {values:[0.20,0.20,0.20,0.10,0.10,0.18,0.141]});
                 document.getElementById('MesoTempLabel').style.color = "#003300";
               document.getElementById('MesoTempLabel').style.fontWeight= "bolder";

              }
             else
             gauge.modify($('MesoGauge'), {values:[0,122.5]});


var OverallForecast;
var SoilTempRank;
 if (SoilTemp >= 68 && SoilTemp <= 100)
        { 
        if (AirCondition == "Planting NOT recommended due to min air temp forecast for next 5 days is 50 F or below")
          	{
          	  $j("#FinalRankLabel").text("Planting Not Recommended due to Min air temp forecast for next 5 days is 50°F or below.");
          	}
          else		
			$j("#FinalRankLabel").text(AirCondition);

   
         
		 SoilTempRank = "Yes"
		
        }
	else if (SoilTemp <=68 && SoilTemp>= 32)
	{
	   $j("#FinalRankLabel").text("Planting NOT recommended due to soil temp at 2 in depth below 68°F at mid morning");
	   SoilTempRank = "No"

	   }
	 else if(isNaN(SoilTemp)) 
	{
	   
	   $j("#FinalRankLabel").text("Not Enough Data");
	   SoilTempRank = "##"

	 
	   }
	    else if(SoilTemp >= 101 || SoilTemp <= 32 ) 
	    {
	    
	   $j("#FinalRankLabel").text("Invalid Soil Temp");
	   SoilTempRank = "##"

	   
	   	}

 	else
	OverallForecast= AirCondition;
	}
          
          