import EsriMap = require("esri/Map");
import SceneView = require("esri/views/SceneView");
import Camera = require("esri/Camera");
import FeatureLayer = require("esri/layers/FeatureLayer");
import CSVLayer = require("esri/layers/CSVLayer");
import GroupLayer = require("esri/layers/GroupLayer");
import Graphic = require("esri/Graphic");

import geometryEngine = require("esri/geometry/geometryEngine");
import StatisticDefinition = require("esri/tasks/support/StatisticDefinition");

import BasemapToggle = require("esri/widgets/BasemapToggle");
import Expand = require("esri/widgets/Expand");
import LayerList = require("esri/widgets/LayerList");
import Legend = require("esri/widgets/Legend");
import Home = require("esri/widgets/Home");

import { SimpleRenderer, UniqueValueRenderer } from "esri/renderers";
import { Multipoint, Point } from "esri/geometry";
import { WebStyleSymbol, PolygonSymbol3D, ExtrudeSymbol3DLayer } from "esri/symbols";

( async () => {

  const reservedAirspaceHeight = {
    type: "size",
    valueExpression: "$feature.CEIL_ALT - $feature.FL_ALT",
    valueUnit: "feet"
  };

  const initialRenderer = new SimpleRenderer({
    symbol: {
      type: "polygon-3d",
      symbolLayers: [{
        type: "extrude",
        size: 1000,
        material: {
          color: [ 255,255,255,0 ]
        },
        edges: {
          type: "solid",
          color: "#2b7bff",
          size: 1.25
        }
      }]
    },
    visualVariables: [ reservedAirspaceHeight ]
  });

  interface CreateClassificationParams {
    projectGeometry: Multipoint,
    projectHeight: number
  }

  /**
   * Creates a new renderer if the user provides new data or updated height info
   * 
   * @param params {CreateClassificationParams}
   */
  function createClassification(params: CreateClassificationParams): UniqueValueRenderer {
    const projectGeometry = params.projectGeometry;
    const height = params.projectHeight;

    const riskLevels = {
      low: 500,
      medium: 300,
      high: 50
    };

    let riskLevelBuffers = {};
    // buffering outside of renderer function boosts performance
    for (let level in riskLevels){
      riskLevelBuffers[level] = geometryEngine.geodesicBuffer(projectGeometry, riskLevels[level], "feet");
    }

    // function that checks if each airspace zone meets the designated criteria
    
    let classifyFeatures = function (graphic: Graphic){
      let floorValue = graphic.attributes.FL_ALT;
      let geom = graphic.geometry;

      let risk = "none";  // none | low | medium | high

      for (let level in riskLevels){
        let bufferValue = riskLevels[level];
        let heightRisk = height >= (floorValue - bufferValue);
        let xyRisk = geometryEngine.intersects(geom, riskLevelBuffers[level]);
        risk = heightRisk && xyRisk ? level : risk;
      }

      return risk;
    }

    return new UniqueValueRenderer({
      field: classifyFeatures,
      legendOptions: {
        title: "Risk of Encroachment"
      },
      uniqueValueInfos: [{
        value: "high",
        symbol: createSymbol([244, 66, 66, 0.2], [244, 66, 66]),
        label: "High"
      }, {
        value: "medium",
        symbol: createSymbol([244, 146, 65, 0.2], [244, 146, 65]),
        label: "Medium"
      }, {
        value: "low",
        symbol: createSymbol([244, 238, 65, 0.2], [244, 238, 65]),
        label: "Low"
      }],
      defaultSymbol: createSymbol([112, 244, 65, 0.2], [112, 244, 65]),
      defaultLabel: "None",
      visualVariables: [ reservedAirspaceHeight ]
    });
  }

  function createSymbol(color: any, useEdges: any): PolygonSymbol3D {
    const edges = {
      type: "solid",
      color: useEdges,
      size: 2
    };

    return new PolygonSymbol3D({
      symbolLayers: [ new ExtrudeSymbol3DLayer({
        material: {
          color: color
        },
        edges: useEdges ? edges : null
      }) ]
    });
  }

  let currentGeometry: Multipoint;

  const webStyleRenderer = new SimpleRenderer({
    symbol: new WebStyleSymbol({
      styleUrl: "https://www.arcgis.com/sharing/rest/content/items/48c5d69ad6b646d5aa77c733376f06dc/data",
      name: "oil_rig"
    }),
    visualVariables: [{
      type: "size",
      field: "Height_Total",
      axis: "height",
      valueUnit: "feet"
    }]
  });

  const iconRenderer = new SimpleRenderer({
    symbol: {
      type: "point-3d",
      symbolLayers: [{
        type: "icon",
        style: "kite",
        material: {
          color: "purple"
        },
        size: 6,
        outline: {
          color: "white",
          size: 1.2
        }
      }]
    },
  });

  // https://ais-faa.opendata.arcgis.com/datasets/0c6899de28af447c801231ed7ba7baa6_0?geometry=-118.045%2C31.838%2C-103.038%2C37.499&mapSize=map-maximize

  let reservedAirspace = new FeatureLayer({
    portalItem: {
      id: "75c499b5586c4cdd80af23ab4410af3e"
    },
    title: "Military Special Use Airspace",
    popupTemplate: {
      title: "{NAME}",
      content: [{
        type: "fields",
        fieldInfos: [{
          fieldName: "CON_AGCY",
          label: "Jurisdiction"
        }, {
          fieldName: "FL_ALT",
          label: "Elevation Floor (ft)",
          format: {
            digitSeparator: true,
            places: 0
          }
        }, {
          fieldName: "CEIL_ALT",
          label: "Elevation Ceiling (ft)",
          format: {
            digitSeparator: true,
            places: 0
          }
        }]
      }]
    },
    renderer: initialRenderer,

    elevationInfo: {
      mode: "relative-to-ground",
      featureExpressionInfo: {
        expression: "$feature.FL_ALT"
      },
      unit: "feet"
    }

  });

  const map = new EsriMap({
    basemap: "hybrid",
    ground: "world-elevation",
    layers: [ reservedAirspace ]
  });

  const view = new SceneView({
    container: "viewDiv",
    map: map,
    viewingMode: "local",
    clippingArea: {
      spatialReference: {
        wkid: 3857
      },
      xmin: -10299155,
      ymin: 2535352,
      xmax: -8610249,
      ymax: 3645618
    },
    camera: {
      position: {
        spatialReference: {
          wkid: 3857
        },
        x: -9595420,
        y: 3839597,
        z: 166873
      },
      heading: 164,
      tilt: 62
    }
  });

  await view.when();

  const url = "./app/fake_oil_rigs.csv";
  const projectPointsIcons = new CSVLayer({ 
    url: url, 
    delimiter: ",",
    spatialReference: {
      wkid: 3857
    },
    renderer: iconRenderer,
    elevationInfo: {
      mode: "on-the-ground"
    }
  });

  const webStyleLayer = new CSVLayer({ 
    url: url,
    title: "Oil Derricks",
    delimiter: ",",
    spatialReference: {
      wkid: 3857
    },
    renderer: webStyleRenderer,
    elevationInfo: {
      mode: "on-the-ground"
    },
    popupTemplate: {
      title: "{site_name} ({unique_id})",
      content: [{
        type: "fields",
        fieldInfos: [{
          fieldName: "Company",
          label: "Company"
        }, {
          fieldName: "Height_Total",
          label: "Total Height (ft)"
        }, {
          fieldName: "Length_Overall",
          label: "Length (ft)"
        }, {
          fieldName: "Breadth_Overall",
          label: "Breadth Length (ft)"
        }, {
          fieldName: "Heli_Deck",
          label: "Helicopter deck?"
        }]
      }]
    }
  });

  const proposalLayer = new GroupLayer({
    title: "Proposed Wind Locations",
    layers: [ projectPointsIcons, webStyleLayer ],
    listMode: "hide-children",
    visibilityMode: "inherited"
  });

  map.add(proposalLayer);

  let statsQuery = projectPointsIcons.createQuery();
  statsQuery.outStatistics = [ new StatisticDefinition({
    statisticType: "max",
    onStatisticField: "Height_Total",
    outStatisticFieldName: "maxHeight"
  }) ];

  let maxHeight = 0;
  const heightResults = await projectPointsIcons.queryFeatures(statsQuery)
  const stats = heightResults.features[0].attributes;
  maxHeight = stats.maxHeight;

  let heightInputElem = document.getElementById("heightInput") as HTMLInputElement;
  heightInputElem.value = maxHeight.toString();

  const projectPointsResults = await projectPointsIcons.queryFeatures();
  const graphics = projectPointsResults.features;

  let multipointGeom = new Multipoint({
    spatialReference: { wkid: 3857 }
  });

  graphics.forEach(f => {
    const point = f.geometry as Point;
    multipointGeom.addPoint(point);
  });

  currentGeometry = multipointGeom;
  updateRenderer(multipointGeom, maxHeight);

  const toggle = new BasemapToggle({
    view,
    nextBasemap: "topo"
  });
  view.ui.add(toggle, "bottom-left");

  view.ui.add(new Expand({
    view,
    group: "top-left",
    content: new Legend({ 
      view,
      layerInfos: [{
        layer: reservedAirspace
      }]
    }),
    expanded: true
  }), "top-left");

  const layerListExpand = new Expand({
    view,
    group: "top-left",
    content: new LayerList({
      view
    }),
    expanded: false
  });
  view.ui.add(layerListExpand, "top-left");
  
  heightInputElem.addEventListener("change", function(){
    updateRenderer(currentGeometry);
  });

  function updateRenderer(geometry: Multipoint, height?: number){
    const inputHeight = heightInputElem.value;
    const projectGeometry = geometry;
    const projectHeight = height ? height : parseInt(inputHeight);

    if(!projectGeometry || !projectHeight){
      console.log("Missing parameters. Please draw a project area and enter a project height.");
      return;
    }

    let rendererParams = {
      projectGeometry: projectGeometry,
      projectHeight: projectHeight
    }

    let classifiedRenderer = createClassification(rendererParams);
    reservedAirspace.renderer = classifiedRenderer;
    updateObjectHeight(projectHeight);
  }

  function updateObjectHeight(newHeight: number){
    const layer = proposalLayer.layers.find(function(layer){
      return layer.title === "Oil Derricks";
    }) as FeatureLayer;
    const oldRenderer = layer.renderer as UniqueValueRenderer;
    const newRenderer = oldRenderer.clone();
    newRenderer.visualVariables = [{
      type: "size",
      valueExpression: newHeight.toString(),
      axis: "height",
      valueUnit: "feet"
    }];
    layer.renderer = newRenderer;
  }

  const zoomBtn = document.getElementById("zoomBtn");
  view.ui.add(zoomBtn, { position: "top-left", index: 3 });
  view.ui.add(new Home({ view }), { position: "top-left", index: 3 });
  zoomBtn.addEventListener("click", function(){
    view.goTo(new Camera({
      position: {
        spatialReference: {
          wkid: 3857
        },
        x: -9836929,
        y: 3435978,
        z: 168
      },
      heading: 246,
      tilt: 81
    }));
  });

})();
