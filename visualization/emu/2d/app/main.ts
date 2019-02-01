import EsriMap = require("esri/Map");
import MapView = require("esri/views/MapView");
import FeatureLayer = require("esri/layers/FeatureLayer");
import { Extent } from "esri/geometry";
import { createDepthSlider } from "./depthUtils";

import Home = require("esri/widgets/Home");
import BasemapToggle = require("esri/widgets/BasemapToggle");
import Legend = require("esri/widgets/Legend");
import Expand = require("esri/widgets/Expand");
import { generateContinuousVisualization, setEMUClusterVisualization, generateRelationshipVisualization } from "./rendererUtils";
import { destroyColorSlider } from "./colorSliderUtils";

( async () => {

  const colorField1Select = document.getElementById("color-field1-select") as HTMLSelectElement;
  const colorField2Select = document.getElementById("color-field2-select") as HTMLSelectElement;
  const emuFilter = document.getElementById("emu-filter") as HTMLInputElement;
  const displayMean = document.getElementById("display-mean");
  const displayVariable = document.getElementById("display-variable");
  const displayUnit = document.getElementById("display-unit");

  const studyArea = new Extent({
    spatialReference: { wkid: 3857 },
    xmin: -32607543,
    ymin: -148400,
    xmax: -31196210,
    ymax: 952292
  });

  // const url = "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/ArcGIS/rest/services/EMU_master_3857_2/FeatureServer/0";
  const url = "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/EMUMaster_Indian_Ocean_all/FeatureServer/1"

  // Create SceneLayer and add to the map
  const layer = new FeatureLayer({
    title: "EMU data points",
    url,
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
    }
  });
  const map = new EsriMap({
    basemap: "dark-gray-vector",
    layers: [ layer ]
  });

  const view = new MapView({
    map: map,
    container: "viewDiv",
    extent: studyArea,
    padding: {
      top: 40
    }
  });

  await view.when();

  createDepthSlider({
    layer,
    view,
    depthFieldName: "UnitTop"
  });
  view.ui.add("slider-div", "top-right");

  generateContinuousVisualization({
    view,
    layer,
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

  view.ui.add(new Home({ view }), "top-left");

  // BasemapToggle

  view.ui.add(new BasemapToggle({
    view,
    nextBasemap: "oceans"
  }), "bottom-right");

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

  colorField1Select.addEventListener("change", changeEventListener);
  colorField2Select.addEventListener("change", changeEventListener);

  function changeEventListener(){
    if(colorField1Select.value === "Cluster37"){
      colorField2Select.disabled = true;
      destroyColorSlider();
      setEMUClusterVisualization(layer);
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
          field: colorField1Select.value
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
          }
        });
        
      }

    }
  }

})();