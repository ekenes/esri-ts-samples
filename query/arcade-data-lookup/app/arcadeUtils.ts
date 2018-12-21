import esri = __esri;
import esriRequest = require("esri/request");

async function fetchData(){
  // https://services.arcgis.com/V6ZHFr6zdgNZuVG0/ArcGIS/rest/services/us_counties_crops_256_colors/FeatureServer/0
  // https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/Washington_block_groups/FeatureServer/0/query
  const url = "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/ArcGIS/rest/services/us_counties_crops_256_colors/FeatureServer/0/query";
  return esriRequest(url, {
    query: {
      f: "json",
      where: "1=1",
      outFields: [ "OBJECTID_1", "CORN_PER_ACRES_2012" ], 
      // outFields: [ "ALAND", "OBJECTID", "GEOID" ],
      returnGeometry: false,
      maxRecordCountFactor: 3
    }
  })
    .then( response => {
      const data = response.data;
      const jsonForArcade = {};

      data.features.forEach( (feature:any) => {
        jsonForArcade[feature.attributes.OBJECTID_1.toString()] = feature.attributes.CORN_PER_ACRES_2012;
      });

      return jsonForArcade;
    })
    .catch( error => {
      console.error("An error occurred fetching data: ", error);
    })
}

export async function getArcade(): Promise<string> {

  const data = await fetchData();
  const arcade = `
    var data = ${JSON.stringify(data)};
    var cornAcres = data[Text($feature.OBJECTID_1)];
    var totalArea = $feature.Shape__Area;
    Round( cornAcres );
  `;
  return arcade;
}

// var data = ${JSON.stringify(data)};
// var landArea = data[$feature.GEOID];
// var waterArea = $feature.AWATER;
// //var waterArea = $feature.AWATER;
// var totalArea = waterArea + landArea;
// Round( ( waterArea / totalArea ) * 100 );