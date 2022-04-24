import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import data from '../utils/miserables.json';

export default function Graph({
  nodes,
  links,
  nodeId = (d) => d.id, // given d in nodes, returns a unique identifier (string)
  nodeGroup = (d) => d.group, // given d in nodes, returns an (ordinal) value for color
  nodeGroups, // an array of ordinal values representing the node groups
  nodeTitle = (d) => `${d.id}\n${d.group}`, // given d in nodes, a title string
  nodeFill = 'currentColor', // node stroke fill (if not using a group color encoding)
  nodeStroke = '#fff', // node stroke color
  nodeStrokeWidth = 1.5, // node stroke width, in pixels
  nodeStrokeOpacity = 1, // node stroke opacity
  nodeRadius = 5, // node radius, in pixels
  nodeStrength,
  linkSource = ({ source }) => source, // given d in links, returns a node identifier string
  linkTarget = ({ target }) => target, // given d in links, returns a node identifier string
  linkStroke = '#999', // link stroke color
  linkStrokeOpacity = 0.6, // link stroke opacity
  linkStrokeWidth = 1.5, // given d in links, returns a stroke width in pixels
  linkStrokeLinecap = 'round', // link stroke linecap
  linkStrength,
  colors = d3.schemeTableau10, // an array of color strings, for the node groups
  width = 600, // outer width, in pixels
  height = 600, // outer height, in pixels
  invalidation, // when this promise resolves, stop the simulation
}) {
  nodes = data.nodes;
  links = data.links;

  if (nodes.length === 0 || links.length === 0) return <div>Please specify links and nodes</div>;
  
  const ref = useRef();
  const [graph, setGraph] = useState(null);
  
  // re-create animation every time nodes change
  useEffect(() => {
    const N = d3.map(nodes, nodeId).map(intern);
    const LS = d3.map(links, linkSource).map(intern);
    const LT = d3.map(links, linkTarget).map(intern);
    if (nodeTitle === undefined) nodeTitle = (_, i) => N[i];
    const T = nodeTitle == null ? null : d3.map(nodes, nodeTitle);
    const G = nodeGroup == null ? null : d3.map(nodes, nodeGroup).map(intern);
    const W = typeof linkStrokeWidth !== 'function' ? null : d3.map(links, linkStrokeWidth);
    const L = typeof linkStroke !== 'function' ? null : d3.map(links, linkStroke);

    // Replace the input nodes and links with mutable objects for the simulation.
    nodes = d3.map(nodes, (_, i) => ({ id: N[i] }));
    links = d3.map(links, (_, i) => ({ source: LS[i], target: LT[i] }));

    // Compute default domains.
    if (G && nodeGroups === undefined) nodeGroups = d3.sort(G);

    // Construct the scales.
    const color = nodeGroup == null ? null : d3.scaleOrdinal(nodeGroups, colors);

    // Construct the forces.
    const forceNode = d3.forceManyBody();
    const forceLink = d3.forceLink(links).id(({ index: i }) => N[i]);
    if (nodeStrength !== undefined) forceNode.strength(nodeStrength);
    if (linkStrength !== undefined) forceLink.strength(linkStrength);

    const simulation = d3
      .forceSimulation(nodes)
      .force('link', forceLink)
      .force('charge', forceNode)
      .force('x', d3.forceX())
      .force('y', d3.forceY())
      .on('tick', ticked);

    width = ref.current.offsetWidth;

    const svg = d3
      .create('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [-width / 2, -height / 2, width, height])
      .attr('style', 'max-width: 100%; height: 100%; height: intrinsic;');

    const g = svg.append('g');

    const link = g
      .append('g')
      .attr('stroke', typeof linkStroke !== 'function' ? linkStroke : null)
      .attr('stroke-opacity', linkStrokeOpacity)
      .attr('stroke-width', typeof linkStrokeWidth !== 'function' ? linkStrokeWidth : null)
      .attr('stroke-linecap', linkStrokeLinecap)
      .selectAll('line')
      .data(links)
      .join('line');

    const node = g
      .append('g')
      .attr('fill', nodeFill)
      .attr('stroke', nodeStroke)
      .attr('stroke-opacity', nodeStrokeOpacity)
      .attr('stroke-width', nodeStrokeWidth)
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', nodeRadius)
      .call(drag(simulation));

    if (W) link.attr('stroke-width', ({ index: i }) => W[i]);
    if (L) link.attr('stroke', ({ index: i }) => L[i]);
    if (G) node.attr('fill', ({ index: i }) => color(G[i]));
    if (T) node.append('title').text(({ index: i }) => T[i]);
    if (invalidation != null) invalidation.then(() => simulation.stop());

    function intern(value) {
      return value !== null && typeof value === 'object' ? value.valueOf() : value;
    }

    function ticked() {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);

      node.attr('cx', (d) => d.x).attr('cy', (d) => d.y);
    }

    function drag(simulation) {
      function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }

      function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }

      return d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended);
    }
    // slow down with a small alpha
    // simulation.alpha(0.1).restart();

    // // update state on every frame
    // simulation.on('tick', () => {
    //   setAnimatedNodes([...simulation.nodes()]);
    //   setAnimatedLinks([...simulation.force('link').links()]);

    //   // setOutput(svg.node());)
    // });

    let transform;

    const zoom = d3.zoom().on('zoom', (e) => {
      g.attr('transform', (transform = e.transform));
      // g.style('stroke-width', 3 / Math.sqrt(transform.k));
      // node.attr('r', 3 / Math.sqrt(transform.k));
    });

    svg.call(zoom).call(zoom.transform, d3.zoomIdentity);
    // .on('pointermove', (event) => {
    //   const p = transform.invert(d3.pointer(event));
    //   const i = delaunay.find(...p);
    //   points.classed('highlighted', (_, j) => i === j);
    //   d3.select(points.nodes()[i]).raise();
    // });

    Object.assign(svg.node(), { scales: { color } });
    setGraph(svg.node());
    // ref.current.append(graph);

    // stop simulation on unmount
    return () => simulation.stop();
  }, [nodes, links, ref.current]);

  if (graph) {
    ref.current.replaceChildren(graph);
  }

  return <div style={{height: "100%"}} ref={ref}></div>;
}
