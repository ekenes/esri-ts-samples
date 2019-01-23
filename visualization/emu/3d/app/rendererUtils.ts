import esri = __esri;
import { Renderer, SimpleRenderer, UniqueValueRenderer, ClassBreaksRenderer } from "esri/renderers";
import { ObjectSymbol3DLayer, IconSymbol3DLayer, PointSymbol3D, SimpleMarkerSymbol } from "esri/symbols";
import FeatureLayer = require("esri/layers/FeatureLayer");
import SceneView = require("esri/views/SceneView");

import colorRendererCreator = require("esri/renderers/smartMapping/creators/color");
import relationshipRendererCreator = require("esri/renderers/smartMapping/creators/relationship");
import { updateColorSlider } from "./colorSliderUtils";

import SizeVisualVariable = require("esri/renderers/visualVariables/SizeVariable");

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

  if(symbolType === "object"){
    renderer.visualVariables = getRealWorldSizeVariables(params.exaggeration);
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

function createSymbol(color: esri.Color | string | number[], type: "object" | "icon"): PointSymbol3D {
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

  switch (renderer.type) {
    case "simple":
      symbol = renderer.symbol as PointSymbol;
      break;
    case "class-breaks":
      symbol = renderer.classBreakInfos[0].symbol as PointSymbol;
      break;
    case "unique-value":
      symbol = renderer.uniqueValueInfos[0].symbol as PointSymbol;
      break;
  }

  return symbol;
}

export function setEMUClusterVisualization(layer: FeatureLayer, exaggeration: number){
  const originalRenderer = layer.renderer as SimpleRenderer | ClassBreaksRenderer | UniqueValueRenderer;
  const symbolType = getSymbolType(originalRenderer);

  const renderer = new UniqueValueRenderer({
    field: "Cluster37",
    defaultSymbol: createSymbol("darkgray", symbolType),
    defaultLabel: "no classification",
    uniqueValueInfos: [{
      value: 10,
      label: "EMU 10",
      symbol: createSymbol([117,112,230], symbolType)
    }, {
      value: 13,
      label: "EMU 13",
      symbol: createSymbol([54,71,153], symbolType)
    }, {
      value: 33,
      label: "EMU 33",
      symbol: createSymbol([117,145,255], symbolType)
    }, {
      value: 24,
      label: "EMU 24",
      symbol: createSymbol([235,169,212], symbolType)
    }, {
      value: 26,
      label: "EMU 26",
      symbol: createSymbol([147,101,230], symbolType)
    }, {
      value: 18,
      label: "EMU 18",
      symbol: createSymbol([188,90,152], symbolType)
    }, {
      value: 36,
      label: "EMU 36",
      symbol: createSymbol([26,82,170], symbolType)
    }, {
      value: 14,
      label: "EMU 14",
      symbol: createSymbol([70,82,144], symbolType)
    }]
  });

  if(symbolType === "object"){
    renderer.visualVariables = getRealWorldSizeVariables(exaggeration);
  }

  layer.renderer = renderer;
}

interface RelationshipVisParams {
  layer: FeatureLayer,
  view: SceneView,
  field1: {
    fieldName: string,
    label: string
  },
  field2: {
    fieldName: string,
    label: string
  },
  exaggeration: number
}

export async function generateRelationshipVisualization(params: RelationshipVisParams){
  const options = {
    // relationshipScheme: schemes.secondarySchemes[8],
    layer: params.layer,
    view: params.view,
    basemap: params.view.map.basemap,
    field1: {
      field: params.field1.fieldName
    },
    field2: {
      field: params.field2.fieldName
    },
    classificationMethod: "quantile",
    focus: "HH"
  };

  const relationshipRendererResponse = await relationshipRendererCreator.createRenderer(options);
  const oldRenderer = options.layer.renderer as SimpleRenderer | ClassBreaksRenderer | UniqueValueRenderer;
  const symbolType = getSymbolType(oldRenderer);
  
  const renderer = relationshipRendererResponse.renderer;
  let uniqueValueInfos;

  if (symbolType === "object"){
    uniqueValueInfos = renderer.uniqueValueInfos.map(function(info){
      info.symbol = createSymbol(info.symbol.color.clone(), symbolType);
      switch (info.value) {
        case "HH":
          info.label = `High ${params.field1.label}, High ${params.field2.label}`;
          break;
        case "HL":
          info.label = `High ${params.field1.label}, Low ${params.field2.label}`;
          break;
        case "LH":
          info.label = `Low ${params.field1.label}, High ${params.field2.label}`;
          break;
        case "LL":
          info.label = `Low ${params.field1.label}, Low ${params.field2.label}`;
          break;
      }
      return info;
    });

    renderer.defaultSymbol = createSymbol([128,128,128], symbolType);
    renderer.visualVariables = getRealWorldSizeVariables(params.exaggeration);
  } else {
    uniqueValueInfos = renderer.uniqueValueInfos.map(function(info){
      switch (info.value) {
        case "HH":
          info.label = `High ${params.field1.label}, High ${params.field2.label}`;
          break;
        case "HL":
          info.label = `High ${params.field1.label}, Low ${params.field2.label}`;
          break;
        case "LH":
          info.label = `Low ${params.field1.label}, High ${params.field2.label}`;
          break;
        case "LL":
          info.label = `Low ${params.field1.label}, Low ${params.field2.label}`;
          break;
      }
      return info;
    });
  }

  renderer.uniqueValueInfos = uniqueValueInfos;
  params.layer.renderer = renderer;
}

function getRealWorldSizeVariables(exaggeration: number): SizeVisualVariable[] {
  return [ new SizeVisualVariable({
    valueExpression:`$feature.ThicknessPos * ${exaggeration}`,
    valueUnit: "meters",
    axis: "height"
  }), new SizeVisualVariable({
    useSymbolValue: true,
    axis: "width-and-depth"
  }) ];
}