const plot1 = (df, htmlId) => {
  // Extract data for candlestick chart
  var candlestickData = {
    x: df.index,
    close: df['close'].values,
    high: df['max'].values,
    low: df['min'].values,
    open: df['open'].values,
    type: 'candlestick',
    name: 'Candlestick',
    xaxis: 'x',
    yaxis: 'y'
  };

  const volumeMask = df['close'].values.map((close, index) => {return close > df['open'].values[index]});
  const volumeColor = volumeMask.map((bool,index) => { return bool ? "green" : "red" })

  var volumeData = {
    x: df.index,
    y: df['volume'].values,
    type: 'bar',
    name: 'Volume',
    xaxis: 'x',
    yaxis: 'y2',
    marker: {
      mask: volumeMask,
      color: volumeColor
    }
  };

  const frozenDiff = [0, ...diff(df['totalFrozen'].values)]
  const frozenMask = frozenDiff.map((value, index) => { return value > 0 });
  const frozenColor = frozenMask.map((value, index) => { return value ? "blue" : "red" });

  var frozenData = {
    x: df.index,
    y: frozenDiff,
    type: 'bar',
    xaxis: 'x',
    yaxis: 'y3',
    marker: {
      mask: frozenMask,
      color: frozenColor
    }
  }

  // Create subplot for candlestick chart
  var fig = {
    data: [candlestickData, frozenData, volumeData ],
    layout: {
      template: 'plotly_dark',
      title: 'NCN / BRL',
      showlegend: false,
      grid: {rows: 3, columns: 1},
      pattern: 'independent',
      roworder:'bottom to top',
      subplots:[['xy'], ['xy2'], ['xy3']],
      height: '600',
      yaxis:  {domain: [0.42, 1.0], title: 'Price (R$)'},
      yaxis2: {domain: [0.22, 0.4], title: 'Volume (R$)'},
      yaxis3: {domain: [0.00, 0.2], title: 'Frozen Diff'},
      xaxis: {
        rangeselector: {
          buttons: [
            {
              count: 1,
              label: '1h',
              step: 'hour',
              stepmode: 'backward'
            },
            {
              count: 12,
              label: '12h',
              step: 'hour',
              stepmode: 'backward'
            },
            {
              count: 1,
              label: '1d',
              step: 'day',
              stepmode: 'backward'
            },
            {
              step: 'all'
            }],
          visible: true
        },
        //fixedrange: true,
        rangeslider: { visible: false },
        type: 'date',
        title: 'Datetime'
      },
    },
  };

  // Plot the chart
  Plotly.newPlot(htmlId, fig.data, fig.layout);
}

const plot2 = async (df, htmlId) => {
  let frozen = df['totalFrozen']
  let supply = df['circulationSupply']
  let latestSupply = getLatest(supply.values)
  let latestFrozen = getLatest(frozen.values)
  let frozenPct = frozen.div(supply)

  let absMin = frozen.min()
  let absMax = frozen.max()
  let absYMin = absMin * (1.0 - 0.01)
  let absYMax = absMax * (1.0 + 0.01)

  let pctMin = frozenPct.min() * 100
  let pctMax = frozenPct.max() * 100
  let pctYMin = pctMin * (1.0 - 0.01)
  let pctYMax = pctMax * (1.0 + 0.01)

  let pctTrace = {
    x: df.index,
    y: frozenPct.values.map(x => 100*x.toFixed(3)),
    name: 'Frozen (%)',
    xaxis: 'x',
    yaxis: 'y1',
    fill: 'tozeroy',
  }

  let absTrace = {
    x: df.index,
    y: frozen.values,
    name: 'Frozen (NCN)',
    xaxis: 'x',
    yaxis: 'y2',
  }

  const layout = {
    title: "Frozen",
    showlegend: false,
    height: 600,
    xaxis: {
      title: "Date",
    },
    yaxis: {
      title: "Frozen (%)",
      range: [pctYMin, pctYMax],
      side: 'left'
    },
    yaxis2: {
      title: "Frozen (NCN)",
      overlaying: 'y',
      range: [absYMin, absYMax],
      side: 'right'
    }
  };

  var data = [absTrace, pctTrace]
  
  Plotly.newPlot(htmlId, data, layout);
}

const plot3 = (df, htmlId) => {
  let frozenPctChange = plotPctChange({
    df: df,
    columnName:'frozen',
    positiveLabel:'Freezing',
    negativeLabel:'Melting',
    title: "Frozen % Change",
    xlabel:'Date',
    ylabel:'%'
  })
  let supplyPctChange = plotPctChange({
    df: df,
    columnName:'supply',
    positiveLabel:'Buy',
    negativeLabel:'Sell',
    title: "Buyers / Sellers (% Change)",
    xlabel:'Date',
    ylabel:'%'
  })
  //Plotly.newPlot(htmlId, plot.data, plot.layout);
}

const plotPctChange = ({df, columnName, positiveLabel, negativeLabel}) => {
  let dataset = df[columnName]
  let pct_change = [0, ...pctChange(dataset.values,1)]
  console.log(pct_change)
  let newColumn = columnName + '_pct_change'
  df.addColumn(newColumn, pct_change, {inplace:true})
  var positive = df[newColumn].loc(df[newColumn].ge(0))
  var negative = df[newColumn].loc(df[newColumn].le(0))
  const generateVerticalLines = (xValues, percentageDiff) => {
    return xValues.flatMap(function(x, index) {
      var lines = [];
      if (percentageDiff[index] > 0) {
        lines.push({
          type: 'line',
          x0: x,
          y0: 0,
          x1: x,
          y1: percentageDiff[index],
          line: positive_marker,
        });
      } else if (percentageDiff[index] < 0) {
        lines.push({
          type: 'line',
          x0: x,
          y0: 0,
          x1: x,
          y1: percentageDiff[index],
          line: negative_marker,
        });
      }
      return lines;
    });
  }

  let data_up = {
    x: positive.index,
    y: positive.values,
    name: positiveLabel,
    xaxis: 'x',
    yaxis: 'y',
    mode: 'markers',
    marker: positive_marker
  }

  let data_dw = {
    x: negative.index,
    y: negative.values,
    name: negativeLabel,
    xaxis: 'x',
    yaxis: 'y',
    mode: 'markers',
    marker: negative_marker 
  }

  const layout = {
    shapes: generateVerticalLines(df.index, pct_change),
  };
  var data = [ data_up, data_dw ]
  return { data: data, layout: layout }
}
