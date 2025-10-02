// "use client";
// import { useState } from "react";
// import locationTypesApi from "@/lib/api/locationTypesApi";

// export default function CreateForm({ onCreated }) {
//   const [name, setName] = useState("");
//   const [parentId, setParentId] = useState("");
//   const [isToilet, setIsToilet] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     await locationTypesApi.create({
//       name,
//       parent_id: parentId || null,
//       is_toilet: isToilet,
//       company_id: 2,   // take from the user looged in 
//         });
//     setName("");
//     setParentId("");
//     setIsToilet(false);
//     onCreated();
//   };

//   return (
//     <form onSubmit={handleSubmit} className="mb-4 space-y-2">
//       <input
//         className="border p-2 w-full"
//         value={name}
//         onChange={(e) => setName(e.target.value)}
//         placeholder="Type name"
//         required
//       />
//       <input
//         className="border p-2 w-full"
//         value={parentId}
//         onChange={(e) => setParentId(e.target.value)}
//         placeholder="Parent ID (optional)"
//       />
//       <label className="flex items-center gap-2">
//         <input type="checkbox" checked={isToilet} onChange={(e) => setIsToilet(e.target.checked)} />
//         Is Toilet
//       </label>
//       <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">
//         Add Type
//       </button>
//     </form>
//   );
// }



// "use client";

// import { useState } from "react";
// import locationTypesApi from "@/lib/api/locationTypesApi";

// export default function CreateForm({ onCreated, allTypes }) {
//   const [name, setName] = useState("");
//   const [parentId, setParentId] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!name.trim()) return;

//     await locationTypesApi.create({
//       name,
//       parent_id: parentId ? parseInt(parentId) : null,
//     });

//     setName("");
//     setParentId("");
//     onCreated(); // Refresh list
//   };

//   return (
//     <form onSubmit={handleSubmit} className="mb-6 space-y-4 max-w-md">
//       <div>
//         <label className="block font-semibold mb-1">Type Name</label>
//         <input
//           type="text"
//           className="border border-gray-300 p-2 rounded w-full"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           placeholder="e.g., Ward, Floor, Platform"
//         />
//       </div>

//       <div>
//         <label className="block font-semibold mb-1">Parent Type (optional)</label>
//         <select
//           value={parentId}
//           onChange={(e) => setParentId(e.target.value)}
//           className="border border-gray-300 p-2 rounded w-full"
//         >
//           <option value="">No Parent</option>
//           {allTypes.length > 0 ? (
//             allTypes.map((type) => (
//               <option key={type.id} value={type.id}>
//                 {type.name}
//               </option>
//             ))
//           ) : (
//             <option disabled>No parent found</option>
//           )}
//         </select>
//       </div>

//       <button
//         type="submit"
//         className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//       >
//         Create Type
//       </button>
//     </form>
//   );
// }



"use client";

import { useState } from "react";
import locationTypesApi from "@/lib/api/locationTypesApi";
import { all } from "axios";
// import useCompanyId from "@/lib/utils/getCompanyId";
import { useCompanyId } from '@/lib/providers/CompanyProvider';


export default function CreateForm({ onCreated, allTypes }) {
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
  const { companyId } = useCompanyId();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    await locationTypesApi.create({
      name,
      parent_id: parentId ? parseInt(parentId) : null,
    }, companyId);

    setName("");
    setParentId("");
    onCreated(); // Refresh list
  };

  console.log(allTypes, "all types");
  return (
    <form onSubmit={handleSubmit} className="mb-6 space-y-4 max-w-md">
      <div>
        <label className="block font-semibold mb-1">Type Name</label>
        <input
          type="text"
          className="border border-gray-300 p-2 rounded w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Ward, Floor, Platform"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Parent Type (optional)</label>
        <select
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          className="border border-gray-300 p-2 rounded w-full"
        >
          <option value="">No Parent</option>
          {allTypes?.length > 0 ? (
            allTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))
          ) : (
            <option disabled>No parent found</option>
          )}
        </select>
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Create Type
      </button>
    </form>
  );
}
