import esri = __esri;

import EsriMap = require("esri/Map");
import SceneView = require("esri/views/SceneView");
import SceneLayer = require("esri/layers/SceneLayer");
import Legend = require("esri/widgets/Legend");

import relationshipRendererCreator = require("esri/renderers/smartMapping/creators/relationship");
import { UniqueValueRenderer } from "esri/renderers";
import { FillSymbol3DLayer, MeshSymbol3D } from "esri/symbols";

(async() => {

  const layer = new SceneLayer({
    portalItem: {
      id: "16111531d25348c6b03f6b743e1874f1"
    },
    title: "Energy use in Manhattan"
  });

  const map = new EsriMap({
    basemap: "gray",
    ground: "world-elevation",
    layers: [ layer ]
  });

  const view = new SceneView({
    container: "viewDiv",
    map: map,
    camera: {
      position: {
        spatialReference: {
          wkid: 3857
        },
        x: -8240095,
        y: 4968039,
        z: 398
      },
      heading: 35,
      tilt: 77
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

  const legend = new Legend({
    view: view,
    container: "legendDiv"
  });
  view.ui.add("infoDiv", "bottom-left");

  await view.when();

  const showDescriptiveLabelsElement = document.getElementById("descriptive-labels") as HTMLInputElement;
  showDescriptiveLabelsElement.addEventListener("change", function(){
    const oldRenderer = layer.renderer as UniqueValueRenderer;
    const newRenderer = oldRenderer.clone();
    layer.renderer = changeRendererLabels(newRenderer, showDescriptiveLabelsElement.checked);
  });

  const rendererResponse = await createRelationshipRenderer();
  applyRenderer(rendererResponse);

  async function createRelationshipRenderer(){

    const params = {
      layer: layer,
      view: view,
      basemap: map.basemap,
      field1: {
        field: "StarScore"
      },
      field2: {
        field: "ElectricUse"
      },
      focus: "HH",
      numClasses: 2,
      edgesType: "solid"
    };

    return relationshipRendererCreator.createRenderer(params);
  }

  function applyRenderer(response: esri.relationshipRendererResult){

    const renderer = response.renderer;
    
    const uniqueValueInfos = response.renderer.uniqueValueInfos.map(function(info){
      switch (info.value) {
        case "HH": 
          info.label = "High energy score, High electric use";
          break;
        case "HL":
          info.label = "High energy score, Low electric use";
          break;
        case "LH":
          info.label = "Low energy score, High electric use";
          break;
        case "LL":
          info.label = "Low energy score, Low electric use";
          break;
      }
      return info;
    });
    renderer.uniqueValueInfos = uniqueValueInfos;
    renderer.defaultSymbol = new MeshSymbol3D({
      symbolLayers: [ new FillSymbol3DLayer({
        material: {
          color: [ 128, 128, 128, 0.4 ]
        },
        edges: {
          type: "solid",
          color: [ 50, 50, 50 ]
        }
      }) ]
    });
    renderer.defaultLabel = "No energy score";
    layer.renderer = renderer;
  }

  /**
  * Changes the labels and orientation of the relationship legend.
  *
  * @param {module:esri/renderers/UniqueValueRenderer} renderer - An instance of a relationship renderer.
  * @param {boolean} showDescriptiveLabels - Indicates whether to orient the legend as a diamond and display
  *   descriptive labels. If `false`, then the legend is oriented as a square with numeric labels, similar to
  *   a chart with an x/y axis.
  *
  * @return {renderer} - The input renderer with the modified descriptions and orientation.
  */
  function changeRendererLabels(renderer: UniqueValueRenderer, showDescriptiveLabels: boolean): UniqueValueRenderer {

    const numClasses = renderer.authoringInfo.numClasses;
    const field1max = renderer.authoringInfo.field1.classBreakInfos[ numClasses-1 ].maxValue;
    const field2max = renderer.authoringInfo.field2.classBreakInfos[ numClasses-1 ].maxValue;

    renderer.uniqueValueInfos.forEach(function(info: esri.UniqueValueInfo){
      switch (info.value) {
        case "HH":
          info.label = showDescriptiveLabels ? "High energy score, High electric use" : "";
          break;
        case "HL":
          info.label = showDescriptiveLabels ? "High energy score, Low electric use" : field1max.toLocaleString();
          break;
        case "LH":
          info.label = showDescriptiveLabels ? "Low energy score, High electric use" : field2max.toLocaleString();
          break;
        case "LL":
          info.label = showDescriptiveLabels ? "Low energy score, Low electric use" : "0";
          break;
      }
    });

    // When a focus is specified, the legend renders as a diamond with the
    // indicated focus value on the top. If no value is specified, then
    // the legend renders as a square

    renderer.authoringInfo.focus = showDescriptiveLabels ? "HH" : null;
    return renderer;
  }

})();
