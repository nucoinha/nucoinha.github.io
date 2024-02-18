const library = indicators
const ta = new library.IndicatorsNormalized()

const getLastUpdate = (df) => {
  const d = new Date(getLatest(df.index))
  return new Date(d.setHours(d.getHours() + 3)).toLocaleString('pt-BR', {timeZone: 'America/Sao_Paulo'})
}

const dataPath = (gistId) => {
  const cacheBust = '' + Math.random();
  return `https://gist.githubusercontent.com/nucoinha/${gistId}/raw/?id=${cacheBust}`
}
const downloadCSVUrl = (gistId) => {
  return `https://gist.githubusercontent.com/nucoinha/${gistId}/`
}
const getOldData = async () => {
  const cacheBust = '' + Math.random()
  const gistId = '1321a7f81ce1f2ecf8e2ef33e73b4bb1'
  const dataPath = `https://gist.githubusercontent.com/nucoinha/${gistId}/raw/?id=${cacheBust}`
  try {
    // Read the CSV file
    const df = await dfd.readCSV(dataPath);
    return df;
  } catch (error) {
    console.error("Error reading CSV:", error);
    return null;
  }
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
  newdf.setIndex({ column: "datetime", drop: true, inplace:true});
  if (newdf.columns.includes('circulationSupply') &&
    newdf.columns.includes('totalFrozen')) {
    let hold = newdf['circulationSupply'].sub(newdf['totalFrozen'])
    newdf.addColumn('hold', hold, {inplace:true})
    return newdf;
  }

  oldDataFrame = await getOldData()
  // Convert datetimes into a date-only, then drop the duplicates keeping the latest value
  const resampled = oldDataFrame['datetime']
                      .map(val => new Date(val).toISOString().split('T')[0])
                      .dropDuplicates({ keep: "last" })
  // Use the resampled index, to index the dataFrame, this way we get the latest info of a given day
  oldDataFrame = oldDataFrame.loc({ rows: resampled.index, columns: ['datetime', 'frozen', 'supply']})
  oldDataFrame.addColumn('datetime', resampled)
  oldDataFrame.resetIndex({ inplace: true })
  // rename for conforming with new column names
  oldDataFrame.rename({'datetime': 'date', 'frozen':'totalFrozen', 'supply':'circulationSupply'}, {inplace:true})

  // Merge the interval data into the daily DataFrame based on date
  const mergedData = dfd.merge({left: newdf, right:oldDataFrame,
    on: ['date'],
    how: 'left'
  });
  mergedData.setIndex({ column: 'date', drop: true, inplace:true});
  mergedData.tail().print()
  return mergedData 
  const nullValues = Array(newdf.index.length).fill(null);
  newdf.addColumn('totalFrozen',       nullValues, {inplace:true})
  newdf.addColumn('circulationSupply', nullValues, {inplace:true})
  newdf.addColumn('hold',              nullValues, {inplace:true})
  return newdf
}

const applyLightMode = () => {
  var plot = document.getElementById('plot');
  Plotly.relayout('plot', lightLayout); // Switch to dark mode layout
  Plotly.relayout('plot2', lightLayout); // Switch to dark mode layout
  const frozenBars = plot.data[1]
  const frozenColorUp   = lightLayout.template.colors.frozen
  const frozenColorDown = lightLayout.template.colors.melting
  const frozenMask = frozenBars.marker.mask
  const frozenColors = frozenBars.marker.mask.map(isTrue => { return isTrue ? frozenColorUp : frozenColorDown }) 
  Plotly.restyle('plot', { marker: { mask: frozenMask, color: frozenColors}}, [1]);
  const volumeBars      = plot.data[2]
  const volumeColorUp   = lightLayout.template.colors.positive
  const volumeColorDown = lightLayout.template.colors.negative
  const volumeMask      = volumeBars.marker.mask
  const volumeColors    = volumeMask.map(isTrue => { return isTrue ? volumeColorUp : volumeColorDown }) 
  Plotly.restyle('plot', { marker: { mask: volumeMask, color: volumeColors}}, [2]);

  var fab = document.getElementById('fab');
  var lamp = document.getElementById('lightbulb');
  var navbar = document.getElementById('navbar');
  fab.style['background-color'] = lightLayout.template.colors.navbarColor
  lamp.style['color'] = darkLayout.template.colors.textColor
  navbar.style['background-color'] = lightLayout.template.colors.navbarColor;
  var getCSVButton = document.getElementById('dataSrc')
  var loadButton = document.getElementById('loadButton')
  Array.from([getCSVButton, loadButton]).forEach(button => {
    button.style['background-color'] = lightLayout.template.colors.buttonsColor;
    button.style['color']            = lightLayout.template.colors.textColor;
  })
}

