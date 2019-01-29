import esri = __esri;

import EsriMap = require("esri/Map");
import MapView = require("esri/views/MapView");
import Legend = require("esri/widgets/Legend");
import FeatureLayer = require("esri/layers/FeatureLayer");
import PopupTemplate = require("esri/PopupTemplate");

import predominanceRendererCreator = require("esri/renderers/smartMapping/creators/predominance");
import predominanceSchemes = require("esri/renderers/smartMapping/symbology/predominance");
import sizeRendererCreator = require("esri/renderers/smartMapping/creators/size");

import { generatePopupTemplates, getPopupTemplateTypes } from "app/ArcadeExpressions";

( async () => {

  let popupTemplateIndex = 0;
  let availablePopupTemplates: PopupTemplate[];

  const portalItemInput = document.getElementById("portal-item-id") as HTMLInputElement;

  let layer = createFeatureLayer(portalItemInput.value);

  const map = new EsriMap({
    basemap: {
      portalItem: {
        id: "75a3ce8990674a5ebd5b9ab66bdab893"
      }
    },
    layers: [ layer ]
  });

  const view = new MapView({
    map: map,
    container: "viewDiv",
    center: [ -116.3126, 43.60703 ],
    zoom: 11
  });
  view.ui.add(new Legend({ view }), "bottom-left");

  await view.when();

  const fieldList = document.getElementById("fieldList") as HTMLSelectElement;
  const includeSizeCheckbox = document.getElementById("includeSize") as HTMLInputElement;
  const includeOpacityCheckbox = document.getElementById("includeOpacity") as HTMLInputElement;

  const elements = [ fieldList, includeOpacityCheckbox, includeSizeCheckbox ];

  portalItemInput.addEventListener("change", async () => {
    map.removeAll();
    layer = createFeatureLayer(portalItemInput.value);
    map.add(layer);

    fieldList.options.length = 0;

    await createFieldOptions();

    const extentResponse = await layer.queryExtent();
    view.goTo(extentResponse.extent);

    const predominanceResponse = await createPredominanceRenderer();
    layer.renderer = predominanceResponse.renderer;
    layer.popupTemplate = predominanceResponse.popupTemplates[popupTemplateIndex];
  });

  function createFeatureLayer (portalItemId: string): FeatureLayer {
    return new FeatureLayer({
      portalItem: {
        id: portalItemId
      },
      outFields: ["*"],
      opacity: 0.9
    });
  }

  async function createFieldOptions (): Promise<any> {
    await layer.load();
    const validFieldTypes = [ "small-integer", "integer", "single", "double", "long" ];
    const excludedFieldNames = [ "HasData", "ENRICH_FID" ];

    layer.fields.filter( field => {
      return ( validFieldTypes.indexOf( field.type ) > -1 ) && 
             ( excludedFieldNames.indexOf(field.name) === -1 );
    }).forEach( (field, i) => {
      const option = document.createElement("option");
      option.value = field.name;
      option.text = field.alias;
      option.selected = i < 2;
      fieldList.appendChild(option);
    });
  }

  function createPopupTemplateOptions () {
    const popupTemplateOptionTypes = getPopupTemplateTypes();
    const selectElement = document.createElement("select");
    popupTemplateOptionTypes.forEach( (text, index) => {
      const option = document.createElement("option");
      option.selected = index === popupTemplateIndex;
      option.value = index.toString();
      option.text = text;
      selectElement.appendChild(option);
    });

    const popupTemplatesContainer = document.getElementById("popup-templates");
    popupTemplatesContainer.appendChild(selectElement);

    selectElement.addEventListener("change", (event:any) => {
      popupTemplateIndex = parseInt(event.target.value);
      layer.popupTemplate = availablePopupTemplates[popupTemplateIndex];
    });
  }

  // Each time the user changes the value of one of the DOM elements
  // (list box and two checkboxes), then generate a new predominance visualization

  elements.forEach(function(element){
    element.addEventListener("change", async () => {
      const predominanceResponse = await createPredominanceRenderer();
      layer.renderer = predominanceResponse.renderer;
      layer.popupTemplate = predominanceResponse.popupTemplates[popupTemplateIndex];
    });
  });

  // Gets all the predominance schemes available in the JS API

  const schemes = predominanceSchemes.getSchemes({
    basemap: map.basemap,
    geometryType: "polygon",
    numColors: 10
  });

  // create a predominance renderer once the app loads
  await createFieldOptions();

  const predominanceResponse = await createPredominanceRenderer();
  createPopupTemplateOptions();

  layer.renderer = predominanceResponse.renderer;
  layer.popupTemplate = predominanceResponse.popupTemplates[popupTemplateIndex];
  console.log(layer.popupTemplate);
  /**
   * Creates a predominance renderer if 2 or more fields are selected,
   * or a continuous size renderer if 1 field is selected
   */
  async function createPredominanceRenderer() {

    const selectedOptions = [].slice.call(fieldList.selectedOptions);

    if (selectedOptions.length === 1){
      return createSizeRenderer(selectedOptions[0]);
    }

    const fields = selectedOptions.map(function(option: HTMLOptionElement){
      return {
        name: option.value,
        label: option.text
      };
    });

    const params = {
      view,
      layer,
      fields,
      predominanceScheme: schemes.secondarySchemes[6],
      sortBy: "value",
      basemap: view.map.basemap,
      includeSizeVariable: includeSizeCheckbox.checked,
      includeOpacityVariable: includeOpacityCheckbox.checked,
      legendOptions: {
        title: "Most common decade in which homes were built"
      }
    };

    const rendererResponse = await predominanceRendererCreator.createRenderer(params) as any;
    const popupTemplateResponse = generatePopupTemplates(params);
    availablePopupTemplates = popupTemplateResponse;
    rendererResponse.popupTemplates = popupTemplateResponse;
    return rendererResponse;
  }

  async function createSizeRenderer(option: HTMLOptionElement): Promise <esri.sizeContinuousRendererResult> {
    return sizeRendererCreator.createContinuousRenderer({
      layer,
      basemap: map.basemap,
      field: option.value,
      legendOptions: {
        title: `Number of homes built (${option.text})`
      }
    });
  }

})();