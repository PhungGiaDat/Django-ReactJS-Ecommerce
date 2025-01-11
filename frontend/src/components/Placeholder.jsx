import React from "react";

const PlaceHolder = () => {
  return (  
    <div className="col-md-3 mb-5">
        <div className="card" aria-hidden="true">
            <div 
            className="place-img"
            style={{height: "180px",backgroundColor:"lightgray"}}></div>
            <div className="card-body">
                <h5 className="card-title" style={{height: "20px",backgroundColor:"lightgray"}}></h5>
                <p className="card-text" style={{height: "20px",backgroundColor:"lightgray"}}></p>
                <button className="btn btn-primary" style={{height: "30px",backgroundColor:"lightgray"}}>Xem chi tiết</button>
            </div>
        </div>
    </div>
  );
}