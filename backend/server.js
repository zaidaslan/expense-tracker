
const express=require("express");
const cors=require("cors");
require("dotenv").config();
const {Pool}=require("pg");
const app=express();
app.use(cors());
app.use(express.json());

const pool=new Pool({
    host:process.env.DB_HOST,
    port:process.env.DB_PORT,
    database:process.env.DB_NAME,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD
});

app.get("/api/expenses",async (req,res)=> {
try {
    const result=await pool.query(`SELECT id,title,amount::float AS amount,category,date::text AS date 
        FROM expenses
         ORDER BY id`);
    
    res.json(result.rows);
}catch(error){
    console.error(error.message);
    res.status(500).json({
        message:"Database error"
    });
}
        
    });
    app.get("/api/expenses/:id",async (req,res)=> {
     const id=Number(req.params.id);
     if(!Number.isInteger(id)||id<=0){
        return res.status(404).json ({
            message:"Expense not found"
        });
     }


    try {
    const result=await pool.query(`SELECT id,title,amount::float AS amount,category,date::text AS date 
        FROM expenses WHERE id=$1`,[id]);
        if(result.rows.length===0){
            return res.status(404).json ({
                message:"Expense not found"
            });
        }
        res.json(result.rows[0]);
} catch(error){
    console.error(error.message);
    res.status(500).json({
        message:"Database error"
    });
}


    });

app.post("/api/expenses", async (req,res)=>{

const {title,amount,category,date}=req.body;
if(!title ||!amount || !category ||!date){
    return res.status(400).json({
        message:"All fields are required"
    });
}
if(typeof title !=="string"||title.trim()===""){
    return res.status(400).json({
        message:"Title must not empty"
    });
}

if(typeof amount !=="number"|| amount <=0) {
    return res.status(400).json ({
        message:"Amount must be a number greater than 0"
    });
}

const allowedCategories=[
    "Food","Transport","Bills","Entertainment","Other"
];

if(!allowedCategories.includes(category)){
    return res.status(400).json({
        message:"Invalid category"
    });
}

try {
    const result=await pool.query(`INSERT INTO expenses (title,amount,category,date)
        VALUES ($1,$2,$3,$4) RETURNING id,title,amount::float AS amount,category,date::text AS date`,[title.trim(),amount,category,date]);
        res.status(201).json(result.rows[0]);
}catch(error) {
    console.error(error.message);
    res.status(500).json({
        message:"Database error"
    });
}



});

app.put("/api/expenses/:id",async (req,res)=>{
const id=Number(req.params.id);
if(!Number.isInteger(id)||id<=0) {
    return res.status(404).json({
        message:"Expense not found"
    });
}
const {title,amount,category,date}=req.body;
if(!title||!amount|| !category|| !date){
    return res.status(400).json({
        message:"All fields are required"
    });
}

if(typeof title !=="string"||title.trim()===""){
    return res.status(400).json({
        message:"Title must not be empty"
    });
}

if(typeof amount !=="number" ||amount <=0){
    return res.status(400).json({
        message:"Amount must be a number greater than 0"
    });
}
const allowedCategories =["Food","Transport","Bills","Entertainment","Other"];
if(!allowedCategories.includes(category)){
    return res.status(400).json({
        message:"Invalid category"
    });
}

try {
    const result=await pool.query(
        `UPDATE expenses SET title=$1,amount=$2,category=$3,date=$4 
        WHERE id=$5 RETURNING id,title,amount::float AS amount,category,date::text AS date`,
        [title.trim(),amount,category,date,id]
    );


    if (result.rows.length===0){
        return res.status(404).json({
            message:"Expense not found"
        });
    }

    res.json(result.rows[0]);
} catch (error) {
    console.error(error.message);
    res.status(500).json ({
        message:"Database error"
    });
}

});

app.delete("/api/expenses/:id",async (req,res)=> {
    const id=Number(req.params.id);
    if(!Number.isInteger(id)||id<=0) {
        return res.status(404).json ({
            message:"Expense not found"
        });
    }

    try {
        const result=await pool.query (
            `DELETE FROM expenses WHERE id=$1
            RETURNING id,title,amount::float AS amount,category,date::text AS date`,[id]
        );
    if(result.rows.length==0){
        return res.status(404).json ({
            message:"Expense not found"
        });
    }
    res.json({
        message:"Expense deleted",
        expense:result.rows[0]
    });

    }catch (error) {
        console.error(error.message);
        res.status(500).json({
            message:"Database error"
        });
    }
});

app.listen(3000,()=> {
    console.log("Server running on http://localhost:3000")
});




