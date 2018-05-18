import esri = __esri;

import WebMap = require("esri/WebMap");
import MapView = require("esri/views/MapView");
import LayerList = require("esri/widgets/LayerList");
import watchUtils = require("esri/core/watchUtils");
import FeatureLayer = require("esri/layers/FeatureLayer");
import Graphic = require("esri/Graphic");
import StatisticDefinition = require("esri/tasks/support/StatisticDefinition");
import colorRendererCreator = require("esri/renderers/smartMapping/creators/color");
import Legend = require("esri/widgets/Legend");

declare var Chart: any;

const map = new WebMap({
  portalItem: {
    id: "88275f408861408dab986ad78f2a97cf"
  }
});

let fieldName: string;
const normalizationFieldName = "EDUCA_BASE";
let fieldSelect: HTMLSelectElement;

const view = new MapView({
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

view.when()
  .then( _ => {
    startup();
  });

let datasetAverage: number;

async function startup(){

  await view.when();
  const layer = await view.map.layers.getItemAt(0).load() as esri.FeatureLayer;

  document.getElementById("title").innerHTML = layer.title;
  createSelect(layer);

  // resetValue();

  view.ui.add("panel", "top-right");
  const legend = new Legend({
    view: view,
    container: "legend-div",
    style: "card"
  })
  view.on("pointer-move", pointerMove);
}

function createSelect(layer: esri.FeatureLayer){
  const fieldSelectContainer = document.getElementById("field-select-container");
  fieldSelect = document.createElement("select");
  fieldSelect.className = "esri-widget";
  fieldSelectContainer.appendChild(fieldSelect);
  const layerFields = layer.fields;

  layerFields
    .filter( (field) => field.name.indexOf("EDUC") > -1)
    .forEach( (field) => {
      const option = document.createElement("option");
      option.value = field.name;
      option.text = field.alias;
      fieldSelect.appendChild(option);
    });

  fieldSelect.addEventListener("change", resetValue);

  resetValue();

  async function resetValue(){
    const layer = await view.map.layers.getItemAt(0).load() as esri.FeatureLayer;
    fieldName = fieldSelect.value;
  
    datasetAverage = await queryAllStats({
      layer: layer,
      field: fieldName,
      normalizationField: normalizationFieldName
    });
  
    const generatedRenderer = await generateRenderer({
      layer: layer,
      field: fieldName,
      normalizationField: normalizationFieldName,
      view: view
    });
    layer.renderer = generatedRenderer;
  
  }
}

// view.ui.add("panel", "top-right");

let attribute: number;

// view.on("pointer-move", pointerMove);

async function pointerMove (event: any) {

  const hitResult = await view.hitTest(event);

  const featureHitResult = hitResult && hitResult.results && hitResult.results.filter( (result) => result.graphic.layer.type !== "vector-tile")[0];

  if(featureHitResult && featureHitResult.graphic){
    const selectedFeature = featureHitResult.graphic;
    const attributes = selectedFeature.attributes;
    attribute = getPercentage( attributes[ fieldName ], attributes[ normalizationFieldName ] );
    const cityName = attributes["NAME"];

    const neighborAverage = await findNeighborsAverage(selectedFeature) as number;
    const difference = attribute - neighborAverage;

    displayResults({
      featureValue: attribute,
      neighborsDifference: difference,
      cityName: cityName
    });

    updateChart([ attribute, neighborAverage, datasetAverage ]);

  }
    
}

let chart: any;

function updateChart(data: number[]) {

  const title = fieldName;

  if (!chart) {
    // get the canvas element created in the LayerList
    // and use it to render the chart
    const chartDiv = document.getElementById("chart-div");
    const canvasElement = document.createElement("canvas");

    chartDiv.appendChild(canvasElement);

    chart = new Chart( canvasElement.getContext("2d"), {
      type: "bar",
      data: {
        labels: [ "Selected City", "Neighbors", "Dataset" ],
        datasets: [{
          data: data,
          fill: false,
          backgroundColor: ["rgba(216, 0, 255, 0.2)", "rgba(0, 255, 255, 0.2)", "rgba(255,170, 0,0.2)" ],
          borderColor: ["rgb(216, 0, 255)", "rgb(0, 255, 255)", "rgba(255, 170, 0)" ],
          borderWidth: 1
        }]
      },
      options: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: `% ${fieldSelect.selectedOptions[0].text}`
        },
        // barPercentage: 0.5,
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true,
              // max: 60
            }
          }]
        }
      }
    });
  } else {
    chart.data.datasets[0].data = data;
    chart.options.title.text = `% ${fieldSelect.selectedOptions[0].text}`;
    chart.update();
  }
}

interface FindNeighborsParams {
  layerView: esri.FeatureLayerView,
  centerFeature: Graphic
}

async function findNeighborsAverage(feature: Graphic){
  const layer = view.map.layers.getItemAt(0);

  const layerView = await view.whenLayerView(layer) as esri.FeatureLayerView;

  const ids = await queryNeighborIds({
    layerView: layerView,
    centerFeature: feature
  });

  const value = await queryStatsByIds({
    layerView: layerView,
    ids: ids,
    field: fieldName
  });

  return value;
}

