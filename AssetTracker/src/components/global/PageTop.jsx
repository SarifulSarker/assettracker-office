import { ActionIcon, Flex, Title } from "@mantine/core";
import { IconArrowBigLeft } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import COLORS from "../../constants/Colors";
import { hexToRgba } from "../../utils/utils";

const PageTop = ({
  PAGE_TITLE,
  navigateFunc,
  backBtn = false,
  underline = false,
  whiteSpace = "nowrap",
}) => {
  const navigate = useNavigate();
  return (
    <div>
      <Flex justify="start" align="center" gap="md">
        {backBtn && (
          <ActionIcon
            // ml="md"
            size="lg"
            color={hexToRgba(COLORS.secondary)}
            onClick={() => {
              navigateFunc ? navigateFunc() : navigate(-1);
            }}
          >
            <IconArrowBigLeft stroke={1.5} />
          </ActionIcon>
        )}
        <Title
          order={2}
          size="h2"
          ml={!backBtn ? "md" : underline}
          tt="capitalize"
          style={{
            borderBottom: underline
              ? "1px solid var(--mantine-color-gray-3)"
              : "none",
            whiteSpace,
          }}
        >
          {PAGE_TITLE}
        </Title>
      </Flex>
    </div>
  );
};

export default PageTop;
