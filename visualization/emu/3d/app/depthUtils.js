define(["require", "exports", "esri/layers/FeatureLayer", "esri/Graphic", "esri/layers/GroupLayer", "esri/geometry", "esri/symbols", "esri/renderers"], function (require, exports, FeatureLayer, Graphic, GroupLayer, geometry_1, symbols_1, renderers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function createMeasurementReferenceLayer(view, extent, depth, exaggeration) {
        var cornersLayer = createVerticalCorners(view, extent, depth);
        var tickLabelLayer = createTickLabelLayer(view, extent, depth, exaggeration, 400);
        var horizontalPlanesLayer = createHorizontalMeasurementPlanes(view, extent, depth, exaggeration, 400);
        var measurementReferenceLayer = new GroupLayer({
            title: "Depth Reference",
            listMode: "hide-children",
            layers: [horizontalPlanesLayer, tickLabelLayer, cornersLayer],
            visible: false
        });
        return measurementReferenceLayer;
    }
    exports.createMeasurementReferenceLayer = createMeasurementReferenceLayer;
    function createVerticalCorners(view, extent, depth) {
        var xmin = extent.xmin, xmax = extent.xmax, ymax = extent.ymax, ymin = extent.ymin, spatialReference = extent.spatialReference;
        var layer = new FeatureLayer({
            objectIdField: "ObjectID",
            spatialReference: view.spatialReference,
            fields: [{
                    name: "ObjectID",
                    alias: "ObjectID",
                    type: "oid"
                }],
            geometryType: "polyline",
            returnZ: true,
            source: [new Graphic({
                    attributes: {
                        ObjectID: 1
                    },
                    geometry: new geometry_1.Polyline({
                        spatialReference: spatialReference,
                        hasZ: true,
                        paths: [
                            [
                                [xmin, ymax, 0],
                                [xmin, ymax, depth]
                            ]
                        ]
                    })
                }), new Graphic({
                    attributes: {
                        ObjectID: 2
                    },
                    geometry: new geometry_1.Polyline({
                        spatialReference: spatialReference,
                        hasZ: true,
                        paths: [
                            [
                                [xmin, ymin, 0],
                                [xmin, ymin, depth]
                            ]
                        ]
                    })
                }), new Graphic({
                    attributes: {
                        ObjectID: 3
                    },
                    geometry: new geometry_1.Polyline({
                        spatialReference: spatialReference,
                        hasZ: true,
                        paths: [
                            [
                                [xmax, ymax, 0],
                                [xmax, ymax, depth]
                            ]
                        ]
                    })
                }), new Graphic({
                    attributes: {
                        ObjectID: 4
                    },
                    geometry: new geometry_1.Polyline({
                        spatialReference: view.spatialReference,
                        hasZ: true,
                        paths: [
                            [
                                [xmax, ymin, 0],
                                [xmax, ymin, depth]
                            ]
                        ]
                    })
                })],
            renderer: new renderers_1.SimpleRenderer({
                symbol: new symbols_1.LineSymbol3D({
                    symbolLayers: [new symbols_1.LineSymbol3DLayer({
                            material: {
                                color: [105, 220, 255, 1]
                            },
                            size: 2
                        })]
                })
            })
        });
        console.log(layer);
        return layer;
    }
    function createTickLabelLayer(view, extent, depth, exaggeration, interval) {
        var tickLabelLayer = new FeatureLayer({
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
                    symbol: new symbols_1.LabelSymbol3D({
                        symbolLayers: [new symbols_1.TextSymbol3DLayer({
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
            renderer: new renderers_1.SimpleRenderer({
                symbol: new symbols_1.PointSymbol3D({
                    symbolLayers: [new symbols_1.IconSymbol3DLayer({
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
                        })]
                })
            })
        });
        return tickLabelLayer;
    }
    function createTicks(extent, interval, depth, exaggeration) {
        var features = [];
        var trueDepth = Math.round(Math.abs(depth / exaggeration));
        var xmin = extent.xmin, xmax = extent.xmax, ymax = extent.ymax, ymin = extent.ymin, spatialReference = extent.spatialReference;
        for (var i = 0; i <= trueDepth; i += interval) {
            var depthValue = i === 0 ? i : -i;
            features.push(new Graphic({
                attributes: {
                    ObjectID: i,
                    label: "  " + Math.round(depthValue) + " m"
                },
                geometry: new geometry_1.Point({
                    spatialReference: spatialReference,
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
                    ObjectID: i + 2,
                    label: "  " + Math.round(depthValue) + " m"
                },
                geometry: new geometry_1.Point({
                    spatialReference: spatialReference,
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
    function createPlanes(extent, interval, depth, exaggeration) {
        var features = [];
        var trueDepth = Math.round(Math.abs(depth / exaggeration));
        var xmin = extent.xmin, xmax = extent.xmax, ymin = extent.ymin, ymax = extent.ymax, spatialReference = extent.spatialReference;
        for (var i = 0; i <= trueDepth; i += interval) {
            var depthValue = i === 0 ? i : -i;
            features.push(new Graphic({
                attributes: {
                    ObjectID: i,
                    label: "  " + Math.round(depthValue) + " m"
                },
                geometry: new geometry_1.Polygon({
                    spatialReference: spatialReference,
                    rings: [[
                            [xmin, ymin, depthValue * exaggeration],
                            [xmin, ymax, depthValue * exaggeration],
                            [xmax, ymax, depthValue * exaggeration],
                            [xmax, ymin, depthValue * exaggeration],
                            [xmin, ymin, depthValue * exaggeration]
                        ]],
                    hasZ: true
                })
            }));
        }
        return features;
    }
    function createHorizontalMeasurementPlanes(view, extent, depth, exaggeration, interval) {
        var horizontalPlanesLayer = new FeatureLayer({
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
            renderer: new renderers_1.SimpleRenderer({
                symbol: new symbols_1.PolygonSymbol3D({
                    symbolLayers: [new symbols_1.FillSymbol3DLayer({
                            material: {
                                color: [105, 220, 255, 0.25]
                            },
                            outline: {
                                color: [105, 220, 255, 0.5],
                                size: 2
                            }
                        })]
                })
            })
        });
        console.log("planes", horizontalPlanesLayer);
        return horizontalPlanesLayer;
    }
});
//# sourceMappingURL=depthUtils.js.map