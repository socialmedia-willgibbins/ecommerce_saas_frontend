// import React, { useState, useMemo } from "react";
// import {
//   UsersIcon,
//   CurrencyDollarIcon,
//   ArchiveBoxIcon,
//   ShoppingCartIcon,
//   ChartBarIcon,
//   ChartPieIcon,
//   ArrowTrendingDownIcon,
//   StarIcon,
//   CalendarDaysIcon,
// } from "@heroicons/react/24/outline";
// import OrdersBarChart from "../../components/OrdersBarChart";

// // --- Preservation of your Logic & Dummy Data ---
// const quickInsights = [
//   { label: "Conversion Rate", value: "3.8%", helper: "Storewide" },
//   { label: "Average Order Value", value: "₹ 1,420", helper: "Last 30 days" },
//   { label: "Repeat Customers", value: "41%", helper: "Returning buyers" },
// ];

// const categoryData = [
//   { name: "Sarees", value: 62, amount: "₹ 2.1L" },
//   { name: "Kurtis", value: 21, amount: "₹ 0.7L" },
//   { name: "Kids Wear", value: 11, amount: "₹ 0.3L" },
//   { name: "Others", value: 6, amount: "₹ 0.1L" },
// ];

// const recentSignals = [
//   { color: "bg-emerald-500", title: "Weekend spike in saree orders.", detail: "32% higher than the weekday average." },
//   { color: "bg-sky-500", title: "COD conversion improved.", detail: "Drop in cart abandonment for COD orders." },
//   { color: "bg-amber-400", title: "High repeat buyers in Kerala.", detail: "Region driving majority of repeat orders." },
// ];

// export default function AdminDashboard() {
//   const [timeRange, setTimeRange] = useState("6M");

//   // Mapping your existing data structure to the new Stat Card UI
//   const stats = [
//     { label: "Total Revenue", value: "$124.5K", change: "12.4%", trend: "up", icon: CurrencyDollarIcon, helper: "Gross volume" },
//     { label: "Active Users", value: "3,245", change: "8.2%", trend: "up", icon: UsersIcon, helper: "vs last month" },
//     { label: "Total Orders", value: "1,856", change: "5.7%", trend: "up", icon: ShoppingCartIcon, helper: "completed" },
//     { label: "Conv. Rate", value: "3.24%", change: "2.1%", trend: "down", icon: ArchiveBoxIcon, helper: "store average" },
//   ];

//   return (
//     <div className="min-h-screen w-full bg-gradient-to-br from-[#f7faf7] via-[#f4f7f2] to-[#e2eee3] text-[#263526]">
//       <div className="max-w-[1400px] mx-auto px-6 py-10 space-y-8">
        
//         {/* Header */}
//         <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
//           <div>
//             <p className="text-xs uppercase tracking-[0.22em] text-[#7f8f7a] font-medium">
//               Mandharam Drapes · Admin
//             </p>
//             <h1 className="text-3xl font-semibold tracking-tight mt-1">Analytics Overview</h1>
//             <p className="text-sm text-gray-500 mt-1">Real-time insights and performance metrics.</p>
//           </div>

//           <div className="flex items-center gap-1 bg-white/60 backdrop-blur-sm border border-emerald-100/50 rounded-xl p-1 shadow-sm">
//             {["1M", "3M", "6M", "1Y"].map((range) => (
//               <button
//                 key={range}
//                 onClick={() => setTimeRange(range)}
//                 className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
//                   timeRange === range
//                     ? "bg-[#5e785a] text-white shadow-md"
//                     : "text-gray-500 hover:bg-emerald-50"
//                 }`}
//               >
//                 {range}
//               </button>
//             ))}
//           </div>
//         </header>

