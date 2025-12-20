import { Select } from "@mantine/core";
const EmployeeHeader = ({
  employees,
  selectedEmployeeId,
  setSelectedEmployeeId,
}) => {
  if (!employees || employees.length === 0) return null; // or a loader
 
  return (
    <Select
      data={employees.map((e) => ({
        value: String(e?.id), // string
        label: e?.fullName,
      }))}
      value={selectedEmployeeId ? String(selectedEmployeeId) : null} // string
      onChange={(val) => setSelectedEmployeeId(val)}
      placeholder="Select Employee"
      searchable
      nothingFound="No employees"
    />
  );
};

export default EmployeeHeader;
