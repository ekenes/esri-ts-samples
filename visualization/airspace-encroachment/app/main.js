var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
define(["require", "exports", "esri/Map", "esri/views/SceneView", "esri/Camera", "esri/layers/FeatureLayer", "esri/layers/CSVLayer", "esri/layers/GroupLayer", "esri/geometry/geometryEngine", "esri/tasks/support/StatisticDefinition", "esri/widgets/BasemapToggle", "esri/widgets/Expand", "esri/widgets/LayerList", "esri/widgets/Legend", "esri/widgets/Home", "esri/renderers", "esri/geometry", "esri/symbols"], function (require, exports, EsriMap, SceneView, Camera, FeatureLayer, CSVLayer, GroupLayer, geometryEngine, StatisticDefinition, BasemapToggle, Expand, LayerList, Legend, Home, renderers_1, geometry_1, symbols_1) {
    "use strict";
    var _this = this;
    Object.defineProperty(exports, "__esModule", { value: true });
    (function () { return __awaiter(_this, void 0, void 0, function () {
        /**
         * Creates a new renderer if the user provides new data or updated height info
         *
         * @param params {CreateClassificationParams}
         */
        function createClassification(params) {
            var projectGeometry = params.projectGeometry;
            var height = params.projectHeight;
            var riskLevels = {
                low: 500,
                medium: 300,
                high: 50
            };
            var riskLevelBuffers = {};
            // buffering outside of renderer function boosts performance
            for (var level in riskLevels) {
                riskLevelBuffers[level] = geometryEngine.geodesicBuffer(projectGeometry, riskLevels[level], "feet");
            }
            // function that checks if each airspace zone meets the designated criteria
            var classifyFeatures = function (graphic) {
                var floorValue = graphic.attributes.FL_ALT;
                var geom = graphic.geometry;
                var risk = "none"; // none | low | medium | high
                for (var level in riskLevels) {
                    var bufferValue = riskLevels[level];
                    var heightRisk = height >= (floorValue - bufferValue);
                    var xyRisk = geometryEngine.intersects(geom, riskLevelBuffers[level]);
                    risk = heightRisk && xyRisk ? level : risk;
                }
                return risk;
            };
            return new renderers_1.UniqueValueRenderer({
                field: classifyFeatures,
                legendOptions: {
                    title: "Risk of Encroachment"
                },
                uniqueValueInfos: [{
                        value: "high",
                        symbol: createSymbol([244, 66, 66, 0.2], [244, 66, 66]),
                        label: "High"
                    }, {
                        value: "medium",
                        symbol: createSymbol([244, 146, 65, 0.2], [244, 146, 65]),
                        label: "Medium"
                    }, {
                        value: "low",
                        symbol: createSymbol([244, 238, 65, 0.2], [244, 238, 65]),
                        label: "Low"
                    }],
                defaultSymbol: createSymbol([112, 244, 65, 0.2], [112, 244, 65]),
                defaultLabel: "None",
                visualVariables: [reservedAirspaceHeight]
            });
        }
        function createSymbol(color, useEdges) {
            var edges = {
                type: "solid",
                color: useEdges,
                size: 2
            };
            return new symbols_1.PolygonSymbol3D({
                symbolLayers: [new symbols_1.ExtrudeSymbol3DLayer({
                        material: {
                            color: color
                        },
                        edges: useEdges ? edges : null
                    })]
            });
        }
        function updateRenderer(geometry, height) {
            var inputHeight = heightInputElem.value;
            var projectGeometry = geometry;
            var projectHeight = height ? height : parseInt(inputHeight);
            if (!projectGeometry || !projectHeight) {
                console.log("Missing parameters. Please draw a project area and enter a project height.");
                return;
            }
            var rendererParams = {
                projectGeometry: projectGeometry,
                projectHeight: projectHeight
            };
            var classifiedRenderer = createClassification(rendererParams);
            reservedAirspace.renderer = classifiedRenderer;
            updateObjectHeight(projectHeight);
        }
        function updateObjectHeight(newHeight) {
            var layer = proposalLayer.layers.find(function (layer) {
                return layer.title === "Oil Derricks";
            });
            var oldRenderer = layer.renderer;
            var newRenderer = oldRenderer.clone();
            newRenderer.visualVariables = [{
                    type: "size",
                    valueExpression: newHeight.toString(),
                    axis: "height",
                    valueUnit: "feet"
                }];
            layer.renderer = newRenderer;
        }
        var reservedAirspaceHeight, initialRenderer, currentGeometry, webStyleRenderer, iconRenderer, reservedAirspace, map, view, url, projectPointsIcons, webStyleLayer, proposalLayer, statsQuery, maxHeight, heightResults, stats, heightInputElem, projectPointsResults, graphics, multipointGeom, toggle, layerListExpand, zoomBtn;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    reservedAirspaceHeight = {
                        type: "size",
                        valueExpression: "$feature.CEIL_ALT - $feature.FL_ALT",
                        valueUnit: "feet"
                    };
                    initialRenderer = new renderers_1.SimpleRenderer({
                        symbol: {
                            type: "polygon-3d",
                            symbolLayers: [{
                                    type: "extrude",
                                    size: 1000,
                                    material: {
                                        color: [255, 255, 255, 0]
                                    },
                                    edges: {
                                        type: "solid",
                                        color: "#2b7bff",
                                        size: 1.25
                                    }
                                }]
                        },
                        visualVariables: [reservedAirspaceHeight]
                    });
                    webStyleRenderer = new renderers_1.SimpleRenderer({
                        symbol: new symbols_1.WebStyleSymbol({
                            styleUrl: "https://www.arcgis.com/sharing/rest/content/items/48c5d69ad6b646d5aa77c733376f06dc/data",
                            name: "oil_rig"
                        }),
                        visualVariables: [{
                                type: "size",
                                field: "Height_Total",
                                axis: "height",
                                valueUnit: "feet"
                            }]
                    });
                    iconRenderer = new renderers_1.SimpleRenderer({
                        symbol: {
                            type: "point-3d",
                            symbolLayers: [{
                                    type: "icon",
                                    style: "kite",
                                    material: {
                                        color: "purple"
                                    },
                                    size: 6,
                                    outline: {
                                        color: "white",
                                        size: 1.2
                                    }
                                }]
                        },
                    });
                    reservedAirspace = new FeatureLayer({
                        portalItem: {
                            id: "75c499b5586c4cdd80af23ab4410af3e"
                        },
                        title: "Military Special Use Airspace",
                        popupTemplate: {
                            title: "{NAME}",
                            content: [{
                                    type: "fields",
                                    fieldInfos: [{
                                            fieldName: "CON_AGCY",
                                            label: "Jurisdiction"
                                        }, {
                                            fieldName: "FL_ALT",
                                            label: "Elevation Floor (ft)",
                                            format: {
                                                digitSeparator: true,
                                                places: 0
                                            }
                                        }, {
                                            fieldName: "CEIL_ALT",
                                            label: "Elevation Ceiling (ft)",
                                            format: {
                                                digitSeparator: true,
                                                places: 0
                                            }
                                        }]
                                }]
                        },
                        renderer: initialRenderer,
                        elevationInfo: {
                            mode: "relative-to-ground",
                            featureExpressionInfo: {
                                expression: "$feature.FL_ALT"
                            },
                            unit: "feet"
                        }
                    });
                    map = new EsriMap({
                        basemap: "hybrid",
                        ground: "world-elevation",
                        layers: [reservedAirspace]
                    });
                    view = new SceneView({
                        container: "viewDiv",
                        map: map,
                        viewingMode: "local",
                        clippingArea: {
                            spatialReference: {
                                wkid: 3857
                            },
                            xmin: -10299155,
                            ymin: 2535352,
                            xmax: -8610249,
                            ymax: 3645618
                        },
                        camera: {
                            position: {
                                spatialReference: {
                                    wkid: 3857
                                },
                                x: -9595420,
                                y: 3839597,
                                z: 166873
                            },
                            heading: 164,
                            tilt: 62
                        }
                    });
                    return [4 /*yield*/, view.when()];
                case 1:
                    _a.sent();
                    url = "./app/fake_oil_rigs.csv";
                    projectPointsIcons = new CSVLayer({
                        url: url,
                        delimiter: ",",
                        spatialReference: {
                            wkid: 3857
                        },
                        renderer: iconRenderer,
                        elevationInfo: {
                            mode: "on-the-ground"
                        }
                    });
                    webStyleLayer = new CSVLayer({
                        url: url,
                        title: "Oil Derricks",
                        delimiter: ",",
                        spatialReference: {
                            wkid: 3857
                        },
                        renderer: webStyleRenderer,
                        elevationInfo: {
                            mode: "on-the-ground"
                        },
                        popupTemplate: {
                            title: "{site_name} ({unique_id})",
                            content: [{
                                    type: "fields",
                                    fieldInfos: [{
                                            fieldName: "Company",
                                            label: "Company"
                                        }, {
                                            fieldName: "Height_Total",
                                            label: "Total Height (ft)"
                                        }, {
                                            fieldName: "Length_Overall",
                                            label: "Length (ft)"
                                        }, {
                                            fieldName: "Breadth_Overall",
                                            label: "Breadth Length (ft)"
                                        }, {
                                            fieldName: "Heli_Deck",
                                            label: "Helicopter deck?"
                                        }]
                                }]
                        }
                    });
                    proposalLayer = new GroupLayer({
                        title: "Proposed Wind Locations",
                        layers: [projectPointsIcons, webStyleLayer],
                        listMode: "hide-children",
                        visibilityMode: "inherited"
                    });
                    map.add(proposalLayer);
                    statsQuery = projectPointsIcons.createQuery();
                    statsQuery.outStatistics = [new StatisticDefinition({
                            statisticType: "max",
                            onStatisticField: "Height_Total",
                            outStatisticFieldName: "maxHeight"
                        })];
                    maxHeight = 0;
                    return [4 /*yield*/, projectPointsIcons.queryFeatures(statsQuery)];
                case 2:
                    heightResults = _a.sent();
                    stats = heightResults.features[0].attributes;
                    maxHeight = stats.maxHeight;
                    heightInputElem = document.getElementById("heightInput");
                    heightInputElem.value = maxHeight.toString();
                    return [4 /*yield*/, projectPointsIcons.queryFeatures()];
                case 3:
                    projectPointsResults = _a.sent();
                    graphics = projectPointsResults.features;
                    multipointGeom = new geometry_1.Multipoint({
                        spatialReference: { wkid: 3857 }
                    });
                    graphics.forEach(function (f) {
                        var point = f.geometry;
                        multipointGeom.addPoint(point);
                    });
                    currentGeometry = multipointGeom;
                    updateRenderer(multipointGeom, maxHeight);
                    toggle = new BasemapToggle({
                        view: view,
                        nextBasemap: "topo"
                    });
                    view.ui.add(toggle, "bottom-left");
                    view.ui.add(new Expand({
                        view: view,
                        group: "top-left",
                        content: new Legend({
                            view: view,
                            layerInfos: [{
                                    layer: reservedAirspace
                                }]
                        }),
                        expanded: true
                    }), "top-left");
                    layerListExpand = new Expand({
                        view: view,
                        group: "top-left",
                        content: new LayerList({
                            view: view
                        }),
                        expanded: false
                    });
                    view.ui.add(layerListExpand, "top-left");
                    heightInputElem.addEventListener("change", function () {
                        updateRenderer(currentGeometry);
                    });
                    zoomBtn = document.getElementById("zoomBtn");
                    view.ui.add(zoomBtn, { position: "top-left", index: 3 });
                    view.ui.add(new Home({ view: view }), { position: "top-left", index: 3 });
                    zoomBtn.addEventListener("click", function () {
                        view.goTo(new Camera({
                            position: {
                                spatialReference: {
                                    wkid: 3857
                                },
                                x: -9836929,
                                y: 3435978,
                                z: 168
                            },
                            heading: 246,
                            tilt: 81
                        }));
                    });
                    return [2 /*return*/];
            }
        });
    }); })();
});
//# sourceMappingURL=main.js.map