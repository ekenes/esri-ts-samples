import esri = __esri;

import EsriMap = require("esri/Map");
import SceneView = require("esri/views/SceneView");
import FeatureLayer = require("esri/layers/FeatureLayer");
import Legend = require("esri/widgets/Legend");

import relationshipSchemes = require("esri/renderers/smartMapping/symbology/relationship");
import relationshipRendererCreator = require("esri/renderers/smartMapping/creators/relationship");
import { PointSymbol3D, ObjectSymbol3DLayer, SimpleMarkerSymbol, WebStyleSymbol } from "esri/symbols";

(async () => {

  const layer = new FeatureLayer({
    url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/Landscape_Trees/FeatureServer/0",
    popupTemplate: { // autocasts as new PopupTemplate()
      title: "{Cmn_Name}",
      content: "<i>{Sci_Name}</i><br>" +
        "This tree is in {Condition} condition and is {Height} feet in height."
    }
  });

  const map = new EsriMap({
    basemap: "osm",
    ground: "world-elevation",
    layers: [ layer ]
  });

  const view = new SceneView({
    container: "viewDiv",
    map: map,
    camera: {
      position: {
        x: -9177356,
        y: 4246783,
        z: 723,
        spatialReference: {
          wkid: 3857
        }
      },
      heading: 0,
      tilt: 83
    },
    highlightOptions: {
      color: "#ff23d3"
    },
    // Set dock options on the view's popup
    popup: {
      dockEnabled: true,
      dockOptions: {
        breakpoint: false
      }
    },
    // enable shadows to be cast from the features
    environment: {
      lighting: {
        directShadowsEnabled: true
      }
    }
  });

  view.ui.add("panelDiv", "top-right");

  const legend = new Legend({
    view: view
  });
  view.ui.add(legend, "bottom-left");

  await view.when();
  await layer.when();
  createSelectElements(layer);

  const relationshipResponse = await createRelationshipRenderer();
  applyRenderer(relationshipResponse);

  let field1Select: HTMLSelectElement;
  let field2Select: HTMLSelectElement;

  /**
   * Creates a relationship renderer
   */
  async function createRelationshipRenderer() {

    const schemes = relationshipSchemes.getSchemes({
      basemap: map.basemap,
      geometryType: layer.geometryType
    });

    const params = {
      relationshipScheme: schemes.secondarySchemes[8],
      layer: layer,
      view: view,
      basemap: map.basemap,
      field1: {
        field: field1Select.value
      },
      field2: {
        field: field2Select.value
      },
      numClasses: 4
    };

    return relationshipRendererCreator.createRenderer(params);
  }

  function applyRenderer(response: esri.relationshipRendererResult){

    var renderer = response.renderer;
    
    var uniqueValueInfos = response.renderer.uniqueValueInfos.map(function(info){
      const oldSymbol = info.symbol;
      const newSymbol = oldSymbol as SimpleMarkerSymbol;
      info.symbol = create3DObjectSymbol(newSymbol.color.clone());
      switch (info.value) {
        case "HH": 
          info.label = "High " + field1Select.value + ", High " + field2Select.value;
          break;
        case "HL":
          info.label = "High " + field1Select.value + ", Low " + field2Select.value;
          break;
        case "LH":
          info.label = "Low " + field1Select.value + ", High " + field2Select.value;
          break;
        case "LL":
          info.label = "Low " + field1Select.value + ", Low " + field2Select.value;
          break;
      }
      return info;
    });

    renderer.defaultSymbol = new WebStyleSymbol({
      styleName: "esriRealisticTreesStyle",
      name: "Other"
    });
    renderer.defaultLabel = "Tree";
    renderer.uniqueValueInfos = uniqueValueInfos;
    renderer.visualVariables = [{
      type: "size",
      axis: "height",
      field: "Height", // tree height
      valueUnit: "feet"
    }, {
      type: "size",
      axis: "width",
      field: "Width_EW", // crown diameter from east to west
      valueUnit: "feet"
    }, {
      type: "size",
      axis: "depth",
      field: "Width_NS", // crown diameter from north to south
      valueUnit: "feet"
    }];

    layer.renderer = renderer;
  }

  function create3DObjectSymbol (color: esri.Color): PointSymbol3D {
    return new PointSymbol3D({
      symbolLayers: [ new ObjectSymbol3DLayer({
        resource: {
          href: "https://static.arcgis.com/arcgis/styleItems/RealisticTrees/web/resource/Other.json"
        },
        material: {
          color: color
        }
      })]
    })
  }

  function createSelectElements(layer: FeatureLayer) {
    const panel = document.getElementById("panelDiv");
    field1Select = document.createElement("select");
    panel.appendChild(field1Select);

    layer.fields.filter(function(field){
      const validTypes = [ "integer", "double" ];
      return validTypes.indexOf(field.type) > -1 && field.name !== "Tree_ID";
    }).forEach(function(field, i){
      const option = document.createElement("option");
      option.value = field.name;
      option.text = field.alias;
      field1Select.appendChild(option);
    });
    field2Select = field1Select.cloneNode(true) as HTMLSelectElement;
    field1Select.options[18].selected = true;
    field2Select.options[8].selected = true;
    panel.appendChild(field2Select);

    field1Select.classList.add("esri-widget");
    field2Select.classList.add("esri-widget");

    field1Select.addEventListener("change", selectListener);
    field2Select.addEventListener("change", selectListener);
  }

  async function selectListener(){
    const relationshipResponse = await createRelationshipRenderer();
    applyRenderer(relationshipResponse);
  }

})();