import React from "react";
import "../styles/style.css"
import Navbar from "./navbar";

const Layout = (props) => {
  return (
    <>
      <Navbar />
      <div className="container">
        {props.children}
      </div>
    </>
  )
}

export default Layout
