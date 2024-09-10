import React from "react";
import { useRef, useEffect } from "react";


function Dashboard(){

     const navbarRef = useRef(null);

     useEffect(() =>{
        navbarRef.current.classList.add('animate')
    },[])

    return(
        <div>
       <nav ref={navbarRef} class="navbar navbar-expand-lg navbar-light bg-light">
    <a class="navbar-brand" href="#">ISINTU SIYABUKWA</a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav">
            <li class="nav-item active">
                <a class="nav-link" href="#">Home <span class="sr-only">(current)</span></a>
                <i class="ri-home-8-line"></i>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#">POSTS</a>
                <i class="ri-news-line"></i>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#">REQUESTS</a>
                <i class="ri-user-received-2-line"></i>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#" >FOLLOWERS</a>
                <i class="ri-group-line"></i>
            </li>
        </ul>
    </div>
</nav>

     </div>
    )
}

export default Dashboard