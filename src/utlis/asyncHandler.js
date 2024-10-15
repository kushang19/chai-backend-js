// Promise method

const asyncHandler = (requestHandler) => {
   return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
        .catch(err => next(err))
    }
}

export {asyncHandler}



// try catch method

// const asyncHandler = (fnc) => async(error, req, res, next) => {
//     try {
//         await fnc(req, res, next)
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }