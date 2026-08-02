import type { AccessorWithLatest } from "@solidjs/router";

export type KeysWithValuesOfType<T, V> = { [K in keyof T]-?: T[K] extends V ? K : never }[keyof T];

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type Require<T, K extends keyof T> = Omit<T,K> & Required<Pick<T,K>>

export type UnwrapPromise<T> = T extends Promise<infer X> ? X : never

export type OptionalExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>

export type UnwrapAsyncSignal<T> = T extends AccessorWithLatest<infer X> ? X : never