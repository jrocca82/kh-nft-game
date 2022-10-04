import React from 'react';
import styles from "../styles/LoadingIndicator.module.css";

const LoadingIndicator = () => {
  return (
    <div style={{backgroundColor: "black", width: "100vw", height: "100vh"}}>
      <h2 style={{color: "white", textAlign: "center", paddingTop: "40vh"}}>Loading, please wait!</h2>
    </div>
  );
};

export default LoadingIndicator;