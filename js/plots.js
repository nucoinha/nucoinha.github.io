const config = {
  responsive: true,
  scrollZoom: true,
  displayModeBar: false,
  displaylogo: false
}

const getCandlestickData = (df) => {
  // For line graph if there's no close price use avg column
  const prices = df['close'].values.map(
    (value, index) => (!value) ? df['avg'].values[index] : value
  )
  return {
    x: df.index,
    y: prices,
    close: df['close'].values,
    high: df['max'].values,
    low: df['min'].values,
    open: df['open'].values,
    //type: 'candlestick',
    type: 'scatter',
    name: 'Candlestick',
  }
}

const getVolumeData = (df) => {
  const volumeMask = df['close'].values.map((close, index) => {return close > df['open'].values[index]});
  const volumeColor = volumeMask.map((bool,index) => { return bool ? "green" : "red" })
  return {
    x: df.index,
    y: df['volume'].values,
    type: 'bar',
    name: 'Volume',
    hovertemplate: 'R$ %{y:,.2f}<br>%{x}',
    marker: {
      mask: volumeMask,
      color: volumeColor
    },
  }
}

const getFrozenData = (df) => {
  const baddata = [
    "2024-02-21T08:57:13.000Z",
    "2024-02-21T12:42:13.136Z"
  ]

  const frozenDiff = [0, ...diff(df['totalFrozen'].values)]
  const frozenMask = frozenDiff.map((value, index) => { return value > 0 });
  const frozenColor = frozenMask.map((value, index) => { return value ? "blue" : "red" });

  df.index.map((val,index) => {
    baddata.forEach(data => {
      if (val == data) {
        frozenDiff[index] = null
      }
    })
  })

  return {
    x: df.index,
    y: frozenDiff,
    type: 'bar',
    marker: {
      mask: frozenMask,
      color: frozenColor
    },
    hovertemplate: '%{y:,.2f} NCN<br>%{x}'
  }
}

const plot1 = (df) => {
  var candlestickData = getCandlestickData(df)
  updateData(candlestickData, {
    xaxis: 'x',
    yaxis: 'y'
  });

  var volumeData = getVolumeData(df)
  updateData(volumeData, {
    xaxis: 'x',
    yaxis: 'y2',
  })

  var frozenData = getFrozenData(df)
  updateData(frozenData, {
    xaxis: 'x',
    yaxis: 'y3',
  })

  var updatemenus = [
    {
      buttons: [
        {
          args: ['type', 'line', [0]],
          label: 'Line',
          method:'restyle'
        },
        {
          args: ['type', 'candlestick',[0]],
          label: 'Candles',
          //icon: Plotly.Icons['candle-chart'],
          method: 'restyle'
        },
      ],
      direction: 'right',
      type: 'buttons',
      x: 0.0 - 0.05,
      xanchor: 'left',
      y: 1.0 + 0.1,
      yanchor: 'bottom',
      showactive: false
    }
  ]

  // Create subplot for candlestick chart
  var fig = {
    data: [candlestickData, frozenData, volumeData ],
    layout: {
      separators: ',.',
      showlegend: false,
      uirevision: 'true',
      updatemenus: updatemenus,
      annotations: [{
        x: 0.0 + 0.05,
        y: 1.0 - 0.1,
        font: { size: 20 },
        opacity: 0.5,
        showarrow:false,
        xanchor: 'left',
        yanchor: 'bottom',
        xref: 'paper',
        yref: 'paper',
        text: 'NCN / BRL',
      }],
      grid: {rows: 3, columns: 1},
      pattern: 'independent',
      roworder:'bottom to top',
      subplots:[['xy'], ['xy2'], ['xy3']],
      yaxis:  {domain: [0.42, 1.0], title: 'Price<br>(R$)', separators: ',.'},
      yaxis2: {domain: [0.22, 0.4], title: 'Volume<br>(R$)'},
      yaxis3: {domain: [0.00, 0.2], title: 'Frozen<br>(NCN)'},
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
              count: 7,
              label: '1W',
              step: 'day',
              stepmode: 'backward'
            },
            {
              count: 30,
              label: '1M',
              step: 'day',
              stepmode: 'backward'
            },
            {
              step: 'all'
            }],
          visible: true
        },
        rangeslider: { visible: false },
        type: 'date',
      },
    },
  };
  return fig
}

