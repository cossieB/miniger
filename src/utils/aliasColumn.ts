import { AnyColumn } from "drizzle-orm";

export function aliasColumn<T extends AnyColumn> (column: T, alias: string) {
    return column.getSQL().mapWith(column).as(alias);
}