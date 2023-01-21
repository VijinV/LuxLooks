const express = require('express')
const app = express()
const path = require('path')
const hbs = require('express-handlebars')
const mongoose = require('mongoose')

// routes setup
const userRouter = require('./router/userRouter')

// setting up view engine

app.set('views',path.join(__dirname,'views'))
app.set('view engine','hbs')
// setting up user views files
userRouter.set('views',path.join(__dirname,'views/user'))
userRouter.set('view engine','hbs')
userRouter.engine('hbs',hbs.engine({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout',partialsDir:__dirname+'/views/partials'}))

// setting up static files
userRouter.use(express.static(path.join(__dirname,'public/user')));




app.use('/',userRouter)















// database connection

mongoose.set('strictQuery',true)
mongoose.connect('mongodb://127.0.0.1:27017/LuxLooks',()=>console.log('Database connection established'))



app.listen('5000',()=>{
    console.log("server listening on port 5000");
})