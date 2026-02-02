import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "12 Dec", Orders: 40 },
  { name: "13 Dec", Orders: 30 },
  { name: "14 Dec", Orders: 65 },
  { name: "15 Dec", Orders: 45 },
  { name: "16 Dec", Orders: 90 },
  { name: "17 Dec", Orders: 55 },
  { name: "18 Dec", Orders: 70 },
];

export default function OrdersBarChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
        <XAxis 
          dataKey="name" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 11, fill: '#9ca3af' }} 
          dy={10}
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 11, fill: '#9ca3af' }} 
        />
        <Tooltip
          cursor={{ fill: "#f8fafc" }}
          contentStyle={{
            borderRadius: "12px",
            border: "none",
            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
            fontSize: "12px"
          }}
        />
        <Bar 
          dataKey="Orders" 
          fill="#5e785a" 
          radius={[6, 6, 0, 0]} 
          barSize={32}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}