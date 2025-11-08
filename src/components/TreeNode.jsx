// export default function TreeNode({ type, onUpdate, level = 0 }) {
//     console.log(first)
//   return (
//     <div className={`pl-${level * 4}`}>
//       <div className="border-l-2 border-gray-300 pl-2 py-1">
//         <div className="flex items-center gap-2">
//           <span className="font-semibold">{type.name}</span>
//           <span className="text-xs text-gray-400">[ID: {type.id}]</span>

//           {type.is_toilet && (
//             <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
//               🚻 Toilet
//             </span>
//           )}
//         </div>

//         {/* Recursively render children */}
//         {type.children?.map((child) => (
//           <TreeNode key={child.id} type={child} onUpdate={onUpdate} level={level + 1} />
//         ))}
//       </div>
//     </div>
//   );
// }

"use client";
import { useState } from "react";
import locationTypesApi from "@/lib/api/locationTypesApi";
import { useParams } from "next/navigation";
import { usePathname } from "next/navigation";

export default function TreeNode({
  type,
  onUpdate,
  allTypes = [],
  read = false,
}) {
  const [editName, setEditName] = useState(type.name);
  const [editParentId, setEditParentId] = useState(type.parent_id || "");
  const [isSaving, setIsSaving] = useState(false);

  const pathname = usePathname();
  const [readonly, setReadonly] = useState( pathname == '/location-types/add' ? true : false );



  // console.log(pathname, "pathname");

  const handleSave = async () => {
    setIsSaving(true);
    await locationTypesApi.update(type.id, {
      name: editName,
      parent_id: editParentId || null,
    });
    setIsSaving(false);
    onUpdate();
  };

  return (
    <div className="ml-4 mt-2 border-l border-gray-300 pl-2">
      {readonly ? (
        // ✅ Read-Only View
        <div className="flex gap-2 items-center">
          <span className="text-sm text-gray-800 font-medium">{type.name}</span>
          <span className="text-xs text-gray-500">[ID: {type.id}]</span>
          {type.is_toilet && (
            <span className="text-green-600 text-xs font-semibold">
              (Toilet Type)
            </span>
          )}
        </div>
      ) : (
        // ✅ Edit Mode
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <span className="text-xs text-gray-500">ID: {type.id}</span>
          <input
            className="border px-2 py-1 rounded w-48"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />
          <select
            value={editParentId || ""}
            onChange={(e) => setEditParentId(e.target.value)}
            className="border p-1 rounded"
          >
            <option value="">No Parent</option>
            {allTypes
              .filter((t) => t.id !== type.id)
              .map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
          </select>
          <button
            className="text-blue-600 hover:underline"
            onClick={handleSave}
            disabled={isSaving}
          >
            Save Changes
          </button>
        </div>
      )}

      {/* Children */}
      {type.children?.map((child) => (
        <TreeNode
          key={child.id}
          type={child}
          onUpdate={onUpdate}
          allTypes={allTypes}
          readonly={readonly}
        />
      ))}
    </div>
  );
}
