import React, { useEffect, useRef, useState } from 'react';
import Papa from 'papaparse';
import { Button } from '@mui/material';

let graphData = {
  nodes: [], // needs id
  links: [], // needs source and target
};

export default function Test({ setData, setUser }) {
  const [file, setFile] = useState();
  const fileReader = new FileReader();
  const ref = useRef(null);

  const handleOnChange = (e) => {
    setFile(e.target.files[0]);
    handleOnSubmit(e.target.files[0]);
  };

  // useEffect(() => {
  //   if(file) {
  //     handleOnSubmit();
  //   }
  // }, [file])

  const handleOnSubmit = (f) => {
    // e.preventDefault();
    // setFile(e.target.files[0]);

    console.log(f)

    if (f) {
      fileReader.onload = function (event) {
        const csvOutput = event.target.result;
        const output = Papa.parse(csvOutput);

        console.log(output);

        let temp_customer = '';
        let temp_product = '';
        temp_customer = output.data[1][0];
        let user = [];
        graphData.nodes.push({ id: output.data[1][0] });
        for (let i = 0; i < output.data.length; i++) {
          if (temp_customer === output.data[i][0] && output.data[i][0] !== 'customer_id') {
            graphData.nodes.push({ id: output.data[i][1] });
          } else if (
            output.data[i][0] !== 'customer_id' &&
            output.data[i][0] !== '' &&
            output.data[i][0]
          ) {
            graphData.nodes.push({ id: output.data[i][0] });
            graphData.nodes.push({ id: output.data[i][1] });
            user.push(output.data[i][0]);
            temp_customer = output.data[i][0];
          }

          // if (temp_product === output.data[i][1] && output.data[i][1] !== "product_id") {
          //   graphData.nodes.push({ id: output.data[i][1] });
          // }
          // temp_product = output.data[i][1];
        }

        output.data.reduce((accumulator, currentValue, index, array) => {
          if (currentValue[1] !== 'product_id' && currentValue[1]) {
            graphData.links.push({ source: currentValue[0], target: currentValue[1] });
          }
        }, []);

        setUser(user);
        setData(graphData);
        console.log(graphData);
      };

      fileReader.readAsText(f);
    }
  };

  return (
    <>
      <Button variant='outlined' sx={{width: "150px", alignSelf: "center"}} onClick={() => ref.current.click()}>Import File</Button>
      <input
        ref={ref}
        type={'file'}
        id={'csvFileInput'}
        accept={'.csv'}
        onChange={handleOnChange}
        style={{ display: 'none' }}
      />
    </>
  );
}
