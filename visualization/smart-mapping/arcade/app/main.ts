import esri = __esri;

import EsriMap = require("esri/Map");
import MapView = require("esri/views/MapView");
import colorRendererCreator = require("esri/renderers/smartMapping/creators/color");
import histogram = require("esri/renderers/smartMapping/statistics/histogram");
import ColorSlider = require("esri/widgets/ColorSlider");
import FeatureLayer = require("esri/layers/FeatureLayer");
import lang = require("esri/core/lang");


const layer = new FeatureLayer({
  portalItem: {
    id: "b975d17543fb4ab2a106415dca478684"
  }
});

const map = new EsriMap({
  basemap: "streets",
  layers: [ layer ]
});

const view = new MapView({
  map: map,
  container: "viewDiv",
  center: [ -99.5789795341516, 19.04471398160347],
  zoom: 7
});

interface GetValueExpressionResult {
  valueExpression: string,
  valueExpressionTitle?: string
}

interface FieldInfoForArcade {
  value: string,
  description: string,
  fields: string[]
}
const title = "2014 Educational Attainment";
const variables: FieldInfoForArcade[] = [
  {
    value: "no-school",
    description: "% population that didn't complete any education level",
    fields: [ "EDUC01_CY", "EDUC02_CY", "EDUC03_CY" ]
  }, {
    value: "primary",
    description: "% population with primary education",
    fields: [ "EDUC04_CY", "EDUC05_CY", "EDUC07_CY" ]
  }, {
    value: "secondary",
    description: "% population with secondary education",
    fields: [ "EDUC06_CY", "EDUC08_CY" ]
  }, {
    value: "high-school",
    description: "% population with high school education",
    fields: [ "EDUC09_CY", "EDUC11_CY" ]
  }, {
    value: "university",
    description: "% population with university education",
    fields: [ "EDUC10_CY", "EDUC12_CY", "EDUC13_CY", "EDUC14_CY", "EDUC15_CY" ]
  }
];

const normalizationVariable = "EDUCA_BASE";

view.when()
  .then( _ => {
    updatePanel();
  });

function updatePanel (){
  const panelDiv = document.getElementById("panel");

  const titleElement = document.createElement("h2");
  titleElement.style.textAlign = "center";
  titleElement.innerText = title;
  panelDiv.appendChild(titleElement);

  const selectElement = createSelect(variables);
  panelDiv.appendChild(selectElement);
  view.ui.add(panelDiv, "bottom-left");
  selectElement.addEventListener("change", selectVariable);

  selectVariable();
}

function createSelect(fieldInfos: FieldInfoForArcade[]): HTMLSelectElement {

  const selectElement = document.createElement("select");
  selectElement.className = "esri-widget";

  fieldInfos.forEach( (info, i) => {
    const option = document.createElement("option");
    option.value = info.value;
    option.text = info.description;
    option.selected = i === 0;

    selectElement.appendChild(option);
  });

  return selectElement;
}

let colorSlider: ColorSlider;

async function selectVariable(event?: any){
  const selectedValue = event ? event.target.value : variables[0].value;
  const selectedInfo = findVariableByValue(selectedValue);

  const rendererResponse = await generateRenderer({
    layer: layer,
    view: view,
    value: selectedInfo.value,
    normalize: true
  });

  layer.renderer = rendererResponse.renderer;

  colorSlider = updateSlider({
    statistics: rendererResponse.statistics,
    histogram: rendererResponse.histogram,
    visualVariable: rendererResponse.visualVariable
  }, colorSlider);
}

function findVariableByValue (value: string): FieldInfoForArcade {
  return variables.filter( (info) => { return info.value === value } )[0];
}

function getValueExpression(value: string, normalize?: boolean): GetValueExpressionResult {

  // See variables array above

  const fieldInfo = findVariableByValue(value);
  const normalizationField = normalize ? normalizationVariable : null;
   
  return {
    valueExpression: generateArcade(fieldInfo.fields, normalizationField),
    valueExpressionTitle: fieldInfo.description
  };
}

function generateArcade(fields: string[], normalizationField?: string): string {
  const value = fields.reduce( (a: string, c: string, i: number) => i === 1 ? `$feature.${a} + $feature.${c}` : `${a} + $feature.${c}` );
  const percentValue = normalizationField ? `( ( ${value} ) / $feature.${normalizationField} ) * 100` : value;
  return `Round( ${percentValue} )`;
}

interface GenerateRendererParams {
  layer: esri.FeatureLayer,
  view: esri.MapView,
  value: string,
  normalize?: boolean
}

async function generateRenderer(params: GenerateRendererParams) {

  const valueExpressionInfo = getValueExpression(params.value, params.normalize);

  const rendererParams = {
    layer: params.layer,
    valueExpression: valueExpressionInfo.valueExpression,
    valueExpressionTitle: valueExpressionInfo.valueExpressionTitle,
    basemap: params.view.map.basemap,
    view: params.view
  };

  const rendererResponse = await colorRendererCreator.createContinuousRenderer(rendererParams);

  const rendererHistogram = await histogram({
    layer: params.layer,
    valueExpression: valueExpressionInfo.valueExpression,
    numBins: 30,
    view: params.view
  });

  return {
    renderer: rendererResponse.renderer,
    statistics: rendererResponse.statistics,
    histogram: rendererHistogram,
    visualVariable: rendererResponse.visualVariable
  };
}

interface UpdateSliderParams {
  statistics: esri.SummaryStatisticsResult,
  histogram: esri.HistogramResult,
  visualVariable: esri.ColorVisualVariable
}

function updateSlider (params: UpdateSliderParams, slider?: ColorSlider): ColorSlider {

  if(!slider){
    const sliderContainer = document.createElement("div");
    const panelDiv = document.getElementById("panel");
    panelDiv.appendChild(sliderContainer);

    slider = new ColorSlider({
      container: sliderContainer,
      statistics: params.statistics,
      histogram: params.histogram,
      visualVariable: params.visualVariable
    });

    slider.on("data-change", (event: any) => {
      const renderer = layer.renderer as esri.ClassBreaksRenderer;
      const rendererClone = renderer.clone();
      rendererClone.visualVariables = [ lang.clone( slider.visualVariable ) ];
      layer.renderer = rendererClone;
    });
  } else {
    slider.set(params);
  }
  
  return slider;
}