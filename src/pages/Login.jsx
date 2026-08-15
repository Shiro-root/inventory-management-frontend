import React from "react";
import instance from "../api/axiosInstance";
import { useForm } from "react-hook-form";
import {useNavigate} from "react-router";

function Login() {
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();
  async function onSubmit(data) {
    try{
const response = await  instance.post('/auth/login',data);
if (response.data){
  localStorage.setItem('token',response.data.token;
localStorage.setItem('role',response.data.data?.role);
 console.log(data.username, data.password);
 navigate("/dashboard")
  }
    }catch(error){
      console.error("Login error: ", error);
      alert("Failed to login. please check your credentials");
    }
  }


  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("username")} />
      <input {...register("password")} />
        <button type="submit"></button>
    </form>

    
      
  );
  
}

export default Login;
