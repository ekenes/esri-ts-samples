import esri = __esri;

import EsriMap = require("esri/Map");
import MapView = require("esri/views/MapView");
import colorRendererCreator = require("esri/renderers/smartMapping/creators/color");
import histogram = require("esri/renderers/smartMapping/statistics/histogram");
import ColorSlider = require("esri/widgets/ColorSlider");
import FeatureLayer = require("esri/layers/FeatureLayer");
import lang = require("esri/core/lang");

(async () => {

  //
  // Create map with a single FeatureLayer 
  //

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

  const title = "2014 Educational Attainment";

  const appDescription = `
    Educational attainment refers to the 
    highest level of education that an 
    individual has completed. People
    who completed higher levels of
    education are not included in counts
    of lower education levels.
  `;

  // 
  // Configure aggregated fields for generating Arcade expressions
  // Some field values are a subset of a larger variable. For example,
  // all people who earned a bachelor's, master's, and doctorate degree
  // are all considered "university graduates", so all of those fields
  // are added together to simplify the visualization
  //

  interface FieldInfoForArcade {
    value: string,
    description: string,
    fields: string[]
  }

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

  // This field will be used to normalize the value of each category
  // to form a percentage

  const normalizationVariable = "EDUCA_BASE";

  await view.when();
  updatePanel();

  /**
   * Creates the DOM elements needed to render basic UI and contextual information, 
   * including the title, description, and attribute field select
   */
  function updatePanel (){
    const panelDiv = document.getElementById("panel");

    // title

    const titleElement = document.createElement("h2");
    titleElement.style.textAlign = "center";
    titleElement.innerText = title;
    panelDiv.appendChild(titleElement);

    // description
    
    const descriptionElement = document.createElement("div");
    descriptionElement.style.textAlign = "center";
    descriptionElement.style.paddingBottom = "10px";
    descriptionElement.innerText = appDescription;
    panelDiv.appendChild(descriptionElement);

    // attribute field select

    const selectElement = createSelect(variables);
    panelDiv.appendChild(selectElement);
    view.ui.add(panelDiv, "bottom-left");
    selectElement.addEventListener("change", selectVariable);

    // generate the renderer for the first selected attribute
    selectVariable();
  }

  /**
   * Creates the HTML select element for the given field info objects.
   * 
   * @param {FieldInfoForArcade[]} fieldInfos - An array of FieldInfoForArcade objects,
   *   defining the name ane description of known values. The description is 
   *   used in the text of each option.
   * 
   * @returns {HTMLSelectElement} 
   */
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

  /**
   * Callback that executes each time the user selects a new variable 
   * to visualize. 
   * 
   * @param event 
   */
  async function selectVariable(event?: any){
    const selectedValue = event ? event.target.value : variables[0].value;
    const selectedInfo = findVariableByValue(selectedValue);

    // generates the renderer with the given variable value

    const rendererResponse = await generateRenderer({
      layer: layer,
      view: view,
      value: selectedInfo.value,
      normalize: true
    });

    // update the layer with the generated renderer
    layer.renderer = rendererResponse.renderer;

    // updates the ColorSlider with the stats and histogram 
    // generated from the smart mapping generator

    colorSlider = updateSlider({
      statistics: rendererResponse.statistics,
      histogram: rendererResponse.histogram,
      visualVariable: rendererResponse.visualVariable
    }, colorSlider);
  }

  /**
   * Returns the object with the associated description and fields for the
   * given value.
   * 
   * @param {string} value - The value of the selected variable. For example,
   *   this value could be "no-school".
   * 
   * @returns {FieldInfoForArcade}
   */
  function findVariableByValue (value: string): FieldInfoForArcade {
    return variables.filter( (info) => { return info.value === value } )[0];
  }

  interface GetValueExpressionResult {
    valueExpression: string,
    valueExpressionTitle?: string
  }

  /**
   * Generates an Arcade Expression and a title for the expression to use in the 
   * Legend widget.
   * 
   * @param {string} value - The value selected by the user. For example, "no-school".
   * @param {boolean} [normalize]  - indicates whether to normalize by the normalizationField.
   * 
   * @returns {GetValueExpressionResult}
   */
  function getValueExpression(value: string, normalize?: boolean): GetValueExpressionResult {

    // See variables array above

    const fieldInfo = findVariableByValue(value);
    const normalizationField = normalize ? normalizationVariable : null;
    
    return {
      valueExpression: generateArcade(fieldInfo.fields, normalizationField),
      valueExpressionTitle: fieldInfo.description
    };
  }

  /**
   * Generates an Arcade expression with the given fields and normalization field.
   * 
   * @param {string[]} fields - The fields making up the numerator of the percentage. 
   * @param {string} normalizationField - The field making up the denominator of the percentage.
   * 
   * @returns {string}
   */
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

  /**
   * Generates a renderer with a continuous color ramp for the given layer and 
   * Arcade expression.
   * 
   * @param {GenerateRendererParams} params 
   * 
   * @return {Object}
   */
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

  /**
   * Creates a ColorSlider instance if it doesn't already exist. Updates it with the
   * given parameters if it does exist.
   * 
   * @param {UpdateSliderParams} params 
   * @param {ColorSlider} slider 
   * 
   * @returns {ColorSlider}
   */
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

})();