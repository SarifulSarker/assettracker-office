// utils/return.js
function SuccessResponse(responseCode, message = "Success", data = null) {
  return {
    responseCode,
    success: true,
    message,
    data,
  };
}

function ErrorResponse(responseCode, message = "Error", data = null) {
  return {
    responseCode,
    success: false,
    message,
    data,
  };
}

export { SuccessResponse, ErrorResponse };
