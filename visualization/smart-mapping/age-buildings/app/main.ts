import esri = __esri;

import EsriMap = require("esri/Map");
import MapView = require("esri/views/MapView");
import FeatureLayer = require("esri/layers/FeatureLayer");

import colorRendererCreator = require("esri/renderers/smartMapping/creators/color");
import histogram = require("esri/renderers/smartMapping/statistics/histogram");
import ColorSlider = require("esri/widgets/ColorSlider");
import lang = require("esri/core/lang");

(async() => {

  const layer = new FeatureLayer({
    portalItem: {
      id: "dfe2d606134546f5a712e689d76540ac"
    },
    definitionExpression: `CNSTRCT_YR > 1500 AND CNSTRCT_YR <= 2018`,
    popupTemplate: {
      title: "{NAME}",
      content: [{
        type: "fields",
        fieldInfos: [{
          fieldName: "CNSTRCT_YR",
          label: "Construction year"
        }]
      }]
    }
  });

  // Create a map and add it to a SceneView

  const map = new EsriMap({
    basemap: "streets-vector",
    layers: [ layer ]
  });

  const view = new MapView({
    container: "viewDiv",
    map: map,
    center: [-74.00500836986267, 40.71640777473177],
    zoom: 14,
  });

  const ageParams = {
    layer: layer,
    view: view,
    basemap: map.basemap,
    valueExpression: "Year(Date()) - $feature.CNSTRCT_YR",
    theme: "above-and-below"
  };

  // Generate a continuous color renderer based on the
  // statistics of the data in the provided layer
  // and field.
  //
  // This resolves to an object containing several helpful
  // properties, including color scheme, statistics,
  // the renderer and visual variable

  await view.when();
  await layer.when();

  const rendererResponse = await colorRendererCreator.createContinuousRenderer(ageParams);

  // set the renderer to the layer and add it to the map

  layer.renderer = rendererResponse.renderer;

  const sliderHistogram = await histogram({
    layer,
    view,
    valueExpression: ageParams.valueExpression,
    numBins: 30,
    minValue: 0
  });
      
  // input the slider parameters in the slider's constructor
  // and add it to the view's UI

  const colorSlider = new ColorSlider({
    numHandles: 3,
    syncedHandles: true,
    container: "slider",
    statistics: rendererResponse.statistics,
    visualVariable: rendererResponse.visualVariable,
    histogram: sliderHistogram,
    minValue: 0
  });
  view.ui.add("containerDiv", "bottom-left");

  // when the user slides the handle(s), update the renderer
  // with the updated color visual variable object

  colorSlider.on("data-change", function() {
    const oldRenderer = layer.renderer as esri.ClassBreaksRenderer;
    const newRenderer = oldRenderer.clone();
    newRenderer.visualVariables = [lang.clone(colorSlider.visualVariable)];
    layer.renderer = newRenderer;
  });

  // when the user changes the min/max values of the slider
  // the histogram should be updated

  colorSlider.on("data-value-change", async function(event: any) {
    const sliderHistogram = await histogram({
      layer,
      view,
      valueExpression: ageParams.valueExpression,
      numBins: 30,
      minValue: colorSlider.minValue,
      maxValue: colorSlider.maxValue
    });

    colorSlider.set("histogram", sliderHistogram);
  });

})();