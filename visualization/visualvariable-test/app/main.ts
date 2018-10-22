import EsriMap = require("esri/Map");
import MapView = require("esri/views/MapView");
import Legend = require("esri/widgets/Legend");
import FeatureLayer = require("esri/layers/FeatureLayer");
import PopupTemplate = require("esri/PopupTemplate");
import { SimpleRenderer } from "esri/renderers";
import ColorVariable = require("esri/renderers/visualVariables/ColorVariable");
import SizeVariable = require("esri/renderers/visualVariables/SizeVariable");
import { SimpleFillSymbol, SimpleMarkerSymbol } from "esri/symbols";

( async () => {

  const defaultSym = new SimpleMarkerSymbol({
    color: [0,0,0,0],
    outline: {
      color: "gray",
      width: 0.5
    }
  });

  const defExp = ["STATE = 'LA'", "STATE = 'AL'", "STATE = 'AR'",
    "STATE = 'MS'", "STATE = 'TN'", "STATE = 'GA'",
    "STATE = 'FL'", "STATE = 'SC'", "STATE = 'NC'",
    "STATE = 'VA'", "STATE = 'KY'", "STATE = 'WV'"
  ];

  const renderer = new SimpleRenderer({
    symbol: defaultSym,
    label: "% population in poverty by county",
    visualVariables: [ new SizeVariable({
      field: "POP_POVERTY",
      normalizationField: "TOTPOP_CY",
      stops: [
      {
        value: 0.1,
        size: 2,
        label: "<10%"
      },
      {
        value: 0.3,
        size: 20,
        label: ">30%"
      }]
    }) ]
  });

  const povLayer = new FeatureLayer({
    url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/counties_politics_poverty/FeatureServer/0",
    renderer: renderer,
    outFields: ["*"],
    popupTemplate: new PopupTemplate({
      title: "{COUNTY}, {STATE}",
      content: "{POP_POVERTY} of {TOTPOP_CY} people live below the poverty line.",
      fieldInfos: [
      {
        fieldName: "POP_POVERTY",
        format: {
          digitSeparator: true,
          places: 0
        }
      }, {
        fieldName: "TOTPOP_CY",
        format: {
          digitSeparator: true,
          places: 0
        }
      }]
    }),
    definitionExpression: defExp.join(" OR ")
  });

  const map = new EsriMap({
    basemap: "gray",
    layers: [povLayer]
  });

  const view = new MapView({
    container: "viewDiv",
    map: map,
    center: [-85.050200, 33.125524],
    zoom: 6
  });

  /******************************************************************
   *
   * Add layers to layerInfos on the legend
   *
   ******************************************************************/

  const legend = new Legend({
    view: view,
    layerInfos: [
    {
      layer: povLayer,
      title: "Poverty in the southeast U.S."
    }]
  });

  view.ui.add(legend, "top-right");

})();