import { createEffect, createSignal, JSX, onMount, splitProps } from "solid-js"
import { style, className } from "solid-js/web";

export function useRef() {
    return {
        *[Symbol.iterator]() {
            while (1) {
                const [els, setEls] = createSignal([] as HTMLElement[]);
                yield {
                    ref(el: HTMLElement) {
                        setEls(els => els.concat(el));
                    },
                    get children() {
                        return els();
                    }
                }
            }
        }
    }
}

export function CSS(props: any): any {
    return <>{props.children}</>
}

export function Style<T extends HTMLElement>(props: { children: T[] } & Exclude<JSX.HTMLAttributes<T>["style"], string>): any {
    // @ts-ignore
    const [main, rest] = splitProps(props, ["children","ref"])
    createEffect(() => // @ts-ignore
        main.children?.forEach(element => style(element, rest))
    )
}
export function Class(props: { class: string }): any {
    // @ts-ignore
    const [main, rest] = splitProps(props, ["children","ref"])
    createEffect(() => // @ts-ignore
        main.children?.forEach(element => className(element, rest.class))
    )
}
export function Tw(props: { class: string }): any {
    return <span ref={el => onMount(() => {
        // @ts-ignore
        className(el.nextElementSibling, `${el.className} ${el.nextElementSibling?.className||""} ${props.class}`)
        el.remove()
    })} />
}