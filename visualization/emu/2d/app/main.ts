import esri = __esri;
import EsriMap = require("esri/Map");
import MapView = require("esri/views/MapView");
import FeatureLayer = require("esri/layers/FeatureLayer");

( async () => {

  const url = "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/ArcGIS/rest/services/EMU_master_3857_2/FeatureServer/0";

  const layer = new FeatureLayer({
    url
  });
  const map = new EsriMap({
    basemap: "dark-gray-vector",
    layers: [ layer ]
  });

  const view = new MapView({
    map: map,
    container: "viewDiv",
    extent: {
      "spatialReference": {
        "wkid": 3857
      },
      "xmin": -32607543,
      "ymin": -148400,
      "xmax": -31196210,
      "ymax": 952292
    }
  });

})();