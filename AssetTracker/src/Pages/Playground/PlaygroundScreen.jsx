import { Accordion } from "@mantine/core";
import React, { useState } from "react";

const PlaygroundScreen = () => {
  const [data, setData] = useState({
    User: {
      "Create User": true,
      "Update User": false,
    },
    Asset: {
      "Create Asset": true,
      "Update Asset": false,
    },
  });

  console.log(Object.entries(data));
  const moduleList = Object.keys(data);
  return (
    <div>
      <Accordion defaultValue="Apples">
        {moduleList.map((moduleName) => {
          const permissionObj = data[moduleName];
          console.log(permissionObj);
          return (
            <Accordion.Item value={moduleName}>
              <Accordion.Control value={"Hello"}>
                {moduleName}
              </Accordion.Control>
              <Accordion.Panel>Hello</Accordion.Panel>
            </Accordion.Item>
          );
        })}
      </Accordion>
    </div>
  );
};

export default PlaygroundScreen;
