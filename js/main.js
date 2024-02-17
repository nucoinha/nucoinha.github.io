const library = indicators
const ta = new library.IndicatorsNormalized()

// Initial layout for light mode
var lightTheme = {
  layout: {
    // Define layout properties
    title: {
      font: {
        family: 'Arial',
        size: 24,
        color: '#333333'
      },
      x: 0.5 // Align title to the center
    },
    xaxis: {
      title: {
        font: {
          family: 'Arial',
          size: 16,
          color: '#555555'
        },
        tickfont: {
          family: 'Arial',
          color: '#555555'
        }
      }
    },
    yaxis: {
      title: {
        font: {
          family: 'Arial',
          size: 16,
          color: '#555555'
        },
        tickfont: {
          family: 'Arial',
          size: 16,
          color: '#555555'
        }
      }
    },
    // Define color scheme
    colorway: ['#636efa', '#EF553B', '#00cc96', '#ab63fa', '#FFA15A'],
    plot_bgcolor: 'rgba(255,255,255,0.8)',  // Light mode background color
    paper_bgcolor: '#f5f0f0', // Light mode paper background color
  },
  colors: {
    positive: '#3D9970',
    negative: '#FF4136',
    frozen:   '#73CEE7',
    melting:  '#E78C73',
  }
};

var darkTheme = {
  layout: {
    // Define layout properties
    font: { color: '#CCCCCC' },
    title: {
      font: {
        family: 'Arial',
        size: 24,
        color: '#FFFFFF'
      },
      x: 0.5 // Align title to the center
    },
    xaxis: {
      title: {
        font: {
          family: 'Arial',
          size: 16,
          color: '#CCCCCC'
        },
        tickfont: {
          family: 'Arial',
          color: '#CCCCCC'
        }
      }
    },
    yaxis: {
      title: {
        font: {
          family: 'Arial',
          size: 16,
          color: '#CCCCCC'
        },
        tickfont: {
          family: 'Arial',
          color: '#CCCCCC'
        }
      }
    },
    // Define color scheme
    colorway: ['#636efa', '#EF553B', '#00cc96', '#ab63fa', '#FFA15A'],
    plot_bgcolor:  '#211a1a',  // Dark mode background color
    paper_bgcolor: '#5c3f3f',  // Dark mode paper background color
  },
  colors: {
    positive: '#3D9970',
    negative: '#FF4136',
    frozen:   '#085786',
    melting:  '#b3261e'
  }
};

var lightLayout = { template: lightTheme }
var darkLayout = { template: darkTheme }

const getLatest = (array) => Array.from(array).pop()

const pctChange = (array, period) => {
    return Array.from(array).slice(period ? period : 1).map((value, index) => {
        const prevIndex = index;
        const prevValue = array[index];
        const change = ((value - prevValue) / prevValue) * 100;
        return change;
    });
};

const diff = (array, period) => {
    return Array.from(array).slice(period ? period : 1).map((value, index) => {
        const prevIndex = index;
        const prevValue = array[index];
        const change = (value - prevValue);
        return change;
    });
};

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
  const nullValues = Array(newdf.index.length).fill(null);
  newdf.addColumn('totalFrozen',       nullValues, {inplace:true})
  newdf.addColumn('circulationSupply', nullValues, {inplace:true})
  newdf.addColumn('hold',              nullValues, {inplace:true})
  return newdf
}

// Function to set a cookie
const setCookie = (name, value, days) => {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

// Function to get a cookie
const getCookie = (name) => {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for(var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1, c.length);
    }
    if (c.indexOf(nameEQ) == 0) {
      return c.substring(nameEQ.length, c.length);
    }
  }
  return null;
}

const applyLightMode = () => {
    var fab = document.getElementById('fab');
    var lightbulb = document.getElementById('lightbulb');
    var plot = document.getElementById('plot');
    Plotly.relayout('plot', lightLayout);// Switch to light mode layout
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
    fab.style.backgroundColor = 'white'; // FAB background color in light mode
    lightbulb.style.color = 'black';     // Light bulb color in light mode
}

const applyDarkMode = () => {
    var fab = document.getElementById('fab');
    var lightbulb = document.getElementById('lightbulb');
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
    fab.style.backgroundColor = 'black'; // FAB background color in dark mode
    lightbulb.style.color = 'white';     // Light bulb color in dark mode
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

const isURL = (str) => {
  try {
    new URL(str);
    return true;
  } catch (error) {
    return false;
  }
}

// Lambda function to get URL parameters
const getURLParams = () => Object.fromEntries(new URLSearchParams(window.location.search));

// Lambda function to set URL parameters
const setURLParam = (key, value) => {
  const urlParams = new URLSearchParams(window.location.search);
  urlParams.set(key, value);
  window.location.search = urlParams.toString();
};


