const library = indicators
const ta = new library.IndicatorsNormalized()

const font            = { size: 18, color: '#7f7f7f' }
const positive_marker = { width: 2, size: 2, color: 'rgba(0, 255, 0, 0.5)' }
const negative_marker = { width: 2, size: 2, color: 'rgba(255, 0, 0, 0.5)' }
const frozen_marker   = { color: 'rgba(0, 0, 255, 0.5)' }
const hold_marker     = { color: 'rgba(0, 255, 255, 0.5)' }
const supply_marker   = { color: 'rgb(255, 0, 0)' }
const price_marker    = { color: 'rgb(21, 138, 12)' }
const EMA_marker      = { color: 'rgb(0,0,0,0.4)' }

const latest = (df) => Array.from(df.values).pop()

const pctChange = (array, period) => {
    return Array.from(array).slice(period).map((value, index) => {
        const prevIndex = index;
        const prevValue = array[index];
        const change = ((value - prevValue) / prevValue) * 100;
        return change;
    });
};
const absChange = (array, period) => {
    return Array.from(array).slice(period).map((value, index) => {
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
  let newdf = df.iloc({ rows: datetime.index })
  newdf.addColumn('datetime', datetime.values, {inplace:true})
  newdf.setIndex({ column: "datetime", drop: true, inplace:true});
  let hold = newdf['supply'].sub(newdf['frozen'])
  newdf.addColumn('hold', hold, {inplace:true})
  return newdf
}

const plot1 = async (df, html_id) => {
    let frozen = df['frozen']
    let supply = df['supply']
    let price  = df['price']
    let hold   = df['hold']
    let latest_price  = latest(price)
    let latest_supply = latest(supply)
    let latest_frozen = latest(frozen)
    let latest_hold   = latest_supply - latest_frozen
    let frozen_pct = frozen.div(supply)
    let frozen_min = frozen_pct.min() * 100 // %
    let frozen_max = frozen_pct.max() * 100 // %
    let ymin = frozen_min * (1.0 - 0.01)
    let ymax = frozen_max * (1.0 + 0.01)
    let price_EMA = await ta.ema(price.values, 20)

    let price_trace = {
        x: df.index,
        y: price.values,
        name: "Price NCN",
        xaxis: 'x',
        yaxis: 'y2',
        type: 'scatter',
        mode: 'line',
        line: price_marker
    }

    let price_ema_trace = {
        x: df.index,
        y: price_EMA,
        name: "EMA 20",
        xaxis: 'x',
        yaxis: 'y2',
        type: 'scatter',
        mode: 'line',
        line: EMA_marker
    }

    let supply_trace = {
        x: df.index,
        y: supply.values,
        name: "Circulating NCN",
        xaxis: 'x',
        yaxis: 'y',
        type: 'scatter',
        mode: 'line',
        line: supply_marker,
    }

    let frozen_trace = {
        x: df.index,
        y: frozen.values,
        name: 'Frozen',
        stackgroup: 'one',
        groupnorm: 'percent',
        xaxis: 'x',
        yaxis: 'y3',
        marker: frozen_marker
    }

    let hold_trace = {
        x: df.index,
        y: hold.values,
        name: 'Hold',
        stackgroup: 'one',
        xaxis: 'x',
        yaxis: 'y3',
        marker: hold_marker
    }

    const layout = {
        title: "Frozen vs Hold (NCN)",
        showlegend: true,
        legend: {
          orientation: "h",
          x: 0.5,
          y: 0.5
        },
        height: 650,
        grid: {
            rows: 2,
            columns: 1,
            xgap: 0.25,
            pattern: 'independent',
            subplots:[['xy'], ['xy2','xy3']],
            roworder:'bottom to top'
        },
        xaxis: {
            title: "Date",
        },
        yaxis: {
            title: "Supply",
            side: 'right'
        },
        yaxis2: {
            title: "Price (R$)",
            side: 'left',
            domain: [0.4, 1.0]
        },
        yaxis3: {
            title: "% of Total",
            range: [ymin,ymax],
            anchor: 'x',
            overlaying: 'y',
            side: 'left',
            domain: [0.0, 0.3]
        },
    };

    var data = [ price_ema_trace, price_trace, frozen_trace, hold_trace, supply_trace ]

    Plotly.newPlot(html_id, data, layout);
}

const plot2 = (df, html_id) => {
    let plot = plotPctChange({
        df: df,
        columnName:'frozen',
        positiveLabel:'Freezing',
        negativeLabel:'Melting',
        title: "Frozen % Change",
        xlabel:'Date',
        ylabel:'%'
    })
    Plotly.newPlot(html_id, plot.data, plot.layout);
}


const plot3 = (df, html_id) => {
    let plot = plotPctChange({
        df: df,
        columnName:'supply',
        positiveLabel:'Buy',
        negativeLabel:'Sell',
        title: "Buyers / Sellers (% Change)",
        xlabel:'Date',
        ylabel:'%'
    })
    Plotly.newPlot(html_id, plot.data, plot.layout);
}

const plotPctChange = ({
    df, columnName, 
    positiveLabel, negativeLabel,
    title, xlabel, ylabel}) => {
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
        title: title, 
        xaxis: {
            title: xlabel,
        },
        yaxis: {
            title: ylabel,
        },
        shapes: generateVerticalLines(df.index, pct_change),
        legend: {
          orientation: "h",
          x: 0.5,
          y: 0.5
        },
    };
    var data = [ data_up, data_dw ]
    return { data: data, layout: layout }
}

const plot4 = (df, html_id) => {
    const headerStyle = {
        align: "center",
        fill: { color: ["gray"] },
        font: { family: "Arial", size: 15, color: "white" },
        columnwidth: 200,
    };
    const cellStyle = {
        align: ["center"],
        line: { color: "black", width: 10 },
    };

    let stats = df.describe()
    stats.addColumn('desc.:', stats.index,{inplace:true})
    stats.plot(html_id).table({
        config: {
            tableHeaderStyle: headerStyle,
            tableCellStyle: cellStyle,
        },
        layout: {
            title: "Table displaying descriptive statistics",
    },
  });
}

