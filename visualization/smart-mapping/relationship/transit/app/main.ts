import esri = __esri;

import EsriMap = require("esri/Map");
import SceneView = require("esri/views/SceneView");
import FeatureLayer = require("esri/layers/FeatureLayer");
import Legend = require("esri/widgets/Legend");

import relationshipSchemes = require("esri/renderers/smartMapping/symbology/relationship");
import relationshipRendererCreator = require("esri/renderers/smartMapping/creators/relationship");
import sizeRendererCreator = require("esri/renderers/smartMapping/creators/size");
import { UniqueValueRenderer } from "esri/renderers";

(async () => {

  const layer = new FeatureLayer({
    url: "https://services1.arcgis.com/4yjifSiIG17X0gW4/ArcGIS/rest/services/LA_Stops_Enriched/FeatureServer/0"
  });

  const map = new EsriMap({
    basemap: "gray",
    ground: "world-elevation",
    layers: [ layer ]
  });

  const view = new SceneView({
    container: "viewDiv",
    map: map,
    camera: {
      position: {
        spatialReference: {
          wkid: 3857
        },
        x: -13189768,
        y: 3992496,
        z: 19388
      },
      heading: 31,
      tilt: 60
    },
    // Set dock options on the view's popup
    popup: {
      dockEnabled: true,
      dockOptions: {
        breakpoint: false
      }
    },
    // enable shadows to be cast from the features
    environment: {
      lighting: {
        directShadowsEnabled: true
      }
    }
  });

  const legend = new Legend({
    view: view
  });
  view.ui.add(legend, "bottom-left");

  await view.when();

  // create a relationship renderer and a size visual variable
  // for a tri-variate visualization

  const relationshipResponse = await createRelationshipRenderer();
  const sizeResponse = await createSizeVariable(relationshipResponse);
  applyRenderer(sizeResponse);

  /**
   * Creates a relationship renderer based on the Maximum
   * wait time for public transit during rush hour and the 
   * percent of the population that belongs to a minority.
   */
  async function createRelationshipRenderer(): Promise<esri.relationshipRendererResult>{

    const schemes = relationshipSchemes.getSchemes({
      basemap: map.basemap,
      geometryType: "mesh"
    });

    const params = {
      relationshipScheme: schemes.secondarySchemes[1],
      layer,
      view,
      basemap: map.basemap,
      field1: {
        field: "MaxWaitTime4_6"
      },
      field2: {
        field: "PercentMinority"
      },
      focus: "HH",
      symbolType: "3d-volumetric"
    };

    return relationshipRendererCreator.createRenderer(params);
  }

  /**
   * Create a size visual variable based on the total minority population
   * and apply it to the relationship renderer
   */
  async function createSizeVariable(response: esri.relationshipRendererResult): Promise<UniqueValueRenderer> {
    const renderer = response.renderer;

    const sizeResponse = await sizeRendererCreator.createVisualVariables({
      layer: layer,
      field: "MINORITYCY",
      basemap: map.basemap,
      view: view,
      worldScale: true,
      axis: "height"
    });

    renderer.visualVariables = sizeResponse.visualVariables;
    return renderer;
  }

  /**
   * Applies a relationship renderer to a layer after updating the legend
   * text to some meaningful description.
   * 
   * @param renderer A relationship renderer instance
   */
  function applyRenderer(renderer: UniqueValueRenderer){
    
    const uniqueValueInfos = renderer.uniqueValueInfos.map(function(info){
      switch (info.value) {
        case "HH": 
          info.label = "Longer Waits & More Minorities";
          break;
        case "HL":
          info.label = "Longer Waits";
          break;
        case "LH":
          info.label = "More Minority Population";
          break;
        case "LL":
          info.label = "Shorter Waits & Fewer Minorities";
          break;
      }
      return info;
    });
    renderer.uniqueValueInfos = uniqueValueInfos;
    layer.renderer = renderer;
  }

})();