import knex from 'knex';
export interface IOption {
    label: string;
    value: string | number;
}
export interface IRenderer {
    (row: object): string;
}
export interface CustomOptions {
    (db: knex): Promise<IOption[]>;
}
export default class Options {
    private _table;
    private _value;
    private _label;
    private _limit;
    private _renderer;
    private _where;
    private _order;
    label(): string;
    label(label: string[]): Options;
    limit(): number;
    limit(limit: number): Options;
    order(): string;
    order(order: string): Options;
    render(): IRenderer;
    render(fn: IRenderer): Options;
    table(): string;
    table(table: string): Options;
    value(): string;
    value(value: string): Options;
    where(): any;
    where(where: any): Options;
    exec(db: knex): Promise<IOption[]>;
}
