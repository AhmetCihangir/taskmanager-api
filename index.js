const express = require('express');
require('./mongoose')
const User = require('./user')
const Task = require('./task');
const jwt = require("jsonwebtoken")
const multer = require("multer")
const sharp = require("sharp")




const auth = async (req, res, next) => {

    try{
        const token = req.header("Authorization").replace("Bearer","")
        const decoded = jwt.verify(token,process.env.JWT_SECRET)

        const user = await User.findOne({_id:decoded._id})

        if(!user) {
            throw new Error()
        }

        req.token = token
        req.user = user
        next()

    }catch(err){
        res.status(404).send(err)
    }

}

const app = express();

const port = process.env.PORT

const upload = multer({
    // dest: "images",
    limits : {
        fileSize : 1000000
    },
    fileFilter(req,file,cb){

        // if(!file.originalname.endsWith(".pdf")){
        //     return cb(new Error("File must be a PDF file"))
        // }
        // if(!file.originalname.match(/\.(doc|docx)$/)){
        //     return cb(new Error("File must be a Word file"))
        // }
        if(!file.originalname.match(/\.(jpg|jpge|png)$/)){
            return cb(new Error("File must be a Image file"))
        }

        // cb(new Error("File must be an excel file"))
        cb(undefined,true)
        // cb(undefined,false)
    }
})


// app.post('/upload', upload.single("upload"), (req, res) => {
//     res.send()
// })

// app.use(function(req, res, next){
//     res.status(503).send("xxx")
// })

// const route = new express.Router();
// route.get("/test", (req, res) => {
//     res.send("This is from my other router!")
// })
// app.use(route)

app.use(express.json());

app.post("/users", async (req,res)=>{

    const user = new User(req.body)



    try{

        await user.save()

        const token = await user.generateAuthToken()
        res.send({user,token})    
    }catch(e){
        res.status(404).send(e)
    }

 
    // user.save().then(()=>{
    //     res.send(user)
    // }).catch((err)=>{
    //     res.status(400).send(err)
    // });
    
    
})

app.get("/users/me",auth,async (req, res) => {

    res.send(req.user)

    // try{
    //     const users = await User.find({})
    //     res.send(users)
    // }catch(err){
    //     res.status(400).send(err)
    // }

    // User.find({}).then((users) => {
    //     res.send(users)
    // }).catch((err)=>{
    //     res.status(400).send(err)
    // })
})

app.get('/users/:id', async (req,res)=>{

    try{
        const user = await User.findById(req.params.id);
        if(!user){
            return res.status(404).send()
        }

        res.send(user)
    }catch(err){
        res.status(500).send(err)
    }

    // User.findById(req.params.id).then((user) => {
    //     if(!user) {
    //         res.status(404).send()
    //     }else{
    //         res.send(user)

    //     }
    //     // res.send(user)

    // }).catch((err)=>{
    //     res.send(err)
    // })

})

app.patch("/users/me", auth ,async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ["name","email","password","age"]

    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation){
        return res.status(400).send({ error: "Invalid updates!"})
    }

    try {
        //const user = await User.findByIdAndUpdate(req.params.id, req.body,{ new : true, runValidators : true })

        // const user = await User.findById(req.user._id)

        updates.forEach(update=>{
            req.user[update] = req.body[update]
        })

        await req.user.save()

        res.send(req.user)

    }catch (err) {
        res.status(500).send()
    }
})


app.delete("/users/me",auth ,async(req, res) => {
    try {
        // const user = await User.findByIdAndDelete(req.user._id)

        // if(!user) {
        //     return res.status(404).send()
        // }

        await req.user.remove()

        res.send(req.user)

    }catch(err){
        res.status(500).send(err)
    }
})

app.post("/users/login" , async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email,req.body.password)
        const token = await user.generateAuthToken()

        res.send({user,token})

    }catch(err){    
        res.status(500).send(err)
    }
})

app.post("/users/logout",auth,async (req, res)=>{
    try{
        req.user.tokens = req.user.tokens.filter(token => {
            return token.token !== req.token
        })

        await req.user.save()

        res.send()
    }catch(err){
        res.status(500).send(err)

    }
})

app.post("/users/logoutAll",auth, async (req, res) => {
    try{
        req.user.tokens = []
        await req.user.save()
        res.send()
    }catch(err){
        res.status(500).send(err)
    }
})

app.post("/users/me/avatar",auth,upload.single("avatar"),async (req, res)=>{
    // const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
    const buffer = await sharp(req.file.buffer).resize(250,250).png().toBuffer();
    
    req.user.avatar = buffer
    
    await req.user.save()
    
    res.send(req.user)
},(error,req,res,next)=>{
    res.status(400).send({error: error.message})
})

