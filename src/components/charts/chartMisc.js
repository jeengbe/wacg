import Chart from "chart.js";
import moment from "moment";

Chart.pluginService.register({
  afterDraw: chart => {
    if(chart["source"] != null) {
      let ctx = chart.canvas.getContext("2d");
      ctx.fillStyle = "#666";
      ctx.font = "12px Open Sans";
      ctx.fillText("Source: " + moment(chart["source"]).format("D.M.Y HH:mm"), 4, 8);
    }
  },
});

Chart.defaults.global.defaultFontFamily = "open-sans";