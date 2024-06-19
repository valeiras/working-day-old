"use client";

import React from "react";
import { CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { themeColors } from "@/app/lib/colors";
import { shortenDate, shortenTick } from "@/app/lib/utils";
import Color from "color";

import {
  CHART_MARGIN,
  LEGEND_HEIGHT,
  RESPONSIVE_CONTAINER_HEIGHT,
  RESPONSIVE_CONTAINER_WIDTH,
} from "@/app/lib/constants";
import { ProjectWithWorkingTimes } from "@/app/lib/db/queries";

type Props = { chartData: Record<string, string>[]; projects: ProjectWithWorkingTimes[] | null | undefined };

const TimePerDayAndProjectLineChart: React.FC<Props> = ({ chartData, projects }) => {
  // const selectedProjects = projects?.slice(1, 4).map(({ name }) => name);
  // console.log(selectedProjects);
  console.log(chartData);
  return (
    <ResponsiveContainer width={RESPONSIVE_CONTAINER_WIDTH} height={RESPONSIVE_CONTAINER_HEIGHT} debounce={1}>
      <LineChart data={chartData} margin={CHART_MARGIN}>
        <XAxis dataKey="date" tickFormatter={shortenDate} />
        <YAxis />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        <Legend align="center" formatter={shortenTick} height={LEGEND_HEIGHT} />
        {projects?.map(({ name }, idx) => {
          const round = Math.floor(idx / themeColors.length);
          const color = Color(themeColors[idx % themeColors.length])
            .alpha(0.9)
            .lighten(0.5)
            .desaturate(round / (round + 1 + 1))
            .string();
          return <Line key={name} type="monotone" dataKey={name} stroke={color} dot={false} />;
        })}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TimePerDayAndProjectLineChart;