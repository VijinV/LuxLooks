const isLogin =(req,res,next) => {
    try {
        if(req.session.user_id){
            res.render('home')
        }else{
            next()
        }
    } catch (error) {
        console.log(error.message);
    }
}

const isLogout =(req,res,next) => {
    try {
        if(req.session.user_id){
            next()  
        }else{
            res.render('login')
        }
        
    } catch (error) {
        console.log(error.message);
    }
}

const logout = (req, res) => {
    try {
        req.session.destroy()
        res.redirect('/')

    } catch (error) {

        console.log(error.message);
        
    }
}



module.exports ={
    isLogin,
    isLogout,
    logout
}