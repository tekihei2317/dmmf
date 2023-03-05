import { ReadonlyArrayMinLength } from 'ts-array-length';

export type NonEmptyArray<T> = ReadonlyArrayMinLength<T, 1>;

export type Brand<T, K> = T & { __brand: K };
