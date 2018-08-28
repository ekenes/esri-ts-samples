import esri = __esri;

import EsriMap = require("esri/Map");
import MapView = require("esri/views/MapView");
import LayerList = require("esri/widgets/LayerList");

import MapImageLayer = require("esri/layers/MapImageLayer");
import colorRendererCreator = require("esri/renderers/smartMapping/creators/color");

(async () => {

  const map = new EsriMap({
    basemap: "hybrid"
  });

  const view = new MapView({
    map: map,
    container: "viewDiv",
    zoom: 5,
    center: [-101.088, 40.969]
  });

  const ancestrySelect = document.getElementById("ancestry-select") as HTMLSelectElement;
  const classSelect = document.getElementById("classification-select") as HTMLSelectElement;

  // Set LayerList with two content elements in the same panel
  // 1. A div element containing the select elements for data exploration
  // 2. a legend instance
  const layerList = new LayerList({
    view: view,
    listItemCreatedFunction: function (event) {
      const item = event.item;
      item.panel = {
        content: [ document.getElementById("infoDiv"), "legend" ],
        open: true
      };
    }
  });
  view.ui.add(layerList, "top-right");

  /*****************************************************************
  * Create a MapImageLayer instance pointing to a Map Service
  * containing US state boundary geometries. A sublayer is added to
  * the layer with a dynamic data layer source. The dynamic layer
  * is created by joining a table with ancestry attributes to an
  * existing map service layer with geometries (states).
  *
  * The data exist in a registered workspace in the map service.
  *****************************************************************/

  const layer = new MapImageLayer({
    url: "https://sampleserver6.arcgisonline.com/arcgis/rest/services/AGP/Census/MapServer",
    title: "United States Population",
    listMode: "hide-children",
    sublayers: [{
      title: "% population with selected ancestry",
      id: 0,
      opacity: 0.75,
      source: {
        type: "data-layer",
        dataSource: {
          type: "join-table",
          leftTableSource: {
            type: "map-layer",
            mapLayerId: 3
          },
          rightTableSource: {
            type: "data-layer",
            dataSource: {
              type: "table",
              workspaceId: "CensusFileGDBWorkspaceID",
              dataSourceName: "ancestry"
            }
          },
          leftTableKey: "STATE_NAME",
          rightTableKey: "State",
          joinType: "left-outer-join"
        }
      }
    }] as esri.Sublayer[]
  });

  // Get the sublayer to explore
  const ancestrySublayer = layer.sublayers.find(function(sublayer: esri.Sublayer) {
    return sublayer.title === "% population with selected ancestry";
  });

  // The feature layer equivalent of the sublayer will be used
  // for generating the renderer for the sublayer and constructing
  // the select containing various ancestry categories
  const ancestryFeatureLayer = ancestrySublayer.createFeatureLayer();

  // Populate one of the select elements with options for exploring
  // different ancestry types.
  await ancestryFeatureLayer.load();

  ancestryFeatureLayer.fields.filter(function(field){
    return field.name.slice(0,8) === "ancestry"
      && field.name.indexOf("OBJECTID") === -1
      && field.name.indexOf("State") === -1;
  }).forEach(function(field){
    const option = document.createElement("option");
    option.value = field.name;
    option.text = field.name.slice(9, 30);
    ancestrySelect.appendChild(option);
  });

  createRenderer();
  ancestrySelect.addEventListener("change", createRenderer);
  classSelect.addEventListener("change", createRenderer);


  // Generates a renderer using the feature layer and
  // sets the renderer on the sublayer instance
  async function createRenderer(){
    const params = {
      // set FeatureLayer as input
      layer: ancestryFeatureLayer,
      basemap: map.basemap,
      // Arcade is used to normalize and round the data
      valueExpression: `Round( ( $feature['${ancestrySelect.value}'] / $feature['states.POP2007'] ) * 100, 1);`,
      view: view,  // required with valueExpression
      classificationMethod: classSelect.value
    };

    const response = await colorRendererCreator.createClassBreaksRenderer(params);
    // set the renderer on the sublayer
    ancestrySublayer.renderer = response.renderer;
    const selectedAncestry = ancestrySelect.options[ancestrySelect.selectedIndex].text;

    if (!map.layers.includes(layer)) {
      map.add(layer);
    }

    // Update the popupTemplate to display data from the selected field
    ancestrySublayer.popupTemplate = {
      title: "{states.STATE_NAME}",
      content: `{ancestry.${selectedAncestry}} of the {states.POP2007} people 
        in {states.STATE_NAME} have ${selectedAncestry} ancestry.`,
      expressionInfos: [{
        name: "per_ancestry",
        expression: response.renderer.valueExpression
      }],
      fieldInfos: [{
        fieldName: "states.POP2007",
        format: {
          digitSeparator: true,
          places: 0
        }
      }, {
        fieldName: `ancestry.${selectedAncestry}`,
        format: {
          digitSeparator: true,
          places: 0
        }
      }]
    } as esri.PopupTemplate;
  }
})();