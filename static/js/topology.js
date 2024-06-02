var svg = d3.select("#networkTopology"),
  g = svg.append("g").attr("transform", "translate(" + 40 + "," + 40 + ")"),
  link = g.selectAll(".link"),
  node = g.selectAll(".node"),
  label = g.selectAll(".node-label");

var svgWidth = window.innerWidth;
var svgHeight = window.innerHeight;
var centerX = svgWidth / 2;
var centerY = svgHeight / 2;

var simulation = d3.forceSimulation()
  .force("link", d3.forceLink().id(function (d) { return d.id; }).distance(100))
  .force("charge", d3.forceManyBody().strength(-300))
  .force("center", d3.forceCenter(centerX, centerY))
  .force("collide", d3.forceCollide().radius(20).strength(0.2));

simulation.force("attractToCenter", d3.forceX(centerX).strength(function (d) {
  return d.status === "down" ? 0.2 : 0.01;
}).x(centerX))
  .force("attractToCenterY", d3.forceY(centerY).strength(function (d) {
    return d.status === "down" ? 0.2 : 0.01;
  }).y(centerY));

var zoom = d3.zoom()
  .scaleExtent([0.1, 10])
  .on("zoom", function (event) {
    g.attr("transform", event.transform);
  });
svg.call(zoom);

var eventSource = new EventSource('/topology-stream');
eventSource.onmessage = function (event) {
  var graphData = JSON.parse(event.data);
  updateGraph(graphData);
};

function updateGraph(graphData) {
  console.log("Graph data received:", graphData);

  link = link.data(graphData.links, function (d) { return d.source.id + "-" + d.target.id; });
  link.exit().remove();
  var newLink = link.enter().append("g")
    .attr("class", "link-group");
  newLink.append("line")
    .attr("class", "link")
    .attr("stroke", "gray")
    .attr("stroke-opacity", 0.6)
    .attr("stroke-width", 2);
  link = link.merge(newLink);

  var nodePositions = new Map();
  node.each(function (d) {
    nodePositions.set(d.id, { x: d.x, y: d.y });
  });

  node = node.data(graphData.nodes, d => d.id);
  node.exit().remove();
  var newNode = node.enter().append("g")
    .attr("class", "node")
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));
  newNode.append("image")
    .attr("class", "primary-image")
    .attr("width", 32)
    .attr("height", 32);
  newNode.append("image")
    .attr("class", "status-image")
    .attr("width", 16)
    .attr("height", 16)
    .attr("x", 16)
    .attr("y", 0);
  newNode.on("dblclick", showInfoPopup);
  node = node.merge(newNode);

  node.selectAll(".primary-image")
    .attr("xlink:href", d => selectImage(identifyDeviceType(d.SysDesc)) + "?_=" + new Date().getTime());
  node.selectAll(".status-image")
    .attr("xlink:href", d => (d.status === "up" ? "static/images/checkmark.png" : "static/images/redmark.png") + "?_=" + new Date().getTime());

  node.each(function (d) {
    if (nodePositions.has(d.id)) {
      var pos = nodePositions.get(d.id);
      d.x = pos.x;
      d.y = pos.y;
    } else if (!d.x || !d.y) {
      d.x = Math.random() * svgWidth;
      d.y = Math.random() * svgHeight;
    }
  });

  label = label.data(graphData.nodes, d => d.id);
  label.exit().remove();
  var newLabel = label.enter().append("g")
    .attr("class", "node-label-group");
  newLabel.append("text")
    .attr("class", "label-SysName")
    .text(d => d.SysName);
  newLabel.append("text")
    .attr("class", "label-id")
    .attr("dy", 10)
    .text(d => d.id);
  label = label.merge(newLabel);

  simulation.nodes(graphData.nodes)
    .on("tick", ticked);
  simulation.force("link").links(graphData.links);
  simulation.alpha(1).restart();
}

function showInfoPopup(event, d) {

  event.stopPropagation();
  var popup = d3.select("body").append("div")
    .attr("class", "popup")
    .style("left", (event.pageX + 10) + "px")
    .style("top", (event.pageY + 10) + "px");

  popup.html("<h3>Device Info</h3>" +
    "<p><span class='bolder'>IP:</span> " + d.id + "</p>" +
    "<p><span class='bolder'>ChassisId:</span> " + d.ChassisId + "</p>" +
    "<p><span class='bolder'>PortDesc:</span> " + d.PortDesc + "</p>" +
    "<p><span class='bolder'>PortId:</span> " + d.PortId + "</p>" +
    "<p><span class='bolder'>SysCapEnabled:</span> " + d.SysCapEnabled + "</p>" +
    "<p><span class='bolder'>SysCapSupported:</span> " + d.SysCapSupported + "</p>" +
    "<p><span class='bolder'>SysDesc:</span> " + d.SysDesc + "</p>" +
    "<p><span class='bolder'>SysName:</span> " + d.SysName + "</p>");

  d3.select("body").on("click", function () {
    popup.remove();
    d3.select("body").on("click", null);
  });
}

function ticked() {
  link.select("line")
    .attr("x1", function (d) { return d.source.x; })
    .attr("y1", function (d) { return d.source.y; })
    .attr("x2", function (d) { return d.target.x; })
    .attr("y2", function (d) { return d.target.y; });

  node
    .attr("transform", function (d) { return `translate(${d.x - 16}, ${d.y - 16})`; });

  label
    .attr("transform", function (d) { return `translate(${d.x + 20}, ${d.y})`; });

  link.selectAll("line").each(function (d) {
    const dx = d.target.x - d.source.x;
    const dy = d.target.y - d.source.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const radius = 20;

    const offsetX = (dx * radius) / distance;
    const offsetY = (dy * radius) / distance;

    d3.select(this)
      .attr("x1", d.source.x + offsetX)
      .attr("y1", d.source.y + offsetY)
      .attr("x2", d.target.x - offsetX)
      .attr("y2", d.target.y - offsetY);
  });
}

function dragstarted(event, d) {
  if (!event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(event, d) {
  d.fx = event.x;
  d.fy = event.y;
}

function dragended(event, d) {
  if (!event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}