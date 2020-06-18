// flow-typed signature: 3dd5f501994df66e9e6ce163b23bf628
// flow-typed version: c6154227d1/debug_v3.x.x/flow_>=v0.104.x

declare module "debug" {
  declare type Debugger = {
    (...args: Array<mixed>): void,
    (formatter: string, ...args: Array<mixed>): void,
    (err: Error, ...args: Array<mixed>): void,
    enabled: boolean,
    log: () => {...},
    namespace: string,
    ...
  };

  declare module.exports: (namespace: string) => Debugger;

  declare var names: Array<string>;
  declare var skips: Array<string>;
  declare var colors: Array<number>;

  declare function disable(): void;
  declare function enable(namespaces: string): void;
  declare function enabled(name: string): boolean;
  declare function humanize(): void;
  declare function useColors(): boolean;
  declare function log(): void;

  declare var formatters: { [formatter: string]: () => {...}, ... };
}
