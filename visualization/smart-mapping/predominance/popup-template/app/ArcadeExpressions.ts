import esri = __esri;
import PopupTemplate = require("esri/PopupTemplate");

interface predominanceFields {
  name: string,
  label?: string
}

function createArcadeFields (fieldNames: string[]): string[] {
  return fieldNames.map( fieldName => `$feature["${fieldName}"]`);
}

function generatePredominantValueArcade(fieldInfos: predominanceFields[]): string {
  const arcadeFields = createArcadeFields(fieldInfos.map( field => field.name ));

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

function generatePredominantAliasArcade(fieldInfos: predominanceFields[]): string {
  const arcadeFields = createArcadeFields(fieldInfos.map( field => field.name ));
  const fieldAliases = fieldInfos.map( field => {
    return field.label ? `"${field.label}"` : `"${field.name}"`;
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

function generatePredominantTotalArcade(fieldInfos: predominanceFields[]): string {
  const arcadeFields = createArcadeFields(fieldInfos.map( field => field.name ));

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

function generatePredominantStrengthArcade(fieldInfos: predominanceFields[]): string {
  const arcadeFields = createArcadeFields(fieldInfos.map( field => field.name ));
  const fieldAliases = fieldInfos.map( field => {
    return field.label ? `"${field.label}"` : `"${field.name}"`;
  });

  return `
    ${arcadeFields.join(`\n`)}
    var fieldNames = [ ${arcadeFields} ];
    var fieldAliases = [ ${fieldAliases} ];
    var numFields = ${arcadeFields.length};
    var maxFieldAlias = null;
    var maxValue = -Infinity;
    var value, i, totalValue;

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
      if(value != null && value >= 0) {
        if (totalValue == null) { totalValue = 0; }
        totalValue = totalValue + value;
      }
    }
    
    var strength = null;
  
    if (maxFieldAlias != "Tie" && totalValue > 0) {
      strength = (maxValue / totalValue) * 100;
    }
  
    return strength;
  `;
}

function generatePredominantGapArcade(fieldInfos: predominanceFields[]): string {
  const arcadeFields = createArcadeFields(fieldInfos.map( field => field.name ));

  return `
    ${arcadeFields.join(`\n`)}
    var fieldNames = [ ${arcadeFields} ];
    var totalValue = Sum(fieldNames);
    var order = Reverse(Sort(fieldNames));
  
    return IIF(totalValue > 0, Round(((order[0] - order[1]) / totalValue) * 100, 2), null);
  `;
}

function generateOrderedFieldList(fieldInfos: predominanceFields[]): string {
  const arcadeFields = createArcadeFields(fieldInfos.map( field => field.name ));

  const arcadeGroups = fieldInfos.map( fieldInfo => {
    return `{
      value: $feature["${fieldInfo.name}"],
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

export function generatePopupTemplates(params: esri.predominanceCreateRendererParams): PopupTemplate[] {
  return [
    generateCategoryPopupTemplate(params),
    generateValuePopupTemplate(params),
    generateGapPopupTemplate(params),
    generateStrengthPopupTemplate(params),
    generateTopListPopupTemplate(params)
  ]
}

export function generatePopupTemplate(params: esri.predominanceCreateRendererParams): PopupTemplate {
  const fieldInfos = params.fields;

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
    }, {
      name: `predominant-strength`,
      title: `Strength of Predominance`,
      expression: generatePredominantStrengthArcade(fieldInfos)
    }, {
      name: `ordered-values`,
      title: `List of values`,
      expression: generateOrderedFieldList(fieldInfos)
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
    }, {
      fieldName: `expression/predominant-strength`,
      format: {
        digitSeparator: true,
        places: 0
      }
    }],
    title: `{expression/predominant-category}`,
    content: `The predominant category in this feature is {expression/predominant-category}, 
      which has a value of {expression/predominant-value}.
      Sum of all categories: {expression/total}
      Strength of predominance: {expression/predominant-strength}%
      Top values: {expression/ordered-values}
      `
  });
}

export function generateCategoryPopupTemplate(params: esri.predominanceCreateRendererParams): PopupTemplate {
  const fieldInfos = params.fields;
  const predominanceTitle = params.legendOptions && params.legendOptions.title ? params.legendOptions.title : `competing fields`;

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
    }, {
      name: `predominant-strength`,
      title: `Strength of Predominance`,
      expression: generatePredominantStrengthArcade(fieldInfos)
    }, {
      name: `ordered-values`,
      title: `List of values`,
      expression: generateOrderedFieldList(fieldInfos)
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
    }, {
      fieldName: `expression/predominant-strength`,
      format: {
        digitSeparator: true,
        places: 0
      }
    }],
    content: `The predominant value of <b>${predominanceTitle}</b> in this feature is <b>{expression/predominant-category}</b>.`
  });
}

export function generateStrengthPopupTemplate(params: esri.predominanceCreateRendererParams): PopupTemplate {
  const fieldInfos = params.fields;
  const predominanceTitle = params.legendOptions && params.legendOptions.title ? params.legendOptions.title : `competing fields`;

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
    }, {
      name: `predominant-strength`,
      title: `Strength of Predominance`,
      expression: generatePredominantStrengthArcade(fieldInfos)
    }, {
      name: `ordered-values`,
      title: `List of values`,
      expression: generateOrderedFieldList(fieldInfos)
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
    }, {
      fieldName: `expression/predominant-strength`,
      format: {
        digitSeparator: true,
        places: 0
      }
    }],
    title: `{expression/predominant-category}`,
    content: `<b>{expression/predominant-category}</b> is the most common <b>${predominanceTitle}</b> in this feature, 
     which is <b>{expression/predominant-strength}%</b> of the sum of the competing categories.`
  });
}

export function generateValuePopupTemplate(params: esri.predominanceCreateRendererParams): PopupTemplate {
  const fieldInfos = params.fields;
  const predominanceTitle = params.legendOptions && params.legendOptions.title ? params.legendOptions.title : `competing fields`;

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
    }, {
      name: `predominant-strength`,
      title: `Strength of Predominance`,
      expression: generatePredominantStrengthArcade(fieldInfos)
    }, {
      name: `ordered-values`,
      title: `List of values`,
      expression: generateOrderedFieldList(fieldInfos)
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
    }, {
      fieldName: `expression/predominant-strength`,
      format: {
        digitSeparator: true,
        places: 0
      }
    }],
    title: `{expression/predominant-category}`,
    content: `The predominant category in this feature is <b>{expression/predominant-category}</b>, 
      which has a value of <b>{expression/predominant-value}</b>. This accounts for <b>{expression/predominant-strength}%</b>
      of the sum of all categories comprising ${predominanceTitle} ({expression/total}).`
  });
}

export function generateTopListPopupTemplate(params: esri.predominanceCreateRendererParams): PopupTemplate {
  const fieldInfos = params.fields;
  const predominanceTitle = params.legendOptions && params.legendOptions.title ? params.legendOptions.title : `competing fields`;

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
    }, {
      name: `predominant-strength`,
      title: `Strength of Predominance`,
      expression: generatePredominantStrengthArcade(fieldInfos)
    }, {
      name: `ordered-values`,
      title: `List of values`,
      expression: generateOrderedFieldList(fieldInfos)
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
    }, {
      fieldName: `expression/predominant-strength`,
      format: {
        digitSeparator: true,
        places: 0
      }
    }],
    title: `{expression/predominant-category}`,
    content: `{expression/ordered-values}`
  });
}

export function generateGapPopupTemplate(params: esri.predominanceCreateRendererParams): PopupTemplate {
  const fieldInfos = params.fields;
  const predominanceTitle = params.legendOptions && params.legendOptions.title ? params.legendOptions.title : `competing fields`;

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
    }, {
      name: `predominant-strength`,
      title: `Strength of Predominance`,
      expression: generatePredominantStrengthArcade(fieldInfos)
    }, {
      name: `predominant-gap`,
      title: `Margin of Victory`,
      expression: generatePredominantGapArcade(fieldInfos)
    }, {
      name: `ordered-values`,
      title: `List of values`,
      expression: generateOrderedFieldList(fieldInfos)
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
    }, {
      fieldName: `expression/predominant-strength`,
      format: {
        digitSeparator: true,
        places: 0
      }
    }, {
      fieldName: `expression/predominant-gap`,
      format: {
        digitSeparator: true,
        places: 0
      }
    }],
    title: `{expression/predominant-category}`,
    content: `{expression/predominant-category} has a value of {expression/predominant-value}, 
      and beats all other categories by a margin of {expression/predominant-gap} percentage points.`
  });
}