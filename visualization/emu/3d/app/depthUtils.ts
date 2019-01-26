import FeatureLayer = require("esri/layers/FeatureLayer");
import GraphicsLayer = require("esri/layers/GraphicsLayer");
import Graphic = require("esri/Graphic");
import GroupLayer = require("esri/layers/GroupLayer");

import SceneView = require("esri/views/SceneView");

import { Extent, Polyline, Point } from "esri/geometry";
import { SimpleLineSymbol, LabelSymbol3D, TextSymbol3DLayer, PointSymbol3D, IconSymbol3DLayer, SimpleMarkerSymbol } from "esri/symbols";
import { SimpleRenderer } from "esri/renderers";

export function createDepthRulerLayer (view: SceneView, extent: Extent, depth: number, exaggeration: number): GroupLayer {
  const ruler = new GraphicsLayer({
    graphics: [{
      geometry: new Polyline({
        spatialReference: view.spatialReference,
        hasZ: true,
        paths: [
          [
            [ extent.xmin, extent.ymax, 0 ],
            [ extent.xmin, extent.ymax, depth ]
          ]
        ]
      }),
      symbol: new SimpleLineSymbol({
        width: 2,
        color: "#69dcff"
      })
    }]
  });

  const rulerTickLayer = new FeatureLayer({
    objectIdField: "ObjectID",
    spatialReference: view.spatialReference,
    fields: [{
      name: "ObjectID",
      alias: "ObjectID",
      type: "oid"
    }, {
      name: "label",
      alias: "label",
      type: "string"
    }],
    geometryType: "point",
    returnZ: true,
    source: createGraphics(extent, 200, depth, exaggeration),
    screenSizePerspectiveEnabled: false,
    featureReduction: null,
    labelsVisible: true,
    labelingInfo: [{
      symbol: new LabelSymbol3D({
        symbolLayers: [ new TextSymbol3DLayer({
          material: {
            color: "#69dcff"
          },
          size: 12
        })]
      }),
      labelPlacement: "center-right",
      labelExpressionInfo: {
        expression: "$feature.label"
      }
    }],
    renderer: new SimpleRenderer({
      symbol: new PointSymbol3D({
        symbolLayers: [ new IconSymbol3DLayer({
          material: {
            color: "#69dcff"
          },
          resource: {
            primitive: "cross"
          },
          size: 10,
          outline: {
            color: "#69dcff",
            size: 2
          }
        }) ]
      })
    })
  });

  const depthRuler = new GroupLayer({
    title: "Depth ruler",
    listMode: "hide-children",
    layers: [ ruler, rulerTickLayer ],
    visible: false
  });

  return depthRuler;
}

function createGraphics(extent: Extent, interval: number, depth: number, exaggeration: number): Graphic[]{
  const features = [];
  const trueDepth = Math.round(Math.abs(depth/exaggeration));
  for(let i = 0; i <= trueDepth; i+=interval){
    const depthValue = i === 0 ? i : -i;
    features.push(new Graphic({
      attributes: {
        ObjectID: i,
        label: `  ${Math.round(depthValue)} m`
      },
      geometry: new Point({
        spatialReference: extent.spatialReference,
        x: extent.xmin,
        y: extent.ymax,
        z: depthValue * exaggeration
      })
    }));
  }
  return features;
}