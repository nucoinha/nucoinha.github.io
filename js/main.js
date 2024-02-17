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

const fix_datetime = (df) => {
  let datetime = df['datetime']
    .map(row => {
      const d = new Date(row)
      d.setHours(d.getHours() - 6)
      return d.toISOString()
    }).dropDuplicates()
  datetime.print()
  let newdf = df.iloc({ rows: datetime.index })
  newdf.addColumn('datetime', datetime.values, {inplace:true})
  newdf.setIndex({ column: "datetime", drop: true, inplace:true});
  let hold = newdf['circulationSupply'].sub(df['totalFrozen'])
  newdf.addColumn('hold', hold, {inplace:true})
  newdf.tail().print()
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
