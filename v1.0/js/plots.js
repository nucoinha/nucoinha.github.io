const config = {
  responsive: true,
  scrollZoom: true,
  displayModeBar: false,
  displaylogo: false
}

// Outages :(
const baddata = [
  "2024-02-21T08:57:13.000Z",
  "2024-02-21T12:42:13.136Z",
  "2024-02-23T13:12:12.000Z",
  "2024-02-29T22:12.12.934Z",
  "2024-03-02T12:12:12.876Z"
]


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
  const volumeData = fillMissingValues(df['close'].values)
  const volumeMask = volumeData.map((close, index) => {return close > df['open'].values[index]});
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
  const frozenData = fillMissingValues(df['totalFrozen'].values)
  const frozenDiff = [0, ...diff(frozenData)]
  const frozenMask = frozenDiff.map((value, index) => { return value > 0 });
  const frozenColor = frozenMask.map((value, index) => { return value ? "blue" : "red" });

  return {
    x: df.index,
    y: frozenDiff.map(x => Math.abs(x)),
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
      },{
        x: 0.0 + 0.35,
        y: 1.0 - 0.1,
        font: { size: 20 },
        opacity: 0.5,
        showarrow:false,
        xanchor: 'left',
        yanchor: 'bottom',
        xref: 'paper',
        yref: 'paper',
        text: `(${0.00}%)`,
      }],
      grid: {rows: 3, columns: 1},
      pattern: 'independent',
      roworder:'bottom to top',
      subplots:[['xy'], ['xy2'], ['xy3']],
      yaxis:  {domain: [0.42, 1.0], title: 'Price<br>(R$)', separators: ',.'},
      yaxis2: {domain: [0.22, 0.4], minallowed: 0, autorange: 'max', rangemode: 'tozero', title: 'Volume<br>(R$)'},
      yaxis3: {domain: [0.00, 0.2], minallowed: 0, autorange: 'max', rangemode: 'tozero', title: 'Frozen<br>(NCN)'},
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
  let frozen = df.totalFrozen
  let supply = df.circulationSupply
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

  let absSupplyTrace = {
    x: df.index,
    y: supply.values,
    name: 'Supply (NCN)',
    hovertemplate: '%{y} NCN<br>%{x}',
    xaxis: 'x',
    yaxis: 'y2',
  }

  let absFrozenTrace = {
    x: df.index,
    y: frozen.values,
    name: 'Frozen (NCN)',
    hovertemplate: '%{y} NCN<br>%{x}',
    xaxis: 'x',
    yaxis: 'y3',
  }

  let frozenTrace = {
    x: df.index,
    y: frozen.values,
    name: 'Frozen (%)',
    xaxis: 'x',
    yaxis: 'y1',
    hovertemplate: '%{y:.2f}%<br>%{x}',
    stackgroup: 'one', groupnorm:'percent'
  }

  let supplyTrace = {
    x: df.index,
    y: supply.values,
    name: 'Supply (%)',
    xaxis: 'x',
    yaxis: 'y1',
    hovertemplate: '%{y:.2f}%<br>%{x}',
    stackgroup: 'one'
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
      showgrid: false,
      zeroline: false,
      visible: false, 
      range: [0.0, 100.0],
    },
    yaxis2: {
      title: "Supply (NCN)",
      overlaying: 'y',
      range: [Math.min(...supply.values), Math.max(...supply.values)],
      domain: [0.1, 1.0],
      side: 'right'
    },
    yaxis3: {
      title: "Frozen (NCN)",
      overlaying: 'y',
      range: [Math.min(...frozen.values), Math.max(...frozen.values)],
      domain: [0.1, 1.0],
      side: 'left'
    },
  };

  return {
    data: [frozenTrace, supplyTrace, absSupplyTrace, absFrozenTrace],
    layout: layout
  }
}

const plotScatterData = (df, A, B) => {
  var threshold = 3;
  df.dropNa({inplace: true})

  var color = df.index.map(date => new Date(date).getTime())
  var cbar = {
    title: "Date",
    orientation: "h",
  }

  if (B == 'volume' || A == 'volume') {
    const volumeMask = df['close'].values.map((close, index) => {return close > df['open'].values[index]});
    color = volumeMask.map((bool,index) => { return bool ? "green" : "red" })
    cbar = false;
  }

  if (B == 'totalFrozen' || A == 'totalFrozen') {
    const frozenDiff = [0, ...diff(df['totalFrozen'].values)]
    const frozenMask = frozenDiff.map((value, index) => { return value > 0 });
    const color = frozenMask.map((value, index) => { return value ? "blue" : "red" });
  }


  const dataX = filterOutliers(df[A].values,threshold)
  const dataY = filterOutliers(df[B].values,threshold)
  const maxX = Math.max(...dataX) 
  const minX = Math.min(...dataX)
  const maxY = Math.max(...dataY) 
  const minY = Math.min(...dataY)

  let data = [{
    x: dataX,
    y: dataY,
    mode: 'markers',
    type: 'scatter',
    marker: {
      size: 9,
      color: color,
      colormap: 'viridis',
      opacity: 0.5,
      colorbar: cbar,
    },
  }]

  let layout = {
    title: `${toHumanReadable(A)} x ${toHumanReadable(B)}`,
    xaxis: {title: toHumanReadable(A), range: [minX * (1 - 0.01), maxX * (1 + 0.01)] },
    yaxis: {title: toHumanReadable(B), range: [minY * (1 - 0.01), maxY * (1 + 0.01)] },
  }

  return { data: data, layout: layout }
}


