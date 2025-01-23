





function Check_if_have_the_correct_data(req,res,next){  
 
const  module_id = req.query?.module_id
 const  nuclei_targets =  req.query.nuclei_targets 

if(module_id === undefined ||module_id === '' || module_id === null){ res.status(400).send("no module_id"); return}

switch(module_id) {

case "2001005":   
if(nuclei_targets === '' || nuclei_targets === null || nuclei_targets === undefined){
    res.status(400).send("Empty target");return 
}
if(nuclei_targets.length  < 3){
    res.status(400).send("Too short");return 
}



// http

next();  break;


  }


 

 
 
 }


 module.exports = {

    Check_if_have_the_correct_data,

}


    // default:  console.log("Module ID does not match specific cases");

//     const {id} = req.params 
//      const siteId= does_Website_Id_Exist_Model(id)
//     console.log("the anwser from model " , siteId);
 
//  if(!siteId){
//  console.log("siteId  not exists");
//  res.status(400).send("siteId not exists") 
//     return
//  }