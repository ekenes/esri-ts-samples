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
define(["require", "exports", "esri/Map", "esri/views/MapView", "esri/layers/FeatureLayer", "esri/widgets/Sketch/SketchViewModel", "esri/Graphic", "esri/PopupTemplate", "esri/symbols"], function (require, exports, EsriMap, MapView, FeatureLayer, SketchViewModel, Graphic, PopupTemplate, symbols_1) {
    "use strict";
    var _this = this;
    Object.defineProperty(exports, "__esModule", { value: true });
    (function () { return __awaiter(_this, void 0, void 0, function () {
        function addGraphic(event) {
            // Create a new graphic and set its geometry to
            // `create-complete` event geometry.
            var graphic = new Graphic({
                geometry: event.geometry,
                symbol: sketchViewModel.graphic.symbol
            });
            view.graphics.add(graphic);
            // createArcade(event.geometry);
            layer.popupTemplate = createPopupTemplate(event.geometry);
            console.log(layer.popupTemplate);
        }
        function createPopupTemplate(geometry) {
            return new PopupTemplate({
                expressionInfos: [{
                        expression: createArcade(geometry),
                        name: "circle"
                    }],
                content: "{expression/circle}"
            });
        }
        function createArcade(geometry) {
            var geometryJson = JSON.stringify(geometry.toJSON());
            return "\n      var circle = Polygon(" + geometryJson + ");\n      var featureArea = GeodesicArea( $feature, \"square-kilometers\" );\n      var intersectedArea = IIF( Intersects( $feature, circle ), \n        GeodesicArea( Intersection( $feature, circle ) , \"square-kilometers\" ), \n        featureArea \n      );\n\n      return ( intersectedArea / featureArea );\n    ";
        }
        function setActiveButton(selectedButton) {
            // focus the view to activate keyboard shortcuts for sketching
            view.focus();
            var elements = document.getElementsByClassName("active");
            for (var i = 0; i < elements.length; i++) {
                elements[i].classList.remove("active");
            }
            if (selectedButton) {
                selectedButton.classList.add("active");
            }
        }
        var layer, map, view, polygonSymbol, sketchViewModel, drawCircleButton;
        var _this = this;
        return __generator(this, function (_a) {
            layer = new FeatureLayer({
                portalItem: {
                    id: "2bd5af2e50484ea483d5ff1a2c24d605"
                }
            });
            map = new EsriMap({
                basemap: "streets",
                layers: [layer]
            });
            view = new MapView({
                map: map,
                container: "viewDiv",
                extent: {
                    spatialReference: {
                        wkid: 3857
                    },
                    xmin: -29633185,
                    ymin: 3308563,
                    xmax: -27145618,
                    ymax: 5226215
                }
            });
            polygonSymbol = new symbols_1.SimpleFillSymbol({
                color: "rgba(138,43,226, 0.8)",
                style: "solid",
                outline: {
                    color: "white",
                    width: 1
                }
            });
            sketchViewModel = new SketchViewModel({
                view: view,
                polygonSymbol: polygonSymbol
            });
            sketchViewModel.on("create-complete", addGraphic);
            drawCircleButton = document.getElementById("circleButton");
            drawCircleButton.addEventListener("click", function () {
                sketchViewModel.create("circle");
                setActiveButton(_this);
            });
            return [2 /*return*/];
        });
    }); })();
});
//# sourceMappingURL=main.js.map