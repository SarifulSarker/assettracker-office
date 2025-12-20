export const isArrayAndHasContent = (arr) => {
  return Array.isArray(arr) && arr.length > 0;
};

export const isObjectAndHasProperties = (obj) => {
  return obj !== null && typeof obj === "object" && Object.keys(obj).length > 0;
};

export const hexToRgba = (hex, alpha) => {
  // Remove the # if it's there
  hex = hex.replace("#", "");

  // Parse the hex values for red, green, and blue
  var r = parseInt(hex.substring(0, 2), 16);
  var g = parseInt(hex.substring(2, 4), 16);
  var b = parseInt(hex.substring(4, 6), 16);

  // If alpha is not provided, set it to 1
  if (alpha === undefined) {
    alpha = 1;
  }

  // Convert the values to the RGBA string format
  var rgba = "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";

  return rgba;
};
