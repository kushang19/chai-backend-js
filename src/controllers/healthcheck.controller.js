import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthcheck = asyncHandler(async (req, res) => {
  try {
    //TODO: build a healthcheck response that simply returns the OK status as json with a message

    // Simulate a health check failure or condition that causes an error

    const serviceIsHealthy = false; // This is a placeholder; replace with real checks if needed.
    if (!serviceIsHealthy) {
      console.log("ERROR:: XXXXXXXXXXXXXXXXXXX");
      throw new ApiError(503, "Service Unavailable", [], "Service health check failed");
      
    }
    res
      .status(200)
      .json(
        new ApiResponse(200, { status: "OK" }, "Service is running smoothly")
      );
  } catch (error) {
    // If there's an error during the health check, return an ApiError
    throw new ApiError(500, error.message || "Internal Server Error");
  }
});

export { healthcheck };
