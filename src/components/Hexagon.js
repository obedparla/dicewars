import React from "react";

export const Hexagon = ({ classNam, onMouseOver, onClick, children }) => {
  return (
    <div className={classNam} onMouseOver={onMouseOver} onClick={onClick}>
      <div className="children">{children}</div>
      <div className="top"></div>
      <div className="middle"></div>
      <div className="bottom"></div>
    </div>
  );
};
