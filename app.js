const express = require('express');
const {open}=require('sqlite')
const cors=require('cors')
const sqlite3 = require('sqlite3');
const path = require('path');

const dbPath=path.join(__dirname,'taskItems.db')
const app = express();

app.use(express.json());
app.use(cors())
const PORT=process.env.PORT || 3001

let db;
const initializeDBAndServer=async()=>{
    try{
        db=await open({
            filename:dbPath,
            driver:sqlite3.Database
        })
        app.listen(PORT,()=>{
            console.log("server is running on port ",PORT);
        })
    }catch(e){
        console.log(e)
        process.exit(1)
    }
}
initializeDBAndServer();

app.get('/get-tasks',async(req,res)=>{
    const getTasks=`
    select * from taskItems;
    `
    const tasks=await db.all(getTasks)
    res.send(tasks)
})

app.post('/add-task',async(req,res)=>{
    const taskData=req.body
    const insertTaskDB=`
    insert into taskItems 
    (task_name,is_completed)
    values ('${taskData.taskName}',${false})`
    await db.run(insertTaskDB)
    res.send("Task Added Succesfully")
})

app.put('/update-task-status/:taskId',async(req,res)=>{
    const {taskId}=req.params
    console.log(taskId)
    const getTask=`
    select * from taskItems
    where id=${taskId};`
    const taskItem=await db.get(getTask)
    const updateTaskStatus=taskItem.is_completed==='0'?true:false
    const updateTaskDB=`
    update taskItems
    set is_completed=${updateTaskStatus}
    where id=${taskId};`
    await db.run(updateTaskDB)
    res.send("Task Status Updated Succesfully")
})

app.delete('/delete-task/:taskId',async(req,res)=>{
    const {taskId}=req.params
    const deleteTaskDB=`
    delete from taskItems
    where id=${taskId};`
    await db.run(deleteTaskDB)
    res.send("Task Deleted Succesfully")
})