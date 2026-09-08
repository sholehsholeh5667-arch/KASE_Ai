import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface ChartData {
  label: string;
  total: number;
}

interface SalesChartProps {
  data: ChartData[];
}

export default function SalesChart({
  data,
}: SalesChartProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold mb-6">
        Grafik Penjualan 30 Hari
      </h2>

      <ResponsiveContainer
        width="100%"
        height={320}
      >
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="label"
          />

          <YAxis
            tickFormatter={(value) =>
              `Rp ${Number(value).toLocaleString("id-ID")}`
            }
          />

          <Tooltip
            formatter={(value) => [
              `Rp ${Number(value ?? 0).toLocaleString("id-ID")}`,
              "Penjualan",
            ]}
          />

          <Line
            type="monotone"
            dataKey="total"
            stroke="#2563eb"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {data.length === 0 && (
        <div className="text-center text-gray-500 mt-4">
          Belum ada data penjualan.
        </div>
      )}
    </div>
  );
}