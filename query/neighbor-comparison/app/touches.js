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
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
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
define(["require", "exports", "esri/WebMap", "esri/views/MapView", "esri/renderers/smartMapping/creators/color", "esri/widgets/Legend"], function (require, exports, WebMap, MapView, colorRendererCreator, Legend) {
    "use strict";
    var _this = this;
    Object.defineProperty(exports, "__esModule", { value: true });
    (function () { return __awaiter(_this, void 0, void 0, function () {
        function startup() {
            return __awaiter(this, void 0, void 0, function () {
                var layer;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, view.map.layers.getItemAt(0).load()];
                        case 1:
                            layer = _a.sent();
                            document.getElementById("title").innerHTML = layer.title;
                            createSelect(layer);
                            // resetValue();
                            view.ui.add("panel", "top-right");
                            new Legend({
                                view: view,
                                container: "legend-div"
                            });
                            view.on("pointer-move", pointerMove);
                            return [2 /*return*/];
                    }
                });
            });
        }
        function createSelect(layer) {
            var fieldSelectContainer = document.getElementById("field-select-container");
            fieldSelect = document.createElement("select");
            fieldSelect.className = "esri-widget";
            fieldSelectContainer.appendChild(fieldSelect);
            var layerFields = layer.fields;
            layerFields
                .filter(function (field) { return field.name.indexOf("EDUC") > -1; })
                .forEach(function (field) {
                var option = document.createElement("option");
                option.value = field.name;
                option.text = field.alias;
                fieldSelect.appendChild(option);
            });
            fieldSelect.addEventListener("change", resetValue);
            resetValue();
            function resetValue() {
                return __awaiter(this, void 0, void 0, function () {
                    var layer, generatedRenderer;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, view.map.layers.getItemAt(0).load()];
                            case 1:
                                layer = _a.sent();
                                fieldName = fieldSelect.value;
                                return [4 /*yield*/, queryAllStats({
                                        layer: layer,
                                        field: fieldName,
                                        normalizationField: normalizationFieldName
                                    })];
                            case 2:
                                datasetAverage = _a.sent();
                                return [4 /*yield*/, generateRenderer({
                                        layer: layer,
                                        field: fieldName,
                                        normalizationField: normalizationFieldName,
                                        view: view
                                    })];
                            case 3:
                                generatedRenderer = _a.sent();
                                layer.renderer = generatedRenderer;
                                return [2 /*return*/];
                        }
                    });
                });
            }
        }
        function pointerMove(event) {
            return __awaiter(this, void 0, void 0, function () {
                var hitResult, featureHitResult, selectedFeature, attributes, cityName, neighborAverage, difference;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, view.hitTest(event)];
                        case 1:
                            hitResult = _a.sent();
                            featureHitResult = hitResult && hitResult.results && hitResult.results.filter(function (result) { return result.graphic.layer.type !== "vector-tile"; })[0];
                            if (!(featureHitResult && featureHitResult.graphic)) return [3 /*break*/, 3];
                            selectedFeature = featureHitResult.graphic;
                            attributes = selectedFeature.attributes;
                            attribute = getPercentage(attributes[fieldName], attributes[normalizationFieldName]);
                            cityName = attributes["NAME"];
                            return [4 /*yield*/, findNeighborsAverage(selectedFeature)];
                        case 2:
                            neighborAverage = _a.sent();
                            difference = attribute - neighborAverage;
                            displayResults({
                                featureValue: attribute,
                                neighborsDifference: difference,
                                cityName: cityName
                            });
                            updateChart([attribute, neighborAverage, datasetAverage]);
                            _a.label = 3;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        }
        function updateChart(data) {
            var title = fieldName;
            if (!chart) {
                // get the canvas element created in the LayerList
                // and use it to render the chart
                var chartDiv = document.getElementById("chart-div");
                var canvasElement = document.createElement("canvas");
                chartDiv.appendChild(canvasElement);
                chart = new Chart(canvasElement.getContext("2d"), {
                    type: "bar",
                    data: {
                        labels: ["Selected City", "Neighbors", "Dataset"],
                        datasets: [{
                                data: data,
                                fill: false,
                                backgroundColor: ["rgba(216, 0, 255, 0.2)", "rgba(0, 255, 255, 0.2)", "rgba(255,170, 0,0.2)"],
                                borderColor: ["rgb(216, 0, 255)", "rgb(0, 255, 255)", "rgba(255, 170, 0)"],
                                borderWidth: 1
                            }]
                    },
                    options: {
                        legend: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: "% " + fieldSelect.selectedOptions[0].text
                        },
                        scales: {
                            yAxes: [{
                                    ticks: {
                                        beginAtZero: true,
                                    }
                                }]
                        }
                    }
                });
            }
            else {
                chart.data.datasets[0].data = data;
                chart.options.title.text = "% " + fieldSelect.selectedOptions[0].text;
                chart.update();
            }
        }
        function findNeighborsAverage(feature) {
            return __awaiter(this, void 0, void 0, function () {
                var layer, layerView, ids, value;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            layer = view.map.layers.getItemAt(0);
                            return [4 /*yield*/, view.whenLayerView(layer)];
                        case 1:
                            layerView = _a.sent();
                            return [4 /*yield*/, queryNeighborIds({
                                    layerView: layerView,
                                    centerFeature: feature
                                })];
                        case 2:
                            ids = _a.sent();
                            return [4 /*yield*/, queryStatsByIds({
                                    layerView: layerView,
                                    ids: ids,
                                    field: fieldName
                                })];
                        case 3:
                            value = _a.sent();
                            return [2 /*return*/, value];
                    }
                });
            });
        }
        function queryNeighborIds(params) {
            return __awaiter(this, void 0, void 0, function () {
                var layerView, geometry, layer, queryParams, ids;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            layerView = params.layerView;
                            geometry = params.centerFeature.geometry;
                            layer = layerView.layer;
                            queryParams = layer.createQuery();
                            queryParams.geometry = geometry;
                            queryParams.spatialRelationship = "touches";
                            queryParams.returnGeometry = false;
                            return [4 /*yield*/, layerView.queryObjectIds(queryParams)];
                        case 1:
                            ids = _a.sent();
                            highlightFeatures(layerView, ids);
                            return [2 /*return*/, ids];
                    }
                });
            });
        }
        function highlightFeatures(layerView, ids) {
            if (highlight) {
                highlight.remove();
                highlight = null;
            }
            highlight = layerView.highlight(ids);
        }
        function queryStatsByIds(params) {
            return __awaiter(this, void 0, void 0, function () {
                var layerView, layer, ids, fieldName, statsQuery, statDefinitions, stats, totalValue, totalNormalizationValue, averageValue;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            layerView = params.layerView;
                            layer = layerView.layer;
                            ids = params.ids;
                            fieldName = params.field;
                            statsQuery = layer.createQuery();
                            statsQuery.objectIds = ids;
                            statDefinitions = [{
                                    onStatisticField: fieldName,
                                    outStatisticFieldName: fieldName + "_TOTAL",
                                    statisticType: "sum"
                                }, {
                                    onStatisticField: normalizationFieldName,
                                    outStatisticFieldName: normalizationFieldName + "_TOTAL",
                                    statisticType: "sum"
                                }];
                            statsQuery.outStatistics = statDefinitions;
                            return [4 /*yield*/, layerView.queryFeatures(statsQuery)];
                        case 1:
                            stats = _a.sent();
                            totalValue = stats.features[0].attributes[fieldName + "_TOTAL"];
                            totalNormalizationValue = stats.features[0].attributes[normalizationFieldName + "_TOTAL"];
                            averageValue = getPercentage(totalValue, totalNormalizationValue);
                            return [2 /*return*/, averageValue];
                    }
                });
            });
        }
        function createOnStatisticField(fields) {
            var aggregatedFields;
            return aggregatedFields;
        }
        function getPercentage(value, total) {
            return Math.round((value / total) * 100);
        }
        function queryAllStats(params) {
            return __awaiter(this, void 0, void 0, function () {
                var layer, fieldName, normalizationFieldName, statsQuery, statDefinitions, stats, totalValue, totalNormalizationValue, datasetAverage;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            layer = params.layer;
                            fieldName = params.field;
                            normalizationFieldName = params.normalizationField;
                            statsQuery = layer.createQuery();
                            statDefinitions = [{
                                    onStatisticField: fieldName,
                                    outStatisticFieldName: fieldName + "_TOTAL",
                                    statisticType: "sum"
                                }, {
                                    onStatisticField: normalizationFieldName,
                                    outStatisticFieldName: normalizationFieldName + "_TOTAL",
                                    statisticType: "sum"
                                }];
                            statsQuery.outStatistics = statDefinitions;
                            return [4 /*yield*/, layer.queryFeatures(statsQuery)];
                        case 1:
                            stats = _a.sent();
                            totalValue = stats.features[0].attributes[fieldName + "_TOTAL"];
                            totalNormalizationValue = stats.features[0].attributes[normalizationFieldName + "_TOTAL"];
                            datasetAverage = getPercentage(totalValue, totalNormalizationValue);
                            return [2 /*return*/, datasetAverage];
                    }
                });
            });
        }
        function displayResults(params) {
            var neighborsDifferenceElement = document.getElementById("neighbors-difference");
            var featureValueElement = document.getElementById("feature-value");
            var neighborsAboveBelowElement = document.getElementById("neighbors-above-below");
            var aboveBelowStyleElement = document.getElementById("above-below-style");
            var cityNameElement = document.getElementById("city-name");
            var neighborsAboveBelow = params.neighborsDifference > 0 ? "above" : "below";
            if (params.neighborsDifference >= 0) {
                neighborsAboveBelow = "above";
                aboveBelowStyleElement.style.color = "green";
            }
            else {
                neighborsAboveBelow = "below";
                aboveBelowStyleElement.style.color = "red";
            }
            featureValueElement.innerHTML = numberWithCommas(params.featureValue) + "%";
            neighborsDifferenceElement.innerHTML = "" + numberWithCommas(Math.abs(params.neighborsDifference));
            neighborsAboveBelowElement.innerHTML = neighborsAboveBelow;
            cityNameElement.innerHTML = params.cityName;
        }
        // helper function for returning a layer instance
        // based on a given layer title
        function findLayerByTitle(title) {
            return view.map.allLayers.find(function (layer) {
                return layer.title === title;
            });
        }
        // helper function for formatting number labels with commas
        function numberWithCommas(value) {
            value = value || 0;
            return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
        function generateRenderer(params) {
            return __awaiter(this, void 0, void 0, function () {
                var rendererParams, response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            rendererParams = {
                                layer: params.layer,
                                valueExpression: "Round( ($feature." + params.field + " / $feature." + params.normalizationField + ") * 100)",
                                valueExpressionTitle: "% " + fieldSelect.selectedOptions[0].text,
                                basemap: map.basemap,
                                view: params.view
                            };
                            return [4 /*yield*/, colorRendererCreator.createContinuousRenderer(rendererParams)];
                        case 1:
                            response = _a.sent();
                            return [2 /*return*/, response.renderer];
                    }
                });
            });
        }
        var map, fieldName, normalizationFieldName, fieldSelect, view, datasetAverage, attribute, chart, highlight;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    map = new WebMap({
                        portalItem: {
                            id: "88275f408861408dab986ad78f2a97cf"
                        }
                    });
                    normalizationFieldName = "EDUCA_BASE";
                    view = new MapView({
                        container: "viewDiv",
                        map: map,
                        popup: {
                            dockEnabled: true,
                            dockOptions: {
                                breakpoint: false,
                                position: "bottom-left"
                            }
                        }
                    });
                    return [4 /*yield*/, view.when()];
                case 1:
                    _a.sent();
                    startup();
                    return [2 /*return*/];
            }
        });
    }); })();
});
//# sourceMappingURL=touches.js.map