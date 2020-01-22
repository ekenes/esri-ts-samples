import esri = __esri;
import ColorSlider = require("esri/widgets/smartMapping/ColorSlider");
import histogram = require("esri/renderers/smartMapping/statistics/histogram");
import { SimpleRenderer } from "esri/renderers";
import Color = require("esri/Color");
import lang = require("esri/core/lang");

let colorSlider: ColorSlider;
let colorSlideChangeEvent: any, colorSlideSlideEvent: any;

interface ColorSliderParams {
  colorResponse: esri.VisualVariableResult,
  layer: esri.FeatureLayer,
  field: string,
  theme: string
}

const bars: SVGElement[] = [];

export async function updateColorSlider(params: ColorSliderParams){
  const layer = params.layer;
  const colorSliderContainer = document.createElement("div");

  const colorHistogram = await histogram({
    layer: params.layer,
    field: params.field,
    numBins: 50
  });

  const colorStops = params.colorResponse.visualVariable.stops;

  const colorSliderParams = {
    max: params.colorResponse.statistics.max,
    min: params.colorResponse.statistics.min,
    stops: colorStops,
    primaryHandleEnabled: params.theme === "above-and-below",
    handlesSyncedToPrimary: params.theme === "above-and-below",
    container: colorSliderContainer,
    histogramConfig: {
      bins: colorHistogram.bins,
      barCreatedFunction: (index: number, element:SVGElement) => {
        const bin = colorHistogram.bins[index];
        const midValue = (bin.maxValue - bin.minValue) / 2 + bin.minValue;
        const color = getColorFromValue(colorStops, midValue);
        element.setAttribute("fill", color.toHex());
        bars.push(element);
      }
    }
  };

  if (!colorSlider) {

    const colorSliderParent = document.getElementById("color-container");
    colorSliderContainer.className = "esri-widget";
    colorSliderParent.appendChild(colorSliderContainer);

    colorSlider = new ColorSlider(colorSliderParams);

    // when the user slides the handle(s), update the renderer
    // with the updated color visual variable object

    colorSlideChangeEvent = colorSlider.on([ "thumb-change", "thumb-drag", "min-change", "max-change" ] as any, () => {
      const oldRenderer = layer.renderer as SimpleRenderer;
      const newRenderer = oldRenderer.clone();

      if(newRenderer.visualVariables.length < 1){
        return;
      }

      const visualVariables: esri.VisualVariable[] = newRenderer.visualVariables;
      oldRenderer.visualVariables = [];

      let unchangedVVs: esri.VisualVariable[] = [];
      let colorVariable: esri.ColorVariable = null;

      if(visualVariables){
        visualVariables.forEach( vv => {
          if( vv.type === "color" ){
            colorVariable = vv as esri.ColorVariable;
          } else {
            unchangedVVs.push(vv);
          }
        });
      }
      // else {
      //   newRenderer.visualVariables.push(lang.clone(colorSlider.visualVariable));
      // }

      colorVariable.stops = colorSlider.stops;
      newRenderer.visualVariables = unchangedVVs.concat(colorVariable);

      updateMeanValue();

      layer.renderer = newRenderer;

      bars.forEach(function(bar, index) {
        const bin = colorSlider.histogramConfig.bins[index];
        const midValue =
          (bin.maxValue - bin.minValue) / 2 + bin.minValue;
        const color = getColorFromValue(colorSlider.stops, midValue);
        bar.setAttribute("fill", color.toHex());
      });
    });

    // colorSlideSlideEvent = colorSlider.on("data-change", function() {
    //   const oldRenderer = layer.renderer as SimpleRenderer;
    //   const newRenderer = oldRenderer.clone();
    //   if(newRenderer.visualVariables.length > 1){
    //     return;
    //   }
    //   newRenderer.visualVariables = [ lang.clone(colorSlider.visualVariable) ];
    //   updateMeanValue();
    //   layer.renderer = newRenderer;
    // });

  } else {
    colorSlider.set(colorSliderParams);
  }

}

function getNumHandles(theme: string): number {
  return theme === "high-to-low" ? 2 : 3;
}

function updateMeanValue(){
  const displayMeanValue = document.getElementById("display-mean-value");
  displayMeanValue.innerHTML = (Math.round(colorSlider.stops[2].value*100)/100).toString();
}

export function destroyColorSlider(){
  if(colorSlider){
    colorSlideChangeEvent.remove();
    colorSlider = null;
  }
}

// infers the color for a given value
// based on the stops from a ColorVariable
function getColorFromValue(stops: esri.ColorStop[], value: number) {
  let minStop = stops[0];
  let maxStop = stops[stops.length - 1];

  const minStopValue = minStop.value;
  const maxStopValue = maxStop.value;

  if (value < minStopValue) {
    return minStop.color;
  }

  if (value > maxStopValue) {
    return maxStop.color;
  }

  const exactMatches = stops.filter(function(stop) {
    return stop.value === value;
  });

  if (exactMatches.length > 0) {
    return exactMatches[0].color;
  }

  minStop = null;
  maxStop = null;
  stops.forEach(function(stop, i) {
    if (!minStop && !maxStop && stop.value >= value) {
      minStop = stops[i - 1];
      maxStop = stop;
    }
  });

  const weightedPosition =
    (value - minStop.value) / (maxStop.value - minStop.value);

  return Color.blendColors(
    minStop.color,
    maxStop.color,
    weightedPosition
  );
}