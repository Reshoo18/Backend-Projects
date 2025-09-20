//const asyncHandler=()=>{}

export {asyncHandler}

const asyncHandler=(requestHandler)=>{
    (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).catch((err)=>next(err))
    }
}
// const asyncHandler=(func)=>()=>{}
// const asyncHandler=(fn)=>async()=>{
//  const asyncHandler=(fn)=>async(req,res,next)=>{
//     try{

//     }catch(error){
//       res.status(error.code || 500).json({
//         success: false,
//         message:err.message
//       })
//     }
//  }