import esri = __esri;

import WebMap = require("esri/WebMap");
import MapView = require("esri/views/MapView");
import FeatureLayer = require("esri/layers/FeatureLayer");

import Expand = require("esri/widgets/Expand");
import Legend = require("esri/widgets/Legend");
import ColorSlider = require("esri/widgets/ColorSlider");
import SizeSlider = require("esri/widgets/SizeSlider");

import colorRendererCreator = require("esri/renderers/smartMapping/creators/color");
import sizeRendererCreator = require("esri/renderers/smartMapping/creators/size");
import histogram = require("esri/renderers/smartMapping/statistics/histogram");

import Field = require("esri/layers/support/Field");

const map = new WebMap({
  portalItem: {
    id: "1f1506c2c5314668b74920c353e5c0ff"
  }
});

const view = new MapView({
  map: map,
  container: "viewDiv"
});

let themeSelect, fieldSelect, normalizationFieldSelect;

view.when()
  .then(function(){
    const layer = getVisibleLayer(view);
    return layer.when();
  })
  .then(createDomElements);

  // field select
  // normalization field select (none by default)
  // sliders
  // themes select
  // filter widget based on:
  //   - field values (unique types)
  //   - field names

function createDomElements(){
  view.ui.add("controlsDiv", "bottom-left");
  themeSelect = document.getElementById("themeSelect");

  const layer = getVisibleLayer(view);

  const fieldSelect = document.getElementById("fieldSelect") as HTMLSelectElement;
  const normalizationFieldSelect = document.getElementById("normalizationFieldSelect") as HTMLSelectElement;

  addOptionsToSelectFromFields(fieldSelect, layer.fields);
  addOptionsToSelectFromFields(normalizationFieldSelect, layer.fields);

  createSlider
}

// helper function for returning a layer instance
// based on a given layer title
function findLayerByTitle(view: MapView, title: string) {
  return view.map.layers.find(function(layer) {
    return layer.title === title;
  });
}

// Gets the first visible layer in the view
function getVisibleLayer(view: MapView): esri.FeatureLayer {
  return view.map.layers.find(function(layer) {
    return layer.visible;
  }) as esri.FeatureLayer;
}

function addOptionsToSelectFromFields(select: HTMLSelectElement, fields: Field[]){
  const option = document.createElement("option");
  option.value = "";
  option.text = "";
  option.selected = true;
  select.appendChild(option);

  fields.forEach( (field) => { 
    const option = document.createElement("option");
    option.value = field.name;
    option.text = field.alias;
    select.appendChild(option);
  });
}

// helper function for formatting number labels with commas
function numberWithCommas(value: number) {
  value = value || 0;
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function createSlider(layer: FeatureLayer): ColorSlider | SizeSlider {
  const renderer = layer.renderer as esri.ClassBreaksRenderer;
  const authoringInfoVV = renderer.authoringInfo.visualVariables;
  const vvInfo: esri.AuthoringInfoVisualVariable = authoringInfoVV.filter( vv => vv.type === "size" || vv.type === "color" )[0];
  const rendererVisualVariable: esri.ColorVisualVariable | esri.BoundedMinMax = renderer.visualVariables.filter( vv => vv.type === vvInfo.type )[0];

  let stats = {};

  if (vvInfo.type === "size"){
    stats.min = rendererVisualVariable.minDataValue;
  }

  const sliderParams = {
    maxValue: vvInfo.maxSliderValue,
    minValue: vvInfo.minSliderValue,
    numHandles: 2,//depends on theme,
    statistics: {
      min: rendererVisualVariable.stops[0],
    },
    syncedHandles: true,//depends on theme
    visualVariable: rendererVisualVariable
  };

  return vvInfo.type === "color" ? new ColorSlider(sliderParams) : new SizeSlider(sliderParams);
}

// function queryStatistics(layer: FeatureLayer)