import Chart, { ChartDataSets } from "chart.js";
import React from "react";
import { EE, URL_BASE } from "../../..";
import { IContactData } from "../../contacts/contactList";

export interface MsgTotalTimeProps {}

export interface MsgTotalTimeState {
  date: String;
}

export default class MsgTotalTime extends React.Component<MsgTotalTimeProps, MsgTotalTimeState> {
  ref: React.RefObject<HTMLCanvasElement>;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  chart: Chart;

  config: Chart.ChartConfiguration = {
    type: "line",
    options: {
      title: {
        display: true,
        text: "Total",
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
          title: (item, data) => {
            return String(Math.floor(item[0].index / 6)).padStart(2, "0") + ":" + String((item[0].index % 6) * 10).padStart(2, "0") + " - " + String(Math.floor((item[0].index + 1) / 6)).padStart(2, "0") + ":" + String(((item[0].index + 1) % 6) * 10).padStart(2, "0");
          },
          label: (item, data) => {
            if (item.datasetIndex > 0) {
              let tooltip = "";
              tooltip += " " + data.datasets[item.datasetIndex].label + ": " + item.value;
              // tooltip += " (" + Math.floor(tooltipItem.y / data.datasets[0].) * 100 + "%)";
              return tooltip;
            }
            return null;
          },
          footer: (item, data) => "Total: " + item[0].yLabel,
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
          label: "Total",
          borderColor: "rgba(189,189,189,0.5)",
          backgroundColor: "rgba(189,189,189,0.15)",
          fill: true,
          pointRadius: 2,
          pointHoverRadius: 2,
          data: new Array(24 * 6).fill(0),
        },
      ],
      labels: (() => {
        const labels = [];
        for (let h = 0; h < 24; h++) {
          for (let m = 0; m < 6; m++) {
            labels.push(String(h).padStart(2, "0") + ":" + String(m * 10).padStart(2, "0"));
          }
        }
        return labels;
      })(),
    },
  };

  constructor(props: MsgTotalTimeProps) {
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
        const r = await fetch(URL_BASE + "MsgTotalTime", {
          method: "POST",
          body: body,
        });

        const data: {
          datasets: ChartDataSets[];
          date: string;
        } = await r.json();

        data.datasets.forEach(set => (set["jid"] = jid));
        data.datasets.forEach(set => set.data.push(set.data[0] as any));

        this.config.data.datasets.push(...data.datasets);

        data.datasets.forEach((set: Chart.ChartDataSets) => {
          set.data.forEach((value, index) => {
            this.config.data.datasets[0].data[index] = this.config.data.datasets[0].data[index] || 0;
            this.config.data.datasets[0].data[index] += value;
          });
        });

        this.chart["source"] = data["date"];
        this.chart.update();

        /*
         * End loading
         */
      })();
    });
    EE.on("remove-jid", jid => {
      let remove: ChartDataSets[] = this.config.data.datasets.filter(set => set["jid"] === jid);

      remove.forEach(set => {
        set.data.forEach((value, index) => {
          (this.config.data.datasets[0].data[index] as number) -= value;
        });
      });

      this.config.data.datasets = this.config.data.datasets.filter(set => set["jid"] !== jid);

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
