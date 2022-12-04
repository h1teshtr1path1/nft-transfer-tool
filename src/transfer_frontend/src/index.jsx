import * as React from "react";
import { render } from "react-dom";
import PlugConnect from '@psychedelic/plug-connect';

const MyHello = () => {
  return (
    <div>
      hitesh
      <PlugConnect
        whitelist={[]}
        onConnectCallback={() => console.log("Some callback")}
      />
    </div>
  );
};

render(<MyHello />, document.getElementById("app"));