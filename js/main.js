const loadedDays = {}
const oldestDate = new Date(9,2,2024);
const gistId = '56c6565767600102bc80df7ae0c9bda7' 

const getLastUpdate = (df) => {
  const d = new Date(getLatest(df.index))
  return new Date(d.setHours(d.getHours() + 3)).toLocaleString('pt-BR', {timeZone: 'America/Sao_Paulo'})
}

const generateDates = (start, end) => {
  let dateRange = dateFns.eachDayOfInterval({ start: start, end: end});
  let reversedDateRange = dateRange.reverse()
  return reversedDateRange;
}

const dataPath = (gistId,date) => {
  const cacheBust = Math.random();
  const formattedDate = dateFns.format(date, 'yyyy-MM-dd');
  return `https://gist.githubusercontent.com/nucoinha/${gistId}/raw/data_${formattedDate}.csv?id=${cacheBust}`
}

const dailyDataPath = (gistId) => {
  const cacheBust = Math.random();
  return `https://gist.githubusercontent.com/nucoinha/${gistId}/raw/daily.csv?id=${cacheBust}`
}

const downloadCSVUrl = (gistId) => {
  return `https://gist.githubusercontent.com/nucoinha/${gistId}/`
}

const parseDataFrame = async (df) => {
  let datetime

  if (df.columns.includes('datetime')) {
    datetime = df['datetime']
      .map(row => {
        const d = new Date(row)
        d.setHours(d.getHours() - 6)
        return d.toISOString()
      }).dropDuplicates()
  } else if (df.columns.includes('date')) {
    datetime = df['date']
  }

  let newdf = df.iloc({ rows: datetime.index })
  newdf.addColumn('datetime', datetime.values, {inplace:true})
  newdf.sortValues('datetime', { inplace: true });
  newdf.setIndex({ column: "datetime", drop: true, inplace:true});
  if (newdf.columns.includes('circulationSupply') && newdf.columns.includes('totalFrozen')) {
    let hold = newdf['circulationSupply'].sub(newdf['totalFrozen'])
    newdf.addColumn('hold', hold, {inplace:true})
    return newdf;
  }
  return newdf
}

const applyLightMode = () => {
  var plot = document.getElementById('plot1');
  Plotly.relayout('plot1', lightLayout);
  Plotly.relayout('plot2', lightLayout);
  // Plotly.relayout('heatmap', lightLayout);
  // Plotly.relayout('scatter', lightLayout);
  const frozenBars = plot.data[1]
  const frozenColorUp   = lightLayout.template.colors.frozen
  const frozenColorDown = lightLayout.template.colors.melting
  const frozenMask = frozenBars.marker.mask
  const frozenColors = frozenBars.marker.mask.map(isTrue => { return isTrue ? frozenColorUp : frozenColorDown }) 
  Plotly.restyle('plot1', { marker: { mask: frozenMask, color: frozenColors}}, [1]);
  const volumeBars      = plot.data[2]
  const volumeColorUp   = lightLayout.template.colors.positive
  const volumeColorDown = lightLayout.template.colors.negative
  const volumeMask      = volumeBars.marker.mask
  const volumeColors    = volumeMask.map(isTrue => { return isTrue ? volumeColorUp : volumeColorDown }) 
  Plotly.restyle('plot1', { marker: { mask: volumeMask, color: volumeColors}}, [2]);
}

const applyDarkMode = () => {
  var plot = document.getElementById('plot1');
  Plotly.relayout('plot1', darkLayout);
  Plotly.relayout('plot2', darkLayout);
  // Plotly.relayout('heatmap', darkLayout);
  // Plotly.relayout('scatter', darkLayout);
  const frozenBars = plot.data[1]
  const frozenColorUp   = darkLayout.template.colors.frozen
  const frozenColorDown = darkLayout.template.colors.melting
  const frozenMask = frozenBars.marker.mask
  const frozenColors = frozenBars.marker.mask.map(isTrue => { return isTrue ? frozenColorUp : frozenColorDown }) 
  Plotly.restyle('plot1', { marker: { mask: frozenMask, color: frozenColors}}, [1]);
  const volumeBars = plot.data[2]
  const volumeColorUp   = darkLayout.template.colors.positive
  const volumeColorDown = darkLayout.template.colors.negative
  const volumeMask      = volumeBars.marker.mask
  const volumeColors    = volumeMask.map(isTrue => { return isTrue ? volumeColorUp : volumeColorDown }) 
  Plotly.restyle('plot1', { marker: { mask: volumeMask, color: volumeColors}}, [2]);
}

// Function to set the initial mode based on the cookie value
const setInitialMode = () => {
  const mode = getCookie('mode');
  const body = document.body;
  if (mode === 'dark') {
    body.classList.add('dark-theme');
    applyDarkMode()
    return;
  }
  body.classList.remove('dark-theme');
  applyLightMode()
}

const toggleMode = () => {
  const body = document.body;
  body.classList.toggle('dark-theme');

  var isDarkMode = getCookie('mode') === 'dark';
  if (isDarkMode) {
    applyLightMode()
    setCookie('mode', 'light', 30);
  } else {
    applyDarkMode()
    setCookie('mode', 'dark', 30);
  }
}

const bindPlot = (plotId, boundPlotId) => {
  const plot = document.getElementById(plotId)
  const applyToAll = (eventData) => {
    if (!eventData) return
    if (eventData['xaxis.autorange'] === true) {
      Plotly.relayout(plotId, {
        'yaxis.autorange': true
      });
      Plotly.relayout(boundPlotId, {
        'xaxis.autorange': true
      });
      plot.saveX = [
        plot.layout.xaxis.range[0],
        plot.layout.xaxis.range[1],
      ];
      plot.saveY = [
        plot.layout.yaxis.range[0],
        plot.layout.yaxis.range[1],
      ];
      Plotly.relayout(plotId, {
        'yaxis.autorange': false 
      });
    }

    if (eventData['xaxis.range[0]'] && eventData['xaxis.range[1]']) {
      // Get the new x-axis range
      plot.saveX  = [
        eventData['xaxis.range[0]'],
        eventData['xaxis.range[1]']
      ];
      plot.saveY = [
        plot.layout.yaxis.range[0],
        plot.layout.yaxis.range[1],
      ];

      // Update the x-axis range of plot2
      Plotly.relayout(boundPlotId, {
        'xaxis.range[0]': plot.saveX[0],
        'xaxis.range[1]': plot.saveX[1]
      });
    }

    if (eventData.length > 0) {
      let chartType = eventData[0].type
      if (Array.from(['candlestick','line','scatter']).includes(chartType)) {
        if (plot.saveX && plot.saveY) {
          Plotly.relayout(plotId, {
            'xaxis.range[0]': plot.saveX[0],
            'xaxis.range[1]': plot.saveX[1],
            'yaxis.range[0]': plot.saveY[0],
            'yaxis.range[1]': plot.saveY[1],
          });
        }
        plot.saveX = [
          plot.layout.xaxis.range[0],
          plot.layout.xaxis.range[1],
        ];
        plot.saveY = [
          plot.layout.yaxis.range[0],
          plot.layout.yaxis.range[1],
        ];
      }
    }
  };
  plot.on('plotly_relayout', applyToAll)
  plot.on('plotly_restyle', applyToAll)
}
