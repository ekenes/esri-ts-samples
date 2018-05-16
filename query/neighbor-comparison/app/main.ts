import esri = __esri;

import WebMap = require("esri/WebMap");
import MapView = require("esri/views/MapView");
import LayerList = require("esri/widgets/LayerList");
import watchUtils = require("esri/core/watchUtils");
import FeatureLayer = require("esri/layers/FeatureLayer");
import Graphic = require("esri/Graphic");
import StatisticDefinition = require("esri/tasks/support/StatisticDefinition");


const map = new WebMap({
  portalItem: {
    id: "88275f408861408dab986ad78f2a97cf"
  }
});

const fieldName = "EDUCA_BASE";

const view = new MapView({
  container: "viewDiv",
  map: map,
  popup: {
    dockEnabled: true,
    dockOptions: {
      breakpoint: false
    }
  }
});

let attribute: number;

const neighborsDifferenceElement = document.getElementById("neighbors-difference");
const featureValueElement = document.getElementById("feature-value");
const datasetDifferenceElement = document.getElementById("dataset-difference");

view.on("pointer-move", pointerMove);

async function pointerMove (event: any) {

  const hitResult = await view.hitTest(event);

  const selectedFeature = hitResult.results && hitResult.results.filter( (result) => result.graphic.layer.type !== "vector-tile")[0].graphic;
  const attributes = selectedFeature.attributes;
  attribute = attributes[ fieldName ];

  const neighborAverage = await findNeighborsAverage(selectedFeature) as number;
  const difference = attribute - neighborAverage;
  const perChange =  Math.round(( difference / neighborAverage ) * 100);

  console.table({
    feature: attribute, 
    neighbor_avg: neighborAverage,
    per_chang: perChange
  });
    
}

let chart: any;

function updateChart(data: number[]) {

  const title = fieldName;

  if (!chart) {
    // get the canvas element created in the LayerList
    // and use it to render the chart
    const canvasElement = document.createElement("canvas");

    chart = new Chart( canvasElement.getContext("2d"), {
      type: "bar",
      data: {
        labels: [ "feature" ],
        datasets: [{
          data: data
        }]
      }
    });
  } else {
    chart.data = data;
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

let highlight: any;

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
      
  if (highlight) {
    highlight.remove();
    highlight = null;
  }
  highlight = layerView.highlight(ids);

  return ids;
}

function highlightFeatures(ids: Number[]){
  
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

  const statDefinition = {
    onStatisticField: fieldName,
    outStatisticFieldName: `${fieldName}_AVG`,
    statisticType: "avg"
  };

  statsQuery.outStatistics = [ statDefinition ] as esri.StatisticDefinition[];

  const stats = await layerView.queryFeatures(statsQuery);
  const averageValue = stats[0].attributes[`${fieldName}_AVG`] as number;
  return averageValue;
}

interface QueryAllStatsParams {
  layer: esri.FeatureLayer,
  field: string
}

async function queryAllStats(params: QueryAllStatsParams){
  const layer = params.layer;
  const fieldName = params.field;

  const statsQuery = layer.createQuery();

  const statDefinition = {
    onStatisticField: fieldName,
    outStatisticFieldName: `${fieldName}_AVG`,
    statisticType: "avg"
  };

  statsQuery.outStatistics = [ statDefinition ] as esri.StatisticDefinition[];

  const stats = await layer.queryFeatures(statsQuery);
  const datasetAverage = stats[0].attributes[fieldName];
  return datasetAverage;
}

function displayStats(response: esri.Graphic[]): Object {
  const neighborAverage = response[0].attributes[`${fieldName}_AVG`];
  return neighborAverage;
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