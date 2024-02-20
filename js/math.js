/*
* Calculates the percentual difference
* between the last and the current element of `array`
*/
const pctChange = (array, period) => {
  return Array.from(array).slice(period ? period : 1).map((value, index) => {
    const prevIndex = index;
    const prevValue = array[index];
    const change = ((value - prevValue) / prevValue) * 100;
    return change;
  });
};

/*
* Calculates the difference
* between the last and the current element of `array`
*/
const diff = (array, period) => {
  return Array.from(array).slice(period ? period : 1).map((value, index) => {
    const prevIndex = index;
    const prevValue = array[index];
    const change = (value - prevValue);
    return change;
  });
};

const getLatest = (array) => { return Array.from(array).pop() }

/*
* Calculates Pearson correlation
* between two arrays x and y.
*/
const corr = (x, y) => {
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumX2 = 0,
    sumY2 = 0;
  const minLength = x.length = y.length = Math.min(x.length, y.length),
    reduce = (xi, idx) => {
      const yi = y[idx];
      sumX += xi;
      sumY += yi;
      sumXY += xi * yi;
      sumX2 += xi * xi;
      sumY2 += yi * yi;
    }
  x.forEach(reduce);
  return (minLength * sumXY - sumX * sumY) /
    Math.sqrt((minLength * sumX2 - sumX * sumX) * (minLength * sumY2 - sumY * sumY));
}

/**
 * Generate heatmap
 * This needs to be in the format of
 *  zValues = [
 *     [0.00, 0.00, 0.75, 0.75, 1.00],
 *     [0.00, 0.00, 0.75, 1.00, 0.00],
 *     [0.75, 0.75, 1.00, 0.75, 0.75],
 *     [0.00, 1.00, 0.00, 0.75, 0.00],
 *     [1.00, 0.00, 0.00, 0.75, 0.00]
 *  ];
 */
const generateHeatmapData = (df) => {
  let z = [];
  let dfCopy = df.dropNa().copy();
  let columnsLength = dfCopy.shape[1];
  let columnsToDrop = [];
  let numericColumns = dfCopy.selectDtypes([
    'int32',
    'float32',
  ]);

  // Drop columns with high cardinality (many unique values)
  for (let i = 0; i < columnsLength; i++) {
    let column = dfCopy.columns[i];
    // Skip if a numeric column as it will have lots of unique values
    if (numericColumns.$columns.includes(column)) {
      continue;
    }

    let uniqueValuesCount = dfCopy.column(column).unique().$data.length;

    if (uniqueValuesCount > 5) {
      columnsToDrop.push(column);
    }
  }

  dfCopy.drop({ columns: columnsToDrop, inplace: true });
  dfCopy.tail().print()

  // Create dummy columns for categoric variables
  let dummies = dfCopy.getDummies(dfCopy);
  columnsLength = dummies.$columns.length;

  for (let i = 0; i < columnsLength; i++) {
    let column = dummies.$columns[i];
    let correlations = [];

    for (let j = 0; j < columnsLength; j++) {
      let comparisonColumn = dummies.$columns[j];
      let pearsonCorrelation = corr(
        dummies[column].$data,
        dummies[comparisonColumn].$data
      ).toFixed(2)

      correlations.push(
        pearsonCorrelation
      );
    }

    z.push(correlations);
  }
  return {x: dummies.$columns,
          y: dummies.$columns,
          z: z}
}
