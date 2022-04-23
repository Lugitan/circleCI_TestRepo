import React from 'react';
import './App.css';
import { Container } from '@mui/material';
import ForceGraph from "./components/GraphTest"
import { CssBaseline } from '@mui/material';
import data from "./utils/graph.json"

function App() {
  const nodeHoverTooltip = React.useCallback((node) => {
    return `<div>${node.name}</div>`;
  }, []);

  return (
    <React.Fragment>
      <CssBaseline />
      <Container>
        <ForceGraph linksData={data.links} nodesData={data.nodes} nodeHoverTooltip={nodeHoverTooltip} />
      </Container>
    </React.Fragment>
  );
}

export default App;
