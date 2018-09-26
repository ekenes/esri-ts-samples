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
define(["require", "exports", "esri/Map", "esri/views/MapView", "esri/widgets/Legend", "esri/layers/FeatureLayer", "esri/renderers/smartMapping/creators/predominance", "esri/renderers/smartMapping/symbology/predominance", "esri/renderers/smartMapping/creators/size"], function (require, exports, EsriMap, MapView, Legend, FeatureLayer, predominanceRendererCreator, predominanceSchemes, sizeRendererCreator) {
    "use strict";
    var _this = this;
    Object.defineProperty(exports, "__esModule", { value: true });
    (function () { return __awaiter(_this, void 0, void 0, function () {
        function createPredominanceRenderer() {
            var selectedOptions = [].slice.call(fieldList.selectedOptions);
            if (selectedOptions.length === 1) {
                return createSizeRenderer(selectedOptions[0].value);
            }
            var fields = selectedOptions.map(function (option) {
                return {
                    name: option.value,
                    label: option.text
                };
            });
            var params = {
                view: view,
                layer: layer,
                fields: fields,
                predominanceScheme: schemes.secondarySchemes[6],
                sortBy: "value",
                basemap: view.map.basemap,
                includeSizeVariable: includeSizeCheckbox.checked,
                includeOpacityVariable: includeOpacityCheckbox.checked,
                legendOptions: {
                    title: "Most common decade in which homes were built"
                }
            };
            return predominanceRendererCreator.createRenderer(params);
        }
        function createSizeRenderer(field) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, sizeRendererCreator.createContinuousRenderer({
                            layer: layer,
                            basemap: map.basemap,
                            field: field,
                            legendOptions: {
                                title: "Number of homes built"
                            }
                        })];
                });
            });
        }
        function applyRenderer(response) {
            layer.renderer = response.renderer;
        }
        var layer, map, view, fieldList, includeSizeCheckbox, includeOpacityCheckbox, elements, schemes, predominanceResponse, popupArcade;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    layer = new FeatureLayer({
                        portalItem: {
                            id: "e1f194d5f3184402a8a39b60b44693f4"
                        },
                        outFields: ["*"],
                        title: "Boise Block Groups",
                        opacity: 0.9
                    });
                    map = new EsriMap({
                        basemap: {
                            portalItem: {
                                id: "75a3ce8990674a5ebd5b9ab66bdab893"
                            }
                        },
                        layers: [layer]
                    });
                    view = new MapView({
                        map: map,
                        container: "viewDiv",
                        center: [-116.3126, 43.60703],
                        zoom: 11,
                        constraints: {
                            minScale: 600000
                        }
                    });
                    view.ui.add(new Legend({ view: view }), "bottom-left");
                    return [4 /*yield*/, view.when()];
                case 1:
                    _a.sent();
                    fieldList = document.getElementById("fieldList");
                    includeSizeCheckbox = document.getElementById("includeSize");
                    includeOpacityCheckbox = document.getElementById("includeOpacity");
                    elements = [fieldList, includeOpacityCheckbox, includeSizeCheckbox];
                    // Each time the user changes the value of one of the DOM elements
                    // (list box and two checkboxes), then generate a new predominance visualization
                    elements.forEach(function (element) {
                        var _this = this;
                        element.addEventListener("change", function () { return __awaiter(_this, void 0, void 0, function () {
                            var predominanceResponse;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, createPredominanceRenderer()];
                                    case 1:
                                        predominanceResponse = _a.sent();
                                        applyRenderer(predominanceResponse);
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                    });
                    schemes = predominanceSchemes.getSchemes({
                        basemap: map.basemap,
                        geometryType: "polygon",
                        numColors: 10
                    });
                    return [4 /*yield*/, createPredominanceRenderer()];
                case 2:
                    predominanceResponse = _a.sent();
                    applyRenderer(predominanceResponse);
                    popupArcade = "\n    var numTopValues = 10;\n\n    var groups = [\n      {\n        value: $feature.ACSBLT1939,\n        alias: \"Before 1940\"\n      }, {\n        value: $feature.ACSBLT1940,\n        alias: \"1940s\"\n      }, {\n        value: $feature.ACSBLT1950,\n        alias: \"1950s\"\n      }, {\n        value: $feature.ACSBLT1960,\n        alias: \"1960s\"\n      }, {\n        value: $feature.ACSBLT1970,\n        alias: \"1970s\"\n      }, {\n        value: $feature.ACSBLT1980,\n        alias: \"1980s\"\n      }, {\n        value: $feature.ACSBLT1990,\n        alias: \"1990s\"\n      }, {\n        value: $feature.ACSBLT2000,\n        alias: \"2000s\"\n      }, {\n        value: $feature.ACSBLT2010,\n        alias: \"2010-2014\"\n      }, {\n        value: $feature.ACSBLT2014,\n        alias: \"After 2014\"\n      }\n    ];\n\n    function getValuesArray(a){\n      var valuesArray = []\n      for(var i in a){\n        valuesArray[i] = a[i].value;\n      }\n      return valuesArray;\n    }\n\n    function findAliases(top5a,fulla){\n      var aliases = [];\n      var found = \"\";\n      for(var i in top5a){\n        for(var k in fulla){\n          if(top5a[i] == fulla[k].value && Find(fulla[k].alias, found) == -1){\n            found += fulla[k].alias;\n            aliases[Count(aliases)] = {\n              alias: fulla[k].alias,\n              value: top5a[i]\n            };\n          }\n        }\n      }\n      return aliases;\n    }\n    \n    function getTopGroups(groupsArray){\n        \n      var values = getValuesArray(groupsArray);\n      var top5Values = IIF(Max(values) > 0, Top(Reverse(Sort(values)),numTopValues), \"no data\");\n      var top5Aliases = findAliases(top5Values,groupsArray);\n        \n      if(TypeOf(top5Values) == \"String\"){\n        return top5Values;\n      } else {\n        var content = \"\";\n        for(var i in top5Aliases){\n          if(top5Aliases[i].value > 0){\n            content += (i+1) + \". \" + top5Aliases[i].alias + \" (\" + Text(top5Aliases[i].value, \"#,###\") + \")\";\n            content += IIF(i < numTopValues-1, TextFormatting.NewLine, \"\");\n          }\n        }\n      }\n        \n      return content;\n    }\n    \n    getTopGroups(groups);\n  ";
                    layer.popupTemplate = {
                        title: "Number of homes built by decade",
                        content: "{expression/ordered-list-arcade}",
                        expressionInfos: [{
                                name: "ordered-list-arcade",
                                title: "Top 10",
                                expression: popupArcade
                            }]
                    };
                    return [2 /*return*/];
            }
        });
    }); })();
});
//# sourceMappingURL=main.js.map