async function queryNeighborIds(params: FindNeighborsParams){
  const layerView = params.layerView;
  const geometry = params.centerFeature.geometry;
  const layer = layerView.layer as esri.FeatureLayer;

  const queryParams = layer.createQuery();
  queryParams.geometry = geometry;
  queryParams.spatialRelationship = "intersects";
  queryParams.returnGeometry = false;
  queryParams.where = `OBJECTID <> ${params.centerFeature.attributes.OBJECTID}`;

  const ids = await layerView.queryObjectIds(queryParams);
  highlightFeatures(layerView, ids);

  return ids;
}

let highlight: any;

function highlightFeatures(layerView: esri.FeatureLayerView, ids: number[]){
  if (highlight) {
    highlight.remove();
    highlight = null;
  }
  highlight = layerView.highlight(ids);
}

interface QueryStatsByIdsParams {
  layerView: esri.FeatureLayerView,
  ids: number[],
  field: string
}

async function queryStatsByIds(params: QueryStatsByIdsParams) {
  const layerView = params.layerView;
  const layer = layerView.layer as FeatureLayer;
  const ids = params.ids;
  const fieldName = params.field;

  const statsQuery = layer.createQuery();
  statsQuery.objectIds = ids;

  const statDefinitions = [{
    onStatisticField: fieldName,
    outStatisticFieldName: `${fieldName}_TOTAL`,
    statisticType: "sum"
  }, {
    onStatisticField: normalizationFieldName,
    outStatisticFieldName: `${normalizationFieldName}_TOTAL`,
    statisticType: "sum"
  }];

  statsQuery.outStatistics = statDefinitions as esri.StatisticDefinition[];

  const stats = await layerView.queryFeatures(statsQuery);
  const totalValue = stats[0].attributes[`${fieldName}_TOTAL`] as number;
  const totalNormalizationValue = stats[0].attributes[`${normalizationFieldName}_TOTAL`] as number;
  const averageValue = getPercentage(totalValue, totalNormalizationValue);
  return averageValue;
}

interface QueryAllStatsParams {
  layer: esri.FeatureLayer,
  field: string,
  normalizationField: string
}

function getPercentage (value: number, total: number): number {
  return Math.round( ( value / total ) * 100 );
}

async function queryAllStats(params: QueryAllStatsParams){
  const layer = params.layer;
  const fieldName = params.field;
  const normalizationFieldName = params.normalizationField;

  const statsQuery = layer.createQuery();

  const statDefinitions = [{
    onStatisticField: fieldName,
    outStatisticFieldName: `${fieldName}_TOTAL`,
    statisticType: "sum"
  }, {
    onStatisticField: normalizationFieldName,
    outStatisticFieldName: `${normalizationFieldName}_TOTAL`,
    statisticType: "sum"
  }];

  statsQuery.outStatistics = statDefinitions as esri.StatisticDefinition[];

  const stats = await layer.queryFeatures(statsQuery);
  const totalValue = stats.features[0].attributes[`${fieldName}_TOTAL`] as number;
  const totalNormalizationValue = stats.features[0].attributes[`${normalizationFieldName}_TOTAL`] as number;
  const datasetAverage = getPercentage(totalValue, totalNormalizationValue);
  return datasetAverage;
}

interface displayResultsParams {
  featureValue: number,
  neighborsDifference: number,
  cityName: string
}

function displayResults (params: displayResultsParams) {
  const neighborsDifferenceElement = document.getElementById("neighbors-difference");
  const featureValueElement = document.getElementById("feature-value");
  const neighborsAboveBelowElement = document.getElementById("neighbors-above-below");
  const aboveBelowStyleElement = document.getElementById("above-below-style");
  const cityNameElement = document.getElementById("city-name");
  let neighborsAboveBelow = params.neighborsDifference > 0 ? "above" : "below";

  if(params.neighborsDifference >= 0){
    neighborsAboveBelow = "above";
    aboveBelowStyleElement.style.color = "green";
  } else {
    neighborsAboveBelow = "below";
    aboveBelowStyleElement.style.color = "red";
  }

  featureValueElement.innerHTML = `${numberWithCommas( params.featureValue )}%`;
  neighborsDifferenceElement.innerHTML = `${numberWithCommas (Math.abs(params.neighborsDifference))}`;
  neighborsAboveBelowElement.innerHTML = neighborsAboveBelow;
  cityNameElement.innerHTML = params.cityName;
}

// helper function for returning a layer instance
// based on a given layer title
function findLayerByTitle(title: string) {
  return view.map.allLayers.find(function(layer) {
    return layer.title === title;
  });
}

// helper function for formatting number labels with commas
function numberWithCommas(value: number) {
  value = value || 0;
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

interface GenerateRendererParams {
  layer: esri.FeatureLayer,
  field: string,
  normalizationField: string,
  view: esri.MapView
}

async function generateRenderer(params: GenerateRendererParams){
  const rendererParams = {
    layer: params.layer,
    valueExpression: `Round( ($feature.${params.field} / $feature.${params.normalizationField}) * 100)`,
    valueExpressionTitle: `% ${fieldSelect.selectedOptions[0].text}`,
    basemap: map.basemap,
    view: params.view
  };

  const response = await colorRendererCreator.createContinuousRenderer(rendererParams);

  return response.renderer;
}