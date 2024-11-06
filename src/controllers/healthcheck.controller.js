import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthcheck = asyncHandler(async (req, res) => {
  try {
    //TODO: build a healthcheck response that simply returns the OK status as json with a message

    const serviceIsHealthy = true; 
    if (!serviceIsHealthy) {
      console.log("ERROR:: XXXXXXXXXXXXXXXXXXX");
    return  res
        .status(503)
        .json( new ApiResponse( 503, { status: "Service Unavailable" }, "Service health check failed" ) );
    }
   return res
      .status(200)
      .json( new ApiResponse(200, { status: "OK" }, "Service is running smoothly") )
  } 
  catch (error) {
    throw new ApiError(500, error.message || "Internal Server Error");
  }
});

export { healthcheck };