const plot2 = (df) => {
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
    y: frozenPct.values.map(x => 100*x),
    name: 'Frozen (%)',
    xaxis: 'x',
    yaxis: 'y1',
    fill: 'tozeroy',
    hovertemplate: '%{y:.2f}%<br>%{x}'
  }

  let absTrace = {
    x: df.index,
    y: frozen.values,
    name: 'Frozen (NCN)',
    xaxis: 'x',
    yaxis: 'y2',
    hovertemplate: '%{y:,.2f} NCN<br>%{x}'
  }

  const layout = {
    showlegend: false,
    uirevision: 'true',
    annotations: [{
      x: 0.0 + 0.05,
      y: 1.0 - 0.1,
      font: { size: 20 },
      opacity: 0.5,
      showarrow:false,
      xanchor: 'left',
      yanchor: 'bottom',
      xref: 'paper',
      yref: 'paper',
      text : 'Frozen (% / NCN)',
    }],
    xaxis: {
    },
    yaxis: {
      title: "Frozen (%)",
      range: [pctYMin, pctYMax],
      domain: [0.1, 1.0],
      side: 'left'
    },
    yaxis2: {
      title: "Frozen (NCN)",
      overlaying: 'y',
      range: [absYMin, absYMax],
      domain: [0.1, 1.0],
      side: 'right'
    }
  };

  return {
    data: [absTrace, pctTrace],
    layout: layout
  }
}


const plot3 = (df) => {
  let heatmapData = generateHeatmapData(df)

  let data = [{
    x: heatmapData.x.map(toHumanReadable),
    y: heatmapData.y.map(toHumanReadable),
    z: heatmapData.z,
    type: 'heatmap',
    colorscale: rdylgnColors, // js/themes.js
    hoverongaps: false,
    colorbar: {
      orientation: "h",
    }
  }]
  let layout = {
    title: 'Correlation Map',
    aspectmode: 'data',
    uirevision: 'true',
    xaxis: { fixedrange: true },
    yaxis: { fixedrange: true },
  }
  // DEBUG:
  //let newdf = new dfd.DataFrame(heatmapData.z,
  //                              {columns: heatmapData.x,
  //                                 index: heatmapData.y})
  //newdf.print()
  return { data: data, layout: layout }
}

const plot4 = (df) => {
  let frozen = plotPctChange({
    df: df,
    columnName:'totalFrozen',
    positiveLabel:'Freezing',
    negativeLabel:'Melting',
    title: "Frozen % Change",
    xlabel:'Date',
    ylabel:'%'
  })
  let supply = plotPctChange({
    df: df,
    columnName:'circulationSupply',
    positiveLabel:'Buy',
    negativeLabel:'Sell',
    title: "Buyers / Sellers (% Change)",
    xlabel:'Date',
    ylabel:'%'
  })
}

const plotPctChange = ({df, columnName, positiveLabel, negativeLabel}) => {
  const negative_marker = { color: 'red' }
  const positive_marker = { color: 'green' }
  let dataset = df[columnName]
  let pct_change = [0, ...pctChange(dataset.values,1)]
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
    uirevision: 'true',
    shapes: generateVerticalLines(df.index, pct_change),
  };
  var data = [ data_up, data_dw ]
  return { data: data, layout: layout }
}

const updateChart = (isFirstCall) => {
  const urlParams = getURLParams()
  const gistIdInput = document.getElementById('gistId')
  const getCSVButton = document.getElementById('dataSrc')
  const lastUpdateLabel = document.getElementById('lastUpdate')

  const gistId = gistIdInput.value ? gistIdInput.value
    : urlParams.gistId ? urlParams.gistId : null
  if (!gistId) return

  if (!urlParams.gistId || urlParams.gistId !== gistId) setURLParam('gistId',gistId)
  if (!gistIdInput.value || gistIdInput.value !== gistId) gistIdInput.value = gistId

  const dataUrl = dataPath(gistId)
  getCSVButton.href = downloadCSVUrl(gistId)

  dfd.readCSV(dataUrl).then(async (df) => {
    df = await parseDataFrame(df)
    lastUpdateLabel.text = `Last Update: ${getLastUpdate(df)}`
    fig1 = plot1(df)
    fig2 = plot2(df)
    fig3 = plot3(df)
    if (isFirstCall) {
      Plotly.newPlot('plot1', fig1.data, fig1.layout, config)
      Plotly.newPlot('plot2', fig2.data, fig2.layout, config)
      Plotly.newPlot('plot3', fig3.data, fig3.layout, config)
      bindPlot('plot1','plot2')
    } else {
      Plotly.react('plot1', fig1.data, fig1.layout, config)
      Plotly.react('plot2', fig2.data, fig2.layout, config)
      Plotly.react('plot3', fig3.data, fig3.layout, config)
    }
    setInitialMode();
  });
  console.log('Chart updated!')
};
