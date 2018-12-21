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
    basemap: {
      portalItem: {
        id: "3582b744bba84668b52a16b0b6942544"
      }
    }
  });
  
  const view = new MapView({
    map: map,
    container: "viewDiv",
    center: [ -95, 39.5 ],
    zoom: 4
  });
  view.ui.add(new Legend({ view }), "top-right");

  await view.when();

  const arcadeExpression = await getArcade();

  const layer = new FeatureLayer({
    title: "U.S. Corn harvest (2007)",
    url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/US_county_crops_2007_clean/FeatureServer/0",
    outFields: [ "COUNTY", "STATE", "FIPS" ], 
    popupTemplate: new PopupTemplate({
      title: "{COUNTY}, {STATE}",
      content: "{expression/per-corn-area}% of harvested acres is corn.",
      expressionInfos: [{
        expression: arcadeExpression,
        name: "per-corn-area",
        title: "% corn harvested"
      }]
    }),
    renderer: new SimpleRenderer({
      symbol: new SimpleFillSymbol({
        color: "gray",
        outline: new SimpleLineSymbol({
          color: [128,128,128,0.2],
          width: 0
        })
      }),
      label: "County",
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
