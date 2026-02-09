import { useSelector } from "react-redux";
// import { hasPermission as checkPermission } from "../helpers/permissionSelector.js";

const checkPermission = (permissions, module, action, role) => {
  if (role === "SUPERADMIN") return true;
  if (!permissions || !permissions[module]) return false;

  return !!permissions[module][action]; // true/false
};

export const usePermissions = () => {
  const permissions = useSelector(
    (state) => state.auth.user?.permissions || {},
  );

  const role = useSelector((state) => state.auth.user?.role);

  const hasPermission = (module, action) =>checkPermission(permissions, module, action, role);

  return { permissions, role, hasPermission };
};
