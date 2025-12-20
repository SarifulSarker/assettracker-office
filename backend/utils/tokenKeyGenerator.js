// utils/tokenKeyGenerator.js

// Generate Redis Token Key
// export function generateTokenKey(userId, type = "auth") {
//   const random = Math.random().toString(36).substring(2, 10); // random 8 chars
//   const timestamp = Date.now(); // prevents collision

//   return `${type}-token-${userId}-${timestamp}-${random}`;
// }
export function generateTokenKey(userId, type = "auth") {
  return `${type}-token-${userId}`;
}
