import React from 'react';
import './App.css';
import { Container } from '@mui/material';
import Graph from './components/ForceGraph';
import { CssBaseline } from '@mui/material';
import data from './utils/graph2.json';

const config = {

}

function App() {

  return (
    <React.Fragment>
      <CssBaseline />
      <Container style={{width: "100vw", height: "100vh"}}>
        <Graph links={data.links} nodes={data.nodes} {...config} />
      </Container>
    </React.Fragment>
  );
}

export default App;
