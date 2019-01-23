import esri = __esri;
import { Renderer, SimpleRenderer } from "esri/renderers";
import { ObjectSymbol3DLayer, IconSymbol3DLayer, PointSymbol3D, SimpleMarkerSymbol } from "esri/symbols";
import FeatureLayer = require("esri/layers/FeatureLayer");
import SceneView = require("esri/views/SceneView");

import colorRendererCreator = require("esri/renderers/smartMapping/creators/color");
import { updateColorSlider } from "./colorSliderUtils";

interface ContinuousVisParams {
  layer: FeatureLayer,
  basemap?: string,
  field: string,
  view: SceneView,
  theme?: string,
  exaggeration: number
}

export async function generateContinuousVisualization (params: ContinuousVisParams){
  const symbolType = getSymbolType(params.layer.renderer as Renderer);

  const options = {
    layer: params.layer,
    basemap: params.basemap ? params.basemap : "dark-gray",
    field: params.field,
    theme: params.theme ? params.theme : "above-and-below",
    view: symbolType === "object" ? params.view : null,
    worldScale: symbolType === "object"
  };

  const renderer = new SimpleRenderer({
    symbol: createSymbol("white", symbolType)
  });

  const hasIconSymbol = containsIconSymbol(renderer);

  if(!hasIconSymbol){
    renderer.visualVariables = [{
      type: "size",
      valueExpression: `$feature.ThicknessPos * ${params.exaggeration}`,
      valueUnit: "meters",
      axis: "height"
    }, {
      type: "size",
      useSymbolValue: true,
      axis: "width-and-depth"
    }];
  }

  const colorResponse = await colorRendererCreator.createVisualVariable(options);
  const colorVV = colorResponse.visualVariable;

  if(renderer.visualVariables && renderer.visualVariables.length > 1){
    renderer.visualVariables.push(colorVV);
  } else {
    renderer.visualVariables = [ colorVV ];
  }

  // apply input renderer back on layer
  params.layer.renderer = renderer;

  const min = colorResponse.statistics.min;
  const max = colorResponse.statistics.max;
  const stddev = colorResponse.statistics.stddev * 0.33;

  const fieldNameValue = document.getElementById("field-name");
  fieldNameValue.innerText = options.field;

  updateColorSlider({
    colorResponse,
    layer: options.layer,
    field: options.field,
    theme: options.theme
  });

}

function getSymbolType (renderer: Renderer): "object" | "icon" {
  
  let symbolType: "object" | "icon";
  const symbol = getSymbolFromRenderer(renderer);

  if (symbol.type === "point-3d"){
    const symbolLayer = symbol.symbolLayers.getItemAt(0) as ObjectSymbol3DLayer | IconSymbol3DLayer;
    symbolType = symbolLayer.type;
  } else {
    symbolType = "icon";
  }

  return symbolType;
}

function createSymbol(color: esri.Color | string, type: "object" | "icon"): PointSymbol3D {
  const symbolLayerOptions = {
    resource: {
      primitive: type === "object" ? "cylinder" : "circle"
    },
    material: {
      color: color ? color : "white"
    },
    size: type === "icon" ? 6 : null,
    width: type === "object" ? 27000 : null,
    anchor: type === "object" ? "top" : null
  };

  const symbolLayer = type === "object" ? new ObjectSymbol3DLayer(symbolLayerOptions) : new IconSymbol3DLayer(symbolLayerOptions);

  return new PointSymbol3D({
    symbolLayers: [
      symbolLayer
    ]
  });
}

function containsIconSymbol (renderer: Renderer): boolean {
  const symbol = getSymbolFromRenderer(renderer);
  let hasIconSymbol: boolean;
  if (symbol.type === "point-3d") {
    hasIconSymbol = symbol.symbolLayers.some(sl => { sl.type === "icon" });
  } else {
    hasIconSymbol = false;
  }
  return hasIconSymbol;
}

type PointSymbol = PointSymbol3D | SimpleMarkerSymbol;

function getSymbolFromRenderer (renderer: Renderer): PointSymbol {
  let symbol: PointSymbol;
  if (renderer.type === "simple") {
    symbol = renderer.symbol as PointSymbol;
  }
  else if (renderer.type === "class-breaks" || renderer.type === "unique-value") {
    symbol = renderer.defaultSymbol as PointSymbol;
  } else {
    console.error("getSymbolFromRenderer() could not return a symbol from input renderer.");
  }

  return symbol;
}

