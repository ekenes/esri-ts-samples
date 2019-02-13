import esri = __esri;

import FeatureLayer = require("esri/layers/FeatureLayer");
import MapView = require("esri/views/MapView");
import FeatureFilter = require("esri/views/layers/support/FeatureFilter");

interface DepthSliderParams {
  layer: FeatureLayer,
  depthFieldName: string,  // "UnitTop"
  view: MapView
}

export async function createDepthSlider(params: DepthSliderParams) {
  const { layer, depthFieldName, view } = params;

  const depthSlider = document.getElementById("depth-slider") as HTMLInputElement;
  const uniqueDepthValues = await getDepthValuesFromLayer(layer, depthFieldName);
  const layerView = await view.whenLayerView(layer) as esri.FeatureLayerView;

  filterByDepth(depthSlider, uniqueDepthValues, layerView);

  depthSlider.addEventListener("input", () => {
    filterByDepth(depthSlider, uniqueDepthValues, layerView);
  });
}

async function getDepthValuesFromLayer(layer: FeatureLayer, depthField: string): Promise<number[]> {
  const query = layer.createQuery();
  query.outFields = [ depthField ];
  query.returnDistinctValues = true;
  query.returnGeometry = false;

  return await layer.queryFeatures(query).then( response => {
    return response.features.map( feature => feature.attributes.UnitTop );
  });
}

function filterByDepth(slider: HTMLInputElement, uniqueDepthValues: number[], layerView: esri.FeatureLayerView){
  const sliderValue = parseInt(slider.value);
  const sliderValueText = document.getElementById("slider-value-text");
  sliderValueText.innerHTML = slider.value;

  const sortedValuesByDifference = uniqueDepthValues.map( value => {
    return {
      difference: Math.abs(value - sliderValue),
      value
    };
  }).sort( (a, b) => {
    return a.difference - b.difference; 
  });

  layerView.filter = new FeatureFilter({
    where: `UnitTop = ${sortedValuesByDifference[0].value}`
  });
}