const plotCorrelationMatrix = (df) => {
  let heatmapData = generateHeatmapData(df)

  let data = [{
    x: heatmapData.x,
    y: heatmapData.y,
    z: heatmapData.z,
    type: 'heatmap',
    colorscale: rdylgnColors, // js/themes.js
    hoverongaps: false,
    xgap: 4,
    ygap: 4,
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

const loadOlderDays = async (startDate, endDate) => {
  endDate = endDate ?  endDate : getToday();
  const olderDates = generateDates(startDate, endDate)
  await Promise.all(olderDates.map(async (date) => {
    if (GLOBAL_STATE.loadedDays[date] && !isToday(date)) return;
    const url = dataPath(GLOBAL_GIST_ID, date);
    await dfd
      .readCSV(url)
      .then((data) => {
        GLOBAL_STATE.loadedDays[date] = data;
      }).catch(err => {
        GLOBAL_STATE.loadedDays[date] = true;
        GLOBAL_STATE.missingDates = 0;
      })
  }))
  return Object.values(GLOBAL_STATE.loadedDays)
}

const updateChart = async (isFirstCall) => {
  const loaded = await loadOlderDays(GLOBAL_STATE.oldestLoaded)
  const combinedDf = dfd.concat({ dfList: loaded, axis: 0 });
  df = await parseDataFrame(combinedDf)
  const lastUpdate = getLastUpdate(df)
  const lastUpdateLabel = document.getElementById('lastUpdate')
  lastUpdateLabel.text = `Last Update: ${lastUpdate}`

  fig1 = plot1(df)
  fig2 = plot2(df)
  // fig3 = plotCorrelationMatrix(df)
  // fig4 = plotScatterData(df,'totalFrozen','circulationSupply')
  if (isFirstCall) {
    Plotly.newPlot('plot1', fig1.data, fig1.layout, config)
    Plotly.newPlot('plot2', fig2.data, fig2.layout, config)
    // Plotly.newPlot('heatmap', fig3.data, fig3.layout, config)
    // Plotly.newPlot('scatter', fig4.data, fig4.layout, config)
    bindPlot('plot1','plot2')
    const plot1 = document.getElementById('plot1')
    const plot2 = document.getElementById('plot2')
    plot1.on('plotly_relayout', (event) => {
      if (event['xaxis.range[0]']) {
        const oldestDateShown = event['xaxis.range[0]']
        GLOBAL_STATE.oldestLoaded = new Date(oldestDateShown.split(' ')[0]);
        updateChart()
      }
    })
    plot2.on('plotly_relayout', (event) => {
      if (event['xaxis.range[0]']) {
        const oldestDateShown = event['xaxis.range[0]']
        GLOBAL_STATE.oldestLoaded = new Date(oldestDateShown.split(' ')[0]);
        updateChart()
      }
    })
  } else {
    const plot1 = document.getElementById('plot1')
    // keep candlestick chart
    if (plot1.data) fig1.data[0].type = plot1.data[0].type
    Plotly.react('plot1', fig1.data, fig1.layout, config)
    Plotly.react('plot2', fig2.data, fig2.layout, config)
    //Plotly.react('heatmap', fig3.data, fig3.layout, config)
    //Plotly.react('scatter', fig4.data, fig4.layout, config)

    const newX = new Date(getLatest(df.index))
    const oldX = new Date(plot1.layout.xaxis.range[1])
    // If user zoomed in and there is enough space for new data leave it
    if (newX > oldX) {
      plot1.layout.xaxis.range[1] = newX
    }
  }
 // const heatmap = document.getElementById('heatmap');
 // heatmap.on('plotly_click', (data) => {
 //   const scatter = document.getElementById('scatter');
 //   const nameX = data.points[0].x
 //   const nameY = data.points[0].y

 //   fig = plotScatterData(df,nameX,nameY)

 //   Plotly.react('scatter', fig.data, fig.layout, config);
 //   const isDarkMode = getCookie('mode') === 'dark';
 //   if (isDarkMode) {
 //     Plotly.relayout('scatter', darkLayout);
 //   } else {
 //     Plotly.relayout('scatter', lightLayout);
 //   }
 // })
  setInitialMode();
  console.log('Chart updated!')
}
