import React from "react";

import "./charts.scss";
import "./chartMisc.ts";

import MsgTotalTime from "./time/total";
import MsgLengthAvgTime from "./time/lengthavg";

import MsgTotalWeek from "./week/total";
import MsgLengthAvgWeek from "./week/lengthavg";
import MsgEmojisAvgWeek from "./week/emojis";
import MsgEmojisAvgTime from "./time/emojisavg";

export interface GraphsProps {}

export interface GraphsState {}

class Charts extends React.Component<GraphsProps, GraphsState> {
  render() {
    return (
      <div id="charts" className="pt-4 pb-4">
        <div>
          <h3 className="text-center">Per Week</h3>
          <MsgTotalWeek />
          <MsgLengthAvgWeek />
          <MsgEmojisAvgWeek />
          <h3 className="text-center">Per Time</h3>
          <MsgTotalTime />
          <MsgLengthAvgTime />
          <MsgEmojisAvgTime />
        </div>
      </div>
    );
  }
}

export default Charts;
