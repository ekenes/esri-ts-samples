import esri = __esri;
import PopupTemplate = require("esri/PopupTemplate");

interface predominanceFields {
  name: string,
  label?: string
}

function createArcadeFields (fieldNames: string[]): string[] {
  return fieldNames.map( fieldName => `$feature["${fieldName}"]`);
}

function generatePredominantValueArcade(fieldInfos: esri.AttributeColorInfo[]): string {
  const arcadeFields = createArcadeFields(fieldInfos.map( field => field.field ));

  return `
    ${arcadeFields.join(`\n`)}
    var fieldNames = [ ${arcadeFields} ]; 
    var numFields = ${arcadeFields.length};
    var maxValueField = null;
    var maxValue = -Infinity;
    var value, i;

    for(i = 0; i < numFields; i++) {
      value = fieldNames[i];

      if(value > 0) {
        if(value > maxValue) {
          maxValue = value;
          maxValueField = fieldNames[i];
        }
        else if (value == maxValue) {
          maxValueField = null;
        }
      }
      
    }
    
    return maxValueField;
  `;
}

function generatePredominantAliasArcade(fieldInfos: esri.AttributeColorInfo[]): string {
  const arcadeFields = createArcadeFields(fieldInfos.map( field => field.field ));
  const fieldAliases = fieldInfos.map( field => {
    return field.label ? `"${field.label}"` : `"${field.field}"`;
  });

  return `
    ${arcadeFields.join(`\n`)}
    var fieldNames = [ ${arcadeFields} ]; 
    var fieldAliases = [ ${fieldAliases} ];
    var numFields = ${arcadeFields.length};
    var maxFieldAlias = null;
    var maxValue = -Infinity;
    var value, i;

    for(i = 0; i < numFields; i++) {
      value = fieldNames[i];

      if(value > 0) {
        if(value > maxValue) {
          maxValue = value;
          maxFieldAlias = fieldAliases[i];
        }
        else if (value == maxValue) {
          maxFieldAlias = "Tie";
        }
      }
      
    }
    return maxFieldAlias;
  `;
}

function generatePredominantTotalArcade(fieldInfos: esri.AttributeColorInfo[]): string {
  const arcadeFields = createArcadeFields(fieldInfos.map( field => field.field ));

  return `
    ${arcadeFields.join(`\n`)}
    var fieldNames = [ ${arcadeFields} ];
    var numFields = ${arcadeFields.length};
    var value, i, totalValue;

    for(i = 0; i < numFields; i++) {
      value = fieldNames[i];

      if(value != null && value >= 0) {
        if (totalValue == null) { totalValue = 0; }
        totalValue = totalValue + value;
      }
    }
    return totalValue;
  `;
}

function generateOrderedFieldList(fieldInfos: esri.AttributeColorInfo[]): string {
  const arcadeFields = createArcadeFields(fieldInfos.map( field => field.field ));

  const arcadeGroups = fieldInfos.map( fieldInfo => {
    return `{
      value: $feature["${fieldInfo.field}"],
      alias: "${fieldInfo.label}"
    }`;
  });

  return `
    ${arcadeFields.join(`\n`)};
    var groups = [ ${arcadeGroups} ];
    var numTopValues = Count(groups);

    function getValuesArray(a){
      var valuesArray = []
      for(var i in a){
        valuesArray[i] = a[i].value;
      }
      return valuesArray;
    }

    function findAliases(top5a,fulla){
      var aliases = [];
      var found = "";
      for(var i in top5a){
        for(var k in fulla){
          if(top5a[i] == fulla[k].value && Find(fulla[k].alias, found) == -1){
            found += fulla[k].alias;
            aliases[Count(aliases)] = {
              alias: fulla[k].alias,
              value: top5a[i]
            };
          }
        }
      }
      return aliases;
    }
    
    function getTopGroups(groupsArray){
        
      var values = getValuesArray(groupsArray);
      var top5Values = IIF(Max(values) > 0, Top(Reverse(Sort(values)),numTopValues), "no data");
      var top5Aliases = findAliases(top5Values,groupsArray);
        
      if(TypeOf(top5Values) == "String"){
        return top5Values;
      } else {
        var content = "";
        for(var i in top5Aliases){
          if(top5Aliases[i].value > 0){
            content += (i+1) + ". " + top5Aliases[i].alias + " (" + Text(top5Aliases[i].value, "#,###") + ")";
            content += IIF(i < numTopValues-1, TextFormatting.NewLine, "");
          }
        }
      }
        
      return content;
    }
    
    getTopGroups(groups);
  `;
}

export function generateTopListPopupTemplate(fieldInfos: esri.AttributeColorInfo[]): PopupTemplate {
  return new PopupTemplate({
    expressionInfos: [{
      name: `ordered-values`,
      title: `List of values`,
      expression: generateOrderedFieldList(fieldInfos)
    }],
    content: `{expression/ordered-values}`
  });
}

export function generateChartPopupTemplate(fieldInfos: esri.AttributeColorInfo[]): PopupTemplate {
  return new PopupTemplate({
    expressionInfos: [{
      name: `predominant-value`,
      title: `Predominant Value`,
      expression: generatePredominantValueArcade(fieldInfos)
    }, {
      name: `predominant-category`,
      title: `Predominant Category`,
      expression: generatePredominantAliasArcade(fieldInfos)
    }, {
      name: `total`,
      title: `Sum all categories`,
      expression: generatePredominantTotalArcade(fieldInfos)
    }],
    fieldInfos: [{
      fieldName: `expression/predominant-value`,
      format: {
        digitSeparator: true,
        places: 1
      }
    }, {
      fieldName: `expression/predominant-category`
    }, {
      fieldName: `expression/total`,
      format: {
        digitSeparator: true,
        places: 0
      }
    }],
    content: [{
      type: "text",
      text: `
        <div style="text-align: center;">
        <b><font size="3">{expression/predominant-category}</font></b>
        </div>
      `
    }, {
      type: "media",
      mediaInfos: {
        type: "pie-chart",
        value: {
          fields: fieldInfos.map( info => info.label)
        }
      }
    }]
  });
}