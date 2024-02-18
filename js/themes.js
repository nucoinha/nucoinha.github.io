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
      },
      rangeselector: {
        bgcolor: '#f5f0f0',
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
    frozen:   '#0a70af',
    melting:  '#cf2c2f',
    navbarColor: '#ffdad9',
    buttonsColor: '#73cee7',
    textColor: '#fff',
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
      },
      rangeselector: {
        bgcolor: '#2f2525',
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
    paper_bgcolor: '#2f2525',  // Dark mode paper background color
  },
  colors: {
    positive: '#3D9970',
    negative: '#FF4136',
    frozen:   '#73CEE7',
    melting:  '#E78C73',
    navbarColor: '#5c3f3f', // lighter brown
    buttonsColor: '#ffdad9', // the lightLayout navbar color
    textColor: '#211a1a',
  }
};

var lightLayout = { template: lightTheme }
var darkLayout = { template: darkTheme }
