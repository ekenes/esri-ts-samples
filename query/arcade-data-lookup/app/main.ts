import EsriMap = require("esri/Map");
import MapView = require("esri/views/MapView");
import FeatureLayer = require("esri/layers/FeatureLayer");
import PopupTemplate = require("esri/PopupTemplate");
import Legend = require("esri/widgets/Legend");
import { getArcade } from "./arcadeUtils";
import { SimpleRenderer } from "esri/renderers";
import { SimpleFillSymbol, SimpleLineSymbol } from "esri/symbols";

( async () => {

  const map = new EsriMap({
    basemap: "streets"
  });
  
  const view = new MapView({
    map: map,
    container: "viewDiv",
    extent: {
      spatialReference: {
        wkid: 3857
      },
      xmin: -13869322,
      ymin: 5504139,
      xmax: -12982652,
      ymax: 6541237
    }
  });
  view.ui.add(new Legend({ view }), "top-right");

  await view.when();

  const arcadeExpression = await getArcade();

  const layer = new FeatureLayer({
    
    //https://services.arcgis.com/V6ZHFr6zdgNZuVG0/ArcGIS/rest/services/us_counties_crops_256_colors/FeatureServer/0
    //https://services.arcgis.com/V6ZHFr6zdgNZuVG0/ArcGIS/rest/services/Washington_block_groups/FeatureServer/1
    url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/ArcGIS/rest/services/us_counties_crops_256_colors/FeatureServer/0",
    outFields: [ "OBJECTID_1", "Shape__Area" ], 
    popupTemplate: new PopupTemplate({
      title: "{OBJECTID_1}",
      content: "{expression/per-water-area}",
      expressionInfos: [{
        expression: arcadeExpression,
        name: "per-water-area",
        title: "% corn harvested"
      }]
    }),
    renderer: new SimpleRenderer({
      symbol: new SimpleFillSymbol({
        color: "red",
        outline: new SimpleLineSymbol({
          color: [128,128,128,0.2],
          width: 0
        })
      }),
      visualVariables: [{
        type: "color",
        valueExpression: arcadeExpression,
        valueExpressionTitle: "% Corn harvested",
        stops: [
          { value: 1, color: "#ffed85" },
          { value: 70, color: "#910000" }
        ]
      }, {
        type: "opacity",
        valueExpression: arcadeExpression,
        valueExpressionTitle: "% Corn harvested",
        legendOptions: {
          showLegend: false
        },
        stops: [
          { value: 1, opacity: 0.05 },
          { value: 30, opacity: 0.95 }
        ]
      }]
    })
  });

  map.add(layer);

})();
