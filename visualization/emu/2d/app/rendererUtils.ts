import esri = __esri;
import { Renderer, SimpleRenderer, UniqueValueRenderer, ClassBreaksRenderer } from "esri/renderers";
import { ObjectSymbol3DLayer, IconSymbol3DLayer, PointSymbol3D, SimpleMarkerSymbol } from "esri/symbols";
import FeatureLayer = require("esri/layers/FeatureLayer");
import MapView = require("esri/views/MapView");

import colorRendererCreator = require("esri/renderers/smartMapping/creators/color");
import relationshipRendererCreator = require("esri/renderers/smartMapping/creators/relationship");
import { updateColorSlider } from "./colorSliderUtils";

import SizeVisualVariable = require("esri/renderers/visualVariables/SizeVariable");

interface ContinuousVisParams {
  layer: FeatureLayer,
  basemap?: string,
  field: string,
  view: MapView,
  theme?: string
}

export async function generateContinuousVisualization (params: ContinuousVisParams){

  const options = {
    layer: params.layer,
    basemap: params.basemap ? params.basemap : "dark-gray",
    field: params.field,
    theme: params.theme ? params.theme : "above-and-below",
    view: params.view
  };

  const renderer = new SimpleRenderer({
    symbol: createSymbol("white")
  });

  const colorResponse = await colorRendererCreator.createVisualVariable(options);
  const colorVV = colorResponse.visualVariable;
  renderer.visualVariables = [ colorVV ];

  // apply input renderer back on layer
  params.layer.renderer = renderer;

  updateColorSlider({
    colorResponse,
    layer: options.layer,
    field: options.field,
    theme: options.theme
  });

}

function createSymbol(color: esri.Color | string | number[]): SimpleMarkerSymbol {
  return new SimpleMarkerSymbol({
    size: 6,
    color,
    style: "circle"
  });
}

export function setEMUClusterVisualization(layer: FeatureLayer){
  const originalRenderer = layer.renderer as SimpleRenderer | ClassBreaksRenderer | UniqueValueRenderer;

  const renderer = new UniqueValueRenderer({
    field: "Cluster37",
    defaultSymbol: createSymbol("darkgray"),
    defaultLabel: "no classification",
    uniqueValueInfos: [{
      value: 10,
      label: "EMU 10",
      symbol: createSymbol([117,112,230])
    }, {
      value: 13,
      label: "EMU 13",
      symbol: createSymbol([54,71,153])
    }, {
      value: 33,
      label: "EMU 33",
      symbol: createSymbol([117,145,255])
    }, {
      value: 24,
      label: "EMU 24",
      symbol: createSymbol([235,169,212])
    }, {
      value: 26,
      label: "EMU 26",
      symbol: createSymbol([147,101,230])
    }, {
      value: 18,
      label: "EMU 18",
      symbol: createSymbol([188,90,152])
    }, {
      value: 36,
      label: "EMU 36",
      symbol: createSymbol([26,82,170])
    }, {
      value: 14,
      label: "EMU 14",
      symbol: createSymbol([70,82,144])
    }]
  });

  layer.renderer = renderer;
}

interface RelationshipVisParams {
  layer: FeatureLayer,
  view: MapView,
  field1: {
    fieldName: string,
    label: string
  },
  field2: {
    fieldName: string,
    label: string
  }
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
  
  const renderer = relationshipRendererResponse.renderer;
  let uniqueValueInfos;

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
  

  renderer.uniqueValueInfos = uniqueValueInfos;
  params.layer.renderer = renderer;
}