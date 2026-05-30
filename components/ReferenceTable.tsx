type Props = {
  rows: string[][];
};

export function ReferenceTable({ rows }: Props) {
  if (rows.length === 0) {
    return <p className="info-note">Таблица пуста или недоступна.</p>;
  }

  const [header, ...body] = rows;
  const hasHeader = header.some((c) => c.trim());

  return (
    <div className="reference-table-wrap">
      <table className="reference-table">
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
  );
}
