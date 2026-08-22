"use client"

import { useState } from "react"

import { Reel } from "@/lib/reel"
import type { PreviewApi } from "@/docs/useDocsConfig"

import { PRODUCTS, type ReelDemoConfig } from "../reel/schema"

export function ReelPreview({ config }: PreviewApi) {
    const c = config as unknown as ReelDemoConfig
    const [index, setIndex] = useState(0)

    const products = PRODUCTS.slice(0, c.items)
    const current = products[Math.min(index, products.length - 1)]

    return (
        <div className="pg-reel-stage">
            <Reel
                index={index}
                onIndexChange={setIndex}
                itemWidth={c.itemWidth}
                itemHeight={c.itemHeight}
                radius={c.radius}
                spacing={c.spacing}
                visible={c.visible}
                scale={c.scale}
                opacity={c.opacity}
                rotate={c.rotate}
                depth={c.depth}
                perspective={c.perspective}
                stiffness={c.stiffness}
                loop={c.loop}
                drag={c.drag}
                wheel={c.wheel}
                arrows={c.arrows}
                dots={c.dots}
                clickToSelect={c.clickToSelect}
                label="Products"
            >
                {products.map((product) => (
                    <article
                        key={product.name}
                        className="pg-product"
                        style={{
                            background: `linear-gradient(160deg, ${product.from}, ${product.to})`,
                        }}
                    >
                        <span className="pg-product-tag">{product.tag}</span>
                        <div className="pg-product-body">
                            <h3>{product.name}</h3>
                            <span className="pg-product-price">{product.price}</span>
                        </div>
                    </article>
                ))}
            </Reel>

            <footer className="pg-reel-foot">
                <strong>{current?.name}</strong>
                <span>
                    {index + 1} / {products.length}
                </span>
            </footer>
        </div>
    )
}
