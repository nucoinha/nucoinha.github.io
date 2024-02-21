// Initial layout for light mode
var lightTheme = {
  layout: {
    // Define layout properties
    title: {
      font: {
        family: 'Roboto',
        size: 24,
        color: '#333333'
      },
      x: 0.5 // Align title to the center
    },
    xaxis: {
      title: {
        font: {
          family: 'Roboto',
          size: 16,
          color: '#555555'
        },
        tickfont: {
          family: 'Roboto',
          color: '#555555'
        }
      },
      rangeselector: {
        bgcolor: '#f5f0f0',
      }
    },
    yaxis: {
      title: {
        font: {
          family: 'Roboto',
          size: 16,
          color: '#555555'
        },
        tickfont: {
          family: 'Roboto',
          size: 16,
          color: '#555555'
        }
      }
    },
    height: '100vh',
    updatemenus: {
      bgcolor: '#f5f0f0',
      pad: {'r': 10, 't': 10},
      showactive: false
    },
    // Define color scheme
    colorway: ['#636efa', '#EF553B', '#00cc96', '#ab63fa', '#FFA15A'],
    plot_bgcolor: 'rgba(255,255,255,0.8)',  // Light mode background color
    paper_bgcolor: '#f5f0f0', // Light mode paper background color
  },
  colors: {
    positive: '#3D9970',
    negative: '#FF4136',
    frozen:   '#0a70af',
    melting:  '#cf2c2f',
  }
};

var darkTheme = {
  layout: {
    // Define layout properties
    font: { color: '#CCCCCC' },
    title: {
      font: {
        family: 'Roboto',
        size: 24,
        color: '#FFFFFF'
      },
      x: 0.5 // Align title to the center
    },
    xaxis: {
      title: {
        font: {
          family: 'Roboto',
          size: 16,
          color: '#CCCCCC'
        },
        tickfont: {
          family: 'Roboto',
          color: '#CCCCCC'
        }
      },
      rangeselector: {
        bgcolor: '#2f2525',
      }
    },
    yaxis: {
      title: {
        font: {
          family: 'Roboto',
          size: 16,
          color: '#CCCCCC'
        },
        tickfont: {
          family: 'Roboto',
          color: '#CCCCCC'
        }
      }
    },
    updatemenus: {
      bgcolor: '#ffdad9',
      pad: {'r': 10, 't': 10},
      showactive: false,
    },
    // Define color scheme
    colorway: ['#636efa', '#EF553B', '#00cc96', '#ab63fa', '#FFA15A'],
    plot_bgcolor:  '#211a1a',  // Dark mode background color
    paper_bgcolor: '#2f2525',  // Dark mode paper background color
  },
  colors: {
    positive: '#3D9970',
    negative: '#FF4136',
    frozen:   '#73CEE7',
    melting:  '#E78C73',
  }
};

var lightLayout = { template: lightTheme }
var darkLayout = { template: darkTheme }

// "rdylgn" colormap
var rdylgnColors = [
  [0, 'rgb(165,0,38)'],
  [0.1, 'rgb(215,48,39)'],
  [0.2, 'rgb(244,109,67)'],
  [0.3, 'rgb(253,174,97)'],
  [0.4, 'rgb(254,224,139)'],
  [0.5, 'rgb(255,255,191)'],
  [0.6, 'rgb(217,239,139)'],
  [0.7, 'rgb(166,217,106)'],
  [0.8, 'rgb(102,189,99)'],
  [0.9, 'rgb(26,152,80)'],
  [1, 'rgb(0,104,55)']
];

