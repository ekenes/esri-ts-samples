import esri = __esri;

import WebMap = require("esri/WebMap");
import MapView = require("esri/views/MapView");
import LayerList = require("esri/widgets/LayerList");
import watchUtils = require("esri/core/watchUtils");
import FeatureLayer = require("esri/layers/FeatureLayer");
import Graphic = require("esri/Graphic");
import StatisticDefinition = require("esri/tasks/support/StatisticDefinition");

// import Chart = require("Chart");


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

view.on("pointer-move", (event) => {
  view.hitTest(event)
    .then( response => {
      const results = response.results;
      const hitResult = results.filter( (result) => result.graphic.layer.type !== "vector-tile")[0].graphic;
      const attributes = hitResult.attributes;
      attribute = attributes[ fieldName ];

      return findNeighbors(hitResult);
    }).then( (stats) => {
      const neighborAverage = stats[`${fieldName}_AVG`];
      const difference = attribute - neighborAverage;
      const perChange =  Math.round(( difference / neighborAverage ) * 100);

      console.log(perChange);
    });
});

let chart: any;

function updateChart(data: number[]) {

  const title = fieldName;

  if (!chart) {
    // get the canvas element created in the LayerList
    // and use it to render the chart
    const canvasElement = document.createElement("canvas");

    chart = new Chart( canvasElement.getContext("2d"), {
      type: "bar",
      data: data,
      options: {

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

function findNeighbors(feature: Graphic){
  const layer = view.map.layers.getItemAt(0);

  return view.whenLayerView(layer)
    .then( (layerView: esri.FeatureLayerView) => {

      return queryNeighborIds({
        layerView: layerView,
        centerFeature: feature
      })
      .then(queryStatsByIds)
      .then(displayStats);
    })
    .catch( (error) => { console.error(error) });
}

let highlight: any;

function queryNeighborIds(params: FindNeighborsParams){
  const layerView = params.layerView;
  const geometry = params.centerFeature.geometry;
  const layer = layerView.layer as esri.FeatureLayer;

  const queryParams = layer.createQuery();
  queryParams.geometry = geometry;
  queryParams.spatialRelationship = "intersects";
  queryParams.returnGeometry = false;
  queryParams.where = `OBJECTID <> ${params.centerFeature.attributes.OBJECTID}`;

  return layerView.queryObjectIds(queryParams)
    .then( (ids)  => {
      if (highlight) {
        highlight.remove();
        highlight = null;
      }

      highlight = layerView.highlight(ids);
      return {
        layerView: layerView,
        ids: ids,
        field: fieldName
      };
    });
}

function highlightFeatures(ids: Number[]){
  
}

interface QueryStatsByIdsParams {
  layerView: esri.FeatureLayerView,
  ids: number[],
  field: string[]
}

function queryStatsByIds(params: QueryStatsByIdsParams) {
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

  // statDefinition as esri.StatisticDefinition;

  statsQuery.outStatistics = [ statDefinition ];// as esri.StatisticDefinition[];

  return layerView.queryFeatures(statsQuery);
}

interface QueryAllStatsParams {
  layer: esri.FeatureLayer,
  field: string[]
}

function queryAllStats(params: QueryAllStatsParams){
  const layer = params.layer;
  const fieldName = params.field;

  const statsQuery = layer.createQuery();

  const statDefinition = new StatisticDefinition({
    onStatisticField: fieldName,
    outStatisticFieldName: `${fieldName}_AVG`,
    statisticType: "avg"
  });

  statsQuery.outStatistics = [ statDefinition ];// as esri.StatisticDefinition[];

  return layer.queryFeatures(statsQuery);
}

function displayStats(response: esri.Graphic[]): Object {
  const stats = response[0].attributes;
  console.log(stats);
  return stats;
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