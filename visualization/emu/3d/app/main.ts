import esri = __esri;
import EsriMap = require("esri/Map");
import SceneView = require("esri/views/SceneView");
import FeatureLayer = require("esri/layers/FeatureLayer");
import { Extent } from "esri/geometry";

import { createBathymetryLayer } from "../app/ExaggeratedBathymetryLayer";
import { createDepthRulerLayer } from "./depthUtils";
import { generateContinuousVisualization, setEMUClusterVisualization, generateRelationshipVisualization, getSymbolType } from "./rendererUtils";

import Home = require("esri/widgets/Home");
import BasemapToggle = require("esri/widgets/BasemapToggle");
import Legend = require("esri/widgets/Legend");
import LayerList = require("esri/widgets/LayerList");
import Expand = require("esri/widgets/Expand");
import Slice = require("esri/widgets/Slice");
import { destroyColorSlider } from "./colorSliderUtils";
import { SimpleRenderer, ClassBreaksRenderer, UniqueValueRenderer } from "esri/renderers";

( async () => {

  const colorField1Select = document.getElementById("color-field1-select") as HTMLSelectElement;
  const colorField2Select = document.getElementById("color-field2-select") as HTMLSelectElement;
  const emuFilter = document.getElementById("emu-filter") as HTMLInputElement;
  const displayMean = document.getElementById("display-mean");
  const displayVariable = document.getElementById("display-variable");
  const displayUnit = document.getElementById("display-unit");
  const exaggeration = 100;
  let changeSymbolType: "object" | "icon";

  const studyArea = new Extent({
    spatialReference: {
      wkid: 3857
    },
    xmin: 7834109,
    ymin: -69576,
    xmax: 8502026,
    ymax: 907517
  });

  const depth = -4000 * exaggeration;

  const bathymetryLayer = createBathymetryLayer(exaggeration);

  const map = new EsriMap({
    basemap: "satellite",
    ground: {
      layers: [
        bathymetryLayer
      ]
    }
  });

  const view = new SceneView({
    container: "viewDiv",
    viewingMode: "local",
    map: map,
    padding: {
      top: 40
    },
    popup: {
      dockEnabled: true,
      dockOptions: {
        breakpoint: false,
        position: "top-right"
      }
    },
    camera: {
      position: {
        spatialReference: {
          wkid: 102100
        },
        x: 9040444,
        y: -837938,
        z: 247393
      },
      heading: 325,
      tilt: 79
    },
    clippingArea: studyArea,
    // Allows for navigating the camera below the surface
    constraints: {
      collision: {
        enabled: false
      },
      tilt: {
        max: 179.99
      }
    },
    // Turns off atmosphere and stars settings
    environment: {
      atmosphere: null,
      starsEnabled: false
    }
  });

  // Create SceneLayer and add to the map
  const layer = new FeatureLayer({
    title: "EMU data points",
    url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/ArcGIS/rest/services/EMU_master_3857_2/FeatureServer/0",
    popupTemplate: {
      title: "{NameEMU}",
      content: [{
        type: "fields",
        fieldInfos: [{
          fieldName: "temp",
          label: "Temperature (F)"
        }, {
          fieldName: "salinity",
          label: "Salinity"
        }, {
          fieldName: "appO2ut",
          label: "Apparent Oxygen"
        }, {
          fieldName: "dissO2",
          label: "Dissolved Oxygen"
        }, {
          fieldName: "nitrate",
          label: "Nitrate"
        }, {
          fieldName: "percO2sat",
          label: "% Saturated Oxygen"
        }, {
          fieldName: "phosphate",
          label: "Phosphate"
        }, {
          fieldName: "silicate",
          label: "Silicate"
        }, {
          fieldName: "Cluster37",
          label: "EMU Cluster"
        }, {
          fieldName: "ChlorA_12yrAvg",
          label: "Chlor A (12 yr avg)"
        }, {
          fieldName: "expression/depth",
          label: "Depth profile"
        }]
      }],
      expressionInfos: [{
        name: "depth",
        title: "Depth",
        expression: `Text(Abs($feature.UnitTop), '#,###') + 'm - ' + Text(Abs($feature.UnitBottom), '#,###') + 'm'`
      }]
    },
    // outFields: ["*"],
    screenSizePerspectiveEnabled: false,
    elevationInfo: {
      mode: "absolute-height",
      featureExpressionInfo: {
        expression: `$feature.UnitTop * ${exaggeration}`
      },
      unit: "meters"
    }
  });
  map.add(layer);

  await view.when();

  const depthRuler = createDepthRulerLayer(view, studyArea, depth, exaggeration);
  map.add(depthRuler);
    
  await layer.when();

  const layerView = await view.whenLayerView(layer) as esri.FeatureLayerView;
  layerView.maximumNumberOfFeatures = 100000;

  generateContinuousVisualization({
    view,
    layer,
    exaggeration,
    field: colorField1Select.value
  });

  emuFilter.addEventListener("change", filterChange);

  function filterChange (){
    const emuExpression = emuFilter.value;
    

    const expression = `${emuExpression}`;
    layer.definitionExpression = expression;
  }

  ///////////////////////////////////////
  //
  // Widgets
  //
  //////////////////////////////////////

  // Display mean

  view.ui.add(displayMean, "top-right");

  // Home

  view.ui.add(new Home({
    view
  }), "top-left");

  // BasemapToggle

  view.ui.add(new BasemapToggle({
    view,
    nextBasemap: "oceans"
  }), "bottom-right");

  // LayerList

  const layerList = new LayerList({
    view,
    container: document.createElement("div"),
    listItemCreatedFunction: event => {
      const item = event.item;
      if(item.title === layer.title){
        item.actionsSections = [[{
          title: "Toggle 3D cylinders",
          className: "esri-icon-public",
          id: "toggle-3d-cylinders"
        }]];
      }

    }
  });
  layerList.on("trigger-action", event => {
    if(event.action.id === "toggle-3d-cylinders"){
      const symbolType = getSymbolType(layer.renderer as SimpleRenderer | ClassBreaksRenderer | UniqueValueRenderer);
      changeSymbolType = symbolType === "object" ? "icon" : "object"
      changeEventListener();
    }
  });

  const layerListExpand = new Expand({
    view,
    content: layerList.container,
    expandIconClass: "esri-icon-layer-list",
    group: "top-left"
  });
  view.ui.add(layerListExpand, "top-left");

  // Legend

  const legend = new Legend({
    view,
    container: document.createElement("div"),
    layerInfos: [{ layer }]
  });

  const legendExpand = new Expand({
    view,
    content: legend.container,
    expandIconClass: "esri-icon-key",
    group: "top-left"
  });
  view.ui.add(legendExpand, "top-left");

  // Color Slider

  const colorSliderExpand = new Expand({
    view,
    content: document.getElementById("color-container"),
    expandIconClass: "esri-icon-chart",
    group: "top-left"
  });
  view.ui.add(colorSliderExpand, "top-left");

  // Filters

  const filtersExpand = new Expand({
    view,
    content: document.getElementById("filter-container"),
    expandIconClass: "esri-icon-filter",
    group: "top-left"
  });
  view.ui.add(filtersExpand, "top-left");

  // Slice

  const sliceExpand = new Expand({
    view,
    expandIconClass: "esri-icon-filter",
    group: "top-left"
  });
  view.ui.add(sliceExpand, "top-left");
  let sliceWidget: Slice;

  sliceExpand.watch("expanded", (expanded) => {
    if(expanded){
      sliceWidget = new Slice({ view });
      sliceExpand.content = sliceWidget;
    } else {
      sliceWidget.destroy();
    }
  });

  colorField1Select.addEventListener("change", changeEventListener);
  colorField2Select.addEventListener("change", changeEventListener);

  function changeEventListener(){
    if(colorField1Select.value === "Cluster37"){
      colorField2Select.disabled = true;
      destroyColorSlider();
      setEMUClusterVisualization(layer, exaggeration, changeSymbolType);
    } else {
      if(colorField2Select.value === ""){
        colorField2Select.disabled = false;
        displayMean.style.visibility = "hidden";
        displayVariable.innerHTML = colorField1Select.selectedOptions[0].text;

        if(colorField1Select.value === "salinity"){
          displayUnit.innerHTML = "";
        } else {
          displayUnit.innerHTML = colorField1Select.value === "temp" ? " °C" : " µmol/l";
        }
        
        generateContinuousVisualization({
          view,
          layer,
          exaggeration,
          field: colorField1Select.value,
          symbolType: changeSymbolType
        });
      } else {
        destroyColorSlider();
        generateRelationshipVisualization({
          layer,
          view,
          field1: {
            fieldName: colorField1Select.value,
            label: colorField1Select.selectedOptions[0].text
          }, 
          field2: {
            fieldName: colorField2Select.value,
            label: colorField2Select.selectedOptions[0].text
          },
          exaggeration,
          symbolType: changeSymbolType
        });
        
      }

    }
    changeSymbolType = null;
  }

})();