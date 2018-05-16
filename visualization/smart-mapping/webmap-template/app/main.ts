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

  // fieldSelect = document.getElementById("fieldSelect");

  const selectList = document.getElementsByTagName("select");
  const fieldSelect = selectList[0];
  const normalizationFieldSelect = selectList[1];

  addOptionsToSelectFromFields(fieldSelect, layer.fields);
  addOptionsToSelectFromFields(normalizationFieldSelect, layer.fields);
}

// helper function for returning a layer instance
// based on a given layer title
function findLayerByTitle(view: MapView, title: string) {
  return view.map.layers.find(function(layer) {
    return layer.title === title;
  });
}

// Gets the first visible layer in the view
function getVisibleLayer(view: MapView) {
  return view.map.layers.find(function(layer) {
    return layer.visible;
  });
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