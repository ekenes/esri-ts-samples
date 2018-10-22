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
define(["require", "exports", "esri/Map", "esri/views/MapView", "esri/widgets/Legend", "esri/layers/FeatureLayer", "esri/PopupTemplate", "esri/renderers", "esri/renderers/visualVariables/SizeVariable", "esri/symbols"], function (require, exports, EsriMap, MapView, Legend, FeatureLayer, PopupTemplate, renderers_1, SizeVariable, symbols_1) {
    "use strict";
    var _this = this;
    Object.defineProperty(exports, "__esModule", { value: true });
    (function () { return __awaiter(_this, void 0, void 0, function () {
        var defaultSym, defExp, renderer, povLayer, map, view, legend;
        return __generator(this, function (_a) {
            defaultSym = new symbols_1.SimpleMarkerSymbol({
                color: [0, 0, 0, 0],
                outline: {
                    color: "gray",
                    width: 0.5
                }
            });
            defExp = ["STATE = 'LA'", "STATE = 'AL'", "STATE = 'AR'",
                "STATE = 'MS'", "STATE = 'TN'", "STATE = 'GA'",
                "STATE = 'FL'", "STATE = 'SC'", "STATE = 'NC'",
                "STATE = 'VA'", "STATE = 'KY'", "STATE = 'WV'"
            ];
            renderer = new renderers_1.SimpleRenderer({
                symbol: defaultSym,
                label: "% population in poverty by county",
                visualVariables: [new SizeVariable({
                        field: "POP_POVERTY",
                        normalizationField: "TOTPOP_CY",
                        stops: [
                            {
                                value: 0.1,
                                size: 2,
                                label: "<10%"
                            },
                            {
                                value: 0.3,
                                size: 20,
                                label: ">30%"
                            }
                        ]
                    })]
            });
            povLayer = new FeatureLayer({
                url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/counties_politics_poverty/FeatureServer/0",
                renderer: renderer,
                outFields: ["*"],
                popupTemplate: new PopupTemplate({
                    title: "{COUNTY}, {STATE}",
                    content: "{POP_POVERTY} of {TOTPOP_CY} people live below the poverty line.",
                    fieldInfos: [
                        {
                            fieldName: "POP_POVERTY",
                            format: {
                                digitSeparator: true,
                                places: 0
                            }
                        }, {
                            fieldName: "TOTPOP_CY",
                            format: {
                                digitSeparator: true,
                                places: 0
                            }
                        }
                    ]
                }),
                definitionExpression: defExp.join(" OR ")
            });
            map = new EsriMap({
                basemap: "gray",
                layers: [povLayer]
            });
            view = new MapView({
                container: "viewDiv",
                map: map,
                center: [-85.050200, 33.125524],
                zoom: 6
            });
            legend = new Legend({
                view: view,
                layerInfos: [
                    {
                        layer: povLayer,
                        title: "Poverty in the southeast U.S."
                    }
                ]
            });
            view.ui.add(legend, "top-right");
            return [2 /*return*/];
        });
    }); })();
});
//# sourceMappingURL=main.js.map