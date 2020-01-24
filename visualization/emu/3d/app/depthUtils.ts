import FeatureLayer = require("esri/layers/FeatureLayer");
import GraphicsLayer = require("esri/layers/GraphicsLayer");
import Graphic = require("esri/Graphic");
import GroupLayer = require("esri/layers/GroupLayer");

import SceneView = require("esri/views/SceneView");

import { Extent, Polyline, Point, Polygon } from "esri/geometry";
import { LabelSymbol3D, TextSymbol3DLayer, PointSymbol3D, IconSymbol3DLayer, PolygonSymbol3D, FillSymbol3DLayer, LineSymbol3D, LineSymbol3DLayer } from "esri/symbols";
import { SimpleRenderer } from "esri/renderers";

export function createMeasurementReferenceLayer (view: SceneView, extent: Extent, depth: number, exaggeration: number): GroupLayer {
  const cornersLayer = createVerticalCorners(view, extent, depth);

  const tickLabelLayer = createTickLabelLayer (view, extent, depth, exaggeration, 400);
  const horizontalPlanesLayer = createHorizontalMeasurementPlanes(view, extent, depth, exaggeration, 400);

  const measurementReferenceLayer = new GroupLayer({
    title: "Depth Reference",
    listMode: "hide-children",
    layers: [horizontalPlanesLayer, tickLabelLayer, cornersLayer ],
    visible: false
  });

  return measurementReferenceLayer;
}

function createVerticalCorners (view: SceneView, extent: Extent, depth: number): FeatureLayer {

  const { xmin, xmax, ymax, ymin, spatialReference } = extent;

  const layer = new FeatureLayer({
    objectIdField: "ObjectID",
    spatialReference: view.spatialReference,
    fields: [{
      name: "ObjectID",
      alias: "ObjectID",
      type: "oid"
    }],
    geometryType: "polyline",
    returnZ: true,
    source: [ new Graphic({
      attributes: {
        ObjectID: 1
      },
      geometry: new Polyline({
        spatialReference,
        hasZ: true,
        paths: [
          [
            [ xmin, ymax, 0 ],
            [ xmin, ymax, depth ]
          ]
        ]
      })
    }), new Graphic({
      attributes: {
        ObjectID: 2
      },
      geometry: new Polyline({
        spatialReference,
        hasZ: true,
        paths: [
          [
            [ xmin, ymin, 0 ],
            [ xmin, ymin, depth ]
          ]
        ]
      })
    }), new Graphic({
      attributes: {
        ObjectID: 3
      },
      geometry: new Polyline({
        spatialReference,
        hasZ: true,
        paths: [
          [
            [ xmax, ymax, 0 ],
            [ xmax, ymax, depth ]
          ]
        ]
      })
    }), new Graphic({
      attributes: {
        ObjectID: 4
      },
      geometry: new Polyline({
        spatialReference: view.spatialReference,
        hasZ: true,
        paths: [
          [
            [ xmax, ymin, 0 ],
            [ xmax, ymin, depth ]
          ]
        ]
      })
    })],
    renderer: new SimpleRenderer({
      symbol: new LineSymbol3D({
        symbolLayers: [ new LineSymbol3DLayer({
          material: {
            color: [105, 220, 255, 1]
          },
          size: 2
        }) ]
      })
    })
  });

  console.log(layer);

  return layer;
}

function createTickLabelLayer (view: SceneView, extent: Extent, depth: number, exaggeration: number, interval: number): FeatureLayer {

  const tickLabelLayer = new FeatureLayer({
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
    source: createTicks(extent, interval, depth, exaggeration),
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

  return tickLabelLayer;
}

function createTicks(extent: Extent, interval: number, depth: number, exaggeration: number): Graphic[]{
  const features = [];
  const trueDepth = Math.round(Math.abs(depth/exaggeration));
  const { xmin, xmax, ymax, ymin, spatialReference } = extent;
  for(let i = 0; i <= trueDepth; i+=interval){
    const depthValue = i === 0 ? i : -i;
    features.push(new Graphic({
      attributes: {
        ObjectID: i,
        label: `  ${Math.round(depthValue)} m`
      },
      geometry: new Point({
        spatialReference,
        x: xmin,
        y: ymin,
        z: depthValue * exaggeration
      })
    }));

    // features.push(new Graphic({
    //   attributes: {
    //     ObjectID: i+1,
    //     label: `  ${Math.round(depthValue)} m`
    //   },
    //   geometry: new Point({
    //     spatialReference,
    //     x: xmin,
    //     y: ymax,
    //     z: depthValue * exaggeration
    //   })
    // }));

    features.push(new Graphic({
      attributes: {
        ObjectID: i+2,
        label: `  ${Math.round(depthValue)} m`
      },
      geometry: new Point({
        spatialReference,
        x: xmax,
        y: ymax,
        z: depthValue * exaggeration
      })
    }));

    // features.push(new Graphic({
    //   attributes: {
    //     ObjectID: i+3,
    //     label: `  ${Math.round(depthValue)} m`
    //   },
    //   geometry: new Point({
    //     spatialReference,
    //     x: xmax,
    //     y: ymin,
    //     z: depthValue * exaggeration
    //   })
    // }));
  }
  return features;
}

function createPlanes(extent: Extent, interval: number, depth: number, exaggeration: number): Graphic[]{
  const features = [];
  const trueDepth = Math.round(Math.abs(depth/exaggeration));
  const { xmin, xmax, ymin, ymax, spatialReference } = extent;
  for(let i = 0; i <= trueDepth; i+=interval){
    const depthValue = i === 0 ? i : -i;
    features.push(new Graphic({
      attributes: {
        ObjectID: i,
        label: `  ${Math.round(depthValue)} m`
      },
      geometry: new Polygon({
        spatialReference,
        rings: [ [
          [ xmin, ymin, depthValue * exaggeration ],
          [ xmin, ymax, depthValue * exaggeration ],
          [ xmax, ymax, depthValue * exaggeration ],
          [ xmax, ymin, depthValue * exaggeration ],
          [ xmin, ymin, depthValue * exaggeration ]
        ] ],
        hasZ: true
      })
    }));
  }
  return features;
}

function createHorizontalMeasurementPlanes (view: SceneView, extent: Extent, depth: number, exaggeration: number, interval: number): FeatureLayer {

  const horizontalPlanesLayer = new FeatureLayer({
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
    geometryType: "polygon",
    returnZ: true,
    source: createPlanes(extent, interval, depth, exaggeration),
    renderer: new SimpleRenderer({
      symbol: new PolygonSymbol3D({
        symbolLayers: [ new FillSymbol3DLayer({
          material: {
            color: [105, 220, 255, 0.25]
          },
          outline: {
            color: [105, 220, 255, 0.5],
            size: 2
          }
        }) ]
      })
    })
  });

  console.log("planes", horizontalPlanesLayer)

  return horizontalPlanesLayer;
}