import { BarChart as BarChartRecharts, LineChart as LineChartRecharts, PieChart, Pie, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, Sector } from 'recharts';
import { useState } from 'react';

interface ChartData {
  [key: string]: string | number;
}

interface ChartProps {
  data: ChartData[];
  index: string;
  categories: string[];
  colors?: string[];
  valueFormatter?: (value: number) => string;
  showLegend?: boolean;
}

interface DonutChartProps {
  data: ChartData[];
  category: string;
  index: string;
  colors?: string[];
  valueFormatter?: (value: number) => string;
}

export function BarChart({ 
  data, 
  index, 
  categories, 
  colors = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"],
  valueFormatter = (value: number) => `${value}`,
  showLegend = true
}: ChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No data to display</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChartRecharts
        data={data}
        margin={{
          top: 10,
          right: 10,
          left: 0,
          bottom: 40,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted-foreground/20" />
        <XAxis 
          dataKey={index}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          angle={-45}
          textAnchor="end"
          height={70}
          className="text-xs text-muted-foreground"
        />
        <YAxis
          tickFormatter={valueFormatter}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          className="text-xs text-muted-foreground"
        />
        <Tooltip
          formatter={valueFormatter}
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            borderColor: "hsl(var(--border))",
            borderRadius: "var(--radius)",
            fontSize: "12px",
          }}
          itemStyle={{ color: "hsl(var(--foreground))" }}
          labelStyle={{ fontWeight: "bold", color: "hsl(var(--foreground))" }}
        />
        {showLegend && (
          <Legend
            verticalAlign="top"
            height={36}
            wrapperStyle={{ fontSize: "12px" }}
          />
        )}
        {categories.map((category, index) => (
          <Bar
            key={category}
            dataKey={category}
            fill={colors[index % colors.length]}
            radius={[4, 4, 0, 0]}
            barSize={32}
          />
        ))}
      </BarChartRecharts>
    </ResponsiveContainer>
  );
}

export function LineChart({ 
  data,
  index, 
  categories, 
  colors = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"],
  valueFormatter = (value: number) => `${value}`,
  showLegend = true
}: ChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No data to display</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChartRecharts
        data={data}
        margin={{
          top: 10,
          right: 10,
          left: 0,
          bottom: 20,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted-foreground/20" />
        <XAxis 
          dataKey={index}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          className="text-xs text-muted-foreground"
        />
        <YAxis
          tickFormatter={valueFormatter}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          className="text-xs text-muted-foreground"
        />
        <Tooltip
          formatter={valueFormatter}
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            borderColor: "hsl(var(--border))",
            borderRadius: "var(--radius)",
            fontSize: "12px",
          }}
          itemStyle={{ color: "hsl(var(--foreground))" }}
          labelStyle={{ fontWeight: "bold", color: "hsl(var(--foreground))" }}
        />
        {showLegend && (
          <Legend
            verticalAlign="top"
            height={36}
            wrapperStyle={{ fontSize: "12px" }}
          />
        )}
        {categories.map((category, index) => (
          <Line
            key={category}
            type="monotone"
            dataKey={category}
            stroke={colors[index % colors.length]}
            activeDot={{ r: 8 }}
            strokeWidth={2}
          />
        ))}
      </LineChartRecharts>
    </ResponsiveContainer>
  );
}

// Custom active shape for donut chart
const renderActiveShape = (props: any) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
    name,
    valueFormatter
  } = props;

  const formattedValue = valueFormatter ? valueFormatter(value) : value;
  const formattedPercent = `(${(percent * 100).toFixed(0)}%)`;

  return (
    <g>
      <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill="var(--foreground)" className="text-base font-medium">
        {name}
      </text>
      <text x={cx} y={cy + 10} dy={8} textAnchor="middle" fill="var(--foreground)" className="text-sm">
        {formattedValue} {formattedPercent}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 5}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

export function DonutChart({ 
  data,
  category,
  index,
  colors = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"],
  valueFormatter = (value: number) => `${value}`
}: DonutChartProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No data to display</p>
      </div>
    );
  }

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          activeIndex={activeIndex}
          activeShape={(props) => renderActiveShape({ ...props, valueFormatter })}
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          dataKey={category}
          nameKey={index}
          paddingAngle={2}
          onMouseEnter={onPieEnter}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Legend
          verticalAlign="bottom"
          height={36}
          wrapperStyle={{ fontSize: "12px" }}
        />
        <Tooltip
          formatter={valueFormatter}
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            borderColor: "hsl(var(--border))",
            borderRadius: "var(--radius)",
            fontSize: "12px",
          }}
          itemStyle={{ color: "hsl(var(--foreground))" }}
          labelStyle={{ fontWeight: "bold", color: "hsl(var(--foreground))" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}