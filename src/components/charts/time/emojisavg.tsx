import Chart, { ChartDataSets } from "chart.js";
import React from "react";
import { EE, URL_BASE } from "../../..";
import { IContactData } from "../../contacts/contactList";

export interface MsgEmojisAvgTimeProps {}

export interface MsgEmojisAvgTimeState {
  date: String;
}

export default class MsgEmojisAvgTime extends React.Component<MsgEmojisAvgTimeProps, MsgEmojisAvgTimeState> {
  ref: React.RefObject<HTMLCanvasElement>;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  chart: Chart;

  config: Chart.ChartConfiguration = {
    type: "line",
    options: {
      title: {
        display: true,
        text: "Average emojis per message",
      },
      spanGaps: false,
      // animation: {
      //   duration: 0,
      // },
      elements: {
        line: {
          tension: 0.35,
        },
      },
      tooltips: {
        mode: "index",
        callbacks: {
          label: (item, data) => {
            if (item.datasetIndex > 0) {
              let tooltip = "";
              tooltip += " " + data.datasets[item.datasetIndex].label + ": " + item.value + " emojis";
              // tooltip += " (" + Math.floor(tooltipItem.y / data.datasets[0].) * 100 + "%)";
              return tooltip;
            }
            return null;
          },
          footer: (item, data) => "Average: " + parseFloat(item[0].yLabel.toString()).toFixed(3),
        },
      },
      scales: {
        yAxes: [
          {
            ticks: {
              min: 0,
            },
          },
        ],
      },
    },
    data: {
      datasets: [
        {
          label: "Average",
          borderColor: "rgba(189,189,189,0.5)",
          backgroundColor: "rgba(189,189,189,0.15)",
          fill: true,
          pointRadius: 2,
          pointHoverRadius: 2,
          data: new Array(24).fill(0),
        },
      ],
      labels: (() => {
        const labels = [];
        for (let h = 0; h <= 24; h++) {
          labels.push(String(h).padStart(2, "0") + ":00");
        }
        return labels;
      })(),
    },
  };

  constructor(props: MsgEmojisAvgTimeProps) {
    super(props);
    this.ref = React.createRef();
    this.state = {
      date: null,
    };
    EE.on("add-jid", (jid: string, type: IContactData["type"]) => {
      (async () => {
        /*
         * Start loading
         */
        let body = new FormData();
        body.append("jid",  jid);
        body.append("type", type);
        body.append("sets", this.config.data.datasets.length.toString());
        const r = await fetch(URL_BASE + "MsgEmojisAvgTime", {
          method: "POST",
          body: body,
        });

        const data: {
          datasets: ChartDataSets[];
          date: string;
        } = await r.json();

        data.datasets.forEach(set => set["jid"] = jid);
        data.datasets.forEach(set => set.data.push(set.data[0] as any))
        this.config.data.datasets.push(...data.datasets);
        let totalData: { [key: number]: number[] } = {};

        this.config.data.datasets.slice(1).forEach((set: Chart.ChartDataSets) => {
          set.data.forEach((value, index) => {
            totalData[index] = totalData[index] || [];
            totalData[index].push(value);
          });
        });

        let total = [];
        for (const key in totalData) {
          total[key] = totalData[key].length === 0 ? 0 : totalData[key].reduce((a, b) => a + b, 0) / totalData[key].length;
        }

        this.config.data.datasets[0].data = total;

        this.chart["source"] = data["date"];
        this.chart.update();

        /*
         * End loading
         */
      })();
    });
    EE.on("remove-jid", jid => {
      this.config.data.datasets = this.config.data.datasets.filter(set => set["jid"] !== jid);

      let totalData: { [key: number]: number[] } = {};

      this.config.data.datasets.slice(1).forEach((set: Chart.ChartDataSets) => {
        set.data.forEach((value, index) => {
          totalData[index] = totalData[value] || [];
          totalData[index].push(value);
        });
      });

      let total = [];
      for (const key in totalData) {
        total[key] = totalData[key].length === 0 ? 0 : totalData[key].reduce((a, b) => a + b, 0) / totalData[key].length;
      }

      this.config.data.datasets[0].data = total;

      this.chart.update();
    });
  }

  componentDidMount() {
    this.canvas = this.ref.current;
    this.ctx = this.canvas.getContext("2d");
    this.chart = new Chart(this.ctx, this.config);
  }

  render() {
    return <canvas className="mb-4" ref={this.ref} />;
  }
}
