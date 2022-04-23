import React, { useMemo, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { link } from 'd3';

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
        <circle
          cx={node.x}
          cy={node.y}
          r={node.r}
          key={node.id}
          stroke="black"
          fill="black"
        />
      ))}
      {animatedLinks.map((link) => (
        <line
          x1={link.source.x}
          y1={link.source.y}
          x2={link.target.x}
          y2={link.target.y}
          key={link.source.id}
          stroke="black"
          fill="transparent"
        />
      ))}
    </g>
  );
}

export default function ForceGraph() {
  const [charge, setCharge] = useState(-3);

  // create nodes with unique ids
  // radius: 5px
  const nodes = useMemo(
    () =>
      d3.range(5).map((n) => {
        return { id: n, r: 5 };
      }),
    [],
  );

  const links = [
    {
      source: 1,
      target: 2,
    },
    {
      source: 2,
      target: 3,
    },
  ];

  return (
    <div className="App">
      <h1>React & D3 force graph</h1>
      <p>Current charge: {charge}</p>
      <input
        type="range"
        min="-30"
        max="30"
        step="1"
        value={charge}
        onChange={(e) => setCharge(e.target.value)}
      />
      <svg width="800" height="600">
        <Graph nodes={nodes} links={links} charge={charge} />
      </svg>
    </div>
  );
}
