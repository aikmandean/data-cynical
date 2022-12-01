import { createEffect, createSignal, JSX, splitProps } from "solid-js"
import { style } from "solid-js/web";

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

export function Style<T extends HTMLElement>(props: { children: T[] } & Exclude<JSX.HTMLAttributes<T>["style"], string>): any {
    // @ts-ignore
    const [main, rest] = splitProps(props, ["children","ref"])
    createEffect(() => // @ts-ignore
        main.children?.forEach(element => style(element, rest))
    )
}