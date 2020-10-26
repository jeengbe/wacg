import React from "react";

import "./charts.scss";
import MsgsPerWeek from "./msgsPerWeek";
import MsgTimes from "./msgTimes";
import "./chartMisc";

export interface GraphsProps {}

export interface GraphsState {}

class Charts extends React.Component<GraphsProps, GraphsState> {
  render() {
    return (
      <div id="charts" className="pt-4 pb-4">
        <div>
          <MsgTimes />
          <MsgsPerWeek />
        </div>
      </div>
    );
  }
}

export default Charts;
