import esri = __esri;

import EsriMap = require("esri/Map");
import MapView = require("esri/views/MapView");
import FeatureLayer = require("esri/layers/FeatureLayer");

import colorRendererCreator = require("esri/renderers/smartMapping/creators/color");
import histogram = require("esri/renderers/smartMapping/statistics/histogram");
import ColorSlider = require("esri/widgets/ColorSlider");
import Legend = require("esri/widgets/Legend");
import lang = require("esri/core/lang");

(async () => {

  //
  // Create map with a single FeatureLayer 
  //

  const layer = new FeatureLayer({
    portalItem: {
      id: "b975d17543fb4ab2a106415dca478684"
    }
  });

  const map = new EsriMap({
    basemap: "streets",
    layers: [ layer ]
  });

  const view = new MapView({
    map: map,
    container: "viewDiv",
    center: [ -99.5789795341516, 19.04471398160347],
    zoom: 7
  });

  view.ui.add(new Legend({ view: view }), "bottom-right");

  await view.when();

  const rendererParams = {
    layer: layer,
    field: "EDUC01_CY",
    normalizationField: "EDUCA_BASE",
    basemap: view.map.basemap
  };

  const rendererResponse = await colorRendererCreator.createContinuousRenderer(rendererParams);

  // apply renderer to layer
  layer.renderer = rendererResponse.renderer;

  const rendererHistogram = await histogram({
    layer: layer,
    field: "EDUC01_CY",
    normalizationField: "EDUCA_BASE",
    numBins: 30
  });

  const sliderContainer = document.createElement("div");
  const panelDiv = document.getElementById("panel");
  panelDiv.appendChild(sliderContainer);
  view.ui.add(panelDiv, "bottom-left");

  const slider = new ColorSlider({
    container: sliderContainer,
    statistics: rendererResponse.statistics,
    histogram: rendererHistogram,
    visualVariable: rendererResponse.visualVariable
  });

  slider.on("data-change", (event: any) => {
    const renderer = layer.renderer as esri.ClassBreaksRenderer;
    const rendererClone = renderer.clone();
    rendererClone.visualVariables = [ lang.clone( slider.visualVariable ) ];
    layer.renderer = rendererClone;
  });

})();