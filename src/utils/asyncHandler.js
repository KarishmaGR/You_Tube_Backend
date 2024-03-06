// Handle Async Operation By using Promises
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };

// By Using Async Await

// const asyncHandler = (fn) => async () => {
//   try {
//     await fn(req, res, next);
//   } catch (error) {
//     res.status(error.code || 500).json({
//       message: error.message,
//       success: false,
//     });
//   }
// };