app.delete("/users/me/avatar",auth ,async (req, res)=>{
    req.user.avatar = undefined

    await req.user.save()

    res.send(req.user)
},(error,req,res,next)=>{
    res.status(400).send({error: error.message})
})

app.get("/users/:id/avatar", async (req, res)=>{
    try{
        const user = await User.findById(req.params.id)

        if(!user || !user.avatar){
            throw new Error("")
        }

        res.set("Content-Type","image/jpg")
        res.send(user.avatar)

    }catch(e){
        res.status(404).send(e)
    }
})


app.post("/tasks",auth, async (req,res)=>{
    // const task = new Task(req.body)

    const task = new Task({
        ...req.body,
        owner : req.user._id
    })

    try {
        await task.save()
        res.send(task)
    } catch (err) {
        res.status(500).send(err)
    }

    // task.save().then(()=>{
    //     res.send(task)
    // }).catch((err)=>{
    //     res.status(400).send(err)
    // })
})

// tasks?sortBy=createdAt:desc


app.get("/tasks",auth, async (req,res) => {
    const match = {}
    const sort = {}


    if(req.query.completed){
        match.completed = req.query.completed === "true"
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(":")
        sort.parts[0] = parts[1] === "desc" ? -1 : 1
    }
    
    try{
        // const tasks = await Task.find({owner : req.user._id})

        // res.send(task)
        await req.user.populate({
            path:"tasks",
            match,
            options: {
                limit : parseInt(req.query.limit),
                skip : parseInt(req.query.skip),
                sort
                // {
                //     createdAt : -1,
                //     // completed : -1/1

                // }

            }
        }).execPopulate()

        res.send(req.user.tasks)
    }catch(err){
        res.status(400).send(err)
    }

    // Task.find({}).then((tasks) => {
    //     res.send(tasks)
    // }).catch((err)=>{
    //     res.status(400).send(err)
    // })
})

app.patch("/tasks/:id",auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ["description","completed"]

    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation){
        return res.status(400).send({ error: "Invalid updates!"})
    }

    try {
        //const task = await Task.findByIdAndUpdate(req.params.id, req.body,{ new : true, runValidators : true })

        //const task = await Task.findById(req.params.id)
        const task = await findOne({_id : req.params.id, owner : req.user._id})
        if(!task) {
            return res.status(404).send()
        }

        updates.forEach(update => {
            task[update] = req.body[update]
        })

        await task.save()

        res.send(user)

    }catch (err) {
        res.status(500).send()
    }
})

app.get('/tasks/:id',auth, async (req,res)=>{

    //609a203dc2b77730c9630f9f

    try{
        //const task = await Task.findById(req.params.id);
        const task = await Task.findOne({_id: req.params.id,owner: req.user._id})
        
        
        if(!task){
            return res.status(404).send()
        }

        res.send(task)
    }catch(err){
        res.status(500).send(err)
    }

    // Task.findById(req.params.id).then((task) => {
    //     if(!task) {
    //         res.status(404).send()
    //     }else{
    //         res.send(user)

    //     }
    //     // res.send(user)

    // }).catch((err)=>{
    //     res.send(err)
    // })



})

app.delete("/tasks/:id", async(req, res) => {
    try {
        const tasks = await Task.findOneAndDelete({_id: req.params.id,owner: req.user._id})
        // const task = await Task.findByIdAndDelete(req.params.id)

        if(!task) {
            return res.status(404).send()
        }

        res.send(user)

    }catch(err){
        res.status(500).send(err)
    }
})



 

app.listen(port ,()=>{
    console.log("Listening on port!")
} );





// const bcrypt = require('bcryptjs')

// const myFunction = async ()=>{
//     const token = jwt.sign({ _id : "123" },"thisispassword",{expiresIn : "0 seconds"})
//     console.log(token)

//     const data = jwt.verify(token,"thisispassword")
//     console.log(data)
// }

// // const password = "Red12345!"

// // const hashedPassword = await bcrypt.hash(password, 8)

// // console.log(password)

// // console.log(hashedPassword)

// // const isMatch = await bcrypt.compare(password, hashedPassword)
// // console.log(isMatch)


// myFunction()


// const main = async () => {
//     // const task = await Task.findById("sdksakdmlsmdlaksmdas")
    
//     // await task.populate("owner").execPopulate()
    
//     // console.log(task.owner)


//     const user = await User.findById("dkfaslkmdlksdmslkd")

//     await user.populate("tasks").execPopulate()

//     console.log(user.tasks)

// }

// main()