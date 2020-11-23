const express=require("express");
require("dotenv").config();
const mongoose=require("mongoose");
const cors =require("cors");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const someOtherPlaintextPassword = 'not_bacon';

var uri=process.env.ATLAS_URI;
mongoose.connect(uri,{useNewUrlParser:true , useCreateIndex:true , useUnifiedTopology: true ,useFindAndModify:false });

const app=express();
app.use(cors());
app.use(express.json());
const noteSchema=new mongoose.Schema({
    title:String,
    content:String
});
const userSchema=new mongoose.Schema({
    fullname:String,
    username:{type:String,unique:true},
    password:String,
    notes:[noteSchema]  
}); 
const Note=new mongoose.model("note",noteSchema);
const User=new mongoose.model("user",userSchema);

app.post("/register",function(req,res){
    User.findOne({username:req.body.username},function(err,foundUser)
    {
        if(!foundUser)
        {
            bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
                const newUser =new User({
                    fullname:req.body.fullname,
                    username:req.body.username,
                    password:hash,
                    notes:[]
                });
                newUser.save(function(err){
                    if(err) console.log(err);
                    else
                    {
                        res.json("added");
                    }
                });
            });
        }
        else
        {
            res.json("already exist");
        }    
    });       
});

app.post("/login",function(req,res){
    User.findOne({username:req.body.username},function(err,foundUser){
        if(!err)
        {
            if(foundUser)
            {
                bcrypt.compare(req.body.password,foundUser.password, function(err, result){
                    if(result)
                    {
                        res.json(foundUser);
                    }
                    else
                    {
                        res.json("wrong password");
                    }
                });   
            }
            else
            {
                res.json("not found");
            }
        }
    });
});

app.get("/:id",function(req,res){
    User.findOne({_id:req.params.id},function(err,result){
        if(err) console.log(err);
        else
        {
            res.json(result);
        }
    });
});

app.post("/:id",function(req,res){
    console.log("creating new node");
    const newNote=new Note({
        title:req.body.title,
        content:req.body.content
    });
    console.log("hiiii in backend in note addd");
    User.findOne({_id:req.params.id},function(err,result){
        if(!err)
        {
            if(result)
            {
                const arr=result.notes;
                arr.push(newNote);
                console.log("pushing in array");
                User.findByIdAndUpdate(req.params.id,{notes:arr},function(err){
                    if(err) console.log(err);
                    else
                    {
                        res.json("note added");
                        console.log("note added");
                    }
                });
            }
        }
    });
});

app.delete("/delete/:id/:noteId",function(req,res){
    User.findOneAndUpdate({_id:req.params.id},{$pull:{notes:{_id:req.params.noteId}}},function(err){
        if(err) console.log(err);
        else
        {
            res.json("note deleted");
            console.log("note deleted");
        }
    });
});


app.listen(process.env.PORT || 5000,function(){
    console.log("server is runnig at 5000.. ");
});

// https://radiant-reaches-85700.herokuapp.com/