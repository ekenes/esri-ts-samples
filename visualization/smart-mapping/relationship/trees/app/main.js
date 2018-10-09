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
define(["require", "exports", "esri/Map", "esri/views/SceneView", "esri/layers/FeatureLayer", "esri/widgets/Legend", "esri/renderers/smartMapping/symbology/relationship", "esri/renderers/smartMapping/creators/relationship", "esri/symbols"], function (require, exports, EsriMap, SceneView, FeatureLayer, Legend, relationshipSchemes, relationshipRendererCreator, symbols_1) {
    "use strict";
    var _this = this;
    Object.defineProperty(exports, "__esModule", { value: true });
    (function () { return __awaiter(_this, void 0, void 0, function () {
        /**
         * Creates a relationship renderer
         */
        function createRelationshipRenderer() {
            return __awaiter(this, void 0, void 0, function () {
                var schemes, params;
                return __generator(this, function (_a) {
                    schemes = relationshipSchemes.getSchemes({
                        basemap: map.basemap,
                        geometryType: layer.geometryType
                    });
                    params = {
                        relationshipScheme: schemes.secondarySchemes[8],
                        layer: layer,
                        view: view,
                        basemap: map.basemap,
                        field1: {
                            field: field1Select.value
                        },
                        field2: {
                            field: field2Select.value
                        },
                        numClasses: 4
                    };
                    return [2 /*return*/, relationshipRendererCreator.createRenderer(params)];
                });
            });
        }
        function applyRenderer(response) {
            var renderer = response.renderer;
            var uniqueValueInfos = response.renderer.uniqueValueInfos.map(function (info) {
                var oldSymbol = info.symbol;
                var newSymbol = oldSymbol;
                info.symbol = create3DObjectSymbol(newSymbol.color.clone());
                switch (info.value) {
                    case "HH":
                        info.label = "High " + field1Select.value + ", High " + field2Select.value;
                        break;
                    case "HL":
                        info.label = "High " + field1Select.value + ", Low " + field2Select.value;
                        break;
                    case "LH":
                        info.label = "Low " + field1Select.value + ", High " + field2Select.value;
                        break;
                    case "LL":
                        info.label = "Low " + field1Select.value + ", Low " + field2Select.value;
                        break;
                }
                return info;
            });
            renderer.defaultSymbol = new symbols_1.WebStyleSymbol({
                styleName: "esriRealisticTreesStyle",
                name: "Other"
            });
            renderer.defaultLabel = "Tree";
            renderer.uniqueValueInfos = uniqueValueInfos;
            renderer.visualVariables = [{
                    type: "size",
                    axis: "height",
                    field: "Height",
                    valueUnit: "feet"
                }, {
                    type: "size",
                    axis: "width",
                    field: "Width_EW",
                    valueUnit: "feet"
                }, {
                    type: "size",
                    axis: "depth",
                    field: "Width_NS",
                    valueUnit: "feet"
                }];
            layer.renderer = renderer;
        }
        function create3DObjectSymbol(color) {
            return new symbols_1.PointSymbol3D({
                symbolLayers: [new symbols_1.ObjectSymbol3DLayer({
                        resource: {
                            href: "https://static.arcgis.com/arcgis/styleItems/RealisticTrees/web/resource/Other.json"
                        },
                        material: {
                            color: color
                        }
                    })]
            });
        }
        function createSelectElements(layer) {
            var panel = document.getElementById("panelDiv");
            field1Select = document.createElement("select");
            panel.appendChild(field1Select);
            layer.fields.filter(function (field) {
                var validTypes = ["integer", "double"];
                return validTypes.indexOf(field.type) > -1 && field.name !== "Tree_ID";
            }).forEach(function (field, i) {
                var option = document.createElement("option");
                option.value = field.name;
                option.text = field.alias;
                field1Select.appendChild(option);
            });
            field2Select = field1Select.cloneNode(true);
            field1Select.options[18].selected = true;
            field2Select.options[8].selected = true;
            panel.appendChild(field2Select);
            field1Select.classList.add("esri-widget");
            field2Select.classList.add("esri-widget");
            field1Select.addEventListener("change", selectListener);
            field2Select.addEventListener("change", selectListener);
        }
        function selectListener() {
            return __awaiter(this, void 0, void 0, function () {
                var relationshipResponse;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, createRelationshipRenderer()];
                        case 1:
                            relationshipResponse = _a.sent();
                            applyRenderer(relationshipResponse);
                            return [2 /*return*/];
                    }
                });
            });
        }
        var layer, map, view, legend, relationshipResponse, field1Select, field2Select;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    layer = new FeatureLayer({
                        url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/Landscape_Trees/FeatureServer/0",
                        popupTemplate: {
                            title: "{Cmn_Name}",
                            content: "<i>{Sci_Name}</i><br>" +
                                "This tree is in {Condition} condition and is {Height} feet in height."
                        }
                    });
                    map = new EsriMap({
                        basemap: "osm",
                        ground: "world-elevation",
                        layers: [layer]
                    });
                    view = new SceneView({
                        container: "viewDiv",
                        map: map,
                        camera: {
                            position: {
                                x: -9177356,
                                y: 4246783,
                                z: 723,
                                spatialReference: {
                                    wkid: 3857
                                }
                            },
                            heading: 0,
                            tilt: 83
                        },
                        highlightOptions: {
                            color: "#ff23d3"
                        },
                        // Set dock options on the view's popup
                        popup: {
                            dockEnabled: true,
                            dockOptions: {
                                breakpoint: false
                            }
                        },
                        // enable shadows to be cast from the features
                        environment: {
                            lighting: {
                                directShadowsEnabled: true
                            }
                        }
                    });
                    view.ui.add("panelDiv", "top-right");
                    legend = new Legend({
                        view: view
                    });
                    view.ui.add(legend, "bottom-left");
                    return [4 /*yield*/, view.when()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, layer.when()];
                case 2:
                    _a.sent();
                    createSelectElements(layer);
                    return [4 /*yield*/, createRelationshipRenderer()];
                case 3:
                    relationshipResponse = _a.sent();
                    applyRenderer(relationshipResponse);
                    return [2 /*return*/];
            }
        });
    }); })();
});
//# sourceMappingURL=main.js.map