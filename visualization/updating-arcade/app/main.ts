import esri = __esri;

import WebMap = require("esri/WebMap");
import MapView = require("esri/views/MapView");
import FeatureLayer = require("esri/layers/FeatureLayer");

import { UniqueValueRenderer } from "esri/renderers";
import { SimpleFillSymbol } from "esri/symbols";

import Legend = require("esri/widgets/Legend");

( async () => {

  const visualizationField = "EDUC01_CY";
  const allFields = [
    "EDUC01_CY",  // no education
    "EDUC02_CY",  // Primary School
    "EDUC03_CY",  // Junior Middle School
    "EDUC04_CY",  // Senior High School
    "EDUC05_CY",  // Junior College
    "EDUC06_CY"  // University and Above
  ];
  const description = "Education in mainland China";
  const startValue = 5;

  const chinaLayer = new FeatureLayer({
    portalItem: {
      id: "7b1fb95ab77f40bf8aa09c8b59045449"
    },
    opacity: 0.7,
    title: `${description}`
  })

  const map = new WebMap({
    basemap:  {
      portalItem: {
        id: "eee15c389eec43ef98f1f55124b6a0cf"
      }
    },
    layers: [ chinaLayer ]
  });

  const view = new MapView({
    map: map,
    container: "viewDiv",
    highlightOptions: {
      color: [ 0, 0, 0 ],
      fillOpacity: 0
    },
    center: [ 104.2530, 33.8218 ],
    zoom: 5
  });
  view.ui.add(new Legend({ view }), "bottom-left");

  await view.when();
  await chinaLayer.when();
  const chinaLayerView = await view.whenLayerView(chinaLayer) as esri.FeatureLayerView;

  // render the layer with an Arcade expression
  // Features where more than 5% of the population didn't 
  // complete formal education are rendered in red. Features
  // where less than 5% of the population didn't complete
  // formal education will be rendered in orange
  // Features where 5% of the population didn't complete
  // formal education will be rendered in gray

  chinaLayer.renderer = new UniqueValueRenderer({
    valueExpression: createArcade( startValue ),
    valueExpressionTitle: "% population without formal education",
    uniqueValueInfos: [{ 
      value: "Above",
      symbol: createSymbol("#b30000"),
      label: `Above ${startValue}%`
    }, {
      value: "Similar",
      symbol: createSymbol("gray"),
      label: `Similar (within +/- 1%)`
    }, {
      value: "Below",
      symbol: createSymbol("orange"),
      label: `Below ${startValue}%`
    }],
    defaultLabel: "No data",
    defaultSymbol: createSymbol("black", "backward-diagonal")
  });

  // When the user clicks a feature, the renderer will update 
  // to color features based on whether their value is above 
  // or below the value of the clicked feature

  let highlight: any;

  view.on("click", async (event) => {
    const hitTestResponse = await view.hitTest(event);
    const result = hitTestResponse.results && hitTestResponse.results.filter( result => {
      return result.graphic.layer.type === "feature";
    })[0];

    if (!result){
      return null;
    }

    const attributes = result.graphic.attributes;
    const newValue = attributes[visualizationField];
    let totalValue = 0;
    
    allFields.forEach( fieldName => {
      totalValue += attributes[fieldName];
    });

    const midPoint = Math.round(( newValue / totalValue ) * 100);
    const name = attributes.NAME;
    updateRenderer( name, midPoint );

    if(highlight){
      highlight.remove();
    }
    highlight = chinaLayerView.highlight( attributes.OBJECTID );
  });

  // Updates the renderer with the new Arcade expression and the 
  // updated text reflecting the new value obtained from the clicked feature

  function updateRenderer (name: string, newValue: number) {
    const oldRenderer = chinaLayer.renderer as UniqueValueRenderer;
    const newRenderer = oldRenderer.clone();
    newRenderer.valueExpression = createArcade(newValue);
    newRenderer.uniqueValueInfos.forEach( (info, i) => {
      info.label = ( i !== 1 ) ? `${info.label.substring(0,5)} ${newValue}%` : `Within +/- 1% of ${name} (${newValue}%)`;
    });
    newRenderer.valueExpressionTitle = `% population without formal education relative to ${name}`;
    chinaLayer.renderer = newRenderer;
  }

  // Creates an Arcade expression that categories each feature as either
  // above or below the input value
  
  function createArcade(value: number): string {
    return `
      var value = ${value};
      var total = Sum( $feature.EDUC01_CY, $feature.EDUC02_CY, $feature.EDUC03_CY, 
        $feature.EDUC04_CY, $feature.EDUC05_CY, $feature.EDUC06_CY );

      var percentTotalFeature = Round( ($feature.${visualizationField} / total) * 100);
      When( percentTotalFeature <= value + 1 && 
            percentTotalFeature >= value - 1, "Similar",
            percentTotalFeature > value, "Above",
            "Below" );
    `;
  }

  function createSymbol (color: any, style?: string): SimpleFillSymbol {
    return new SimpleFillSymbol({
      color,
      outline: {
        color: "white",
        width: 0.75
      },
      style: style ? style : "solid"
    });
  }

})();
