// "use client";
// import TreeNode from '../components/TreeNode';



// export default function TreeView({ types, onUpdate }) {
//   const buildTree = () => {
//     const tree = [];
//     const map = {};

//     types.forEach((type) => {
//       type.children = [];
//       map[type.id] = type;
//     });

//     types.forEach((type) => {
//       if (type.parent_id) {
//         map[type.parent_id]?.children?.push(type);
//       } else {
//         tree.push(type);
//       }
//     });

//     return tree;
//   };

//   return (
//     <div className="space-y-2">
//       {buildTree().map((type) => (
//         <TreeNode key={type.id} type={type} onUpdate={onUpdate} />
//       ))}
//     </div>
//   );
// }


import TreeNode from "@/components/TreeNode";
import { useState } from "react";
export default function TreeView({ types, onUpdate, flag }) {

  // const [read , setRead] = useState( flag == false? true :false )
  console.log(flag, "flag");
  const buildTree = () => {
    const tree = [];
    const map = {};

    types.forEach((type) => {
      type.children = [];
      map[type.id] = type;
    });

    types.forEach((type) => {
      if (type.parent_id) {
        map[type.parent_id]?.children.push(type);
      } else {
        tree.push(type);
      }
    });

    return tree;
  };

  const tree = buildTree();

  return (
    <div className="space-y-2">
      {tree.map((type) => (
        <TreeNode key={type.id} type={type} onUpdate={onUpdate} allTypes={types} read={flag} />
      ))}
    </div>
  );
}

