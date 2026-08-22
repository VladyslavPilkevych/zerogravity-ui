import type { PropRow } from "../types"

export function PropsTable({ rows, name }: { rows: PropRow[]; name: string }) {
    return (
        <div className="dz-table-wrap">
            <table className="dz-table">
                <caption>{`${rows.length} documented ${rows.length === 1 ? "prop" : "props"} on ${name}`}</caption>
                <thead>
                    <tr>
                        <th scope="col">Property</th>
                        <th scope="col">Type</th>
                        <th scope="col">Default</th>
                        <th scope="col">Description</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={row.name}>
                            <th scope="row">
                                <code>{row.name}</code>
                            </th>
                            <td>
                                <code>{row.type}</code>
                            </td>
                            <td>
                                <code>{row.default}</code>
                            </td>
                            <td>{row.description}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
