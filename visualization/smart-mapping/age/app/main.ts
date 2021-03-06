import esri = __esri;

import EsriMap = require("esri/Map");
import MapView = require("esri/views/MapView");
import FeatureLayer = require("esri/layers/FeatureLayer");

import colorRendererCreator = require("esri/renderers/smartMapping/creators/color");
import histogram = require("esri/renderers/smartMapping/statistics/histogram");
import lang = require("esri/core/lang");

import ColorSlider = require("esri/widgets/ColorSlider");
import Expand = require("esri/widgets/Expand");
import Legend = require("esri/widgets/Legend");

(async() => {

  const layer = new FeatureLayer({
    portalItem: {
      id: "c8efe865f4184a2ca5c3581c025684b6"
    },
    popupTemplate: { // autocasts as new PopupTemplate()
      title: "{STREET_O_NAME_1}",
      content: [{
        type: "fields",
        fieldInfos: [
        {
          fieldName: "CONST_YR",
          label: "Construction year"
        }, {
          fieldName: "INSPECTION_DATE",
          label: "Last Inspection"
        }, {
          fieldName: "STREET_F_NAME_1",
          label: "From"
        }, {
          fieldName: "STREET_T_NAME_1",
          label: "To"
        }]
      }]
    }
  });

  // Create a map and add it to a SceneView

  const map = new EsriMap({
    basemap: "dark-gray-vector",
    layers: [ layer ]
  });

  const view = new MapView({
    container: "viewDiv",
    map: map,
    center: [ -93.2746, 44.9802 ],
    zoom: 13
  });

  view.ui.add(
    new Expand({
      view,
      content: new Legend({ view }),
      group: "top-left",
      expanded: true
    }), "top-left");

  // configure parameters for the color renderer generator
  // the layer must be specified along with a field name
  // or arcade expression. The basemap and other properties determine
  // the appropriate default color scheme.

  const ageParams = {
    layer: layer,
    view: view,
    basemap: map.basemap,
    startTime: "INSPECTION_DATE",
    endTime: Date.now(),
    theme: "above-and-below",
    maxValue: 15
  };

  // Generate a continuous color renderer based on the
  // statistics of the data in the provided layer
  // and field.
  //
  // This resolves to an object containing several helpful
  // properties, including color scheme, statistics,
  // the renderer and visual variable

  const rendererResponse = await colorRendererCreator.createAgeRenderer(ageParams);

  // set the renderer to the layer and add it to the map

  layer.renderer = rendererResponse.renderer;

  console.log("Age arcade: \n\n", rendererResponse.renderer.valueExpression);

  const histogramResult = await histogram({
    layer: ageParams.layer,
    view: ageParams.view,
    valueExpression: rendererResponse.renderer.valueExpression,
    numBins: 30
  });
      

  // input the slider parameters in the slider's constructor
  // and add it to the view's UI

  const colorSlider = new ColorSlider({
    numHandles: 3,
    syncedHandles: true,
    container: "slider",
    maxValue: ageParams.maxValue,
    statistics: rendererResponse.statistics,
    visualVariable: rendererResponse.visualVariable,
    histogram: histogramResult
  });
  view.ui.add(new Expand({
    view,
    group: "top-left",
    content: document.getElementById("containerDiv"),
    expandIconClass: "esri-icon-chart"
  }), "top-left");

  // when the user slides the handle(s), update the renderer
  // with the updated color visual variable object

  colorSlider.on("data-change", function() {
    const oldRenderer = layer.renderer as esri.ClassBreaksRenderer;
    const newRenderer = oldRenderer.clone();
    newRenderer.visualVariables = [lang.clone(colorSlider.visualVariable)];
    layer.renderer = newRenderer;
  });

})();