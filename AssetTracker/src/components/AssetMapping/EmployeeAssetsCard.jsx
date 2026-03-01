import React from "react";
import {
  Card,
  Stack,
  Text,
  Badge,
  SimpleGrid,
  Flex,
  Group,
} from "@mantine/core";

const EmployeeAssetsCard = ({ selectedEmployee, employeesAssets }) => {
  if (!selectedEmployee) {
    return <Text color="dimmed">Please select an employee</Text>;
  }

  return (
    <Card withBorder padding="lg" radius="md" mb="lg">
      <Stack spacing="xs">
        <Stack spacing="xs">
          <Text weight={600} size="lg">
            {selectedEmployee.fullName}
          </Text>
          <Text size="sm" color="dimmed">
            <strong>Email:</strong> {selectedEmployee.email || "N/A"}
          </Text>
          <Text size="sm" color="dimmed">
            <strong>Designation:</strong>{" "}
            {selectedEmployee.designation?.name || "N/A"}
          </Text>

          <Text size="sm" color="dimmed">
            <strong>Department:</strong>{" "}
            {selectedEmployee.department?.name || "N/A"}
          </Text>
        </Stack>

        <Text weight={500} size="sm" mt="md">
          Assigned Assets:
        </Text>

        {employeesAssets.length === 0 ? (
          <Text color="dimmed" size="sm">
            No assets assigned
          </Text>
        ) : (
          <SimpleGrid cols={4} spacing="sm" mt="sm">
            {employeesAssets.map((ea) => {
              const assignedUnit = ea.asset.assetUnits.find(
                (unit) => unit.id === ea.assetUnitId,
              );

              return (
                <Card
                  key={ea.id}
                  shadow="xs"
                  padding="sm"
                  radius="md"
                  withBorder
                >
                  <Stack spacing={4}>
                    <Text weight={500} size="sm">
                      {ea.asset.name}
                    </Text>
                    <Badge size="xs" variant="outline">
                      Product ID: {assignedUnit?.productId}
                    </Badge>
                    <Group>
                      <Flex gap={5}>
                        <Badge size="xs" variant="light">
                          {" "}
                          {ea.asset.category?.name}
                        </Badge>
                        <Badge size="xs" variant="light">
                          {" "}
                          {ea.asset.subCategory?.name}
                        </Badge>
                      </Flex>

                      <Flex gap={5}>
                        <Badge
                          size="xs"
                          color={
                            assignedUnit?.status === "IN_USE" ? "green" : "gray"
                          }
                        >
                          {assignedUnit?.status}
                        </Badge>
                      </Flex>
                    </Group>
                  </Stack>
                </Card>
              );
            })}
          </SimpleGrid>
        )}
      </Stack>
    </Card>
  );
};

export default EmployeeAssetsCard;
