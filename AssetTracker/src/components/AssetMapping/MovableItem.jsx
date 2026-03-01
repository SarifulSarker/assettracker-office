import { Card, Text, Badge, Group, Flex, Checkbox, Stack } from "@mantine/core";

const AssetCard = ({
  id,
  name,
  category,
  subCategory,
  productId,
  status,
  selected,
  onCheck,
  isReadOnly,
}) => {
  return (
    <Card
      shadow="sm"
      padding="lg"
      withBorder
      style={{
        backgroundColor: selected
          ? "#d0ebff"
          : isReadOnly
            ? "#f8f9fa"
            : "#ffffff",
        transition: "0.2s",
      }}
    >
      <Stack gap="xs">
        <Flex justify="space-between" align="flex-start">
          <Group gap="sm" align="flex-start">
            {!isReadOnly && (
              <Checkbox checked={selected} onChange={() => onCheck?.(id)} />
            )}

            <div>
              {/* Asset Name */}
              <Text fw={600} size="sm">
                {name}
              </Text>

              {/* Product ID */}
              <Badge  color="blue" variant="outline">
                Product ID: {productId}
              </Badge>

              {/* Badges */}
              <Group gap={6} mt={6}>
                {category && (
                  <Badge size="xs" variant="light">
                    {category}
                  </Badge>
                )}
                {subCategory && (
                  <Badge size="xs" variant="outline">
                    {subCategory}
                  </Badge>
                )}

                {/* Status Badge */}
                <Badge
                  size="xs"
                  color={status === "IN_STOCK" ? "green" : "red"}
                >
                  {status}
                </Badge>
              </Group>
            </div>
          </Group>
        </Flex>
      </Stack>
    </Card>
  );
};

export default AssetCard;
