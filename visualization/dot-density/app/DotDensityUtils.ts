import esri = __esri;
import spatialStatistics = require("esri/renderers/smartMapping/statistics/spatialStatistics");
import scaleUtils = require("esri/geometry/support/scaleUtils");
import StatisticDefinition = require("esri/tasks/support/StatisticDefinition");

interface SuggestedDotValueParams {
  layer: esri.FeatureLayer,
  view: esri.MapView,
  fields: string[],
  sampleSize?: number
}

export async function getAveragePolygonSize (params: SuggestedDotValueParams): Promise<number> {
  let { layer, sampleSize, view } = params;

  if(!sampleSize){
    sampleSize = 500;
  }

  await layer.load();

  if(layer.geometryType !== "polygon"){
    console.log("layer must be of type Polygon");
    return 0;
  }

  const query = layer.createQuery();
  query.where = `${layer.objectIdField} <= ${sampleSize}`;
  query.returnGeometry = true;
  query.outFields = null;
  query.outSpatialReference = view.spatialReference;
  

  const response = await layer.queryFeatures(query);
  
  const { avgSize } = await spatialStatistics({ 
    features: response.features, 
    geometryType: "polygon"
  });
  // console.log(stats);
  return avgSize as number;
}

interface PixelCountByAverageParams {
  view: esri.MapView,
  averagePolygonSize: number
}

function getPixelCountByAverage(params: PixelCountByAverageParams) : number {
  const { view, averagePolygonSize } = params;
  const sizePerPixel = scaleUtils.getResolutionForScale(view.scale, view.spatialReference);
  const averagePolygonSizePixels = (averagePolygonSize / sizePerPixel) * 0.8;
  return averagePolygonSizePixels;
}

interface CalculateDotValueParams {
  avgFieldValue: number,
  numPixels: number
}

function calculateDotValue(params: CalculateDotValueParams): number {
  const { avgFieldValue, numPixels } = params;
  const suggestedDotValue = Math.round(avgFieldValue / numPixels);

  return suggestedDotValue;
}

interface AverageFields {
  layer: esri.FeatureLayer,
  fields: string[]
}

async function getAverageFieldValue (params: AverageFields): Promise<number> {
  const { layer, fields } = params;
  const statsQuery = layer.createQuery();

  const summedFields = fields.reduce( (a, c) => {
    return `${a} + ${c}`
  });

  statsQuery.where = `( ${summedFields} ) > 0`;

  statsQuery.outStatistics = [new StatisticDefinition({
    onStatisticField: summedFields,
    outStatisticFieldName: "avg_value",
    statisticType: "avg"
  })];

  const statsResponse = await layer.queryFeatures(statsQuery);
  console.log(statsResponse);
  return statsResponse.features[0].attributes.avg_value;
}

interface SuggestedDotValueResult {
  dotValue: number,
  dotMax: number
}
export async function calculateSuggestedDotValue(params: SuggestedDotValueParams): Promise<SuggestedDotValueResult> {
  const { view, layer, fields } = params;
  const averagePolygonSize = await getAveragePolygonSize(params);
  console.log("avg polygon size done");
  const numPixels = getPixelCountByAverage({
    averagePolygonSize,
    view
  });
  console.log("num pixels: ", numPixels);

  const avgFieldValue = await getAverageFieldValue({
    layer, fields
  });
  console.log("avg field value: ", avgFieldValue);
  
  const suggestedDotValue = calculateDotValue({ avgFieldValue, numPixels });
  console.log("suggested dot value: ", suggestedDotValue);
  return {
    dotValue: snapNumber( suggestedDotValue ),
    dotMax: snapNumber( avgFieldValue )
  };
}

export function snapNumber (value: number) {
  const inputValue = Math.round(value);
  const numDigits = inputValue.toString().length;
  const factor = Math.pow(10, (numDigits-2));
  const snappedValue = Math.round( inputValue / factor ) * factor;
  return snappedValue < 1 ? 1 : snappedValue;
}
