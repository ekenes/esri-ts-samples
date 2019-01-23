import esri = __esri;
import ColorSlider = require("esri/widgets/ColorSlider");
import histogram = require("esri/renderers/smartMapping/statistics/histogram");
import { SimpleRenderer } from "esri/renderers";
import lang = require("esri/core/lang");

let colorSlider: ColorSlider;

interface ColorSliderParams {
  colorResponse: esri.VisualVariableResult,
  layer: esri.FeatureLayer,
  field: string,
  theme: string
}

export async function updateColorSlider(params: ColorSliderParams){
  const layer = params.layer;
  const colorSliderContainer = document.createElement("div");

  const colorHistogram = await histogram({
    layer: params.layer,
    field: params.field,
    numBins: 30
  });

  const colorSliderParams = {
    statistics: params.colorResponse.statistics,
    maxValue: params.colorResponse.statistics.max,
    minValue: params.colorResponse.statistics.min,
    histogram: colorHistogram,
    visualVariable: params.colorResponse.visualVariable,
    numHandles: getNumHandles(params.theme),
    syncedHandles: getNumHandles(params.theme) > 2,
    container: colorSliderContainer
  };

  if (!colorSlider) {

    const colorSliderParent = document.getElementById("color-container");
    colorSliderContainer.className = "esri-widget";
    colorSliderParent.appendChild(colorSliderContainer);

    colorSlider = new ColorSlider(colorSliderParams);

    // when the user slides the handle(s), update the renderer
    // with the updated color visual variable object

    colorSlider.on("handle-value-change", () => {
      const oldRenderer = layer.renderer as SimpleRenderer;
      const newRenderer = oldRenderer.clone();

      if(newRenderer.visualVariables.length <= 1){
        return;
      }

      const visualVariables: esri.VisualVariable[] = lang.clone(newRenderer.visualVariables);
      oldRenderer.visualVariables = [];

      if(visualVariables){
        const unchangedVVs = visualVariables.filter(function(vv){
          return vv.type !== "color";
        });
        newRenderer.visualVariables = unchangedVVs.concat([lang.clone(colorSlider.visualVariable)]);
      } else {
        newRenderer.visualVariables.push(lang.clone(colorSlider.visualVariable));
      }

      updateMeanValue();
      
      layer.renderer = newRenderer;
    });

    colorSlider.on("data-change", function() {
      const oldRenderer = layer.renderer as SimpleRenderer;
      const newRenderer = oldRenderer.clone();
      if(newRenderer.visualVariables.length > 1){
        return;
      }
      newRenderer.visualVariables = [ lang.clone(colorSlider.visualVariable) ];
      updateMeanValue();
      layer.renderer = newRenderer;
    });

  } else {
    colorSlider.set(colorSliderParams);
  }

}

function getNumHandles(theme: string): number {
  return theme === "high-to-low" ? 2 : 3;
}

function updateMeanValue(){
  const displayMeanValue = document.getElementById("display-mean-value");
  displayMeanValue.innerHTML = (Math.round(colorSlider.visualVariable.stops[2].value*100)/100).toString();
}