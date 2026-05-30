"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  rows: string[][];
};

export function ReferenceTable({ rows }: Props) {
  const outerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const [layout, setLayout] = useState({ scale: 1, height: 0 });

  const fitToWidth = useCallback(() => {
    const outer = outerRef.current;
    const table = tableRef.current;
    if (!outer || !table) return;

    const naturalW = table.getBoundingClientRect().width || table.scrollWidth;
    const naturalH = table.getBoundingClientRect().height || table.offsetHeight;
    if (naturalW <= 0 || naturalH <= 0) return;

    const availableW = outer.getBoundingClientRect().width;
    if (availableW <= 0) return;

    const scale = Math.min(1, availableW / naturalW);
    setLayout({ scale, height: naturalH * scale });
  }, []);

  useEffect(() => {
    fitToWidth();
    const outer = outerRef.current;
    const table = tableRef.current;
    if (!outer) return;

    const ro = new ResizeObserver(fitToWidth);
    ro.observe(outer);
    if (table) ro.observe(table);
    window.addEventListener("resize", fitToWidth);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", fitToWidth);
    };
  }, [rows, fitToWidth]);

  useEffect(() => {
    const t1 = requestAnimationFrame(fitToWidth);
    const t2 = window.setTimeout(fitToWidth, 100);
    return () => {
      cancelAnimationFrame(t1);
      window.clearTimeout(t2);
    };
  }, [rows, fitToWidth]);

  if (rows.length === 0) {
    return <p className="info-note">Таблица пуста или недоступна.</p>;
  }

  const [header, ...body] = rows;
  const hasHeader = header.some((c) => c.trim());

  return (
    <div
      ref={outerRef}
      className="reference-table-fit"
      style={{ height: layout.height > 0 ? layout.height : undefined }}
    >
      <div
        className="reference-table-fit-inner"
        style={{
          transform: `scale(${layout.scale})`,
        }}
      >
        <table ref={tableRef} className="reference-table">
          {hasHeader && (
            <thead>
              <tr>
                {header.map((cell, i) => (
                  <th key={i}>{cell}</th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {(hasHeader ? body : rows).map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
