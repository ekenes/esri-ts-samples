import esri = __esri;

interface FilterLayerViewParams {
  layer: esri.FeatureLayer,
  view: esri.SceneView,
  options: esri.FeatureFilter
}

export async function filterLayerView(params: FilterLayerViewParams){
  const { layer, view, options } = params;
  const layerView = await view.whenLayerView(layer) as esri.FeatureLayerView;
  layerView.filter = options;
}

export function clearLayerViewFilter(layerView: esri.FeatureLayerView){
  layerView.filter = null;
}