//         {/* Stat Cards Grid */}
//         <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
//           {stats.map((item) => (
//             <div key={item.label} className="group relative overflow-hidden rounded-2xl border border-emerald-50/70 bg-white/80 p-5 shadow-sm backdrop-blur transition-all hover:shadow-md">
//               <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-emerald-500 to-lime-400" />
//               <div className="flex justify-between">
//                 <div>
//                   <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">{item.label}</p>
//                   <p className="mt-2 text-2xl font-bold tracking-tight">{item.value}</p>
//                   <p className="text-[11px] text-gray-400 mt-1">{item.helper}</p>
//                 </div>
//                 <div className="text-right flex flex-col items-end">
//                   <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
//                     {item.trend === 'up' ? '+' : '-'}{item.change}
//                   </span>
//                   <div className="mt-4 p-2 bg-emerald-50 rounded-full text-[#5e785a]">
//                     <item.icon className="h-5 w-5" />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </section>

//         {/* Main Dashboard Content */}
//         <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
//           {/* Chart Area */}
//           <div className="lg:col-span-2 space-y-6">
//             <div className="rounded-2xl bg-white/90 p-6 shadow-sm border border-white">
//               <div className="mb-6 flex items-center gap-2">
//                 <ChartBarIcon className="h-5 w-5 text-emerald-600" />
//                 <h2 className="text-sm font-bold">Order Volume & Performance</h2>
//               </div>
//               <div className="h-[350px]">
//                  <OrdersBarChart /> 
//               </div>
              
//               {/* Category Progress Bars */}
//               <div className="mt-10">
//                 <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Category Performance</h3>
//                 <div className="space-y-4">
//                   {categoryData.map((row) => (
//                     <div key={row.name} className="space-y-1.5">
//                       <div className="flex justify-between text-xs font-medium">
//                         <span>{row.name}</span>
//                         <span className="text-gray-500">{row.amount}</span>
//                       </div>
//                       <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
//                         <div 
//                           className="h-full bg-gradient-to-r from-emerald-500 to-lime-400 rounded-full" 
//                           style={{ width: `${row.value}%` }}
//                         />
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Sidebar Area */}
//           <div className="space-y-6">
//             {/* Store Pulse */}
//             <div className="rounded-2xl bg-white/90 p-5 shadow-sm border border-white">
//               <div className="flex items-center gap-2 mb-4">
//                 <ChartPieIcon className="h-4 w-4 text-sky-500" />
//                 <h3 className="text-sm font-bold">Store Pulse</h3>
//               </div>
//               <div className="space-y-3">
//                 {quickInsights.map((item) => (
//                   <div key={item.label} className="flex justify-between items-center rounded-xl bg-gray-50/50 border border-gray-100 px-4 py-3">
//                     <div>
//                       <p className="text-[10px] uppercase text-gray-400 font-bold">{item.label}</p>
//                       <p className="text-sm font-bold">{item.value}</p>
//                     </div>
//                     <p className="text-[10px] text-gray-400">{item.helper}</p>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Ratings & Returns Row */}
//             <div className="grid grid-cols-2 gap-4">
//               <div className="rounded-2xl bg-white/90 p-5 shadow-sm border border-white">
//                 <ArrowTrendingDownIcon className="h-5 w-5 text-rose-400 mb-2" />
//                 <p className="text-xl font-bold">3.2%</p>
//                 <p className="text-[10px] text-gray-500 font-medium">Monthly Returns</p>
//               </div>
//               <div className="rounded-2xl bg-white/90 p-5 shadow-sm border border-white">
//                 <StarIcon className="h-5 w-5 text-amber-400 mb-2" />
//                 <p className="text-xl font-bold">4.8</p>
//                 <p className="text-[10px] text-gray-500 font-medium">Avg. Rating</p>
//               </div>
//             </div>

//             {/* Recent Signals */}
//             <div className="rounded-2xl bg-white/90 p-5 shadow-sm border border-white">
//               <h3 className="text-sm font-bold mb-4">Recent Signals</h3>
//               <div className="space-y-4">
//                 {recentSignals.map((signal, i) => (
//                   <div key={i} className="flex gap-3">
//                     <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${signal.color}`} />
//                     <div>
//                       <p className="text-xs font-bold leading-tight">{signal.title}</p>
//                       <p className="text-[11px] text-gray-500 mt-0.5">{signal.detail}</p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//         </section>
//       </div>
//     </div>
//   );
// }


