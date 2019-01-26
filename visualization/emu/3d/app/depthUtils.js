define(["require", "exports", "esri/layers/FeatureLayer", "esri/layers/GraphicsLayer", "esri/Graphic", "esri/layers/GroupLayer", "esri/geometry", "esri/symbols", "esri/renderers"], function (require, exports, FeatureLayer, GraphicsLayer, Graphic, GroupLayer, geometry_1, symbols_1, renderers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function createDepthRulerLayer(view, extent, depth, exaggeration) {
        var ruler = new GraphicsLayer({
            graphics: [{
                    geometry: new geometry_1.Polyline({
                        spatialReference: view.spatialReference,
                        hasZ: true,
                        paths: [
                            [
                                [extent.xmin, extent.ymax, 0],
                                [extent.xmin, extent.ymax, depth]
                            ]
                        ]
                    }),
                    symbol: new symbols_1.SimpleLineSymbol({
                        width: 2,
                        color: "#69dcff"
                    })
                }]
        });
        var rulerTickLayer = new FeatureLayer({
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
        var depthRuler = new GroupLayer({
            title: "Depth ruler",
            listMode: "hide-children",
            layers: [ruler, rulerTickLayer],
            visible: false
        });
        return depthRuler;
    }
    exports.createDepthRulerLayer = createDepthRulerLayer;
    function createGraphics(extent, interval, depth, exaggeration) {
        var features = [];
        var trueDepth = Math.round(Math.abs(depth / exaggeration));
        for (var i = 0; i <= trueDepth; i += interval) {
            var depthValue = i === 0 ? i : -i;
            features.push(new Graphic({
                attributes: {
                    ObjectID: i,
                    label: "  " + Math.round(depthValue) + " m"
                },
                geometry: new geometry_1.Point({
                    spatialReference: extent.spatialReference,
                    x: extent.xmin,
                    y: extent.ymax,
                    z: depthValue * exaggeration
                })
            }));
        }
        return features;
    }
});
//# sourceMappingURL=depthUtils.js.map