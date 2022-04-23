import React, { useEffect, useRef } from 'react';

export default function Test() {
	const ref = useRef();

  // re-create animation every time nodes change
  useEffect(() => {
	console.log(ref)
  }, []);

  return (
    <div ref={ref}></div>
  );
}