import { useState } from "react";
import {
  UsersIcon,
  CurrencyDollarIcon,
  ArchiveBoxIcon,
  ShoppingCartIcon,
  ChartBarIcon,
  ChartPieIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  StarIcon,
  SignalIcon
} from "@heroicons/react/24/outline";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

// --- Mock Data ---
const chartData = [
  { name: "Mon", value: 4000 },
  { name: "Tue", value: 3000 },
  { name: "Wed", value: 2000 },
  { name: "Thu", value: 2780 },
  { name: "Fri", value: 1890 },
  { name: "Sat", value: 2390 },
  { name: "Sun", value: 3490 },
];

const quickInsights = [
  { label: "Conversion Rate", value: "3.8%", helper: "Storewide" },
  { label: "Avg Order Value", value: "₹ 1,420", helper: "Last 30 days" },
  { label: "Repeat Customers", value: "41%", helper: "Returning buyers" },
];

const categoryData = [
  { name: "Sarees", value: 62, amount: "₹ 2.1L" },
  { name: "Kurtis", value: 21, amount: "₹ 0.7L" },
  { name: "Kids Wear", value: 11, amount: "₹ 0.3L" },
  { name: "Others", value: 6, amount: "₹ 0.1L" },
];

const recentSignals = [
  { type: "up", title: "Weekend spike in saree orders.", detail: "32% higher than avg." },
  { type: "neutral", title: "COD conversion improved.", detail: "Drop in cart abandonment." },
  { type: "star", title: "High repeat buyers in Kerala.", detail: "Region driving loyalty." },
];

const stats = [
  { label: "Total Revenue", value: "$124.5K", change: "12.4%", trend: "up", icon: CurrencyDollarIcon, helper: "Gross volume" },
  { label: "Active Users", value: "3,245", change: "8.2%", trend: "up", icon: UsersIcon, helper: "vs last month" },
  { label: "Total Orders", value: "1,856", change: "5.7%", trend: "up", icon: ShoppingCartIcon, helper: "completed" },
  { label: "Conv. Rate", value: "3.24%", change: "2.1%", trend: "down", icon: ArchiveBoxIcon, helper: "store average" },
];

