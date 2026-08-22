export function Dependencies({ packages }: { packages: string[] }) {
    return (
        <div className="dz-deps">
            <span className="dz-deps-count">
                <b>{packages.length}</b> external runtime{" "}
                {packages.length === 1 ? "dependency" : "dependencies"}
            </span>

            {packages.length === 0 ? (
                <p>Ships with nothing but React.</p>
            ) : (
                packages.map((name) => (
                    <code className="dz-dep" key={name}>
                        {name}
                    </code>
                ))
            )}
        </div>
    )
}
