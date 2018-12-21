import esri = __esri;
import esriRequest = require("esri/request");

async function fetchData(){
  const url = "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/US_county_crops_2007_clean/FeatureServer/0/query";
  return esriRequest(url, {
    query: {
      f: "json",
      where: "1=1",
      outFields: [ "FIPS", "M163_07" ],
      returnGeometry: false,
      maxRecordCountFactor: 2
    }
  })
    .then( response => {
      const data = response.data;
      const jsonForArcade = {};

      data.features.forEach( ( feature: esri.Graphic ) => {
        jsonForArcade[feature.attributes.FIPS] = feature.attributes.M163_07;
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
    var cornAcres = data[$feature.FIPS];
    var totalArea = DefaultValue($feature.TOT_CROP_ACRES, 1);
    Round( (cornAcres / totalArea) * 100 );
  `;
  return arcade;
}