// --- Components ---

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900 text-white text-xs rounded-lg py-1 px-2 shadow-xl border border-zinc-700">
        <span className="font-semibold">{label}:</span> {payload[0].value}
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState("6M");

  return (
    <div className="min-h-screen w-full bg-gray-50 rounded-2xl dark:bg-black text-zinc-900 dark:text-zinc-100 p-4 sm:p-6 lg:p-8 transition-colors duration-500">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* --- Header --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400 font-bold mb-1">
              Admin Console
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Analytics Overview
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Real-time insights and performance metrics.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-1 shadow-sm">
            {["1M", "3M", "6M", "1Y"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                  timeRange === range
                    ? "bg-black text-white shadow-md dark:bg-white dark:text-black"
                    : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </header>

        {/* --- Stat Cards Grid --- */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {stats.map((item) => (
            <div key={item.label} className="group relative overflow-hidden rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">{item.label}</p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">{item.value}</p>
                  <p className="text-xs text-zinc-400 mt-1 font-medium">{item.helper}</p>
                </div>
                <div className="flex flex-col items-end gap-3">
                   <div className={`p-2 rounded-lg ${item.trend === 'up' ? 'bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500'}`}>
                      <item.icon className="h-5 w-5" />
                   </div>
                   <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.trend === 'up' 
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' 
                      : 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400'
                    }`}>
                    {item.trend === 'up' ? <ArrowTrendingUpIcon className="h-3 w-3 mr-1" /> : <ArrowTrendingDownIcon className="h-3 w-3 mr-1" />}
                    {item.change}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* --- Main Dashboard Content --- */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Chart & Categories (Span 2) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Main Chart Card */}
            <div className="rounded-xl bg-white dark:bg-zinc-950 p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
              <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ChartBarIcon className="h-5 w-5 text-zinc-500" />
                    <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wide">Order Volume</h2>
                </div>
              </div>
              
              <div className="h-[320px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" className="dark:opacity-10" />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fontSize: 12, fill: '#71717a'}} 
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fontSize: 12, fill: '#71717a'}} 
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                            {chartData.map((_, index) => (
                                <Cell key={`cell-${index}`} className="fill-zinc-900 dark:fill-zinc-100 hover:opacity-80 transition-opacity" />
                            ))}
                        </Bar>
                    </BarChart>
                 </ResponsiveContainer>
              </div>
              
              {/* Category Progress Bars */}
              <div className="mt-10 pt-6 border-t border-zinc-100 dark:border-zinc-900">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-6">Category Performance</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                  {categoryData.map((row) => (
                    <div key={row.name} className="space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-zinc-700 dark:text-zinc-300">{row.name}</span>
                        <span className="text-zinc-900 dark:text-white">{row.amount}</span>
                      </div>
                      <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-black dark:bg-white rounded-full" 
                          style={{ width: `${row.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sidebar (Span 1) */}
          <div className="space-y-6">
            
            {/* Store Pulse */}
            <div className="rounded-xl bg-white dark:bg-zinc-950 p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2 mb-6">
                <ChartPieIcon className="h-4 w-4 text-zinc-500" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wide">Store Pulse</h3>
              </div>
              <div className="space-y-4">
                {quickInsights.map((item) => (
                  <div key={item.label} className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                    <div>
                      <p className="text-[10px] uppercase text-zinc-500 font-bold">{item.label}</p>
                      <p className="text-sm font-bold text-zinc-900 dark:text-white">{item.value}</p>
                    </div>
                    <span className="text-[10px] font-medium text-zinc-400 bg-white dark:bg-zinc-800 px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700">
                        {item.helper}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ratings & Returns Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-white dark:bg-zinc-950 p-5 shadow-sm border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
                <div className="mb-2 p-2 w-fit rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400">
                    <ArrowTrendingDownIcon className="h-5 w-5" />
                </div>
                <div>
                    <p className="text-xl font-bold text-zinc-900 dark:text-white">3.2%</p>
                    <p className="text-[10px] uppercase font-bold text-zinc-400">Returns</p>
                </div>
              </div>
              <div className="rounded-xl bg-white dark:bg-zinc-950 p-5 shadow-sm border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
                <div className="mb-2 p-2 w-fit rounded-lg bg-amber-50 text-amber-500 dark:bg-amber-900/20 dark:text-amber-400">
                    <StarIcon className="h-5 w-5" />
                </div>
                <div>
                    <p className="text-xl font-bold text-zinc-900 dark:text-white">4.8</p>
                    <p className="text-[10px] uppercase font-bold text-zinc-400">Rating</p>
                </div>
              </div>
            </div>

            {/* Recent Signals */}
            <div className="rounded-xl bg-white dark:bg-zinc-950 p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2 mb-6">
                <SignalIcon className="h-4 w-4 text-zinc-500" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wide">Signals</h3>
              </div>
              <div className="space-y-6">
                {recentSignals.map((signal, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className="flex flex-col items-center">
                        <div className={`w-2 h-2 rounded-full ${signal.type === 'up' ? 'bg-emerald-500' : signal.type === 'star' ? 'bg-amber-500' : 'bg-blue-500'} ring-4 ring-white dark:ring-black`} />
                        {i !== recentSignals.length - 1 && <div className="w-px h-full bg-zinc-100 dark:bg-zinc-800 my-1" />}
                    </div>
                    <div className="pb-2">
                      <p className="text-xs font-bold text-zinc-900 dark:text-white leading-tight group-hover:text-indigo-600 transition-colors">{signal.title}</p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">{signal.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </section>
      </div>
    </div>
  );
}