import React from "react";

export default function ProdDetailsList({ product }) {
  const details = [
    ["ประเภทกระเป๋า", product.category],
    ["Brand", product.brand],
    ["Material", product.material],
    ["Condition", product.condition],
  ].filter(([, value]) => value);
  return (
    <section className="bg-gray-50 rounded-xl shadow-lg p-4 sm:p-8 my-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Product Details</h2>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {details.map(([label, value]) => (
          <div key={label} className="p-3 bg-white rounded-lg shadow-sm">
            <dt className="text-xs text-gray-500">{label}</dt>
            <dd className="text-sm font-semibold text-gray-800">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
