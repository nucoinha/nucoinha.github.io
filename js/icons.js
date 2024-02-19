const iconify = (svgString) => {
  // Parse the SVG string
  var parser = new DOMParser();
  var svgDoc = parser.parseFromString(svgString, 'image/svg+xml');
  var svgElement = svgDoc.documentElement;
  // Extract attributes from the SVG
  var width = svgElement.getAttribute('width');
  var height = svgElement.getAttribute('height');
  var pathElement = svgElement.querySelector('path');
  var pathData = pathElement.getAttribute('d');

  // Create the icon object
  var iconObject = {
      'width': width,
      'height': height,
      'path': pathData,
  };
  return iconObject;
}
Plotly.Icons['candle-chart'] = iconify('<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M9 4H7v2H5v12h2v2h2v-2h2V6H9zm0 12H7V8h2zm10-8h-2V4h-2v4h-2v7h2v5h2v-5h2zm-2 5h-2v-3h2z"/></svg>')

