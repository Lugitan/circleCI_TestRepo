import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';

function Graph({ nodes, links, charge }) {
  const [animatedNodes, setAnimatedNodes] = useState([]);
  const [animatedLinks, setAnimatedLinks] = useState([]);

  // re-create animation every time nodes change
  useEffect(() => {
    const simulation = d3
      .forceSimulation()
      .force('x', d3.forceX(400))
      .force('y', d3.forceY(300))
      .force('charge', d3.forceManyBody().strength(charge))
      .force('collision', d3.forceCollide(5));

    // update state on every frame
    simulation.on('tick', () => {
      setAnimatedNodes([...simulation.nodes()]);
      setAnimatedLinks([...simulation.force('links').links()]);
    });

    // copy nodes into simulation
    simulation.nodes([...nodes]);
    simulation.force(
      'links',
      d3
        .forceLink()
        .id(function (d) {
          return d.id;
        })
        .links(links),
    );
    // slow down with a small alpha
    simulation.alpha(0.1).restart();

    // stop simulation on unmount
    return () => simulation.stop();
  }, [nodes, links, charge]);

  return (
    <g>
      {animatedNodes.map((node) => (
        <circle cx={node.x} cy={node.y} r={5} key={node.id} stroke="black" fill="black" />
      ))}
      {animatedLinks.map((link, i) => (
        <line
          x1={link.source.x}
          y1={link.source.y}
          x2={link.target.x}
          y2={link.target.y}
          key={i}
          stroke="black"
          fill="transparent"
        />
      ))}
    </g>
  );
}

export default function GraphTest(props) {
  const { width = 600, height = 600, nodes, links, charge = -90 } = props;

  if(!nodes || !links) return <div>Please specify links and nodes</div>

  return (
    <div>
      <svg width={width} height={height}>
        <Graph nodes={nodes} links={links} charge={charge} />
      </svg>
    </div>
  );
}
