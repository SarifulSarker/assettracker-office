import { useState } from "react";
import { Collapse, Button, Text } from "@mantine/core";

const SpecsCell = ({ specs }) => {
  const [opened, setOpened] = useState(false);

  if (!specs) return "-";

  return (
    <div>
      <Collapse in={opened}>
        <Text
          style={{
            whiteSpace: "pre-wrap",
            fontFamily: "inherit", // inherit from table
            fontSize: "inherit",
            lineHeight: "1.4",
          }}
        >
          {specs}
        </Text>
      </Collapse>

      {!opened && (
        <Text
          style={{
            whiteSpace: "pre-wrap",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            fontFamily: "inherit",
            fontSize: "inherit",
            lineHeight: "1.4",
          }}
        >
          {specs}
        </Text>
      )}

      <Button
        variant="subtle"
        size="xs"
        mt={4}
        onClick={() => setOpened((o) => !o)}
      >
        {opened ? "Show Less" : "Show More"}
      </Button>
    </div>
  );
};

export default SpecsCell;
