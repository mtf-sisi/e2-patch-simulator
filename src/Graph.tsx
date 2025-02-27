import React from "react";
import {
  ResponsiveContainer,
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import rawValues from "./values-week.json";
import "./Graph.css";

interface GraphProps {
  patches: number;
  spread: number;
  period: number;
  worn: number;
}

interface SeriesData {
  time: number;
  value: number;
  patches: number;
}

function Graph({ patches, spread, period, worn }: GraphProps) {
  const newSeries = generateSeries(patches, spread, period, worn);
  return (
    <div className="Graph">
      <ResponsiveContainer>
        <LineChart
          data={newSeries}
          margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
        >
          <YAxis
            dataKey="value"
            yAxisId="valueAxis"
            width={80}
            label={{
              value: "E2 concentration (pg/mL)",
              angle: -90,
              position: "inside",
            }}
          />
          <YAxis
            dataKey="patches"
            yAxisId="patchAxis"
            width={80}
            label={{
              value: "# of patches",
              angle: 90,
              position: "inside",
            }}
            orientation="right"
          />
          <XAxis
            dataKey="time"
            height={40}
            label={{ value: "Time (hours)", position: "insideBottom" }}
          />
          <Tooltip />
          <CartesianGrid stroke="#666666" strokeWidth={1} />
          <Line yAxisId="valueAxis" type="monotone" dot={false} dataKey="value" stroke="#F5A9B8" strokeWidth={2} isAnimationActive={false} />
          <Line yAxisId="patchAxis" type="monotone" dot={false} dataKey="patches" stroke="#5BCEFA" strokeWidth={2} opacity={0.25} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default Graph;

function generateSeries(patches: number, spread: number, period: number, worn: number): SeriesData[] {
  let newValues: SeriesData[] = new Array(period);
  newValues.fill({ time: 0, value: 0, patches: 0 });
  const spreadsPerPeriod = Math.ceil(period / spread);
  for (let i = 0; i < spreadsPerPeriod; i++) {
    const spreadOffset = i * spread;

    newValues = newValues.map((item, index) => {
      let rawValueIndex = index - spreadOffset;
      let rawValueAtTime = 0;
      let patchApplied = false;
      if (rawValueIndex > worn) {
        const dropoffDist = rawValueIndex - worn;
        patchApplied = false;
        rawValueAtTime = rawValues[rawValues.length - 1] / (dropoffDist);
      } else {
        rawValueAtTime = rawValues[rawValueIndex];
        patchApplied = rawValueAtTime > 0;
      }
      return {
        time: index,
        value: item.value + patches * (rawValueAtTime || 0),
        patches: item.patches + patches * (patchApplied ? 1 : 0)
      };
    });
  }
  return newValues;
}
