import React, { useEffect, useState } from 'react';
import './App.css';
import { Container } from '@mui/material';
import Graph from './components/ForceGraph';
import { CssBaseline } from '@mui/material';
// import data from './utils/graph2.json';
import Test from './components/Test';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';

const config = {};

function App() {
  const [data, setData] = useState(null);
  const [selected, setSelected] = React.useState('');
  const [temp, setTemp] = useState(null);
  const [user, setUser] = useState(null);

  const handleChange = (event) => {
    setSelected(event.target.value);
  };

  useEffect(() => {
    if (!temp) {
      setTemp(data);
    }
  }, [data, user]);

  return (
    <React.Fragment>
      <CssBaseline />
      <Container style={{ width: '100vw', height: '100vh' }}>
        <Stack
          spacing={2}
          direction="row"
          alignItems="center"
          justifyContent={'center'}
          sx={{ margin: '20px auto 10px auto' }}
        >
          <Test setData={setData} setUser={setUser} />
          <Box sx={{ minWidth: 120, marginTop: '20px' }}>
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">Element</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={selected}
                label="Element"
                onChange={handleChange}
                style={{ width: '500px' }}
              >
                {user &&
                  user.map((item, i) => {
                    if (i < 10) {
                      return (
                        <MenuItem key={i} value={item}>
                          {item}
                        </MenuItem>
                      );
                    }
                  })}
              </Select>
            </FormControl>
          </Box>
        </Stack>

        {selected && <Graph user={selected} links={data.links} nodes={data.nodes} {...config} />}
      </Container>
    </React.Fragment>
  );
}

export default App;
