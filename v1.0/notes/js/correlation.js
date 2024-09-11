const generateXAxis = (xmin, xmax, dx) => Array.from({length: Math.floor((xmax - xmin) / dx) + 1}, (_, i) => xmin + i * dx);

const generateCorrelatedWienerProcesses = (length, dt, rho, y1, y2) => {
  const process1 = [];
  const process2 = [];

  // Generate correlated Wiener processes
  for (let i = 0; i < length; i++) {
    // Generate correlated increments
    const dW1 = gaussianRandom(0, 1);
    const dW2 = rho * dW1 + Math.sqrt(1 - rho**2) * gaussianRandom(0, 1);
    // Calculate Wiener process values
    let w1 = y1 ? y1 : 0;
    let w2 = y2 ? y2 : 0;
    if (i > 0) {
      w1 = process1[i - 1] + Math.sqrt(dt) * dW1;
      w2 = process2[i - 1] + Math.sqrt(dt) * dW2;
    }

    // Store Wiener process values
    process1.push(w1)
    process2.push(w2)
  }

  return { A: process1, B: process2};
};

const generateCorrelatedData = (x0, rho, dt, y1, y2) => {
  const x = generateXAxis(x0-0.25,x0+0.25,dt)
  const w = generateCorrelatedWienerProcesses(x.length, dt, rho, y1, y2)
  return {x: x, A:w.A, B:w.B}
}

var updatemenus = (margin) => {return [
  {
    buttons: [
      {
        method: 'relayout',
        args: ['xaxis.range', [-margin-0.25, margin+0.25]],
        label: 'Negative'
      },
      {
        method: 'relayout',
        args: ['xaxis.range', [-margin+0.6-0.25, margin+0.6+0.25]],
        label: 'Positive'
      },
      {
        method: 'relayout',
        args: ['xaxis.autorange', true],
        label: 'Both'
      },
    ],
    type: 'buttons',
    direction: 'left',
    showactive: true,
    x: 0.5,
    xanchor: 'center',
    y: -0.1,
    yanchor: 'top'
  }
]}

// Define layout options
const layout = {
  title: 'Correlation Trends',
  //hovermode: 'closest',
  xaxis:  { fixedrange: true, visible: false, title: 'X Axis' },
  yaxis:  { fixedrange: true, domain: [0.0, 1.0], visible: false, showgrid: false, zeroline: false},
  yaxis2: { fixedrange: true, domain: [0.0, 1.0], visible: false, showgrid: false, zeroline: false,
                                                overlaying: 'y', side: 'right'},
  showlegend: false,
  updatemenus: updatemenus(0.0),
  height: '400',
  margin: {
    l: 10, r: 10, b: 10, t: 50
  },
  zoom: false
};

const config = {
  responsive: true,
  displayModeBar: false,
  displaylogo: false
}


const getFigure = (positive, negative) => {
  const corrPosAwithB = corr(positive.A, positive.B).toFixed(3)
  const corrNegAwithB = corr(negative.A, negative.B).toFixed(3)

  // Calculate correlation matrices
  const corrMatrixNegative = [
    [corr(negative.A, negative.A), corr(negative.A, negative.B)],
    [corr(negative.B, negative.A), corr(negative.B, negative.B)]
  ];

  const corrMatrixPositive = [
    [corr(positive.A, positive.A), corr(positive.A, positive.B)],
    [corr(positive.B, positive.A), corr(positive.B, positive.B)]
  ];

  // Define trace for positive correlation
  const posA = {
    x: positive.x,
    y: positive.A,
    name: 'A',
    mode: 'lines',
    line: { color: 'red' },
    hovertemplate: '%{y}',
    yaxis: 'y2',
    type: 'scatter'
  };

  const posB = {
    x: positive.x,
    y: positive.B,
    name: 'B',
    mode: 'lines',
    line: { color: 'blue' },
    hovertemplate: '%{y}',
    type: 'scatter'
  };

  // Define trace for negative correlation
  const negA = {
    x: negative.x,
    y: negative.A,
    name: 'A',
    mode: 'lines',
    line: { color: 'red' },
    hovertemplate: '%{y}',
    yaxis: 'y2',
    type: 'scatter'
  };

  const negB = {
    x: negative.x,
    y: negative.B,
    name: 'B',
    mode: 'lines',
    line: { color: 'blue' },
    hovertemplate: '%{y}',
    type: 'scatter'
  };

  // Create heatmap traces
  const traceNegative = {
    z: corrMatrixNegative,
    type: 'heatmap',
    colorscale: 'Viridis',
    xaxis: 'x3',
    yaxis: 'y3',
    zmin: -1,
    zmax: 1
  };

  const tracePositive = {
    z: corrMatrixPositive,
    type: 'heatmap',
    colorscale: 'Viridis',
    xaxis: 'x',
    yaxis: 'y3',
    zmin: -1,
    zmax: 1
  };

  const negLabel = {
    x: 0.0,
    y: 1.05,
    xref: 'x',
    yref: 'paper',
    xanchor: 'center',
    font: { size: 20 },
    text: `ρ = ${corrNegAwithB}`,
    showarrow: false,
  };

  const posLabel = {
    x: 0.6,
    y: 1.05,
    xref: 'x',
    yref: 'paper',
    xanchor: 'center',
    font: { size: 20 },
    text: `ρ = ${corrPosAwithB}`,
    showarrow: false,
  };

  layout.annotations = [negLabel, posLabel]

  return {
    data: [posA, posB, negA, negB],
    layout: layout,
    config: config
  }
};
