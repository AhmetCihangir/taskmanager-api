const mongoose = require('mongoose');


mongoose.connect(process.env.MONGODB_URL,{
    useNewUrlParser : true,
    useCreateIndex : true,
    useUnifiedTopology : true,
    useFindAndModify : false,
})


// const me = new User({
//     name : "Ahf",
//     email : "ahsda@gmail.com     ",
//     password : "   rehdıSsk "
// })


// me.save().then(()=>{
//     console.log(me)
// }).catch((err)=>{
//     console.log(err)
// })