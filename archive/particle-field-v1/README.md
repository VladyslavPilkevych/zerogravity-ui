# ParticleField

Чисто визуальный компонент: облако точек в виде деформирующегося кольца, которое плавно тянется за курсором. Периодически по нему прокатывается цветная волна.

Копия компонента с home page ([src/features/home/components/ParticleField.tsx](../../features/home/components/ParticleField.tsx)), сделанная самодостаточной: без зависимостей от i18n, GSAP или стилей `Home.css`.

## Файлы

- `ParticleField.tsx` — сам компонент (canvas 2D + requestAnimationFrame)
- `ParticleField.css` — стили канваса и опциональной обёртки-сцены
- `index.ts` — реэкспорт

## Использование

```tsx
import { ParticleField } from "@/components/particle-field"

export function Demo() {
    return (
        <section className="particle-field-stage">
            <ParticleField />

            <div className="particle-field-content">
                <h1>Заголовок поверх точек</h1>
            </div>
        </section>
    )
}
```

Обёртка `.particle-field-stage` не обязательна, но родитель канваса должен быть
`position: relative` и иметь ненулевые размеры — компонент измеряет
`canvas.parentElement` и слушает на нём `mousemove`.

## Поведение

- Точки лерпом тянутся к позиции курсора внутри родителя; при `mouseleave` кольцо возвращается в центр.
- Появление — плавный fade-in за 2 секунды.
- `IntersectionObserver` останавливает анимацию, когда блок вне вьюпорта.
- `prefers-reduced-motion: reduce` — рисуется один статичный кадр, rAF не запускается.
- Учитывается `devicePixelRatio` (ограничен 2), пересчёт на `resize`.

## Настройка

Все параметры — константы внутри `useEffect`:

| Что | Где | Значение |
| --- | --- | --- |
| Количество точек | `createParticles` → `count` | `900` |
| Радиусы кольца | `minRadius` / `maxRadius` | `180` / `580` |
| Палитра точек | `premiumColors` | 5 цветов в формате `"r, g, b"` |
| Скорость следования за курсором | `smoothMouse` лерп | `0.012` |
| Свечение под курсором | `createRadialGradient` | радиус `400` |
| Частота цветных волн | `nextWaveTime` | каждые `4000–8000` мс |
| Длительность волны | `activeWave.duration` | `7500` мс |
