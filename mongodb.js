const MongoDb = require('mongodb')

const MongoClient = MongoDb.MongoClient
const ObjectID = MongoDb.ObjectID

const connectionUrl = "mongodb://127.0.0.1:27017";
const dbname = "task-manager"
const id = new ObjectID()
console.log(id.getTimestamp())

MongoClient.connect(connectionUrl, { useNewUrlParser : true,useUnifiedTopology: true }, (error,client) => {
    if(error){
        return console.log("error!")
    }

    const task = client.db(dbname)

    // task.collection("users").insertOne({
    //     _id : id,
    //     name : "Ahm",
    //     age : 16
    // }, (error,result) => {
    //     if(error){
    //         return console.log("error!")
    //     }

    //     console.log(result.ops)
    // })

    // task.collection("users").insertMany([
    //     {
    //         name : "Jen",
    //         age : 13
    //     },
    //     { name: "Far" , age: 45}
    // ],(error,result) => {
    //     if(error){
    //         return console.log("error!")
    //     }

    //     console.log(result.ops)
    // })

    // task.collection("tasks").insertMany([
    //     { description: "1.task" , completed: true},
    //     { description: "2.task" , completed: false},
    //     { description: "3.task" , completed: true},
    // ],(error,result) => {
    //     if (error) {
    //         return console.log("error!")
    //     }

    //     console.log(result.ops)
    // })

    // task.collection("users").findOne({_id : new ObjectID("609791b9d1e9b43b04ef527e")}, (error,result) => {
    //     if(error) {
    //         return console.log("error!")
    //     }

    //     console.log(result)
    // })

    // task.collection("users").find({age : 12}).toArray((error,result) => {
    //     if(error) { return console.log("error!")}

    //     console.log(result)
    // })

    // task.collection("users").find({age : 12}).count((error,result) => {
    //     if(error) { return console.log("error!")}

    //     console.log(result)
    // })

    // task.collection("tasks").findOne({_id : new ObjectID("60978d985975503898517556")},(error,result) => {
    //     if(error) { return console.log("error!")}

    //     console.log(result)
    // })

    // task.collection("tasks").find({completed : false}).toArray((error,result)=>{
    //     if(error) { return console.log("error!")}

    //     console.log(result)
    // })


    // const result = task.collection("users").updateOne({ _id : new ObjectID("6097899f7a035907f00ac560")},{ 
    //         // $set: {
    //         // name : "Mike",
    //         // }
    //         $inc : {
    //             age : 10
    //         }
    // },)

    // result.then((result) => {
    //     console.log(result)
    // }).catch((error) => {
    //     console.log(error)
    // })

    // task.collection("tasks").updateMany({completed : false},{
    //     $set : {
    //         completed : true,
    //     }
    // }).then((result) => {
    //     console.log(result)
    // }).catch((error) => {
    //     console.log(error)
    // })

    task.collection("users").deleteMany({
        age : 45,
    }).then((result) => {
        console.log(result)
    }).catch((error) => {
        console.log(error) 
    })

})