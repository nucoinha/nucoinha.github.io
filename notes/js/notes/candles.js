const plotCandles1 = (htmlId) => {
  const max   =  1.00;
  const big   =  0.75;
  const small =  0.25;
  const min   =  0.00;

  const coin = coinFlip()
  var bearishData = [
    { x: 0-0.250, y: big  },
    { x: 0-0.125, y: coin ? min : max },
    { x: 0+0.125, y: coin ? max : min },
    { x: 0+0.250, y: small},
  ]

  var bullishData = [
    { x: 1-0.250, y: small},
    { x: 1-0.125, y: coin ? min : max },
    { x: 1+0.125, y: coin ? max : min },
    { x: 1+0.250, y: big  },
  ]

  const lineSegment = (points, dx) => {
    let xValues = [];
    let yValues = [];

    // Iterate over each pair of consecutive points
    for (let i = 0; i < points.length - 1; i++) {
      let x0 = points[i].x;
      let y0 = points[i].y;
      let x1 = points[i + 1].x;
      let y1 = points[i + 1].y;

      let N = Math.ceil((x1 - x0) / dx);

      for (let j = 0; j <= N; j++) {
        let x = x0 + j * (x1 - x0) / N;
        xValues.push(x);
      }
      for (let j = 0; j <= N; j++) {

        let dW = wienerProcess(dx)
        let y = y0 + j * (y1 - y0) / N;
        y += dW
        yValues.push(y);
      }
    }

    const l1 = points.length - 1
    const l2 = yValues.length - 1
    // Scale to fit max and min
    yValues = scaleArrayValues(yValues, min, max)
    yValues[0]  = points[0].y  // Adjust to Open
    yValues[l2] = points[l1].y // Adjust to Close

    return { x: xValues, y: yValues};
  };

  const a = 0.01; // Parameter a

  const bullish = lineSegment(bullishData, a);
  const bearish = lineSegment(bearishData, a);
  console.log(bullish);

  var data = [{
    type: 'candlestick',
    x: [0, 1],
    open:  [big, small],
    close: [small, big],
    high:  [max, max],
    low:   [min, min],
    increasing: {line: {color: 'green'}},  // Color for bullish candle
    decreasing: {line: {color: 'red'}},    // Color for bearish candle
    name: 'Bullish and Bearish Candles'
  }, {
    type: 'scatter',
    x: bearish.x,
    y: bearish.y,
    mode: 'lines',
    line: {color: 'blue'},
    name: 'Price Path (Bear)'
  }, {
    type: 'scatter',
    x: bullish.x,
    y: bullish.y,
    mode: 'lines',
    line: {color: 'blue'},
    name: 'Price Path (Bull)'
  }, {
    type: 'scatter',
    x: [-0.25, 0.25],
    y: [max, max],
    mode: 'lines',
    name: 'Max Line',
    line: {
      dash: 'dash',
      color: 'blue'
    }
  }, {
    type: 'scatter',
    x: [-0.25, 0.25],
    y: [min, min],
    mode: 'lines',
    name: 'Min Line',
    line: {
      dash: 'dash',
      color: 'purple'
    },
  }, {
    type: 'scatter',
    x: [1-0.25, 1+0.25],
    y: [max, max],
    mode: 'lines',
    name: 'Max Line',
    line: {
      dash: 'dash',
      color: 'blue'
    }
  }, {
    type: 'scatter',
    x: [1-0.25, 1+0.25],
    y: [min, min],
    mode: 'lines',
    name: 'Min Line',
    line: {
      dash: 'dash',
      color: 'purple'
    }
  }]

  // Layout settings with annotations
  var layout = {
    xaxis: {
      rangeslider: { visible: false },
    },
    yaxis: {
      visible: true,
    },
    annotations: [

      {
        x: -0.25,
        y: max,
        xref: 'x',
        yref: 'y',
        text: 'Max (Bearish)',
        showarrow: true,
        arrowhead: 2,
      },
      {
        x: -0.25,
        y: min,
        xref: 'x',
        yref: 'y',
        text: 'Min (Bearish)',
        showarrow: true,
        arrowhead: 2,
      },
      {
        x: 1 + 0.25,
        y: max,
        xref: 'x',
        yref: 'y',
        text: 'Max (Bullish)',
        showarrow: true,
        arrowhead: 2,
      },
      {
        x: 1 + 0.25,
        y: min,
        xref: 'x',
        yref: 'y',
        text: 'Min',
        showarrow: true,
        arrowhead: 2,
        ax: +80,
        font: { size: 20 }
      },
      {
        x: -0.25,
        y: big,
        xref: 'x',
        yref: 'y',
        text: 'Open',
        showarrow: true,
        arrowhead: 2,
        ax: -80,
        font: { size: 20 }
      },
      {
        x: 0.25,
        y: small,
        xref: 'x',
        yref: 'y',
        text: 'Close',
        showarrow: true,
        arrowhead: 2,
        ax: +80,
        font: { size: 20 }
      },
    ]
  };

  Plotly.newPlot(htmlId, data, layout);
}
