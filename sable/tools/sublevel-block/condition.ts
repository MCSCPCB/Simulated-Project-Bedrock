export type ConditionNode =
  | { readonly type: "literal"; readonly value: boolean | number | string }
  | { readonly type: "state"; readonly name: string }
  | { readonly type: "not"; readonly operand: ConditionNode }
  | {
    readonly type: "binary";
    readonly operator: "&&" | "||" | "==" | "!=" | "<" | "<=" | ">" | ">=";
    readonly left: ConditionNode;
    readonly right: ConditionNode;
  };

type BinaryOperator = Extract<ConditionNode, { readonly type: "binary" }>["operator"];

type Token =
  | { readonly kind: "literal"; readonly value: boolean | number | string }
  | { readonly kind: "state"; readonly value: string }
  | { readonly kind: "operator"; readonly value: string }
  | { readonly kind: "paren"; readonly value: "(" | ")" }
  | { readonly kind: "eof" };

export function parseCondition(source: string, declaredStates: readonly string[]): ConditionNode {
  if (typeof source !== "string" || source.trim().length === 0) {
    throw new Error("Condition must be a non-empty string.");
  }
  const tokens = tokenize(source);
  const parser = new Parser(tokens, new Set(declaredStates));
  const result = parser.parseOr();
  parser.expectEof();
  return result;
}

function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;
  while (index < source.length) {
    const character = source[index]!;
    if (/\s/.test(character)) {
      index++;
      continue;
    }
    if (source.startsWith("q.block_state", index)) {
      index += "q.block_state".length;
      while (/\s/.test(source[index] ?? "")) index++;
      if (source[index] !== "(") throw new Error("q.block_state must be called with a state name.");
      index++;
      while (/\s/.test(source[index] ?? "")) index++;
      const quote = source[index];
      if (quote !== "'" && quote !== '"') throw new Error("State names must be quoted.");
      index++;
      const start = index;
      while (index < source.length && source[index] !== quote) index++;
      if (source[index] !== quote) throw new Error("Unterminated block state name.");
      const name = source.slice(start, index);
      index++;
      while (/\s/.test(source[index] ?? "")) index++;
      if (source[index] !== ")") throw new Error("q.block_state accepts exactly one argument.");
      index++;
      tokens.push({ kind: "state", value: name });
      continue;
    }
    if (character === "'" || character === '"') {
      const quote = character;
      index++;
      const start = index;
      while (index < source.length && source[index] !== quote) index++;
      if (source[index] !== quote) throw new Error("Unterminated string literal.");
      tokens.push({ kind: "literal", value: source.slice(start, index) });
      index++;
      continue;
    }
    if (/[0-9.-]/.test(character)) {
      const match = source.slice(index).match(/^-?(?:\d+(?:\.\d*)?|\.\d+)/);
      if (!match) throw new Error(`Invalid number at offset ${index}.`);
      const value = Number(match[0]);
      if (!Number.isFinite(value)) throw new Error("Condition number is not finite.");
      tokens.push({ kind: "literal", value });
      index += match[0].length;
      continue;
    }
    if (source.startsWith("true", index) && !/[A-Za-z0-9_:]/.test(source[index + 4] ?? "")) {
      tokens.push({ kind: "literal", value: true });
      index += 4;
      continue;
    }
    if (source.startsWith("false", index) && !/[A-Za-z0-9_:]/.test(source[index + 5] ?? "")) {
      tokens.push({ kind: "literal", value: false });
      index += 5;
      continue;
    }
    const operator = ["&&", "||", "==", "!=", "<=", ">=", "<", ">", "!"]
      .find(value => source.startsWith(value, index));
    if (operator) {
      tokens.push({ kind: "operator", value: operator });
      index += operator.length;
      continue;
    }
    if (character === "(" || character === ")") {
      tokens.push({ kind: "paren", value: character });
      index++;
      continue;
    }
    throw new Error(`Unsupported condition token at offset ${index}.`);
  }
  tokens.push({ kind: "eof" });
  return tokens;
}

class Parser {
  #index = 0;
  private readonly tokens: readonly Token[];
  private readonly states: ReadonlySet<string>;

  constructor(tokens: readonly Token[], states: ReadonlySet<string>) {
    this.tokens = tokens;
    this.states = states;
  }

  parseOr(): ConditionNode {
    let left = this.parseAnd();
    while (this.acceptOperator("||")) left = this.binary("||", left, this.parseAnd());
    return left;
  }

  private parseAnd(): ConditionNode {
    let left = this.parseComparison();
    while (this.acceptOperator("&&")) left = this.binary("&&", left, this.parseComparison());
    return left;
  }

  private parseComparison(): ConditionNode {
    let left = this.parseUnary();
    const token = this.peek();
    if (token.kind === "operator" && ["==", "!=", "<", "<=", ">", ">="].includes(token.value)) {
      this.#index++;
      left = this.binary(token.value as BinaryOperator, left, this.parseUnary());
    }
    return left;
  }

  private parseUnary(): ConditionNode {
    if (this.acceptOperator("!")) return { type: "not", operand: this.parseUnary() };
    if (this.acceptParen("(")) {
      const value = this.parseOr();
      if (!this.acceptParen(")")) throw new Error("Missing closing parenthesis in condition.");
      return value;
    }
    const token = this.tokens[this.#index++]!;
    if (token.kind === "literal") return { type: "literal", value: token.value };
    if (token.kind === "state") {
      if (!this.states.has(token.value)) throw new Error(`Condition references undeclared state ${token.value}.`);
      return { type: "state", name: token.value };
    }
    throw new Error("Condition expected a literal, state, negation, or parenthesized expression.");
  }

  private binary(operator: BinaryOperator, left: ConditionNode, right: ConditionNode): ConditionNode {
    return { type: "binary", operator, left, right };
  }

  private acceptOperator(value: string): boolean {
    const token = this.peek();
    if (token.kind !== "operator" || token.value !== value) return false;
    this.#index++;
    return true;
  }

  private acceptParen(value: "(" | ")"): boolean {
    const token = this.peek();
    if (token.kind !== "paren" || token.value !== value) return false;
    this.#index++;
    return true;
  }

  private peek(): Token { return this.tokens[this.#index]!; }
  expectEof(): void {
    if (this.peek().kind !== "eof") throw new Error("Unexpected trailing condition input.");
  }
}
