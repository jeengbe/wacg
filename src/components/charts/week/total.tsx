import Chart, { ChartDataSets, ChartPoint } from "chart.js";
import "chartjs-plugin-zoom";
import moment from "moment";
import React from "react";
import { EE, URL_BASE } from "../../..";
import { IContactData } from "../../contacts/contactList";

export interface MsgTotalWeekProps {}

export interface MsgTotalWeekState {
  date: String;
}

export default class MsgTotalWeek extends React.Component<MsgTotalWeekProps, MsgTotalWeekState> {
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
            const start = moment(item[0].xLabel, "MMM DD, YYYY, h:mm:ss a").format("DD.MM.YYYY");
            const end = moment(start, "DD.MM.YYYY").add(6, "days").format("DD.MM.YYYY");
            return start + " - " + end;
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
        xAxes: [
          {
            type: "time",
            time: {
              displayFormats: {
                day: "DD.MM.YYYY",
                month: "MMM YYYY",
              },
            },
            ticks: {
              // Next monday
              max: moment().add(8 - moment().day(), "days"),
            },
          },
        ],
        yAxes: [
          {
            ticks: {
              min: 0,
            },
          },
        ],
      },
      plugins: {
        zoom: {
          pan: {
            enabled: true,
            mode: "x",
            speed: 20,
          },
          zoom: {
            enabled: true,
            mode: "x",
            sensitivity: 3,
          },
        },
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
        },
      ],
    },
  };

  totalData: { [key: number]: number } = {};

  constructor(props: MsgTotalWeekProps) {
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
        const r = await fetch(URL_BASE + "MsgTotalWeek", {
          method: "POST",
          body: body,
        });

        const data: {
          datasets: ChartDataSets[];
          date: string;
        } = await r.json();

        data.datasets.forEach(set => (set["jid"] = jid));
        this.config.data.datasets.push(...data.datasets);

        data.datasets.forEach((set: Chart.ChartDataSets) => {
          set.data.forEach(value => {
            value = value as ChartPoint;
            this.totalData[value.x] = this.totalData[value.x] || 0;
            this.totalData[value.x] += value.y;
          });
        });

        const sortedData = {};
        Object.keys(this.totalData)
          .sort()
          .forEach(key => (sortedData[key] = this.totalData[key]));

        let total = [];
        for (const key in sortedData) {
          total.push({
            x: parseInt(key),
            y: sortedData[key],
          });
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
      let remove: ChartDataSets[] = this.config.data.datasets.filter(set => set["jid"] === jid);

      remove.forEach(set => {
        set.data.forEach(value => {
          value = value as ChartPoint;
          this.totalData[value.x] -= value.y;
        });
      });

      this.config.data.datasets = this.config.data.datasets.filter(set => set["jid"] !== jid);

      let minKey = Infinity;

      this.config.data.datasets.forEach((set, index) => {
        if (index > 0) {
          set.data.forEach(value => {
            value = value as ChartPoint;
            minKey = Math.min(minKey, value.x);
          });
        }
      });

      Object.keys(this.totalData)
        .filter(key => parseInt(key) < minKey)
        .forEach(key => delete this.totalData[key]);

      const sortedData = {};
      Object.keys(this.totalData)
        .sort()
        .forEach(key => (sortedData[key] = this.totalData[key]));

      let total = [];
      for (const key in sortedData) {
        total.push({
          x: parseInt(key),
          y: sortedData[key],
        });
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
