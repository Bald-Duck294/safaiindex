import { TrendingUp, TrendingDown } from "lucide-react";

const ImprovementIndicator = ({ value }) => {
 if (value > 0) {
  return (
 <span className="flex items-center text-green-600 font-semibold">
  <TrendingUp className="w-4 h-4 mr-1" />
  {value.toFixed(1)}%
 </span>
  );
 } else if (value < 0) {
  return (
 <span className="flex items-center text-red-600 font-semibold">
  <TrendingDown className="w-4 h-4 mr-1" />
  {value.toFixed(1)}%
 </span>
  );
 }
 return <span className="text-slate-500">-</span>;
};
