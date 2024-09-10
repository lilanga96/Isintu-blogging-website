import React from "react";
import { Link } from "react-router-dom";

function UserRegistration(){
    return(
     <div>
        <div class="container">
        <div class="row justify-content-center">
            <div class="col-md-6">
                <h2 class="text-center">Signup</h2>
                <form>
                    <div class="form-group">
                        <label for="name">Full Name</label>
                        <input type="text" class="form-control" id="name" placeholder="Enter your name" />
                    </div>
                    <div class="form-group">
                        <label for="email">Email address</label>
                        <input type="email" class="form-control" id="email" placeholder="Enter email" />
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" class="form-control" id="password" placeholder="Password" />
                    </div>
                    <div class="form-group">
                        <label for="confirm-password">Confirm Password</label>
                        <input type="password" class="form-control" id="confirm-password" placeholder="Confirm Password" />
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">Signup</button>

                </form> 
                   <p>Already have an account? <Link to = '/login' className="links">Login</Link></p>
            </div>
        </div>
    </div>
     </div>
    )
}

export default UserRegistration