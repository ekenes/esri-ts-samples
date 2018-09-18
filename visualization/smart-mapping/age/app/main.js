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
define(["require", "exports", "esri/Map", "esri/views/MapView", "esri/layers/FeatureLayer", "esri/renderers/smartMapping/creators/color", "esri/renderers/smartMapping/statistics/histogram", "esri/widgets/ColorSlider", "esri/core/lang"], function (require, exports, EsriMap, MapView, FeatureLayer, colorRendererCreator, histogram, ColorSlider, lang) {
    "use strict";
    var _this = this;
    Object.defineProperty(exports, "__esModule", { value: true });
    (function () { return __awaiter(_this, void 0, void 0, function () {
        var layer, map, view, ageParams, rendererResponse, histogramResult, colorSlider;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    layer = new FeatureLayer({
                        portalItem: {
                            id: "c8efe865f4184a2ca5c3581c025684b6"
                        },
                        popupTemplate: { // autocasts as new PopupTemplate()
                        // title: "{NAME}",
                        // content: [{
                        //   type: "fields",
                        //   fieldInfos: [
                        //   {
                        //     fieldName: "CNSTRCT_YR",
                        //     label: "Construction year"
                        //   }, {
                        //     fieldName: "HEIGHTROOF",
                        //     label: "Height (ft)"
                        //   }, {
                        //     fieldName: "NUM_FLOORS",
                        //     label: "Floors"
                        //   }]
                        // }],
                        // fieldInfos: [
                        // {
                        //   fieldName: "HEIGHTROOF",
                        //   format: {
                        //     digitSeparator: true,
                        //     places: 2
                        //   }
                        // }, {
                        //   fieldName: "NUM_FLOORS",
                        //   format: {
                        //     digitSeparator: true,
                        //     places: 0
                        //   }
                        // }]
                        }
                    });
                    map = new EsriMap({
                        basemap: "dark-gray-vector",
                        layers: [layer]
                    });
                    view = new MapView({
                        container: "viewDiv",
                        map: map,
                        center: [-93.2746, 44.9802],
                        zoom: 13
                    });
                    ageParams = {
                        layer: layer,
                        view: view,
                        basemap: map.basemap,
                        startTime: "INSPECTION_DATE",
                        endTime: Date.now(),
                        theme: "above-and-below",
                        maxValue: 15
                    };
                    return [4 /*yield*/, colorRendererCreator.createAgeRenderer(ageParams)];
                case 1:
                    rendererResponse = _a.sent();
                    // set the renderer to the layer and add it to the map
                    layer.renderer = rendererResponse.renderer;
                    map.add(layer);
                    return [4 /*yield*/, histogram({
                            layer: ageParams.layer,
                            view: ageParams.view,
                            valueExpression: rendererResponse.renderer.valueExpression,
                            numBins: 30
                        })];
                case 2:
                    histogramResult = _a.sent();
                    colorSlider = new ColorSlider({
                        numHandles: 3,
                        syncedHandles: true,
                        container: "slider",
                        maxValue: ageParams.maxValue,
                        statistics: rendererResponse.statistics,
                        visualVariable: rendererResponse.visualVariable,
                        histogram: histogramResult
                    });
                    view.ui.add("containerDiv", "bottom-left");
                    // when the user slides the handle(s), update the renderer
                    // with the updated color visual variable object
                    colorSlider.on("data-change", function () {
                        var oldRenderer = layer.renderer;
                        var newRenderer = oldRenderer.clone();
                        newRenderer.visualVariables = [lang.clone(colorSlider.visualVariable)];
                        layer.renderer = newRenderer;
                    });
                    return [2 /*return*/];
            }
        });
    }); })();
});
//# sourceMappingURL=main.js.map