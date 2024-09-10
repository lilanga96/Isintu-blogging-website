import React from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function UserLogin (){

    let navigate = useNavigate()

    return(
        <div>
            <div class="container">
        <div class="row justify-content-center">
            <div class="col-md-6">
                <h2 class="text-center">Login</h2>
                <form>
                    <div class="form-group">
                        <label for="email">Email address</label>
                        <input type="email" class="form-control" id="email" placeholder="Enter email" />
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" class="form-control" id="password" placeholder="Password" />
                    </div>
                    <button onClick={() => navigate('/dashboard')} type="submit" class="btn btn-primary btn-block">Login</button>
                    <p>Don't have an account? <Link to = '/' className="links">Register</Link></p>
                </form>
            </div>
        </div>
    </div> 
        </div>
    )
}

export default UserLogin