import esri = __esri;

import EsriMap = require("esri/Map");
import MapView = require("esri/views/MapView");
import Legend = require("esri/widgets/Legend");
import BasemapToggle = require("esri/widgets/BasemapToggle");
import Search = require("esri/widgets/Search");
import Expand = require("esri/widgets/Expand");
import Slider = require("esri/widgets/Slider");

import FeatureLayer = require("esri/layers/FeatureLayer");

import dotDensitySchemes = require("esri/renderers/smartMapping/symbology/dotDensity");
import dotDensityRendererCreator = require("esri/renderers/smartMapping/creators/dotDensity");

import scaleRange = require("esri/renderers/smartMapping/heuristics/scaleRange");
import { generateTopListPopupTemplate } from "app/ArcadeExpressions";

try{
  

  ( async () => {

    // function to retrieve query parameters (in this case only id)
    function getUrlParam(): string {
      const queryParams = document.location.search.substr(1);
      let result: any = {};

      queryParams.split("&").forEach(function(part) {
        var item = part.split("=");
        result[item[0]] = decodeURIComponent(item[1]);
      });

      return result.url;
    }

    // function to set an id as a url param
    function setUrlParam(url: string) {
      window.history.pushState("", "", `${window.location.pathname}?url=${url}`);
    }

    let url = getUrlParam();
    if(!url){
      url = "http://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/USA_County_Crops_2007/FeatureServer/0";
      setUrlParam(url);
    }

    let layer = new FeatureLayer({
      url,
      outFields: ["*"],
      opacity: 0.9,
      maxScale: 0,
      minScale: 0
    });

    const map = new EsriMap({
      basemap: {
        portalItem: {
          id: "9d5cf81cf8ce437584cedc8a2ee4ea4e"
        }
      }
    });

    const view = new MapView({
      map: map,
      container: "viewDiv"
    });
    view.ui.add([ new Expand({
      content: new Legend({ view }),
      view,
      group: "top-left"
    }), new Expand({
      content: new Search({ view }),
      view,
      group: "top-left"
    }), new Expand({
      content: new BasemapToggle({
        view,
        nextBasemap: "gray-vector"
      }),
      view,
      expandIconClass: "esri-icon-basemap",
      group: "top-left"
    })], "top-left");

    await view.when();

    let dotValueTick: HTMLElement;
    let dotValueTickLabel: HTMLElement;
    const dotValueInput = new Slider({
      container: "dot-value-input",
      min: 1,
      max: 5000,
      values: [ 2 ],
      rangeLabelsVisible: true,
      rangeLabelInputsEnabled: true,
      labelsVisible: true,
      labelInputsEnabled: true,
      precision: 0,
      tickConfigs: [{
        mode: "position",
        labelsVisible: true,
        values: [ 1 ],
        tickCreatedFunction: (value, tickElement, labelElement) => {
          dotValueTick = tickElement;
          dotValueTickLabel = labelElement;
        },
      }],
      labelFormatFunction: (value, type) => {
        return value.toFixed(0);
      }
    });

    const scaleRangeSuggestion = await scaleRange({ layer, view });

    const scaleRangeSlider = new Slider({
      container: "scale-range-slider",
      min: Math.round(scaleRangeSuggestion.maxScale * 0.25),
      max: Math.round(scaleRangeSuggestion.minScale * 5),
      values: [ scaleRangeSuggestion.maxScale, scaleRangeSuggestion.minScale  ],
      rangeLabelsVisible: true,
      rangeLabelInputsEnabled: true,
      labelsVisible: true,
      labelInputsEnabled: true,
      precision: 0,
      labelFormatFunction: (value, type) => {
        if (type === "min"){
          return "house";
        } else if (type === "max"){
          return "country";
        } else {
          return value.toFixed(0);
        }
      }
    });

    scaleRangeSlider.on("value-change", function(event){
      if(event.index === 1){
        layer.minScale = event.value;
      }
      if(event.index === 0){
        layer.maxScale = event.value;
      }
    });
   
    const dotValueScaleInput = document.getElementById("dot-value-scale-input") as HTMLInputElement;
    const blendDotsInput = document.getElementById("blend-dots-input") as HTMLInputElement;
    const outlineInput = document.getElementById("outline-input") as HTMLInputElement;
    const unitValueInput = document.getElementById("unit-value-input") as HTMLInputElement;
    const refreshDotPlacement = document.getElementById("refresh-dot-placement") as HTMLSpanElement;
    const schemeList = document.getElementById("scheme-list") as HTMLSelectElement;
    const seedInput = document.getElementById("seed-input") as HTMLInputElement;
    const toggleScale = document.getElementById("toggle-scale") as HTMLInputElement;

    toggleScale.addEventListener("change", function(event:any){
      const checked = event.target.checked;

      if(checked){
        layer.minScale = scaleRangeSlider.values[1];
        layer.maxScale = scaleRangeSlider.values[0];
      } else {
        layer.minScale = 0;
        layer.maxScale = 0;
      }

    });


    let seed = parseInt(seedInput.value);

    refreshDotPlacement.addEventListener("click", () => {
      seed = Math.round(Math.random()*100000);
      seedInput.value = seed.toString();
      const oldRenderer = layer.renderer as esri.DotDensityRenderer;
      const newRenderer = oldRenderer.clone();
      newRenderer.seed = seed;
      layer.renderer = newRenderer;
    });

    const availableSchemes = dotDensitySchemes.getSchemes({
      basemap: view.map.basemap,
      numColors: 10
    });

    const fieldList = document.getElementById("fieldList") as HTMLSelectElement;

    async function createFieldOptions () {
      // await layer.load();
      const validFieldTypes = [ "small-integer", "integer", "single", "double", "long" ];
      const excludedFieldNames = [ "HasData", "ENRICH_FID" ];

      let selectedFields: string[] = [];

      layer.fields.filter( field => {
        return ( validFieldTypes.indexOf( field.type ) > -1 ) && 
              ( excludedFieldNames.indexOf(field.name) === -1 );
      }).forEach( (field, i) => {
        const option = document.createElement("option");
        option.value = field.name;
        option.text = field.alias;
        option.title = field.alias;
        option.selected = i < 1;
        fieldList.appendChild(option);
        if(option.selected){
          selectedFields.push(field.name);
        }
      });

      return selectedFields;
    }

    function updateSlider(value: number, max: number){
      if(value >= max || dotValueInput.min >= max){
        max = value + dotValueInput.min + max;
      }
      dotValueInput.values = null;
      dotValueInput.max = max;
      dotValueInput.values = [ value ];
      dotValueInput.tickConfigs[0].values = [ value ];
      dotValueTick.onclick = function(){
        dotValueInput.viewModel.setValue(0,value);
      }
      dotValueTickLabel.onclick = () => {
        dotValueInput.viewModel.setValue(0,value);
      }
    }

    let selectedSchemeIndex = 0;
    let allSchemes: esri.DotDensityScheme[];// Array<any>;

    function createSchemeOptions () {
      allSchemes = [ availableSchemes.primaryScheme ].concat(availableSchemes.secondarySchemes);

      allSchemes.forEach( (scheme, i) => {
        const option = document.createElement("option");
        option.value = i.toString();
        option.text = scheme.name;
        option.selected = selectedSchemeIndex === i;
        schemeList.appendChild(option);
      });

    }

    // Each time the user changes the value of one of the DOM elements
    // (list box and two checkboxes), then generate a new predominance visualization
    fieldList.addEventListener("change", async () => {
      attributes = getAttributes();
      updateRenderer();
    });
    dotValueInput.on("value-change", updateRendererFromDotValue);

    function updateRendererFromDotValue () {
      const oldRenderer = layer.renderer as esri.DotDensityRenderer;
      const newRenderer = oldRenderer.clone();
      newRenderer.dotValue = dotValueInput.values[0];
      layer.renderer = newRenderer;
    }

    dotValueScaleInput.addEventListener("change", updateRenderer);
    blendDotsInput.addEventListener("change", () => {
      const oldRenderer = layer.renderer as esri.DotDensityRenderer;
      const newRenderer = oldRenderer.clone();
      newRenderer.dotBlendingEnabled = blendDotsInput.checked;
      layer.renderer = newRenderer;
    });
    outlineInput.addEventListener("change", updateRenderer);
    unitValueInput.addEventListener("change", updateRenderer);
    schemeList.addEventListener("change", (event: any) => {
      selectedSchemeIndex = parseInt(event.target.value);
      updateRenderer();
    });
    seedInput.addEventListener("change", updateRenderer);

    let attributes: esri.AttributeColorInfo[];

    function getAttributes() {
      const selectedOptions = [].slice.call(fieldList.selectedOptions);
      return selectedOptions.map( (option: HTMLOptionElement, i:number) => {
        return {
          field: option.value,
          // valueExpression: `$feature.${option.value}`,
          label: option.text
        };
      });
    }

    async function updateRenderer(){
      attributes = getAttributes();
      const ddRendererResponse = await createDotDensityRenderer();
      console.log(ddRendererResponse);
      const renderer = ddRendererResponse.renderer;
      const dotValue = renderer.dotValue;
      const dotMax = renderer.authoringInfo.maxSliderValue;
      layer.renderer = renderer;
      layer.popupTemplate = generateTopListPopupTemplate(attributes);

      if(!map.layers.includes(layer)){
        map.add(layer);
      }

      updateSlider(dotValue, dotMax);
    }

    // create a predominance renderer once the app loads
    const supportedLayer = await supportsDotDensity(layer);

    if(!supportedLayer){
      alert(`Invalid layer. Please provide a valid polygon layer.`)
    } else {

      await layer.load();
      await zoomToLayer(layer);
      
      createSchemeOptions();
      const selectedFields = await createFieldOptions();

      updateRenderer();

      view.watch("scale", function(scale){
        // Update dot value on slider as view scale changes
        const renderer = layer.renderer as esri.DotDensityRenderer;
        const dotValue = renderer.calculateDotValue(scale);
        dotValueInput.values = [ Math.round(dotValue) ];
      });
    }

    /**
     * Creates a predominance renderer if 2 or more fields are selected,
     * or a continuous size renderer if 1 field is selected
     */
    async function createDotDensityRenderer(): Promise<esri.RendererResult> {

      const unit = unitValueInput.value;
      const outlineOptimizationEnabled = outlineInput.checked;
      const dotBlendingEnabled = blendDotsInput.checked;
      const dotValueOptimizationEnabled = dotValueScaleInput.checked;
      const dotDensityScheme = allSchemes[selectedSchemeIndex];

      const params = {
        layer,
        view,
        attributes,
        basemap: view.map.basemap,
        dotValueOptimizationEnabled, 
        dotBlendingEnabled,
        outlineOptimizationEnabled,
        legendOptions: {
          unit
        },
        dotDensityScheme,
        // sampleSize: 3000,
        // trueDensity: true
      };

      return dotDensityRendererCreator.createRenderer(params);
    }

    async function supportsDotDensity(layer: FeatureLayer): Promise<boolean> {
      await layer.load();
      return layer.geometryType === "polygon";
    }

    async function zoomToLayer(layer: FeatureLayer) {
      await layer.load();
      const extentResponse = await layer.queryExtent();
      return view.goTo(extentResponse.extent);
    }

  })();

} catch (e) {
  console.error(e);
}