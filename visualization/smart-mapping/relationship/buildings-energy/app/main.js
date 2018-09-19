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
define(["require", "exports", "esri/Map", "esri/views/SceneView", "esri/layers/SceneLayer", "esri/widgets/Legend", "esri/renderers/smartMapping/creators/relationship"], function (require, exports, EsriMap, SceneView, SceneLayer, Legend, relationshipRendererCreator) {
    "use strict";
    var _this = this;
    Object.defineProperty(exports, "__esModule", { value: true });
    (function () { return __awaiter(_this, void 0, void 0, function () {
        function createRelationshipRenderer() {
            return __awaiter(this, void 0, void 0, function () {
                var params;
                return __generator(this, function (_a) {
                    params = {
                        layer: layer,
                        view: view,
                        basemap: map.basemap,
                        field1: {
                            field: "StarScore"
                        },
                        field2: {
                            field: "ElectricUse"
                        },
                        focus: "HH",
                        numClasses: 2,
                        edgesType: "solid"
                    };
                    return [2 /*return*/, relationshipRendererCreator.createRenderer(params)];
                });
            });
        }
        function applyRenderer(response) {
            var renderer = response.renderer;
            var uniqueValueInfos = response.renderer.uniqueValueInfos.map(function (info) {
                switch (info.value) {
                    case "HH":
                        info.label = "High energy score, High electric use";
                        break;
                    case "HL":
                        info.label = "High energy score, Low electric use";
                        break;
                    case "LH":
                        info.label = "Low energy score, High electric use";
                        break;
                    case "LL":
                        info.label = "Low energy score, Low electric use";
                        break;
                }
                return info;
            });
            renderer.uniqueValueInfos = uniqueValueInfos;
            layer.renderer = renderer;
        }
        /**
        * Changes the labels and orientation of the relationship legend.
        *
        * @param {module:esri/renderers/UniqueValueRenderer} renderer - An instance of a relationship renderer.
        * @param {boolean} showDescriptiveLabels - Indicates whether to orient the legend as a diamond and display
        *   descriptive labels. If `false`, then the legend is oriented as a square with numeric labels, similar to
        *   a chart with an x/y axis.
        *
        * @return {renderer} - The input renderer with the modified descriptions and orientation.
        */
        function changeRendererLabels(renderer, showDescriptiveLabels) {
            var numClasses = renderer.authoringInfo.numClasses;
            var field1max = renderer.authoringInfo.field1.classBreakInfos[numClasses - 1].maxValue;
            var field2max = renderer.authoringInfo.field2.classBreakInfos[numClasses - 1].maxValue;
            renderer.uniqueValueInfos.forEach(function (info) {
                switch (info.value) {
                    case "HH":
                        info.label = showDescriptiveLabels ? "High energy score, High electric use" : "";
                        break;
                    case "HL":
                        info.label = showDescriptiveLabels ? "High energy score, Low electric use" : field1max.toLocaleString();
                        break;
                    case "LH":
                        info.label = showDescriptiveLabels ? "Low energy score, High electric use" : field2max.toLocaleString();
                        break;
                    case "LL":
                        info.label = showDescriptiveLabels ? "Low energy score, Low electric use" : "0";
                        break;
                }
            });
            // When a focus is specified, the legend renders as a diamond with the
            // indicated focus value on the top. If no value is specified, then
            // the legend renders as a square
            renderer.authoringInfo.focus = showDescriptiveLabels ? "HH" : null;
            return renderer;
        }
        var layer, map, view, legend, showDescriptiveLabelsElement, rendererResponse;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    layer = new SceneLayer({
                        portalItem: {
                            id: "16111531d25348c6b03f6b743e1874f1"
                        },
                    });
                    map = new EsriMap({
                        basemap: "satellite",
                        ground: "world-elevation",
                        layers: [layer]
                    });
                    view = new SceneView({
                        container: "viewDiv",
                        map: map,
                        camera: {
                            position: {
                                spatialReference: {
                                    wkid: 3857
                                },
                                x: -8240095,
                                y: 4968039,
                                z: 398
                            },
                            heading: 35,
                            tilt: 77
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
                    legend = new Legend({
                        view: view,
                        container: "legendDiv"
                    });
                    view.ui.add("infoDiv", "bottom-left");
                    return [4 /*yield*/, view.when()];
                case 1:
                    _a.sent();
                    showDescriptiveLabelsElement = document.getElementById("descriptive-labels");
                    showDescriptiveLabelsElement.addEventListener("change", function () {
                        var oldRenderer = layer.renderer;
                        var newRenderer = oldRenderer.clone();
                        layer.renderer = changeRendererLabels(newRenderer, showDescriptiveLabelsElement.checked);
                    });
                    return [4 /*yield*/, createRelationshipRenderer()];
                case 2:
                    rendererResponse = _a.sent();
                    applyRenderer(rendererResponse);
                    return [2 /*return*/];
            }
        });
    }); })();
});
//# sourceMappingURL=main.js.map