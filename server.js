require('dotenv').config();
const express=require('express');
const nodemailer=require('nodemailer');
const cors=require('cors');
const app=express();
const PORT=process.env.PORT || 5000;
app.use(cors({
    origin:'*',
    methods:['GET','POST']
}));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
const transporter=nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASS
    }
});
transporter.verify((error,success)=>{
    if(error){
        console.error('Email server configuration error:',error);
    }else{
        console.log('Email server is ready to send messages');
    }
});
app.post('/api/contact',async(req,res)=>{
    const{name,email,message}=req.body;
    if(!name||!name.trim()){
        return res.status(400).json({error:'Name is required'});
    }
    if(!email||!email.trim()){
        return res.status(400).json({error:'Email is required'});
    }
    const emailRegex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.text(email)){
        return res.status(400).json({error:'Please enter a valid email address'});
    }
    if(!message||!message.trim()){
    return res.status(400).json({error:'Message is required'});
  }

  try{
    await transporter.sendMail({
      from:`"${name.trim()}"<${email.trim()}>`,
      to:process.env.EMAIL_USER,
      subject:`New Portfolio Contact Form Message from ${name.trim()}`,
      text:`
        Name:${name.trim()}
        Email:${email.trim()}
        Message:${message.trim()}
      `,
      html:`
        <h3>New Contact Form Message</h3>
        <p><strong>Name:</strong>${name.trim()}</p>
        <p><strong>Email:</strong>${email.trim()}</p>
        <p><strong>Message:</strong><br>${message.trim().replace(/\n/g,'<br>')}</p>
      `
    });
    res.status(200).json({ 
      message:'Email sent successfully!',
      timestamp:new Date().toISOString()
    });
  }catch(error){
    console.error('Detailed email error:',error);
    if(error.code==='EAUTH'){
      res.status(500).json({error:'Email authentication failed. Check credentials.'});
    }else if(error.code==='ENOTFOUND'){
      res.status(500).json({error:'Network error. Could not reach email server.'});
    }else{
      res.status(500).json({error:'Failed to send email. Please try again later.'});
    }
  }
});
app.get('/health',(req, res)=>{
  res.status(200).json({status:'OK',timestamp:new Date().toISOString()});
});
app.listen(PORT,()=>{
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});