const applyDarkMode = () => {
  var plot = document.getElementById('plot');
  Plotly.relayout('plot', darkLayout); // Switch to dark mode layout
  Plotly.relayout('plot2', darkLayout); // Switch to dark mode layout
  const frozenBars = plot.data[1]
  const frozenColorUp   = darkLayout.template.colors.frozen
  const frozenColorDown = darkLayout.template.colors.melting
  const frozenMask = frozenBars.marker.mask
  const frozenColors = frozenBars.marker.mask.map(isTrue => { return isTrue ? frozenColorUp : frozenColorDown }) 
  Plotly.restyle('plot', { marker: { mask: frozenMask, color: frozenColors}}, [1]);
  const volumeBars = plot.data[2]
  const volumeColorUp   = darkLayout.template.colors.positive
  const volumeColorDown = darkLayout.template.colors.negative
  const volumeMask      = volumeBars.marker.mask
  const volumeColors    = volumeMask.map(isTrue => { return isTrue ? volumeColorUp : volumeColorDown }) 
  Plotly.restyle('plot', { marker: { mask: volumeMask, color: volumeColors}}, [2]);

  var fab = document.getElementById('fab');
  var lamp = document.getElementById('lightbulb');
  var navbar = document.getElementById('navbar');
  fab.style['background-color']    = darkLayout.template.colors.navbarColor
  lamp.style['color']              = lightLayout.template.colors.textColor
  navbar.style['background-color'] = darkLayout.template.colors.navbarColor;
  var getCSVButton = document.getElementById('dataSrc')
  var loadButton = document.getElementById('loadButton')
  Array.from([getCSVButton, loadButton]).forEach(button => {
    button.style['background-color'] = darkLayout.template.colors.buttonsColor;
    button.style['color']            = darkLayout.template.colors.textColor;
  })
}

// Function to set the initial mode based on the cookie value
const setInitialMode = () => {
  var mode = getCookie('mode');
  if (mode === 'dark') {
    applyDarkMode()
    return;
  }
  applyLightMode()
}

const toggleMode = () => {
  var isDarkMode = getCookie('mode') === 'dark';
  if (isDarkMode) {
    applyLightMode()
    setCookie('mode', 'light', 30);      // Save mode preference in cookie
  } else {
    applyDarkMode()
    setCookie('mode', 'dark', 30);       // Save mode preference in cookie
  }
}

const bindPlot = (plotId, boundPlotId) => {
  const plot = document.getElementById(plotId)
  const applyToAll = (eventData) => {
    if (!eventData) return
    if (eventData['xaxis.autorange'] === true) {
      // Update the x-axis range of plot2 to auto-range
      Plotly.relayout(boundPlotId, {
        'xaxis.autorange': true
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
        if (!plot.saveX && !plot.saveY) return
        Plotly.relayout(plotId, {
          'xaxis.range[0]': plot.saveX[0],
          'xaxis.range[1]': plot.saveX[1],
          'yaxis.range[0]': plot.saveY[0],
          'yaxis.range[1]': plot.saveY[1]
        });
      }
    }
  };
  plot.on('plotly_relayout', applyToAll)
  plot.on('plotly_restyle', applyToAll)
}
