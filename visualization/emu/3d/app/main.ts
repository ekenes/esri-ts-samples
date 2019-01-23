import esri = __esri;
import EsriMap = require("esri/Map");
import SceneView = require("esri/views/SceneView");
import FeatureLayer = require("esri/layers/FeatureLayer");
import FeatureFilter = require("esri/views/layers/support/FeatureFilter");
import { Extent } from "esri/geometry";

import { createBathymetryLayer } from "../app/ExaggeratedBathymetryLayer";
import { createDepthRulerLayer } from "./depthUtils";
import { generateContinuousVisualization } from "./rendererUtils";

import Home = require("esri/widgets/Home");
import BasemapToggle = require("esri/widgets/BasemapToggle");
import Legend = require("esri/widgets/Legend");
import LayerList = require("esri/widgets/LayerList");
import Expand = require("esri/widgets/Expand");
import Slice = require("esri/widgets/Slice");

( async () => {

  const colorField1Select = document.getElementById("color-field1-select");
  const colorField2Select = document.getElementById("color-field2-select");
  const depthFilter = document.getElementById("depth-filter");
  const dataFilter = document.getElementById("data-filter");
  const emuFilter = document.getElementById("emu-filter");
  const dataFilterValue = document.getElementById("data-value");
  const displayMean = document.getElementById("display-mean");
  const displayVariable = document.getElementById("display-variable");
  const displayUnit = document.getElementById("display-unit");
  let colorSlider = null;
  const cylinderSymbolsUsed = false;
  const dataMinElem = document.getElementById("data-min");
  const dataMaxElem = document.getElementById("data-max");
  const filterCheckbox = document.getElementById("filter-data-check");
  const dataFilterContainer = document.getElementById("data-filter-container");
  let colorSlideEvent;
  const exaggeration = 100;

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

  var map = new EsriMap({
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
        expression: "Text(Abs($feature.UnitTop), '#,###') + 'm - ' + Text(Abs($feature.UnitBottom), '#,###') + 'm'"
      }]
    },
    outFields: ["*"],
    screenSizePerspectiveEnabled: false,
    elevationInfo: {
      mode: "absolute-height",
      featureExpressionInfo: {
        expression: "$feature.UnitTop" + "*" + exaggeration
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

  symbolCheck.addEventListener("click", function(){
    generateContinuousVisualization();
  })

  function filterChange (){
    var depthExpression = depthFilter.value;
    var emuExpression = emuFilter.value;
    var dataExpression = filterCheckbox.checked ? colorField1Select.value + " <= " + dataFilter.value : "1=1";

    var expression = "(" + depthExpression + ") AND (" + dataExpression + ") AND (" + emuExpression + ")";
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
    content: new Slice({ view }),
    expandIconClass: "esri-icon-search",
    group: "top-left"
  });
  view.ui.add(sliceExpand, "top-left");

  function changeEventListener(){
    if(colorField1Select.value === "Cluster37"){
      colorField2Select.disabled = true;
      destroyColorSlider();
      getEMUClusterVisualization();
    } else {
      if(colorField2Select.value === ""){
        colorField2Select.disabled = false;
        displayMean.style.visibility = /*themeOptions.value === "centered-on" ? "visible" : */"hidden";
        displayVariable.innerHTML = colorField1Select.selectedOptions[0].text;

        if(colorField1Select.value === "salinity"){
          displayUnit.innerHTML = "";
        } else {
          displayUnit.innerHTML = colorField1Select.value === "temp" ? " °C" : " µmol/l";
        }
        generateContinuousVisualization();
      } else {
        destroyColorSlider();
        generateRelationshipVisualization();
      }
    }
  }

  colorField1Select.addEventListener("change", changeEventListener);
  colorField2Select.addEventListener("change", changeEventListener);

  function getUniqueValueVisualization(){
    var symbolType = cylinderSymbolsUsed ? "object" : "icon";
    var renderer = layer.renderer.clone();
    renderer.uniqueValueInfos.forEach(function(info){
      var color = info.symbol.color ? info.symbol.color.clone() : info.symbol.symbolLayers.getItemAt(0).material.color.clone();
      info.symbol = createSymbol(color, symbolType);
    });

    if(symbolType === "object"){
      renderer.visualVariables = [{
        type: "size",
        valueExpression: "$feature.ThicknessPos" + " * " + exaggeration,
        valueUnit: "meters",
        axis: "height"
      }, {
        type: "size",
        useSymbolValue: true,
        axis: "width-and-depth"
      }];
    }

    layer.renderer = renderer;
  }

  function getEMUClusterVisualization(){

    var symbolType = cylinderSymbolsUsed ? "object" : "icon";

    var renderer = {
      type: "unique-value",
      field: "Cluster37",
      defaultSymbol: createSymbol("darkgray", symbolType),
      defaultLabel: "no classification",
      uniqueValueInfos: [{
        value: 10,
        label: "EMU 10",
        symbol: createSymbol([117,112,230], symbolType)
      }, {
        value: 13,
        label: "EMU 13",
        symbol: createSymbol([54,71,153], symbolType)
      }, {
        value: 33,
        label: "EMU 33",
        symbol: createSymbol([117,145,255], symbolType)
      }, {
        value: 24,
        label: "EMU 24",
        symbol: createSymbol([235,169,212], symbolType)
      }, {
        value: 26,
        label: "EMU 26",
        symbol: createSymbol([147,101,230], symbolType)
      }, {
        value: 18,
        label: "EMU 18",
        symbol: createSymbol([188,90,152], symbolType)
      }, {
        value: 36,
        label: "EMU 36",
        symbol: createSymbol([26,82,170], symbolType)
      }, {
        value: 14,
        label: "EMU 14",
        symbol: createSymbol([70,82,144], symbolType)
      }]
    };

    if(symbolType === "object"){
      renderer.visualVariables = [{
        type: "size",
        valueExpression: "$feature.ThicknessPos" + " * " + exaggeration,
        valueUnit: "meters",
        axis: "height"
      }, {
        type: "size",
        useSymbolValue: true,
        axis: "width-and-depth"
      }];
    }

    layer.renderer = renderer;
  }

  function destroyColorSlider(){
    if(colorSlider){
      colorSlider.destroy();
      colorSlideChangeEvent.remove();
      colorSlideSlideEvent.remove();
      colorSlider = null;
    }
  }

  

  

  function generateRelationshipVisualization(){
    const params = {
      // relationshipScheme: schemes.secondarySchemes[8],
      layer: layer,
      view: view,
      basemap: map.basemap,
      field1: {
        field: colorField1Select.value
      },
      field2: {
        field: colorField2Select.value
      },
      classificationMethod: "quantile",
      focus: "HH"
    };

    return relationshipRendererCreator.createRenderer(params)
      .then(function(response){
        var symbolType = cylinderSymbolsUsed ? "object" : "icon";
        var renderer = response.renderer;
        var uniqueValueInfos;

        if (cylinderSymbolsUsed){
          uniqueValueInfos = renderer.uniqueValueInfos.map(function(info){
            info.symbol = createSymbol(info.symbol.color.clone(), symbolType);
            switch (info.value) {
              case "HH":
                info.label = "High " + colorField1Select.selectedOptions[0].text + ", High " + colorField2Select.selectedOptions[0].text;
                break;
              case "HL":
                info.label = "High " + colorField1Select.selectedOptions[0].text + ", Low " + colorField2Select.selectedOptions[0].text;
                break;
              case "LH":
                info.label = "Low " + colorField1Select.selectedOptions[0].text + ", High " + colorField2Select.selectedOptions[0].text;
                break;
              case "LL":
                info.label = "Low " + colorField1Select.selectedOptions[0].text + ", Low " + colorField2Select.selectedOptions[0].text;
                break;
            }
            return info;
          });

          renderer.defaultSymbol = createSymbol([128,128,128], symbolType);
          renderer.visualVariables = [{
            type: "size",
            valueExpression: "$feature.ThicknessPos" + " * " + exaggeration,
            valueUnit: "meters",
            axis: "height"
          }, {
            type: "size",
            useSymbolValue: true,
            axis: "width-and-depth"
          }];
        } else {
          uniqueValueInfos = renderer.uniqueValueInfos.map(function(info){
            switch (info.value) {
              case "HH":
                info.label = "High " + colorField1Select.selectedOptions[0].text + ", High " + colorField2Select.selectedOptions[0].text;
                break;
              case "HL":
                info.label = "High " + colorField1Select.selectedOptions[0].text + ", Low " + colorField2Select.selectedOptions[0].text;
                break;
              case "LH":
                info.label = "Low " + colorField1Select.selectedOptions[0].text + ", High " + colorField2Select.selectedOptions[0].text;
                break;
              case "LL":
                info.label = "Low " + colorField1Select.selectedOptions[0].text + ", Low " + colorField2Select.selectedOptions[0].text;
                break;
            }
            return info;
          });
        }

        renderer.uniqueValueInfos = uniqueValueInfos;
        layer.renderer = renderer;

      });
  }
  
})();