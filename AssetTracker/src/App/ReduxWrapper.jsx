import React from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor } from "../store";
import { store } from "../store";

const ReduxWrapper = ({ children }) => {
  return (
    <PersistGate persistor={persistor} loading={null}>
      <Provider store={store}>{children}</Provider>
    </PersistGate>
  );
};

export default ReduxWrapper;
