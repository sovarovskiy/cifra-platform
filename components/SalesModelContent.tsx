import type { ContentBlock } from "@/lib/sales-model-content";

export function SalesModelBlocks({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="sales-content">
      {blocks.map((block, i) => {
        if (block.type === "paragraph") {
          return (
            <p key={i} className="sales-paragraph">
              {block.text}
            </p>
          );
        }
        return (
          <div key={i} className="sales-list-block">
            {block.intro && <p className="sales-list-intro">{block.intro}</p>}
            <ul className="sales-list">
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
